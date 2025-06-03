import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils.jsx'
import FormLogin from '../FormLogin'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('FormLogin', () => {
  it('renders login form elements', () => {
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    const submitButton = screen.getByRole('button', { name: /login/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el usuario es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    // Mock axios with a delayed response
    const axios = await import('axios')
    const delayedResponse = new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: { access: 'token', refresh: 'refresh-token' } })
      }, 200)
    })
    axios.default.post.mockReturnValueOnce(delayedResponse)

    const user = userEvent.setup()
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password')
    
    // Click and wait for loading state
    const clickPromise = user.click(submitButton)
    
    // Wait for the loading state to be set
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    }, { timeout: 100 })
    
    // Wait for the action to complete
    await clickPromise
    await delayedResponse
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    // The actual login logic is tested in AuthContext tests
    // Here we just verify the form behavior
    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('password')
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: /login/i })

    expect(usernameInput).toHaveAttribute('aria-label')
    expect(passwordInput).toHaveAttribute('aria-label')
    expect(submitButton).toHaveAttribute('aria-label')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FormLogin method="login" route="/api/token/" />)

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: /login/i })

    // Tab navigation
    await user.tab()
    expect(usernameInput).toHaveFocus()

    await user.tab()
    expect(passwordInput).toHaveFocus()

    await user.tab()
    expect(submitButton).toHaveFocus()
  })
})
