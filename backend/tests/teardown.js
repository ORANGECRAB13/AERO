const fs = require('fs').promises;
const path = require('path');

const DATA_FILE_PATH = path.resolve(__dirname, '../src/data.json')
const TEMP_FILE_PATH = path.resolve(__dirname, '../src/temp.json')

module.exports = async () => {
  console.log('\nTeardown: Writing data back to the data file');
  try {
    const datafile = await fs.readFile(TEMP_FILE_PATH)
    await fs.writeFile(DATA_FILE_PATH, datafile)
    await fs.unlink(TEMP_FILE_PATH);
  } catch (err) {
    console.error(err);
  }
};