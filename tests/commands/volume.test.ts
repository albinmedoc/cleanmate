import Constants from './../constants';
import CleanmateService from '../../src/cleanmateService';

describe('Volume command', () => {
  let cleanmateService: CleanmateService;

  /**
  * Set Cleanmate service for each test
  */
  beforeEach(() => {
    cleanmateService = new CleanmateService(Constants.IP_ADDRESS, Constants.AUTH_CODE);
  });

  /**
  * Restore the spy created with spyOn
  */
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Can map to volume', () => {
    const mapToVolume = cleanmateService['mapToVolume'];

    expect(mapToVolume(1.2)).toEqual(20);
    expect(mapToVolume(1.5)).toEqual(50);
    expect(mapToVolume(2)).toEqual(100);
  });

  test('Can map from volume', () => {
    const mapFromVolume = cleanmateService['mapFromVolume'];

    expect(mapFromVolume(20)).toEqual(1.2);
    expect(mapFromVolume(58)).toEqual(1.6);
    expect(mapFromVolume(100)).toEqual(2);
  });

  test('Sends volume 100% command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setVolume(100).then(() => {
      const buffer = Buffer.from(Constants.VOLUME_100_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Sends volume 50% command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setVolume(50).then(() => {
      const buffer = Buffer.from(Constants.VOLUME_50_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Sends volume 0% command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setVolume(0).then(() => {
      const buffer = Buffer.from(Constants.VOLUME_0_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });
});