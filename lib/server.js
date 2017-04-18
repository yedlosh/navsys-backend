'use strict';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import * as config from './config';
import * as functions from './functions';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', functions.hello);
app.post('/track', functions.findTrack);



app.listen(config.PORT, config.HOST, () => {
  console.log(`Server runs on port: ${config.PORT}!`);
});
