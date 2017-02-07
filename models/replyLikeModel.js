// 加载数据库配置文件
var mongoose = require('../config/db_config');

// 创建骨架
var replyLikeSchema = new mongoose.Schema({
	// 回复的id
	rid : {
		type : 'ObjectId',
		ref : 'bbs_reply'
	},
	uid : {
		type : 'ObjectId',
		ref : 'bbs_user'
	},
	likeNum:{
		type:Number,
		default:1
	}
});

// 创建模型
var replyLikeModel = mongoose.model('bbs_reply_like',replyLikeSchema);

// 向外暴露
module.exports = replyLikeModel;