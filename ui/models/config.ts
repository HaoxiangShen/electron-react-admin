import { Themes } from '@ui/types/Themes';
import { ipcSend } from '@ui/utils/ipcRequest';
import { Effect } from 'dva';
import { Reducer } from 'redux';

export interface ConfigModelType {
  namespace: 'config';
  state: ConfigState;
  effects: {};
  reducers: {
    setTheme: Reducer<any>;
  };
}

export interface ConfigState {
  theme: Themes;
}
const ConfigModel: ConfigModelType = {
  namespace: 'config',
  state: {
    theme: 'light',
  },
  effects: {},
  reducers: {
    setTheme(state: ConfigState, { payload }): ConfigState {
      return {
        ...state,
        theme: payload.theme,
      };
    },
  },
};

export default ConfigModel;
