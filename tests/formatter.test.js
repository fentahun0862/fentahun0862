const Formatter = require('../js/utils/formatter');

describe('Formatter', () => {
  describe('currency', () => {
    test('formats a number as USD', () => {
      expect(Formatter.currency(50000)).toBe('$50,000.00');
      expect(Formatter.currency(1234.5)).toBe('$1,234.50');
      expect(Formatter.currency(0)).toBe('$0.00');
    });

    test('handles string input', () => {
      expect(Formatter.currency('75000')).toBe('$75,000.00');
    });

    test('returns $0.00 for NaN', () => {
      expect(Formatter.currency('abc')).toBe('$0.00');
    });

    test('formats large numbers', () => {
      expect(Formatter.currency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('phoneNumber', () => {
    test('formats 10-digit phone number', () => {
      expect(Formatter.phoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    test('returns original for non-10-digit', () => {
      expect(Formatter.phoneNumber('12345')).toBe('12345');
    });

    test('returns empty for null/undefined', () => {
      expect(Formatter.phoneNumber(null)).toBe('');
      expect(Formatter.phoneNumber(undefined)).toBe('');
    });
  });

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(Formatter.capitalize('hello')).toBe('Hello');
      expect(Formatter.capitalize('WORLD')).toBe('World');
    });

    test('handles empty or null', () => {
      expect(Formatter.capitalize('')).toBe('');
      expect(Formatter.capitalize(null)).toBe('');
    });

    test('handles single character', () => {
      expect(Formatter.capitalize('a')).toBe('A');
    });
  });

  describe('titleCase', () => {
    test('converts to title case', () => {
      expect(Formatter.titleCase('hello world')).toBe('Hello World');
      expect(Formatter.titleCase('john doe')).toBe('John Doe');
    });

    test('handles empty or null', () => {
      expect(Formatter.titleCase('')).toBe('');
      expect(Formatter.titleCase(null)).toBe('');
    });
  });

  describe('truncate', () => {
    test('truncates long strings', () => {
      expect(Formatter.truncate('Hello, World!', 8)).toBe('Hello...');
    });

    test('returns original if within limit', () => {
      expect(Formatter.truncate('Hi', 10)).toBe('Hi');
    });

    test('handles null/empty', () => {
      expect(Formatter.truncate(null, 10)).toBe('');
      expect(Formatter.truncate('', 10)).toBe('');
    });
  });

  describe('generateId', () => {
    test('generates a string ID', () => {
      const id = Formatter.generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('includes prefix when provided', () => {
      const id = Formatter.generateId('emp');
      expect(id.startsWith('emp-')).toBe(true);
    });

    test('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => Formatter.generateId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('fullName', () => {
    test('combines first and last name', () => {
      expect(Formatter.fullName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe');
    });

    test('handles missing parts', () => {
      expect(Formatter.fullName({ firstName: 'John' })).toBe('John');
      expect(Formatter.fullName({ lastName: 'Doe' })).toBe('Doe');
    });

    test('handles null', () => {
      expect(Formatter.fullName(null)).toBe('');
    });
  });

  describe('percentage', () => {
    test('formats as percentage', () => {
      expect(Formatter.percentage(85.5)).toBe('85.5%');
      expect(Formatter.percentage(100, 0)).toBe('100%');
    });

    test('returns 0% for NaN', () => {
      expect(Formatter.percentage('abc')).toBe('0%');
    });
  });

  describe('numberWithCommas', () => {
    test('adds thousand separators', () => {
      expect(Formatter.numberWithCommas(1000000)).toBe('1,000,000');
      expect(Formatter.numberWithCommas(1234)).toBe('1,234');
    });

    test('handles small numbers', () => {
      expect(Formatter.numberWithCommas(42)).toBe('42');
    });

    test('returns 0 for NaN', () => {
      expect(Formatter.numberWithCommas('abc')).toBe('0');
    });
  });
});
