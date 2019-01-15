const router = require('koa-router')()
let doController=require('../controller/controller');


/*用户基本版块*/
router.post('/user/openTest',doController.user.openTest);
router.post('/user/register',doController.user.register);
router.post('/user/login',doController.user.login);
router.post('/user/updatePwd',doController.user.updatePwd);
router.post('/user/getVarifyCode',doController.user.getVarifyCode);


/*聊天板块*/
router.post('/sendMsg/sendMsg',doController.sendMsg.sendMsg);


/*发布版块*/
router.post('/publish/recruitjob', doController.publish.recruitjob)


module.exports = router;
