import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { vi } from 'vitest';
import Semaforo from '../Semaforo';

// Custom axe matcher for Vitest
expect.extend({
  async toHaveNoViolations(received) {
    const results = await axe.run(received);
    const pass = results.violations.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected element to have accessibility violations, but none were found.`,
        pass: true,
      };
    } else {
      const violationMessages = results.violations.map(violation => 
        `${violation.id}: ${violation.description}`
      ).join('\n');
      
      return {
        message: () => `Expected element to have no accessibility violations, but found:\n${violationMessages}`,
        pass: false,
      };
    }
  },
});

describe('Semaforo Accessibility Tests', () => {
  beforeAll(() => {
    // Mock Math.random for consistent IDs in tests
    vi.spyOn(Math, 'random').mockReturnValue(0.123);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('ARIA and Semantic Structure', () => {
    test('should have proper role and aria-label for container', () => {
      render(<Semaforo value={1} label="Test Signal" />);
      
      const container = screen.getByRole('img', { name: /test signal.*señal alcista/i });
      expect(container).toBeInTheDocument();
    });

    test('should have aria-describedby pointing to description', () => {
      render(<Semaforo value={-1} label="Bearish Signal" />);
      
      // Get the main container specifically by looking for the one with the aria-describedby attribute
      const container = screen.getByRole('img', { name: /bearish signal.*señal bajista/i });
      expect(container).toHaveAttribute('aria-describedby');
      
      const describedById = container.getAttribute('aria-describedby');
      const description = document.getElementById(describedById);
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(/indicador en rojo.*tendencia descendente/i);
    });

    test('should have proper group role for lights', () => {
      render(<Semaforo value={0} />);
      
      const lightsGroup = screen.getByRole('group', { name: /indicadores de señal/i });
      expect(lightsGroup).toBeInTheDocument();
    });

    test('should have individual light elements with proper aria-labels', () => {
      render(<Semaforo value={1} />);
      
      // Check each light has proper aria-label
      expect(screen.getByLabelText(/luz roja.*inactiva/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/luz amarilla.*inactiva/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/luz verde.*activa/i)).toBeInTheDocument();
    });
  });

  describe('Live Region Updates', () => {
    test('should have live region for dynamic updates', () => {
      render(<Semaforo value={1} />);
      
      const liveRegion = screen.getByText(/estado actual.*señal alcista/i);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('should update live region when value changes', () => {
      const { rerender } = render(<Semaforo value={1} />);
      
      expect(screen.getByText(/estado actual.*señal alcista/i)).toBeInTheDocument();
      
      rerender(<Semaforo value={-1} />);
      expect(screen.getByText(/estado actual.*señal bajista/i)).toBeInTheDocument();
    });
  });

  describe('Screen Reader Only Content', () => {
    test('should have screen reader only description', () => {
      render(<Semaforo value={0} />);
      
      const srDescription = document.querySelector('.sr-only');
      expect(srDescription).toBeInTheDocument();
      expect(srDescription).toHaveTextContent(/indicador en amarillo.*tendencia neutral/i);
    });

    test('should hide label from screen readers when expanded is false', () => {
      render(<Semaforo value={1} label="Test Label" />);
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Signal States', () => {
    test('should correctly indicate bearish signal (value -1)', () => {
      render(<Semaforo value={-1} label="Bearish Test" />);
      
      expect(screen.getByRole('img', { name: /bearish test.*señal bajista/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/luz roja.*activa/i)).toBeInTheDocument();
      expect(screen.getByText(/estado actual.*señal bajista/i)).toBeInTheDocument();
    });

    test('should correctly indicate neutral signal (value 0)', () => {
      render(<Semaforo value={0} label="Neutral Test" />);
      
      expect(screen.getByRole('img', { name: /neutral test.*señal neutral/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/luz amarilla.*activa/i)).toBeInTheDocument();
      expect(screen.getByText(/estado actual.*señal neutral/i)).toBeInTheDocument();
    });

    test('should correctly indicate bullish signal (value 1)', () => {
      render(<Semaforo value={1} label="Bullish Test" />);
      
      expect(screen.getByRole('img', { name: /bullish test.*señal alcista/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/luz verde.*activa/i)).toBeInTheDocument();
      expect(screen.getByText(/estado actual.*señal alcista/i)).toBeInTheDocument();
    });

    test('should handle undefined/invalid values gracefully', () => {
      render(<Semaforo value={999} />);
      
      expect(screen.getByText(/señal no disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/estado del indicador no determinado/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    test('should not have any accessibility violations (axe)', async () => {
      const { container } = render(<Semaforo value={1} label="Accessibility Test" />);
      await expect(container).toHaveNoViolations();
    });

    test('should be keyboard accessible (no interactive elements)', () => {
      render(<Semaforo value={1} />);
      
      // Semaforo is a display component, should not have focusable elements
      const focusableElements = screen.queryAllByRole('button');
      expect(focusableElements).toHaveLength(0);
    });

    test('should have proper color contrast indicators', () => {
      const { container } = render(<Semaforo value={1} />);
      
      // Check that active light has the active class
      const greenLight = container.querySelector('.green.active');
      expect(greenLight).toBeInTheDocument();
      
      // Check that inactive lights have inactive class
      const inactiveLights = container.querySelectorAll('.inactive');
      expect(inactiveLights).toHaveLength(2);
    });
  });

  describe('Optional Props', () => {
    test('should work without label prop', () => {
      render(<Semaforo value={1} />);
      
      expect(screen.getByRole('img', { name: /señal alcista/i })).toBeInTheDocument();
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });

    test('should display label when provided', () => {
      render(<Semaforo value={1} label="Custom Label" />);
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /custom label.*señal alcista/i })).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('should apply correct CSS classes for active and inactive states', () => {
      const { container } = render(<Semaforo value={0} />);
      
      const redLight = container.querySelector('.red');
      const yellowLight = container.querySelector('.yellow');
      const greenLight = container.querySelector('.green');
      
      expect(redLight).toHaveClass('inactive');
      expect(yellowLight).toHaveClass('active');
      expect(greenLight).toHaveClass('inactive');
      
      expect(redLight).not.toHaveClass('active');
      expect(yellowLight).not.toHaveClass('inactive');
      expect(greenLight).not.toHaveClass('active');
    });

    test('should have required structural CSS classes', () => {
      const { container } = render(<Semaforo value={1} />);
      
      expect(container.querySelector('.semaforo')).toBeInTheDocument();
      expect(container.querySelector('.semaforo-lights')).toBeInTheDocument();
      expect(container.querySelector('.light')).toBeInTheDocument();
    });
  });
});
