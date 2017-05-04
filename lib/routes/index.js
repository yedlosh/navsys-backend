import axios from 'axios';
import * as config from '../config';
import * as find from '../find';
import * as core from '../core';
import * as users from "../entities/users";
import * as locations from "../entities/locations";


export function hello(req, res, next) {
    res.json({notes: "Hello World"});
    next();
}

export async function learn(req, res, next) {
  res.send(await find.findLearn(req.body));
  return next();
}

export async function track(req, res, next) {
  const trackRequest = req.body;

  if(config.MAC_FILTERING) {
    // TODO filter out only valid MAC addresses - presumably navigator MACs and maybe Eduroam APs
  }

  const findLocation = await find.findTrack(trackRequest);

  const trackResponse = core.handleTrack(trackRequest, findLocation);
  res.json(trackResponse);
  return next();
}

export async function startNavigation(req, res, next) {
  const regRequest = req.body;
  const {username: userId, destination} = regRequest;
  let findLocation = await find.findTrack(regRequest);
  const user = await users.registerUser(userId, findLocation.location, destination);
  users.unshiftLocationHistory(user, findLocation, regRequest);

  const response = {...findLocation, color: users.getRGBColor(user)};
  res.json(response);
  return next();
}

export async function cancelNavigation(req, res, next) {
  const {username: userId} = req.body;
  try {
    const user = await users.getUser(userId);
  } catch (error) {
    return res.status(404).json({ error: 'User not found: ' + error});
  }

  // TODO Clear all active navigators?!

  try {
    await users.removeUser(userId);
  } catch (error) {
    return res.status(500).json({ error: 'Could not remove user: ' + error});
  }
}
