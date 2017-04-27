// User model
// id : {origin: string, destination: string, location: string, path: ['string'], locationHistory: [{timestamp, location, fingerprint[mac]: rssi}] }

let users = {
  "yedlosh": {
    userId: "yedlosh",
    origin: "mydesk",
    destination: "lobby",
    location: "matejdesk",
    path: ["mydesk", "matejdesk", "lobby"],
    locationHistory: []
  }
};

export function registerUser({userId, destination, origin}){
  return users[userId] = {
    userId,
    origin,
    destination
  }
}

export function setUser(user) {
  users[user.userId] = user;
}

export function getUser(id) {
  return users[id];
}

export function removeUser(id) {
  users[id] = undefined;
}

export function getNextLocation(user) {
 return user.path[user.path.indexOf(user.location) + 1];
}

export function getPreviousLocation(user) {
  return user.path[user.path.indexOf(user.location) -1];
}
