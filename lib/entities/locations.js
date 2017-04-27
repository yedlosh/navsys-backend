let locations = {
  "mydesk": {
    name: "My Desk",
    navigator: "mydesk",
    neighbors: {
      "matejdesk": 3,
      "luckadesk": 5
    }
  },
  "matejdesk": {
    name: "Matej's Desk",
    neighbors: {
      "mydesk": 3,
      "lobby": 6,
      "luckadesk": 6
    }
  },
  "lobby": {
    name: "Lobby",
    neighbors: {
      "matejdesk": 6
    }
  },
  "luckadesk": {
    name: "Lucka's desk",
    neighbors: {
      "matejdesk": 6,
      "mydesk": 5
    }
  }
};

export function getLocations() {
  return locations;
}
