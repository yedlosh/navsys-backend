import * as navigators from '../entities/navigators';

export function handleTrack(trackData, findLocation) {
  const {userId, time} = trackData;
  console.log("Tracking user " + username);
  console.log(findLocation.message);
  let user = users[userId];
  const location = locationData.location;

  if (!user) {
    users[userId] = {userId, locationHistory: [{timestamp: time, location}]};
  } else {
    console.log(user);
    console.log(user.locationHistory[0]);
    if (location != user.locationHistory[0].location) {
      const navigator = navigators.getNavigator(location);
      if (navigator && navigator.ip) {
        navigators.navigate({navigator, user});
      }
    }
    users[username].locationHistory.unshift({timestamp: time, location});
  }
}

// This function calculates shortest path from start to destination
export function getPath(locations, start, destination){

}
