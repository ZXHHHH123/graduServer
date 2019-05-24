/**
 * Created by admin-pc on 2019/4/29.
 *
 * 求职者接口
 */
let model = require('../model/model');
let utils = require('../config/util/utils');
let redisUtil = require('../config/util/redisUtil');
let qiniuConf = require('./../config/qiniuConfig.json');
const qiniu = require('qiniu')

/*
 * 求职者获取系统推荐的工作接口
 * */
async function earnRecommendJob(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {city, company, require} = data;
    let companyPeopleNum, companyIndustry, financeState;
    if (company[0] === '融资阶段') {
      financeState = company[1]
    } else if (company[0] === '人员规模') {
      companyPeopleNum = company[1]
    } else if (company[0] === '行业') {
      companyIndustry = company[1]
    }
    
    let studyRequire, experienceRequire, upMoney, floorMoney;
    if (require[0] === '学历') {
      studyRequire = require[1];
    } else if (require[0] === '薪水') {
      upMoney = require[1].split('~')[0];
      floorMoney = require[1].split('~')[1];
    } else if (require[0] === '经验') {
      experienceRequire = require[1]
    }
    console.log(studyRequire, experienceRequire);
    let user = await utils.getUser(ctx);
    if (user) {
      let {expectJobLabel, expectCityValue} = user;
      console.log(expectJobLabel);
      let allRecommendJob;
      if (studyRequire) {
        if (studyRequire === '全部') {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
          });
        } else {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
            studyRequire
          });
        }
      } else if (experienceRequire) {
        if (experienceRequire === '全部') {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
          });
        } else {
          allRecommendJob = await model.jobType.find({
            isDelete: 0,
            jobLabel: expectJobLabel,
            chooseCityValue: expectCityValue,
            chooseCity: city,
            experienceRequire,
          });
        }
      } else {
        allRecommendJob = await model.jobType.find({
          isDelete: 0,
          jobLabel: expectJobLabel,
          chooseCityValue: expectCityValue,
          chooseCity: city,
        });
      }
      console.log(allRecommendJob);
      
      console.log('aaaaaaaaa');
      console.log(allRecommendJob.length);
      let filterJob = allRecommendJob.filter((item, index) => {
        console.log(item.companyIndustry);
        console.log(companyPeopleNum);
        if (companyPeopleNum && companyPeopleNum !== '不限') {
          let companyPeopleNumArr = (companyPeopleNum.substring(companyPeopleNum.length - 1, 0)).split('~');
          let companyPeopleNumFloor = parseInt(companyPeopleNumArr[0]);
          let companyPeopleNumUp = parseInt(companyPeopleNumArr[1]);
          let jobPeopleNumArr = (item.companyPeopleNum.substring(item.companyPeopleNum.length - 1, 0)).split('~');
          let jobPeopleNumFloor = parseInt(jobPeopleNumArr[0]);
          let jobPeopleNumUp = parseInt(jobPeopleNumArr[1]);
          console.log(jobPeopleNumFloor);
          console.log(companyPeopleNumFloor);
          console.log((jobPeopleNumFloor >= (companyPeopleNumFloor - 20)) && (jobPeopleNumFloor <= (companyPeopleNumFloor + 20 )));
          console.log((jobPeopleNumUp >= (companyPeopleNumUp - 20 ) && jobPeopleNumUp <= (companyPeopleNumUp + 20 )));
          if ((jobPeopleNumFloor >= (companyPeopleNumFloor - 20)) && (jobPeopleNumFloor <= (companyPeopleNumFloor + 20 )) || (jobPeopleNumUp >= (companyPeopleNumUp - 20 ) && jobPeopleNumUp <= (companyPeopleNumUp + 20 ))) {
            return item
          }
        } else if (companyPeopleNum === '不限') {
          return item
        }
        if (companyIndustry) {
          if (companyIndustry === '全部') {
            return item
          }
          if (item.companyIndustry.indexOf(companyIndustry) >= 0) {
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
    let data = ctx.request.body;
    console.log(body);
    let {sizeValue, industryValue} = data;
    let user = await utils.getUser(ctx);
    if (user) {
      /*tudo 如果没有筛选值，就将所有符合求职者的‘期望工作类型的值’的公司传递过去*/
      let {expectIndustry} = user;
      let recommendCompany;
      let company = await model.company.find({
        publishJobIdArray: {$ne : []}
      });
      console.log(company);
      if (industryValue === '全部') {
        recommendCompany = company;
      } else {
        recommendCompany = company.filter((item, index) => {
          let companyIndustry = item.companyIndustry;
          if (companyIndustry.indexOf(expectIndustry) >= 0) {
            return item;
          }
        });
      }
      let filterJob = recommendCompany.filter((item, index) => {
        if (sizeValue !== '不限') {
          let companyPeopleNumArr = (sizeValue.substring(sizeValue.length - 1, 0)).split('~');
          let companyPeopleNumFloor = parseInt(companyPeopleNumArr[0]);
          let companyPeopleNumUp = parseInt(companyPeopleNumArr[1]);
          let jobPeopleNumArr = (item.companyPeopleNum.substring(item.companyPeopleNum.length - 1, 0)).split('~');
          let jobPeopleNumFloor = parseInt(jobPeopleNumArr[0]);
          let jobPeopleNumUp = parseInt(jobPeopleNumArr[1]);
          // console.log(jobPeopleNumFloor);
          // console.log(companyPeopleNumFloor);
          // console.log((jobPeopleNumFloor>=(companyPeopleNumFloor -20)) && (jobPeopleNumFloor<=(companyPeopleNumFloor +20 )));
          // console.log((jobPeopleNumUp>=(companyPeopleNumUp -20 ) && jobPeopleNumUp<=(companyPeopleNumUp +20 )));
          if ((jobPeopleNumFloor >= (companyPeopleNumFloor - 20)) && (jobPeopleNumFloor <= (companyPeopleNumFloor + 20 )) || (jobPeopleNumUp >= (companyPeopleNumUp - 20 ) && jobPeopleNumUp <= (companyPeopleNumUp + 20 ))) {
            return item
          }
        }
        return item
      });
      
      
      console.log('recommendCompany=======');
      console.log(filterJob);
      ctx.body = {
        code: 200,
        msg: '获取推荐公司成功',
        data: filterJob
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
      attentionComapnyArr.forEach(async (item, index) => {
        console.log('item======' + item);
        let company = await model.company.findOne({_id: item});
        console.log(company);
        allComapnyData.push(company);
        if (index === attentionComapnyArr.length - 1) {
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

async function collectJob(ctx, body) {
  try {
    let data = ctx.request.body;
    let {jobId} = data;
    let user = await utils.getUser(ctx);
    let collectJobArr = Array.from(user.collectJobArr);
    if (collectJobArr.indexOf(jobId) < 0) {
      collectJobArr.push(jobId);
    }
    user.collectJobArr = collectJobArr;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '收藏成功',
    }
  } catch (err) {
    console.log('collectJob=========' + err)
  }
}

async function earnCollectJob(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let collectJobIdArr = user.collectJobArr;
    let collectJobArr = [];
    ctx.body = await new Promise((resolve, reject) => {
      collectJobIdArr.forEach(async (item, index) => {
        let collectJobItem = await model.jobType.findOne({_id: item});
        collectJobArr.push(collectJobItem);
        if (index === collectJobIdArr.length - 1) {
          resolve({
            code: 200,
            msg: '获取所有收藏的职位成功',
            data: collectJobArr,
          })
        }
      });
    });
    // await collectJobIdArr.map(async (item, index) => {
    //   console.log(item);
    //   let collectJobItem = await model.jobType.findOne({item});
    //   console.log(collectJobItem);
    //   collectJobArr.push(collectJobItem);
    // });
    // console.log(collectJobArr);
    // ctx.body = {
    //   code: 200,
    //   msg: '获取所有收藏的职位成功',
    //   data: data,
    // }
  } catch (err) {
    consolog('earnCollectJob========' + err);
  }
}

/*f已发送简历*/
async function sendCurriculumVitaeToRecruiter(ctx, body) {
  try {
    let data = ctx.request.body;
    let {jobId} = data;
    let companyItem = await model.jobType.findOne({_id: jobId});
    let user = await utils.getUser(ctx);
    let jobHunterId = user._id;
    console.log(jobHunterId);
    
    /*presentJobHunterAndRecruiter是唯一的一个*/
    let presentJobHunterAndRecruiter = await model.communicationDetail.find({
      jobId,
      jobHunterId
    });
    if (presentJobHunterAndRecruiter.length === 0) {
      console.log(1234);
      model.communicationDetail.create({
        jobId,
        jobHunterId,
        companyCode: companyItem.companyCode,
        isSendCurriculumVitaeToEmail: 1,
      });
    } else {
      console.log(5678);
      presentJobHunterAndRecruiter[0].isSendCurriculumVitaeToEmail = 1;
      await presentJobHunterAndRecruiter[0].save();
    }
    ctx.body = {
      code: 200,
      msg: '发送请求成功'
    }
    
    
  } catch (err) {
    console.log('sendCurriculumVitaeToRecruiter===========' + err);
  }
}


/*获取求职者所发送的简历记录*/
async function earnJobHunterCommunicateData(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let allCommunicateData = await model.communicationDetail.find({
      jobHunterId: user._id
    });
    let hadCurriculumVitaeData = [], interviewData = [], hasCurriculumVitaeData = [];
    /*求职者发送的简历记录*/
    hadCurriculumVitaeData = allCommunicateData.filter((item, index) => {
      if (item.isSendCurriculumVitaeToEmail) {
        return item;
      }
    });
    /*招聘者发送的面试邀请*/
    interviewData = allCommunicateData.filter((item, index) => {
      if (item.isSendInterview) {
        return item;
      }
    });
    /*招聘者所发出的发送简历邀请*/
    hasCurriculumVitaeData = allCommunicateData.filter((item, index) => {
      if (!item.isSendCurriculumVitaeToEmail) {
        return item;
      }
    });
    
    ctx.body = {
      code: 200,
      msg: '发送成功',
      data: {
        allCommunicateData,
        hadCurriculumVitaeData,
        interviewData,
        hasCurriculumVitaeData
      }
      
    }
  } catch (err) {
    console.log('earnCurriculumVitaeCommunicateData===========' + err);
  }
}

async function hasCurriculumVitaeData(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {allCommunicateData} = data;
    let user = await utils.getUser(ctx);
    let detailCompanyData = [];
    ctx.body = await new Promise((resolve, reject) => {
      allCommunicateData.forEach(async (item, index) => {
        console.log(item.recruiterId);
        let singleRecruiter = await model.user.findOne({
          _id: item.recruiterId
        });
        let company = await model.company.findOne({
          companyCode: singleRecruiter.companyCode
        });
        detailCompanyData.push(company);
        
        if (index === allCommunicateData.length - 1) {
          resolve({
            code: 200,
            msg: '获取成功',
            data: detailCompanyData,
          })
        }
      })
    })
  } catch (err) {
    console.log('hadCurriculumVitaeData===========' + err);
  }
}

async function earnInterviewData(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {allInerviewData} = data;
    let detailInterviewData = [];
    ctx.body = await new Promise((resolve, reject) => {
      allInerviewData.forEach(async (item, index) => {
        console.log(item);
        let singleRecruiter = await model.user.findOne({
          _id: item.recruiterId
        });
        let company = await model.company.findOne({
          companyCode: singleRecruiter.companyCode
        });
        let obj = {};
        obj.company = company;
        obj.interviewDetail = item.interviewDetail;
        // // company.interviewDetail = 'ddddddddddddddddd';
        console.log('dddddddddd');
        console.log(obj);
        //
        detailInterviewData.push(obj);
        
        
        if (index === allInerviewData.length - 1) {
          console.log('aaaaaaaaaaaa');
          console.log(detailInterviewData);
          resolve({
            code: 200,
            msg: '获取成功',
            data: detailInterviewData,
          })
        }
      })
    })
    
  } catch (err) {
    console.log('earnInterviewData=============' + err);
  }
}

async function earnHadCurriculumVitaeData(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {hadCurriculumVitaeData} = data;
    let user = await utils.getUser(ctx);
    let detailJobData = [];
    ctx.body = await new Promise((resolve, reject) => {
      hadCurriculumVitaeData.forEach(async (item, index) => {
        console.log(item);
        let singleJobHunter = await model.jobType.findOne({
          _id: item.jobId
        });
        detailJobData.push(singleJobHunter);
        
        if (index === hadCurriculumVitaeData.length - 1) {
          resolve({
            code: 200,
            msg: '获取成功',
            data: detailJobData,
          })
        }
      })
    })
  } catch (err) {
    console.log('earnHadCurriculumVitaeData============' + err);
  }
}


async function searchJoborCompany(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {value, type} = data;
    if (type === 'job') {
      
      let expectJobLabel = value;
      
      let user = await utils.getUser(ctx);
      let {expectCity} = user;
      if (user) {
        console.log(expectJobLabel);
        let allRecommendJob;
        allRecommendJob = await model.jobType.find({
          isDelete: 0,
          jobLabel: expectJobLabel,
          chooseCity: expectCity,
          
        });
        console.log(allRecommendJob.length);
        
        ctx.body = {
          code: 200,
          msg: '推荐成功',
          data: allRecommendJob
        }
      }
    } else if (type === 'company') {
      console.log('aaaaaaa');
      let companyData = await model.company.find({
        companyName: value
      });
      ctx.body = {
        code: 200,
        msg: '推荐成功',
        data: companyData
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '请重新登录'
      }
    }
  } catch (err) {
    console.log('searchJoborCompany============' + err);
  }
}


async function saveComplainDetailInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let {complainAccount, jobId} = data;
    console.log(complainAccount);
    let user = await utils.getUser(ctx);
    let presentComplainJob = await model.complain.findOne({
      userId: user._id,
      jobId: jobId
    });
    if (presentComplainJob) {
      console.log(111);
      presentComplainJob.complainAccount = complainAccount;
      await presentComplainJob.save();
    } else {
      console.log(222);
      await model.complain.create({
        userId: user._id,
        nickName: user.nickName,
        image: user.image,
        companyName: user.unit,
        companyCode: user.companyCode,
        jobId,
        complainAccount
      })
    }
    
    ctx.body = {
      code: 200,
      msg: '提交信息成功',
    }
  } catch (err) {
    console.log('saveComplainDetailInfo=========' + err);
  }
}


async function saveComplainImage(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    
    let jobId = ctx.request.body.jobId;
    let {imageFile0, imageFile1, imageFile2, imageFile3, imageFile4, companyLogo} = ctx.request.files;
    let imgPath0, imgPath1, imgPath2, imgPath3, imgPath4, companyLogoPath;
    let presentComplainJob = await model.complain.findOne({
      userId: user._id,
      jobId: jobId
    });
    
    
    if(presentComplainJob){
      let complainImage = Array.from(presentComplainJob.complainImage);
      if (imageFile0) {
        imgPath0 = imageFile0.path;
        let qiniu = await upToQiniu(imgPath0);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile1) {
        imgPath1 = imageFile1.path;
        let qiniu = await upToQiniu(imgPath1);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile2) {
        imgPath2 = imageFile2.path;
        let qiniu = await upToQiniu(imgPath2);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile3) {
        imgPath3 = imageFile3.path;
        let qiniu = await upToQiniu(imgPath3);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile4) {
        imgPath4 = imageFile4.path;
        let qiniu = await upToQiniu(imgPath4);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      let result = [];
      let obj = {};
      for (let i = 0; i < complainImage.length; i++) {
        if (!obj[complainImage[i].uri]) {
          result.push(complainImage[i]);
          obj[complainImage[i].uri] = true;
        }
      }
      presentComplainJob.complainImage = result;
      await presentComplainJob.save();
      ctx.body = {
        code: 200,
        msg: '图片上传成功'
      }
    }else {
      let complainImage = [];
      if (imageFile0) {
        imgPath0 = imageFile0.path;
        let qiniu = await upToQiniu(imgPath0);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile1) {
        imgPath1 = imageFile1.path;
        let qiniu = await upToQiniu(imgPath1);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile2) {
        imgPath2 = imageFile2.path;
        let qiniu = await upToQiniu(imgPath2);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile3) {
        imgPath3 = imageFile3.path;
        let qiniu = await upToQiniu(imgPath3);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      if (imageFile4) {
        imgPath4 = imageFile4.path;
        let qiniu = await upToQiniu(imgPath4);
        let imageUrl = qiniuConf.qiniuApi + qiniu.key;
        complainImage.push({uri: imageUrl})
      }
      await model.complain.create({
        userId: user._id,
        nickName: user.nickName,
        image: user.image,
        companyName: user.unit,
        companyCode: user.companyCode,
        jobId,
        complainImage: complainImage
      });
      ctx.body = {
        code: 200,
        msg: '上传图片成功'
      }
    }
    
    // console.log(ctx.request.files);
  } catch (err) {
    console.log('saveComplainImage=========' + err);
  }
}


function upToQiniu(filePath, key) {
  const accessKey = qiniuConf.accessKey // 你的七牛的accessKey
  const secretKey = qiniuConf.secretKey // 你的七牛的secretKey
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  
  // const options = {
  //   scope: qiniuConf.scope // 你的七牛存储对象
  // }
  var options = {
    scope: 'zchuhyy',
  };
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  
  const config = new qiniu.conf.Config()
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0
  const localFile = filePath
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved(respBody)
      } else {
        resolved(respBody)
      }
    })
  })
  
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
  updateJobWantedIntention,
  collectJob,
  earnCollectJob,
  sendCurriculumVitaeToRecruiter,
  earnJobHunterCommunicateData,
  hasCurriculumVitaeData,
  earnInterviewData,
  earnHadCurriculumVitaeData,
  searchJoborCompany,
  saveComplainDetailInfo,
  saveComplainImage
};