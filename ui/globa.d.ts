import { Subject } from 'rxjs';
import { Cache } from './types';
import { FlowEvent } from './types/FlowEvent';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      config: {
        url: string;
        update: string;
      };
      NODE_ENV: 'development' | 'production';
    }
  }
  interface Window {
    event$: Subject<FlowEvent> | undefined;
  }
}
