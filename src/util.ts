import QueryString from 'query-string'

export function formatPath(url: string, params: object) {
  const urlSplit = url.split('?');
  if (urlSplit.length > 1 && urlSplit[1]) {
    const urlParams = QueryString.parse(url.split('?')[1]);
    params = Object.assign(urlParams, params);
    url = urlSplit[0];
  }

  const paramsStr = QueryString.stringify(params, { encode: false });
  url = `${url}?${paramsStr}`;

  return url;
}

export function compose(middleware: Function[]) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  return function (context: any, next?: Function) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i: number) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn: Function | undefined = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}