import { ipcSend } from '@ui/utils/ipcRequest';
import { Checkbox, Form, message } from 'antd';
import { remote } from 'electron';
import React, { useEffect, useState } from 'react';

const { Item } = Form;

export default () => {
  const [autoUpdate, setAutoUpdate] = useState<boolean>(false);
  useEffect(() => {
    getConfig();
    remote.getCurrentWindow().on('show', getConfig);
    return () => {
      remote.getCurrentWindow().off('show', getConfig);
    };
  }, []);

  const getConfig = async () => {
    const { autoUpdate } = await ipcSend('get-sys-config');
    setAutoUpdate(autoUpdate);
  };

  const checkUpdate = async () => {
    await ipcSend('check-update');
  };

  const saveSetting = data => {
    ipcSend('set-sys-config', data).then(() => {
      setAutoUpdate(data.autostart);
      message.success('设置成功');
    });
  };

  return (
    <Form labelCol={{ span: 4 }}>
      <Item label="启动项设置">
        <a onClick={checkUpdate}>检查更新</a>
      </Item>
      <Item label="自动检查更新">
        <Checkbox checked={autoUpdate} onChange={e => saveSetting({ autoUpdate: e.target.checked })}>
          自动检查更新
        </Checkbox>
      </Item>
    </Form>
  );
};
