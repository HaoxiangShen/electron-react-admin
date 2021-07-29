import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

/**
 * 订单
 *
 * @export
 * @class OrderEntity
 */
@Entity({ name: 'order' })
export class OrderEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { nullable: false })
  orderName: string;

  @Column('varchar', { nullable: false })
  address: string;

  @OneToMany(() => GoodEntity, good => good.order, { onDelete: 'CASCADE' })
  goods: GoodEntity[];
}

/**
 * 商品
 *
 * @export
 * @class GoodEntity
 */
@Entity({ name: 'good' })
export class GoodEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { nullable: false })
  goodNmae: string;

  @ManyToOne(() => OrderEntity, order => order.goods, { onDelete: 'CASCADE' })
  order: OrderEntity;
}
