import * as core from "../core/index";
import * as locations from "./locations";
import * as helpers from "../helpers/index";
import * as constants from "../constants";
import range from 'lodash/range';

/*
User schema
-----------
String id : {
  id: string
  originId: string,
  destinationId: string,
  locationId: string,
  path: ['string'],
  activeNavigators: [
    {
      id: string,
      from: string,
      to: string
    }
  ]
  locationHistory: [
    {
      timestamp: UNIX timestamp,
      locationId,
      fingerprint[mac]: Number rssi
    }
  ]
}
*/

//Store user requests only in memory for now - do we even need to persist users to file?
let users = {
  "yedlosh": {
    id: "yedlosh",
    originId: "mydesk",
    destinationId: "lobby",
    locationId: "matejdesk",
    checkpointId: "matejdesk",
    colorId: 5,
    path: ["mydesk", "matejdesk", "lobby"],
    activeNavigators: [],
    locationHistory: []
  }
};

let takenColors = [];

export async function registerUser(userId, originId, destinationId) {
  if (users[userId]) {
    console.error("UserID already taken");
    return null;
  }

  const user = {
    id: userId,
    originId,
    destinationId,
    locationId: originId,
    checkpointId: originId,
    colorId: getNextColor(),
    path: core.getPath(await locations.getLocationsArray(), originId, destinationId),
    activeNavigators: [],
    locationHistory: []
  };

  setUser(user);

  return user;
}

export function getUser(id) {
  if(users[id]) {
    return {...users[id]}
  } else {
    return undefined;
  }
}

export function getUsers() {
  return {...users};
}

export function setUser(user) {
  users = {...users, [user.id]: {...user}};
}

export function removeUser(id) {
  const user = users[id];
  if (!user) {
    return false;
  }
  // Free taken color
  takenColors = takenColors.filter(item => item !== user.colorId);
  users[id] = undefined;
  return true;
}

export function getNextLocationId(user) {
  return user.path[user.path.indexOf(user.checkpointId) + 1];
}

export function getPreviousLocationId(user) {
  return user.path[user.path.indexOf(user.checkpointId) - 1];
}

export function getRGBColor(user) {
  return helpers.hexToRgb(constants.KELLY_COLORS_HEX[user.colorId]);
}

export function getHashColor(user) {
  return '#' + constants.KELLY_COLORS_HEX[user.colorId].slice(2);
}

export function getNextColor() {
  if (takenColors.length === helpers.kelly_colors_hex) {
    //TODO What if we run out of free colors?
    console.error("Color pool drained!");
    return null;
  }
  //const freeColorIndex = [...Array(constants.KELLY_COLORS_HEX.length).keys()].find(index => takenColors.indexOf(index) < 0);
  const freeColorIndex = range(constants.KELLY_COLORS_HEX.length).find(index => takenColors.indexOf(index) < 0);

  takenColors.push(freeColorIndex);
  return freeColorIndex;
}

export function unshiftLocationHistory(user, locationId, timestamp, fingerprint) {
  const macDictionary = fingerprint.reduce(function (acc, item) {
    return {...acc, [item.mac]: item.rssi};
  }, {});
  return {...user, locationHistory: [{timestamp, id: locationId, fingerprint: macDictionary}, ...user.locationHistory]};
}

export function getStrongestRSSI(fingerprint) {
  let maxRSSI = Number.MIN_SAFE_INTEGER;
  let mac;
  fingerprint.forEach(reading => {
    if (reading.rssi > maxRSSI) {
      maxRSSI = reading.rssi;
      mac = reading.mac;
    }
  });
  return mac ? {mac, rssi: maxRSSI} : undefined;
}

export function verifyLocationStability(user, locationId, depth) {
  if(user.locationHistory.length < depth) {
    return false;
  }

  for (let i = 0; i < depth; i++) {
    if (user.locationHistory[i].id !== locationId) {
      return false;
    }
  }
  return true;
}

export function unshiftUserActiveNavigators(user, id, from, to) {
  if(user && id) {
    return {...user, activeNavigators: [{id, from, to}, ...user.activeNavigators]};
  } else {
    return undefined;
  }
}

export function getUniqueLocationHistory(user) {
  if(user && user.locationHistory.length > 0){
    return user.locationHistory.reduce((acc, record) => {
      if(acc.length === 0){
        return [{...record}];
      } else if(acc[acc.length - 1].locationId === record.locationId){
        return acc;
      } else {
        return [...acc, {...record}];
      }
    },[]);
  }
  return undefined;
}
