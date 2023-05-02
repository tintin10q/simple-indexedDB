// @ts-nocheck
interface Event {
    target: Event["target"] & { result: IDBDatabase };
}

interface IDBVersionChangeEvent {
    target: IDBVersionChangeEvent["target"] & { result: IDBDatabase };
}

type CreateObjectStores = Record<string, IDBObjectStoreParameters> | Map<string, IDBObjectStoreParameters>

function makePromise<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {resolve, reject, promise};
}

/**
 * Creates objectStores in database called dbname using single transaction
 * @param {string} dbname
 * @param {CreateObjectStores} objectStores
 * @return The db version right now.
 * @returns number
 *
 * In IndexedDB, if you don't specify a key path or auto-increment option when creating an object store, the object store will use the following defaults:
 *
 *     - The key path will be null. This means that objects in the store will not have a key path, and you will need to provide a key explicitly when adding or updating objects.
 *     - The auto-increment option will be false. This means that objects in the store will not have an auto-incrementing key. If you provide a key when adding an object to the store, that key will be used as the key for the object.
 */
async function createIndexeddatabase(dbname: string, objectStores: CreateObjectStores): Promise<number> {
    /* First find out if we need to update by opening the database without a version to get the current version and datastores */
    const {resolve, promise, reject} = makePromise<IDBDatabase>()
    const request = indexedDB.open(dbname);

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = reject;
    const db = await promise;
    db.onversionchange = db.close

    let version = db.version;
    let to_create: { name: string, options: IDBObjectStoreParameters }[] = [];

    if (objectStores instanceof Map) {
        for (const [name, options] of objectStores)
            if (!db.objectStoreNames.contains(name))
                to_create.push({name, options})
    } else if (!(objectStores instanceof Map)) {
        for (const name in objectStores)
            if (!db.objectStoreNames.contains(name))
                to_create.push({name, options: objectStores[name]})
    }
    /* Create the new database if needed */
    {
        const {promise, reject, resolve} = makePromise<number>()
        if (to_create.length) { // true if we need to update
            const request = indexedDB.open(dbname, ++version); // closes other db

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                for (const {name, options} of to_create) db.createObjectStore(name, options);
            };
            request.onerror = reject;
            request.onsuccess = (event) => {
                const db = event.target.result;
                resolve(db.version);
                db.close();
            }
            return promise;
        }
        resolve(db.version);
        db.close();
        return promise;
    }
}


export default createIndexeddatabase;