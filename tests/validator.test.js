const Validator = require('../js/utils/validator');

describe('Validator', () => {
  describe('isValidEmail', () => {
    test('accepts valid emails', () => {
      expect(Validator.isValidEmail('test@example.com')).toBe(true);
      expect(Validator.isValidEmail('user.name@domain.co')).toBe(true);
    });

    test('rejects invalid emails', () => {
      expect(Validator.isValidEmail('')).toBe(false);
      expect(Validator.isValidEmail('not-an-email')).toBe(false);
      expect(Validator.isValidEmail('@domain.com')).toBe(false);
      expect(Validator.isValidEmail('user@')).toBe(false);
      expect(Validator.isValidEmail(null)).toBe(false);
      expect(Validator.isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('accepts valid phone numbers', () => {
      expect(Validator.isValidPhone('1234567890')).toBe(true);
      expect(Validator.isValidPhone('(123) 456-7890')).toBe(true);
      expect(Validator.isValidPhone('+1 555-555-5555')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(Validator.isValidPhone('')).toBe(false);
      expect(Validator.isValidPhone('123')).toBe(false);
      expect(Validator.isValidPhone(null)).toBe(false);
      expect(Validator.isValidPhone('abc')).toBe(false);
    });
  });

  describe('isNonEmpty', () => {
    test('returns true for non-empty strings', () => {
      expect(Validator.isNonEmpty('hello')).toBe(true);
      expect(Validator.isNonEmpty(' x ')).toBe(true);
    });

    test('returns false for empty or whitespace', () => {
      expect(Validator.isNonEmpty('')).toBe(false);
      expect(Validator.isNonEmpty('   ')).toBe(false);
      expect(Validator.isNonEmpty(null)).toBe(false);
      expect(Validator.isNonEmpty(undefined)).toBe(false);
      expect(Validator.isNonEmpty(123)).toBe(false);
    });
  });

  describe('minLength', () => {
    test('validates minimum length', () => {
      expect(Validator.minLength('hello', 3)).toBe(true);
      expect(Validator.minLength('hi', 3)).toBe(false);
      expect(Validator.minLength('', 1)).toBe(false);
    });

    test('rejects non-strings', () => {
      expect(Validator.minLength(null, 1)).toBe(false);
      expect(Validator.minLength(123, 1)).toBe(false);
    });
  });

  describe('maxLength', () => {
    test('validates maximum length', () => {
      expect(Validator.maxLength('hi', 5)).toBe(true);
      expect(Validator.maxLength('hello world', 5)).toBe(false);
    });

    test('rejects non-strings', () => {
      expect(Validator.maxLength(null, 5)).toBe(false);
    });
  });

  describe('isValidSalary', () => {
    test('accepts positive numbers', () => {
      expect(Validator.isValidSalary(50000)).toBe(true);
      expect(Validator.isValidSalary('75000')).toBe(true);
      expect(Validator.isValidSalary(0.01)).toBe(true);
    });

    test('rejects non-positive values', () => {
      expect(Validator.isValidSalary(0)).toBe(false);
      expect(Validator.isValidSalary(-100)).toBe(false);
      expect(Validator.isValidSalary('abc')).toBe(false);
      expect(Validator.isValidSalary(NaN)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    test('accepts valid YYYY-MM-DD format', () => {
      expect(Validator.isValidDate('2025-06-16')).toBe(true);
      expect(Validator.isValidDate('2000-01-01')).toBe(true);
    });

    test('rejects invalid formats', () => {
      expect(Validator.isValidDate('06/16/2025')).toBe(false);
      expect(Validator.isValidDate('2025-6-16')).toBe(false);
      expect(Validator.isValidDate('')).toBe(false);
      expect(Validator.isValidDate(null)).toBe(false);
    });
  });

  describe('validateEmployee', () => {
    const validEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
      position: 'Developer',
    };

    test('accepts a valid employee', () => {
      const result = Validator.validateEmployee(validEmployee);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects null input', () => {
      const result = Validator.validateEmployee(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Employee data is required');
    });

    test('requires first name', () => {
      const result = Validator.validateEmployee({ ...validEmployee, firstName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('First name is required');
    });

    test('requires valid email', () => {
      const result = Validator.validateEmployee({ ...validEmployee, email: 'bad' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Valid email is required');
    });

    test('validates optional phone', () => {
      const result = Validator.validateEmployee({ ...validEmployee, phone: '123' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid phone number');
    });

    test('validates optional salary', () => {
      const result = Validator.validateEmployee({ ...validEmployee, salary: -100 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Salary must be a positive number');
    });

    test('accepts employee without optional fields', () => {
      const result = Validator.validateEmployee(validEmployee);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateLeaveRequest', () => {
    const validLeave = {
      employeeId: 'emp-123',
      startDate: '2025-07-01',
      endDate: '2025-07-05',
      reason: 'Vacation',
    };

    test('accepts a valid leave request', () => {
      const result = Validator.validateLeaveRequest(validLeave);
      expect(result.valid).toBe(true);
    });

    test('rejects null input', () => {
      const result = Validator.validateLeaveRequest(null);
      expect(result.valid).toBe(false);
    });

    test('requires employee ID', () => {
      const result = Validator.validateLeaveRequest({ ...validLeave, employeeId: '' });
      expect(result.valid).toBe(false);
    });

    test('requires valid dates', () => {
      const result = Validator.validateLeaveRequest({ ...validLeave, startDate: 'bad' });
      expect(result.valid).toBe(false);
    });

    test('end date must be after start date', () => {
      const result = Validator.validateLeaveRequest({
        ...validLeave,
        startDate: '2025-07-10',
        endDate: '2025-07-05',
      });
      expect(result.valid).toBe(false);
    });

    test('requires a reason', () => {
      const result = Validator.validateLeaveRequest({ ...validLeave, reason: '' });
      expect(result.valid).toBe(false);
    });
  });
});
