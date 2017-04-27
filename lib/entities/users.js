import * as core from "../core/index";
import * as locations from "./locations";
import { range } from 'lodash/range';
import * as helpers from "../helpers/index";

// User model
// id : {origin: string, destination: string, location: string, path: ['string'], locationHistory: [{timestamp, locationId, fingerprint[mac]: rssi}] }

let users = {
  "yedlosh": {
    userId: "yedlosh",
    origin: "mydesk",
    destination: "lobby",
    location: "matejdesk",
    colorId: 5,
    path: ["mydesk", "matejdesk", "lobby"],
    locationHistory: []
  }
};

let takenColors = [];


export function registerUser(userId, destination, origin){
  const user = {
    userId,
    origin,
    destination,
    path: core.getPath(locations.getLocations(), origin, destination),
    color: getNextColor(),
    locationHistory: []
  };
  setUser(user);
}

export function getUser(id) {
  return users[id];
}

export function setUser(user) {
  users[user.userId] = user;
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
 return user.path[user.path.indexOf(user.location) + 1];
}

export function getPreviousLocation(user) {
  return user.path[user.path.indexOf(user.location) -1];
}

export function getRGBColor(user) {
  return helpers.hexToRgb(helpers.kelly_colors_hex[user.color]);
}

export function getNextColor(){
  if(takenColors.length === helpers.kelly_colors_hex) {
    //TODO What if we run out of free colors?
    console.error("Color pool drained");
    return null;
  }
  const freeColorIndex = range(helpers.kelly_colors_hex.length).find(index => takenColors.indexOf(index) < 0);

  takenColors.push(freeColorIndex);
  return freeColorIndex;
}

export function addToLocationHistory(user, locationId, timestamp, fingerprint){
  const macDictionary = fingerprint.reduce(function(acc, item) {return {...acc, [item.mac]: item.rssi};}, {});
  return {...user, locationHistory: [{timestamp, id: locationId, fingerprint: macDictionary}, ...user.locationHistory]};
}
