import Constants from './constants';
import CleanmateService from '../src/cleanmateService';
import { MopMode, Status, WorkMode, WorkState } from '../src/types';

describe('Events', () => {
  let cleanmateService: CleanmateService;

  /**
  * Set Cleanmate service for each test
  */
  beforeEach(() => {
    cleanmateService = new CleanmateService(Constants.IP_ADDRESS, Constants.AUTH_CODE);
  });

  const updateStatus = <K extends keyof Status>(key: K, value: Status[K]) => {
    const newStatus = Constants.BASE_STATUS;
    newStatus[key] = value;
    cleanmateService['updateStatus'](newStatus);
  };

  test('Can remove event listener', () => {
    const callback = jest.fn();

    cleanmateService.addListener('batteryLevelChange', callback);
    cleanmateService.removeListener('batteryLevelChange', callback);
    updateStatus('battery', 0);
    expect(callback).not.toBeCalled();
  });

  test('Triggers event when batteryLevel changes', (done) => {
    const batteryLevel = 20;

    cleanmateService.addListener('batteryLevelChange', (value) => {
      expect(value).toEqual(batteryLevel);
      done();
    });
    updateStatus('battery', batteryLevel);
  });

  test('Triggers event when version changes', (done) => {
    const version = '1.0';

    cleanmateService.addListener('versionChange', (value) => {
      expect(value).toEqual(version);
      done();
    });
    updateStatus('version', version);
  });

  test('Triggers event when workMode changes', (done) => {
    const workMode = WorkMode.Intensive;

    cleanmateService.addListener('workModeChange', (value) => {
      expect(value).toEqual(workMode);
      done();
    });
    updateStatus('workMode', workMode);
  });

  test('Triggers event when workState changes', (done) => {
    const workState = WorkState.Problem;

    cleanmateService.addListener('workStateChange', (value) => {
      expect(value).toEqual(workState);
      done();
    });
    updateStatus('workState', workState);
  });

  test('Triggers event when mopMode changes', (done) => {
    const mopMode = MopMode.High;

    cleanmateService.addListener('mopModeChange', (value) => {
      expect(value).toEqual(mopMode);
      done();
    });
    updateStatus('waterTank', mopMode);
  });

  test('Triggers event when volume changes', (done) => {
    cleanmateService.addListener('volumeChange', (value) => {
      expect(value).toEqual(20);
      done();
    });
    updateStatus('voice', 1.2);
  });
});