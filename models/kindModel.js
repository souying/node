// 加载数据库配置文件
var mongoose = require('../config/db_config');

//创建骨架
var kindSchema = new mongoose.Schema({
	//网站名
	webName:{
		type:String
	},
	// 网址
	webUrl:{
		type:String
	},
	// 联系邮箱
	email:{
		type:String
	},
	//网站介绍
	webContent:{
		type:String
	},
	//是否激活显示
	isShow:{
		type:Number,
		default:0
	},
	// 友情链接排序
	web_top:{
		type:Number,
		default:0
	},
	//友情链接图片
	webpic:{
		type:String
	}

});

//创建模型
var kindModel = mongoose.model('bbs_kind',kindSchema);
//向外暴漏
module.exports = kindModel;