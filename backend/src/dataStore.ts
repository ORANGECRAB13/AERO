import { Data } from './interfaces';
import fs from 'fs';

// writes data in
//  - data.json when running the server regularly,
//  - data.test.json when running tests
const dataFile = './src/data.json';

let data: Data = {
  users: [],
  missions: [],
  astronauts: [],
  sessions: [],
  launches: [],
  launchVehicles: []
};

// creates a datafile.
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
// loads data into memory when the server starts running
data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

/**
 * Return the data object
 * @returns { Data } the data object
 */
function getData(): Data {
  return data;
}

/**
 * Stores new data in memory, then write it into a json file
 * @param newData - The data to update
 */
function setData(newData: Data) {
  data = newData;
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
}

export { getData, setData };
