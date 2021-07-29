import { logger } from './logger';

export function before() {
  return (_target, name, descriptor) => {
    // 获取value，其实就是request函数
    const oldValue = descriptor.value;
    // 记录函数入参
    descriptor.value = async function () {
      logger.info(`执行方法[${name}],参数是`, arguments);
      return oldValue.apply(this, arguments);
    };
    return descriptor;
  };
}

export function after() {
  return (_target, name, descriptor) => {
    // 获取value，其实就是request函数
    const oldValue = descriptor.value;
    // 将value重新赋值一个函数
    descriptor.value = function (...args) {
      // 将原本的函数执行一下,apply改变this的指向
      try {
        const val = oldValue.apply(this, args);
        if (val instanceof Promise) {
          val
            .then(res => {
              logger.info(`执行方法[${name}],返回：`, res);
            })
            .catch(e => {
              logger.error(`执行方法[${name}],出现错误： `, e);
            });
        } else {
          logger.info(`执行方法[${name}],返回：`, val);
        }
        return val;
      } catch (error) {
        logger.error(`执行方法[${name}],出现错误： `, error);
      }
    };

    return descriptor;
  };
}
