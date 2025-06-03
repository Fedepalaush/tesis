import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils.jsx'
import EmptyState from '../EmptyState'

describe('EmptyState', () => {
  const mockOnAction = vi.fn()

  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders empty state with default message', () => {
    renderWithProviders(<EmptyState />)
    
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron elementos para mostrar.')).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    const customTitle = 'No tickets found'
    const customDescription = 'Try adjusting your filters'
    
    renderWithProviders(
      <EmptyState title={customTitle} description={customDescription} />
    )
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
    expect(screen.getByText(customDescription)).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const actionText = 'Add New Item'
    
    renderWithProviders(
      <EmptyState actionText={actionText} onAction={mockOnAction} />
    )
    
    expect(screen.getByText(actionText)).toBeInTheDocument()
  })

  it('calls onAction when action button is clicked', () => {
    renderWithProviders(
      <EmptyState actionText="Add Item" onAction={mockOnAction} />
    )
    
    const actionButton = screen.getByText('Add Item')
    fireEvent.click(actionButton)
    
    expect(mockOnAction).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when onAction is not provided', () => {
    renderWithProviders(<EmptyState actionText="Add Item" />)
    
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>
    
    renderWithProviders(<EmptyState icon={CustomIcon} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
