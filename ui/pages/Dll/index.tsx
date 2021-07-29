import { ipcSend } from '@ui/utils/ipcRequest';
import { Button } from 'antd';
import React from 'react';

export default () => {
  return <Button onClick={() => ipcSend('call-dll')}>调用dll</Button>;
};
