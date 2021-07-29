import { CloseOutlined } from '@ant-design/icons';
import DragHeader from '@ui/components/DragHeader/DragHeader';
import { ipcSend } from '@ui/utils/ipcRequest';
import { AutoComplete, Button, Checkbox, Form, Input, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const { Password } = Input;
const { Option } = AutoComplete;

export interface AccountProps {
  account: string;
  password: string;
}

interface LoginProps {}

const Login = (props: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<AccountProps[]>([]);

  useEffect(() => {
    getDesignerCode();
    getAccount();
  }, []);

  useEffect(() => {
    // 判断是否自动登录
    ipcSend('get-sys-config').then(({ autologin: autoLogin } = {}) => {
      form.setFieldsValue({ autoLogin });
      autoLoginChange(autoLogin);
      if (autoLogin) {
        setTimeout(() => form.submit(), 1000);
      }
    });
  }, []);

  const getAccountList = () => {
    return ipcSend('get-user-account').catch(e => {
      console.log(e);
      message.warning('读取账号文件失败!');
      return [];
    });
  };

  const getAccount = () => {
    return getAccountList().then((accounts = []) => {
      setUserList(accounts);
      if (accounts.length !== 0) {
        form.setFieldsValue({
          account: accounts[0].account,
          password: accounts[0].password,
        });
      }
    });
  };

  const getDesignerCode = async () => {
    const mac = await ipcSend('get-mac');
    setCode(mac);
  };

  /* 设置本地缓存信息 */
  const setStorage = async loginData => {
    const { remember, account, password } = loginData;
    if (remember) {
      let list = await getAccountList();
      list = list.filter(item => item.account !== account);
      list.unshift({ account, password });
      saveList(list);
    }

    if (remember) {
      localStorage.setItem('remember', remember);
    } else {
      localStorage.removeItem('remember');
    }
    await ipcSend('set-sys-config', { autologin: !!loginData.autoLogin });
  };

  const saveList = async list => {
    try {
      await ipcSend('save-user-account', list);
      setUserList(list);
    } catch (e) {
      console.error(e);
      message.error('存储用户信息失败');
    }
  };

  const doLogin = async values => {
    let { account = '', password = '' } = values;
    account = account.trim();
    setLoading(true);
    try {
      await ipcSend('app-login', { account, password });
      setStorage(values);
    } catch (e) {
      message.error(e);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = useCallback(
    account => {
      const password = userList.find(option => option.account === account)?.password;
      form.setFieldsValue({
        password,
      });
    },
    [userList],
  );

  const autoLoginChange = (e: boolean) => {
    if (e) {
      form.setFieldsValue({ remember: e });
    }
  };

  return (
    <>
      <DragHeader></DragHeader>
      <div className={styles.close}>
        <CloseOutlined onClick={() => ipcSend('app-close')} />
      </div>

      <div className={styles.loginTitle}>
        <div>用户登录</div>
        <div className={styles.underLine} />
      </div>
      <Form form={form} className={styles.loginForm} onFinish={doLogin}>
        <Form.Item name="account" rules={[{ required: true, message: '请输入手机号!' }]}>
          <AutoComplete size="large" placeholder="请输入手机号 admin" onSelect={selectAccount}>
            {userList.map(i => (
              <Option key={i.account} value={i.account}>
                <div className={styles.accountOption}>{i.account}</div>
              </Option>
            ))}
          </AutoComplete>
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
          <Password size="large" placeholder="请输入密码 admin" />
        </Form.Item>
        <div>
          <Form.Item noStyle name="remember" valuePropName="checked">
            <Checkbox>记住密码</Checkbox>
          </Form.Item>
          <Form.Item noStyle name="autoLogin" valuePropName="checked">
            <Checkbox onChange={e => autoLoginChange(e.target.checked)}>自动登录</Checkbox>
          </Form.Item>
        </div>

        <Form.Item noStyle>
          <Button size="large" type="primary" htmlType="submit" className={styles.loginBtn} loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
      <div className={styles.machineCode}>机器编码：{code}</div>
    </>
  );
};

export default Login;
