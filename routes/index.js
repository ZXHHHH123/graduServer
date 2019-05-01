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


/*招聘者接口版块*/
router.post('/recruiter/recruitjob', doController.recruiter.recruitjob)
router.post('/recruiter/allPublishJob', doController.recruiter.allPublishJob)
router.post('/recruiter/updateRecruitjob', doController.recruiter.updateRecruitjob)
router.post('/recruiter/deleteRecruitjob', doController.recruiter.deleteRecruitjob)


module.exports = router;
