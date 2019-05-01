/*
 * 招聘者接口
 * */
let model = require('../model/model');
let utils = require('../config/util/utils');
let redisUtil = require('../config/util/redisUtil');

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
      return item.publisherId == user._id && item.isDelete!==1;
    });
    console.log(presentHrPublishJob);
    let publisherAllJobDetail = [];
    ctx.body = await new Promise((resolve, reject) =>{
      presentHrPublishJob.forEach(async (item, index, presentHrPublishJob) => {
        let jobDetail = await model.jobType.findOne({_id: item.jobId});
        
        publisherAllJobDetail.push(jobDetail);
        if(index === presentHrPublishJob.length - 1){
          resolve({
            code: 200,
            msg: '搜索成功',
            data: publisherAllJobDetail
          })
        }
      })
    }) ;
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
        jobLabel, jobValue, jobAccount, jobAddress, experienceRequire, studyRequire, upMoney, floorMoney, chooseCity, chooseCityValue
      }
    });
    
    ctx.body = {
      code: 200,
      msg: '更新成功'
    };
   
   
  }catch (err) {
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
      if(item.jobId == deleteJobId) {
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
    
  }catch(err) {
    console.log('deleteRecruitjob=============' + err);
  }
}
module.exports = {
  recruitjob,
  allPublishJob,
  updateRecruitjob,
  deleteRecruitjob
}