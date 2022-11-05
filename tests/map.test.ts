import os from 'os';
import path from 'path';
import Constants from './constants';
import CleanmateMap from '../src/cleanmateMap';

describe('CleanmateMap', () => {
  let map: CleanmateMap;

  /**
  * Start server and keep track of all sockets
  */
  beforeEach(() => {
    map = new CleanmateMap(Constants.BASE_MAP_DATA, 1);
  });

  /**
  * Restore the spy created with spyOn
  */
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Correct size of canvas', () => {
    const scale = 3;
    expect(map.canvas.width === Constants.BASE_MAP_DATA.mapWidth);
    expect(map.canvas.height === Constants.BASE_MAP_DATA.mapHeight);
    map = new CleanmateMap(Constants.BASE_MAP_DATA, scale);
    expect(map.canvas.width === Constants.BASE_MAP_DATA.mapWidth * scale);
    expect(map.canvas.height === Constants.BASE_MAP_DATA.mapHeight * scale);
  });

  test('Can export as PNG', () => {
    const filename = path.join(os.tmpdir(), '/test.png');
    expect(map.exportMapAsPNG(filename)).resolves.toBe(filename);
  });

  test('Can export as JPEG', () => {
    const filename = path.join(os.tmpdir(), '/test.jpg');
    expect(map.exportMapAsJPEG(filename)).resolves.toBe(filename);
  });

  test('Can set background', () => {
    const filename = path.join(os.tmpdir(), '/test.jpg');
    const spy = jest.spyOn(map.ctx, 'fillRect');
    expect(map.exportMapAsJPEG(filename, '#fff')).resolves.toBe(filename);
    expect(spy).toBeCalledWith(0, 0, Constants.BASE_MAP_DATA.mapWidth, Constants.BASE_MAP_DATA.mapHeight);
  });
});