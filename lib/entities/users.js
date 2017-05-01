import * as core from "../core/index";
import * as locations from "./locations";
import * as helpers from "../helpers/index";
import * as constants from "../constants";
import range from 'lodash/range';

/* User schema
String id : {
  originId: string,
  destinationId: string,
  locationId: string,
  path: ['string'],
  locationHistory: [
    {
      timestamp: UNIX timestamp,
      locationId,
      fingerprint[mac]: Number rssi
    }
  ]
}
*/

//Store user requests only in memory for now - do we even need to persist users?
let users = {
  "yedlosh": {
    id: "yedlosh",
    originId: "mydesk",
    destinationId: "lobby",
    locationId: "matejdesk",
    colorId: 5,
    path: ["mydesk", "matejdesk", "lobby"],
    locationHistory: []
  }
};

let takenColors = [];


export async function registerUser(userId, origin, destination){
  console.log("Users: " + JSON.stringify(users));
  if(users[userId]){
    console.error("UserID already taken");
    return null;
  }

  const user = {
    id: userId,
    origin,
    destination,
    path: core.getPath(await locations.getLocationsArray(), origin, destination),
    colorId: getNextColor(),
    locationHistory: []
  };
  setUser(user);
  return user;
}

export function getUser(id) {
  return users[id];
}

export function getUsers() {
  return users;
}

export function setUser(user) {
  users = {...users, [user.id]: user};
}

export function removeUser(id) {
  const user = users[id];
  if(!user){
    return false;
  }
  // Free taken color
  takenColors = takenColors.filter(item => item !== user.colorId);
  users[id] = undefined;
  return true;
}

export function getNextLocation(user) {
 return user.path[user.path.indexOf(user.locationId) + 1];
}

export function getPreviousLocation(user) {
  return user.path[user.path.indexOf(user.locationId) -1];
}

export function getRGBColor(user) {
  return helpers.hexToRgb(helpers.kelly_colors_hex[user.colorId]);
}

export function getNextColor(){
  if(takenColors.length === helpers.kelly_colors_hex) {
    //TODO What if we run out of free colors?
    console.error("Color pool drained!");
    return null;
  }
  //const freeColorIndex = [...Array(constants.KELLY_COLORS_HEX.length).keys()].find(index => takenColors.indexOf(index) < 0);
  const freeColorIndex = range(constants.KELLY_COLORS_HEX.length).find(index => takenColors.indexOf(index) < 0);

  takenColors.push(freeColorIndex);
  return freeColorIndex;
}

export function addToLocationHistory(user, locationId, timestamp, fingerprint){
  const macDictionary = fingerprint.reduce(function(acc, item) {return {...acc, [item.mac]: item.rssi};}, {});
  return {...user, locationHistory: [{timestamp, id: locationId, fingerprint: macDictionary}, ...user.locationHistory]};
}
