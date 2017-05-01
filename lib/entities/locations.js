import * as db from "../db";
import * as constants from "../constants";

/*
Location schema
---------------
String id: {
  id: string,
  name: string,
  navigatorId: string,
  neighbors: {
    [locationId]: Number distance
  }
}
*/

export async function addLocation(location) {
  Object.keys(location.neighbors).forEach(async function(key) {
    const neighboringLocation = await getLocation(key);

    const updatedNeighbors = {...neighboringLocation.neighbors, [location.id]: location.neighbors[key]};
    const updatedLocation = {...neighboringLocation, neighbors: updatedNeighbors};

    await setLocation(updatedLocation);
  });

  return setLocation(location);
}

export async function getLocation(id) {
  return db.get(constants.DB_COLLECTION_NAME_LOCATIONS, id);
}

export async function getLocationsById() {
  return db.getAll(constants.DB_COLLECTION_NAME_LOCATIONS);
}

export async function getLocationsArray() {
  const locations = await getLocationsById();
  return Object.keys(locations).map( key => locations[key]);
}

export async function setLocation(location) {
  return db.set(constants.DB_COLLECTION_NAME_LOCATIONS, location.id, location);
}

export async function removeLocation(locationId) {
  // If location object was passed in instead of only id
  locationId = locationId.id || locationId;

  const location = await getLocation(locationId);

  if(location) {
    Object.keys(location.neighbors).forEach(async function (key) {
      const neighboringLocation = await getLocation(key);
      // Sanity check - if DB is consistent should be always true
      if (neighboringLocation.neighbors[location.id]) {
        let updatedNeighbors = {...neighboringLocation.neighbors};
        delete updatedNeighbors[location.id];
        const updatedLocation = {...neighboringLocation, neighbors: updatedNeighbors};

        await setLocation(updatedLocation);
      }
    });

    return db.remove(constants.DB_COLLECTION_NAME_LOCATIONS, location.id);
  } else {
    return [];
  }
}
