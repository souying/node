// 加载数据库配置文件
var mongoose = require('../config/db_config');

//创建骨架
var cateSchema = new mongoose.Schema({
	cateName:{
		type:String,
		unique:true
	},
	cate_top:{
		type:Number
	}

});

//创建模型
var cateModel = mongoose.model('bbs_cate',cateSchema);
//向外暴漏
module.exports = cateModel;