import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { OrderEntity } from '@src/models';
import { ipcSend } from '@ui/utils/ipcRequest';
import { message } from 'antd';
import React, { useRef } from 'react';
import OrderForm from './OrderForm';

export default () => {
  const columns: ProColumns<OrderEntity>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 48,
      search: false,
      editable: false,
    },
    {
      title: '订单名',
      dataIndex: 'orderName',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a onClick={() => remove(record)}>删除</a>,
        <TableDropdown
          key="actionGroup"
          onSelect={() => action?.reload()}
          menus={[
            {
              key: 'delete',
              name: '删除',
              onClick: () => remove(record),
            },
          ]}
        />,
      ],
    },
  ];

  const actionRef = useRef<ActionType>();

  const create = (value: OrderEntity): Promise<any> => {
    return ipcSend('create-order', value)
      .then(() => {
        message.success('创建订单成功');
        actionRef.current?.reload();
      })
      .catch(e => {
        message.error('创建订单失败');
      });
  };

  const search = async (value: OrderEntity): Promise<{ data: OrderEntity[] }> => {
    const data = await ipcSend('query-order', value);
    console.log(data);
    return { data };
  };

  const remove = async (value): Promise<any> => {
    return ipcSend('delete-order', value)
      .then(() => {
        message.success('删除订单成功');
        actionRef.current?.reload();
      })
      .catch(e => {
        message.error('删除订单失败');
      });
  };

  const update = async (value: OrderEntity): Promise<any> => {
    return ipcSend('update-order', value)
      .then(() => {
        message.success('编辑订单成功');
        actionRef.current?.reload();
      })
      .catch(e => {
        message.error('编辑订单失败');
      });
  };

  return (
    <ProTable<OrderEntity>
      columns={columns}
      actionRef={actionRef}
      editable={{
        type: 'multiple',
        onSave: (_, reocrd) => {
          console.log(reocrd);
          return update(reocrd);
        },
        onDelete: id => remove({ id }),
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{
        pageSize: 5,
      }}
      dateFormatter="string"
      headerTitle="订单列表"
      toolBarRender={() => [<OrderForm create={create} />]}
      request={(params, sorter, filter) => {
        // 表单搜索项会从 params 传入，传递给后端接口。
        console.log(params, sorter, filter);

        // @ts-ignore
        return search(params);
      }}
    />
  );
};
