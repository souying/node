// 加载数据库配置文件
var mongoose = require('../config/db_config');

//创建骨架
var ipSchema = new mongoose.Schema({
	ip:{
		type:String
	},
	uid:{
		type:'ObjectId',
		ref : 'bbs_user'
	}

});

//创建模型
var ipModel = mongoose.model('bbs_ip',ipSchema);
//向外暴漏
module.exports = ipModel;