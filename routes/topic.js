var express = require('express');
var router = express.Router();
//加载模块  首页topic控制器
var topic = require('../controllers/topicController');
//加载自定义中间价
var userCheck = require('../middlewares/userCheck');
// 发表话题的界面  检测有没有登录
router.get('/create',userCheck.isLogin,topic.create);

//发表话题的数据检测有没有登录
router.post('/create',userCheck.isLogin,topic.doCreate);

// 读取该话题的信息
router.get('/:id',topic.details);

//回复话题  用户登录权限
router.post('/reply/:id',userCheck.isLogin,topic.reply);

//给回复点赞
router.get('/reply/like/:id',topic.replyLike)

module.exports = router;