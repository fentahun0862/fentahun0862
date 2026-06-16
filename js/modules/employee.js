/**
 * Employee management module.
 */
if (typeof require !== 'undefined') {
  Storage = require('./storage');
  Validator = require('../utils/validator');
  Formatter = require('../utils/formatter');
}

const EMPLOYEE_KEY = 'hr_employees';

const EmployeeModule = {
  /**
   * Get all employees.
   * @returns {Array}
   */
  getAll() {
    return Storage.getAll(EMPLOYEE_KEY);
  },

  /**
   * Get an employee by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return Storage.getById(EMPLOYEE_KEY, id);
  },

  /**
   * Add a new employee.
   * @param {Object} employeeData
   * @returns {{ success: boolean, employee?: Object, errors?: string[] }}
   */
  add(employeeData) {
    const validation = Validator.validateEmployee(employeeData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const existing = this.getAll();
    const duplicate = existing.find(e => e.email === employeeData.email);
    if (duplicate) {
      return { success: false, errors: ['An employee with this email already exists'] };
    }

    const employee = {
      id: Formatter.generateId('emp'),
      firstName: employeeData.firstName.trim(),
      lastName: employeeData.lastName.trim(),
      email: employeeData.email.trim().toLowerCase(),
      phone: employeeData.phone ? employeeData.phone.trim() : '',
      department: employeeData.department.trim(),
      position: employeeData.position.trim(),
      salary: employeeData.salary ? Number(employeeData.salary) : 0,
      hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    Storage.add(EMPLOYEE_KEY, employee);
    return { success: true, employee };
  },

  /**
   * Update an existing employee.
   * @param {string} id
   * @param {Object} updates
   * @returns {{ success: boolean, employee?: Object, errors?: string[] }}
   */
  update(id, updates) {
    const existing = this.getById(id);
    if (!existing) {
      return { success: false, errors: ['Employee not found'] };
    }

    const merged = { ...existing, ...updates };
    const validation = Validator.validateEmployee(merged);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    if (updates.email && updates.email !== existing.email) {
      const all = this.getAll();
      const duplicate = all.find(e => e.email === updates.email && e.id !== id);
      if (duplicate) {
        return { success: false, errors: ['An employee with this email already exists'] };
      }
    }

    const updated = Storage.update(EMPLOYEE_KEY, id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, employee: updated };
  },

  /**
   * Delete an employee.
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    return Storage.remove(EMPLOYEE_KEY, id);
  },

  /**
   * Search employees by name.
   * @param {string} query
   * @returns {Array}
   */
  search(query) {
    if (!query || typeof query !== 'string') return this.getAll();
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(emp => {
      const fullName = Formatter.fullName(emp).toLowerCase();
      return fullName.includes(lowerQuery) || emp.email.toLowerCase().includes(lowerQuery);
    });
  },

  /**
   * Get employees by department.
   * @param {string} department
   * @returns {Array}
   */
  getByDepartment(department) {
    return this.getAll().filter(emp => emp.department === department);
  },

  /**
   * Get employees by status.
   * @param {string} status - 'active' or 'inactive'
   * @returns {Array}
   */
  getByStatus(status) {
    return this.getAll().filter(emp => emp.status === status);
  },

  /**
   * Get the total count of employees.
   * @returns {number}
   */
  count() {
    return Storage.count(EMPLOYEE_KEY);
  },

  /**
   * Get the count of active employees.
   * @returns {number}
   */
  activeCount() {
    return this.getByStatus('active').length;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmployeeModule;
}
