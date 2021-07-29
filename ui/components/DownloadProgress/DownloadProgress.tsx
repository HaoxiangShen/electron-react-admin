import { Progress } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './index.less';

interface DownloadProgressProps {
  process?: Promise<any>; // 传递进来一个promise,用于结束
  percent?: number; // 传递进来一个数字，表示当前的进度
  style?: any;
}
const DownloadProgress = (props: DownloadProgressProps) => {
  const { process, percent, style } = props;
  const [perc, setPercent] = useState<number>(-1); // 当perc为-1的时候，表示外部传进来了进度

  const randomTime = () => {
    if (perc < 99) {
      setPercent(time => Math.min(time + 1, 100));
    }
  };
  useEffect(() => {
    if (!process && percent === undefined) {
      setPercent(0);
    }
  }, [process, percent]);
  useEffect(() => {
    if (process) {
      setPercent(0);
      process.finally(() => {
        setPercent(100);
      });
    }
  }, [process]);
  useEffect(() => {
    if (perc !== -1) {
      const time = Math.min(Math.pow(1.1, perc) * 10, 2000);
      setTimeout(() => {
        randomTime();
      }, time);
    }
  }, [perc]);
  return (
    <div className={styles.process} style={style}>
      <p className={styles.percentLabel}>{perc === -1 ? percent : perc}%</p>
      <Progress percent={perc === -1 ? percent : perc} strokeColor="#3597FF" showInfo={false} />
    </div>
  );
};

export default DownloadProgress;
