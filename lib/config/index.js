require('dotenv').config();

// App general config
export const HOST = process.env.HOST || '0.0.0.0';
export const PORT = process.env.PORT || 3000;
export const MAC_FILTERING = process.env.MAC_FILTERING || false;

// FIND Server
export const FIND_SERVER_URL = process.env.FIND_SERVER_URL;
export const FIND_GROUP = process.env.FIND_GROUP;
