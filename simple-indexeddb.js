// @ts-nocheck
function makePromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        resolve,
        reject,
        promise
    };
}
/**
 * @class IndexeDBObjectStore
 * A simple promise based wrapper for an indexedDB object store
 * @param {string} dbname - The name of the database you want to open
 * @param {string} dbname - The name of the objectstore you want to open
 * @param {CreateOptions} options - If the object store does not exist we attempt to create it. Here you can pass autoIncrement and or keyPath. You don't need this if you're sure the objectStore already exists. For more info see [Structuring the database on mdn](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database
 *
 * You can have multiple databases each with multiple object stores. Each object store can hold key value pair objects.
 * You can query these key value pairs using strings or using IDBKeyRange (https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange)
 */
class IndexedDBObjectStore {
    db;
    dbname;
    objectstorename;
    constructor(dbname, objectstorename, createOptions) {
        const { promise, reject, resolve } = makePromise();
        let request = indexedDB.open(dbname, createOptions?.version);
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(objectstorename)) {
                this.db.createObjectStore(objectstorename, createOptions);
            }
            // resolve(this);
        };
        request.onerror = reject;
        request.onsuccess = (event) => {
            this.db = event.target.result;
            // turn on if you want db to automatically close on version change,
            // if you leave it off tabs have to be reloaded before version change can happen or manual close
            // this.db.onversionchange = () => this.db.close();
            resolve(this);
        };
        this.dbname = dbname;
        this.objectstorename = objectstorename;
        return promise;
    }
    /**
     * Get an object store and parse it as json (if it was text)
     * @param {string} key
     */
    async getJson(key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).get(key);
        transaction.onsuccess = (event) => {
            try {
                let store = event.target.result;
                if (typeof store === "undefined")
                    reject(`${key} is undefined`);
                resolve(JSON.parse(store));
            }
            catch (e) {
                reject(`Could not parse ${key} in object store: ${e}`);
            }
        };
        return promise;
    }
    /**
     * Get the value stored under a key or key range
     * @param {IDBValidKey | IDBKeyRange} key
     */
    async get(key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).get(key);
        transaction.onsuccess = (event) => {
            try {
                resolve(event.target.result);
            }
            catch (e) {
                reject(`Could not load ${name} store: ${e}`);
            }
        };
        return promise;
    }
    /**
     * Save data for a key in the store. Replaces data already there.
     * Based on your [Key mode](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database) you should include a key or not.
     * @param {any} data
     * @param {IDBValidKey|undefined} key
     */
    async put(data, key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename], "readwrite").objectStore(this.objectstorename).put(data, key);
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Add new key value pair to the store.
     * Based on your [Key mode](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database) you should include a key or not.
     * @param {any} data - data to save
     * @param {IDBValidKey|undefined} key - Key under which to save, can be undefined
     */
    async add(data, key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db
            .transaction([this.objectstorename], "readwrite")
            .objectStore(this.objectstorename)
            .add(data, key);
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Get all data in the object store. It is possible to query using
     * [IDBKeyRange](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange)
     * @param {undefined|IDBKeyRange} query - Optional query
     * @param {undefined|number} count - Number of things to return
     */
    async getAll(query, count) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).getAll(query, count);
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Clear the entire object store. **This removes all key value pairs in the object store**
     */
    clear() {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename], "readwrite").objectStore(this.objectstorename).clear();
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Returns the number of key value pairs in the object store.
     * You can also query count the results the query would get
     * @param {undefined| IDBKeyRange | string} query
     */
    count(query) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).count(query);
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Get a indexed db request object for a certain key
     * @param {IDBValidKey | IDBKeyRange} key
     */
    getKey(key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).getKey(key);
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Retrieves record keys for all objects in the object store matching the specified parameter or all objects in the store if no parameters are given.
     * If you don't give arguments it returns all keys
     * @param {IDBKeyRange|IDBValidKey} query
     * @param {undefined|number} count
     */
    getAllKeys(query, count) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename]).objectStore(this.objectstorename).getAllKeys();
        transaction.onsuccess = (event) => resolve(event.target.result);
        transaction.onerror = reject;
        return promise;
    }
    /**
     * Delete one specific key value pair from the object store.
     * @param {IDBValidKey} key
     */
    delete(key) {
        const { promise, reject, resolve } = makePromise();
        const transaction = this.db.transaction([this.objectstorename], "readwrite").objectStore(this.objectstorename).delete(key);
        transaction.onsuccess = (event) => resolve(event);
        transaction.onerror = reject;
        return promise;
    }
}
export default IndexedDBObjectStore;
