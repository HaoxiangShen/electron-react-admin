import { Themes } from '@ui/types/Themes';
import { ipcSend } from '@ui/utils/ipcRequest';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';

export const UseTheme = (): [Themes] => {
  const [theme, setTheme] = useState<Themes>('light');

  useEffect(() => {
    ipcSend('get-theme').then(setTheme);

    const setConfig = (e, res) => setTheme(res);
    ipcRenderer.on('theme-change', setConfig);
    return () => {
      ipcRenderer.off('theme-change', setConfig);
    };
  }, []);
  return [theme];
};
