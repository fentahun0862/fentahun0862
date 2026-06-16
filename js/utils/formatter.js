/**
 * Data formatting utilities for the HR system.
 */
const Formatter = {
  /**
   * Format a number as currency (USD).
   * @param {number|string} amount
   * @returns {string}
   */
  currency(amount) {
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  /**
   * Format a phone number as (XXX) XXX-XXXX.
   * @param {string} phone
   * @returns {string}
   */
  phoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  /**
   * Capitalize the first letter of a string.
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert a string to title case.
   * @param {string} str
   * @returns {string}
   */
  titleCase(str) {
    if (!str || typeof str !== 'string') return '';
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  },

  /**
   * Truncate a string to a given length with ellipsis.
   * @param {string} str
   * @param {number} maxLen
   * @returns {string}
   */
  truncate(str, maxLen) {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + '...';
  },

  /**
   * Generate a unique ID.
   * @param {string} [prefix='']
   * @returns {string}
   */
  generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  },

  /**
   * Format an employee's full name.
   * @param {Object} employee
   * @returns {string}
   */
  fullName(employee) {
    if (!employee) return '';
    const first = (employee.firstName || '').trim();
    const last = (employee.lastName || '').trim();
    return `${first} ${last}`.trim();
  },

  /**
   * Format a percentage.
   * @param {number} value
   * @param {number} [decimals=1]
   * @returns {string}
   */
  percentage(value, decimals = 1) {
    const num = Number(value);
    if (isNaN(num)) return '0%';
    return `${num.toFixed(decimals)}%`;
  },

  /**
   * Format a number with thousands separators.
   * @param {number|string} num
   * @returns {string}
   */
  numberWithCommas(num) {
    const n = Number(num);
    if (isNaN(n)) return '0';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Formatter;
}
