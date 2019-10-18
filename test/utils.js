function now() {
  return Math.round(new Date().getTime() / 1000).toString();
}

module.exports = {
  now
};
