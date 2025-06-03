import { render } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ConfigProvider } from '../contexts/ConfigContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { TickersProvider } from '../TickersContext'

// Mock providers for testing
const MockProviders = ({ children }) => {
  return (
    <ConfigProvider>
      <NotificationProvider>
        <AuthProvider>
          <TickersProvider>
            {children}
          </TickersProvider>
        </AuthProvider>
      </NotificationProvider>
    </ConfigProvider>
  )
}

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => <MockProviders>{children}</MockProviders>
  
  return render(ui, {
    wrapper: Wrapper,
    ...options,
  })
}

// Mock user for authenticated tests
export const mockAuthenticatedUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
}

// Mock API responses
export const mockApiResponses = {
  login: {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    user: mockAuthenticatedUser,
  },
  tickers: [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.' },
    { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.' },
  ],
}
