const fs = require("fs");

async function removeRedundantFiles(directory) {
  return fs.promises.unlink(directory);
}

module.exports = {
  removeRedundantFiles
}