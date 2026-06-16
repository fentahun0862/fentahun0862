/**
 * Input validation utilities for the HR system.
 */
const Validator = {
  /**
   * Validate an email address.
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validate a phone number (digits, spaces, dashes, parens, plus sign; 7-15 digits).
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-()+ ]/g, '');
    return /^\d{7,15}$/.test(cleaned);
  },

  /**
   * Check that a string is non-empty after trimming.
   * @param {string} value
   * @returns {boolean}
   */
  isNonEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  },

  /**
   * Validate that a string has a minimum length.
   * @param {string} value
   * @param {number} min
   * @returns {boolean}
   */
  minLength(value, min) {
    if (typeof value !== 'string') return false;
    return value.trim().length >= min;
  },

  /**
   * Validate that a string does not exceed a maximum length.
   * @param {string} value
   * @param {number} max
   * @returns {boolean}
   */
  maxLength(value, max) {
    if (typeof value !== 'string') return false;
    return value.trim().length <= max;
  },

  /**
   * Validate a salary value (positive number).
   * @param {number|string} salary
   * @returns {boolean}
   */
  isValidSalary(salary) {
    const num = Number(salary);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validate a date string (YYYY-MM-DD format).
   * @param {string} dateStr
   * @returns {boolean}
   */
  isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  },

  /**
   * Validate an employee object has all required fields.
   * @param {Object} employee
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateEmployee(employee) {
    const errors = [];

    if (!employee) {
      return { valid: false, errors: ['Employee data is required'] };
    }

    if (!this.isNonEmpty(employee.firstName)) {
      errors.push('First name is required');
    }
    if (!this.isNonEmpty(employee.lastName)) {
      errors.push('Last name is required');
    }
    if (!this.isValidEmail(employee.email)) {
      errors.push('Valid email is required');
    }
    if (employee.phone && !this.isValidPhone(employee.phone)) {
      errors.push('Invalid phone number');
    }
    if (!this.isNonEmpty(employee.department)) {
      errors.push('Department is required');
    }
    if (!this.isNonEmpty(employee.position)) {
      errors.push('Position is required');
    }
    if (employee.salary !== undefined && !this.isValidSalary(employee.salary)) {
      errors.push('Salary must be a positive number');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate a leave request.
   * @param {Object} leave
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateLeaveRequest(leave) {
    const errors = [];

    if (!leave) {
      return { valid: false, errors: ['Leave request data is required'] };
    }

    if (!this.isNonEmpty(leave.employeeId)) {
      errors.push('Employee ID is required');
    }
    if (!this.isValidDate(leave.startDate)) {
      errors.push('Valid start date is required');
    }
    if (!this.isValidDate(leave.endDate)) {
      errors.push('Valid end date is required');
    }
    if (leave.startDate && leave.endDate && leave.startDate > leave.endDate) {
      errors.push('End date must be after start date');
    }
    if (!this.isNonEmpty(leave.reason)) {
      errors.push('Reason is required');
    }

    return { valid: errors.length === 0, errors };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}
