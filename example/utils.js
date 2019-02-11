function serialize(obj) {
  function sortAndClean(obj) {
    const keys = Object.keys(obj).sort();
    const sorted = {};

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];

      if (value === null) {
        continue;
      }

      if (value.constructor === Object) {
        value = sortAndClean(value);
      }

      sorted[key] = value;
    }

    return sorted;
  }
  return JSON.stringify(sortAndClean(obj));
}

module.exports = { serialize };
