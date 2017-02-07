// 加载数据库配置文件
var mongoose = require('../config/db_config');

var replySchema = new mongoose.Schema({
	rContent : String,
	rTime : {
		type : Date,
		default : new Date()
	},
	user:{
		type : 'ObjectId',
		ref : 'bbs_user'
	},
	tid : {
		type : 'ObjectId',
		ref : 'bbs_topic'
	},
	likePerson:[{
		type : 'ObjectId',
		ref : 'bbs_user'
	}],
	floow:{
		type:Number
	}
});

//创建模型
var replyModel = mongoose.model('bbs_reply',replySchema);
//向外暴漏
module.exports = replyModel;