# Fonts Setup

## Halenoir Font Family

This project is designed to use the **Halenoir Font Family** as the primary typeface. 

### Current Status
- **Inter** is currently being used as a fallback font (loaded from Google Fonts)
- The project is configured to use Halenoir when available

### How to Add Halenoir Font

1. **Purchase the font** from [MyFonts](https://www.myfonts.com/collections/halenoir-font-ckhans-fonts)
   - Recommended: Get the "Halenoir Set" (43 fonts) for $149
   - For basic usage: Get "Halenoir Text Regular" and "Halenoir Text Medium"

2. **Download the font files** (usually .woff2, .woff, .ttf formats)

3. **Add font files to this directory:**
   ```
   src/fonts/
   ├── Halenoir-Text-Regular.woff2
   ├── Halenoir-Text-Medium.woff2
   ├── Halenoir-Display-Regular.woff2
   └── ... (other weights as needed)
   ```

4. **Update src/index.css** to include font-face declarations:
   ```css
   @font-face {
     font-family: 'Halenoir';
     src: url('./fonts/Halenoir-Text-Regular.woff2') format('woff2');
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }
   
   @font-face {
     font-family: 'Halenoir';
     src: url('./fonts/Halenoir-Text-Medium.woff2') format('woff2');
     font-weight: 500;
     font-style: normal;
     font-display: swap;
   }
   ```

### Current Fallback
The system currently uses **Inter** as a high-quality fallback font that provides excellent readability while maintaining the design system's modern aesthetic.

### Design System Integration
- The font configuration is already set up in `tailwind.config.js`
- All components are configured to use the `font-halenoir` or `font-sans` classes
- No additional changes needed once the font files are added 