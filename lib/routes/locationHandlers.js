import * as locations from "../entities/locations";

// Locations

// export async function createLocation(req, res, next) {
//   const location = req.body;
//   if(!location) {
//     return res.status(400).json({ success: false, error: 'You have to send location object to create!'});
//   }
//   try {
//     const existing = await locations.getLocation(location.id);
//     if(existing) {
//       return res.status(400).json({ success: false, error: 'Location with that ID already exists!'});
//     }
//     const result = await locations.addLocation(location);
//     return res.json({success: true, result});
//   } catch (error) {
//     console.log({ error: 'Failed to create location: ' + error});
//     return res.status(500).json({ success: false, error: 'Failed to create location: ' + error, location});
//   }
// }

export async function putLocation(req, res, next) {
  const location = req.body;
  if(!location) {
    return res.status(400).json({ success: false, error: 'You have to send location object to update!'});
  }
  try {
    if(location.id && location.name) {
      const result = await locations.putLocation(location);
      return res.json({success: true, result: result});
    } else {
      return res.status(400).json({ success: false, error: 'Location has to have id and name parameters!', location});
    }
  } catch (error) {
    console.log({ error: 'Failed to put location: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to put location: ' + error, location});
  }
}

export async function getLocation(req, res, next) {
  const id = req.params.id;
  try {
    const result = await locations.getLocation(id);
    if(result) {
      return res.json({success: true, payload: result});
    } else {
      throw new Error('Location not found!');
    }
  } catch (error) {
    console.log({ error: 'Failed to get location: ' + error, id});
    return res.status(500).json({ success: false, error: 'Failed to get location: ' + error, id});
  }
}

export async function getLocations(req, res, next) {
  try {
    const result = await locations.getLocationsArray();
    return res.json({success: true, payload: result});
  } catch (error) {
    console.log({ error: 'Failed to get locations: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to get locations: ' + error});
  }
}

export async function getDestinations(req, res, next) {
  try {
    const destinations = await locations.getDestinationsArray();
    return res.json({success: true, payload: destinations});
  } catch (error) {
    console.log({ error: 'Failed to get destinations: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to get destinations' + error});
  }
}

export async function removeLocation(req, res, next) {
  const id = req.params.id;
  try {
    const result = await locations.removeLocation(id);
    return res.json({success: true, removed: result});
  } catch (error) {
    console.log({ error: 'Failed to remove location: ' + error, id});
    return res.status(500).json({ success: false, error: 'Failed to remove location: ' + error, id});
  }
}
