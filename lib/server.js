'use strict';
//Polyfill needed because of the ES2016 code and babel-register runmode
import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as config from './config';
import * as clientHandlers from './routes/clientHandlers';
import * as navigatorHandlers from './routes/navigatorHandlers';
import * as locationHandlers from './routes/locationHandlers';
import * as db from "./db";
import * as testHandlers from "./routes/testHandlers";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Client routes
app.get('/hello', clientHandlers.hello);
app.post('/track', clientHandlers.track);
app.post('/learn', clientHandlers.learn);
app.post('/register', clientHandlers.register);
app.post('/cancel', clientHandlers.cancelNavigation);

// CRUD API Navigator and Location entities
// Navigators
app.put('/navigators/:id', navigatorHandlers.putNavigator);
app.get('/navigators/active', navigatorHandlers.getActiveNavigators);
app.get('/navigators/:id', navigatorHandlers.getNavigator);
app.get('/navigators/', navigatorHandlers.getNavigators);
app.delete('/navigators/:id', navigatorHandlers.removeNavigator);

// Locations
//app.post('/locations/', locationHandlers.createLocation);
app.put('/locations/:id', locationHandlers.putLocation);
app.get('/locations/destinations', locationHandlers.getDestinations);
app.get('/locations/:id', locationHandlers.getLocation);
app.get('/locations/', locationHandlers.getLocations);
app.delete('/locations/:id', locationHandlers.removeLocation);

//Testing endpoints
app.post('/registertest', testHandlers.registerTest);
app.post('/tracktest', testHandlers.trackTest);

app.listen(config.PORT, config.HOST, () => {
  console.log(`Backend server runs on port: ${config.PORT}!`);
});

//Instantiate DBs on start, as otherwise there was an issue with first write saving
db.instantiateDBs().catch(function(error){
  console.error("Failed to pre instantiate DBs!: " + error);
});
