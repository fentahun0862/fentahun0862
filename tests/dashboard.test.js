const Storage = require('../js/modules/storage');
const EmployeeModule = require('../js/modules/employee');
const DepartmentModule = require('../js/modules/department');
const LeaveModule = require('../js/modules/leave');
const AttendanceModule = require('../js/modules/attendance');
const DashboardModule = require('../js/modules/dashboard');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

const sampleEmployee = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  department: 'Engineering',
  position: 'Developer',
  salary: 80000,
};

describe('DashboardModule', () => {
  beforeEach(() => {
    Storage.init(createMockStore());
  });

  describe('getOverview', () => {
    test('returns correct counts with no data', () => {
      const overview = DashboardModule.getOverview();
      expect(overview.totalEmployees).toBe(0);
      expect(overview.activeEmployees).toBe(0);
      expect(overview.totalDepartments).toBe(0);
      expect(overview.pendingLeaves).toBe(0);
    });

    test('returns correct counts with data', () => {
      DepartmentModule.add({ name: 'Engineering' });
      DepartmentModule.add({ name: 'HR' });
      EmployeeModule.add(sampleEmployee);
      LeaveModule.submit({
        employeeId: 'emp-1',
        startDate: '2025-07-01',
        endDate: '2025-07-05',
        reason: 'Vacation',
      });

      const overview = DashboardModule.getOverview();
      expect(overview.totalEmployees).toBe(1);
      expect(overview.activeEmployees).toBe(1);
      expect(overview.totalDepartments).toBe(2);
      expect(overview.pendingLeaves).toBe(1);
    });
  });

  describe('getDepartmentDistribution', () => {
    test('returns distribution with employee counts', () => {
      DepartmentModule.add({ name: 'Engineering' });
      DepartmentModule.add({ name: 'Marketing' });
      EmployeeModule.add(sampleEmployee);
      EmployeeModule.add({ ...sampleEmployee, email: 'jane@example.com', firstName: 'Jane' });
      EmployeeModule.add({
        ...sampleEmployee,
        email: 'bob@example.com',
        firstName: 'Bob',
        department: 'Marketing',
      });

      const dist = DashboardModule.getDepartmentDistribution();
      expect(dist).toHaveLength(2);

      const eng = dist.find(d => d.name === 'Engineering');
      expect(eng.count).toBe(2);

      const mkt = dist.find(d => d.name === 'Marketing');
      expect(mkt.count).toBe(1);
    });

    test('returns empty array when no departments', () => {
      expect(DashboardModule.getDepartmentDistribution()).toEqual([]);
    });
  });

  describe('getSalaryStats', () => {
    test('returns zeros when no employees', () => {
      const stats = DashboardModule.getSalaryStats();
      expect(stats.average).toBe(0);
      expect(stats.total).toBe(0);
    });

    test('calculates salary statistics', () => {
      EmployeeModule.add({ ...sampleEmployee, salary: 60000 });
      EmployeeModule.add({
        ...sampleEmployee,
        email: 'jane@example.com',
        firstName: 'Jane',
        salary: 100000,
      });

      const stats = DashboardModule.getSalaryStats();
      expect(stats.average).toBe(80000);
      expect(stats.min).toBe(60000);
      expect(stats.max).toBe(100000);
      expect(stats.total).toBe(160000);
    });
  });

  describe('getRecentHires', () => {
    test('returns most recent employees', () => {
      EmployeeModule.add(sampleEmployee);
      EmployeeModule.add({
        ...sampleEmployee,
        email: 'jane@example.com',
        firstName: 'Jane',
      });

      const recent = DashboardModule.getRecentHires(1);
      expect(recent).toHaveLength(1);
    });

    test('returns empty array when no employees', () => {
      expect(DashboardModule.getRecentHires()).toEqual([]);
    });
  });

  describe('getLeavesSummary', () => {
    test('returns leave summary for current year', () => {
      const year = new Date().getFullYear();
      const { leave: l1 } = LeaveModule.submit({
        employeeId: 'emp-1',
        startDate: `${year}-07-01`,
        endDate: `${year}-07-05`,
        reason: 'Vacation',
      });
      LeaveModule.submit({
        employeeId: 'emp-2',
        startDate: `${year}-08-01`,
        endDate: `${year}-08-05`,
        reason: 'Sick',
      });
      LeaveModule.approve(l1.id);

      const summary = DashboardModule.getLeavesSummary();
      expect(summary.approved).toBe(1);
      expect(summary.pending).toBe(1);
      expect(summary.rejected).toBe(0);
    });
  });

  describe('getTodayAttendance', () => {
    test('returns today attendance summary', () => {
      const today = new Date().toISOString().split('T')[0];
      AttendanceModule.record({ employeeId: 'emp-1', date: today, status: 'present' });

      const summary = DashboardModule.getTodayAttendance();
      expect(summary.total).toBe(1);
      expect(summary.present).toBe(1);
    });

    test('returns zeros when no records', () => {
      const summary = DashboardModule.getTodayAttendance();
      expect(summary.total).toBe(0);
    });
  });
});
