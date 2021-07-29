import { Service } from '@src/types/Service';
import { setIpcReplier } from '@src/utils';
import { database } from '@src/utils/database';

/**
 * 后面database中的内容应当分散到各个业务service中
 *
 * @export
 * @class OrderService
 * @extends {Service}
 */
export class OrderService extends Service {
  constructor() {
    super();
  }

  run() {
    setIpcReplier('create-order', value => database.createOrder(value));
    setIpcReplier('query-order', value => database.queryOrder(value));
    setIpcReplier('delete-order', value => database.deleteOrder(value));
    setIpcReplier('update-order', value => database.updateOrder(value));
  }
}
