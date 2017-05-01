'use strict';
//Polyfill needed because of the ES2016 code and babel-register runmode
import 'babel-polyfill';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import * as config from './config';
import * as routes from './routes';
import * as users from "./entities/users";
import * as db from "./db";
import * as locations from "./entities/locations"

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', routes.hello);
app.post('/track', routes.track);
app.post('/learn', routes.findLearn);
app.post('/start', routes.startNavigation);

//Testing endpoints
const lobbyLoc = {
  id: "lobby",
  name: "Lobby",
  neighbors: {
    "matejdesk": 6
  }
};

app.get('/test', async function(req, res, next){
  res.header('Content-Type', 'application/json');
  try {
    //res.send(users.registerUser("dement","lobby","luckadesk"));
    //console.log(JSON.stringify(await locations.getLocationsById()));
    //const origLocations = await locations.getLocationsById();
    const result = await locations.removeLocation(lobbyLoc);
    //const updatedLocations = await locations.getLocationsById();
    //res.json({ originalCollection: origLocations, newLocations: updatedLocations});
    res.json({result: result});
  } catch (error) {
    console.error("Unhandled rejection: " + error);
  }
  next();
});


app.listen(config.PORT, config.HOST, () => {
  console.log(`Server runs on port: ${config.PORT}!`);
});

//Instantiate DBs on start, as otherwise there was an issue with first write saving
db.instantiateDBs().catch(function(error){
  console.error("Failed to pre instantiate DBs!: " + error);
});
