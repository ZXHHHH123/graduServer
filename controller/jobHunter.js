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
    let data = ctx.request.body;
    console.log(data);
    let {city, company, require} = data;
    let companyPeopleNum, companyIndustry,financeState;
    if(company[0] === '融资阶段') {
      financeState = company[1]
    }else if(company[0] === '人员规模'){
      companyPeopleNum = company[1]
    }else if(company[0] === '行业'){
      companyIndustry = company[1]
    }
    
    let studyRequire, experienceRequire, upMoney, floorMoney;
    if(require[0] === '学历'){
      studyRequire = require[1];
    }else if(require[0] === '薪水'){
      upMoney = require[1].split('~')[0]; floorMoney = require[1].split('~')[1];
    }else if(require[0] === '经验'){
      experienceRequire =  require[1]
    }
    console.log(studyRequire, experienceRequire);
    let user = await utils.getUser(ctx);
    if (user) {
      let {expectJobLabel, expectCityValue} = user;
      console.log(expectJobLabel);
      let allRecommendJob
      if(studyRequire) {
        if(studyRequire === '全部') {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
          });
        }else {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
            studyRequire
          });
        }
      }else if(experienceRequire){
        if(experienceRequire === '全部') {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
          });
        }else {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
            experienceRequire,
          });
        }
        
      }
 
      console.log('aaaaaaaaa');
      console.log(allRecommendJob.length);
      let filterJob = allRecommendJob.filter((item, index) => {
        console.log(item.companyIndustry);
        if(companyPeopleNum) {
          let companyPeopleNumArr = (companyPeopleNum.substring(companyPeopleNum.length-1,0)).split('~');
          let companyPeopleNumFloor = parseInt(companyPeopleNumArr[0]);
          let companyPeopleNumUp = parseInt(companyPeopleNumArr[1]);
          let jobPeopleNumArr = (item.companyPeopleNum.substring(item.companyPeopleNum.length-1,0)).split('~');
          let jobPeopleNumFloor = parseInt(jobPeopleNumArr[0]);
          let jobPeopleNumUp = parseInt(jobPeopleNumArr[1]);
          console.log(jobPeopleNumFloor);
          console.log(companyPeopleNumFloor);
          console.log((jobPeopleNumFloor>=(companyPeopleNumFloor -20)) && (jobPeopleNumFloor<=(companyPeopleNumFloor +20 )));
          console.log((jobPeopleNumUp>=(companyPeopleNumUp -20 ) && jobPeopleNumUp<=(companyPeopleNumUp +20 )));
          if((jobPeopleNumFloor>=(companyPeopleNumFloor -20)) && (jobPeopleNumFloor<=(companyPeopleNumFloor +20 )) || (jobPeopleNumUp>=(companyPeopleNumUp -20 ) && jobPeopleNumUp<=(companyPeopleNumUp +20 ))){
            return item
          }
        }
        if(companyIndustry) {
          if(companyIndustry === '全部'){
            return item
          }
          if(item.companyIndustry.indexOf(companyIndustry) >=0) {
            console.log(999999999999);
            return item
          }
        }
       
      });
      
      // allRecommendJob.map((item, index) => {
      //
      // })
      ctx.body = {
        code: 200,
        msg: '推荐成功',
        data: filterJob
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '请重新登录'
      }
    }
  } catch (err) {
    console.log('earnRecommendJob----------------' + err);
  }
}

async function earnJobDetail(ctx, body) {
  try {
    let data = ctx.request.body;
    let jobId = data.jobId;
    let job = await model.jobType.findOne({_id: jobId});
    console.log(job);
    ctx.body = {
      code: 200,
      msg: '查找工作成功',
      data: job,
    }
  } catch (err) {
    console.log('earnJobDetail===========' + err);
  }
}

async function earnRecommendCompany(ctx, body) {
  try {
    let body = ctx.request.body;
    let user = await utils.getUser(ctx);
    if (user) {
      /*tudo 如果没有筛选值，就将所有符合求职者的‘期望工作类型的值’的公司传递过去*/
      let {expectIndustry} = user;
      console.log(user);
      let company = await model.company.find();
      console.log(company);
      let recommendCompany = company.filter((item, index) => {
        let companyIndustry = item.companyIndustry;
        if (companyIndustry.indexOf(expectIndustry) >= 0) {
          return item;
        }
      });
      console.log('recommendCompany=======');
      console.log(recommendCompany);
      ctx.body = {
        code: 200,
        msg: '获取推荐公司成功',
        data: recommendCompany
      }
    }
  } catch (err) {
    console.log('earnRecommendCompany================' + err);
  }
}

async function saveExpectJobInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    console.log(body);
    let {expectJobLabel, expectJobValue, expectCity, expectCityValue, expectUpMoney, expectFloorMoney, expectIndustry} = data;
    console.log(expectUpMoney);
    if (expectJobLabel) {
      user.expectJobLabel = expectJobLabel;
    }
    if (expectJobValue) {
      user.expectJobValue = expectJobValue;
    }
    if (expectCity) {
      user.expectCity = expectCity;
    }
    if (expectCityValue) {
      user.expectCityValue = expectCityValue;
    }
    if (expectUpMoney) {
      user.expectUpMoney = expectUpMoney;
    }
    if (expectFloorMoney) {
      user.expectFloorMoney = expectFloorMoney;
    }
    if (expectIndustry) {
      user.expectIndustry = expectIndustry;
    }
    await user.save();
    ctx.body = {
      code: 200,
      msg: '保存求职意向成功'
    }
    
    
  } catch (err) {
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
    if (isDeliverWorkExperience) {
      workExperience.splice(index, 1, newWorkExperience)
    } else {
      workExperience.push(newWorkExperience);
    }
    user.workExperience = workExperience;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '存储个人工作经历成功'
    };
    console.log(data);
  } catch (err) {
    console.log('saveWorkExpericence============' + err);
  }
}

/*关注公司*/
async function attentionCompany(ctx, body) {
  try {
    let data = ctx.request.body;
    let companyId = data.companyId;
    let user = await utils.getUser(ctx);
    let attentionComapnyArr = Array.from(user.attentionCompany);
    if (attentionComapnyArr.indexOf(companyId) < 0) {
      attentionComapnyArr.push(companyId);
    }
    user.attentionCompany = attentionComapnyArr;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '关注成功'
    }
  } catch (err) {
    console.log('attentionCompany==========' + err);
  }
}

/*获取所有关注的公司*/
async function earnAllAttentionCompany(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let attentionComapnyArr = user.attentionCompany;
    let allComapnyData = [];
    ctx.body = await new Promise((resolve, reject) => {
      attentionComapnyArr.forEach(async(item, index) => {
        console.log('item======' + item);
        let company = await model.company.findOne({_id: item});
        console.log(company);
        allComapnyData.push(company);
        if(index === attentionComapnyArr.length -1) {
          resolve({
            code: 200,
            msg: '获取成功',
            data: allComapnyData,
          })
        }
      });
    });
    // ctx.body = {
    //   code: 200,
    //   msg: '获取成功',
    //   data: allComapnyData,
    // }
  } catch (err) {
    console.log('attentionCompany==========' + err)
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
async function updateJobWantedIntention(ctx, body) {
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
  } catch (err) {
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
  } catch (err) {
    console.log('deleteSingleWorkExpericence=========' + err);
  }
}

module.exports = {
  earnRecommendJob,
  earnJobDetail,
  earnRecommendCompany,
  saveExpectJobInfo,
  saveWorkExpericence,
  attentionCompany,
  earnAllAttentionCompany,
  deleteSingleWorkExpericence,
  earnJobHunterCurriculumviate,
  updateJobWantedIntention
};