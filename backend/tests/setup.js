const fs = require('fs').promises;
const path = require('path');

const DATA_FILE_PATH = path.resolve(__dirname, '../src/data.json')
const TEMP_FILE_PATH = path.resolve(__dirname, '../src/temp.json')

module.exports = async () => {
  console.log('\nWriting data to the temp file');
  try {
    const datafile = await fs.readFile(DATA_FILE_PATH)
    await fs.writeFile(TEMP_FILE_PATH, datafile)
  } catch (err) {
    console.error(err);
  }
};