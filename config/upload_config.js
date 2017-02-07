/**
*	定义上传图片的函数 uploadFile()
*	@params string 上传的图片保存的位置
*/

// 加载模块
var multer = require('multer');
var path = require('path');
var time = require('time-stamp');
var uid = require('uid');

// 设置存储信息
var storage = multer.diskStorage({
	// 存储的位置 -- 目录名自己创建
	destination:function(req,file,cb){
		cb(null,'public/uploads');
	},

	// 文件的命名 --- 不重复
	filename:function(req,file,cb){
		// 设置文件的扩展名 -- 获取源文件的扩展名
		var extname = path.extname(file.originalname);

		// 保证文件名是唯一的 uid 唯一
		var filename = time('YYYY')+time('MM')+time('DD')+time('HH')+time('mm')+time('ss')+uid()+extname;

		// 存储
		cb(null,filename);
	}
});

// 文件过滤函数
function fileFilter(req,file,cb){
	// 定义允许上传的文件类型
	var allowType = ['image/jpeg','image/png','image/gif'];

	if(allowType.indexOf(file.mimetype)==-1){
		// 不存储
		cb(null,false);

		// 设置错误信息
		var error = new Error();
		error.code = 'fileType';

		// 抛出错误
		cb(error);
	}else{
		// 允许的
		cb(null,true)
	}
}

// 设置文件上传的配置
var upload = multer({
	storage:storage,
	fileFilter:fileFilter,
	limits:{
		fileSize:400*1024
	}
}).single('upic');

// 向外暴露
module.exports = upload;