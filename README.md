# simple-indexedDB

A simple indexedDB wrapper.

## Usage

```js
import IndexedDBObjectStore from "simple-indexeddb"
// or just copy the code into your file its only ~200 lines of code

const store = await new IndexedDBObjectStore("my-db", "my-store")
await store.put("test", 137)
console.log(await store.get("test")) // 137
```

## Motivation

There is a bunch of annoying ugly boilerplate involved when dealing
with [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). When dealing with the IndexedDB
you want an instance of the [IDBObjectStore](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore) class. But
to get there one has to deal with the aforementioned boilerplate:

```js 
// writing and reading indexdb in vanilla js
let db;
const DBOpenRequest = window.indexedDB.open('db-test');

DBOpenRequest.onerror = event => console.error("Error loading database.");
DBOpenRequest.onsuccess = event => {
    db = DBOpenRequest.result;
};

// writing to the database
let transaction = db
    .transaction(["test"], "readwrite")
    .objectStore("test")
    .add("test", 137);

// reading from the database 
let result;
transaction.onsuccess(() => {
    db.transaction(["test"])
        .objectStore("test")
        .get("test").onsuccess((event) => {
        result = event.target.result;
    })
});
```

This project reduces this boiler plates to a nice single promise based class. This class allows you to think that you
can access the IDBObjectStore class directly without having to think about creating transactions:

```js
import IndexedDBObjectStore from "simple-indexeddb"

const store = await new IndexedDBObjectStore("my-db", "my-store")
await store.put('test', 137)
console.log(await store.get('test')) // 137
```

This is useful for instance when you need to store data from within a service worker/web worker. Using this class also
makes it a lot harder to run into uncommited transactions.

The class is only
about ~200 lines of code, and you could take out the methods you don't need. This allows for just dropping the code in
your project without having to install it as a dependency. There is a [simple-indexeddb.ts](./simple-indexeddb.ts)
and [simple-indexeddb.js](./simple-indexeddb.js) version.

## Creating Databases:

Creating databases can be quite confusing using indexedDB. Use the  `createIndexeddatabase` function to create many
databases easily in a single transaction. The function returns a promise that resolves to the latest version number.
Changes are only made to the database if needed.

```ts
import createIndexeddatabase from "create-indexeddatabase" // or just copy the file

// creates the animals, plants, trees, and flowers datastores in the garden database. 
await createIndexeddatabase("garden", {
    animals: {keyPath: "id", autoIncrement: false},
    plants: {keyPath: "id", autoIncrement: true},
    trees: {autoIncrement: true},
    flowers: {}, // default = {keyPath: null, autoIncrement: false}
})
```

If you don't know what these options mean then look
at [here](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database).
The `createIndexeddatabase` function also accepts `Map` objects. There is a [create-indexeddatabase.ts](./create-indexeddatabase.ts)
and [create-indexeddatabase.js](./create-indexeddatabase.js) version.

## IndexedDBObjectStore Interface:

Now that you have a database you can interact with it using the `IndexedDBObjectStore` class. I have implemented most of
the methods
from [IDBObjectStore](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore) but none of the cursor/index
stuff (yet). This class automatically sets up transactions for you with
a [IDBDatabase](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase) object.

```ts
const key = "Test";
const data = 137;
const query = IDBKeyRange.lowerBound(100); // you can also pass strings as query

import IndexedDBObjectStore from "simple-indexeddb"

let store = await new IndexedDBObjectStore("my-db", "my-store")

// Properties
console.log(store.db, store.dbname, store.objectstorename)

// Instance Methods:
await store.add(data, key); // use to add key value pairs
await store.put(data, key); // use to update key value pairs

await store.add(data);
await store.put(data); // leave key out if your key mode allows it  

await store.get(key);
await store.getJson(key);
await store.delete(key);
await store.getAll();
await store.getAll(query);
await store.getAll(query, count);
await store.getKey(key);
await store.getAllKeys(); // all keys
await store.getAllKeys(query); // all keys that satisfy query
await store.getAllKeys(query, count);
await store.count();
await store.count(query);
await store.clear();

await store.close(); // Don't use it after closing 
delete store;

// specify create options if a store maybe doesn't exist
const mystoreai = await new IndexedDBObjectStore("my-db", "my-storeai", {autoIncrement: true, version: 2})
// if this creates a new store you have to increase the version again
const apples = await new IndexedDBObjectStore("my-db", "my-storeai", {autoIncrement: true, version: 3})
// its easier to use the createIndexeddatabase function to create databases.
```

Feel free to submit a pull request.
