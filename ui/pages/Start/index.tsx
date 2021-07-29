import { ipcSend } from '@ui/utils/ipcRequest';
import { Button, message } from 'antd';
import React from 'react';

export default () => {
  const getStart = () => {
    ipcSend('get-start-param').then(res => {
      message.success('启动参数：' + res);
    });
  };
  return <Button onClick={() => getStart()}>获取启动参数</Button>;
};
