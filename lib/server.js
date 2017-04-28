'use strict';
//Polyfill needed because of the ES2016 code and babel-register runmode
import 'babel-polyfill';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import * as config from './config';
import * as routes from './routes';
import * as users from "./entities/users";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', routes.hello);
app.post('/track', routes.track);
app.post('/learn', routes.findLearn);
app.post('/start', routes.startNavigation);

//Testing endpoints
app.get('/test', function(req, res, next){
  res.header('Content-Type', 'application/json');
  res.send(users.registerUser("dement","lobby","luckadesk"));
  next();
});



app.listen(config.PORT, config.HOST, () => {
  console.log(`Server runs on port: ${config.PORT}!`);
});
