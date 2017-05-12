import axios from 'axios';
import * as config from '../config';
import * as constants from "../constants";

export function findTrack(trackRequest) {
  return findPostRequest(constants.FIND_ENDPOINT_TRACK, trackRequest);
}

export function findLearn(learnRequest) {
  return findPostRequest(constants.FIND_ENDPOINT_LEARN, learnRequest);
}

function findPostRequest(endpoint, request) {
  return axios.post(config.FIND_SERVER_URL + endpoint, request)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log("Error: " + error);
      return null;
    });
}
