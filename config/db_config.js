//数据库配置文件

//引入mongoose模块
var mongoose = require('mongoose');
//定义数据库地址
var dbUrl = '127.0.0.1';

//定义数据库端口号

var dbPort = '27017';

//定义数据库名

var dbName = 'bbs';

//定义数据库账户

var dbUser = 'admin';

//定义数据库密码

var dbUpwd = 'admin';

//数据库的完整地址  mongodb://user:upwd@地址:端口号/数据库名称

//拼接完整的数据库地址

var connect_url = 'mongodb://'+dbUrl+':'+dbPort+'/'+dbName;
mongoose.connect(connect_url,function(err){
	if(err){
		console.log(err);
	};
});

module.exports = mongoose;


