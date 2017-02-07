var express = require('express');
var router = express.Router();
//加载模块  首页admin控制器
var admin = require('../controllers/adminController');
// 后台首页
router.get('/',admin.index);
// 后台首页添加数据
router.post('/',admin.doIndex);
// 后台登录模块---页面
router.get('/login',admin.login);
// 后台登录模块---数据
router.post('/doLogin',admin.doLogin);
// 后台退出模块
router.get('/doLogout',admin.doLogout);
// 后台用户展示模块
router.get('/userShow',admin.userShow);
// 后台用户添加模块
router.get('/userAdd',admin.userAdd);
// 后台用户添加模块---数据
router.post('/userdoAdd',admin.userdoAdd);
// 修改个人信息模块--页面
router.get('/userEdit',admin.userEdit);

// 修改个人信息模块--更新
router.post('/userUpdate/:id',admin.userUpdate);

// 禁止用户登录  拉黑
router.get('/userStop',admin.userStop);

//启用---用户解封
router.get('/userStart',admin.userStart);

//用户--封禁Ip
router.get('/userIpno',admin.userIpno);

//用户--解封ip

router.get('/userIpyes',admin.userIpyes);

//话题展示
router.get('/topicShow',admin.topicShow);

// 话题屏蔽
router.get('/topicStop',admin.topicStop);

// 话题解封
router.get('/topicStart',admin.topicStart);

// 删除话题
router.get('/topicRemove',admin.topicRemove);

//置顶话题--数据
router.get('/topicTop',admin.topicTop);

//取消置顶话题 -- 数据
router.get('/topictopNo',admin.topictopNo);

//加精话题--数据
router.get('/topicLove',admin.topicLove);

//取消加精话题
router.get('/topicloveNo',admin.topicloveNo);
//编辑话题---页面
router.get('/topicEdit',admin.topicEdit);

//编辑话题---数据
router.post('/topicdoEdit',admin.topicdoEdit);

//预览话题
router.get('/topiconeShow',admin.topiconeShow);
// 向外暴漏

// 话题分类页面
router.get('/cateShow',admin.cateShow);

//话题分类修改--删除--页面
router.get('/cateEdit',admin.cateEdit);

//删除话题分类
router.get('/cateRemove',admin.cateRemove);

//编辑话题分类---页面
router.get('/cateEditor',admin.cateEditor);

//编辑话题分类---数据
router.post('/catedoEditor',admin.catedoEditor);

//话题分类添加----页面
router.get('/cateAdd',admin.cateAdd);

//话题分类添加----数据
router.post('/catedoAdd',admin.catedoAdd);

//回复预览---页面
router.get('/replieShow',admin.replieShow);

//回复修改--页面
router.get('/replieEdit',admin.replieEdit);

//回复修改编辑  --- 数据
router.post('/repliedoEdit',admin.repliedoEdit);

//回复删除  --- 数据

router.get('/replieRemove',admin.replieRemove);

//友情链接管理---页面
router.get('/kindness',admin.kindness);

//友情链接添加---页面
router.get('/kindnessAdd',admin.kindnessAdd);

//友情链接添加---数据
router.post('/kindnessdoAdd',admin.kindnessdoAdd);

//友情链接审核
router.get('/kinddoNo',admin.kinddoNo);

//友情链接修改--页面
router.get('/kindEdit',admin.kindEdit);

//友情链接修改--数据
router.post('/kinddoEdit',admin.kinddoEdit);

//友情链接删除--数据
router.get('/kindRemove',admin.kindRemove);

//暴漏对象kindRemove
module.exports = router;
