import axios from 'axios';
import * as db from "../db";
import * as users from "../entities/users";
import * as constants from "../constants";

/*
Navigator schema
 String id: {
    id: string,
    ip: string,
    mac: string,
    strip: {
        String locationId: Number stripEndingId,
    }
 }
 */

export function createNavigator() {
  //Is this one needed?
}

export async function getNavigator(id) {
  return db.get(constants.DB_COLLECTION_NAME_NAVIGATORS, id);
}

export async function setNavigator(navigator) {
  return db.set(constants.DB_COLLECTION_NAME_NAVIGATORS, navigator.id, navigator);
}

export async function removeNavigator(navigatorId) {
  // If location object was passed in instead of only id
  navigatorId = navigatorId.id || navigatorId;

  return db.remove(constants.DB_COLLECTION_NAME_NAVIGATORS, navigatorId);
}

export function navigate({navigator, user, origin, target, alert}) {
  axios.post("http://" + navigator.ip + '/navigate',
    {
      userId: user.id,
      color: users.getRGBColor(user),
      origin: navigator.strip[origin],
      target: navigator.strip[target],
      alert: alert || false
    })
  .then( response => {
    console.log("Response: " + JSON.stringify(response.data));
  })
  .catch( error => {
    console.log("Navigator navigate error: " + error);
  });
}

export function stopNavigation({navigator, userId}) {
  axios.post("http://" + navigator.ip + '/stop',
    {
      userId,
    })
    .then( response => {
      console.log("Response: " + JSON.stringify(response.data));
    })
    .catch( error => {
      console.log("Navigator stopNavigation error: " + error);
    });
}
