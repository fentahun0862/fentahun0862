const DateUtils = require('../js/utils/dateUtils');

describe('DateUtils', () => {
  describe('formatDate', () => {
    test('formats a valid date string', () => {
      expect(DateUtils.formatDate('2026-06-16')).toBe('Jun 16, 2026');
    });

    test('formats a Date object', () => {
      expect(DateUtils.formatDate(new Date(2026, 0, 1))).toBe('Jan 1, 2026');
    });

    test('returns "Invalid Date" for invalid input', () => {
      expect(DateUtils.formatDate('not-a-date')).toBe('Invalid Date');
    });

    test('handles December correctly', () => {
      expect(DateUtils.formatDate('2025-12-25')).toBe('Dec 25, 2025');
    });
  });

  describe('businessDaysBetween', () => {
    test('counts weekdays between two dates', () => {
      // Mon Jun 16 to Fri Jun 20 = 5 business days
      expect(DateUtils.businessDaysBetween('2025-06-16', '2025-06-20')).toBe(5);
    });

    test('returns 0 when start is after end', () => {
      expect(DateUtils.businessDaysBetween('2025-06-20', '2025-06-16')).toBe(0);
    });

    test('returns 0 for invalid dates', () => {
      expect(DateUtils.businessDaysBetween('bad', 'dates')).toBe(0);
    });

    test('counts 1 day for same weekday date', () => {
      // A Monday
      expect(DateUtils.businessDaysBetween('2025-06-16', '2025-06-16')).toBe(1);
    });

    test('returns 0 for a weekend-only range', () => {
      // Sat to Sun
      expect(DateUtils.businessDaysBetween('2025-06-14', '2025-06-15')).toBe(0);
    });
  });

  describe('isPast', () => {
    test('returns true for a past date', () => {
      expect(DateUtils.isPast('2020-01-01')).toBe(true);
    });

    test('returns false for a future date', () => {
      expect(DateUtils.isPast('2099-12-31')).toBe(false);
    });
  });

  describe('calculateAge', () => {
    test('calculates age correctly', () => {
      const birthYear = new Date().getFullYear() - 30;
      const birthDate = `${birthYear}-01-01`;
      const age = DateUtils.calculateAge(birthDate);
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(30);
    });

    test('returns 0 for invalid date', () => {
      expect(DateUtils.calculateAge('invalid')).toBe(0);
    });
  });

  describe('daysBetween', () => {
    test('returns correct number of days', () => {
      expect(DateUtils.daysBetween('2025-06-01', '2025-06-10')).toBe(9);
    });

    test('returns 0 for same date', () => {
      expect(DateUtils.daysBetween('2025-06-01', '2025-06-01')).toBe(0);
    });

    test('order does not matter', () => {
      expect(DateUtils.daysBetween('2025-06-10', '2025-06-01')).toBe(9);
    });

    test('returns 0 for invalid dates', () => {
      expect(DateUtils.daysBetween('bad', 'input')).toBe(0);
    });
  });

  describe('isLeapYear', () => {
    test('2000 is a leap year', () => {
      expect(DateUtils.isLeapYear(2000)).toBe(true);
    });

    test('2024 is a leap year', () => {
      expect(DateUtils.isLeapYear(2024)).toBe(true);
    });

    test('1900 is not a leap year', () => {
      expect(DateUtils.isLeapYear(1900)).toBe(false);
    });

    test('2025 is not a leap year', () => {
      expect(DateUtils.isLeapYear(2025)).toBe(false);
    });
  });

  describe('daysInMonth', () => {
    test('January has 31 days', () => {
      expect(DateUtils.daysInMonth(2025, 1)).toBe(31);
    });

    test('February has 28 days in non-leap year', () => {
      expect(DateUtils.daysInMonth(2025, 2)).toBe(28);
    });

    test('February has 29 days in leap year', () => {
      expect(DateUtils.daysInMonth(2024, 2)).toBe(29);
    });

    test('returns 0 for invalid month', () => {
      expect(DateUtils.daysInMonth(2025, 0)).toBe(0);
      expect(DateUtils.daysInMonth(2025, 13)).toBe(0);
    });
  });
});
