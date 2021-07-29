import { configure, getLogger } from 'log4js';
import packageInfo from '../../electron-builder.json';
import { Logger } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'dateFile',
      filename: `logs/${packageInfo.productName}`,
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: isProduction ? 'info' : 'debug' },
  },
});

export const logger = getLogger('normal');

export class OrmLogger implements Logger {
  logQuery(query: string, parameters?: any[]) {
    logger.debug('dbQuery:', query);
    logger.debug('dbParameters:', parameters);
  }
  logQueryError() {}
  logQuerySlow() {}
  logSchemaBuild() {}
  logMigration() {}
  log() {}
}
