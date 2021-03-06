const router = require('koa-router')()
let doController=require('../controller/controller');
let multer  = require('multer');
let storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});

var upload = multer({ storage: storage });

/*用户基本版块*/
router.get('/user/openTest',doController.user.openTest);
router.post('/user/register',doController.user.register);
router.post('/user/login',doController.user.login);
router.post('/user/updatePwd',doController.user.updatePwd);
router.post('/user/personSettingFixPhone',doController.user.personSettingFixPhone);
router.post('/user/updatePhone',doController.user.updatePhone);
router.post('/user/getVarifyCode',doController.user.getVarifyCode);
router.post('/user/userInfo', doController.user.userInfo);
router.post('/user/submitBossInfImg', doController.user.submitBossInfImg);
router.post('/user/submitBossInfoBasic', doController.user.submitBossInfoBasic);
router.post('/user/submitTitImg', doController.user.submitTitImg);
router.post('/user/submitUserBasicInfo', doController.user.submitUserBasicInfo);
router.post('/user/changeJobHunter', doController.user.changeJobHunter);




/*聊天板块*/
router.post('/sendMsg/sendMsg',doController.sendMsg.sendMsg);


/*求职者接口版块*/
router.post('/jobhunter/earnRecommendJob', doController.jobHunter.earnRecommendJob);
router.post('/jobhunter/earnJobDetail', doController.jobHunter.earnJobDetail);


router.post('/jobhunter/earnRecommendCompany', doController.jobHunter.earnRecommendCompany);
router.post('/jobhunter/saveExpectJobInfo', doController.jobHunter.saveExpectJobInfo);
router.post('/jobhunter/saveWorkExpericence', doController.jobHunter.saveWorkExpericence);
router.post('/jobhunter/attentionCompany', doController.jobHunter.attentionCompany);
router.post('/jobhunter/earnAllAttentionCompany', doController.jobHunter.earnAllAttentionCompany);
router.post('/jobhunter/earnJobHunterCurriculumviate', doController.jobHunter.earnJobHunterCurriculumviate);
router.post('/jobhunter/deleteSingleWorkExpericence', doController.jobHunter.deleteSingleWorkExpericence);
router.post('/jobhunter/updateJobWantedIntention', doController.jobHunter.updateJobWantedIntention);
router.post('/jobhunter/collectJob', doController.jobHunter.collectJob);
router.post('/jobhunter/earnCollectJob', doController.jobHunter.earnCollectJob);
router.post('/jobhunter/sendCurriculumVitaeToRecruiter', doController.jobHunter.sendCurriculumVitaeToRecruiter)
router.post('/jobhunter/earnJobHunterCommunicateData', doController.jobHunter.earnJobHunterCommunicateData)
router.post('/jobhunter/hasCurriculumVitaeData', doController.jobHunter.hasCurriculumVitaeData)
router.post('/jobhunter/earnInterviewData', doController.jobHunter.earnInterviewData)
router.post('/jobhunter/earnHadCurriculumVitaeData', doController.jobHunter.earnHadCurriculumVitaeData)
router.post('/jobhunter/searchJoborCompany', doController.jobHunter.searchJoborCompany)
router.post('/jobhunter/saveComplainDetailInfo', doController.jobHunter.saveComplainDetailInfo)
router.post('/jobhunter/saveComplainImage', doController.jobHunter.saveComplainImage)









/*招聘者接口版块*/
router.post('/recruiter/recruitjob', doController.recruiter.recruitjob)
router.post('/recruiter/allPublishJob', doController.recruiter.allPublishJob)
router.post('/recruiter/updateRecruitjob', doController.recruiter.updateRecruitjob)
router.post('/recruiter/deleteRecruitjob', doController.recruiter.deleteRecruitjob)
router.post('/recruiter/earnSingleJobTypeJobHunter', doController.recruiter.earnSingleJobTypeJobHunter)
router.post('/recruiter/submitCompanyBasicInfo', doController.recruiter.submitCompanyBasicInfo)
router.post('/recruiter/saveCompanyLeaderInfo', doController.recruiter.saveCompanyLeaderInfo)
router.post('/recruiter/saveCompanyLeaderImage', doController.recruiter.saveCompanyLeaderImage)
router.post('/recruiter/earnLeaderInfo', doController.recruiter.earnLeaderInfo)
router.post('/recruiter/deleteLeaderInfo', doController.recruiter.deleteLeaderInfo)

router.post('/recruiter/saveCompanyProductInfo', doController.recruiter.saveCompanyProductInfo)
router.post('/recruiter/saveCompanyProductImage', doController.recruiter.saveCompanyProductImage)
router.post('/recruiter/earnProductInfo', doController.recruiter.earnProductInfo)
router.post('/recruiter/deleteProductInfo', doController.recruiter.deleteProductInfo)
router.post('/recruiter/allCompanyInfo', doController.recruiter.allCompanyInfo)
router.post('/recruiter/saveCompanyDetailInfo', doController.recruiter.saveCompanyDetailInfo)

router.post('/recruiter/saveCompanyImage', doController.recruiter.saveCompanyImage)
router.post('/recruiter/sendCurriculumVitaeToEmail', doController.recruiter.sendCurriculumVitaeToEmail)
router.post('/recruiter/sendInterviewDetail', doController.recruiter.sendInterviewDetail)
router.post('/recruiter/earnCommunicateData', doController.recruiter.earnCommunicateData)
router.post('/recruiter/earnDetailCommunicateData', doController.recruiter.earnDetailCommunicateData)
router.post('/recruiter/earnInterviewData', doController.recruiter.earnInterviewData)
router.post('/recruiter/collectJobHunter', doController.recruiter.collectJobHunter)
router.post('/recruiter/earnCollectJobHunter', doController.recruiter.earnCollectJobHunter)







router.post('/admin/login', doController.admin.login)
router.post('/admin/earnWillExamine', doController.admin.earnWillExamine)
router.post('/admin/earnHadExamine', doController.admin.earnHadExamine)
router.post('/admin/examineItem', doController.admin.examineItem)


router.post('/admin/earnWillComplain', doController.admin.earnWillComplain)
router.post('/admin/earnHadComplain', doController.admin.earnHadComplain)
router.post('/admin/examineComplain', doController.admin.examineComplain)






















module.exports = router;
