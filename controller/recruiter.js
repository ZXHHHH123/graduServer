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
        let {companyCode, companyName} = company;
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
          publisherId: user._id,
          publishTime: +new Date(),
          companyCode,
          companyName,
        });
        let jobId = job._id;
        let publisherId = user._id;
        company = await model.company.findOneAndUpdate({companyCode}, {
          $push: {
            publishJobIdArray: {
              jobId,
              publisherId
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
    console.log(444444444);
    console.log(companyPublishJobIdArray);
    companyPublishJobIdArray.forEach((item, index) => {
      console.log(5555555);
      console.log(item);
      console.log(item.jobId);
      if (item.jobId == deleteJobId) {
        console.log(3333);
        item.isDelete = 1;
        console.log(9999999999);
        console.log(companyPublishJobIdArray);
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
    let jobType = data.jobType;
    console.log(jobType);
    if (!jobType) {
      ctx.body = {
        code: 400,
        msg: '请选择正确的类型'
      }
    }
    let user = await utils.getUser(ctx);
    let allSingleJobTypeJobHunter = await model.user.find({isCompany: 0, expectJobValue: jobType});
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
    let { nickName, gender, email, companyName, companyCode, place, wxCode} = data;
    
   
    
    
    let company = await model.company.findOne({companyCode});
    if(company) {
    
    }else {
      model.company.create({
        companyName: data.unit,
        companyCode: data.companyCode,
        hrArray: [{
          name: user.nickName,
          gender: user.gender,
          hrId: user._id,
        }]
      });
    }
    
  }catch (err) {
    console.log('submitCompanyBasicInfo============' + err);
  }
}

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
    for(let i =0, len = companyLeaderArray.length; i < len; i++) {
      if(!companyLeaderArray[i].leaderImg) {
        companyLeaderArray[i].leaderImg = imageUrl;
        flag = 1;
        break;
      }
    };
    if(flag === 0) {
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
  
  }catch (err) {
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
    for(let i =0, len = companyLeaderArray.length; i < len; i++) {
      if(!companyLeaderArray[i].leaderName) {
        companyLeaderArray[i].leaderName = leaderName;
        companyLeaderArray[i].leaderPlace = leaderPlace;
        companyLeaderArray[i].leaderAccount = leaderAccount;
        flag = 1;
        break;
      }
    }
    if(flag === 0) {
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
    
  }catch (err) {
    console.log('submitCompanyBasicInfo=====' + err);
  }
}

async function earnLeaderInfo(ctx, body) {
  try{
    let user = await utils.getUser(ctx);
    let companyCode = user.companyCode;
    let companyLeaderInfo = (await model.company.findOne({companyCode})).leaderArray;
    
    ctx.body = {
      code: 200,
      msg: '获取leader信息成功',
      data: companyLeaderInfo
    }
  }catch (err) {
    console.log('earnLeaderInfo==========' + err);
  }
}

async function deleteLeaderInfo(ctx, body){
  try{
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
      if(item._id == leaderInfoId) {
        companyLeaderArray.splice(index, 1);
      }
    });
    company.leaderArray = companyLeaderArray;
    await company.save();
    ctx.body={
      code: 200,
      msg: '删除成功',
      data: companyLeaderArray
    }
  }catch (err) {
    console.log('deleteLeaderInfo=========' + err);
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
  earnLeaderInfo,
  deleteLeaderInfo
}