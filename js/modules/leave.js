/**
 * Leave management module.
 */
let Storage, Validator, Formatter, DateUtils;

if (typeof require !== 'undefined') {
  Storage = require('./storage');
  Validator = require('../utils/validator');
  Formatter = require('../utils/formatter');
  DateUtils = require('../utils/dateUtils');
}

const LEAVE_KEY = 'hr_leaves';

const LeaveModule = {
  /**
   * Get all leave requests.
   * @returns {Array}
   */
  getAll() {
    return Storage.getAll(LEAVE_KEY);
  },

  /**
   * Get a leave request by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return Storage.getById(LEAVE_KEY, id);
  },

  /**
   * Submit a new leave request.
   * @param {Object} leaveData
   * @returns {{ success: boolean, leave?: Object, errors?: string[] }}
   */
  submit(leaveData) {
    const validation = Validator.validateLeaveRequest(leaveData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const validTypes = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'];
    if (leaveData.type && !validTypes.includes(leaveData.type)) {
      return { success: false, errors: [`Leave type must be one of: ${validTypes.join(', ')}`] };
    }

    const days = DateUtils.businessDaysBetween(leaveData.startDate, leaveData.endDate);

    const leave = {
      id: Formatter.generateId('leave'),
      employeeId: leaveData.employeeId.trim(),
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      type: leaveData.type || 'annual',
      reason: leaveData.reason.trim(),
      days,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    Storage.add(LEAVE_KEY, leave);
    return { success: true, leave };
  },

  /**
   * Approve a leave request.
   * @param {string} id
   * @param {string} [approvedBy]
   * @returns {{ success: boolean, leave?: Object, errors?: string[] }}
   */
  approve(id, approvedBy) {
    const leave = this.getById(id);
    if (!leave) {
      return { success: false, errors: ['Leave request not found'] };
    }
    if (leave.status !== 'pending') {
      return { success: false, errors: ['Only pending requests can be approved'] };
    }

    const updated = Storage.update(LEAVE_KEY, id, {
      status: 'approved',
      approvedBy: approvedBy || '',
      approvedAt: new Date().toISOString(),
    });

    return { success: true, leave: updated };
  },

  /**
   * Reject a leave request.
   * @param {string} id
   * @param {string} [reason]
   * @returns {{ success: boolean, leave?: Object, errors?: string[] }}
   */
  reject(id, reason) {
    const leave = this.getById(id);
    if (!leave) {
      return { success: false, errors: ['Leave request not found'] };
    }
    if (leave.status !== 'pending') {
      return { success: false, errors: ['Only pending requests can be rejected'] };
    }

    const updated = Storage.update(LEAVE_KEY, id, {
      status: 'rejected',
      rejectionReason: reason || '',
      rejectedAt: new Date().toISOString(),
    });

    return { success: true, leave: updated };
  },

  /**
   * Cancel a leave request (only pending or approved).
   * @param {string} id
   * @returns {{ success: boolean, leave?: Object, errors?: string[] }}
   */
  cancel(id) {
    const leave = this.getById(id);
    if (!leave) {
      return { success: false, errors: ['Leave request not found'] };
    }
    if (leave.status === 'rejected' || leave.status === 'cancelled') {
      return { success: false, errors: ['Cannot cancel a rejected or already cancelled request'] };
    }

    const updated = Storage.update(LEAVE_KEY, id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });

    return { success: true, leave: updated };
  },

  /**
   * Get leave requests for an employee.
   * @param {string} employeeId
   * @returns {Array}
   */
  getByEmployee(employeeId) {
    return this.getAll().filter(l => l.employeeId === employeeId);
  },

  /**
   * Get leave requests by status.
   * @param {string} status
   * @returns {Array}
   */
  getByStatus(status) {
    return this.getAll().filter(l => l.status === status);
  },

  /**
   * Get the total leave days used by an employee in a given year.
   * @param {string} employeeId
   * @param {number} year
   * @returns {number}
   */
  getTotalDaysUsed(employeeId, year) {
    const leaves = this.getByEmployee(employeeId).filter(
      l => l.status === 'approved' && new Date(l.startDate).getFullYear() === year
    );
    return leaves.reduce((sum, l) => sum + (l.days || 0), 0);
  },

  /**
   * Get the remaining leave balance for an employee.
   * @param {string} employeeId
   * @param {number} year
   * @param {number} [totalAllowed=20]
   * @returns {number}
   */
  getRemainingBalance(employeeId, year, totalAllowed = 20) {
    const used = this.getTotalDaysUsed(employeeId, year);
    return Math.max(0, totalAllowed - used);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaveModule;
}
