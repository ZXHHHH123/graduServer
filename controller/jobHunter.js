/**
 * Created by admin-pc on 2019/4/29.
 *
 * 求职者接口
 */
let model = require('../model/model');
let utils = require('../config/util/utils');
let redisUtil = require('../config/util/redisUtil');

/*
* 求职者获取系统推荐的工作接口
* */
async function earnRecommendJob(ctx, body) {
  try {
    let body = ctx.request.body;
    let user = await utils.getUser(ctx);
    if(user) {
    
    }else {
      ctx.body = {
        code: 401,
        msg: '请重新登录'
      }
    }
  }catch (err) {
    console.log('earnRecommendJob----------------' + err);
  }
}


module.exports = {
  earnRecommendJob,
};