const Storage = require('../js/modules/storage');
const AttendanceModule = require('../js/modules/attendance');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

const validRecord = {
  employeeId: 'emp-1',
  date: '2025-06-16',
  status: 'present',
};

describe('AttendanceModule', () => {
  beforeEach(() => {
    Storage.init(createMockStore());
  });

  describe('record', () => {
    test('records valid attendance', () => {
      const result = AttendanceModule.record(validRecord);
      expect(result.success).toBe(true);
      expect(result.record.status).toBe('present');
      expect(result.record.id).toMatch(/^att-/);
    });

    test('rejects missing employeeId', () => {
      const result = AttendanceModule.record({ date: '2025-06-16', status: 'present' });
      expect(result.success).toBe(false);
    });

    test('rejects missing date', () => {
      const result = AttendanceModule.record({ employeeId: 'emp-1', status: 'present' });
      expect(result.success).toBe(false);
    });

    test('rejects invalid status', () => {
      const result = AttendanceModule.record({ ...validRecord, status: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('prevents duplicate attendance for same employee and date', () => {
      AttendanceModule.record(validRecord);
      const result = AttendanceModule.record(validRecord);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Attendance already recorded for this date');
    });

    test('records with check-in and check-out', () => {
      const result = AttendanceModule.record({
        ...validRecord,
        checkIn: '09:00',
        checkOut: '17:00',
      });
      expect(result.success).toBe(true);
      expect(result.record.checkIn).toBe('09:00');
      expect(result.record.checkOut).toBe('17:00');
    });

    test('accepts all valid statuses', () => {
      const statuses = ['present', 'absent', 'late', 'half-day', 'remote'];
      statuses.forEach((status, i) => {
        const result = AttendanceModule.record({
          employeeId: `emp-${i}`,
          date: '2025-06-16',
          status,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('getByEmployee', () => {
    test('returns records for specific employee', () => {
      AttendanceModule.record(validRecord);
      AttendanceModule.record({ employeeId: 'emp-2', date: '2025-06-16', status: 'absent' });
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-17', status: 'late' });
      expect(AttendanceModule.getByEmployee('emp-1')).toHaveLength(2);
    });
  });

  describe('getByDate', () => {
    test('returns records for specific date', () => {
      AttendanceModule.record(validRecord);
      AttendanceModule.record({ employeeId: 'emp-2', date: '2025-06-16', status: 'absent' });
      AttendanceModule.record({ employeeId: 'emp-3', date: '2025-06-17', status: 'present' });
      expect(AttendanceModule.getByDate('2025-06-16')).toHaveLength(2);
    });
  });

  describe('getByDateRange', () => {
    test('returns records within date range', () => {
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-15', status: 'present' });
      AttendanceModule.record({ employeeId: 'emp-2', date: '2025-06-16', status: 'present' });
      AttendanceModule.record({ employeeId: 'emp-3', date: '2025-06-17', status: 'present' });
      AttendanceModule.record({ employeeId: 'emp-4', date: '2025-06-20', status: 'present' });
      const results = AttendanceModule.getByDateRange('2025-06-15', '2025-06-17');
      expect(results).toHaveLength(3);
    });
  });

  describe('calculateRate', () => {
    test('calculates attendance rate', () => {
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-16', status: 'present' });
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-17', status: 'absent' });
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-18', status: 'remote' });
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-19', status: 'late' });
      const rate = AttendanceModule.calculateRate('emp-1', '2025-06-16', '2025-06-19');
      expect(rate).toBe(75); // 3 of 4 records are present/remote/late
    });

    test('returns 0 when no records', () => {
      expect(AttendanceModule.calculateRate('emp-1', '2025-01-01', '2025-01-31')).toBe(0);
    });
  });

  describe('update', () => {
    test('updates an attendance record', () => {
      const { record } = AttendanceModule.record(validRecord);
      const result = AttendanceModule.update(record.id, { status: 'late' });
      expect(result.success).toBe(true);
      expect(result.record.status).toBe('late');
    });

    test('rejects invalid status update', () => {
      const { record } = AttendanceModule.record(validRecord);
      const result = AttendanceModule.update(record.id, { status: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('returns error for nonexistent record', () => {
      const result = AttendanceModule.update('fake-id', { status: 'late' });
      expect(result.success).toBe(false);
    });
  });

  describe('remove', () => {
    test('removes a record', () => {
      const { record } = AttendanceModule.record(validRecord);
      expect(AttendanceModule.remove(record.id)).toBe(true);
      expect(AttendanceModule.getAll()).toHaveLength(0);
    });
  });

  describe('getDailySummary', () => {
    test('returns daily summary', () => {
      AttendanceModule.record({ employeeId: 'emp-1', date: '2025-06-16', status: 'present' });
      AttendanceModule.record({ employeeId: 'emp-2', date: '2025-06-16', status: 'absent' });
      AttendanceModule.record({ employeeId: 'emp-3', date: '2025-06-16', status: 'late' });
      AttendanceModule.record({ employeeId: 'emp-4', date: '2025-06-16', status: 'remote' });
      AttendanceModule.record({ employeeId: 'emp-5', date: '2025-06-16', status: 'half-day' });

      const summary = AttendanceModule.getDailySummary('2025-06-16');
      expect(summary.total).toBe(5);
      expect(summary.present).toBe(1);
      expect(summary.absent).toBe(1);
      expect(summary.late).toBe(1);
      expect(summary.remote).toBe(1);
      expect(summary.halfDay).toBe(1);
    });

    test('returns zeros for date with no records', () => {
      const summary = AttendanceModule.getDailySummary('2025-01-01');
      expect(summary.total).toBe(0);
    });
  });
});
