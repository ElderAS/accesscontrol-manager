class Entry {
  constructor(data, options = {}) {
    Object.assign(this, data);
    Object.defineProperty(this, "isOwner", {
      value: options.isOwner,
      writable: false
    });
  }
}

module.exports = Entry;
