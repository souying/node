//加载数据库配置文件

var mongoose = require('../config/db_config');

//创建骨架

var webSchema = new mongoose.Schema({
	// 站点名称
	webName:{
		type:String
	},
	// 站点关键字
	webKeywords:{
		type:String
	},
	// 站点描述
	webDescription:{
		type:String
	},
	// 网站url
	webUrl:{
		type:String
	},
	// logo地址
	logoUrl:{
		type:String
	},
	// 管理员邮箱
	email:{
		type:String
	},
	// 备案号
	icp:{
		type:String
	},
	// 网站状态
	webActivedes:{
		type:String
	},
	webActive:{
		type:Number,
		default:1
	},
	key:{
		type:String
	}
	
});

//生成对应的模型

var webModel = mongoose.model('bbs_web',webSchema);

//向外暴露
module.exports = webModel;