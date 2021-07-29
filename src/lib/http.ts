import { Application } from '@src/app';
import { LoginDto, RefreshTokenDto } from '@src/types';
import { logger } from '@src/utils';
import { native } from '@src/utils/native';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { app } from 'electron';
import FormData from 'form-data';

interface LoginData {
  account: string;
  password: string;
}

/**
 * 处理接口请求，统一转发至主线程处理，可以避免多窗口token共享的问题
 *
 * @export
 * @class Http
 */
export class Http {
  private core: AxiosInstance;

  constructor(private readonly app: Application) {
    this.create();
    this.init();
  }

  private init() {}

  public async login(params: LoginData): Promise<LoginDto> {
    if (params.account === 'admin' && params.password === 'admin') {
      return { access_token: '1', refresh_token: '2', userName: '恶魔旋律' };
    }
    return this.core.post('v1/login', { ...params }) as Promise<LoginDto>;
  }

  public refreshToken() {
    return this.core.post(`v1/refreshToken`, { machineId: native.machine }) as Promise<RefreshTokenDto>;
  }

  public async logout() {
    return this.core.post(`v1/logout?machineId=${native.machine}`) as Promise<void>;
  }

  public checkUpdate() {
    const params = {
      currentVersion: app.getVersion(),
    };
    return this.core.get(process.env.config.update + 'api/rpa/version/v1/queryLatestVersion', {
      params,
    }) as Promise<any | undefined>;
  }

  private create() {
    this.core = axios.create({
      baseURL: process.env.config.url,
      headers: {
        client: 'runner',
        retry: 3,
      },
    });

    this.core.interceptors.request.use(config => this.requestPipe(config));
    this.core.interceptors.response.use(res => this.responsePipe(res));
  }
  private async requestPipe(config: AxiosRequestConfig) {
    config.headers.Cookie = getCookie(this.app.context.access_token!, this.app.context.refresh_token!);
    return config;
  }

  private async responsePipe(res: AxiosResponse) {
    let { data } = res;

    if (res.status === 200 && data.code === '0') {
      return data.result;
    }
    try {
      // token过期时退出
      if (data?.code === 'DL10001') {
        this.app.emit('login-window');
        this.app.emit('stop-work');
      } else if (data.hasOwnProperty('code') && data.code !== '0') {
        return Promise.reject(data?.message);
      } else {
        logger.error(res);
        return Promise.reject('请求错误');
      }
    } catch (error) {
      logger.error(res);
      return Promise.reject('请求错误');
    }
  }
}

/**
 *
 * 加密方法
 * @export
 * @param {*} data 明文字符串
 * @param {string} [key='zeJJPVUUNo7442DLAFTOhg=='] 秘钥
 * @returns
 */
export function Encrypt(data, key = 'zeJJPVUUNo7442DLAFTOhg==') {
  const parsed = CryptoJS.enc.Utf8.parse(key);
  const iv = CryptoJS.enc.Utf8.parse('90BB6E18-177E-4E');
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), parsed, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function getCookie(access_token: string = '', refresh_token: string = ''): string {
  if (!access_token && !refresh_token) return '';
  return `access_token=${access_token};refresh_token=${refresh_token}`;
}

export const getFormData = (data: Object): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key] || '');
  });
  return formData;
};
