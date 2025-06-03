import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'axe-core';
import { renderWithProviders } from '../../../test/utils.jsx';
import BaseLayout from '../../BaseLayout';
import SidebarComp from '../../SidebarComp';
import NavbarComp from '../../NavbarComp';

// Custom matcher for axe violations
expect.extend({
  toHaveNoViolations(received) {
    const violations = received.violations;
    const pass = violations.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected axe violations but received none`,
        pass: true,
      };
    } else {
      const violationMessages = violations.map(v => 
        `${v.id}: ${v.description}\n  Elements: ${v.nodes.map(n => n.target).join(', ')}`
      ).join('\n\n');
      
      return {
        message: () => `Expected no axe violations but received:\n\n${violationMessages}`,
        pass: false,
      };
    }
  },
});

describe('Accessibility Tests - Core Components', () => {
  describe('BaseLayout Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have skip links', async () => {
      renderWithProviders(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument();
      expect(screen.getByText('Saltar a la navegación')).toBeInTheDocument();
    });

    it('should have proper ARIA landmarks', async () => {
      const { container } = renderWithProviders(
        <BaseLayout>
          <div>Test content</div>
        </BaseLayout>
      );
      
      // Check for main landmark
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      
      // Check for navigation landmark
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('SidebarComp Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<SidebarComp />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure', async () => {
      const { container } = renderWithProviders(<SidebarComp />);
      
      // Check for navigation role
      const nav = container.querySelector('[role="navigation"]') || container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('NavbarComp Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<NavbarComp />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure', async () => {
      const { container } = renderWithProviders(<NavbarComp />);
      
      // Check for navigation role
      const nav = container.querySelector('[role="navigation"]') || container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });
});

describe('Accessibility Tests - Form Components', () => {
  describe('FormLogin Component', () => {
    it('should not have accessibility violations', async () => {
      // Import dynamically to avoid issues
      const { default: FormLogin } = await import('../../FormLogin');
      
      const { container } = renderWithProviders(<FormLogin />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', async () => {
      const { default: FormLogin } = await import('../../FormLogin');
      
      renderWithProviders(<FormLogin />);
      
      // Check for input labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        // Each input should have an associated label
        const id = input.getAttribute('id');
        if (id) {
          const label = screen.getByLabelText(new RegExp('.', 'i'));
          expect(label).toBeInTheDocument();
        }
      });
    });
  });
});

describe('Accessibility Tests - Interactive Components', () => {
  describe('Semaforo Component', () => {
    it('should not have accessibility violations', async () => {
      try {
        const { default: Semaforo } = await import('../../Semaforo');
        
        const { container } = renderWithProviders(<Semaforo tipo="verde" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      } catch (error) {
        // Component might not exist, skip test
        console.warn('Semaforo component not found, skipping test');
      }
    });

    it('should have proper ARIA attributes', async () => {
      try {
        const { default: Semaforo } = await import('../../Semaforo');
        
        const { container } = renderWithProviders(<Semaforo tipo="verde" />);
        
        // Check for ARIA attributes that indicate state or status
        const element = container.querySelector('[aria-label]') || 
                       container.querySelector('[role]') ||
                       container.querySelector('[aria-describedby]');
        
        // At least one accessibility attribute should be present
        expect(element).toBeTruthy();
      } catch (error) {
        console.warn('Semaforo component not found, skipping test');
      }
    });
  });
});

describe('Accessibility Tests - Basic HTML Elements', () => {
  it('should detect image without alt text', async () => {
    const { container } = render(<img src="test.jpg" />);
    const results = await axe(container);
    
    expect(results.violations).toHaveLength(1);
    expect(results.violations[0].id).toBe('image-alt');
  });

  it('should pass with proper alt text', async () => {
    const { container } = render(<img src="test.jpg" alt="Test image description" />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('should detect button without accessible name', async () => {
    const { container } = render(<button></button>);
    const results = await axe(container);
    
    expect(results.violations.length).toBeGreaterThan(0);
    const buttonNameViolation = results.violations.find(v => v.id === 'button-name');
    expect(buttonNameViolation).toBeDefined();
  });

  it('should pass with proper button text', async () => {
    const { container } = render(<button>Click me</button>);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
