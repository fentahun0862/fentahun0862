const Storage = require('../js/modules/storage');
const DepartmentModule = require('../js/modules/department');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

describe('DepartmentModule', () => {
  beforeEach(() => {
    Storage.init(createMockStore());
  });

  describe('add', () => {
    test('adds a valid department', () => {
      const result = DepartmentModule.add({ name: 'Engineering', description: 'Dev team' });
      expect(result.success).toBe(true);
      expect(result.department.name).toBe('Engineering');
      expect(result.department.id).toMatch(/^dept-/);
    });

    test('rejects empty name', () => {
      const result = DepartmentModule.add({ name: '' });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Department name is required');
    });

    test('rejects null data', () => {
      const result = DepartmentModule.add(null);
      expect(result.success).toBe(false);
    });

    test('rejects duplicate name (case-insensitive)', () => {
      DepartmentModule.add({ name: 'Engineering' });
      const result = DepartmentModule.add({ name: 'engineering' });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('A department with this name already exists');
    });
  });

  describe('getAll / getById', () => {
    test('returns all departments', () => {
      DepartmentModule.add({ name: 'HR' });
      DepartmentModule.add({ name: 'Finance' });
      expect(DepartmentModule.getAll()).toHaveLength(2);
    });

    test('returns department by ID', () => {
      const { department } = DepartmentModule.add({ name: 'Sales' });
      expect(DepartmentModule.getById(department.id)).toBeDefined();
    });

    test('returns null for unknown ID', () => {
      expect(DepartmentModule.getById('fake')).toBeNull();
    });
  });

  describe('update', () => {
    test('updates a department', () => {
      const { department } = DepartmentModule.add({ name: 'Old Name' });
      const result = DepartmentModule.update(department.id, { name: 'New Name' });
      expect(result.success).toBe(true);
      expect(result.department.name).toBe('New Name');
    });

    test('returns error for nonexistent department', () => {
      const result = DepartmentModule.update('fake', { name: 'X' });
      expect(result.success).toBe(false);
    });

    test('prevents duplicate name on update', () => {
      DepartmentModule.add({ name: 'HR' });
      const { department } = DepartmentModule.add({ name: 'Finance' });
      const result = DepartmentModule.update(department.id, { name: 'HR' });
      expect(result.success).toBe(false);
    });
  });

  describe('remove', () => {
    test('removes a department', () => {
      const { department } = DepartmentModule.add({ name: 'Temp' });
      expect(DepartmentModule.remove(department.id)).toBe(true);
      expect(DepartmentModule.getAll()).toHaveLength(0);
    });
  });

  describe('getNames', () => {
    test('returns array of department names', () => {
      DepartmentModule.add({ name: 'Alpha' });
      DepartmentModule.add({ name: 'Beta' });
      const names = DepartmentModule.getNames();
      expect(names).toContain('Alpha');
      expect(names).toContain('Beta');
    });
  });

  describe('count', () => {
    test('returns department count', () => {
      expect(DepartmentModule.count()).toBe(0);
      DepartmentModule.add({ name: 'Dept1' });
      expect(DepartmentModule.count()).toBe(1);
    });
  });

  describe('findByName', () => {
    test('finds by name (case-insensitive)', () => {
      DepartmentModule.add({ name: 'Engineering' });
      expect(DepartmentModule.findByName('engineering')).toBeDefined();
      expect(DepartmentModule.findByName('ENGINEERING')).toBeDefined();
    });

    test('returns null for no match', () => {
      expect(DepartmentModule.findByName('nonexistent')).toBeNull();
    });

    test('returns null for null input', () => {
      expect(DepartmentModule.findByName(null)).toBeNull();
    });
  });
});
