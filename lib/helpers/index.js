
/**
 https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
 * h is in range [0 - 360]
 * s, and v are contained in range [0 - 1]
 * returns r, g, and b in range [0 - 255]
 */
export function hsvToRgb({h, s, v}){
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch(i % 6){
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function hexToRgb(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r,g,b];
}

export const kelly_colors_hex = [
  '0xFFB300', // Vivid Yellow
  '0x803E75', // Strong Purple
  '0xFF6800', // Vivid Orange
  '0xA6BDD7',//Very Light Blue
  //'0xC10020', // Vivid Red
  '0xCEA262', // Grayish Yellow
  '0x817066', // Medium Gray
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
