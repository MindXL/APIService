import axios, { AxiosInstance } from 'axios';
import { readdirSync } from 'fs';

import { Time } from '../utils';

type axiosCacheData = {
    [key: string]: {
        expire: number;
        data: any;
    };
};
type axiosCache = {
    [key: string]: axiosCacheData;
};

export const cache = (axiosi: AxiosInstance) => {
    const excludeFiles = ['index', 'cache'].map(file => file + '.js');
    const cacheKeys = readdirSync(__dirname)
        .filter(file => {
            return file.endsWith('.js') && excludeFiles.indexOf(file) === -1;
        })
        .map(file => file.slice(0, -3));

    let cache: axiosCache = {};
    cacheKeys.map(key => {
        cache[key] = {};
    });

    // 每隔10分钟清除cache内容
    setInterval(() => {
        cacheKeys.map(key => {
            cache[key] = {};
        });
    }, Time.minute * 10);

    const EXPIRE_TIME = Time.second * 10;
    // 利用axios的cancelToken来取消请求
    const CancelToken = axios.CancelToken;

    // 请求拦截器中用于判断数据是否存在以及过期 未过期直接返回
    axiosi.interceptors.request.use(config => {
        // 如果需要缓存--考虑到并不是所有接口都需要缓存的情况
        if (config.cache) {
            const source = CancelToken.source();
            config.cancelToken = source.token;

            // 去缓存池获取缓存数据
            const uri = config.uri!;
            let cacheData;
            if (cacheKeys.indexOf(uri) !== -1)
                cacheData = cache[uri]?.[config.keyword!];
            // cacheData = cache[uri]?.[config.params.json2];

            // 判断缓存池中是否存在已有数据 存在的话 再判断是否过期
            // 未过期 source.cancel会取消当前的请求 并将内容返回到拦截器的err中
            if (cacheData && getExpireTime() - cacheData.expire < EXPIRE_TIME) {
                source.cancel(JSON.stringify(cacheData));
            }
        }
        return config;
    });

    // 如果数据没有缓存,响应拦截器中用于缓存数据
    axiosi.interceptors.response.use(
        response => {
            if (response.config.cache) {
                // 只缓存get请求
                if (response.config.method === 'get') {
                    // 若为空的{}
                    if (Object.keys(response.data).length === 0)
                        return response;

                    // 缓存数据 并将当前时间存入 方便之后判断是否过期
                    const data = {
                        expire: getExpireTime(),
                        data: response.data,
                    };

                    const uri = response.config.uri!;
                    if (cacheKeys.indexOf(uri) !== -1)
                        cache[uri][response.config.keyword!] = data;
                }
            }
            return response;
        },
        error => {
            // 请求拦截器中的source.cancel会将内容发送到error中
            // 通过axios.isCancel(error)来判断是否返回有数据 有的话直接返回给用户
            if (axios.isCancel(error))
                return Promise.resolve(JSON.parse(error.message));
            // 如果没有的话 则是正常的接口错误 直接返回错误信息给用户
            return Promise.reject(error);
        }
    );
};

// 获取当前时间
function getExpireTime(): number {
    return new Date().getTime();
}
