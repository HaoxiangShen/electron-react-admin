import { CloseOutlined, MinusOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { CloseType } from '@src/types';
import skinPng from '@ui/assets/icons/换肤.png';
import logoutImg from '@ui/assets/icons/登出.png';
import Menu from '@ui/components/Menu';
import { Themes } from '@ui/types/Themes';
import { ipcSend } from '@ui/utils/ipcRequest';
import { isMaxsize, maxSize, miniSize, switchSkin } from '@ui/utils/theme';
import { Divider, Layout, message, Tooltip } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { connect } from 'dva';
import { RouteComponentProps } from 'dva/router';
import { ipcRenderer, remote } from 'electron';
import React from 'react';
import { Resizable } from 'react-quick-resizable';
import { fromEvent } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import styles from './index.less';

const { Header, Sider, Content } = Layout;

const win = remote.getCurrentWindow();

interface WorkspaceLayoutProps extends RouteComponentProps {
  theme: Themes;
  setTheme(theme: Themes): void;
}

interface WorkspaceLayoutStates {
  userName: string;
  width: number;
}

class WorkspaceLayout extends React.Component<WorkspaceLayoutProps, WorkspaceLayoutStates> {
  state = {
    userName: '',
    width: 200,
  };

  componentDidMount() {
    ipcRenderer.on('toast', (_, msg) => message.warn(msg));
    ipcRenderer.on('theme-change', this.setTheme);
    this.getName();
    ipcSend('get-theme').then(res => {
      this.setTheme({}, res);
    });
  }

  componentWillUnmount() {
    ipcRenderer.off('theme-change', this.setTheme);
  }

  getName = async () => {
    const { userName } = await ipcSend('get-context');
    this.setState({ userName });
  };

  setTheme = (e, res) => {
    this.props.setTheme(res);
  };

  onlineStatusChange = () => {
    if (!navigator.onLine) {
      message.error({ content: '当前网络不可用', key: 'offLine', duration: 0 });
    } else {
      // @ts-ignore
      message.destroy('offLine');
    }
  };

  drag = (e: React.MouseEvent) => {
    const { pageX: xOld, pageY: yOld } = e;
    let timer;
    fromEvent(window, 'mousemove')
      .pipe(takeUntil(fromEvent(window, 'mouseup')))
      .pipe(
        // @ts-ignore
        tap((res: MouseEvent) => {
          const { pageX, pageY } = res;
          const [startX, startY] = win.getPosition();
          cancelAnimationFrame(timer);
          timer = requestAnimationFrame(() => {
            win.setPosition(startX + pageX - xOld, startY + pageY - yOld, true);
          });
        }),
      )
      .subscribe();
  };

  changeSize = e => {
    e.stopPropagation();
    e.preventDefault();
    maxSize();
    this.forceUpdate();
  };

  /**
   * @description 登出
   */
  logout = () => {
    ipcSend('set-sys-config', { autoLogin: false });
    ipcSend('app-logout');
  };

  changeSkin = e => {
    e.stopPropagation();
    e.preventDefault();
    switchSkin();
  };

  close = async e => {
    const { closeWindow } = await ipcSend('get-sys-config');
    if (closeWindow === CloseType.最小化到系统托盘) {
      ipcSend('hide-to-tray');
    } else if (closeWindow === CloseType.退出) {
      ipcSend('app-close');
    }
  };

  resize = ({ width: newWidth }) => {
    console.log(newWidth);
    this.setState({ width: newWidth });
  };

  render() {
    const { userName, width } = this.state;
    return (
      <Layout style={{ height: '100%' }}>
        <Header onMouseDown={this.drag} onDoubleClick={this.changeSize} className={styles.header}>
          <div style={{ flex: 1 }}></div>
          <div className={styles.rightInfo}>
            <span className={styles.accountName}>
              <Tooltip title="点击切换皮肤" placement="bottom">
                <img src={skinPng} className={styles.skinBtn} onClick={this.changeSkin} />
              </Tooltip>
              {userName}
              <img className={styles.logoutImg} src={logoutImg} onClick={this.logout} />
            </span>
            <Divider type="vertical" style={{ borderLeft: '1px solid rgba(256, 256, 256, 0.46)' }}></Divider>
            <MinusOutlined onClick={miniSize} />
            {!isMaxsize() ? (
              <PlusSquareOutlined onClick={this.changeSize} />
            ) : (
              <MinusSquareOutlined onClick={this.changeSize} />
            )}
            <CloseOutlined onClick={this.close} />
          </div>
        </Header>
        <Layout>
          <Sider width={width} className={styles.leftMenu} theme={this.props.theme}>
            <Resizable
              previewStyle={{ borderLeft: 'none', borderBottom: 'none', borderTop: 'none' }}
              directions={{ right: true }}
              height="100%"
              bounds="window"
              onResize={this.resize}
            >
              <Menu></Menu>
            </Resizable>
          </Sider>
          <Content className={styles.content}>
            <div className={styles.page}>
              {/* { 异常熔断，当页面发生未捕获错误时还可以切换菜单 } */}
              <ErrorBoundary>{this.props.children}</ErrorBoundary>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = ({ config: { theme } }) => ({
  theme,
});

const mapDispatchToProps = (dispatch: any) => ({
  setTheme: (theme: Themes) => {
    dispatch!({
      type: 'config/setTheme',
      payload: {
        theme,
      },
    });
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceLayout);
