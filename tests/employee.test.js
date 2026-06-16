const Storage = require('../js/modules/storage');
const EmployeeModule = require('../js/modules/employee');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

const validEmployee = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  department: 'Engineering',
  position: 'Developer',
  salary: 80000,
};

describe('EmployeeModule', () => {
  beforeEach(() => {
    Storage.init(createMockStore());
  });

  describe('add', () => {
    test('adds a valid employee', () => {
      const result = EmployeeModule.add(validEmployee);
      expect(result.success).toBe(true);
      expect(result.employee).toBeDefined();
      expect(result.employee.firstName).toBe('John');
      expect(result.employee.status).toBe('active');
      expect(result.employee.id).toMatch(/^emp-/);
    });

    test('rejects invalid employee data', () => {
      const result = EmployeeModule.add({ firstName: '' });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects duplicate email', () => {
      EmployeeModule.add(validEmployee);
      const result = EmployeeModule.add({ ...validEmployee, firstName: 'Jane' });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('An employee with this email already exists');
    });

    test('normalizes email to lowercase', () => {
      const result = EmployeeModule.add({ ...validEmployee, email: 'JOHN@Example.COM' });
      expect(result.employee.email).toBe('john@example.com');
    });
  });

  describe('getAll / getById', () => {
    test('returns all employees', () => {
      EmployeeModule.add(validEmployee);
      EmployeeModule.add({ ...validEmployee, email: 'jane@example.com', firstName: 'Jane' });
      expect(EmployeeModule.getAll()).toHaveLength(2);
    });

    test('returns employee by ID', () => {
      const { employee } = EmployeeModule.add(validEmployee);
      const found = EmployeeModule.getById(employee.id);
      expect(found).toBeDefined();
      expect(found.firstName).toBe('John');
    });

    test('returns null for unknown ID', () => {
      expect(EmployeeModule.getById('nonexistent')).toBeNull();
    });
  });

  describe('update', () => {
    test('updates an employee', () => {
      const { employee } = EmployeeModule.add(validEmployee);
      const result = EmployeeModule.update(employee.id, { position: 'Senior Developer' });
      expect(result.success).toBe(true);
      expect(result.employee.position).toBe('Senior Developer');
    });

    test('returns error for nonexistent employee', () => {
      const result = EmployeeModule.update('fake-id', { position: 'X' });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Employee not found');
    });

    test('prevents duplicate email on update', () => {
      EmployeeModule.add(validEmployee);
      const { employee: emp2 } = EmployeeModule.add({
        ...validEmployee,
        email: 'jane@example.com',
        firstName: 'Jane',
      });
      const result = EmployeeModule.update(emp2.id, { email: 'john@example.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('remove', () => {
    test('removes an employee', () => {
      const { employee } = EmployeeModule.add(validEmployee);
      expect(EmployeeModule.remove(employee.id)).toBe(true);
      expect(EmployeeModule.getAll()).toHaveLength(0);
    });

    test('returns false for nonexistent employee', () => {
      expect(EmployeeModule.remove('fake')).toBe(false);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      EmployeeModule.add(validEmployee);
      EmployeeModule.add({
        ...validEmployee,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      });
    });

    test('searches by name', () => {
      expect(EmployeeModule.search('John')).toHaveLength(1);
      expect(EmployeeModule.search('jane')).toHaveLength(1);
    });

    test('searches by email', () => {
      expect(EmployeeModule.search('jane@')).toHaveLength(1);
    });

    test('returns all for empty query', () => {
      expect(EmployeeModule.search('')).toHaveLength(2);
    });
  });

  describe('getByDepartment', () => {
    test('filters by department', () => {
      EmployeeModule.add(validEmployee);
      EmployeeModule.add({
        ...validEmployee,
        email: 'bob@example.com',
        firstName: 'Bob',
        department: 'Marketing',
      });
      expect(EmployeeModule.getByDepartment('Engineering')).toHaveLength(1);
      expect(EmployeeModule.getByDepartment('Marketing')).toHaveLength(1);
    });
  });

  describe('getByStatus', () => {
    test('filters by status', () => {
      EmployeeModule.add(validEmployee);
      expect(EmployeeModule.getByStatus('active')).toHaveLength(1);
      expect(EmployeeModule.getByStatus('inactive')).toHaveLength(0);
    });
  });

  describe('count / activeCount', () => {
    test('counts employees', () => {
      expect(EmployeeModule.count()).toBe(0);
      EmployeeModule.add(validEmployee);
      expect(EmployeeModule.count()).toBe(1);
    });

    test('counts active employees', () => {
      EmployeeModule.add(validEmployee);
      expect(EmployeeModule.activeCount()).toBe(1);
    });
  });
});
