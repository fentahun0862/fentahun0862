const Storage = require('../js/modules/storage');
const LeaveModule = require('../js/modules/leave');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

const validLeave = {
  employeeId: 'emp-1',
  startDate: '2025-07-01',
  endDate: '2025-07-05',
  reason: 'Family vacation',
  type: 'annual',
};

describe('LeaveModule', () => {
  beforeEach(() => {
    Storage.init(createMockStore());
  });

  describe('submit', () => {
    test('submits a valid leave request', () => {
      const result = LeaveModule.submit(validLeave);
      expect(result.success).toBe(true);
      expect(result.leave.status).toBe('pending');
      expect(result.leave.id).toMatch(/^leave-/);
      expect(result.leave.days).toBeGreaterThan(0);
    });

    test('rejects invalid leave request', () => {
      const result = LeaveModule.submit({ employeeId: '', startDate: '', endDate: '', reason: '' });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects invalid leave type', () => {
      const result = LeaveModule.submit({ ...validLeave, type: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('calculates business days', () => {
      const result = LeaveModule.submit(validLeave);
      expect(result.leave.days).toBeGreaterThanOrEqual(1);
    });

    test('defaults type to annual', () => {
      const result = LeaveModule.submit({ ...validLeave, type: undefined });
      expect(result.leave.type).toBe('annual');
    });
  });

  describe('approve', () => {
    test('approves a pending request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      const result = LeaveModule.approve(leave.id, 'manager-1');
      expect(result.success).toBe(true);
      expect(result.leave.status).toBe('approved');
      expect(result.leave.approvedBy).toBe('manager-1');
    });

    test('rejects already approved request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.approve(leave.id);
      const result = LeaveModule.approve(leave.id);
      expect(result.success).toBe(false);
    });

    test('returns error for nonexistent ID', () => {
      const result = LeaveModule.approve('fake');
      expect(result.success).toBe(false);
    });
  });

  describe('reject', () => {
    test('rejects a pending request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      const result = LeaveModule.reject(leave.id, 'Budget constraints');
      expect(result.success).toBe(true);
      expect(result.leave.status).toBe('rejected');
      expect(result.leave.rejectionReason).toBe('Budget constraints');
    });

    test('cannot reject non-pending request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.approve(leave.id);
      const result = LeaveModule.reject(leave.id);
      expect(result.success).toBe(false);
    });
  });

  describe('cancel', () => {
    test('cancels a pending request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      const result = LeaveModule.cancel(leave.id);
      expect(result.success).toBe(true);
      expect(result.leave.status).toBe('cancelled');
    });

    test('cancels an approved request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.approve(leave.id);
      const result = LeaveModule.cancel(leave.id);
      expect(result.success).toBe(true);
    });

    test('cannot cancel a rejected request', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.reject(leave.id);
      const result = LeaveModule.cancel(leave.id);
      expect(result.success).toBe(false);
    });

    test('returns error for nonexistent ID', () => {
      const result = LeaveModule.cancel('fake');
      expect(result.success).toBe(false);
    });
  });

  describe('getByEmployee', () => {
    test('filters by employee ID', () => {
      LeaveModule.submit(validLeave);
      LeaveModule.submit({ ...validLeave, employeeId: 'emp-2', startDate: '2025-08-01', endDate: '2025-08-03' });
      expect(LeaveModule.getByEmployee('emp-1')).toHaveLength(1);
    });
  });

  describe('getByStatus', () => {
    test('filters by status', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.submit({ ...validLeave, employeeId: 'emp-2', startDate: '2025-08-01', endDate: '2025-08-05' });
      LeaveModule.approve(leave.id);
      expect(LeaveModule.getByStatus('approved')).toHaveLength(1);
      expect(LeaveModule.getByStatus('pending')).toHaveLength(1);
    });
  });

  describe('getTotalDaysUsed', () => {
    test('sums approved leave days for a year', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.approve(leave.id);
      const days = LeaveModule.getTotalDaysUsed('emp-1', 2025);
      expect(days).toBeGreaterThan(0);
    });

    test('ignores pending/rejected leaves', () => {
      LeaveModule.submit(validLeave);
      expect(LeaveModule.getTotalDaysUsed('emp-1', 2025)).toBe(0);
    });
  });

  describe('getRemainingBalance', () => {
    test('returns full balance when no leaves used', () => {
      expect(LeaveModule.getRemainingBalance('emp-1', 2025)).toBe(20);
    });

    test('returns custom allowance minus used', () => {
      const { leave } = LeaveModule.submit(validLeave);
      LeaveModule.approve(leave.id);
      const remaining = LeaveModule.getRemainingBalance('emp-1', 2025, 25);
      expect(remaining).toBeLessThan(25);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    test('never returns negative', () => {
      // Submit enough leaves to exceed balance
      for (let i = 0; i < 5; i++) {
        const { leave } = LeaveModule.submit({
          ...validLeave,
          employeeId: 'emp-x',
          startDate: `2025-0${i + 1}-01`,
          endDate: `2025-0${i + 1}-28`,
        });
        LeaveModule.approve(leave.id);
      }
      expect(LeaveModule.getRemainingBalance('emp-x', 2025, 5)).toBe(0);
    });
  });
});
