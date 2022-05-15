const randomIntNumber = function () {
  const MULTIPLE = 10000;
  return Math.floor(Math.random() * MULTIPLE);
}

module.exports = {
  randomIntNumber
}