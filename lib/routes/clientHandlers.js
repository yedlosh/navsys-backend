import axios from 'axios';
import * as config from '../config';
import * as find from '../find';
import * as core from '../core';
import * as users from "../entities/users";
import * as locations from "../entities/locations";


export function hello(req, res, next) {
    res.json({notes: "Hello World"});
}

export async function learn(req, res, next) {
  res.send(await find.findLearn(req.body));
}

export async function track(req, res, next) {
  let trackRequest = req.body;
console.log(trackRequest);
  if(config.MAC_FILTERING) {
    // TODO filter out only valid MAC addresses - presumably navigator MACs and maybe Eduroam APs
  }

  // Add server set items to trackRequest for FIND
  trackRequest = {...trackRequest, group: config.FIND_SERVER_GROUP};

  try {
    //console.log("Request:" + trackRequest);
    const findLocation = await find.findTrack(trackRequest);
    //console.log("Location FIND:" + JSON.stringify(findLocation));
    const trackResponse = await core.handleTrack(trackRequest, findLocation);
    //console.log("Response:" + trackResponse);
    res.json(trackResponse);
  } catch (error) {
    console.log({ error: 'Failed to process track request: ' + error});
    return res.status(500).json({ error: 'Failed to process track request: ' + error});
  }
}

export async function register(req, res, next) {
  const regRequest = req.body;
  const {username: userId, destination, time} = regRequest;
  try {
    const findRequest = {...regRequest, group: config.FIND_SERVER_GROUP};
    let findLocation = await find.findTrack(findRequest);

    console.log("FIND Location:" + JSON.stringify(findLocation));

    if(findLocation.success){
      const location = await locations.getLocation(findLocation.location);
      console.log("Location:" + JSON.stringify(location));

      if(location.id !== destination) {
        const user = await users.registerUser(userId, findLocation.location, destination);
        if(user) {
          console.log("User:" + JSON.stringify(user));
          users.unshiftLocationHistory(user, location.id, time, regRequest['wifi-fingerprint']);

          const response = {...findLocation, name: location.name, color: users.getHashColor(user)};
          res.json(response);
        } else {
          throw new Error("User session with this ID already exists!");
        }
      } else {
        throw new Error("Destination is identical to starting location!");
      }

    } else {
      throw new Error("FIND Location lookup failed" + findLocation.error);
    }
  } catch (error){
    console.log({ error: 'Failed to process register request: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to process register request: ' + error});
  }
}

export async function cancelNavigation(req, res, next) {
  const {username: userId} = req.body;
  try {
    const user = await users.getUser(userId);
  } catch (error) {
    return res.status(404).json({ success: false, error: 'User not found: ' + error});
  }
  // TODO Clear all active navigators?!

  try {
    await users.removeUser(userId);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not remove user: ' + error});
  }
  console.log("Cancelled navigation for userID: " + userId);
  res.json({success: true})
}
