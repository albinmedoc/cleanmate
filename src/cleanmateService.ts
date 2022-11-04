import type events from 'events';
import { WorkMode, Status, StatusResponse, WorkState, MopMode } from './types';
import CleanmateConnection from './cleanmateConnection';
import { stringToObject } from './helpers';

class CleanmateService extends CleanmateConnection {

  private status?: Status;

  constructor(ipAddress: string, authCode: string, pollInterval: number = 0) {
    super(ipAddress, authCode);
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
  public get batteryLevel(): number | undefined {
    return this.status?.battery;
  }

  /**
  * The current version of the robot.
  */
  public get version(): string | undefined {
    return this.status?.version;
  }

  /**
  * The current {@link WorkMode} of the robot.
  */
  public get workMode(): WorkMode | undefined {
    return this.status?.workMode;
  }

  /**
  * The current {@link WorkState} of the robot.
  */
  public get workState(): WorkState | undefined {
    return this.status?.workState;
  }

  /**
  * The current {@link MopMode} of the robot.
  */
  public get mopMode(): MopMode | undefined {
    return this.status?.waterTank;
  }

  /**
  * The current volume level of the robot.
  */
  public get volume(): number| undefined {
    return this.status?.voice ? Math.round((this.status.voice - 1) * 100): undefined;
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
  public addListener(eventName: 'statusChange', listener: (status: Status) => void): events;
  public addListener(eventName: string, listener: (...args: never[]) => void): events {
    return this.events.addListener(eventName, listener as (...args: unknown[]) => void);
  }

  public removeListener(eventName: 'batteryLevelChange', listener: (batteryLevel: number) => void): events;
  public removeListener(eventName: 'versionChange', listener: (version: string) => void): events;
  public removeListener(eventName: 'workModeChange', listener: (workMode: WorkMode) => void): events;
  public removeListener(eventName: 'workStateChange', listener: (workState: WorkState) => void): events;
  public removeListener(eventName: 'mopModeChange', listener: (mopMode: MopMode) => void): events;
  public removeListener(eventName: 'volumeChange', listener: (volume: number) => void): events;
  public removeListener(eventName: 'statusChange', listener: (status: Status) => void): events;
  public removeListener(eventName: string, listener: (...args: never[]) => void): events {
    return this.events.removeListener(eventName, listener as (...args: unknown[]) => void);
  }

  private onStatusResponse(data: Buffer) {
    try {
      const response: StatusResponse = stringToObject<StatusResponse>(data.toString('ascii'));
      this.updateStatus(response.value);
    } catch (err) {
      // This should not happen
    }
  }

  private updateStatus(status: Status): void {
    if(status.battery !== this.status?.battery) {
      this.events.emit('batteryLevelChange', status.battery);
    }
    if(status.version !== this.status?.version) {
      this.events.emit('versionChange', status.version);
    }
    if(status.workMode !== this.status?.workMode) {
      this.events.emit('workModeChange', status.workMode);
    }
    if(status.workState !== this.status?.workState) {
      this.events.emit('workStateChange', status.workState);
    }
    if(status.waterTank !== this.status?.waterTank) {
      this.events.emit('mopModeChange', status.waterTank);
    }
    if(status.voice !== this.status?.voice) {
      this.events.emit('volumeChange', this.mapToVolume(status.voice));
    }
    this.status = status;
    this.events.emit('statusChange', status);
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
  * Send a request to get information about the map.
  * If you want to act on the response, make sure you have registered a event listener using the {@link addListener} function.
  */
  public pollMap(): Promise<void> {
    const request = this.makeRequest({
      mapWidth: '0',
      centerPoint: '0',
      mapHeight: '0',
      trackNum: 'AAA=',
      mapSign: 'AAA=',
      transitCmd: '133',
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
    } else {
      request = this.makeRequest({
        start: '1',
        transitCmd: '100',
      });
    }
    return this.sendRequest(request);

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
    return this.sendRequest(request);
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
    return this.sendRequest(request);
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
    return this.sendRequest(request);
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
    return this.sendRequest(request);
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