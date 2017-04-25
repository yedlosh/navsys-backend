import {users} from "../entities/users";
import {navigate, navigators} from '../entities/navigators';

export function handleTrack(username, time, locationData) {
  console.log("Tracking user " + username);
  console.log(locationData.message);
  let user = users[username];
  const location = locationData.location;

  if (!user) {
    users[username] = {username, locationHistory: [{timestamp: time, location}]};
  } else {
    console.log(user);
    console.log(user.locationHistory[0]);
    if (location != user.locationHistory[0].location) {
      const navigator = navigators[location];
      if (navigator && navigator.ip) {
        navigate(navigator, user);
      }
    }
    users[username].locationHistory.unshift({timestamp: time, location});
  }
}
