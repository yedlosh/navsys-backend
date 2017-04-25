import axios from 'axios';
import * as config from '../config';

export function findTrack(trackRequest) {
  return axios.post(config.FIND_SERVER_URL + '/track', trackRequest)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log("Error: " + error);
      return null;
    });
}
