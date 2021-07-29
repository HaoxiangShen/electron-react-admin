import { app } from 'electron';
import { Window } from '../types/Window';

export class LoginWindow extends Window {
  protected width = 700;
  protected height = 480;
  protected name = 'login';

  created() {
    const window = this.getWindow();
    window.addListener('close', () => app.quit());
  }
}
