// filepath: /home/matiasgel/desarrollofed/tesis/frontend/src/test/accessibility-simple.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Simple Accessibility Test', () => {
  it('should pass basic accessibility test', async () => {
    const { container } = render(<div>Hello world</div>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should detect accessibility violation', async () => {
    const { container } = render(
      <div>
        <img src="test.jpg" />
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(1);
    expect(results.violations[0].id).toBe('image-alt');
  });
});
