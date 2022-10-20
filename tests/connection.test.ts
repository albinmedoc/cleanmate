
import net from 'net';
import Constants from './constants';
import CleanmateConnection from '../src/cleanmateConnection';

describe('CleanmateConnection', () => {

  const server = net.createServer();
  let connection: CleanmateConnection;
  const sockets: Set<net.Socket> = new Set();

  /**
  * Start server and keep track of all sockets
  */
  beforeEach((done) => {
    connection = new CleanmateConnection(Constants.IP_ADDRESS, Constants.AUTH_CODE);
    server.listen(8888, Constants.IP_ADDRESS, () => {
      done();
    });
    server.on('connection', (socket) => {
      sockets.add(socket);
      socket.once('close', () => sockets.delete(socket));
    });
  });

  /**
  * Disconnect client from server
  * and restore the spy created with spyOn
  *
  * Destroy all sockets and close server
  */
  afterEach((done) => {
    connection.disconnect().then(() => {
      for (const socket of sockets) {
        socket.destroy();
      }
      sockets.clear();
      server.close(() => {
        done();
      });
    });
    jest.restoreAllMocks();
  });

  test('Can connect', async () => {
    expect(connection['connected']).toEqual(false);
    await connection.connect();
    expect(connection['connected']).toEqual(true);
  });

  test('Share connect promise', () => {
    const promise1 = connection.connect();
    const storedPromise = connection['connectPromise'];
    expect(storedPromise).not.toBeFalsy();

    const promise2 = connection.connect();
    expect(promise2).toStrictEqual(promise1);
    expect(promise2).toStrictEqual(storedPromise);
  });

  test('Connect rejects when connection fails', async () => {
    connection['ipAddress'] = 'notlocalhost';
    expect(connection['connected']).toEqual(false);
    expect(connection.connect()).rejects;
    expect(connection['connected']).toEqual(false);
  });

  test('Can disconnect', async () => {
    await connection.connect();
    expect(connection['connected']).toEqual(true);
    await connection.disconnect();
    expect(connection['connected']).toEqual(false);
  });

  test('Can keep connection alive', (done) => {
    const client = connection['client'];
    const connectSpy = jest.spyOn(connection, 'connect');
    connection.connect(true).then(() => {
      client.destroy();
    });

    client.once('reconnect', () => {
      expect(connectSpy).toHaveBeenCalledTimes(2);
      done();
    });
  });

  test('Can convert text to hex', () => {
    const strToHex = connection['strToHex'];

    expect(strToHex('Hello world!')).toEqual('48656c6c6f20776f726c6421');
    expect(strToHex('John Doe')).toEqual('4a6f686e20446f65');
  });

  test('Can correctly format hex length', () => {
    const getHexSize = connection['getHexSize'];

    expect(getHexSize(256)).toEqual('00010000');
    expect(getHexSize(60)).toEqual('3c000000');
  });

  test('Can make request', () => {
    const makeRequest = connection['makeRequest'].bind(connection);

    const tests = [
      {
        actual: {
          state: '',
          transitCmd: '98',
        },
        expected: 'bf000000fa00000001000000c5270000010000007b2276657273696f6e223a22312e30222c22636f6e74726f6c223a7b2262726f61646361737422' +
        '3a2230222c2274617267657454797065223a2232222c227461726765744964223a22433146353446453046313632343936383935393045463343364630343133' +
        '3342222c2261757468436f6465223a224142434445464748494a227d2c2276616c7565223a7b227374617465223a22222c227472616e736974436d64223a2239' +
        '38227d7d',
      },
      {
        actual: {
          john: 'doe',
          a: {
            b: 'c',
          },
        },
        expected: 'bd000000fa00000001000000c5270000010000007b2276657273696f6e223a22312e30222c22636f6e74726f6c223a7b2262726f61646361737422' +
        '3a2230222c2274617267657454797065223a2232222c227461726765744964223a22433146353446453046313632343936383935393045463343364630343133' +
        '3342222c2261757468436f6465223a224142434445464748494a227d2c2276616c7565223a7b226a6f686e223a22646f65222c2261223a7b2262223a2263227d' +
        '7d7d',
      },
    ];

    tests.forEach((test) => {
      expect(makeRequest(test.actual)).toEqual(Buffer.from(test.expected, 'hex'));
    });
  });

  test('Can send request', (done) => {
    const sendRequest = connection['sendRequest'].bind(connection);

    const req = Buffer.from('bf000000fa00000001000000c5270000010000007b2276657273696f6e223a22312e30222c22636f6e74726f6c223a7b2262726f6164' +
    '63617374223a2230222c2274617267657454797065223a2232222c227461726765744964223a22433146353446453046313632343936383935393045463343364630' +
    '3431333342222c2261757468436f6465223a224142434445464748494a227d2c2276616c7565223a7b227374617465223a22222c227472616e736974436d64223a22' +
    '3938227d7d');

    server.on('connection', (socket) => {
      socket.on('data', (data) => {
        expect(data).toEqual(req);
        done();
      });
    });

    connection.connect().then(() => {
      sendRequest(req);
    });
  });
});