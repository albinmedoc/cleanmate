import Constants from './constants';
import CleanmateService from '../src/cleanmateService';
import { MopMode, WorkMode, WorkState } from '../src/types';

describe('Status', () => {
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

  test('Can poll status', (done) => {
    const spy = jest.spyOn(CleanmateService.prototype as never, 'sendRequest').mockResolvedValue(null as never);
    cleanmateService.pollStatus().then(() => {
      const buffer = Buffer.from('bf000000fa00000001000000c5270000010000007b2276657273696f6e223a22312e30222c22636f6e74726f6c223a7b2262726' +
      'f616463617374223a2230222c2274617267657454797065223a2232222c227461726765744964223a2243314635344645304631363234393638393539304546334' +
      '33646303431333342222c2261757468436f6465223a224142434445464748494a227d2c2276616c7565223a7b227374617465223a22222c227472616e736974436' +
      'd64223a223938227d7d', 'hex');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buffer);
      done();
    });
  });

  test('Can poll status at interval', () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    const pollInterval = 15;
    cleanmateService = new CleanmateService(Constants.IP_ADDRESS, Constants.AUTH_CODE, pollInterval);
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), pollInterval * 1000);
  });

  test('Can set status', (done) => {
    const client = cleanmateService['client'];
    const buffer = Buffer.from('7b2276657273696f6e223a22312e30222c22636f6e74726f6c223a7b227461726765744964223a2230222c2274617267657454797' +
    '065223a2236222c2262726f616463617374223a2230227d2c2276616c7565223a7b226e6f7465436d64223a22313032222c22766f696365223a22312e32222c22776' +
    'f726b5374617465223a2231222c22776f726b4d6f6465223a2237222c2266616e223a2230222c22646972656374696f6e223a2230222c226272757368223a2230222' +
    'c2262617474657279223a223130222c226572726f72223a2230222c227374616e6462794d6f6465223a2230222c22776174657254616e6b223a223230222c22636c6' +
    '56172436f6d706f6e656e74223a2231222c2277617465724d61726b223a2230222c2261747472616374223a2230222c226465766963654970223a223139322e31363' +
    '82e38362e323438222c22646576696365506f7274223a2238383838222c22636172706574436f6c6f72223a2231222c2276657273696f6e223a22352e31312e37313' +
    '02835316929222c22726573756c74223a2230222c226d6f704d6f6465223a2231222c22657874506172616d223a227b5c22757365566f6963655369676e5c223a5c2' +
    '2656e5c222c5c2275765377697463685c223a5c222d315c222c5c227570566f6963655369676e5c223a5c225c222c5c226578697374566f6963655369676e5c223a5' +
    'c22656e5c222c5c22636c65616e4d6f64756c655c223a5c22315c222c5c226d61705570646174655369676e5c223a5c22305c222c5c22686164576f726b5c223a5c2' +
    '2315c222c5c226f70656e526567696f6e5c223a5c22315c222c5c22776f726b547970655c223a5c22315c222c5c2263617270657470726573737572655c223a5c223' +
    '05c222c5c2272656c6f63614e6f746963655c223a5c22305c222c5c22726567696f6e5369676e5c223a5c225c227d227d7d', 'hex');


    cleanmateService.addListener('statusChange', () => {
      expect(cleanmateService.batteryLevel).toEqual(10);
      expect(cleanmateService.version).toEqual('5.11.710(51i)');
      expect(cleanmateService.workMode).toEqual(WorkMode.Intensive);
      expect(cleanmateService.workState).toEqual(WorkState.Cleaning);
      expect(cleanmateService.mopMode).toEqual(MopMode.High);
      expect(cleanmateService.volume).toEqual(0);
      done();
    });

    client.emit('data', buffer);
  });
});