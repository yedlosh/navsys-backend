let locations = {
  "mydesk": {
    id: "mydesk",
    name: "My Desk",
    navigator: "mydesk",
    neighbors: {
      "matejdesk": 3,
      "luckadesk": 5
    }
  },
  "matejdesk": {
    id: "matejdesk",
    name: "Matej's Desk",
    neighbors: {
      "mydesk": 3,
      "lobby": 6,
      "luckadesk": 9
    }
  },
  "lobby": {
    id: "lobby",
    name: "Lobby",
    neighbors: {
      "matejdesk": 6
    }
  },
  "luckadesk": {
    id: "luckadesk",
    name: "Lucka's desk",
    neighbors: {
      "matejdesk": 6,
      "mydesk": 5
    }
  }
};

export function createLocation() {
  // TODO put into locations and link edges with neighbors
}

export function getLocation(id) {
  return locations[id];
}

export function getLocationsById() {
  return locations;
}

export function getLocationsArray() {
  return Object.keys(locations).map( key => locations[key]);
}

export function setLocation(location) {
  locations[location.id] = location;
}

export function removeLocation(location) {
  // TODO Unlink from neighbors and remove from locations
}
