export const FIND_ENDPOINT_TRACK = '/track';
export const FIND_ENDPOINT_LEARN = '/learn';

export const KELLY_COLORS_HEX = [
  '0xFFB300', // Vivid Yellow
  '0x803E75', // Strong Purple
  '0xFF6800', // Vivid Orange
  '0xA6BDD7',//Very Light Blue
  //'0xC10020', // Vivid Red
  '0xCEA262', // Grayish Yellow
  //'0x817066', // Medium Gray
  //The following don't work well for people with defective color vision
  '0x007D34', // Vivid Green
  '0xF6768E', // Strong Purplish Pink
  '0x00538A',// Strong Blue
  '0xFF7A5C', // Strong Yellowish Pink
  '0x53377A',// Strong Violet
  '0xFF8E00', // Vivid Orange Yellow
  '0xB32851', //Strong Purplish Red
  '0xF4C800', //Vivid Greenish Yellow
  '0x7F180D', //Strong Reddish Brown
  '0x93AA00', //Vivid Yellowish Green
  '0x593315', //Deep Yellowish Brown
  '0xF13A13', //Vivid Reddish Orange
  '0x232C16', //Dark Olive Green
];

export const DB_COLLECTION_NAME_USERS = 'users';
export const DB_COLLECTION_NAME_LOCATIONS = 'locations';
export const DB_COLLECTION_NAME_NAVIGATORS = 'navigators';

export const DB_COLLECTION_NAMES = [DB_COLLECTION_NAME_LOCATIONS,DB_COLLECTION_NAME_NAVIGATORS];

export const NAV_AUDIO_CUES = {
  wrong: 'cue_wrong',
  affirm: 'cue_affirm',
  goLeft: 'cue_left',
  goRight: 'cue_right',
  goStraight: 'cue_straight',
  closingIn: 'cue_closingin',
  chatter: 'cue_chatter'
};
