# accesscontrol-manager

[![Build Status](https://travis-ci.org/ElderAS/accesscontrol-manager.svg?branch=master&style=flat-square)](https://travis-ci.org/ElderAS/accesscontrol-manager)
[![npm](https://img.shields.io/npm/dt/accesscontrol-manager.svg?style=flat-square)](https://www.npmjs.com/package/accesscontrol-manager)
[![npm](https://img.shields.io/npm/v/accesscontrol-manager.svg?style=flat-square)](https://www.npmjs.com/package/accesscontrol-manager)

Clean and verify all your CRUD operations in one place.

### Requirements

- [AccessControl](https://github.com/onury/accesscontrol)

### Installation

`npm install --save accesscontrol-manager`

### Usage

```js
const AccesscontrolManager = require('accesscontrol-manager')({
  //...options
})

let data = AccesscontrolManager.read({
  acl: acl, //AccessControl object
  user: user,
  query: () => [QUERYDATA],
  isOwnerFunc: () => true,
  resource: 'Movie',
})
```

### Methods

| Method           | Description      |
| ---------------- | ---------------- |
| .create(options) | Call on creation |
| .read(options)   | Call on read     |
| .update(options) | Call on update   |
| .delete(options) | Call on delete   |

### Options

| Key                                   | Type                                                    | Description                                                                                                                                                            | Scope              | Example                                                               |
| ------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| `resource`                            | String                                                  | Name of resource                                                                                                                                                       | all                | `"Movie"`                                                             |
| `user`                                | Object                                                  | Requesting entity (User in most cases)                                                                                                                                 | all                | -                                                                     |
| `acl`                                 | [AccessControl](https://github.com/onury/accesscontrol) | Scoped accesscontol object                                                                                                                                             | all                | `acl.can('admin')`                                                    |
| `query`                               | Function                                                | Function that returns Promise/Array/Object from storage                                                                                                                | read/update/delete | `() => DB.fetch("...")`                                               |
| `data`                                | Array/Object                                            | Data to be created/updated                                                                                                                                             | create/update      | -                                                                     |
| `isOwnerFunc`                         | Function(doc, user)                                     | Function that resolves ownership of document and returns true/false                                                                                                    | all                | `(doc, user) => doc.owner === user.id`                                |
| `createFunc`                          | Function(data, meta)                                    | Function that creates the new document. `data` has been filtered by AccessControl. Meta contains information about ownership                                           | create             | `(data, meta) => new Movie(data).save()`                              |
| `updateFunc`                          | Function(doc, data, meta)                               | Function that updates the document. `doc` is the document that is beeing updated. `data` has been filtered by AccessControl. Meta contains information about ownership | update             | `(doc, data, meta) => { PartialUpate(doc, data); return doc.save() }` |
| `deleteFunc`                          | Function(doc, meta)                                     | Function that deletes the document. `doc` is the document that is beeing deleted. Meta contains information about ownership                                            | delete             | `(doc, meta) => doc.remove()`                                         |
| `transformFunc` or `preTransformFunc` | Function(data)                                          | Function that transforms the result before running it through the ACL filter                                                                                           | all                | `(data) => { data.someProp = 'test'; return data }`                   |
| `postTransformFunc`                   | Function(data)                                          | Function that transforms the result after running it through the ACL filter                                                                                            | all                | `(data) => { data.someProp = 'test'; return data }`                   |
| `documentPath`                        | String                                                  | Selector(string) to extract data from query result. E.g. use this when working with pagination                                                                         | all                | `docs`                                                                |

## License

[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) Carsten Jacobsen
