import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils.jsx'
import ErrorState from '../ErrorState'

describe('ErrorState', () => {
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    mockOnRetry.mockClear()
  })

  it('renders error message and retry button', () => {
    const errorMessage = 'Something went wrong'
    renderWithProviders(
      <ErrorState message={errorMessage} onRetry={mockOnRetry} />
    )
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText('Intentar nuevamente')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    renderWithProviders(
      <ErrorState message="Error" onRetry={mockOnRetry} />
    )
    
    const retryButton = screen.getByText('Intentar nuevamente')
    fireEvent.click(retryButton)
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('renders without retry button when onRetry is not provided', () => {
    renderWithProviders(<ErrorState message="Error" />)
    
    expect(screen.queryByText('Intentar nuevamente')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(<ErrorState message="Error" onRetry={mockOnRetry} />)
    
    const container = screen.getByRole('alert')
    expect(container).toHaveAttribute('aria-live', 'polite')
  })

  it('applies custom title when provided', () => {
    const customTitle = 'Custom Error Title'
    renderWithProviders(
      <ErrorState title={customTitle} message="Error" />
    )
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })
})
