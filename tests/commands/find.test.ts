import Constants from './../constants';
import CleanmateService from '../../src/cleanmateService';

describe('Find command', () => {
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

  test('Sends find command', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.findRobot().then(() => {
      const buffer = Buffer.from(Constants.FIND_CMD, 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });
});