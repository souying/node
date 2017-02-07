// 加载数据库配置文件
var mongoose = require('../config/db_config');

//创建骨架
var replyqSchema = new mongoose.Schema({
	tid:{
		type:'ObjectId',
		ref : 'bbs_topic'
	},
	uid:{
		type:'ObjectId',
		ref : 'bbs_user'
	}

});

//创建模型
var replyqModel = mongoose.model('bbs_replyq',replyqSchema);
//向外暴漏
module.exports = replyqModel;