export enum WorkMode {
    Intensive = 7,
    Standard = 1,
    Silent = 9
}

export enum WorkState {
    Cleaning = 1,
    Paused = 2,
    Charging = 5,
    Problem = 9
}

export enum MopMode {
    High = 20,
    Medium = 40,
    Low = 60
}

export interface Status {
    noteCmd: number;
    voice: number;
    workState: WorkState;
    workMode: WorkMode;
    fan: number;
    direction: number;
    brush: number;
    battery: number;
    error: number;
    standbyMode: number;
    waterTank: MopMode;
    clearComponent: number;
    waterMark: number;
    attract: number;
    deviceIp: string;
    devicePort: number;
    carpetColor: number;
    version: string;
    result: number;
    mopMode: number;
    extParam: {
        useVoiceSign: string;
        uvSwitch: number;
        upVoiceSign: unknown;
        existVoiceSign: string;
        cleanModule: number;
        mapUpdateSign: number;
        hadWork: number;
        openRegion: number;
        carpetpressure: number;
        relocaNotice: number;
        regionSign: unknown;
    };
}

interface BaseResponse {
    version: number;
    control: {
        targetId: number;
        targetType: number;
        broadcast: number;
    };
}

export interface StatusResponse extends BaseResponse {
    value: Status;
}