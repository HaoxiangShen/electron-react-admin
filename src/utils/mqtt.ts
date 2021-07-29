import { EventEmitter } from 'events';
import * as mqtt from 'mqtt';
import { logger } from './logger';

export class Mqtt extends EventEmitter {
  private static client: mqtt.MqttClient | null; // 懒汉式单例，只处理所有mqtt消息发往同一个服务器

  constructor(private readonly option: MqttConstructorOptions) {
    super();
  }

  public async connect() {
    await this.getConnection();
  }

  public async send(topic: string, data: Object, opts: any): Promise<void> {
    const connection = await this.getConnection();
    return new Promise((resolve, reject) => {
      connection?.publish(topic, JSON.stringify(data), opts, err => {
        err ? reject(err) : resolve(void 0);
        if (err) logger.debug(err);
      });
    });
  }

  public async close() {
    logger.debug(`${this.option.name}主动断开`);
    Mqtt.client?.unsubscribe(this.option.topic);
    // Mqtt.client?.
    Mqtt.client?.end();
    Mqtt.client = null;
  }

  private async getConnection(): Promise<mqtt.MqttClient> {
    const client = await this.resolveConnection();
    client.unsubscribe(this.option.topic);
    client.subscribe(this.option.topic, { qos: 2 });

    return client;
  }

  private async resolveConnection(): Promise<mqtt.MqttClient> {
    if (!Mqtt.client) {
      // 意愿消息，断开连接时会触发
      const { requestUrl, username, password, timeout, clientId } = this.option;
      const reconnectPeriod = timeout,
        connectTimeout = timeout;
      const client = mqtt.connect(requestUrl, {
        clientId,
        username,
        password,
        clean: true,
        reconnectPeriod,
        connectTimeout,
        keepalive: 10,
        will: {
          topic: `mqtt/rpa/server/willMessage/${clientId}`,
          payload: JSON.stringify({
            messageId: `${clientId + new Date().getTime()}`,
            messageFlag: 'WILL_MESSAGE',
            data: { clientId: clientId },
          }),
          qos: 2,
          retain: false,
        },
      });

      client.on('message', (topic, payload, packet) => {
        logger.debug('接到mqtt消息');
        const data = JSON.parse(payload.toString());
        // data.messageFlag = topic;
        this.emit('message', data);
      });

      Mqtt.client = client;
      return new Promise((resolve, reject) => {
        logger.debug(`${this.option.name}正在连接`);
        client.on('connect', () => {
          logger.debug(`${this.option.name}连接成功`);
          this.emit('connect');
        });
        client.on('close', async () => {
          logger.debug(`${this.option.name}断开`);
          this.emit('disconnect');
        });
        resolve(client);
      });
    }
    return Mqtt.client;
  }
}

interface MqttConstructorOptions {
  requestUrl: string;
  timeout: number;
  name: string;
  topic: string;
  username: string;
  password: string;
  clientId: string;
  onFail?(): void;
}
