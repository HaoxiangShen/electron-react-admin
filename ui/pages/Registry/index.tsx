import { ipcSend } from '@ui/utils/ipcRequest';
import { Alert, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';

const { Item } = Form;

export default () => {
  const [reg, setReg] = useState<string>('');

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = async () => {
    const config = await ipcSend('get-reg-config', 'test');
    setReg(config);
  };

  const saveSetting = data => {
    ipcSend('set-reg-config', 'test', data).then(() => {
      setReg(data);
      message.success('设置成功');
    });
  };

  return (
    <Form labelCol={{ span: 4 }}>
      <Alert message="本功能目前只支持32位electron ，需要安装win-registry" type="warning" />
      <Item label="随便写入一些信息" style={{ marginTop: 20 }}>
        <Input value={reg} onChange={e => setReg(e.target.value)} onBlur={e => saveSetting(e.target.value)}></Input>
      </Item>
    </Form>
  );
};
