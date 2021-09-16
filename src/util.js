/**
 * Created by administrator on 2019/3/20.
 */
import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
//跨域请求，允许保存cookie
axios.defaults.withCredentials = true;
//基本配置
const Util = {
    baseUtl:'//api.tiansc.top/music/'
};

//ajax 通用配置
Util.ajax = axios.create({
    // baseURL:Util.baseUtl,
});

//添加响应拦截器
Util.ajax.interceptors.response.use(res => {
    return res.data;
});

export default Util;
