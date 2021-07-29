import { CloseType } from '@src/types/SystemConfigState';
import { ipcSend } from '@ui/utils/ipcRequest';
import { Checkbox, Form, message, Radio } from 'antd';
import { remote } from 'electron';
import React, { useEffect, useState } from 'react';

const { Item } = Form;

export default () => {
  const [setting, setSetting] = useState<any>({ autostart: false, autologin: true, closeWindow: CloseType.退出 });
  useEffect(() => {
    getConfig();
    remote.getCurrentWindow().on('show', getConfig);
    return () => {
      remote.getCurrentWindow().off('show', getConfig);
    };
  }, []);

  const getConfig = async () => {
    const config = await ipcSend('get-sys-config');
    setSetting(config);
  };

  const saveSetting = data => {
    ipcSend('set-sys-config', data).then(() => {
      setSetting(e => ({ ...e, ...data }));
      message.success('设置成功');
    });
  };

  return (
    <Form labelCol={{ span: 4 }}>
      <Item label="启动项设置">
        <Checkbox checked={setting.autostart} onChange={e => saveSetting({ autostart: e.target.checked })}>
          开机自动启动
        </Checkbox>
      </Item>
      <Item label="登录设置">
        <Checkbox checked={setting.autologin} onChange={e => saveSetting({ autologin: e.target.checked })}>
          打开后自动登录
        </Checkbox>
      </Item>
      <Item label="关闭主界面">
        <Radio.Group onChange={e => saveSetting({ closeWindow: e.target.value })} value={setting.closeWindow}>
          <Radio value={CloseType.最小化到系统托盘}>最小化到系统托盘</Radio>
          <Radio value={CloseType.退出}>退出</Radio>
        </Radio.Group>
      </Item>
    </Form>
  );
};
