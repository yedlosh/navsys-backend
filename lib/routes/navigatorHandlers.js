import * as navigators from "../entities/navigators";

// Navigators

export async function putNavigator(req, res, next) {
  const navigator = req.body;
  console.log(navigator);
  if(!navigator) {
    return res.status(400).json({ success: false, error: 'You have to send navigator object to update!'});
  }
  if(navigator.id !== req.params.id) {
    return res.status(400).json({ success: false, error: 'Inconsistent IDs in the request params and body'});
  }
  try {
    const result = await navigators.setNavigator(navigator);
    return res.json({success: true, id: result});
  } catch (error) {
    console.log({ error: 'Failed to get navigators: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to put navigator: ' + error, navigator});
  }
}

export async function getNavigator(req, res, next) {
  const id = req.params.id;
  try {
    const result = await navigators.getNavigator(id);
    return res.json({success: true, payload: result});
  } catch (error) {
    console.log({ error: 'Failed to get navigators: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to get navigators: ' + error, id});
  }
}

export async function getNavigators(req, res, next) {
  try {
    const result = await navigators.getNavigatorsArray();
    return res.json({success: true, payload: result});
  } catch (error) {
    console.log({ error: 'Failed to get navigators: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to get navigators: ' + error});
  }
}

export async function getActiveNavigators(req, res, next) {
  try {
    const activeNavigators = await navigators.getActiveNavigators();
    return res.json({success: true, payload: activeNavigators});
  } catch (error) {
    console.log({ error: 'Failed to get active navigators: ' + error});
    return res.status(500).json({ error: 'Failed to get active navigators: ' + error});
  }
}

export async function removeNavigator(req, res, next) {
  const id = req.params.id;
  try {
    const result = await navigators.removeNavigator(id);
    return res.json({success: true, removed: result});
  } catch (error) {
    console.log({ error: 'Failed to get navigators: ' + error});
    return res.status(500).json({ success: false, error: 'Failed to get navigators: ' + error, id});
  }
}
