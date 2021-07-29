import { GoodEntity, OrderEntity } from '@src/models';
import { app } from 'electron';
import { resolve } from 'path';
import { Connection, createConnection } from 'typeorm';

export class Datebase {
  private connection: Connection;

  constructor() {
    this.connect();
  }

  private async connect() {
    const file = process.env.NODE_ENV === 'development' ? 'autowork.dev.db' : 'autowork.db';

    this.connection = await createConnection({
      type: 'sqlite',
      database: resolve(app.getPath('userData'), file),
      entities: [GoodEntity, OrderEntity],
      synchronize: true,
      logging: 'all',
    });
  }

  public getConnection() {
    return this.connection;
  }

  public createOrder(values: OrderEntity) {
    const builder = this.connection.createQueryBuilder(OrderEntity, 'order');
    return builder.insert().values(values).execute();
  }

  public queryOrder(values: OrderEntity) {
    const { orderName = '', address = '' } = values;
    return this.connection
      .createQueryBuilder(OrderEntity, 'order')
      .where('order.orderName LIKE :orderName', { orderName: `%${orderName}%` })
      .andWhere('order.address LIKE :address', { address: `%${address}%` })
      .getMany();
  }

  public deleteOrder(values: OrderEntity) {
    const { id } = values;
    const builder = this.connection.createQueryBuilder(OrderEntity, 'order');
    return builder.delete().where({ id }).execute();
  }

  public updateOrder(values: OrderEntity) {
    const { id, orderName, address } = values;
    return this.connection
      .createQueryBuilder(OrderEntity, 'order')
      .update(OrderEntity)
      .where({ id })
      .set({ orderName, address })
      .execute();
  }
}

export const database = new Datebase();
