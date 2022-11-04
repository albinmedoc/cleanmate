import events from 'events';
import net from 'net';
import { stringToObject } from './helpers';

class CleanmateConnection {
  public ipAddress: string;
  public authCode: string;
  public events: events;

  protected client: net.Socket;

  private port = 8888;
  private connected = false;
  private keepAlive = false;
  private connectPromise?: Promise<void>;
  private packets: Buffer[] = [];
  private packetsSize?: number;

  constructor(ipAddress: string, authCode: string) {
    this.ipAddress = ipAddress;
    this.authCode = authCode;
    this.events = new events.EventEmitter();
    this.client = new net.Socket();

    this.client.on('data', this.onData.bind(this));

    this.client.on('close', () => {
      this.connected = false;
      if(this.keepAlive) {
        this.onConnectionLost();
      }
    });
  }

  private onData(data: Buffer) {
    let packet: Buffer | undefined;
    if(this.isLeadingPacket(data)) {
      this.packetsSize = this.getSizeOfFullPacket(data);
      this.packets.push(data);
      return;
    } else {
      this.packets.push(data);
      if(this.packetsSize) {
        const packetsSoFar = Buffer.concat(this.packets);
        const currentLength = packetsSoFar.length;
        if(this.packetsSize === currentLength) {
          packet = packetsSoFar.subarray(20);
          this.packets = [];
          this.packetsSize = undefined;
        } else {
          return;
        }
      } else {
        packet = data;
      }
    }
    // Here we have a full packet
    try {
      const objString = packet.toString('ascii');
      const obj = stringToObject(objString);
      this.events.emit('data', obj);
    } catch(err) {
      return;
    }
  }

  private isLeadingPacket(data: Buffer): boolean {
    const check = data.subarray(4, 12);
    const validator = Buffer.from('+gAAAAEAAAA=', 'base64');
    return Buffer.compare(check, validator) === 0;
  }

  private getSizeOfFullPacket(data: Buffer): number {
    const header = data.subarray(0, 20).toString('hex');
    const sizeHex = header.split('00')[0];
    let sizeString = '';
    for(let i = sizeHex.length - 1; i > 0; i-=2) {
      sizeString += sizeHex[i-1] + sizeHex[i];
    }
    const size = parseInt(sizeString, 16);
    return size;
  }

  private onConnectionLost() {
    setTimeout(() => {
      this.connect().then(() => {
        this.client.emit('reconnect');
      });
    }, 4000);
  }

  public connect(keepAlive: boolean = false): Promise<void> {
    this.keepAlive = keepAlive;
    if(!this.connectPromise) {
      this.connectPromise = new Promise<void>((resolve, reject) => {
        if(this.connected) {
          return resolve();
        }
        const connectHandler = () => {
          this.connected = true;
          this.client.removeListener('error', errorHandler);
          resolve();
        };

        const errorHandler = (err: Error) => {
          this.connected = false;
          this.client.removeListener('connect', connectHandler);
          reject(err);
        };

        this.client.connect(this.port, this.ipAddress, connectHandler);
        this.client.once('error', errorHandler);
      }).finally(() => this.connectPromise = undefined);
    }
    return this.connectPromise;
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if(!this.connected){
        resolve();
      }
      this.client.destroy();
      this.client.prependOnceListener('close', () => {
        this.connected = false;
        resolve();
      });
    });
  }

  private strToHex(str: string): string {
    let hex = '';
    for (let i = 0, l = str.length; i < l; i++) {
      hex += str.charCodeAt(i).toString(16);
    }
    return hex;
  }

  private getHexSize(size: number): string {
    const hex = size.toString(16);
    const temp = '0'.repeat(8 - hex.length) + hex;
    let out = '';
    for (let x = temp.length - 1; x > 0; x -= 2) {
      out += temp[x - 1] + temp[x];
    }
    return out;
  }

  public makeRequest(value: Record<string, unknown>): Buffer {
    const request = JSON.stringify({
      version: '1.0',
      control: {
        authCode: this.authCode,
      },
      value,
    });
    const requestSize = Buffer.from(request).length + 20;
    const requesthex = this.strToHex(request);

    const packet = `${this.getHexSize(requestSize)}fa00000001000000c527000001000000${requesthex}`;
    const data = Buffer.from(packet, 'hex');
    return data;
  }

  protected sendRequest(data: Buffer): Promise<void> {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.client.write(data, (err) => {
        if(err) {
          reject();
        }else {
          resolve();
        }
      });
    }));
  }
}

export default CleanmateConnection;