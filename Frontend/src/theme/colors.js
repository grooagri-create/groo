/**
 * Centralized Theme Colors Configuration
 * Separate themes for User and Vendor modules
 * Update colors here to change theme across entire app
 * 
 * Usage:
 * - User module: import { userTheme } from '../../../../theme'
 * - Vendor module: import { vendorTheme } from '../../../../theme'
 * - Worker module: import { workerTheme } from '../../../../theme'
 */

const brand = {
  teal: '#5A8231', // Primary Green (Keeping 'teal' name for backward compatibility)
  yellow: '#DDA649', // Mustard Yellow
  orange: '#9E5A35', // Brown/Terracotta
  gradient: 'linear-gradient(135deg, #5A8231 0%, #DDA649 50%, #9E5A35 100%)',
  conic: 'conic-gradient(from 0deg, #5A8231, #DDA649, #9E5A35, #5A8231)'
};

const userTheme = {
  backgroundGradient: 'linear-gradient(180deg, #e8f3e2 0%, #f4f8f0 15%, #FFFFFF 30%)',
  gradient: brand.gradient,
  headerGradient: 'linear-gradient(135deg, #e8f3e2 0%, #e8f3e2 100%)',
  headerBg: '#e8f3e2',
  button: brand.orange,
  icon: brand.orange,
  cardShadow: '0 8px 16px -2px rgba(90, 130, 49, 0.15), 0 4px 8px -1px rgba(90, 130, 49, 0.1)',
  cardBorder: '1px solid rgba(90, 130, 49, 0.15)',
  brand: brand
};

// Vendor Theme Colors
const vendorTheme = {
  backgroundGradient: 'linear-gradient(to bottom, rgba(52, 121, 137, 0.03) 0%, rgba(187, 95, 54, 0.02) 10%, #ffffff 20%)',
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  icon: brand.teal,
  brand: brand
};

// Worker Theme Colors
const workerTheme = {
  backgroundGradient: 'linear-gradient(to bottom, rgba(52, 121, 137, 0.03) 0%, rgba(187, 95, 54, 0.02) 10%, #ffffff 20%)',
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  icon: brand.teal,
  brand: brand
};

// Default theme (for backward compatibility)
const themeColors = userTheme;

// Export all themes
export { userTheme, vendorTheme, workerTheme, brand };
export default themeColors;


