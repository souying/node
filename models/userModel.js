//加载数据库配置文件

var mongoose = require('../config/db_config');

//创建骨架

var userSchema = new mongoose.Schema({
	//用户名
	uname:{
		type:String,
		unique:true
	},
	upic:{
		type:String,
		default:''
	},
	//密码
	upwd:{
		type:String
	},
	//年龄
	age:{
		type:Number,
		default:1
	},
	//性别
	sex:{
		type:Number,
		default:3
	},
	//邮箱
	email:{
		type:String,
		//如果绑定邮箱--邮箱也是唯一的  unique:true
		unique:true
	},
	//积分
	gold:{
		type:Number
	},
	// 个性签名
	des:{
		type:String,
		default:''
	},
	//注册时间
	createTime:{
		type:Date,
		// 默认的时间
		default:Date.now
	},
	//最后的登录时间
	lastLogin:{
		type:Date,
	},
	//注册的ip
	regip:{
		type:String
	},
	// 账户激活状态
	isActive:{
		type:String
		//0未激活状态
	},
	// 管理员标志
	level:{
		type:Number,
		default:0
	},
	//黑名单状态
	isAllow:{
		type:Number,
		default:1
	},
	//封ip状态
	isip:{
		type:Number,
		default:1
	}

});

//生成对应的模型

var userModel = mongoose.model('bbs_user',userSchema);

//向外暴露
module.exports = userModel;

