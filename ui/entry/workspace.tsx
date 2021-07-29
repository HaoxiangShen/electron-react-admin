import Base from '@ui/components/Base';
import WorkspaceLayout from '@ui/layouts/WorkspaceLayout';
import ConfigModel from '@ui/models/config';
import Dll from '@ui/pages/Dll';
import Order from '@ui/pages/Order';
import Registry from '@ui/pages/Registry';
import Setting from '@ui/pages/Setting';
import Start from '@ui/pages/Start';
import UpdateCheck from '@ui/pages/UpdateCheck';
import dva from 'dva';
import { Redirect, Route, Router, Switch } from 'dva/router';
import React, { useEffect, useState } from 'react';

const app = dva({});

app.model(ConfigModel);

app.router(router => {
  const { history } = router!;
  const [location, setLocation] = useState<any>();

  useEffect(() => {
    // 只是为了触发更新，似乎是react router版本有点问题，否则路由切换时不更新
    history.listen(res => {
      setLocation(res);
    });
  }, []);

  return (
    <Router history={history}>
      <Base>
        <WorkspaceLayout>
          <Switch>
            <Redirect from="/" to="/setting" exact />
            <Route path="/setting" component={Setting} />
            {/* <Route path="/registry" component={Registry} /> */}
            <Route path="/update" component={UpdateCheck} />
            <Route path="/drag">
              <div>左侧面板可以拖拽改变大小</div>
            </Route>
            <Route path="/order" component={Order} />
            <Route path="/dll" component={Dll}></Route>
            <Route path="/start" component={Start}></Route>
          </Switch>
        </WorkspaceLayout>
      </Base>
    </Router>
  );
});

app.start('#root');
