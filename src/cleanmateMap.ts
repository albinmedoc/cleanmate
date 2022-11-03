import fs from 'fs';
import struct from 'python-struct';
import { createCanvas, Canvas, CanvasRenderingContext2D, JPEGStream, PNGStream } from 'canvas';
import { MapResponse, Point } from './types';

export type Color = string | CanvasGradient | CanvasPattern;

class CleanmateMap {
  private mapData: MapResponse;
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private scale: number;

  constructor(mapData: MapResponse, scale=1) {
    this.mapData = mapData;
    this.scale = scale;
    this.canvas = createCanvas(this.mapWidth*this.scale, this.mapHeight*this.scale);
    this.ctx = this.canvas.getContext('2d');
  }

  /**
  * The width of the map
  */
  private get mapWidth(): number {
    return this.mapData.value.mapWidth;
  }

  /**
  * The height of the map
  */
  private get mapHeight(): number {
    return this.mapData.value.mapHeight;
  }

  /**
  * The postion of the robot
  */
  private get robotPosition(): Point {
    return this.mapData.value.robotPos;
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
    const buffer = Buffer.from(this.mapData.value.track, 'base64');
    const data = struct.unpack('<' + 'b'.repeat(buffer.length - 4), buffer.slice(4));
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    const path: Point[] = [];
    for(let i = 4; i < data.length-1; i+=4) {
      const x = this.mapWidth - Math.abs((data[i].valueOf() as number));
      const y = this.mapHeight - Math.abs((data[i+2].valueOf() as number));
      path.push([x, y]);
    }
    const pathRobotPos = path[path.length - 1];
    const offsetX = pathRobotPos[0] - this.robotPosition[0];
    const offsetY = pathRobotPos[1] - this.robotPosition[1];

    path.forEach((point) => {
      const x = (point[0] - offsetX) * this.scale;
      const y = (point[1] - offsetY) * this.scale;
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
    this.mapData.value.regionNames.forEach((region) => {
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
    color: Color = 'blue',
  ): void {
    this.drawPoint(this.robotPosition, size, color);
  }

  /**
  * Draw charger
  *
  * @param {number} [size = 5] The size of the charger
  * @param {Color=} [color] The color of the charger
  */
  public drawCharger(
    size: number = 5,
    color: Color = 'green',
  ): void {
    this.drawPoint(this.mapData.value.chargerPos, size, color);
  }

  private drawPoint(
    point: Point,
    size: number,
    color: string | CanvasGradient | CanvasPattern,
  ): void {
    this.ctx.beginPath();
    this.ctx.arc(point[0]*this.scale, point[1]*this.scale, size/2, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }
}

export default CleanmateMap;