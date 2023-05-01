# simple-indexedDB

A simple indexedDB wrapper.

## Usage

```js
import IndexeDBObjectStore from "IndexeDBObjectStore"
// or just copy the code into your file its only ~200 lines of code

const store = await new IndexeDBObjectStore("my-db", "my-store")
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
DBOpenRequest.onsuccess = event => {db = DBOpenRequest.result;};

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
import IndexeDBObjectStore from "IndexeDBObjectStore.ts"

const store = await new IndexeDBObjectStore("my-db", "my-store")
await store.put('test', 137)
console.log(await store.get('test')) // 137
```

This is useful for instance when you need to store data from within a service worker/web worker. Using this class also
makes it a lot harder to run into uncommited transactions.

The class is only
about ~200 lines of code, and you could take out the methods you don't need. This allows for just dropping the code in
your project without having to install it as a dependency. There is a [simple-indexedb.ts](./simple-indexedb.ts)
and [simple-indexedb.js](./simple-indexedb.js) version.

## Interface:

I have implemented most of the methods
from [IDBObjectStore](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore) but none of the cursor/index
stuff (yet).

```ts
const key = "Test";
const data = 137;
const query = IDBKeyRange.lowerBound(100); // you can also pass strings as query

import IndexeDBObjectStore from "IndexeDBObjectStore.ts"

const store = await new IndexeDBObjectStore("my-db", "my-store")

// Instance Methods:
await store.add(key, data); // use to add key value pairs
await store.put(key, data); // use to update key value pairs
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

// Properties
console.log(store.db, store.dbname, store.objectstorename)
```

Feel free to submit a pull request.