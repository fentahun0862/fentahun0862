const Storage = require('../js/modules/storage');

function createMockStore() {
  const data = {};
  return {
    getItem: jest.fn(key => data[key] || null),
    setItem: jest.fn((key, value) => { data[key] = value; }),
    removeItem: jest.fn(key => { delete data[key]; }),
  };
}

describe('Storage', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = createMockStore();
    Storage.init(mockStore);
  });

  describe('getAll', () => {
    test('returns empty array when no data', () => {
      expect(Storage.getAll('test')).toEqual([]);
    });

    test('returns parsed data', () => {
      const items = [{ id: '1', name: 'Item 1' }];
      mockStore.setItem('test', JSON.stringify(items));
      expect(Storage.getAll('test')).toEqual(items);
    });

    test('returns empty array on parse error', () => {
      mockStore.getItem.mockReturnValue('not-json');
      expect(Storage.getAll('test')).toEqual([]);
    });
  });

  describe('saveAll', () => {
    test('saves data to store', () => {
      const items = [{ id: '1' }];
      Storage.saveAll('test', items);
      expect(mockStore.setItem).toHaveBeenCalledWith('test', JSON.stringify(items));
    });
  });

  describe('getById', () => {
    test('returns item by ID', () => {
      const items = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      mockStore.setItem('test', JSON.stringify(items));
      expect(Storage.getById('test', '2')).toEqual({ id: '2', name: 'B' });
    });

    test('returns null when not found', () => {
      mockStore.setItem('test', JSON.stringify([{ id: '1' }]));
      expect(Storage.getById('test', '999')).toBeNull();
    });
  });

  describe('add', () => {
    test('adds an item', () => {
      const item = { id: '1', name: 'Test' };
      Storage.add('test', item);
      expect(Storage.getAll('test')).toContainEqual(item);
    });

    test('appends to existing items', () => {
      Storage.add('test', { id: '1' });
      Storage.add('test', { id: '2' });
      expect(Storage.getAll('test')).toHaveLength(2);
    });
  });

  describe('update', () => {
    test('updates an existing item', () => {
      Storage.add('test', { id: '1', name: 'Old' });
      const result = Storage.update('test', '1', { name: 'New' });
      expect(result.name).toBe('New');
      expect(result.id).toBe('1');
    });

    test('returns null if item not found', () => {
      expect(Storage.update('test', '999', { name: 'X' })).toBeNull();
    });
  });

  describe('remove', () => {
    test('removes an item', () => {
      Storage.add('test', { id: '1' });
      Storage.add('test', { id: '2' });
      expect(Storage.remove('test', '1')).toBe(true);
      expect(Storage.getAll('test')).toHaveLength(1);
    });

    test('returns false if item not found', () => {
      expect(Storage.remove('test', '999')).toBe(false);
    });
  });

  describe('clear', () => {
    test('clears all items for a key', () => {
      Storage.add('test', { id: '1' });
      Storage.clear('test');
      expect(mockStore.removeItem).toHaveBeenCalledWith('test');
    });
  });

  describe('count', () => {
    test('returns the count of items', () => {
      expect(Storage.count('test')).toBe(0);
      Storage.add('test', { id: '1' });
      Storage.add('test', { id: '2' });
      expect(Storage.count('test')).toBe(2);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      Storage.add('test', { id: '1', name: 'Alice Johnson' });
      Storage.add('test', { id: '2', name: 'Bob Smith' });
      Storage.add('test', { id: '3', name: 'Alice Williams' });
    });

    test('finds items by field value', () => {
      const results = Storage.search('test', 'name', 'alice');
      expect(results).toHaveLength(2);
    });

    test('returns all items for empty query', () => {
      const results = Storage.search('test', 'name', '');
      expect(results).toHaveLength(3);
    });

    test('returns all items for null query', () => {
      const results = Storage.search('test', 'name', null);
      expect(results).toHaveLength(3);
    });

    test('returns empty for no matches', () => {
      const results = Storage.search('test', 'name', 'xyz');
      expect(results).toHaveLength(0);
    });
  });
});
