import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable} from '@ant-design/pro-components';
import {Button, Image} from 'antd';
import {useRef} from 'react';
import {searchUsers} from "@/services/ant-design-pro/api";
import {TableDropdown} from "@ant-design/pro-table";

export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};


const columns: ProColumns<API.CurrentUser>[] = [
  {
    dataIndex: 'id',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    copyable: true,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    copyable: true,
  },
  {
    title: '状态',
    dataIndex: 'userStatus',
  },
  {
    title: '头像',
    dataIndex: 'avatarUrl',
    render: (_, record) => (
      <div>
        <Image src={record.avatarUrl} width={100}  />
      </div>
    ),
  },
  {
    title: '性别',
    dataIndex: 'gender',
    valueEnum: {
      1: {
        text: '男',
      },
      0: {
        text: '女',
      },
    },
  },
  {
    title: '电话',
    dataIndex: 'phone',
    copyable: true,
    // ellipsis: true,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    copyable: true,
    // ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    valueType: 'select',
    valueEnum: {
      1: {
        text: '管理员',
        status: 'Success',
      },
      0: {
        text: '用户',
        status: 'Processing',
      },
    },
  },
  {
    title: '星球编号',
    dataIndex: 'planetCode',
  },



  // {
  //   disable: true,
  //   title: '状态',
  //   dataIndex: 'state',
  //   filters: true,
  //   onFilter: true,
  //   ellipsis: true,
  //   valueType: 'select',
  //   valueEnum: {
  //     all: { text: '超长'.repeat(50) },
  //     open: {
  //       text: '未解决',
  //       status: 'Error',
  //     },
  //     closed: {
  //       text: '已解决',
  //       status: 'Success',
  //       disabled: true,
  //     },
  //     processing: {
  //       text: '解决中',
  //       status: 'Processing',
  //     },
  //   },
  // },


  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(record.id);
        }}
      >
        编辑
      </a>,
      // <a href={record.avatarUrl} target="_blank" rel="noopener noreferrer" key="view">
      //   查看
      // </a>,
      <TableDropdown
        key="actionGroup"
        onSelect={() => action?.reload()}
        menus={[
          { key: 'copy', name: '复制' },
          { key: 'delete', name: '删除' },
        ]}
      />,
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();

  return (
    <ProTable<API.CurrentUser>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      // @ts-ignore
      request={async (params, sort, filter) => {
        console.log(sort, filter);
        await waitTime(2000);
        const userList = await searchUsers();
        return {
          data: userList
        }
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        defaultValue: {
          option: { fixed: 'right', disable: true },
        },
        onChange(value) {
          console.log('value: ', value);
        },
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      form={{
        // 由于配置了 transform，提交的参数与定义的不同这里需要转化一下
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
            };
          }
          return values;
        },
      }}
      pagination={{
        pageSize: 5,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="高级表格"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建
        </Button>,
      ]}
    />
  );
};
