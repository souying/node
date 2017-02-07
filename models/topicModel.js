// 加载数据库配置文件
var mongoose = require('../config/db_config');

// 创建骨架
var topicSchema = new mongoose.Schema({
	// 话题标题
	tName:{
		type:String
	},
	// 话题内容
	tContent:{
		type:String
	},
	//话题分类
	cid:{
		type:'ObjectId',
		ref : 'bbs_cate'
	},
	//发表话题的作者是登录用户的_id
	user:{
		type:'objectId',
		// ref 表示关联，
		ref : 'bbs_user'
	},
	//发布时间
	createTime:{
		type:Date,
		default:Date.now
	},
	//最后一次编辑时间
	lastEait:{
		type:Date,
	},
	//浏览次数
	visitNum:{
		type:Number,
		default:0
	},
	// 回复的评论的_id
	rid:[{
		type:'ObjectId',
		ref : 'bbs_reply'
	}],
	// 屏蔽帖是否显示
	isActive:{
		type:Number,
		default:1
	},
	//置顶状态0不置顶
	top:{
		type:Number,
		default:0
	},
	//加精状态
	love:{
		type:Number,
		default:0
	},
	//话题是否回复可见  默认不设置为0
	isShow:{
		type:Number,
		default:0
	},

});


// 创建模型
var topicModel = mongoose.model('bbs_topic',topicSchema);

// 向外暴漏

module.exports = topicModel;