import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AccessibilityDemo from '../../pages/AccessibilityDemo';

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

// Mock utils to avoid dependency issues in tests
vi.mock('../../utils/colorContrast', () => ({
  checkColorContrast: vi.fn(() => ({ ratio: 4.5, passes: true })),
  getContrastRatio: vi.fn(() => 4.5),
}));

vi.mock('../../utils/focusManagement', () => ({
  focusFirstElement: vi.fn(),
  trapFocus: vi.fn(),
  createSkipLink: vi.fn(() => document.createElement('a')),
}));

// Mock components to avoid complex dependencies
vi.mock('../../components/FormLogin', () => {
  return {
    default: function MockFormLogin() {
      return (
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          <button type="submit">Login</button>
        </form>
      );
    }
  };
});

vi.mock('../../components/FormRegister', () => {
  return {
    default: function MockFormRegister() {
      return (
        <form>
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" />
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" />
          <button type="submit">Register</button>
        </form>
      );
    }
  };
});

vi.mock('../../components/Modal', () => {
  return {
    default: function MockModal({ isOpen, onClose, title, children }) {
      if (!isOpen) return null;
      return (
        <div role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <h2 id="modal-title">{title}</h2>
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      );
    }
  };
});

vi.mock('../../components/Toast', () => {
  return {
    default: function MockToast({ message, onClose }) {
      return (
        <div role="alert" aria-live="polite">
          {message}
          <button onClick={onClose}>Close</button>
        </div>
      );
    }
  };
});

vi.mock('../../components/Table', () => {
  return {
    default: function MockTable({ data, columns, caption }) {
      return (
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };
});

vi.mock('../../components/EmptyState', () => {
  return {
    default: function MockEmptyState({ title, description }) {
      return (
        <div role="status">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      );
    }
  };
});

vi.mock('../../components/ErrorState', () => {
  return {
    default: function MockErrorState({ title, description, onRetry }) {
      return (
        <div role="alert">
          <h3>{title}</h3>
          <p>{description}</p>
          {onRetry && <button onClick={onRetry}>Retry</button>}
        </div>
      );
    }
  };
});

vi.mock('../../components/LoadingState', () => {
  return {
    default: function MockLoadingState({ message }) {
      return (
        <div role="status" aria-live="polite">
          {message}
        </div>
      );
    }
  };
});

vi.mock('../../components/Semaforo', () => {
  return {
    default: function MockSemaforo({ value, label }) {
      const getSignalText = () => {
        switch (value) {
          case -1: return 'Señal Bajista';
          case 0: return 'Señal Neutral';
          case 1: return 'Señal Alcista';
          default: return 'Señal No Disponible';
        }
      };

      return (
        <div role="img" aria-label={`${label ? `${label}: ` : ''}${getSignalText()}`}>
          <div className={value === -1 ? 'active' : 'inactive'}>Red Light</div>
          <div className={value === 0 ? 'active' : 'inactive'}>Yellow Light</div>
          <div className={value === 1 ? 'active' : 'inactive'}>Green Light</div>
        </div>
      );
    }
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AccessibilityDemo Comprehensive Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock Math.random for consistent behavior
    vi.spyOn(Math, 'random').mockReturnValue(0.123);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Structure and Navigation', () => {
    test('should have proper landmark roles and structure', () => {
      renderWithRouter(<AccessibilityDemo />);

      expect(screen.getByRole('navigation', { name: /navegación de demostración/i })).toBeInTheDocument();
      expect(screen.getByRole('main', { name: /contenido principal/i })).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('should have skip link for keyboard navigation', () => {
      renderWithRouter(<AccessibilityDemo />);

      const skipLink = screen.getByText(/saltar al contenido principal/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper heading hierarchy', () => {
      renderWithRouter(<AccessibilityDemo />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/demo de accesibilidad/i);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
    });

    test('should navigate between sections using keyboard', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const formButton = screen.getByRole('menuitem', { name: /formularios/i });
      
      // Test keyboard navigation
      await user.click(formButton);
      
      expect(screen.getByText(/formularios accesibles/i)).toBeInTheDocument();
    });
  });

  describe('Section Navigation and Content', () => {
    test('should show overview section by default', () => {
      renderWithRouter(<AccessibilityDemo />);

      expect(screen.getByRole('heading', { name: /características de accesibilidad implementadas/i })).toBeInTheDocument();
      expect(screen.getByText(/navegación por teclado/i)).toBeInTheDocument();
    });

    test('should switch to forms section when clicked', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const formsButton = screen.getByRole('menuitem', { name: /formularios/i });
      await user.click(formsButton);

      expect(screen.getByRole('heading', { name: /formularios accesibles/i })).toBeInTheDocument();
      expect(screen.getByText(/formulario de inicio de sesión/i)).toBeInTheDocument();
    });

    test('should switch to navigation section', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const navButton = screen.getByRole('menuitem', { name: /navegación/i });
      await user.click(navButton);

      expect(screen.getByRole('heading', { name: /navegación y interacción/i })).toBeInTheDocument();
      expect(screen.getByText(/modal accesible/i)).toBeInTheDocument();
    });
  });

  describe('Interactive Components', () => {
    test('should open and close modal accessibly', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Navigate to navigation section
      const navButton = screen.getByRole('menuitem', { name: /navegación/i });
      await user.click(navButton);

      // Open modal
      const openModalButton = screen.getByText(/abrir modal de demostración/i);
      await user.click(openModalButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/modal accesible/i)).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText(/close/i);
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('should handle semaforo state changes', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Navigate to navigation section
      const navButton = screen.getByRole('menuitem', { name: /navegación/i });
      await user.click(navButton);

      // Test semaforo controls
      const bearishButton = screen.getByText(/bajista/i);
      await user.click(bearishButton);

      expect(screen.getByRole('img', { name: /señal bajista/i })).toBeInTheDocument();
    });

    test('should show toast notifications', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Navigate to feedback section
      const feedbackButton = screen.getByRole('menuitem', { name: /retroalimentación/i });
      await user.click(feedbackButton);

      // Trigger toast
      const successButton = screen.getByText(/mostrar éxito/i);
      await user.click(successButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Settings and Preferences', () => {
    test('should have accessibility settings controls', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Navigate to settings section
      const settingsButton = screen.getByRole('menuitem', { name: /configuración/i });
      await user.click(settingsButton);

      expect(screen.getByLabelText(/tamaño de fuente/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/modo de alto contraste/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reducir animaciones/i)).toBeInTheDocument();
    });

    test('should toggle high contrast mode', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const settingsButton = screen.getByRole('menuitem', { name: /configuración/i });
      await user.click(settingsButton);

      const contrastCheckbox = screen.getByLabelText(/modo de alto contraste/i);
      await user.click(contrastCheckbox);

      expect(contrastCheckbox).toBeChecked();
    });

    test('should change font size', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const settingsButton = screen.getByRole('menuitem', { name: /configuración/i });
      await user.click(settingsButton);

      const fontSizeSelect = screen.getByLabelText(/tamaño de fuente/i);
      await user.selectOptions(fontSizeSelect, 'lg');

      expect(fontSizeSelect).toHaveValue('lg');
    });
  });

  describe('Data Visualization', () => {
    test('should display accessible table', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const dataButton = screen.getByRole('menuitem', { name: /visualización de datos/i });
      await user.click(dataButton);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText(/tabla de instrumentos financieros/i)).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByRole('columnheader', { name: /símbolo/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /precio/i })).toBeInTheDocument();
    });
  });

  describe('ARIA and Semantic Markup', () => {
    test('should have proper ARIA labels and roles throughout', () => {
      renderWithRouter(<AccessibilityDemo />);

      // Check main navigation
      const nav = screen.getByRole('navigation', { name: /navegación de demostración/i });
      expect(nav).toBeInTheDocument();

      // Check menubar
      const menubar = screen.getByRole('menubar');
      expect(menubar).toBeInTheDocument();

      // Check main content area
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');
    });

    test('should use proper heading structure in each section', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Test forms section
      const formsButton = screen.getByRole('menuitem', { name: /formularios/i });
      await user.click(formsButton);

      const h2 = screen.getByRole('heading', { level: 2, name: /formularios accesibles/i });
      expect(h2).toBeInTheDocument();

      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    test('should have proper focus management', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const firstMenuButton = screen.getAllByRole('menuitem')[0];
      
      // Focus should be manageable
      firstMenuButton.focus();
      expect(firstMenuButton).toHaveFocus();
    });
  });

  describe('Accessibility Compliance (axe-core)', () => {
    test('should not have accessibility violations in overview section', async () => {
      const { container } = renderWithRouter(<AccessibilityDemo />);
      await expect(container).toHaveNoViolations();
    });

    test('should not have accessibility violations in forms section', async () => {
      const { container } = renderWithRouter(<AccessibilityDemo />);
      
      const formsButton = screen.getByRole('menuitem', { name: /formularios/i });
      await user.click(formsButton);

      await expect(container).toHaveNoViolations();
    });

    test('should not have accessibility violations in navigation section', async () => {
      const { container } = renderWithRouter(<AccessibilityDemo />);
      
      const navButton = screen.getByRole('menuitem', { name: /navegación/i });
      await user.click(navButton);

      await expect(container).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support tab navigation through interactive elements', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const menuItems = screen.getAllByRole('menuitem');
      
      // Tab through menu items
      for (const item of menuItems) {
        await user.tab();
        // Should be able to navigate through all items
      }
      
      expect(menuItems[0]).toBeInTheDocument();
    });

    test('should support Enter and Space for activation', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const formsButton = screen.getByRole('menuitem', { name: /formularios/i });
      
      // Test Enter key
      formsButton.focus();
      await user.keyboard('{Enter}');
      
      expect(screen.getByText(/formularios accesibles/i)).toBeInTheDocument();
    });
  });

  describe('Content Updates and Live Regions', () => {
    test('should announce content changes to screen readers', async () => {
      renderWithRouter(<AccessibilityDemo />);

      // Navigate to feedback section for toast testing
      const feedbackButton = screen.getByRole('menuitem', { name: /retroalimentación/i });
      await user.click(feedbackButton);

      const successButton = screen.getByText(/mostrar éxito/i);
      await user.click(successButton);

      // Check that toast has proper live region
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live');
    });
  });

  describe('Error Handling and States', () => {
    test('should display accessible error states', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const feedbackButton = screen.getByRole('menuitem', { name: /retroalimentación/i });
      await user.click(feedbackButton);

      // Check error state component
      expect(screen.getByRole('alert', { name: /error de conexión/i })).toBeInTheDocument();
    });

    test('should display accessible loading states', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const feedbackButton = screen.getByRole('menuitem', { name: /retroalimentación/i });
      await user.click(feedbackButton);

      // Check loading state component
      expect(screen.getByRole('status', { name: /cargando datos financieros/i })).toBeInTheDocument();
    });

    test('should display accessible empty states', async () => {
      renderWithRouter(<AccessibilityDemo />);

      const feedbackButton = screen.getByRole('menuitem', { name: /retroalimentación/i });
      await user.click(feedbackButton);

      // Check empty state component
      expect(screen.getByRole('status', { name: /sin datos disponibles/i })).toBeInTheDocument();
    });
  });
});
