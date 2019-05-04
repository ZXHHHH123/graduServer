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

async function saveExpectJobInfo(ctx, body) {
  try{
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    console.log(body);
    let {expectJobLabel, expectJobValue, expectCity, expectCityValue, expectUpMoney, expectFloorMoney, expectIndustry} = data;
    console.log(expectUpMoney);
    if(expectJobLabel) {
      user.expectJobLabel = expectJobLabel;
    }
    if(expectJobValue) {
      user.expectJobValue = expectJobValue;
    }
    if(expectCity) {
      user.expectCity = expectCity;
    }
    if(expectCityValue) {
      user.expectCityValue = expectCityValue;
    }
    if(expectUpMoney) {
      user.expectUpMoney = expectUpMoney;
    }
    if(expectFloorMoney) {
      user.expectFloorMoney = expectFloorMoney;
    }
    if(expectIndustry) {
      user.expectIndustry = expectIndustry;
    }
    await user.save();
    ctx.body={
      code: 200,
      msg: '保存求职意向成功'
    }
  
  
  
  }catch (err) {
    console.log('saveExpectJobInfo============' + err);
  }
}

/*求职者保存个人的工作经历接口*/
async function saveWorkExpericence(ctx, body) {
  try {
    console.log('saveWorkExpericence----------start');
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let {companyName, startTime, endTime, workContent, index, isDeliverWorkExperience} = data;
    //todo if index 存在，则更新工作经历---splice，否则就添加---push
    console.log(index);
    let newWorkExperience = {companyName, startTime, endTime, workContent};
    let workExperience = Array.from(user.workExperience);
    if(isDeliverWorkExperience) {
      workExperience.splice(index, 1, newWorkExperience)
    }else {
      workExperience.push(newWorkExperience);
    }
    user.workExperience = workExperience;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '存储个人工作经历成功'
    };
    console.log(data);
  }catch (err) {
    console.log('saveWorkExpericence============'  + err);
  }
}

/*求职者获取个人微简历*/
async function earnJobHunterCurriculumviate(ctx, body) {
  let sign = ctx.request.header.authorization;
  sign = sign.substring(7);
  let userId = await redisUtil.AsyncGet(sign);
  let jobHunterCurriculumviate = await model.user.findOne({_id: userId}, {
    nickName: 1,
    studyBackground: 1,
    joinWorkTime: 1,
    birthday: 1,
    image: 1,
    personAccount: 1,
    presentJobWantedIntention: 1,
    workExperience: 1,
    expectJobLabel: 1,
    expectJobValue: 1,
    expectCity: 1,
    expectCityValue: 1,
    expectUpMoney: 1,
    expectFloorMoney: 1,
  });
  console.log(jobHunterCurriculumviate);
  ctx.body = {
    code: 200,
    msg: '查找成功',
    data: jobHunterCurriculumviate
  }
}

/*更新求职者求职意向*/
async function updateJobWantedIntention (ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    console.log(data);
    user.presentJobWantedIntention = data.value;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '更新成功'
    }
  }catch (err) {
    ctx.body = {
      code: 400,
      msg: '更新失败'
    };
    console.log('updateJobWantedIntention=============' + err);
  }
 
  // let
}

async function deleteSingleWorkExpericence(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let {index} = data;
    //todo if index 存在，则更新工作经历---splice，否则就添加---push
    let workExperience = Array.from(user.workExperience);
    workExperience.splice(index, 1);
    user.workExperience = workExperience;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '删除成功'
    }
  }catch (err) {
    console.log('deleteSingleWorkExpericence=========' + err);
  }
}

module.exports = {
  earnRecommendJob,
  saveExpectJobInfo,
  saveWorkExpericence,
  deleteSingleWorkExpericence,
  earnJobHunterCurriculumviate,
  updateJobWantedIntention
};