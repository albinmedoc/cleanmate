import events from 'events';
import { WorkMode, CleanmateStatus, StatusResponse, WorkState, MopMode } from './types';
import CleanmateConnection from './cleanmateConnection';

class CleanmateService extends CleanmateConnection {
  public events: events;

  private status: CleanmateStatus = {
    batteryLevel: 0,
    version: '',
    workMode: WorkMode.Standard,
    workState: WorkState.Charging,
    mopMode: MopMode.Medium,
    volume: 2,
  };

  constructor(ipAddress: string, authCode: string, pollInterval: number = 0) {
    super(ipAddress, authCode);
    this.events = new events.EventEmitter();
    this.client.on('data', this.onStatusResponse.bind(this));

    if(pollInterval) {
      setInterval(() => {
        this.pollStatus();
      }, 1000 * pollInterval);
    }
  }

  /**
  * The current battery level of the robot.
  */
  public get batteryLevel(): number {
    return this.status.batteryLevel || 0;
  }

  private set batteryLevel(value: number) {
    this.events.emit('batteryLevelChange', value);
    this.status.batteryLevel = value;
  }

  /**
  * The current version of the robot.
  */
  public get version(): string {
    return this.status.version;
  }

  private set version(value: string) {
    this.events.emit('versionChange', value);
    this.status.version = value;
  }

  /**
  * The current {@link WorkMode} of the robot.
  */
  public get workMode(): WorkMode {
    return this.status.workMode;
  }

  private set workMode(value: WorkMode) {
    this.events.emit('workModeChange', value);
    this.status.workMode = value;
  }

  /**
  * The current {@link WorkState} of the robot.
  */
  public get workState(): WorkState {
    return this.status.workState;
  }

  private set workState(value: WorkState) {
    this.events.emit('workStateChange', value);
    this.status.workState = value;
  }

  /**
  * The current {@link MopMode} of the robot.
  */
  public get mopMode(): MopMode {
    return this.status.mopMode;
  }

  private set mopMode(value: MopMode) {
    this.events.emit('mopModeChange', value);
    this.status.mopMode = value;
  }

  /**
  * The current volume level of the robot.
  */
  public get volume(): number {
    return this.status.volume;
  }

  private set volume(value: number) {
    this.events.emit('volumeChange', value);
    this.status.volume = value;
  }

  /**
  * Adds the listener function to the end of the listeners array for the event named eventName.
  * No checks are made to see if the listener has already been added.
  * Multiple calls passing the same combination of eventName and listener will result in the listener being added,
  * and called, multiple times.
  * ```js
  * server.on('workModeChange', (workMode) => {
  *   console.log('Work mode changed to', workMode);
  * });
  * ```
  */
  public addListener(eventName: 'batteryLevelChange', listener: (batteryLevel: number) => void): events;
  public addListener(eventName: 'versionChange', listener: (version: string) => void): events;
  public addListener(eventName: 'workModeChange', listener: (workMode: WorkMode) => void): events;
  public addListener(eventName: 'workStateChange', listener: (workState: WorkState) => void): events;
  public addListener(eventName: 'mopModeChange', listener: (mopMode: MopMode) => void): events;
  public addListener(eventName: 'volumeChange', listener: (volume: number) => void): events;
  public addListener(eventName: 'statusChange', listener: (status: CleanmateStatus) => void): events;
  public addListener(eventName: string, listener: (...args: never[]) => void): events {
    return this.events.addListener(eventName, listener as (...args: unknown[]) => void);
  }

  public removeListener(eventName: 'batteryLevelChange', listener: (batteryLevel: number) => void): events;
  public removeListener(eventName: 'versionChange', listener: (version: string) => void): events;
  public removeListener(eventName: 'workModeChange', listener: (workMode: WorkMode) => void): events;
  public removeListener(eventName: 'workStateChange', listener: (workState: WorkState) => void): events;
  public removeListener(eventName: 'mopModeChange', listener: (mopMode: MopMode) => void): events;
  public removeListener(eventName: 'volumeChange', listener: (volume: number) => void): events;
  public removeListener(eventName: 'statusChange', listener: (status: CleanmateStatus) => void): events;
  public removeListener(eventName: string, listener: (...args: never[]) => void): events {
    return this.events.removeListener(eventName, listener as (...args: unknown[]) => void);
  }

  private tryParseInt(str: string): number {
    const int = parseInt(str);
    if(isNaN(int)) {
      throw new TypeError('String is not an number');
    }
    return int;
  }

  private onStatusResponse(data: Buffer) {
    try {
      const response: StatusResponse = JSON.parse(data.toString('ascii'));
      this.batteryLevel = this.tryParseInt(response.value.battery);
      this.version = response.value.version;
      this.workMode = this.tryParseInt(response.value.workMode);
      this.workState = this.tryParseInt(response.value.workState);
      this.mopMode = this.tryParseInt(response.value.waterTank);
      this.volume = this.mapToVolume(this.tryParseInt(response.value.voice));

      this.events.emit('statusChange', this.status);
    } catch (err) {
      // This should not happen
    }
  }

  /**
  * Send a request to get the status.
  * If you want to act on the response, make sure you have registered a event listener using the {@link addListener} function.
  */
  public pollStatus(): Promise<void> {
    const request = this.makeRequest({
      state: '',
      transitCmd: '98',
    });
    return this.sendRequest(request);
  }

  /**
  * Start cleaning.
  * If no work mode is passed, use the last work mode
  * @param [workMode] The {@link WorkMode} to use when cleaning
  */
  public start(workMode?: WorkMode): Promise<void> {
    let request: Buffer;
    if (workMode) {
      request = this.makeRequest({
        mode: workMode.toString(),
        transitCmd: '106',
      });
      this.status.workMode = workMode;
    } else {
      request = this.makeRequest({
        start: '1',
        transitCmd: '100',
      });
    }
    return this.sendRequest(request).then(() => {
      this.status.workState = WorkState.Cleaning;
    });

  }

  /**
  * Pause cleaning
  */
  public pause(): Promise<void> {
    const request = this.makeRequest({
      pause: '1',
      isStop: '0',
      transitCmd: '102',
    });
    return this.sendRequest(request).then(() => {
      this.status.workState = WorkState.Paused;
    });
  }

  /**
  * Go to charging station
  */
  public charge(): Promise<void> {
    const request = this.makeRequest({
      charge: '1',
      transitCmd: '104',
    });
    return this.sendRequest(request);
  }

  /**
  * Set mop mode
  *
  * @param [mopMode] The {@link MopMode} to set
  */
  public setMopMode(mopMode: MopMode): Promise<void> {
    const request = this.makeRequest({
      waterTank: mopMode.toString(),
      transitCmd: '145',
    });
    return this.sendRequest(request).then(() => {
      this.status.mopMode = mopMode;
    });
  }

  private mapToVolume(value: number): number {
    return Math.round((value - 1) * 100);
  }

  private mapFromVolume(volume: number): number {
    return 1 + Math.round((volume/100) * 10) / 10;
  }

  /**
  * Set volume level
  *
  * @param [volumeLevel] The volume (0-100)
  */
  public setVolume(volumeLevel: number): Promise<void> {
    if(volumeLevel < 0 || volumeLevel > 100){
      throw new Error('Volume level has to be between 0-100');
    }
    const volume = this.mapFromVolume(volumeLevel);
    const request = this.makeRequest({
      volume: volume.toFixed(1),
      voice: '',
      transitCmd: '123',
    });
    return this.sendRequest(request).then(() => {
      this.status.volume = volume;
    });
  }

  /**
  * Clean specified rooms
  *
  * @param [roomIds] A list of room ids to clean
  */
  public cleanRooms(roomIds: number[]): Promise<void> {
    const uniqueSortedRoomIds = [...new Set(roomIds)].sort();
    const cleanBlocks = uniqueSortedRoomIds.map((roomId) => ({
      'cleanNum': '1',
      'blockNum': roomId.toString(),
    }));
    const request = this.makeRequest({
      'opCmd': 'cleanBlocks',
      cleanBlocks,
    });
    return this.sendRequest(request).then(() => {
      this.workState = WorkState.Cleaning;
    });
  }

  /**
  * Clean specified rooms
  */
  public findRobot(): Promise<void> {
    const request = this.makeRequest({
      find: '',
      transitCmd: '143',
    });
    return this.sendRequest(request);
  }
}

export default CleanmateService;