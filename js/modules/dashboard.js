/**
 * Dashboard statistics module.
 */
let EmployeeModule, DepartmentModule, AttendanceModule, LeaveModule;

if (typeof require !== 'undefined') {
  EmployeeModule = require('./employee');
  DepartmentModule = require('./department');
  AttendanceModule = require('./attendance');
  LeaveModule = require('./leave');
}

const DashboardModule = {
  /**
   * Get overview statistics.
   * @returns {Object}
   */
  getOverview() {
    return {
      totalEmployees: EmployeeModule.count(),
      activeEmployees: EmployeeModule.activeCount(),
      totalDepartments: DepartmentModule.count(),
      pendingLeaves: LeaveModule.getByStatus('pending').length,
    };
  },

  /**
   * Get department distribution (employee count per department).
   * @returns {Array<{ name: string, count: number }>}
   */
  getDepartmentDistribution() {
    const departments = DepartmentModule.getAll();
    const employees = EmployeeModule.getAll();

    return departments.map(dept => ({
      name: dept.name,
      count: employees.filter(e => e.department === dept.name).length,
    }));
  },

  /**
   * Get today's attendance summary.
   * @returns {Object}
   */
  getTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return AttendanceModule.getDailySummary(today);
  },

  /**
   * Get salary statistics.
   * @returns {{ average: number, min: number, max: number, total: number }}
   */
  getSalaryStats() {
    const employees = EmployeeModule.getAll().filter(e => e.salary > 0);
    if (employees.length === 0) {
      return { average: 0, min: 0, max: 0, total: 0 };
    }

    const salaries = employees.map(e => e.salary);
    const total = salaries.reduce((sum, s) => sum + s, 0);

    return {
      average: total / salaries.length,
      min: Math.min(...salaries),
      max: Math.max(...salaries),
      total,
    };
  },

  /**
   * Get recent activity (last N employees added).
   * @param {number} [limit=5]
   * @returns {Array}
   */
  getRecentHires(limit = 5) {
    const employees = EmployeeModule.getAll();
    return employees
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  /**
   * Get leave summary for current year.
   * @returns {{ pending: number, approved: number, rejected: number }}
   */
  getLeavesSummary() {
    const leaves = LeaveModule.getAll();
    const currentYear = new Date().getFullYear();
    const thisYear = leaves.filter(
      l => new Date(l.startDate).getFullYear() === currentYear
    );

    return {
      pending: thisYear.filter(l => l.status === 'pending').length,
      approved: thisYear.filter(l => l.status === 'approved').length,
      rejected: thisYear.filter(l => l.status === 'rejected').length,
    };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardModule;
}
