import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { OrderEntity } from '@src/models';
import { Button, FormInstance } from 'antd';
import React, { useRef, useState } from 'react';

interface OrderFormProps {
  create(value: OrderEntity): Promise<any>;
}

const OrderForm: React.FC<OrderFormProps> = ({ create }) => {
  const formRef = useRef<FormInstance>();
  const [visible, setVisible] = useState<boolean>(false);

  const finish = async (values: OrderEntity) => {
    await create(values);
    reset();
    setVisible(false);
    return;
  };

  const reset = async () => {
    formRef.current?.resetFields();
    setVisible(false);
    return;
  };
  return (
    <ModalForm<OrderEntity>
      title="新建订单"
      formRef={formRef}
      trigger={
        <Button type="primary" onClick={() => setVisible(true)}>
          <PlusOutlined />
          新建
        </Button>
      }
      visible={visible}
      modalProps={{ onCancel: async () => reset() }}
      onFinish={async values => finish(values)}
    >
      <ProFormText name="orderName" label="订单名" initialValue="" />
      <ProFormTextArea name="address" label="订单地址" />
    </ModalForm>
  );
};

export default OrderForm;
