import axios from 'axios';

let navigators = {
  "mydesk": {
    name: "mydesk",
    ip: "172.17.17.192:5000",
    //"IP": "192.168.50.1:5000",
    mac: "e8:4e:06:20:0a:d7",
    strip: {
      "matejdesk": 0,
      "luckadesk": 1
    }
  }
};

export function setNavigator(navigator) {
  navigators[navigator.name] = navigator;
}

export function getNavigator(id) {
  return navigators[id];
}

export function removeNavigator(id) {
  navigators[id] = undefined;
}

export function navigate({navigator, userId, color, origin, target, alert}) {
  axios.post("http://" + navigator.ip + '/navigate',
    {
      userId,
      color,
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
