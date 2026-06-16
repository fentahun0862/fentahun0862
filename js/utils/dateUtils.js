/**
 * Date utility functions for the HR system.
 */
const DateUtils = {
  /**
   * Format a date string to a readable format (e.g. "Jun 16, 2026").
   * @param {string|Date} date
   * @returns {string}
   */
  formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  },

  /**
   * Get today's date as YYYY-MM-DD string.
   * @returns {string}
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Calculate the number of business days between two dates (inclusive).
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {number}
   */
  businessDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start > end) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  },

  /**
   * Check if a date string is in the past.
   * @param {string} dateStr - YYYY-MM-DD
   * @returns {boolean}
   */
  isPast(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  },

  /**
   * Calculate age from a birthdate string.
   * @param {string} birthDate - YYYY-MM-DD
   * @returns {number}
   */
  calculateAge(birthDate) {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * Get the difference in days between two dates.
   * @param {string} date1 - YYYY-MM-DD
   * @param {string} date2 - YYYY-MM-DD
   * @returns {number}
   */
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if a year is a leap year.
   * @param {number} year
   * @returns {boolean}
   */
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  /**
   * Get the number of days in a given month.
   * @param {number} year
   * @param {number} month - 1-indexed (1 = January)
   * @returns {number}
   */
  daysInMonth(year, month) {
    if (month < 1 || month > 12) return 0;
    return new Date(year, month, 0).getDate();
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateUtils;
}
