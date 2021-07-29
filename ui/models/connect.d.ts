import { FlowDataState } from '@src/types';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { ConfigState } from './config';

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & {
    select: <T>(func: (state: ConnectState) => T) => T;
  },
) => void;

/**
 * @type P: Type of payload
 * @type C: Type of callback
 */
export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
  };
}

export interface ConnectState {
  config: ConfigState;
}

/**
 * @type T: Params matched in dynamic routing
 * @type R: Instance type of ref
 */
export interface ConnectProps<T extends { [key: string]: any } = {}, R = any> extends React.Props<R> {
  dispatch?: Dispatch;
  location?: Location;
  match?: {
    isExact: boolean;
    params: T;
    path: string;
    url: string;
  };
  loading?: Loading;
}

export interface ConnectFormProps extends ConnectProps {}

export default ConnectState;
