import axios from 'axios';

export const navigators = {
  "mydesk": {
    "name": "mydesk",
    //"ip": "172.17.17.192:5000"
    "ip": "192.168.50.1:5000"
  }
};

export function navigate(navigator, user) {
  console.log("Navigating " + user.username + " at " + navigator.ip);
  axios.get("http://" + navigator.ip + '/navigate')
  .then( response => {
    console.log("Response: " + JSON.stringify(response.data));
  })
  .catch( error => {
    console.log("Error: " + error);
  });
}
