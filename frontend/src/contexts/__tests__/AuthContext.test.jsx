import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the api module
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}))

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({ exp: Date.now() / 1000 + 3600 }))
}))

// Mock data for tests
const mockApiResponses = {
  login: {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    id: 1,
    email: 'testuser@example.com'
  }
}

const mockAuthenticatedUser = {
  id: 1,
  username: 'testuser',
  email: 'testuser@example.com'
}

describe('AuthContext', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('provides initial authentication state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Initial state should be loading
    await act(async () => {
      // Allow the useEffect to start
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false) // After checkAuth completes (no token case)
  })

  it('authenticates user successfully', async () => {
    const api = await import('../../api')
    api.default.post.mockResolvedValueOnce({ data: mockApiResponses.login })

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Wait for initial checkAuth to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockAuthenticatedUser)
    expect(localStorage.getItem('access')).toBe(mockApiResponses.login.access)
  })

  it('handles login error', async () => {
    const api = await import('../../api')
    const errorMessage = 'Invalid credentials'
    api.default.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.login('testuser', 'wrongpassword')
      } catch (error) {
        expect(error.message).toBe(errorMessage)
      }
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('logs out user', async () => {
    // First login
    const axios = await import('axios')
    axios.default.post.mockResolvedValueOnce({ data: mockApiResponses.login })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    // Then logout
    await act(async () => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('access')).toBeNull()
  })

  it('checks existing token on mount', async () => {
    // Set up existing token with proper structure for jwt-decode
    const mockToken = 'mock-jwt-token'
    localStorage.setItem('access', mockToken)
    
    // Mock jwt-decode to return user data
    const { jwtDecode } = await import('jwt-decode')
    jwtDecode.mockReturnValue({
      exp: Date.now() / 1000 + 3600, // Not expired
      username: 'testuser'
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ username: 'testuser' })
    expect(result.current.isLoading).toBe(false)
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
