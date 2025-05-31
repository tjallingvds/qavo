import { WebsiteColors, WebviewElement } from '../types/browser';

export const isColorDark = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness < 128;
};

export const extractWebsiteColors = async (webview: WebviewElement): Promise<WebsiteColors> => {
  try {
    const script = `
      (function() {
        const getComputedStyleValue = (element, property) => {
          return window.getComputedStyle(element).getPropertyValue(property);
        };
        
        const rgbToHex = (rgb) => {
          const match = rgb.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
          if (!match) return rgb;
          const [, r, g, b] = match;
          return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        };
        
        const body = document.body;
        const html = document.documentElement;
        
        let backgroundColor = getComputedStyleValue(body, 'background-color');
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          backgroundColor = getComputedStyleValue(html, 'background-color');
        }
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          backgroundColor = '#ffffff';
        } else if (backgroundColor.startsWith('rgb')) {
          backgroundColor = rgbToHex(backgroundColor);
        }
        
        let textColor = getComputedStyleValue(body, 'color');
        if (textColor.startsWith('rgb')) {
          textColor = rgbToHex(textColor);
        }
        
        // Try to find primary color from theme-color meta tag or prominent colors
        let primaryColor = backgroundColor;
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          primaryColor = themeColorMeta.getAttribute('content') || primaryColor;
        }
        
        // Get accent color (fallback to a computed accent)
        let accentColor = '#3b82f6'; // Default blue
        const links = document.querySelectorAll('a');
        if (links.length > 0) {
          const firstLink = links[0];
          const linkColor = getComputedStyleValue(firstLink, 'color');
          if (linkColor && linkColor !== textColor) {
            accentColor = linkColor.startsWith('rgb') ? rgbToHex(linkColor) : linkColor;
          }
        }
        
        return {
          primary: primaryColor,
          text: textColor,
          background: backgroundColor,
          accent: accentColor
        };
      })();
    `;

    const colors = await webview.executeJavaScript(script);
    return {
      ...colors,
      isDark: isColorDark(colors.background)
    };
  } catch (error) {
    console.error('Error extracting colors:', error);
    return {
      primary: '#ffffff',
      text: '#000000',
      background: '#ffffff',
      accent: '#3b82f6',
      isDark: false
    };
  }
}; 