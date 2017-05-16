import * as db from "../db";
import * as constants from "../constants";
import {omit} from 'lodash';

/*
Location schema
---------------
String id: {
  id: string,
  name: string,
  navigatorId: string,
  isDestination: boolean
  neighbors: {
    [locationId]: Number distance
  }
}
*/

export async function putLocation(location) {
  if(!location.id || !location.name) {
    return undefined;
  }

  location.isDestination = location.isDestination || false;
  location.neighbors = location.neighbors || {};

  const existingLoc = await getLocation(location.id);
  await updateNeighbors(existingLoc, location);

  return setLocation(location);
}

async function updateNeighbors(originalLocation , newLocation) {
  if(originalLocation) {
    const newNeighbors = Object.keys(newLocation.neighbors);
    const oldNeighbors = Object.keys(originalLocation.neighbors);
    const removedNeighbors = oldNeighbors.filter(neighbor => !newNeighbors.includes(neighbor));

    removedNeighbors.forEach(async (neighborId) => {
      const neighboringLocation = await getLocation(neighborId);

      const updatedNeighbors = omit(neighboringLocation.neighbors, newLocation.id);
      const updatedLocation = {...neighboringLocation, neighbors: updatedNeighbors};

      await setLocation(updatedLocation);
    });
  }

  Object.keys(newLocation.neighbors).forEach(async (key) => {
    const neighboringLocation = await getLocation(key);

    const updatedNeighbors = {...neighboringLocation.neighbors, [newLocation.id]: newLocation.neighbors[key]};
    const updatedLocation = {...neighboringLocation, neighbors: updatedNeighbors};

    await setLocation(updatedLocation);
  });
}

export async function getLocation(id) {
  return db.get(constants.DB_COLLECTION_NAME_LOCATIONS, id);
}

export async function getLocationsById() {
  return db.getAll(constants.DB_COLLECTION_NAME_LOCATIONS);
}

export async function getLocationsArray() {
  const locations = await getLocationsById();
  return Object.keys(locations).map(key => locations[key]);
}

export async function getDestinationsArray() {
  const locationsArray = await getLocationsArray();
  return locationsArray.filter(location => location.isDestination);
}

// BEWARE: No checking and update of neighbors here!
export async function setLocation(location) {
  return db.set(constants.DB_COLLECTION_NAME_LOCATIONS, location.id, location);
}

export async function removeLocation(locationId) {
  // If location object was passed in instead of only id
  locationId = locationId.id || locationId;

  const location = await getLocation(locationId);

  if(location) {
    Object.keys(location.neighbors).forEach(async (key) => {
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
