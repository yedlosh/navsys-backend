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
    console.error("Tracking error: Trying to track unregistered userId: " + userId);
    throw new Error("Tracking error: Trying to track unregistered userId: " + userId);
  } else {
    console.log("User:" + JSON.stringify(user));
    const location = await locations.getLocation(findLocation.location);
    // Save current location to locationHistory
    user = users.unshiftLocationHistory(user, location.id, time, trackRequest['wifi-fingerprint']);

    if (location.id !== user.locationId){
      console.log("User reported location changed to:" + location.name);
      //Check if the location is one of the other neighbors of last location
      const checkpointLocation = await locations.getLocation(user.checkpointId);
      const lastLocation = await locations.getLocation(user.locationId);
      const lastLocationNeighbors = Object.keys(lastLocation.neighbors);

      if (lastLocationNeighbors.includes(location.id) && users.verifyLocationStability(user, location.id, 2)) {
        console.log("User really changed location to:" + location.name);
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
              const navResult = await navigators.navigate({
                nextNavigator,
                user,
                from: location.id,
                to: nextLocation.id
              });
              if(navResult) {
                user = users.unshiftUserActiveNavigators(user, nextNavigator.id, location.id, nextLocation.id);
              }
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
            const navResult = await navigators.navigate({
              navigator: currNavigator,
              user: user,
              to: lastLocation.id,
              alert: true
            });
            if(navResult) {
              console.log("wat");
              user = users.unshiftUserActiveNavigators(user, currNavigator.id, undefined, user.checkpointId);
            }
          }
          const uniqueLocationHistory = users.getUniqueLocationHistory(user);
          // Navigate at the previous location from here to next path location
          const prevNavigator = await navigators.getNavigator(lastLocation.navigatorId);
          if (prevNavigator) {
            const navResult = await navigators.navigate({
              navigator: prevNavigator,
              user: user,
              from: location.id,
              to: (lastLocation.id === checkpointLocation.id) ? users.getNextLocationId(user) : uniqueLocationHistory[2].locationId,
            });
            if(navResult) {
              user = users.unshiftUserActiveNavigators(user, currNavigator.id, location.id, user.checkpointId);
            }
          }
        }
      } else {
        // TODO This whole section..
        console.log("In the totally off section");

        const strongestSignal = users.getStrongestRSSI(trackRequest['wifi-fingerprint']);
        //What if the location is off, but is really stable?

        if (users.verifyLocationStability(user, location.id, 3)
              && location.navigatorId
              && await navigators.getNavigator(location.navigatorId).mac === strongestSignal.mac) {
          // TODO change user origin to this location, recalculate path
          console.log("NAV error: User is apparently somewhere totally off!");
        }
      }
    }
    // Update location history, save with all other updates to user object to DB
    users.setUser(user);
    return {...findLocation, name: location.name};
  }
}

// This function calculates shortest path from start to destination
export function getPath(locationsArray, startLocationId, destinationLocationId){
  const locGraph = locationsArray.reduce(
    function(acc, location) {
      return {...acc, [location.id]: location.neighbors};
    },
    {});

  console.log("locGraph:" + JSON.stringify(locGraph));
  console.log("StartNode " + startLocationId);
  console.log("TargetNode " + destinationLocationId);
  const route = new Graph(locGraph);

  const path = route.path(startLocationId, destinationLocationId);
  console.log("Found Path: " + path);
  return path;
}
