var express = require('express');
var router = express.Router();
//加载模块  首页index控制器
var index = require('../controllers/indexController');
/* GET home page. */
router.get('/',index.index);

module.exports = router;
