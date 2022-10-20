import Constants from './constants';
import CleanmateService from '../src/cleanmateService';
import { MopMode, WorkMode, WorkState } from '../src/types';

describe('Events', () => {
  let cleanmateService: CleanmateService;

  /**
  * Set Cleanmate service for each test
  */
  beforeEach(() => {
    cleanmateService = new CleanmateService(Constants.IP_ADDRESS, Constants.AUTH_CODE);
  });

  test('Can remove event listener', () => {
    const callback = jest.fn();

    cleanmateService.addListener('batteryLevelChange', callback);
    cleanmateService.removeListener('batteryLevelChange', callback);
    cleanmateService['batteryLevel'] = 0;
    expect(callback).not.toBeCalled();
  });

  test('Triggers event when batteryLevel changes', (done) => {
    const batteryLevel = 20;

    cleanmateService.addListener('batteryLevelChange', (value) => {
      expect(value).toEqual(batteryLevel);
      done();
    });
    cleanmateService['batteryLevel'] = batteryLevel;
  });

  test('Triggers event when version changes', (done) => {
    const version = '1.0';

    cleanmateService.addListener('versionChange', (value) => {
      expect(value).toEqual(version);
      done();
    });
    cleanmateService['version'] = version;
  });

  test('Triggers event when workMode changes', (done) => {
    const workMode = WorkMode.Intensive;

    cleanmateService.addListener('workModeChange', (value) => {
      expect(value).toEqual(workMode);
      done();
    });
    cleanmateService['workMode'] = workMode;
  });

  test('Triggers event when workState changes', (done) => {
    const workState = WorkState.Problem;

    cleanmateService.addListener('workStateChange', (value) => {
      expect(value).toEqual(workState);
      done();
    });
    cleanmateService['workState'] = workState;
  });

  test('Triggers event when mopMode changes', (done) => {
    const mopMode = MopMode.High;

    cleanmateService.addListener('mopModeChange', (value) => {
      expect(value).toEqual(mopMode);
      done();
    });
    cleanmateService['mopMode'] = mopMode;
  });

  test('Triggers event when volume changes', (done) => {
    const volume = 20;

    cleanmateService.addListener('volumeChange', (value) => {
      expect(value).toEqual(volume);
      done();
    });
    cleanmateService['volume'] = volume;
  });
});