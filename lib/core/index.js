import * as navigators from '../entities/navigators';
import * as users from "../entities/users";
import * as locations from "../entities/locations";

export function handleTrack(trackRequest, findLocation) {
  const {userId, time} = trackRequest;
  console.log("Tracking user " + username);
  console.log(findLocation.message);
  let user = users.getUser[userId];
  const locationId = findLocation.location;
  const location = locations.getLocation(locationId);

  if (!user) {
    //TODO Invalid request, tracked user should be already registered
    //users[userId] = {userId, locationHistory: [{timestamp: time, location}]};
  } else {
    console.log(user);
    console.log(user.locationHistory[0]);
    if (locationId !== user.locationHistory[0].id) {
      const navigator = navigators.getNavigator(location.navigator);
      if (navigator) {
        navigators.navigate({
          navigator,
          user,
          origin: users.getPreviousLocation(user),
          target: users.getNextLocation(user)
        });
      }
    }
    users.setUser(users.addToLocationHistory(user, location, time, trackRequest.wifi-fingerprint));
  }
}

// This function calculates shortest path from start to destination
export function getPath(locations, start, destination){
  // TODO Tarjan's shortest path - weighted edges
}
