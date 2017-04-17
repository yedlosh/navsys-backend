'use strict';
require('dotenv').config();
const express = require('express');
import * as config from './config';
import * as functions from './functions';

const app = express();

app.get('/', functions.hello);

app.listen(config.PORT, config.HOST, () => {
  console.log(`Server runs on port: ${config.PORT}!`);
});
