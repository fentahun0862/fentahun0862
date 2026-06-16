/**
 * Attendance tracking module.
 */
if (typeof require !== 'undefined') {
  var Storage = require('./storage');
  var Formatter = require('../utils/formatter');
}

const ATTENDANCE_KEY = 'hr_attendance';

const AttendanceModule = {
  /**
   * Get all attendance records.
   * @returns {Array}
   */
  getAll() {
    return Storage.getAll(ATTENDANCE_KEY);
  },

  /**
   * Record attendance for an employee.
   * @param {Object} data - { employeeId, date, status, checkIn?, checkOut? }
   * @returns {{ success: boolean, record?: Object, errors?: string[] }}
   */
  record(data) {
    const errors = [];

    if (!data || !data.employeeId) {
      errors.push('Employee ID is required');
    }
    if (!data || !data.date) {
      errors.push('Date is required');
    }
    if (!data || !data.status) {
      errors.push('Status is required');
    }

    const validStatuses = ['present', 'absent', 'late', 'half-day', 'remote'];
    if (data && data.status && !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const existing = this.getAll();
    const duplicate = existing.find(
      r => r.employeeId === data.employeeId && r.date === data.date
    );
    if (duplicate) {
      return { success: false, errors: ['Attendance already recorded for this date'] };
    }

    const record = {
      id: Formatter.generateId('att'),
      employeeId: data.employeeId,
      date: data.date,
      status: data.status,
      checkIn: data.checkIn || null,
      checkOut: data.checkOut || null,
      createdAt: new Date().toISOString(),
    };

    Storage.add(ATTENDANCE_KEY, record);
    return { success: true, record };
  },

  /**
   * Get attendance records for a specific employee.
   * @param {string} employeeId
   * @returns {Array}
   */
  getByEmployee(employeeId) {
    return this.getAll().filter(r => r.employeeId === employeeId);
  },

  /**
   * Get attendance records for a specific date.
   * @param {string} date - YYYY-MM-DD
   * @returns {Array}
   */
  getByDate(date) {
    return this.getAll().filter(r => r.date === date);
  },

  /**
   * Get attendance records for a date range.
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Array}
   */
  getByDateRange(startDate, endDate) {
    return this.getAll().filter(r => r.date >= startDate && r.date <= endDate);
  },

  /**
   * Calculate attendance rate for an employee over a date range.
   * @param {string} employeeId
   * @param {string} startDate
   * @param {string} endDate
   * @returns {number} Percentage (0-100)
   */
  calculateRate(employeeId, startDate, endDate) {
    const records = this.getByEmployee(employeeId).filter(
      r => r.date >= startDate && r.date <= endDate
    );
    if (records.length === 0) return 0;
    const present = records.filter(r =>
      r.status === 'present' || r.status === 'remote' || r.status === 'late'
    ).length;
    return (present / records.length) * 100;
  },

  /**
   * Update an attendance record.
   * @param {string} id
   * @param {Object} updates
   * @returns {{ success: boolean, record?: Object, errors?: string[] }}
   */
  update(id, updates) {
    const existing = Storage.getById(ATTENDANCE_KEY, id);
    if (!existing) {
      return { success: false, errors: ['Attendance record not found'] };
    }

    if (updates.status) {
      const validStatuses = ['present', 'absent', 'late', 'half-day', 'remote'];
      if (!validStatuses.includes(updates.status)) {
        return { success: false, errors: [`Status must be one of: ${validStatuses.join(', ')}`] };
      }
    }

    const updated = Storage.update(ATTENDANCE_KEY, id, updates);
    return { success: true, record: updated };
  },

  /**
   * Delete an attendance record.
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    return Storage.remove(ATTENDANCE_KEY, id);
  },

  /**
   * Get attendance summary for a specific date.
   * @param {string} date
   * @returns {Object}
   */
  getDailySummary(date) {
    const records = this.getByDate(date);
    return {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      remote: records.filter(r => r.status === 'remote').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
    };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AttendanceModule;
}
