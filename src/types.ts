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

export interface CleanmateStatus {
    batteryLevel: number;
    version: string;
    workMode: WorkMode;
    workState: WorkState;
    mopMode: MopMode;
    volume: number;
}

export interface StatusResponse {
    version: string;
    control: {
        targetId: string;
        targetType: string;
        broadcast: string;
    };
    value: {
        noteCmd: string;
        voice: string;
        workState: string;
        workMode: string;
        fan: string;
        direction: string;
        brush: string;
        battery: string;
        error: string;
        standbyMode: string;
        waterTank: string;
        clearComponent: string;
        waterMark: string;
        attract: string;
        deviceIp: string;
        devicePort: string;
        carpetColor: string;
        version: string;
        result: string;
        mopMode: string;
        extParam: string;
    };
}