import { CloseOutlined } from '@ant-design/icons';
import { Context } from '@src/types';
import { ipcSend } from '@ui/utils/ipcRequest';
import { Modal, Progress } from 'antd';
import { ipcRenderer, remote } from 'electron';
import React from 'react';
import styles from './index.less';

class Update extends React.Component {
  state = {
    progress: 0,
    latestVersion: '',
  };

  componentDidMount() {
    this.getLatestVersion();
    ipcRenderer.on('update-progress', (_, progress: number) => this.onProgress(progress));
  }

  getLatestVersion = async () => {
    const context: Context = await ipcSend('get-context');
    const updateInfo = context.updateInfo;
    if (updateInfo) {
      this.setState({ latestVersion: updateInfo?.version });
    }
  };

  onProgress = (progress: number) => {
    if (Number.isNaN(progress)) return;
    if (+progress >= this.state.progress) {
      this.setState({ progress });
    }
  };

  onAppClose = () => {
    Modal.confirm({
      title: '退出更新，将无法继续使用软件，确定退出么？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { className: 'linear' },
      onOk() {
        ipcSend('app-close');
      },
    });
  };

  render() {
    const { progress } = this.state;

    return (
      <div className={styles.updateWindow}>
        <div className={styles.windowTitleBar}>
          <div className={styles.windowTitle}>安装更新</div>
          <CloseOutlined onClick={this.onAppClose} />
        </div>
        <div className={styles.updateContent}>
          <div className={styles.updating}>
            <div className={styles.progress}>
              {progress}%<Progress percent={progress} trailColor="#ddd" showInfo={false}></Progress>
            </div>
            <div className={styles.tip}>下载更新中，请勿关闭</div>
          </div>
        </div>
        <div className={styles.updateInfo}>
          <p>
            当前版本：V{remote.app.getVersion()} 最新版本：V
            {this.state.latestVersion}
          </p>
          <p>更新完后将自动重启您的应用</p>
        </div>
      </div>
    );
  }
}

export default Update;
