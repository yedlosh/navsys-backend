import axios from 'axios';
import * as config from '../config';
import * as find from '../find';
import * as core from '../core';


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

  const {username, time} = req.body;
  core.handleTrack(username, time, response.data);
  return next();
}
