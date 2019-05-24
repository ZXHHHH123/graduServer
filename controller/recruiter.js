/*
 * 招聘者接口
 * */
let model = require('../model/model');
let utils = require('../config/util/utils');
let redisUtil = require('../config/util/redisUtil');
let qiniuConf = require('./../config/qiniuConfig.json');
const qiniu = require('qiniu')

/*发布工作接口*/
async function recruitjob(ctx, next) {
  try {
    console.log('start----------recruitjob');
    let data = ctx.request.body;
    let sign = ctx.request.header.authorization;
    sign = sign.substring(7);
    console.log(sign);
    let {jobLabel, jobValue, jobAccount, jobAddress, experienceRequire, studyRequire, upMoney, floorMoney, chooseCity, chooseCityValue,} = data;
    let userId = await redisUtil.AsyncGet(sign);
    console.log('从redis中通过sign获得的userid值为' + userId);
    console.log(chooseCity, chooseCityValue);
    let user = await model.user.findOne({_id: userId});
    let companyCode = user.companyCode;
    if (!user) {
      ctx.body = {
        code: 401,
        msg: '无当前用户'
      };
      return;
    }
    if (!user.isCompany) {
      ctx.body = {
        code: 404,
        msg: '当前身份不能发布职位，iscompany===0'
      };
      return;
    }
    console.log('---' + jobAccount + '---' + jobAddress + '---' + experienceRequire + '---' + studyRequire + '---' + upMoney + '---' + floorMoney);
    if (jobLabel && jobAccount && jobAddress && experienceRequire && studyRequire && upMoney && floorMoney) {
      let company = await model.company.findOne({companyCode});
      //公司是肯定存在的，因为在注册的时候就创建了对应的公司
      if (!!company) {
        let {companyCode, companyName, isBelisted, companyAddress, companyLogo, companyPeopleNum, companyIndustry} = company;
        //数据库存在当前companyId的公司，所以不用新建公司item；
        console.log('存在公司');
        let job = await model.jobType.create({
          jobLabel,
          jobValue,
          jobAccount,
          jobAddress,
          experienceRequire,
          studyRequire,
          upMoney,
          floorMoney,
          chooseCity,
          chooseCityValue,
          publisher: user.nickName,
          publisherPlace: user.place,
          publisherId: user._id,
          publisherImg: user.image,
          userEmail: user.userEmail,
          publishTime: +new Date(),
          companyLogo,
          companyCode,
          companyName,
          isBelisted,
          companyAddress,
          companyPeopleNum,
          companyIndustry,
        });
        let jobId = job._id;
        let publisherId = user._id;
        let publisher = user.nickName;
        let publisherImg = user.image;
        let publisherPlace = user.place;
        company = await model.company.findOneAndUpdate({companyCode}, {
          $push: {
            publishJobIdArray: {
              jobId,
              publisherId,
              jobLabel,
              upMoney,
              floorMoney,
              publisher,
              publisherImg,
              publisherPlace,
              experienceRequire,
              studyRequire,
              chooseCity
            }
          }
        }, {new: true});
        let cityLabel = chooseCity;
        let cityValue = chooseCityValue;
        
        await model.city.create({
          cityLabel,
          cityValue,
          jobId,
        });
        ctx.body = {
          code: 200,
          msg: '发布成功',
          data: jobId
        }
      } else {
        //不存在，需要新建
        console.log('不存在公司');
        ctx.body = {
          code: 400,
          msg: 'logic error'
          //    创建用户的时候就注册了公司，这里是不会走到的，如果走到这里，逻辑出错
        }
      }
    } else {
      ctx.body = {
        code: 400,
        msg: '发布失败,请详细填写相关信息'
      }
    }
    
  } catch (e) {
    console.log('recruitjob---------' + e);
    ctx.body = {
      code: 400
    }
  }
}


/*获取所有发布职位接口*/
/*思路： 先找到用户，通过用户的companycode找到对应的公司表项，该项中记录着所有发布的职位*/
async function allPublishJob(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let body = ctx.request.body;
    let companyCode = user.companyCode;
    let companyPublishJob = (await model.company.findOne({companyCode})).publishJobIdArray;
    console.log(user._id);
    let presentHrPublishJob = companyPublishJob.filter((item, index) => {
      return item.publisherId == user._id && item.isDelete !== 1;
    });
    console.log(presentHrPublishJob);
    let publisherAllJobDetail = [];
    ctx.body = await new Promise((resolve, reject) => {
      presentHrPublishJob.forEach(async (item, index, presentHrPublishJob) => {
        let jobDetail = await model.jobType.findOne({_id: item.jobId});
        
        publisherAllJobDetail.push(jobDetail);
        if (index === presentHrPublishJob.length - 1) {
          resolve({
            code: 200,
            msg: '搜索成功',
            data: publisherAllJobDetail
          })
        }
      })
    });
  } catch (err) {
    ctx.body = {
      code: 500,
      msg: '搜索失败',
    };
    console.log('allPublishJob======================' + err);
  }
}

/*更新已发布的职位*/
async function updateRecruitjob(ctx, next) {
  try {
    let user = await utils.getUser(ctx);
    let data = ctx.request.body;
    let {jobLabel, jobValue, jobAccount, jobAddress, experienceRequire, studyRequire, upMoney, floorMoney, chooseCity, chooseCityValue,} = data;
    let presentJob = await model.jobType.findOneAndUpdate({_id: data._id}, {
      $set: {
        jobLabel, jobValue, jobAccount, jobAddress, experienceRequire, studyRequire, upMoney, floorMoney, chooseCity,
        chooseCityValue
      }
    });
    
    ctx.body = {
      code: 200,
      msg: '更新成功'
    };
    
    
  } catch (err) {
    console.log('updateRecruitjob=============' + err);
  }
}

async function deleteRecruitjob(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let data = ctx.request.body;
    let deleteJobId = data.publishJobId;
    await model.jobType.findOneAndUpdate({_id: deleteJobId}, {
      $set: {
        isDelete: 1
      }
    });
    await model.city.findOneAndUpdate({jobId: deleteJobId}, {
      $set: {
        isDelete: 1
      }
    });
    console.log(111111);
    
    
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyPublishJobIdArray = company.publishJobIdArray;
    companyPublishJobIdArray.forEach((item, index) => {
      if (item.jobId == deleteJobId) {
        item.isDelete = 1;
        company.publishJobIdArray = companyPublishJobIdArray;
        company.save();
        //  model.company.findOneAndUpdate({companyCode}, {
        //   $set: {
        //     publishJobIdArray: companyPublishJobIdArray
        //   }
        // });
      }
    });
    
    
    ctx.body = {
      code: 200,
      msg: '删除成功'
    }
    
  } catch (err) {
    console.log('deleteRecruitjob=============' + err);
  }
}
async function earnSingleJobTypeJobHunter(ctx, next) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {jobType, city, require} = data;
    console.log(jobType);
    if (!jobType) {
      ctx.body = {
        code: 400,
        msg: '请选择正确的类型'
      }
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
    
    let user = await utils.getUser(ctx);
    let allSingleJobTypeJobHunter;
    
    if (studyRequire) {
      console.log(1);
      if (studyRequire === '全部') {
        console.log(2);
        allSingleJobTypeJobHunter = await model.user.find({
          isCompany: 0,
          expectJobValue: jobType,
          expectCity: city
        });
      } else {
        console.log(3);
        allSingleJobTypeJobHunter = await model.user.find({
          isCompany: 0,
          expectJobValue: jobType,
          studyRequire,
          expectCity: city
        });
      }
    } else if (experienceRequire) {
      console.log(4);
      if (experienceRequire === '全部') {
        console.log(5);
        allSingleJobTypeJobHunter = await model.user.find({
          isCompany: 0,
          expectJobValue: jobType,
          expectCity: city
        });
      } else {
        console.log(6);
        allSingleJobTypeJobHunter = await model.user.find({
          isCompany: 0,
          expectJobValue: jobType,
          experienceRequire,
          expectCity: city
        });
      }
    } else {
      console.log(7);
      allSingleJobTypeJobHunter = await model.user.find({
        isCompany: 0,
        expectJobValue: jobType,
        expectCity: city
      });
    }
    
    
    console.log(allSingleJobTypeJobHunter);
    ctx.body = {
      code: 200,
      msg: '查询成功',
      data: allSingleJobTypeJobHunter
    }
    
  } catch (err) {
    console.log('earnSingleJobTypeJobHunter==============' + err);
  }
}


/*存储公司基本信息*/
async function submitCompanyBasicInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    console.log(data);
    let {nickName, gender, userEmail, companyName, companyCode, companyStar, place, wxCode, companyAddress} = data;
    
    
    let company = await model.company.findOne({companyCode});
    if (company) {
      user.unit = companyName,
          user.userEmail = userEmail;
      user.wxCode = wxCode;
      user.place = place;
      user.gender = gender;
      user.nickName = nickName;
      company.companyStar = companyStar;
      company.companyName = companyName;
      company.companyAddress = companyAddress;
      await Promise.all([user.save(), company.save()]);
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    } else {
      user.userEmail = userEmail;
      user.wxCode = wxCode;
      user.place = place;
      user.gender = gender;
      user.nickName = nickName;
      user.unit = companyName,
          await user.save();
      model.company.create({
        companyName: companyName,
        companyCode: companyCode,
        companyStar: companyStar,
        hrArray: [{
          name: user.nickName,
          gender: user.gender,
          hrId: user._id,
        }]
      });
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    }
    
  } catch (err) {
    console.log('submitCompanyBasicInfo============' + err);
  }
}

/*
 * leader接口
 * */

async function saveCompanyLeaderImage(ctx, body) {
  try {
    let data = ctx.request.body;
    let {imageFile} = ctx.request.files;
    let imgPath = imageFile.path;
    let qiniu = await upToQiniu(imgPath);
    let imageUrl = qiniuConf.qiniuApi + qiniu.key;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyLeaderArray = Array.from(company.leaderArray);
    let flag = 0;
    for (let i = 0, len = companyLeaderArray.length; i < len; i++) {
      if (!companyLeaderArray[i].leaderImg) {
        companyLeaderArray[i].leaderImg = imageUrl;
        flag = 1;
        break;
      }
    }
    ;
    if (flag === 0) {
      companyLeaderArray.push({
        leaderImg: imageUrl
      })
    }
    company.leaderArray = companyLeaderArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '保存成功',
      
    }
    
  } catch (err) {
    console.log('saveCompanyLeaderImage==========' + err)
  }
}
async function saveCompanyLeaderInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let {leaderName, leaderPlace, leaderAccount} = data;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    console.log(company);
    let companyLeaderArray = Array.from(company.leaderArray);
    let flag = 0;
    for (let i = 0, len = companyLeaderArray.length; i < len; i++) {
      if (!companyLeaderArray[i].leaderName) {
        companyLeaderArray[i].leaderName = leaderName;
        companyLeaderArray[i].leaderPlace = leaderPlace;
        companyLeaderArray[i].leaderAccount = leaderAccount;
        flag = 1;
        break;
      }
    }
    if (flag === 0) {
      companyLeaderArray.push({
        leaderName,
        leaderPlace,
        leaderAccount
      })
    }
    company.leaderArray = companyLeaderArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '保存成功'
    }
    
    // await model.company.findOneAndUpdate({companyCode}, {
    //   $push: {
    //     leaderArray: {
    //       leaderName,
    //       leaderPlace,
    //       leaderAccount
    //     }
    //   }
    // });
    // ctx.body = {
    //   code: 200,
    //   msg: '保存leader基本信息成功'
    // }
    
  } catch (err) {
    console.log('submitCompanyBasicInfo=====' + err);
  }
}

async function earnLeaderInfo(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let companyLeaderInfo = (await model.company.findOne({companyCode})).leaderArray;
    
    ctx.body = {
      code: 200,
      msg: '获取leader信息成功',
      data: companyLeaderInfo
    }
  } catch (err) {
    console.log('earnLeaderInfo==========' + err);
  }
}

async function deleteLeaderInfo(ctx, body) {
  try {
    console.log('aaaaaaaaaaaaa');
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyLeaderArray = Array.from(company.leaderArray);
    let leaderInfoId = data._id;
    console.log(leaderInfoId);
    companyLeaderArray.map((item, index) => {
      console.log(item._id);
      console.log(item._id == leaderInfoId);
      if (item._id == leaderInfoId) {
        companyLeaderArray.splice(index, 1);
      }
    });
    company.leaderArray = companyLeaderArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: companyLeaderArray
    }
  } catch (err) {
    console.log('deleteLeaderInfo=========' + err);
  }
}


/*
 * 产品接口
 * */

async function saveCompanyProductImage(ctx, body) {
  try {
    let data = ctx.request.body;
    let {imageFile} = ctx.request.files;
    let imgPath = imageFile.path;
    let qiniu = await upToQiniu(imgPath);
    let imageUrl = qiniuConf.qiniuApi + qiniu.key;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyProductArray = Array.from(company.companyProduct);
    let flag = 0;
    for (let i = 0, len = companyProductArray.length; i < len; i++) {
      if (!companyProductArray[i].productImg) {
        companyProductArray[i].productImg = imageUrl;
        flag = 1;
        break;
      }
    }
    ;
    if (flag === 0) {
      companyProductArray.push({
        productImg: imageUrl
      })
    }
    company.companyProduct = companyProductArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '保存成功',
      
    }
    
  } catch (err) {
    console.log('saveCompanyProductImage==========' + err)
  }
}
async function saveCompanyProductInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let {productName, productAccount} = data;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    console.log(company);
    let companyProductArray = Array.from(company.companyProduct);
    let flag = 0;
    for (let i = 0, len = companyProductArray.length; i < len; i++) {
      if (!companyProductArray[i].productName) {
        companyProductArray[i].productName = productName;
        companyProductArray[i].productAccount = productAccount;
        flag = 1;
        break;
      }
    }
    if (flag === 0) {
      companyProductArray.push({
        productName,
        productAccount
      })
    }
    company.companyProduct = companyProductArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '保存成功'
    }
    
    // await model.company.findOneAndUpdate({companyCode}, {
    //   $push: {
    //     leaderArray: {
    //       leaderName,
    //       leaderPlace,
    //       leaderAccount
    //     }
    //   }
    // });
    // ctx.body = {
    //   code: 200,
    //   msg: '保存leader基本信息成功'
    // }
    
  } catch (err) {
    console.log('saveCompanyProductInfo=====' + err);
  }
}

async function earnProductInfo(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let companyProductInfo = (await model.company.findOne({companyCode})).companyProduct;
    
    ctx.body = {
      code: 200,
      msg: '获取leader信息成功',
      data: companyProductInfo
    }
  } catch (err) {
    console.log('earnProductInfo==========' + err);
  }
}

async function deleteProductInfo(ctx, body) {
  try {
    console.log('aaaaaaaaaaaaa');
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyProductArray = Array.from(company.companyProduct);
    let productId = data._id;
    console.log(productId);
    companyProductArray.map((item, index) => {
      console.log(item._id);
      console.log(item._id == productId);
      if (item._id == productId) {
        companyProductArray.splice(index, 1);
      }
    });
    company.companyProduct = companyProductArray;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: companyProductArray
    }
  } catch (err) {
    console.log('deleteProductInfo=========' + err);
  }
}

async function allCompanyInfo(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    ctx.body = {
      code: 200,
      msg: '获取公司基本信息成功',
      data: company,
    }
  } catch (err) {
    console.log('allCompanyInfo===============' + err);
  }
}


async function saveCompanyImage(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    let companyImage = Array.from(company.companyImage);
    let {imageFile0, imageFile1, imageFile2, imageFile3, imageFile4, companyLogo} = ctx.request.files;
    let imgPath0, imgPath1, imgPath2, imgPath3, imgPath4, companyLogoPath;
    if (companyLogo) {
      companyLogoPath = companyLogo.path;
      let qiniu = await upToQiniu(companyLogoPath);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      company.companyLogo = imageUrl;
    }
    if (imageFile0) {
      imgPath0 = imageFile0.path;
      let qiniu = await upToQiniu(imgPath0);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      companyImage.push({uri: imageUrl})
    }
    if (imageFile1) {
      imgPath1 = imageFile1.path;
      let qiniu = await upToQiniu(imgPath1);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      companyImage.push({uri: imageUrl})
    }
    if (imageFile2) {
      imgPath2 = imageFile2.path;
      let qiniu = await upToQiniu(imgPath2);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      companyImage.push({uri: imageUrl})
    }
    if (imageFile3) {
      imgPath3 = imageFile3.path;
      let qiniu = await upToQiniu(imgPath3);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      companyImage.push({uri: imageUrl})
    }
    if (imageFile4) {
      imgPath4 = imageFile4.path;
      let qiniu = await upToQiniu(imgPath4);
      let imageUrl = qiniuConf.qiniuApi + qiniu.key;
      companyImage.push({uri: imageUrl})
    }
    let result = [];
    let obj = {};
    for (let i = 0; i < companyImage.length; i++) {
      if (!obj[companyImage[i].uri]) {
        result.push(companyImage[i]);
        obj[companyImage[i].uri] = true;
      }
    }
    
    company.companyImage = result;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '上传公司照片成功'
    }
    
    
    // let qiniu = await upToQiniu(imgPath1);
    // let imageUrl = qiniuConf.qiniuApi + qiniu.key;
    // let data = ctx.request.body;
    // let user = await utils.getUser(ctx);
    // let companyCode = user.companyCode;
    // let company = await model.company.findOne({companyCode});
  } catch (err) {
    console.log('saveCompanyImage==============' + err);
  }
}
async function saveCompanyDetailInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let company = await model.company.findOne({companyCode});
    console.log(data);
    let {isBelisted, companyPeopleNum, companyIndustry, pickerWorkTimeValue, companyAccount, companyWebsite, companyWelfare, companyHolidaySystem, companyAddress, companyEmail} = data;
    company.isBelisted = isBelisted;
    company.companyPeopleNum = companyPeopleNum;
    company.companyIndustry = companyIndustry;
    company.companyWorkTimeValue = pickerWorkTimeValue;
    company.companyAccount = companyAccount;
    company.companyWebsite = companyWebsite;
    company.companyAddress = companyAddress;
    company.companyEmail = companyEmail;
    if (companyWelfare.length > 0) {
      company.companyWelfare = companyWelfare;
    }
    company.companyHolidaySystem = companyHolidaySystem;
    await company.save();
    ctx.body = {
      code: 200,
      msg: '保存公司详细信息成功'
    }
    
  } catch (err) {
    console.log('saveCompanyDetailInfo=========' + err);
  }
}

async function sendCurriculumVitaeToEmail(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {jobHunterId} = data;
    let user = await utils.getUser(ctx);
    let recruiterId = user._id;
    /*presentJobHunterAndRecruiter是唯一的一个*/
    let presentJobHunterAndRecruiter = await model.communicationDetail.find({
      jobHunterId,
      recruiterId
    });
    if (presentJobHunterAndRecruiter.length === 0) {
      model.communicationDetail.create({
        jobHunterId,
        recruiterId,
        curriculumVitaeToEmail: 1,
      });
    } else {
      presentJobHunterAndRecruiter[0].curriculumVitaeToEmail = 1;
      await presentJobHunterAndRecruiter[0].save();
    }
    ctx.body = {
      code: 200,
      msg: '发送请求成功'
    }
    
  } catch (err) {
    console.log('sendCurriculumVitaeToEmail==============' + err);
  }
}

async function sendInterviewDetail(ctx, body) {
  try {
    let data = ctx.request.body;
    let {jobHunterId, interviewAddress, interviewTime, wxCode, remarks} = data;
    let user = await utils.getUser(ctx);
    let recruiterId = user._id;
    /*presentJobHunterAndRecruiter是唯一的一个*/
    let presentJobHunterAndRecruiter = await model.communicationDetail.find({
      jobHunterId,
      recruiterId
    });
    if (presentJobHunterAndRecruiter.length === 0) {
      model.communicationDetail.create({
        jobHunterId,
        recruiterId,
        isSendInterview: 1,
        interviewDetail: {
          interviewAddress,
          interviewTime,
          wxCode,
          remarks
        }
      });
    } else {
      presentJobHunterAndRecruiter[0].isSendInterview = 1;
      presentJobHunterAndRecruiter[0].interviewDetail = {
        interviewAddress,
        interviewTime,
        wxCode,
        remarks
      };
      await presentJobHunterAndRecruiter[0].save();
    }
    
    ctx.body = {
      code: 200,
      msg: '发送成功'
    }
    
    
  } catch (err) {
    console.log('sendInterviewDetail========' + err);
  }
}

async function earnCommunicateData(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let allCommunicateData = await model.communicationDetail.find({
      recruiterId: user._id
    });
    let interviewData = [];
    interviewData = allCommunicateData.filter((item, index) => {
      if (item.isSendInterview) {
        return item;
      }
    });
    ctx.body = {
      code: 200,
      msg: '发送成功',
      data: {
        allCommunicateData,
        interviewData
      }
      
    }
  } catch (err) {
    console.log('earnCommunicateData===========' + err);
  }
}

async function earnDetailCommunicateData(ctx, body) {
  try {
    let data = ctx.request.body;
    console.log(data);
    let {allCommunicateData} = data;
    let detailCommunicateData = [];
    ctx.body = await new Promise((resolve, reject) => {
      allCommunicateData.forEach(async(item, index) => {
        console.log(item.jobHunterId);
        let singleJobHunter = await model.user.findOne({
          _id: item.jobHunterId
        });
        detailCommunicateData.push(singleJobHunter);
    
        if(index === allCommunicateData.length - 1){
          resolve({
            code: 200,
            msg: '获取成功',
            data: detailCommunicateData,
          })
        }
      })
    })
    
    
  }catch (err) {
    console.log('earnDetailCommunicateData===========' + err);
  }
}

async function earnInterviewData(ctx, body) {
  try{
    let data = ctx.request.body;
    console.log(data);
    let {allInerviewData} = data;
    let detailInterviewData = [];
    ctx.body = await new Promise((resolve, reject) => {
      allInerviewData.forEach(async(item, index) => {
        console.log(item.jobHunterId);
        let singleJobHunter = await model.user.findOne({
          _id: item.jobHunterId
        });
        detailInterviewData.push(singleJobHunter);
      
        if(index === allInerviewData.length - 1){
          resolve({
            code: 200,
            msg: '获取成功',
            data: detailInterviewData,
          })
        }
      })
    })
    
  }catch (err) {
    console.log('earnInterviewData=============' + err);
  }
}



async function collectJobHunter(ctx, body) {
  try {
    let data = ctx.request.body;
    let {jobHunterId} = data;
    let user = await utils.getUser(ctx);
    let collectJobHunterArr = Array.from(user.collectJobHunterArr);
    if (collectJobHunterArr.indexOf(jobHunterId) < 0) {
      collectJobHunterArr.push(jobHunterId);
    }
    user.collectJobHunterArr = collectJobHunterArr;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '收藏成功',
    }
  }catch (err) {
    console.log('collectJobHunter============' + err);
  }
}


async function earnCollectJobHunter(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let collectJobHunterIdArr = user.collectJobHunterArr;
    let collectJobHunterArr = [];
    ctx.body = await new Promise((resolve, reject) => {
      collectJobHunterIdArr.forEach(async (item, index) => {
        let collectJobItem = await model.user.findOne({_id: item});
        collectJobHunterArr.push(collectJobItem);
        if (index === collectJobHunterIdArr.length - 1) {
          resolve({
            code: 200,
            msg: '获取所有收藏的职位成功',
            data: collectJobHunterArr,
          })
        }
      });
    });
  }catch (err) {
    console.log('earnCollectJobHunter========' + err);
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
  recruitjob,
  allPublishJob,
  updateRecruitjob,
  deleteRecruitjob,
  earnSingleJobTypeJobHunter,
  submitCompanyBasicInfo,
  saveCompanyLeaderInfo,
  saveCompanyLeaderImage,
  saveCompanyImage,
  earnLeaderInfo,
  deleteLeaderInfo,
  saveCompanyProductInfo,
  saveCompanyProductImage,
  earnProductInfo,
  deleteProductInfo,
  
  allCompanyInfo,
  saveCompanyDetailInfo,
  
  sendCurriculumVitaeToEmail,
  sendInterviewDetail,
  earnCommunicateData,
  earnDetailCommunicateData,
  earnInterviewData,
  
  collectJobHunter,
  earnCollectJobHunter
}