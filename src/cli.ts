#!/usr/bin/env node
import arg from 'arg';
import path from 'path';
import CleanmateMap from './cleanmateMap';
import CleanmateService from './cleanmateService';

const args = arg({
  // Types
  '--version': Boolean,
  '--port': Number,
  '--workMode': Number,
  '--mopMode': String,
  '--room': [Number],
  '--regions': Boolean,
  '--robot': Boolean,
  '--charger': Boolean,
  '--track': Boolean,
  '--filename': String,

  // Aliases
  '-v': '--version',
  '-p': '--port',
  '-w': '--workMode',
  '-m': '--mopMode',
});

if(args._.length === 0 && args['--version']){
  console.log('1.0.2');
  process.exit(0);
}

if(args._.length < 3) {
  process.exit(1);
}

// Get ipAddress, auth code and the command
const [ipAddress, authCode, cmd] = args._;

// Setup defaults
/* const {
  '--port': port = 8888,
} = args; */

if(!['start', 'pause', 'charge', 'status', 'volume', 'find', 'map'].includes(cmd)) {
  process.exit(1);
}
const cleanmateService = new CleanmateService(ipAddress, authCode);
cleanmateService.connect().then(() => {
  let promise: Promise<void> | undefined;
  switch (cmd) {
    case 'start':
      if(args['--room']){
        promise = cleanmateService.cleanRooms(args['--room']);
        break;
      }
      if(args['--workMode']) {
        promise = cleanmateService.start(args['--workMode']);
        break;
      }
      promise = cleanmateService.start();
      break;
    case 'pause':
      promise = cleanmateService.pause();
      break;
    case 'charge':
      promise = cleanmateService.charge();
      break;
    case 'status':
      promise = new Promise((resolve, reject) => {
        cleanmateService.addListener('statusChange', (status) => {
          console.log(JSON.stringify(status));
          resolve();
        });
        cleanmateService.pollStatus().catch((err) => reject(err));
      });
      break;
    case 'volume':
      break;
    case 'find':
      promise = cleanmateService.findRobot();
      break;
    case 'map':
      promise = new Promise((resolve, reject) => {
        cleanmateService.addListener('mapChange', (mapData) => {
          const map = new CleanmateMap(mapData);
          if(args['--regions']) {
            map.drawRegions();
          }
          if(args['--regions']) {
            map.drawRegions();
          }
          if(args['--robot']) {
            map.drawRobot();
          }
          if(args['--charger']) {
            map.drawCharger();
          }
          if(args['--track']) {
            map.drawTrack();
          }
          const fileName = args['--filename'] ?? path.join(process.cwd(), 'mapOutput.png');
          map.exportMapAsPNG(fileName).then(() => resolve()).catch((err) => reject(err));
        });
        cleanmateService.pollMap().catch((err) => reject(err));
      });
      break;
    default:
      break;
  }
  promise?.then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
});
