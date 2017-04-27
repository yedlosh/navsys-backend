import axios from 'axios';
import * as config from '../config';
import * as find from '../find';
import * as core from '../core';
import * as users from "../entities/users";
import * as locations from "../entities/locations";


export function hello(req, res, next) {
    res.json({notes: "Hello World"});
}

export function findLearn(req, res, next) {
  axios.post(config.FIND_SERVER_URL + '/learn', req.body)
    .then( response => {
      console.log("Response: " + JSON.stringify(response.data));
      res.send(response.data);
      return next();
    })
    .catch( error => {
      console.log("Error: " + error);
      return next(error);
    });
}

export async function track(req, res, next) {
  const trackData = req.body;
  const findLocation = await find.findTrack(trackData);
  res.send(findLocation);
  core.handleTrack(trackData, findLocation);
  return next();
}

export async function startNavigation(req, res, next) {
  const {userId, destination} = req.body;
  const findLocation = await find.findTrack(req.body);
  let user = users.registerUser({
    userId,
    origin: findLocation,
    destination
  });
  const path = core.getPath(locations.getLocations(), user.origin, user.destination);
  users.setUser({...user, path});

  //TODO Set user color

  //TODO Respond
}
