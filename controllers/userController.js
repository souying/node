//争对user的控制器
//加载对应的模型
var userModel = require('../models/userModel');
var topicModel = require('../models/topicModel');
var webModel = require('../models/webModel');
//友情链接
var kindModel = require('../models/kindModel');
// 加载邮箱配置
var sendMail = require('../config/mail');
// 加载数据库模块
var mongodb = require('mongodb');
//加载时间格式化模块
var moment = require('moment');
//加载密码加密的系统模块
var crypto = require('crypto');
//加载上传文件的模块
var upload = require('../config/upload_config');
//加载图片缩放的模块
var gm = require('gm');
//console.log(upload)

// 加载eventProxy
var eventproxy = require('eventproxy');
var ep = new eventproxy();

// 定义一个对象
var user = {};

//定义一个方法  注册
user.reg = function(req,res){
	// 条件
	var web = {
		key:'qwert12345'
	}
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		res.render('home/reg',{webData:webData,title:'欢迎注册'});
	});
};

//注册的数据
user.doReg = function(req,res){
	//console.log(userModel);
	//提交表单以post提交的数据
	var uname = req.body.uname.trim();
	var upwd = req.body.upwd.trim();
	var reupwd = req.body.reupwd.trim();
	var email = req.body.email.trim();
	// 获取ip并截取
	var ip = ((req.ip).slice(7));
	// 选择加密方式
	var md5 = crypto.createHash('md5');
	// 将密码加密
	md5.update(upwd);
	// 执行输出
	var miupwd = md5.digest('hex');
	if(upwd != reupwd){
		//提示错误信息
		req.flash('errMsg','两次密码输入不一致...');
		//跳转当前页面  注册页
		res.redirect('/user/reg');
		//终止程序
		return;
	};
	var con = {
		uname:uname
	};
	var em ={
		email:email
	};
	// 以email为条件查询数据库验证邮箱是否注册
	userModel.findOne(em,function(err,data){
		if(err){
			console.log(err);
			return;
		};
		if(data){
			// 如果data存在提示错误  终止程序
			req.flash('errMsg','此邮箱已被注册.....')
			res.redirect('/user/reg');
			return;
		}
	
		// 以uname为条件查询数据库
		userModel.findOne(con,function(err,data){
			if(err){
				console.log(err);
				return;
			};
			// 如果data存在提示错误  终止程序
			if(data){
				req.flash('errMsg','此用户名已被注册.....')
				res.redirect('/user/reg');
				return;
			}else{
				var newData = {
					uname:uname,
					upwd:miupwd,
					regip:ip,
					//约定  最后一次登录就是注册的时间
					lastLogin : new Date(),
					gold : 20,
					email:email,
					//0未激活状态
					isActive:0

				};
				
				//添加数据
				userModel.create(newData,function(err){
					if(err){
						//有错误
						req.flash('errMsg','数据异常,请重新尝试');
						res.redirect('/user/reg');
						return;
					}else{
						//uname的信息
						var con = {
							uname:uname
						}
						//查询_id
						userModel.findOne(con,function(err,data){
							if(err){
								req.flash('errMsg','数据异常,请重新尝试');
								res.redirect('/user/reg');
								return;
							}
							if(data){
								//发送邮件
								// 获取id
								console.log(data._id);
								var html = '<p>'+uname+'您好:<p/><p>我们收到您在node论坛的注册申请,请点击下面的链接激活帐户:</p><a href="http://192.168.17.33/user/login?_id='+data._id+'">请点击本链接激活帐号</a>';
								sendMail(email,'这是一份激活邮件',html);
								req.flash('succ','终于注册成功了,请到邮箱收件箱或垃圾箱激活登录');
								//注册成功了 返回注册页
								res.redirect('back');
							}
						});
						//注册成功了 返回注册页
						//res.redirect('back');
					}
				});
			}
		});

	});
}

//定义一个方法  登陆  更新激活状态也在这里
user.login = function(req,res){
		// 条件
		//console.log(req.query._id);
		var con = {
			// 需要的是一个ObjectId() // req.query._id 单纯的字符串
			_id:mongodb.ObjectId(req.query._id)
		};
		// 改变激活状态条件
		var is = {
			isActive:1
		}
		userModel.update(con,{$set:is},function(err){
			if(err){
				//有错误
				req.flash('errMsg','数据异常,请重新尝试');
				res.redirect('/user/reg');
				return;
			}
		});
			// 条件
		var web = {
			key:'qwert12345'
		}
		webModel.findOne(web,function(err,webData){
			//console.log(webData);
			// 设置触发(事件名称,传递的数据)
			res.render('home/login',{webData:webData,title:'欢迎登录'});
		});
		
};
 // 登录的数据
user.doLogin = function(req,res){
	// 获取数据  用户名和密码
	var uname = req.body.uname.trim();
	var upwd = req.body.upwd.trim();
	//选择密码加密方式
	var md5 = crypto.createHash('md5');
	// 将密码加密
	md5.update(upwd);
	// 执行输出
	var miupwd = md5.digest('hex');
	var con = {
		uname:uname,
		upwd:miupwd
	}

	// userModel.findOne(con,function(err,data){

	// });


	//console.log(con);
	// 查询是否存在
	userModel.findOne(con,function(err,data){
		if(data){
			//console.log(data);
			if(data.isAllow==0){
				//错误信息
				req.flash('errMsg','账号被封禁,请联系管理员50667@163.com...');
				// 跳转登录页面
				res.redirect('/user/login');
				// 终止程序
				return;
			}
			if(data.isActive==1){
				//获取最后登录的时间
				//获取用户id
				var id = {
					_id:data._id
				}
				// 获取时间 并且格式化时间
				var lastLogin = parseInt(moment(data.lastLogin).format('YYYYMMDD')); 
				var newDate = parseInt(moment(new Date()).format('YYYYMMDD')); 
					//如果当前时间-最后登录时间大于等于1  加积分20
				if(newDate-lastLogin>=1){
					//var gold = parseInt(data.gold);
					var id = {
						_id:data._id
					}
					// 更新积分数量
					userModel.update(id,{$inc:{gold:20}},function(err){
						if(err){
							return;
						}
					});
					// 最后登录时间数据
					var lastLogin = {
						lastLogin:new Date()
					}
					userModel.update(id,{$set:lastLogin},function(err){
						if(err){
							return;
						}
					});

				};
				// 将data存在session中
				req.session.user = data;
				//console.log(req.session.user)
				// data存在跳转首页
				res.redirect('/');
			}else{
				var email = data.email;
				var html = '<p>'+uname+'您好:<p/><p>我们收到您在node论坛的注册申请,请点击下面的链接激活帐户:</p><a href="http://192.168.17.33/user/login?_id='+data._id+'">请点击本链接激活帐号</a>';
				sendMail(email,'这是一份激活邮件',html);
				req.flash('errMsg','账户未激活,请激活后登录使用...')
				res.redirect('back');
				return;
			}
		}else{
			req.flash('errMsg','账户或密码错误,请重新登录...')
			res.redirect('/user/login');
			return;
		}
	})

};

// 登出操作
user.doLogout = function(req,res){
	//设置session为null
	req.session.user = null;
	// 跳转首页
	res.redirect('/');
};
//个人设置操作
user.ucenter = function(req,res){
	// 设置监听 
	ep.all('wuData','goldData','webData','kindData',function(wuData,goldData,webData,kindData){
		// 关联查询 -- 以设置user(存储是用户的_id)
		// console.log(111);
		// console.log(topicData[0].user.uname);

		// 分配数据
		var data = {
			wuData:wuData,
			goldData:goldData,
			title:'这是设置页',
			webData:webData,
			kindData:kindData
		}

		// 响应数据
		res.render('home/ucenter',data);
	});
	//查询无人回复的话题
	var con = {
		rid:{$size:0}
	}
	topicModel.find(con).sort({createTime:-1}).limit(5).exec(function(err,wuData){
		//console.log(wuData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('wuData',wuData);
	});
	//查询积分榜条件
	var gold = {
		gold:-1
	}
	//查询积分榜
	userModel.find().sort(gold).limit(10).exec(function(err,goldData){
		console.log(goldData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('goldData',goldData);
	});
	// 条件
	var web = {
		key:'qwert12345'
	}
	// 查询站点信息
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('webData',webData);
	});
	// 查询所有的友情链接
	kindModel.find().sort({web_top:-1}).exec(function(err,kindData){
		// console.log(data);

		// 设置触发(事件名称,传递的数据)
		ep.emit('kindData',kindData);
	});

};
//个人中心更新数据

user.setting = function(req,res){
	//获取用户信息
	var con = {
		_id:req.session.user._id
	};
	// 判断是否上传了头像
	upload(req,res,function(err){
		// 如果code的值是 LIMIT_FILE_SIZE 说明文件太大了
		// 如果code的值是 fileType，说明文件类型不符合

		// 使用switch结构对应错误信息
		if(err){
			switch(err.code){
				case 'LIMIT_FILE_SIZE':
					var errMsg = '文件太大了,受不了....'
				break;
				case 'fileType':
					var errMsg = '八字不合呀....';
				break;
			}	

			// 返回对应的错误信息 -- 跳转会上传文件的页面 -- 一次性
			// 模块 connect-flash
			req.flash('errMsg',errMsg)
			res.redirect('back');
		}else{
			

			// console.log(req.file);

			// 将文件名存储到数据库
			// 提交的信息
			if(req.file){
				// 成功的....
				// 获取上传的文件名;
				var filename = req.file.filename;

				// 缩放图片 -- 文件上传完毕存储的位置req.file.path
				gm(req.file.path).resize(120,120).write(req.file.path,function(err,msg){
					// console.log(err);
					// console.log(msg);
				})
				var data = req.body;
				data.upic = filename;

				userModel.update(con,{$set:data},function(err){
					if(err){
						// console.log(1111111);

						// 设置失败
						res.flash('errMsg','数据异常，请重新尝试...');

						// 你自己在前端页面对应写好数据...

						// 跳转回设置页面
						res.redirect('back');
					}else{
						// 更新session --- 查询数据库获取最新的信息写入到session中
						userModel.findOne(con,function(err,data){
							req.session.user = data;
							req.flash('succ','资料修改成功')
							// 成功之后，也返回到设置页面
							res.redirect('back');
						});
					}
				})
			}else{
				var data = req.body;
				userModel.update(con,{$set:data},function(err){
					if(err){
						// console.log(1111111);

						// 设置失败
						res.flash('errMsg','数据异常，请重新尝试...');

						// 你自己在前端页面对应写好数据...

						// 跳转回设置页面
						res.redirect('back');
					}else{
						// 更新session --- 查询数据库获取最新的信息写入到session中
						userModel.findOne(con,function(err,data){
							req.session.user = data;
							req.flash('succ','资料修改成功')
							// 成功之后，也返回到设置页面
							res.redirect('back');
						});
					}
				})
			}
		}
		
	})

};

// 修改密码
user.miupwd = function(req,res){
	//修改密码---密码
	// 获取原密码
	var upwd = req.body.upwd.trim(); 
	//获取新密码
	var newupwd = req.body.newupwd.trim();
	// 获取确认密码
	var reupwd = req.body.reupwd.trim();
	//选择密码加密方式
	var md5 = crypto.createHash('md5');
	// 将原密码加密
	md5.update(upwd);
	// 执行输出
	var miupwd = md5.digest('hex');
	// 查询条件
	var con ={
		_id:req.session.user._id,
		upwd:miupwd
	}
	//查询密码检测原密码对错
	userModel.findOne(con,function(err,data){
		if(err){
			return;  //有错误直接终止程序
		};
		//没有数据说明密码错误
		if(!data){
			// 设置错误信息
			req.flash('errMi','原密码输入不正确,请重新输入');
			// 跳到设置页
			res.redirect('back');
			return;
		}else{
			//再检测新密码和确认密码一致不
			if(newupwd != reupwd){
				// 设置错误信息
				req.flash('errMi','两次密码输入不一致,请重新输入');
				// 跳到设置页
				res.redirect('back');
				return;
			}else{
				//选择密码加密方式
				var md5 = crypto.createHash('md5');
				// 将原密码加密
				md5.update(newupwd);
				// 执行输出
				var miupwd = md5.digest('hex');
				// 设置插入的加密的新密码
				var upwdData = {
					upwd:miupwd
				}
				//更新数据---密码
				userModel.update(con,{$set:upwdData},function(err){
					if(err){
						// 设置错误信息
						req.flash('errMi','数据异常,请重新输入');
						// 跳到设置页
						res.redirect('back');
						return;
					}
						// 跳到首页
						res.redirect('/user/login');
				});
			}
				
		};


	});
};

//忘记密码页面
user.pass = function(req,res){
	// 条件查询站点信息
	var web = {
		key:'qwert12345'
	}
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		
		res.render('home/pass',{webData:webData,title:'找回密码页'});
	});
	
};
//忘记密码处理数据
user.dopass = function(req,res){
	//获取两次密码数据
	var upwd = req.body.upwd.trim();
	var reupwd = req.body.reupwd.trim();
	//获取用户名和邮箱
	var uname = req.body.uname.trim();
	var email = req.body.email.trim();
	if(upwd!=reupwd){
		req.flash('errMsg','两次密码输入错误，请重新输入...');
		res.redirect('back');
		return;
	}else{
		//条件
		var con = {
			uname:uname,
			email:email
		};
		//查询用户名和密码
		userModel.findOne(con,function(err,data){
			if(data){
				//选择密码加密方式
				var md5 = crypto.createHash('md5');
				// 将密码加密
				md5.update(upwd);
				// 执行输出
				var miupwd = md5.digest('hex');
				//数据
				var mi = {
					upwd:miupwd
				};
				//更新新密码
				userModel.update(con,{$set:mi},function(err){
					if(err){
						req.flash('errMsg','数据异常，请重新输入...');
						res.redirect('back');
						return;
					}else{
						res.redirect('/user/login');
					}

				});
			};
		});

	};
};

//友情链接--页面
user.kind = function(req,res){
	// 条件查询站点信息
	var web = {
		key:'qwert12345'
	}
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		
		res.render('home/kind',{webData:webData,title:'申请友情链接'});
	});
};
//
user.dokind = function(req,res){
	var kind = req.body;
	//console.log(con)
	kindModel.create(kind,function(err){
		if(err){
			return;
		}else{
			//响应成功的信息
			req.flash('succ','提交成功,等待审核');
			// 成功跳转
			res.redirect('back'); 
		}
	});
}
//将对象暴露
module.exports = user;