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

export type Point = [number, number];

export interface Region {
    regionNum: number;
    regionName: string;
    cleanNum: number;
    areaRect: [Point, Point];
}

export interface MapData {
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
    adjoinRegion: Point[];
    areaAdjoin: Point[];
    chargerPos: Point;
    leftMaxPoint: Point;
    rightMaxPoint: Point;
    centerPoint: Point;
    clearArea: number;
    clearTime: number;
    clearModule: number;
    clearSign: string;
    pointArea: Record<string, unknown>;
    cleanArea: number | unknown[];
    forbiddenArea: number | unknown[];
    mopForbiddenArea: number | unknown[];
    regionNames: Region[];
    robotPos: Point;
    virtualWall: number | unknown[];
}

export interface MapResponse extends BaseResponse {
    value: MapData;
}