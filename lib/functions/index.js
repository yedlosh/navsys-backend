import axios from 'axios';
import * as config from '../config';

export function hello(req, res, next) {
    res.json({notes: "Hello World"});
}

export function findTrack(req, res, next) {
  //console.log(JSON.stringify(req.body));
  const { username, time } = req.body;
  axios.post(config.FIND_SERVER_URL + '/track', req.body)
    .then( response => {
      //console.log("Response: " + JSON.stringify(response.data));
      res.send(response.data);
      handleTrack(username, response.data);
      return next();
    })
    .catch( error => {
      console.log("Error: " + error);
      return next(error);
    });
}

function handleTrack(user, locationData) {
  console.log("Tracking user " + user);
  console.log(locationData.message);
}
