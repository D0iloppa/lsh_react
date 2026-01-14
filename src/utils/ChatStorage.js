const DB_NAME = 'OpenChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

const ChatStorage = {
    db: null,

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'chat_sn' });
                    store.createIndex('time', 'send_dt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    async saveMessages(messages) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            messages.forEach(msg => {
                // Ensure send_dt is stored as timestamp for indexing/cleanup
                const msgToStore = {
                    ...msg,
                    // If send_dt is string, convert to timestamp number if needed for easier comparison, 
                    // but IndexDB can handle ISO strings correctly in key ranges if consistent. 
                    // We'll trust the input format but ensure it exists.
                };
                store.put(msgToStore);
            });

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = (event) => {
                console.error('Save messages error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    /**
     * Get messages from DB
     * @param {number} limit 
     * @param {string|number} before_chat_sn - If provided, fetch messages older than this SN
     */
    async getMessages(limit = 20, before_chat_sn = null) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            // We assume chat_sn is increasing with time. 
            // To get "latest", we go backwards from end.
            // To get "older than X", we define a range.

            let range = null;
            if (before_chat_sn) {
                range = IDBKeyRange.upperBound(before_chat_sn, true); // true = open interval (exclude boundary)
            }

            const request = store.openCursor(range, 'prev'); // 'prev' = descending order
            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    // Sort back to ascending for display if needed, but usually UI handles it.
                    // Returning descending (newest first) as requested by lazy loading logic usually.
                    resolve(results);
                }
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async cleanupOldMessages(retentionDays) {
        if (!this.db) await this.init();

        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(Date.now() - retentionMs).toISOString();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('time');

            const range = IDBKeyRange.upperBound(cutoffDate);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                } else {
                    // End of cursor
                }
            };

            transaction.oncomplete = () => {
                console.log(`Cleaned up messages older than ${cutoffDate}`);
                resolve();
            };
            transaction.onerror = (e) => reject(e);
        });
    },

    async clearAllMessages() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('All messages cleared from IndexedDB');
                resolve();
            };

            request.onerror = (event) => {
                console.error('Clear messages error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    async deleteMessage(chat_sn) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(chat_sn);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async softDeleteMessage(chat_sn) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(chat_sn);

            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    data.is_deleted = 1;
                    store.put(data);
                }
                resolve();
            };
            getRequest.onerror = (event) => reject(event.target.error);
        });
    }

};

export default ChatStorage;
