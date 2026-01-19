// app/controllers/StorageController.js

const DB_NAME = 'KanbanProDecksDB';
const STORE_NAME = 'decks';
const DB_VERSION = 1;

let db;

/**
 * Initializes the IndexedDB database and object store.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    // If connection is already open, return it
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('IndexedDB connection error');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('IndexedDB connection successful.');
      resolve(db);
    };

    // This event only runs if the database version changes
    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        console.log('Creating object store:', STORE_NAME);
        // Use autoIncrementing key
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * A controller for handling deck storage in IndexedDB.
 */
const StorageController = {
  /**
   * Saves a deck object to the IndexedDB.
   * @param {object} deck - The deck object to save. Must not have an 'id' property.
   * @returns {Promise<object|null>} A promise that resolves with the saved deck object (including its new id) or null on failure.
   */
  saveDeck: async (deck) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        // Add the deck. The key (id) will be auto-generated.
        const request = store.add(deck);

        request.onsuccess = (event) => {
          // event.target.result will be the new auto-generated key
          const savedDeck = { ...deck, id: event.target.result };
          console.log('Deck saved to IndexedDB successfully:', savedDeck);
          resolve(savedDeck);
        };

        request.onerror = (event) => {
          console.error('Failed to save deck to IndexedDB:', event.target.error);
          reject(null);
        };
      });
    } catch (error) {
      console.error('Error in saveDeck:', error);
      return null;
    }
  },

  /**
   * Retrieves all decks from the IndexedDB.
   * @returns {Promise<Array>} A promise that resolves with an array of all deck objects.
   */
  getAllDecks: async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Decks loaded from IndexedDB:', request.result);
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Failed to get decks from IndexedDB:', event.target.error);
          reject([]);
        };
      });
    } catch (error) {
      console.error('Error in getAllDecks:', error);
      return [];
    }
  },

  /**
   * Deletes a deck from the IndexedDB by its id.
   * @param {number} id - The id of the deck to delete.
   * @returns {Promise<boolean>} A promise that resolves with true on success, false on failure.
   */
  deleteDeck: async (id) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Deck deleted from IndexedDB successfully, id:', id);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Failed to delete deck from IndexedDB:', event.target.error);
          reject(false);
        };
      });
    } catch (error) {
      console.error('Error in deleteDeck:', error);
      return false;
    }
  },
};

export default StorageController;
