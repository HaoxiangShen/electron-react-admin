import { Themes } from '@ui/types/Themes';
import { UpdateInfo } from 'electron-updater';

export class Context {
  public theme: Themes = 'light';
  public userName?: string;
  public access_token?: string;
  public refresh_token?: string;
  public updateInfo: UpdateInfo = { version: '10.0.0' } as any;
}
