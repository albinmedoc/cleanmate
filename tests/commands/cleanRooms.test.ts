import Constants from './../constants';
import CleanmateService from '../../src/cleanmateService';

describe('Clean rooms', () => {
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

  test('Sends cleanRooms command', (done) => {
    const rooms = [1, 2, 3];
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.cleanRooms(rooms).then(() => {
      const buffer = Buffer.from(Constants.CLEAN_ROOMS_123_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Sends cleanRooms command (unordered)', (done) => {
    const rooms = [3, 1, 2];
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.cleanRooms(rooms).then(() => {
      const buffer = Buffer.from(Constants.CLEAN_ROOMS_123_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });
});