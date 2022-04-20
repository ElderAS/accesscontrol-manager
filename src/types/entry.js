class Entry {
  constructor(data, options = {}) {
    Object.assign(this, data)

    Object.defineProperty(this, 'isOwner', {
      value: options.isOwner,
      writable: false,
    })

    if (options.source) {
      Object.defineProperty(this, '$source', {
        value: options.source,
        writable: false,
      })
    }
  }
}

module.exports = Entry
