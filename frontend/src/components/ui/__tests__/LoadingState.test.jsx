import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils.jsx'
import LoadingState from '../LoadingState'

describe('LoadingState', () => {
  it('renders loading spinner with default message', () => {
    renderWithProviders(<LoadingState />)
    
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('renders custom loading message', () => {
    const customMessage = 'Cargando información...'
    renderWithProviders(<LoadingState message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('has spinner with proper classes', () => {
    renderWithProviders(<LoadingState />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-500')
  })

  it('has proper message styling', () => {
    renderWithProviders(<LoadingState />)
    
    const message = screen.getByText('Cargando datos...')
    expect(message).toHaveClass('text-xl', 'text-white', 'animate-pulse')
  })
})
