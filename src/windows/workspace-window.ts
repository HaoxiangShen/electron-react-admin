import { app } from 'electron';
import { Window } from '../types/Window';

export class WorkspaceWindow extends Window {
  protected width = 1440;
  protected height = 812;
  protected name = 'workspace';

  created() {
    const window = this.getWindow();
    window.addListener('close', () => app.quit());
  }
}
