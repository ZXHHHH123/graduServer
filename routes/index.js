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





/*聊天板块*/
router.post('/sendMsg/sendMsg',doController.sendMsg.sendMsg);


/*求职者接口版块*/
router.post('/jobhunter/saveExpectJobInfo', doController.jobHunter.saveExpectJobInfo);
router.post('/jobhunter/saveWorkExpericence', doController.jobHunter.saveWorkExpericence);
router.post('/jobhunter/earnJobHunterCurriculumviate', doController.jobHunter.earnJobHunterCurriculumviate);
router.post('/jobhunter/deleteSingleWorkExpericence', doController.jobHunter.deleteSingleWorkExpericence);
router.post('/jobhunter/updateJobWantedIntention', doController.jobHunter.updateJobWantedIntention);







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

module.exports = router;
