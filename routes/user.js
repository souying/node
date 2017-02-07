//只负责路由中转

var express = require('express');
var router = express.Router();

//加载自定义中间价
var userCheck = require('../middlewares/userCheck');

//加载userContorller.js控制器
var user = require('../controllers/userController');

/* 注册路由 --匿名函数交给 userController.js处理 */ 
router.get('/reg',user.reg);

//处理用户注册的数据
router.post('/doReg',user.doReg);

//登录路由

router.get('/login',user.login);

//登录用户的数据
router.post('/doLogin',user.doLogin);

//退出用户数据

router.get('/doLogout',user.doLogout);

// 用户个人中心  --- 用户不登录是不允许进行访问的
// 中间的userCheck.isLogin方法是中间件
router.get('/ucenter',userCheck.isLogin,user.ucenter);
//更新个人中心数据

router.post('/setting',userCheck.isLogin,user.setting);

//更新个人中心数据密码

router.post('/miupwd',userCheck.isLogin,user.miupwd);

//忘记密码页面
router.get('/pass',user.pass);

//忘记密码处理数据
router.post('/dopass',user.dopass);

//友情链接申请---页面
router.get('/kind',user.kind);

//友情链接申请---数据
router.post('/dokind',user.dokind);
module.exports = router;
