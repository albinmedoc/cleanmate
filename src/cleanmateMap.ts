import fs from 'fs';
import path from 'path';
import struct from 'python-struct';
import { createCanvas, Canvas, CanvasRenderingContext2D, JPEGStream, PNGStream, loadImage, Image } from 'canvas';
import { MapData, Point } from './types';

export type Color = string | CanvasGradient | CanvasPattern;

class CleanmateMap {
  private mapData: MapData;
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private scale: number;

  constructor(mapData: MapData, scale=5) {
    this.mapData = mapData;
    this.scale = scale;
    this.canvas = createCanvas(mapData.mapWidth*this.scale, mapData.mapHeight*this.scale);
    this.ctx = this.canvas.getContext('2d');
  }

  /**
  * Export the map as a png file to a given path
  *
  * @param {fs.PathLike} [path] The path where to store the jpeg file
  * @param {Color=} [backgroundColor] Set the background color of the image
  *
  * @returns {Promise<string | Buffer>} The path to the exported file
  */
  public exportMapAsPNG(path: fs.PathLike, backgroundColor?: Color): Promise<string | Buffer> {
    return this.exportMap(path, this.canvas.createPNGStream(), backgroundColor);
  }

  /**
  * Export the map as a jpeg file to a given path
  *
  * @param {fs.PathLike} [path] The path where to store the jpeg file
  * @param {Color} [backgroundColor = "#000000"] Set the background color of the image
  *
  * @returns {Promise<string | Buffer>} The path to the exported file
  */
  public exportMapAsJPEG(path: fs.PathLike, backgroundColor: Color = '#000000'): Promise<string | Buffer> {
    return this.exportMap(path, this.canvas.createJPEGStream(), backgroundColor);
  }

  private exportMap(path: fs.PathLike, stream: PNGStream | JPEGStream, backgroundColor?: Color): Promise<string | Buffer> {
    if(backgroundColor) {
      this.ctx.globalCompositeOperation = 'destination-over';
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'source-over';
    }
    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(path);
      stream.pipe(out);
      out.on('finish', () => resolve(out.path));
      out.on('error', (err) => reject(err));
    });
  }

  /**
  * Draw track path of the robot
  *
  * @param {number} [lineWidth] The thickness of the track
  * @param {Color=} [color = "orange"] The color of the track
  */
  public drawTrack(
    lineWidth: number = 1,
    color: Color = 'orange',
  ): void {
    const buffer = Buffer.from(this.mapData.track, 'base64');
    const data = struct.unpack('<' + 'b'.repeat(buffer.length - 4), buffer.slice(4));
    this.ctx.lineWidth = lineWidth * this.scale;
    this.ctx.beginPath();
    const path: Point[] = [];
    for(let i = 4; i < data.length-1; i+=4) {
      const x = this.mapData.centerPoint[0] - 100 + (data[i].valueOf() as number);
      const y = this.mapData.centerPoint[1] + 30 + (data[i+2].valueOf() as number);
      path.push([x, y]);
    }
    path.forEach((point) => {
      const x = (point[0]) * this.scale;
      const y = (point[1]) * this.scale;
      this.ctx.lineTo(x, y);
    });

    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  /**
  * Draw regions/rooms
  *
  * @param {boolean} [outlined = false] The thickness of the track
  * @param {Color=} [colorPalette] The color of the track
  */
  public drawRegions(
    outlined: boolean = false,
    colorPalette: Array<Color> = [
      '#ABDEE6',
      '#CBAACB',
      '#FFFFB5',
      '#FFCCB6',
      '#F3B0C3',
      '#C6DBDA',
      '#FEE1E8',
      '#FED7C3',
      '#F6EAC2',
      '#ECD5E3',
    ],
  ): void {
    let index = 0;
    this.mapData.regionNames.forEach((region) => {
      const x = region.areaRect[0][0] *this.scale;
      const y = region.areaRect[0][1] *this.scale;
      const width = (region.areaRect[1][0]*this.scale) - x;
      const height = (region.areaRect[1][1]*this.scale) - y;
      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.closePath();
      if(outlined) {
        this.ctx.strokeStyle = colorPalette[index];
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = colorPalette[index];
        this.ctx.fill();
      }
      index++;
      if(index >= colorPalette.length) {
        index = 0;
      }
    });
  }

  /**
  * Draw robot
  *
  * @param {number} [size = 5] The size of the robot
  * @param {Color=} [color] The color of the robot
  */
  public drawRobot(
    size: number = 5,
    icon: string = path.join(__dirname, './assets/vacuum-cleaner.svg'),
  ): Promise<void> {
    return loadImage(icon).then((image) => this.drawImage(this.mapData.robotPos, size, this.mapData.deg, image));
  }

  /**
  * Draw charger
  *
  * @param {number} [size = 5] The size of the charger
  * @param {Color=} [color] The color of the charger
  */
  public drawCharger(
    size: number = 5,
    icon: string = path.join(__dirname, './assets/charger.svg'),
  ): Promise<void> {
    return loadImage(icon).then((image) => this.drawImage(this.mapData.chargerPos, size, 0, image));
  }

  private drawImage(
    point: Point,
    size: number,
    deg: number,
    image: Image,
  ): void {
    this.ctx.save();
    this.ctx.translate(point[0]*this.scale, point[1]*this.scale);
    this.ctx.rotate(deg);
    this.ctx.drawImage(image, 0, 0, size*this.scale, size*this.scale);
    this.ctx.restore();
  }
}

export default CleanmateMap;