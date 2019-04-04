/**
 * 开发环境的配置内容
 */

module.exports = {
    env: 'development', /*环境名称*/
    url: '127.0.0.1',
    port: 3001,         //服务端口号
    // mongodb_url: 'mongodb://139.199.199.164:27017/gradu',//服务器数据库地址
    mongodb_url: 'mongodb://127.0.0.1:27017/gradu',//本地数据库地址
    redis_url: '127.0.0.1',       //redis地址
    redis_port: '6379'      //redis端口号
}