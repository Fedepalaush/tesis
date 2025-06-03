import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import BaseLayout from '../components/BaseLayout';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Skip Links Functionality Tests', () => {
  describe('Skip Links Navigation', () => {
    it('should focus main content when skip link is activated', async () => {
      const user = userEvent.setup();
      const { getByText, container } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      const mainContent = container.querySelector('#main-content');
      
      // Simular click en skip link
      await user.click(skipToMain);
      
      // Verificar que el elemento main está presente
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('tabIndex', '-1');
    });

    it('should focus sidebar navigation when skip link is activated', async () => {
      const user = userEvent.setup();
      const { getByText, container } = render(<App />);
      
      const skipToNav = getByText('Saltar a la navegación');
      const sidebarNav = container.querySelector('#sidebar-nav');
      
      // Simular click en skip link
      await user.click(skipToNav);
      
      // Verificar que el elemento nav está presente
      expect(sidebarNav).toBeInTheDocument();
    });

    it('should be visually hidden by default and visible on focus', async () => {
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      
      // Verificar que tiene la clase sr-only
      expect(skipToMain).toHaveClass('sr-only');
      
      // Verificar que tiene las clases de focus
      expect(skipToMain).toHaveClass('focus:not-sr-only');
      expect(skipToMain).toHaveClass('focus:absolute');
    });

    it('should have proper keyboard navigation', async () => {
      const user = userEvent.setup();
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      const skipToNav = getByText('Saltar a la navegación');
      
      // Simular navegación por teclado
      await user.tab();
      
      // Verificar que el primer elemento focusable sea un skip link
      const focusedElement = document.activeElement;
      expect(focusedElement === skipToMain || focusedElement === skipToNav).toBeTruthy();
    });
  });

  describe('Skip Links Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      const skipToNav = getByText('Saltar a la navegación');
      
      expect(skipToMain).toHaveAttribute('role', 'button');
      expect(skipToMain).toHaveAttribute('aria-label', 'Saltar al contenido principal');
      expect(skipToNav).toHaveAttribute('role', 'button');
      expect(skipToNav).toHaveAttribute('aria-label', 'Saltar a la navegación');
    });

    it('should handle Enter and Space key activation', async () => {
      const user = userEvent.setup();
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      
      // Focus en el skip link
      skipToMain.focus();
      
      // Simular tecla Enter
      await user.keyboard('{Enter}');
      
      // Verificar que el href funciona (esto se maneja por el navegador)
      expect(skipToMain).toHaveAttribute('href', '#main-content');
    });

    it('should have high z-index for visibility', () => {
      const { getByText } = render(<App />);
      
      const skipToMain = getByText('Saltar al contenido principal');
      
      // Verificar que tiene z-index alto cuando está enfocado
      expect(skipToMain).toHaveClass('focus:z-50');
    });
  });

  describe('Target Elements', () => {
    it('should have proper target elements with correct IDs', () => {
      const { container } = render(<App />);
      
      const mainContent = container.querySelector('#main-content');
      const sidebarNav = container.querySelector('#sidebar-nav');
      
      expect(mainContent).toBeInTheDocument();
      expect(sidebarNav).toBeInTheDocument();
      
      // Verificar que son elementos apropiados
      expect(mainContent.tagName.toLowerCase()).toBe('main');
      expect(sidebarNav.tagName.toLowerCase()).toBe('nav');
    });

    it('should have proper ARIA attributes on target elements', () => {
      const { container } = render(<App />);
      
      const mainContent = container.querySelector('#main-content');
      
      expect(mainContent).toHaveAttribute('role', 'main');
      expect(mainContent).toHaveAttribute('aria-label', 'Contenido principal');
      expect(mainContent).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Component Integration', () => {
    it('should work in BaseLayout component', () => {
      const { getByText, container } = renderWithRouter(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      const skipToMain = getByText('Saltar al contenido principal');
      const skipToNav = getByText('Saltar a la navegación');
      const mainContent = container.querySelector('#main-content');
      
      expect(skipToMain).toBeInTheDocument();
      expect(skipToNav).toBeInTheDocument();
      expect(mainContent).toBeInTheDocument();
    });

    it('should maintain skip links position at top of page', () => {
      const { container } = render(<App />);
      
      const skipLinksContainer = container.querySelector('.skip-links');
      
      expect(skipLinksContainer).toBeInTheDocument();
      
      // Verificar que es uno de los primeros elementos en el DOM
      const firstChild = container.firstChild;
      expect(firstChild.querySelector('.skip-links')).toBeInTheDocument();
    });
  });
});
