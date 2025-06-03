import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import BaseLayout from '../components/BaseLayout';
import SidebarComp from '../components/SidebarComp';
import NavbarComp from '../components/NavbarComp';
import App from '../App';

// Helper para renderizar componentes con Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  describe('BaseLayout Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have skip links', async () => {
      const { getByText } = renderWithRouter(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      expect(getByText('Saltar al contenido principal')).toBeInTheDocument();
      expect(getByText('Saltar a la navegación')).toBeInTheDocument();
    });

    it('should have proper ARIA labels', async () => {
      const { container } = renderWithRouter(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      const mainContent = container.querySelector('#main-content');
      const sidebarNav = container.querySelector('#sidebar-nav');
      
      expect(mainContent).toHaveAttribute('role', 'main');
      expect(mainContent).toHaveAttribute('aria-label', 'Contenido principal');
      expect(sidebarNav).toBeDefined();
    });
  });

  describe('Sidebar Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<SidebarComp />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure', async () => {
      const { container } = renderWithRouter(<SidebarComp />);
      
      const nav = container.querySelector('nav');
      const list = container.querySelector('ul[role="list"]');
      
      expect(nav).toHaveAttribute('role', 'navigation');
      expect(nav).toHaveAttribute('aria-label');
      expect(list).toHaveAttribute('aria-label', 'Enlaces de navegación');
    });

    it('should have keyboard accessibility', async () => {
      const { container } = renderWithRouter(<SidebarComp />);
      
      const toggleButton = container.querySelector('button[aria-expanded]');
      expect(toggleButton).toHaveAttribute('aria-label');
      expect(toggleButton).toHaveAttribute('aria-expanded');
    });
  });

  describe('Navbar Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<NavbarComp />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', async () => {
      const { container } = renderWithRouter(<NavbarComp />);
      
      // Verificar que hay estructura de headings apropiada
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Full Application', () => {
    it('should not have accessibility violations in main app', async () => {
      const { container } = render(<App />);
      
      const results = await axe(container, {
        rules: {
          // Deshabilitar reglas que pueden generar falsos positivos en testing
          'color-contrast': { enabled: false }, // Los colores pueden no renderizarse correctamente en jsdom
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', async () => {
      const { container } = render(<App />);
      
      // Verificar que existe contenido principal
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      
      // Verificar que existe navegación
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have skip links functionality', async () => {
      const { container, getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      const skipToNav = getByText('Saltar a la navegación');
      
      expect(skipToMain).toHaveAttribute('href', '#main-content');
      expect(skipToNav).toHaveAttribute('href', '#sidebar-nav');
      
      // Verificar que los elementos de destino existen
      const mainContent = container.querySelector('#main-content');
      const sidebarNav = container.querySelector('#sidebar-nav');
      
      expect(mainContent).toBeInTheDocument();
      expect(sidebarNav).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus properly on skip links', async () => {
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      
      // Simular focus en skip link
      skipToMain.focus();
      expect(document.activeElement).toBe(skipToMain);
    });

    it('should have focusable elements in correct tab order', async () => {
      const { container } = render(<App />);
      
      const focusableElements = container.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Verificar que los elementos focusables no tienen tabindex negativo (excepto -1 para programático)
      focusableElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex !== null && tabIndex !== '-1') {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('ARIA Compliance', () => {
    it('should have proper ARIA landmarks', async () => {
      const { container } = render(<App />);
      
      // Verificar landmarks principales
      const main = container.querySelector('[role="main"]');
      const navigation = container.querySelector('[role="navigation"]');
      
      expect(main).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
    });

    it('should have proper ARIA labels and descriptions', async () => {
      const { container } = render(<App />);
      
      // Verificar que elementos interactivos tienen labels apropiados
      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');
      
      buttons.forEach(button => {
        const hasLabel = 
          button.getAttribute('aria-label') || 
          button.getAttribute('aria-labelledby') ||
          button.textContent.trim().length > 0;
        expect(hasLabel).toBeTruthy();
      });

      links.forEach(link => {
        const hasLabel = 
          link.getAttribute('aria-label') || 
          link.getAttribute('aria-labelledby') ||
          link.textContent.trim().length > 0;
        expect(hasLabel).toBeTruthy();
      });
    });
  });
});
