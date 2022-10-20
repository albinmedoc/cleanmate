import net from 'net';

class CleanmateConnection {
  public ipAddress: string;
  public authCode: string;

  protected client: net.Socket;

  private port = 8888;
  private connected = false;
  private keepAlive = false;
  private connectPromise?: Promise<void>;

  constructor(ipAddress: string, authCode: string) {
    this.ipAddress = ipAddress;
    this.authCode = authCode;
    this.client = new net.Socket();

    this.client.on('close', () => {
      this.connected = false;
      if(this.keepAlive) {
        this.onConnectionLost();
      }
    });
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
        broadcast: '0',
        targetType: '2',
        targetId: 'C1F54FE0F16249689590EF3C6F04133B', // Looks like this can be anything with 32 characters
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