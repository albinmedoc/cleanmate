import struct from 'python-struct';
import fs from 'fs';
import { createCanvas } from 'canvas';

const track = Buffer.from('AQkhADIxNjEoMSgwOTA4MDgvNS81MisyKzNMM0w0LjQuNUw1TDZINkg3TDdJN0kyQjJDMkMxRjFFMUUwQzBEMEQ2PjZENg==', 'base64');
const path = struct.unpack('<' + 'b'.repeat(track.length - 4), track.slice(4));

const map = Buffer.from('AAAAAAAAZABk0ssAVUDTAAFaw6qUAAVU0QDEqqQABqXQAAHDqqmkABalqNAApsWqpsKqgM8AAsiqkM8ACprHqpDQAArHqpDQACrFqpmqkNQAFVqhqpDWAAFVUND4AA==', 'base64');
const d = struct.unpack('<' + 'b'.repeat(map.length), map);

const full: Array<Array<string>> = Array.from(Array(200), () => Array(100).fill('.'));
let akt = 0;
let i = 0;

const placebyte = (by: number) => {
  let pair = by;
  if((pair & 0b10) === 0b10) {
    // white
    full[Math.floor((akt + 3) / 100)][((akt + 3) % 100)] = '_';
  } else if((pair & 0b01) === 0b01) {
    // white
    full[Math.floor((akt + 3) / 100)][((akt + 3) % 100)] = '0';
  }
  pair = by >> 2;
  if((pair & 0b10) === 0b10) {
    // white
    full[Math.floor((akt + 2) / 100)][((akt + 2) % 100)] = '_';
  } else if((pair & 0b01) === 0b01) {
    // white
    full[Math.floor((akt + 2) / 100)][((akt + 2) % 100)] = '0';
  }
  pair = by >> 4;
  if((pair & 0b10) === 0b10) {
    // white
    full[Math.floor((akt + 1) / 100)][((akt + 1) % 100)] = '_';
  } else if((pair & 0b01) === 0b01) {
    // white
    full[Math.floor((akt + 1) / 100)][((akt + 1) % 100)] = '0';
  }
  pair = by >> 6;
  if((pair & 0b10) === 0b10){
    // white
    full[Math.floor(akt / 100)][(akt % 100)] = '_';
  } else if((pair & 0b01) === 0b01) {
    // white
    full[Math.floor(akt / 100)][(akt % 100)] = '0';
  }
};

while(i < d.length) {
  if(i >= 9) {
    // header
    if((d[i].valueOf() as number & 0b11000000) === 0b11000000) {
      // run length
      let mul = d[i].valueOf() as number & 0b00111111;
      // print("single mul",mul, d[i+1])
      if((d[i + 1].valueOf() as number & 0b11000000) === 0b11000000) {
        // double encoded
        // print("double mul")
        i += 1;
        mul <<= 6;
        mul |= (d[i].valueOf() as number & 0b00111111);
      }
      // print("mul", mul)
      // repeat byte afterwards
      // print("repeat", d[i+1])
      for (let x = 0; x < mul; x++) {
        placebyte(d[i + 1].valueOf() as number);
        akt += 4;
      }
      // print("akt at ",akt)
      i += 1;
    } else {
      // print(d[i])
      placebyte(d[i].valueOf() as number);
      // print(b)
      akt = akt + 4;
    }
  }
  console.log('akt at ', akt);
  i += 1;
}

const walls: Array<[number, number]> = [];
const floors: Array<[number, number]> = [];

full.forEach((l, idy) => {
  l.forEach((r, idx) => {
    if(r === '0') {
      walls.push([idx, idy]);
    } else if(r === '_') {
      floors.push([idx, idy]);
    }
  });
});

const canvas = createCanvas(100*10, 200*10);
const ctx = canvas.getContext('2d');

function plot(x: number, y: number) {
  ctx.fillRect(x*10, y*10, 10, 10);
}

console.log('Walls', walls.length);
console.log('Floors', floors.length);

walls.forEach((coordinate) => {
  ctx.fillStyle = 'red';
  plot(coordinate[0], coordinate[1]);
});

floors.forEach((coordinate) => {
  ctx.fillStyle = 'green';
  plot(coordinate[0], coordinate[1]);
});

ctx.beginPath();
ctx.moveTo((path[0].valueOf() as number)*10, (path[1].valueOf() as number)*10);
for(let i = 2; i < path.length-1; i+=2) {
  const x = (path[i].valueOf() as number)*10;
  const y = (path[i+1].valueOf() as number)*10;
  ctx.lineTo(x, y);
}
ctx.lineWidth = 3;
ctx.strokeStyle = 'orange';
ctx.stroke();

const out = fs.createWriteStream(__dirname + '/my_file.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log('The PNG file was created.'));

const out2 = fs.createWriteStream(__dirname + '/test.txt');
const k: Array<[number, number]> = [];
for(let i = 2; i < path.length-1; i+=2) {
  const x = path[i].valueOf() as number;
  const y = path[i+1].valueOf() as number;
  k.push([x, y]);
  out2.write([x, y].toString());
  out2.write('\n');
}

out2.on('finish', () => console.log('The txt file was created.'));
