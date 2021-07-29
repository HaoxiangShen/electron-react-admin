import { Themes } from '@ui/types/Themes';
import { Menu } from 'antd';
import { connect } from 'dva';
import { Link, RouteComponentProps, withRouter } from 'dva/router';
import { remote, shell } from 'electron';
import React from 'react';
import styles from './index.less';

const { Item } = Menu;

interface MenusProps extends RouteComponentProps {
  theme: Themes;
}

const Menus = (props: MenusProps) => {
  const { theme, history } = props;
  const { location } = history;
  const { pathname } = location;

  const openOfficial = () => {
    shell.openExternal('https://github.com/HaoxiangShen');
  };

  console.log(props);

  console.log(pathname);
  return (
    <>
      <Menu
        selectedKeys={[pathname]}
        mode="inline"
        theme={theme}
        style={{ borderRight: 'none', backgroundColor: 'transparent' }}
      >
        {menus.map(route => (
          <Item key={route.path}>
            <Link to={route.path}>{route.name}</Link>
          </Item>
        ))}
      </Menu>
      <div className={styles.footer}>
        <div className={styles.site} onClick={openOfficial}>
          官方网站
        </div>
        <div className={styles.version}>版本：V{remote.app.getVersion()}</div>
      </div>
    </>
  );
};

const mapStateToProps = ({ config: { theme } }) => ({
  theme,
});

const mapDispatchToProps = (dispatch: any) => ({});
// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Menus));

export const menus = [
  { path: '/setting', name: '普通持久化示例' },
  // { path: '/registry', name: '注册表设置示例' },
  { path: '/update', name: '更新示例' },
  { path: '/drag', name: '拖拽示例' },
  { path: '/order', name: 'sqlite交互示例' },
  { path: '/dll', name: '调用dll示例' },
  { path: '/start', name: '获取启动参数' },

  // { path: '/test4', name: 'mqtt交互示例' },
];
