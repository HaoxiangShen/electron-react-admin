import packageInfo from '../../electron-builder.json';
import { logger } from './logger';
const PATH_SUFFIX = process.env.NODE_ENV === 'production' ? '' : 'Dev';
// const reg = require('win-registry');
const reg: any = {};
const { GetStringRegKey, SetStringRegKey } = reg;
// import { GetStringRegKey, SetStringRegKey } from 'win-registry';

/**
 * 处理注册表，长度过长时拆分
 *
 * @class Registry
 */
class Registry {
  private hive = 'HKEY_CURRENT_USER';
  private path = `Software\\${packageInfo.productName}` + PATH_SUFFIX;
  private maxChunkSize: number = 200;
  private EOF = '=';

  public async get(key: string): Promise<string | undefined> {
    if (!reg) {
      return;
    }
    logger.info('获取注册表信息');
    let value = GetStringRegKey(this.hive, this.path, key);

    logger.info('获取注册表信息', value);
    if (value) return value;
    value = '';
    let index = 0;
    let chunk = GetStringRegKey(this.hive, this.path, `${key}${index}`);
    while (chunk && !chunk.endsWith(this.EOF)) {
      value += chunk;
      index += 1;
      chunk = await GetStringRegKey(this.hive, this.path, `${key}${index}`);
    }
    return value;
  }

  public async set(key: string, value: string): Promise<any> {
    if (!reg) {
      return;
    }
    this.delete(key);
    if (value.length <= this.maxChunkSize) {
      SetStringRegKey(this.hive, this.path, key, value);
    } else {
      const chunks = chunkText(value, this.maxChunkSize);
      chunks.forEach((chunk, index) => {
        SetStringRegKey(this.hive, this.path, `${key}${index}`, chunk);
      });
    }
    return;
  }

  public delete(key: string) {
    if (GetStringRegKey(this.hive, this.path, key)) {
      SetStringRegKey(this.hive, this.path, key, '');
    }
    let index = 0;
    let chunk = GetStringRegKey(this.hive, this.path, `${key}${index}`);
    while (chunk) {
      SetStringRegKey(this.hive, this.path, `${key}${index}`, '');
      index += 1;
      chunk = GetStringRegKey(this.hive, this.path, `${key}${index}`);
    }
  }
}

function chunkText(text: string, size: number) {
  const chunkLength = Math.ceil(text.length / size);

  const chunks = new Array(chunkLength);

  for (let i = 0, o = 0; i < chunkLength; ++i, o += size) {
    chunks[i] = text.substr(o, size);
  }
  return chunks;
}

export const registry = new Registry();
