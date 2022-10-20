import Constants from './../constants';
import CleanmateService from '../../src/cleanmateService';
import { MopMode } from '../../src/types';

describe('Mop command', () => {
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

  test('Sends mop high command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setMopMode(MopMode.High).then(() => {
      const buffer = Buffer.from(Constants.MOP_HIGH_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Sends mop medium command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setMopMode(MopMode.Medium).then(() => {
      const buffer = Buffer.from(Constants.MOP_MEDIUM_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Sends mop low command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.setMopMode(MopMode.Low).then(() => {
      const buffer = Buffer.from(Constants.MOP_LOW_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });
});