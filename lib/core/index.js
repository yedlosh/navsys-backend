import Graph from 'node-dijkstra';
import * as navigators from '../entities/navigators';
import * as users from "../entities/users";
import * as locations from "../entities/locations";

export async function handleTrack(trackRequest, findLocation) {
  const {username: userId, time} = trackRequest;

  console.log("Tracking user " + userId);
  console.log(findLocation.message);

  let user = users.getUser(userId);

  if (!user) {
    //TODO Invalid request, tracked user should be already registered
    console.err("Tracking error: Trying to track unregistered userId: " + userId);
  } else {
    // Save current location to locationHistory
    user = users.unshiftLocationHistory(user, location, time, trackRequest['wifi-fingerprint']);

    const location = await locations.getLocation(findLocation.location);

    if (location.id !== user.locationId){
      //Check if the location is one of the other neighbors of last location
      const checkpointLocation = await locations.getLocation(user.checkpointId);
      const lastLocation = await locations.getLocation(user.locationId);
      const lastLocationNeighbors = Object.keys(lastLocation.neighbors);

      if (lastLocationNeighbors.includes(location.id) && users.verifyLocationStability(user, location.id, 3)) {
        if (location.id === users.getNextLocationId(user)) {
          //If the location is the same as the one user is heading to
          user = {...user, locationId: location.id, checkpointId: location.id};
          //Shutdown the previous navigator
          if(user.activeNavigators.length > 1) {
            const prevNavigator = await navigators.getNavigator(user.activeNavigators.pop());
            if(prevNavigator){
              navigators.stopNavigation(prevNavigator, userId);
            }
          }

          //Is there another location - Aren't we at the destination?
          if(users.getNextLocationId(user)){
            const nextLocation = locations.getLocation(users.getNextLocationId(user));
            const nextNavigator = await navigators.getNavigator(nextLocation.navigatorId);

            //Light up the next navigator
            if (nextNavigator) {
              navigators.navigate({
                nextNavigator,
                user,
                from: location.id,
                to: nextLocation.id
              });
              user = users.unshiftUserActiveNavigators(user, nextNavigator.id, location.id, nextLocation.id);
            }
          } else {
            console.log("User " + userId + "arrived to destination!");
            // TODO Show finish animation on current location navigator
          }
        } else {
          //If the user took a wrong turn

          //const checkpointLocationNeighbors = Object.keys(checkpointLocation.neighbors);
          //If we got one level from path
          //if(checkpointLocationNeighbors.includes(location.id)){}

          user = {...user, locationId: location.id};
          // Shutdown all previously active navigators
          while(user.activeNavigators.length > 0) {
            const prevNavigator = await navigators.getNavigator(user.activeNavigators.pop());
            if(prevNavigator){
              navigators.stopNavigation(prevNavigator, userId);
            }
          }
          // Navigate back with alert at the current location
          const currNavigator = await navigators.getNavigator(location.navigatorId);
          if (currNavigator) {
            user = {...user, activeNavigators: [{id:currNavigator.id, to: user.checkpointId},...user.activeNavigators]};
            navigators.navigate({
              currNavigator,
              user,
              to: lastLocation.id,
              alert: true
            });
            user = users.unshiftUserActiveNavigators(user, currNavigator.id, undefined, user.checkpointId);
          }
          const uniqueLocationHistory = users.getUniqueLocationHistory(user);
          // Navigate at the previous location from here to next path location
          const prevNavigator = await navigators.getNavigator(lastLocation.navigatorId);
          if (prevNavigator) {
            user = {...user, activeNavigators: [{id:currNavigator.id, to: user.checkpointId},...user.activeNavigators]};
            navigators.navigate({
              prevNavigator,
              user,
              from: location.id,
              to: (lastLocation.id === checkpointLocation.id) ? users.getNextLocationId(user) : uniqueLocationHistory[2].locationId,
            });
            user = users.unshiftUserActiveNavigators(user, currNavigator.id, undefined, user.checkpointId);
          }
        }
      } else {
        //What if the location is off, but is really stable?
        const strongestSignal = users.getStrongestRSSI(trackRequest['wifi-fingerprint']);

        if (users.verifyLocationStability(user, locationId, 3) && navigator && navigator.mac === strongestSignal.mac) {
          // TODO change user origin to this location, recalculate path
          console.log("NAV error: User is apparently somewhere totally off!");
        }
      }
    }
    // Update location history, save with all other updates to user object to DB
    users.setUser(user);
  }
  return findLocation;
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
