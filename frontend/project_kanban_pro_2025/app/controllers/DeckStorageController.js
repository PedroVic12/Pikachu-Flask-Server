// app/controllers/DeckStorageController.js

const DB_NAME = 'KanbanProDecksDB';
const STORE_NAME = 'decks';
const DB_VERSION = 1;

let db;

/**
 * Initializes the IndexedDB database and object store for decks.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB (Decks) error:', event.target.error);
      reject('IndexedDB (Decks) connection error');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * A controller for handling deck storage in IndexedDB.
 */
const DeckStorageController = {
  /**
   * Saves a deck object to the IndexedDB.
   * @param {object} deck - The deck object to save.
   * @returns {Promise<object|null>} A promise that resolves with the saved deck object (including its new id) or null on failure.
   */
  saveDeck: async (deck) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.add(deck);

        request.onsuccess = (event) => {
          const savedDeck = { ...deck, id: event.target.result };
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

export default DeckStorageController;
