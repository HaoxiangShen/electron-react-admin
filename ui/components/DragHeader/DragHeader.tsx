import React from 'react';
import styles from './index.less';

interface DragHeaderProps {}

const DragHeader: React.FC<DragHeaderProps> = ({ children }) => {
  return <div className={styles.header}>{children}</div>;
};

export default DragHeader;
