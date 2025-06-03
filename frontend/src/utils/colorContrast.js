/**
 * Color Contrast Utility for Accessibility Compliance
 * 
 * This utility helps ensure color combinations meet WCAG 2.1 guidelines:
 * - AA: 4.5:1 for normal text, 3:1 for large text
 * - AAA: 7:1 for normal text, 4.5:1 for large text
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (e.g., "#FF0000")
 * @returns {object} RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get relative luminance of a color
 * @param {object} rgb - RGB color object
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG guidelines
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {object} Compliance results
 */
export function checkColorCompliance(foreground, background, isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);
  
  const normalAA = ratio >= 4.5;
  const normalAAA = ratio >= 7;
  const largeAA = ratio >= 3;
  const largeAAA = ratio >= 4.5;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: isLargeText ? largeAA : normalAA,
    passAAA: isLargeText ? largeAAA : normalAAA,
    level: (() => {
      if (isLargeText) {
        if (largeAAA) return 'AAA';
        if (largeAA) return 'AA';
        return 'Fail';
      } else {
        if (normalAAA) return 'AAA';
        if (normalAA) return 'AA';
        return 'Fail';
      }
    })()
  };
}

/**
 * Common color combinations used in the app
 */
export const APP_COLOR_COMBINATIONS = {
  // Primary combinations
  primaryOnWhite: {
    foreground: '#4F46E5', // indigo-600
    background: '#FFFFFF', // white
    usage: 'Primary buttons, links on light backgrounds'
  },
  
  whiteOnPrimary: {
    foreground: '#FFFFFF', // white
    background: '#4F46E5', // indigo-600
    usage: 'Text on primary buttons'
  },
  
  // Dark theme combinations
  whiteOnDark: {
    foreground: '#FFFFFF', // white
    background: '#1F2937', // gray-800
    usage: 'Text on dark backgrounds'
  },
  
  grayOnDark: {
    foreground: '#9CA3AF', // gray-400
    background: '#1F2937', // gray-800
    usage: 'Secondary text on dark backgrounds'
  },
  
  // Form combinations
  textOnFormBg: {
    foreground: '#FFFFFF', // white
    background: '#374151', // gray-700
    usage: 'Form inputs on dark theme'
  },
  
  placeholderOnFormBg: {
    foreground: '#9CA3AF', // gray-400
    background: '#374151', // gray-700
    usage: 'Placeholder text in forms'
  },
  
  // Error/Success combinations
  errorOnLight: {
    foreground: '#DC2626', // red-600
    background: '#FFFFFF', // white
    usage: 'Error text on light backgrounds'
  },
  
  successOnLight: {
    foreground: '#059669', // green-600
    background: '#FFFFFF', // white
    usage: 'Success text on light backgrounds'
  },
  
  // Sidebar combinations
  sidebarText: {
    foreground: '#6B7280', // gray-500
    background: '#FFFFFF', // white
    usage: 'Sidebar navigation text'
  },
  
  sidebarActiveText: {
    foreground: '#1E40AF', // blue-800
    background: '#DBEAFE', // blue-100
    usage: 'Active sidebar item'
  }
};

/**
 * Check all app color combinations for compliance
 * @returns {object} Results for all combinations
 */
export function checkAppColorCompliance() {
  const results = {};
  
  Object.entries(APP_COLOR_COMBINATIONS).forEach(([key, combo]) => {
    results[key] = {
      ...combo,
      compliance: checkColorCompliance(combo.foreground, combo.background, false),
      largeTextCompliance: checkColorCompliance(combo.foreground, combo.background, true)
    };
  });
  
  return results;
}

/**
 * Get accessibility-compliant color suggestions
 * @param {string} baseColor - Base color to work with
 * @param {string} backgroundColor - Background color
 * @returns {array} Array of compliant colors
 */
export function getAccessibleColorSuggestions(baseColor, backgroundColor) {
  // This would contain logic to generate accessible color variations
  // For now, return common accessible combinations
  const suggestions = [
    '#000000', // Black - usually very accessible
    '#FFFFFF', // White - accessible on dark backgrounds
    '#1F2937', // Dark gray
    '#374151', // Medium gray
    '#4F46E5', // Indigo
    '#059669', // Green
    '#DC2626', // Red
  ];
  
  return suggestions
    .map(color => ({
      color,
      compliance: checkColorCompliance(color, backgroundColor)
    }))
    .filter(item => item.compliance.passAA)
    .sort((a, b) => b.compliance.ratio - a.compliance.ratio);
}

export default {
  getContrastRatio,
  checkColorCompliance,
  checkAppColorCompliance,
  getAccessibleColorSuggestions,
  APP_COLOR_COMBINATIONS
};
