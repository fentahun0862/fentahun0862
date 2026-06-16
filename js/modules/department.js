/**
 * Department management module.
 */
if (typeof require !== 'undefined') {
  var Storage = require('./storage');
  var Formatter = require('../utils/formatter');
}

const DEPARTMENT_KEY = 'hr_departments';

const DepartmentModule = {
  /**
   * Get all departments.
   * @returns {Array}
   */
  getAll() {
    return Storage.getAll(DEPARTMENT_KEY);
  },

  /**
   * Get a department by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return Storage.getById(DEPARTMENT_KEY, id);
  },

  /**
   * Add a new department.
   * @param {Object} deptData
   * @returns {{ success: boolean, department?: Object, errors?: string[] }}
   */
  add(deptData) {
    const errors = [];

    if (!deptData || !deptData.name || typeof deptData.name !== 'string' || !deptData.name.trim()) {
      errors.push('Department name is required');
    }

    if (errors.length === 0) {
      const existing = this.getAll();
      const duplicate = existing.find(
        d => d.name.toLowerCase() === deptData.name.trim().toLowerCase()
      );
      if (duplicate) {
        errors.push('A department with this name already exists');
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const department = {
      id: Formatter.generateId('dept'),
      name: deptData.name.trim(),
      description: deptData.description ? deptData.description.trim() : '',
      manager: deptData.manager || '',
      createdAt: new Date().toISOString(),
    };

    Storage.add(DEPARTMENT_KEY, department);
    return { success: true, department };
  },

  /**
   * Update a department.
   * @param {string} id
   * @param {Object} updates
   * @returns {{ success: boolean, department?: Object, errors?: string[] }}
   */
  update(id, updates) {
    const existing = this.getById(id);
    if (!existing) {
      return { success: false, errors: ['Department not found'] };
    }

    if (updates.name) {
      const all = this.getAll();
      const duplicate = all.find(
        d => d.name.toLowerCase() === updates.name.trim().toLowerCase() && d.id !== id
      );
      if (duplicate) {
        return { success: false, errors: ['A department with this name already exists'] };
      }
    }

    const updated = Storage.update(DEPARTMENT_KEY, id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, department: updated };
  },

  /**
   * Delete a department.
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    return Storage.remove(DEPARTMENT_KEY, id);
  },

  /**
   * Get department names as an array of strings.
   * @returns {string[]}
   */
  getNames() {
    return this.getAll().map(d => d.name);
  },

  /**
   * Get the count of departments.
   * @returns {number}
   */
  count() {
    return Storage.count(DEPARTMENT_KEY);
  },

  /**
   * Find a department by name (case-insensitive).
   * @param {string} name
   * @returns {Object|null}
   */
  findByName(name) {
    if (!name || typeof name !== 'string') return null;
    const lower = name.trim().toLowerCase();
    return this.getAll().find(d => d.name.toLowerCase() === lower) || null;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DepartmentModule;
}
