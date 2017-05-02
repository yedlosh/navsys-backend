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
  const findLocation = await find.findTrack(trackRequest);

  core.handleTrack(trackRequest, findLocation);
  res.json(findLocation);
  return next();
}

export async function startNavigation(req, res, next) {
  const regRequest = req.body;
  const {userId, destination} = regRequest;
  let findLocation = await find.findTrack(regRequest);
  const user = await users.registerUser(userId, findLocation, destination);
  users.addToLocationHistory(user, findLocation, regRequest);

  const response = {...findLocation, color: users.getRGBColor(user)};
  res.json(response);
  return next();
}
