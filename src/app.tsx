import { AvatarDropdown, AvatarName, Footer, Question } from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import {RequestConfig, RunTimeLayoutConfig} from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import {message} from "antd";
import {stringify} from "querystring";
import {AxiosResponse} from "axios";

const isDev = process.env.NODE_ENV === 'development';

const loginPath = '/user/login';
const NO_NEED_LOGIN_WHITELIST = ['/user/register', loginPath];



export const request: RequestConfig = {
  //baseUrl不加端口8080可以
  baseURL:process.env.NODE_ENV === 'production' ? 'https://springboot-cy09-144378-5-1346809069.sh.run.tcloudbase.com' : undefined,
  timeout:100000,

  //下面这两个都可以，因为加上端口8080也识别不出来，和不加一样
  // prefix:process.env.NODE_ENV === 'production' ? 'http://192.144.211.225:8080' : undefined,
  // prefix:process.env.NODE_ENV === 'production' ? 'http://192.144.211.225' : undefined,

  // 响应拦截器
  responseInterceptors: [
    // @ts-ignore
    function <T extends AxiosResponse<T> = any>(response: AxiosResponse<T>): WithPromise<AxiosResponse<T>> {
      // console.log('全局响应拦截器', response);
      // response.data就是后端返回给前端的数据
      // console.log('全局响应拦截器', response.data);
      //这里code报错并没有问题，code是从response.data拿到的，可以从打印的信息中看到
      if (response.data.code === 0){
        return Promise.resolve(response.data);
      }
      if (response.data.code === 40100) {
        message.error('请先登录');
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: location.pathname,
          }),
        });
        return Promise.reject(new Error('未登录'));
      } else {
        console.log('全局响应拦截器', response.data.message);
        // @ts-ignore
        return Promise.reject(new Error(response.description || '请求出错'));
      }
    }
  ]
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // alert(process.env.NODE_ENV)
      const currentUser = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();

    return {
      // @ts-ignore
      fetchUserInfo,
      // @ts-ignore
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  return {
    // @ts-ignore
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />],
    avatarProps: {
      src: initialState?.currentUser?.avatarUrl,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      //解决输入注册url路径重定向问题

      if (NO_NEED_LOGIN_WHITELIST.includes(location.pathname)) return;

      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};


