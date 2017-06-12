import * as locations from "../entities/locations";
import * as users from "../entities/users";
import * as core from "../core/index";


export async function registerTest(req, res, next){
  const {username, locationId, destination} = req.body;
  try {
    const location = await locations.getLocation(locationId);
    console.log("Location:" + JSON.stringify(location));

    let user = await users.registerUser(username, locationId, destination);
    if(user) {
      user = users.unshiftLocationHistory(user, locationId, 0, []);
      const nextLocation = await locations.getLocation(users.getNextPathLocationId(user));
      const navigator = await navigators.getNavigator(location.navigatorId);

      user = await core.startUserNavigator(navigator, user, undefined, nextLocation.id);
      user = await core.lightUpNextCheckpoint(user);

      users.setUser(user);
      console.log("Register response: " + JSON.stringify(user));
      res.json(user);
    } else {
      throw new Error("User session with this ID already exists!");
    }
  } catch (error){
    console.log({ error: 'Failed to process register request: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to process register request: ' + error});
  }
}

export async function trackTest(req, res, next){
  const {username, locationId} = req.body;
  try {
    const trackResponse = await core.handleTrack({username, 'wifi-fingerprint': []}, {location: locationId, message: locationId});
    //console.log("Response:" + trackResponse);
    const user =  await users.getUser(username);
    res.json({trackResponse, user});
  } catch (error) {
    console.log({ error: 'Failed to process track request: ' + error});
    return res.status(500).json({ error: 'Failed to process track request: ' + error});
  }
}
