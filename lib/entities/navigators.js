import axios from 'axios';
import * as db from "../db";
import * as users from "../entities/users";
import * as constants from "../constants";

/*
Navigator schema
----------------
 String id: {
    id: string,
    ip: string,
    mac: string,
    strip: {
        String locationId: Number stripEndingId,
    }
 }
 */

let activeNavigators = {};

export function addNavigator() {
  //Is this one needed?
}

export async function getNavigator(id) {
  return db.get(constants.DB_COLLECTION_NAME_NAVIGATORS, id);
}

export async function getNavigatorsById() {
  return db.getAll(constants.DB_COLLECTION_NAME_NAVIGATORS);
}

export async function getNavigatorsArray() {
  const navigators = await getNavigatorsById();
  return Object.keys(navigators).map(key => navigators[key]);
}

export async function getActiveNavigators() {
  const activeNavigatorIds = Object.keys(activeNavigators);
  const navigatorsArray = await getNavigatorsArray();
  let filteredNavigators = navigatorsArray.filter(navigator => activeNavigatorIds.includes(navigator.id));
  return filteredNavigators.map(navigator => {return {...navigator, users: activeNavigators[navigator.id]}});
}

export async function setNavigator(navigator) {
  return db.set(constants.DB_COLLECTION_NAME_NAVIGATORS, navigator.id, navigator);
}

export async function removeNavigator(navigatorId) {
  // If location object was passed in instead of only id
  navigatorId = navigatorId.id || navigatorId;

  return db.remove(constants.DB_COLLECTION_NAME_NAVIGATORS, navigatorId);
}

export async function navigate({navigator, user, from, to, alert}) {
  let result;
  try {
    console.log(`Activating navigator:  ${navigator.id} from: ${from} to ${to}`);
    result = await axios.post("http://" + navigator.ip + '/navigate',
      {
        userId: user.id,
        color: users.getRGBColor(user),
        from: navigator.strip[from],
        to: navigator.strip[to],
        alert: alert || false
      });
      if(result.success){
        activeNavigators = {...activeNavigators, [navigator.id]: [...activeNavigators[navigator.id], user.id]};
      }
    return result;
  } catch(error) {
    console.log("Navigator navigate error: " + error);
    return false;
  }
}

export function stopNavigation(navigator, userId) {
  axios.post("http://" + navigator.ip + '/stop',
    {
      userId,
    })
    .then( response => {
      console.log("Response: " + JSON.stringify(response.data));
      if(response.success){
        activeNavigators = {...activeNavigators, [navigator.id]: activeNavigators[navigator.id].filter(userid => userid !== userId)};
      }
    })
    .catch( error => {
      console.log("Navigator stopNavigation error: " + error);
    });
}
