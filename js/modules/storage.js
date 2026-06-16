/**
 * LocalStorage persistence layer for the HR system.
 * Provides CRUD operations backed by localStorage.
 */
const Storage = {
  _store: null,

  /**
   * Initialize with a custom store (for testing) or use localStorage.
   * @param {Object} [store]
   */
  init(store) {
    this._store = store || (typeof localStorage !== 'undefined' ? localStorage : null);
  },

  /**
   * Get the active store.
   * @returns {Object}
   */
  _getStore() {
    if (!this._store) {
      this.init();
    }
    return this._store;
  },

  /**
   * Get all items for a given key.
   * @param {string} key
   * @returns {Array}
   */
  getAll(key) {
    try {
      const store = this._getStore();
      if (!store) return [];
      const data = store.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save all items for a given key.
   * @param {string} key
   * @param {Array} items
   */
  saveAll(key, items) {
    try {
      const store = this._getStore();
      if (!store) return;
      store.setItem(key, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  },

  /**
   * Get a single item by ID.
   * @param {string} key
   * @param {string} id
   * @returns {Object|null}
   */
  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === id) || null;
  },

  /**
   * Add a new item.
   * @param {string} key
   * @param {Object} item
   * @returns {Object} The added item
   */
  add(key, item) {
    const items = this.getAll(key);
    items.push(item);
    this.saveAll(key, items);
    return item;
  },

  /**
   * Update an existing item by ID.
   * @param {string} key
   * @param {string} id
   * @param {Object} updates
   * @returns {Object|null} The updated item, or null if not found
   */
  update(key, id, updates) {
    const items = this.getAll(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.saveAll(key, items);
    return items[index];
  },

  /**
   * Delete an item by ID.
   * @param {string} key
   * @param {string} id
   * @returns {boolean} True if deleted, false if not found
   */
  remove(key, id) {
    const items = this.getAll(key);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    this.saveAll(key, filtered);
    return true;
  },

  /**
   * Clear all items for a given key.
   * @param {string} key
   */
  clear(key) {
    try {
      const store = this._getStore();
      if (!store) return;
      store.removeItem(key);
    } catch {
      // Ignore
    }
  },

  /**
   * Get the count of items for a given key.
   * @param {string} key
   * @returns {number}
   */
  count(key) {
    return this.getAll(key).length;
  },

  /**
   * Search items by a field value (case-insensitive partial match).
   * @param {string} key
   * @param {string} field
   * @param {string} query
   * @returns {Array}
   */
  search(key, field, query) {
    if (!query || typeof query !== 'string') return this.getAll(key);
    const items = this.getAll(key);
    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(lowerQuery);
    });
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
