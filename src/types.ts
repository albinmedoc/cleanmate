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

interface BaseResponse {
    version: string;
    control: {
        targetId: string;
        targetType: string;
        broadcast: string;
    };
}

export interface StatusResponse extends BaseResponse {
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

export interface MapResponse extends BaseResponse {
    value: {
        transitCmd: number;
        result: number;
        doTime: number;
        mapType: number;
        mapWidth: number;
        mapHeight: number;
        regionNum: number;
        emptyMap: number;
        blockSize: number;
        isMove: number;
        mapSign: number;
        deg: number;
        map: string;
        trackTotal: number;
        track: string;
        adjoinRegion: [number, number][];
        areaAdjoin: [number, number][];
        chargerPos: [number, number];
        leftMaxPoint: [number, number];
        rightMaxPoint: [number, number];
        centerPoint: [number, number];
        clearArea: number;
        clearTime: number;
        clearModule: number;
        clearSign: string;
        pointArea: Record<string, unknown>;
        cleanArea: unknown[];
        forbiddenArea: unknown[];
        mopForbiddenArea: unknown[];
        regionNames: {
            regionNum: number;
            regionName: string;
            cleanNum: number;
            areaRect: [[number, number], [number, number]];
        }[];
        robotPos: [number, number];
        virtualWall: unknown[];
    };
}