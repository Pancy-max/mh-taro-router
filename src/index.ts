import { Route, PushType, Middleware } from './type';
import { formatPath, compose } from './util';
import Taro from '@tarojs/taro';

interface routerOptions {
  taro: typeof Taro
  middlewares: Middleware[]
};
export {Route, Middleware};
export default class Router implements routerOptions{

  middlewares: Middleware[];
  taro: typeof Taro;
  pushType: typeof PushType;

  constructor({
    taro,
    middlewares = []
  }: routerOptions) {
    this.taro = taro;
    this.middlewares = middlewares;
    this.pushType = PushType;
  }

  /**
   * 页面跳转
   * @param route 目标路由对象
   */
  async push(route: Route): Promise<any> {
    route = { ...{ type: PushType.navigateTo, params: {} }, ...route };
    route.params = Object.assign({}, route.params);

    const url = formatPath(route.url, route.params);
    const fn = compose(this.middlewares);
    await fn(route);
    
    return new Promise(() => {
      switch (route.type) {
        case PushType.reLaunch:
          this.taro.reLaunch({ url });
          break;
        case PushType.redirectTo:
          this.taro.redirectTo({ url });
          break;
        case PushType.switchTab:
          this.taro.switchTab({ url });
          break;
        default:
          this.taro.navigateTo({ url });
          break;
      }
    });
  }

  /**
   * 返回上一个页面
   */
  back(options?: Taro.navigateBack.Option) {
    const currentPages = this.taro.getCurrentPages()
    if (currentPages.length > 1) {
      return this.taro.navigateBack(options)
    }

    throw new Error('没有页面可以回退了');
  }
}


