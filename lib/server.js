'use strict';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import * as config from './config';
import * as routes from './routes';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', routes.hello);
app.post('/track', routes.track);
app.post('/learn', routes.findLearn);
app.post('/start', routes.startNavigation);



app.listen(config.PORT, config.HOST, () => {
  console.log(`Server runs on port: ${config.PORT}!`);
});
