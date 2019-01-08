let redis = require('redis');
let dev = require('../development');
let returnUtils = require('../util/returnUtil');
let redisClient = redis.createClient({
    port: dev.redis_port,
    host: dev.redis_url
})

redisClient.on("error", function (err) {
    if (err) {
        console.error("redisClient err")//有重连机制，不做手动处理
    }
});

function uncaughtExceptionHandler(err) {
    if (err && err.code === 'ECONNREFUSED') {
        console.log(err);
    } else {
        console.error("uncaughtExceptionHandler");
        process.exit(1);
    }
}

process.on('uncaughtException', uncaughtExceptionHandler);

/**
 * 添加string类型的数据
 * @ key 键
 * @ value 值
 * @ expire (过期时间,单位秒;可为空，为空表示不过期)
 * @ cb(err,result)
 */
redisClient.Set = function (key, value, expire, cb) {
    try {
        redisClient.set(key, value, function (err, response) {
            if (!err) {
                returnUtils.invokeCallback(cb, null, response)
            } else {
                console.log(err);
                returnUtils.invokeCallback(cb, null, null)
            }
            if (!isNaN(expire) && expire > 0) {
                redisClient.expire(key, parseInt(expire));
            }
        });
    } catch (e) {
        returnUtils.invokeCallback(cb, null, null)
    }
}

redisClient.Get = function (key, cb) {
    try {
        redisClient.get(key, function (err, response) {
            if (!err) {
                returnUtils.invokeCallback(cb, null, response)
            } else {
                console.log(err);
                returnUtils.invokeCallback(cb, null, null)
            }
        });
    } catch (e) {
        returnUtils.invokeCallback(cb, null, null)
    }
}

redisClient.Del = function (key, cb) {
    try {
        redisClient.del(key, function (err, res) {
            if (err) {
                returnUtils.invokeCallback(cb, null, null);
                return;
            }
            returnUtils.invokeCallback(cb, null, res)
        });
    } catch (e) {
        returnUtils.invokeCallback(cb, null, null)
    }
}

redisClient.AsyncSet = async function (key, value, expire) {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res);
            if (!isNaN(expire) && expire > 0) {
                redisClient.expire(key, parseInt(expire));
            }
        })
    })
}

redisClient.AsyncGet = async function (key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res);
        })
    })
}

redisClient.AsyncDel = async function (key) {
    return new Promise((resolve, reject) => {
        redisClient.del(key, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res);
        })
    })
}

module.exports = redisClient;