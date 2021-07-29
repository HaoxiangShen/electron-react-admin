import { Application } from '../app';

export abstract class Service {
  protected app: Application;

  public plugin(app: Application) {
    this.app = app;
    this.run();
  }

  protected abstract run(): void;
}
