import path from 'path';
import trivialdb from 'trivialdb';
import * as constants from "../constants";

let dbInstances = {};

async function getDBInstance(collectionName) {
  if(!dbInstances[collectionName]) {
    console.log("Instantiating DB: " + collectionName);
    dbInstances[collectionName] = trivialdb.db(
      collectionName,{
        // Save db in project root
        rootPath: path.resolve('./db')
      });
    await dbInstances[collectionName].loading;
  }
  return dbInstances[collectionName];
}

export async function instantiateDBs(){
  constants.DB_COLLECTION_NAMES.forEach(async function(name) {await getDBInstance(name)});
}

//Async CRUD DB interface
export async function set(collectionName, key, value) {
  const db = await getDBInstance(collectionName);
  return db.save(key, value);
}

export async function setAllByKeys(collectionName, kvObject) {
  Object.keys(kvObject).forEach(async function(key) {
    await save(collectionName, kvObject[key].id , kvObject[key]);
  });
}

export async function get(collectionName, key) {
  const db = await getDBInstance(collectionName);
  return db.load(key);
}

export async function getAll(collectionName) {
  const db = await getDBInstance(collectionName);
  return {...db.values};
}

export async function find(collectionName, predicate) {
  const db = await getDBInstance(collectionName);
  return db.filter(predicate);
}

export async function remove(collectionName, key) {
  const db = await getDBInstance(collectionName);
  return db.remove({id: key});
}


export async function demoPopulateDB(){
  const users = {
    "yedlosh": {
      id: "yedlosh",
      origin: "mydesk",
      destination: "lobby",
      location: "matejdesk",
      colorId: 5,
      path: ["mydesk", "matejdesk", "lobby"],
      locationHistory: []
    }
  };

  const locations = {
    "mydesk": {
      id: "mydesk",
      name: "My Desk",
      navigator: "mydesk",
      neighbors: {
        "matejdesk": 3,
        "luckadesk": 5
      }
    },
    "matejdesk": {
      id: "matejdesk",
      name: "Matej's Desk",
      neighbors: {
        "mydesk": 3,
        "lobby": 6,
        "luckadesk": 9
      }
    },
    "lobby": {
      id: "lobby",
      name: "Lobby",
      neighbors: {
        "matejdesk": 6
      }
    },
    "luckadesk": {
      id: "luckadesk",
      name: "Lucka's desk",
      neighbors: {
        "matejdesk": 6,
        "mydesk": 5
      }
    }
  };

  const navigators = {
    "mydesk": {
      id: "mydesk",
      ip: "172.17.17.192:5000",
      //"IP": "192.168.50.1:5000",
      mac: "e8:4e:06:20:0a:d7",
      strip: {
        "matejdesk": 0,
        "luckadesk": 1
      }
    }
  };
  await setAllByKeys(constants.DB_COLLECTION_NAME_USERS, users);
  await setAllByKeys(constants.DB_COLLECTION_NAME_LOCATIONS, locations);
  await setAllByKeys(constants.DB_COLLECTION_NAME_NAVIGATORS, navigators);
}
