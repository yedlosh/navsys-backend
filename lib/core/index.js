import Graph from 'node-dijkstra';
import * as navigators from '../entities/navigators';
import * as users from "../entities/users";
import * as locations from "../entities/locations";

export async function handleTrack(trackRequest, findLocation) {
  const {username: userId, time} = trackRequest;

  console.log("Tracking user " + userId);
  console.log(findLocation.message);

  let user = users.getUser(userId);
  const currentLocation = await locations.getLocation(user.locationId);
  const locationId = findLocation.location;
  const location = await locations.getLocation(locationId);
  let navigator;
  if(location.navigator) {
    navigator = await navigators.getNavigator(location.navigatorId);
  }

  if (!user) {
    //TODO Invalid request, tracked user should be already registered
    console.err("Tracking error: Trying to track unregistered userId: " + userId);
  } else {
    //Check if the location is one of the other neighbors of current location -> user is lost
    const currentLocationNeighbors = Object.keys(currentLocation.neighbors);

    if (currentLocationNeighbors.includes(locationId) && users.verifyLocationStability(user, locationId, 2)) {

      if (locationId === users.getNextLocationId(user)) {
        //If the location is the same as the one user is heading to
        user = {...user, locationId: users.getNextLocationId(user)};
        if (location.navigator) {
          if (navigator) {
            navigators.navigate({
              navigator,
              user,
              from: users.getPreviousLocationId(user),
              to: users.getNextLocationId(user)
            });
          }
        }
      } else if (locationId !== user.locationId) {
        //If the user took a wrong turn
        if (location.navigator) {
          if (navigator) {
            navigators.navigate({
              navigator,
              user,
              to: currentLocation.id,
              alert: true
            });
          }
        }
      }
    } else {
      //The reported location is from somewhere off, but really stable
      const strongestSignal = users.getStrongestRSSI(trackRequest['wifi-fingerprint']);

      if (users.verifyLocationStability(user, locationId, 3) && navigator && navigator.mac === strongestSignal.mac) {
        // TODO change user origin to this location, recalculate path
        console.log("NAV error: User is apparently somewhere totally off!");
      }
    }
    // Save location to history
    users.setUser(users.addToLocationHistory(user, location, time, trackRequest['wifi-fingerprint']));
  }
}

// This function calculates shortest path from start to destination
export function getPath(locationsArray, startLocationId, destinationLocationId){
  console.log("locationsArray:" + JSON.stringify(locationsArray));

  const locGraph = locationsArray.reduce(
    function(acc, location) {
      return {...acc, [location.id]: location.neighbors};
    },
    {});

  console.log("locGraph:" + JSON.stringify(locGraph));
  console.log("locationsArray:" + JSON.stringify(locationsArray));
  const route = new Graph(locGraph);

  return route.path(startLocationId, destinationLocationId);
}
