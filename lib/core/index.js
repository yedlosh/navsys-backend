import Graph from 'node-dijkstra';
import * as navigators from '../entities/navigators';
import * as users from "../entities/users";
import * as locations from "../entities/locations";
import * as constants from "../constants";

export async function handleTrack(trackRequest, findLocation) {
  const {username: userId, time} = trackRequest;

  console.log("Tracking user " + userId);
  console.log(findLocation.message);
  let user = users.getUser(userId);

  if (!user) {
    console.error("Tracking error: Trying to track unregistered userId: " + userId);
    throw new Error("Tracking error: Trying to track unregistered userId: " + userId);
  } else {
    const location = await locations.getLocation(findLocation.location);

    if (location.id !== user.locationId){
      console.log("User " + userId + " reported location changed to: " + location.id);
      //Check if the location is one of the other neighbors of last location
      const userCheckpoint = await locations.getLocation(user.checkpointId);
      const lastLocation = await locations.getLocation(user.locationId);
      const lastLocationNeighbors = Object.keys(lastLocation.neighbors);

      if (lastLocationNeighbors.includes(location.id) || location.id === users.getNextPathLocationId(user, 2)) {
        if(users.verifyLocationStability(user, location.id, 0)){
          console.log("User " + userId + " did change location to: " + location.id);
          if (location.id === user.lastPathLocId ||
            location.id === users.getNextPathLocationId(user) ||
            location.id === users.getNextPathLocationId(user, 2)) {
            user = {...user, locationId: location.id, lastPathLocId: location.id};

            //Is there another location - Aren't we at the destination?
            if(location.id === user.destinationId){
              // Finish session
              console.log("User " + userId + " arrived to destination!");
              user = await stopAllUserNavigators(user);
              await users.removeUser(userId);

              return {...findLocation, name: location.name, finished: true};

            } else {
              //If we're at the next corner - checkpoint
              console.log("nextCheckpoint: " + users.getNextCheckpoint(user));
              if(location.id === user.checkpointId ||
                location.id === users.getNextCheckpoint(user) ||
                location.id === users.getNextCheckpoint(user, 2)) {
                console.log("User arrived to the next checkpoint");
                user = {...user, checkpointId: location.id};
                console.log("Shutting down prev nav");
                user = await shutdownPreviousNavigator(user);
                console.log("Playing Nav cue");
                user = await playNavAudioCueOnCurrentNavigator(user, location);
                console.log("Lighting up next nav");
                user = await lightUpNextCheckpoint(user);
              }
            }
          } else {
            //If the user took a wrong turn
            console.log("User is going in bad direction");
            user = {...user, locationId: location.id};

            // Shutdown all previously active navigators
            console.log("Shutting down all active navs");
            user = await stopAllUserNavigators(user);

            const previousLocationRecord = user.locationHistory.find(historyLoc => historyLoc.locationId !== user.locationId);
            const previousLocation = previousLocationRecord ? await locations.getLocation(previousLocationRecord.locationId) : null;
            const currentLocation = await locations.getLocation(user.locationId);

            // Navigate back with alert at the closest next checkpoint
            console.log("Navigating back with alert at the closest next checkpoint");
            const {checkpoint: checkpointAhead, neighbor: neighborAhead} = await findCheckpointAndClosestNeighborAhead(previousLocation, currentLocation);
            if(checkpointAhead) {
              console.log("checkpointAhead: " + checkpointAhead.id);
              const navigatorAhead = await navigators.getNavigator(checkpointAhead.navigatorId);
              user = await startUserNavigator(navigatorAhead, user, undefined, neighborAhead.id, true);
            } else {
              console.log("No navigator ahead!");
            }

            // Navigate at the previous checkpoint back to correct path
            console.log("Navigating at the previous checkpoint back to correct path");
            const uniqueLocationHistory = users.getUniqueLocationHistory(user);
            // console.log("uniqueLocationHistory " + JSON.stringify(uniqueLocationHistory));
            // const checkpointHistory = await uniqueLocationHistory.reduce(async (acc,locationRecord, index) => {
            //     let accum = await acc;
            //     const location = await locations.getLocation(locationRecord.locationId);
            //     console.log(JSON.stringify(location));
            //     if(location.navigatorId) {
            //       console.log('here');
            //       accum.push({
            //         location,
            //         index
            //       });
            //     }
            //     return accum;
            //   },
            //   []
            // );
            // console.log("checkpointHistory " + JSON.stringify(checkpointHistory));
            // const lastPassedCheckpoint = checkpointHistory[0].location;
            // const lastPassedNavigator = await navigators.getNavigator(lastPassedCheckpoint.navigatorId);
            // const from = uniqueLocationHistory[checkpointHistory[0].index - 1] ? uniqueLocationHistory[checkpointHistory[0].index - 1].locationId : location.id;
            // const to = (lastPassedCheckpoint.id === userCheckpoint.id) ? users.getNextPathLocationId(user) : uniqueLocationHistory[checkpointHistory[0].index + 1].locationId;
            //
            // user = await startUserNavigator(lastPassedNavigator, user, from, to);
            const {checkpoint: checkpointBehind, neighbor: neighborBehind} = await findCheckpointAndClosestNeighborAhead(currentLocation, previousLocation);

            console.log("checkpointBehind: " + checkpointBehind.id);
            const navigatorBehind = await navigators.getNavigator(checkpointBehind.navigatorId);

            const checkpointBehindHistoryIndex = uniqueLocationHistory.findIndex(historyLoc => historyLoc.locationId === checkpointBehind.id);
            const checkpointBehindPathIndex = user.path.findIndex(pathLoc => pathLoc === checkpointBehind.id);
            const to = (checkpointBehind.id === userCheckpoint.id) ? user.path[checkpointBehindPathIndex + 1] : uniqueLocationHistory[checkpointBehindHistoryIndex + 1].locationId;

            user = await startUserNavigator(navigatorBehind, user, neighborBehind.id, to);

            // Play wrong way cue at the previous checkpoint navigator
            console.log("Playing wrong way cue at the previous checkpoint navigator");
            navigators.audioCue(navigatorBehind, constants.NAV_AUDIO_CUES.wrong);
          }
        }
      } else {
        console.log("Jumped to different location");
        // const strongestSignal = users.getStrongestRSSI(trackRequest['wifi-fingerprint']);
        // //What if the location is off, but is really stable?
        //
        // if (users.verifyLocationStability(user, location.id, 3)
        //       && location.navigatorId
        //       && await navigators.getNavigator(location.navigatorId).mac === strongestSignal.mac) {
        //   // change user origin to this location, recalculate path
        //   console.log("NAV error: User is apparently somewhere totally off!");
        // }
        if (users.verifyLocationStability(user, location.id, 3)){
          console.log("Shutting down all active navs");
          user = await stopAllUserNavigators(user);

          if(location.id === user.destinationId) {
            // Finish session
            console.log("User " + userId + " arrived to destination!");
            await users.removeUser(userId);
            return {...findLocation, name: location.name, finished: true};
          }

          const path = getPath(await locations.getLocationsArray(), location.id, user.destinationId);
          const checkpoints = await users.getCheckpoints(path);
          user.path = path;
          user.locationId = location.id;
          user.checkpoints = checkpoints;
          user.checkpointId = checkpoints[0];

          const nextLocation = await locations.getLocation(users.getNextPathLocationId(user));
          const navigator = await navigators.getNavigator(location.navigatorId);

          user = await startUserNavigator(navigator, user, undefined, nextLocation.id);
          user = await lightUpNextCheckpoint(user);
        }
      }
    }
    // Save current location to locationHistory
    user = users.unshiftLocationHistory(user, location.id, time, trackRequest['wifi-fingerprint']);
    // Update location history, save with all other updates to user object to DB
    users.setUser(user);
    return {...findLocation, name: location.name};
  }
}

export async function startUserNavigator(navigator, user, fromId, toId, alert = false) {
  console.log("startUserNavigator: " + JSON.stringify(navigator));
  if (navigator) {
    const navResult = await navigators.navigate({
      navigator,
      user,
      from: fromId,
      to: toId,
      alert
    });
    if(navResult) {
      const unshiftedNavUser = users.unshiftUserActiveNavigators(user, navigator.id, fromId, toId);
      if(unshiftedNavUser) {
        //console.log("unshiftedNavUser " + JSON.stringify(unshiftedNavUser));
        user = unshiftedNavUser;
      } else {
        console.log("unshiftUserActiveNavigators returned undefined!");
      }
    }
  }
  return user;
}

export async function stopAllUserNavigators(user) {
  while(user.activeNavigators.length > 0) {
    const navigator = await navigators.getNavigator(user.activeNavigators.pop().id);
    if(navigator){
      navigators.stopNavigation(navigator, user.id);
    }
  }
  return user;
}

export async function shutdownPreviousNavigator(user) {
  if(user.activeNavigators.length > 1) {
    const prevNavigator = await navigators.getNavigator(user.activeNavigators.pop().id);
    if(prevNavigator){
      navigators.stopNavigation(prevNavigator, user.id);
    }
  }
  return user;
}

export async function playNavAudioCueOnCurrentNavigator(user, location) {
  const navigator = await navigators.getNavigator(location.navigatorId);
  //Sanity check if this location has navigator (but checkpoints should!)
  if(navigator) {
    if(!users.getNextCheckpoint(user)){
      navigators.audioCue(navigator, constants.NAV_AUDIO_CUES.closingIn);
    } else {
      navigators.audioCue(navigator, constants.NAV_AUDIO_CUES.chatter);
    }
  } else {
    console.error("Checkpoint without navigator!: " + location.id);
  }
  return user;
}

export async function lightUpCurrentCheckpoint(user) {
  if(user.checkpointId) {
    const checkpoint = await locations.getLocation(user.checkpointId);
    const navigator = await navigators.getNavigator(checkpoint.navigatorId);
    const checkpointIndex = user.path.indexOf(checkpoint.id);

    user = await startUserNavigator(navigator, user, user.path[checkpointIndex - 1], user.path[checkpointIndex + 1]);
  }
  return user;
}

export async function lightUpNextCheckpoint(user) {
  //const distance = user.locationId === user.checkpointId ? 1 : 0;

  if(users.getNextCheckpoint(user)) {
    const nextCheckpoint = await locations.getLocation(users.getNextCheckpoint(user));
    const nextNavigator = await navigators.getNavigator(nextCheckpoint.navigatorId);
    const nextCheckpointIndex = user.path.indexOf(nextCheckpoint.id);

    user = await startUserNavigator(nextNavigator, user, user.path[nextCheckpointIndex - 1], user.path[nextCheckpointIndex + 1]);
  }
  return user;
}

export async function findCheckpointAndClosestNeighborAhead(previousLocation, currentLocation) {
  if(!previousLocation || !currentLocation) return {checkpoint: null, neighbor: null};

  // Walk
  while(!currentLocation.navigatorId) {
    const neighborIds = Object.keys(currentLocation.neighbors);
    // corridor nodes should have only two neighbors - previous and the next
    let nextLocId = (neighborIds[0] === previousLocation.id) ? neighborIds[1] : neighborIds[0];
    if(nextLocId === currentLocation.id || nextLocId === previousLocation.id) {
      console.error("Failed getting closest checkpoint ahead! Could not determine the next node.");
      return null;
    }
    previousLocation = currentLocation;
    currentLocation = await locations.getLocation(nextLocId);

    if(!currentLocation) return {checkpoint: null, neighbor: null};
  }

  return {checkpoint: currentLocation, neighbor: previousLocation};
}

// This function calculates shortest path from start to destination
export function getPath(locationsArray, startLocationId, destinationLocationId){
  const locGraph = locationsArray.reduce(
    function(acc, location) {
      return {...acc, [location.id]: location.neighbors};
    },
    {});

  console.log("StartNode " + startLocationId);
  console.log("TargetNode " + destinationLocationId);
  const route = new Graph(locGraph);

  const path = route.path(startLocationId, destinationLocationId);
  console.log("Found Path: " + path);
  return path;
}
