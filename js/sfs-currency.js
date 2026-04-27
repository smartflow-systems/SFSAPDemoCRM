/**
 * SFS Currency Formatter - British Pounds (£) Only
 * ════════════════════════════════════════════════════════════════
 * Standardizes all currency displays across SmartFlow Systems
 * to use British Pounds (£) instead of dollars ($)
 */

class SFSCurrency {
  constructor() {
    this.symbol = '£';
    this.code = 'GBP';
    this.position = 'before'; // 'before' or 'after'
    this.decimalSeparator = '.';
    this.thousandsSeparator = ',';
    this.decimals = 2;
  }

  /**
   * Format a number as currency
   * @param {number} amount - The amount to format
   * @param {boolean} showDecimals - Whether to show decimal places
   * @returns {string} Formatted currency string
   */
  format(amount, showDecimals = false) {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }

    // Round to specified decimal places
    const rounded = showDecimals
      ? amount.toFixed(this.decimals)
      : Math.round(amount).toString();

    // Add thousands separators
    const parts = rounded.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);

    const formatted = parts.join(this.decimalSeparator);

    // Add currency symbol
    return this.position === 'before'
      ? `${this.symbol}${formatted}`
      : `${formatted}${this.symbol}`;
  }

  /**
   * Format monthly subscription price
   * @param {number} amount - Monthly amount
   * @returns {string} Formatted price like "£29/mo"
   */
  monthly(amount) {
    return `${this.format(amount)}/mo`;
  }

  /**
   * Format yearly subscription price
   * @param {number} amount - Yearly amount
   * @returns {string} Formatted price like "£290/yr"
   */
  yearly(amount) {
    return `${this.format(amount)}/yr`;
  }

  /**
   * Format one-time payment
   * @param {number} amount - Payment amount
   * @returns {string} Formatted price like "£499 one-time"
   */
  oneTime(amount) {
    return `${this.format(amount)} one-time`;
  }

  /**
   * Format "starting from" price
   * @param {number} amount - Starting amount
   * @param {string} period - Optional period (e.g., '/mo', '/yr')
   * @returns {string} Formatted price like "From £29/mo"
   */
  startingFrom(amount, period = '') {
    return `From ${this.format(amount)}${period}`;
  }

  /**
   * Calculate and format savings
   * @param {number} regularPrice - Regular price
   * @param {number} salePrice - Sale price
   * @returns {string} Formatted savings like "Save £58"
   */
  savings(regularPrice, salePrice) {
    const saved = regularPrice - salePrice;
    return `Save ${this.format(saved)}`;
  }

  /**
   * Auto-update all elements with data-price attribute
   * Usage in HTML: <span data-price="29" data-format="monthly"></span>
   */
  updateDOM() {
    const priceElements = document.querySelectorAll('[data-price]');

    priceElements.forEach(element => {
      const amount = parseFloat(element.dataset.price);
      const format = element.dataset.format || 'default';

      let formattedPrice;

      switch (format) {
        case 'monthly':
          formattedPrice = this.monthly(amount);
          break;
        case 'yearly':
          formattedPrice = this.yearly(amount);
          break;
        case 'one-time':
          formattedPrice = this.oneTime(amount);
          break;
        case 'starting-from':
          const period = element.dataset.period || '';
          formattedPrice = this.startingFrom(amount, period);
          break;
        case 'decimals':
          formattedPrice = this.format(amount, true);
          break;
        default:
          formattedPrice = this.format(amount);
      }

      element.textContent = formattedPrice;
    });
  }
}

// Create global instance
const sfsCurrency = new SFSCurrency();

// Auto-update DOM when page loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    sfsCurrency.updateDOM();
  });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SFSCurrency;
}

// Global access
if (typeof window !== 'undefined') {
  window.SFSCurrency = SFSCurrency;
  window.sfsCurrency = sfsCurrency;
}
