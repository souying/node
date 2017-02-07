// admin控制器

// 加载分类对应的模型
var cateModel = require('../models/cateModel');
var topicModel = require('../models/topicModel');
var userModel = require('../models/userModel');
var replyModel = require('../models/replyModel');
var ipModel = require('../models/ipModel');
//站点权限
var webModel = require('../models/webModel');
//友情链接
var kindModel = require('../models/kindModel');
// 引入加密模块
var cryStr = require('../config/crypto_config');
//加载mongodb
var mongodb = require('mongodb');
//加载上传文件的模块
var upload = require('../config/upload_config');
//加载图片缩放的模块
var gm = require('gm');
// 加载eventProxy
var eventproxy = require('eventproxy');
var ep = new eventproxy();


// 设置空对象
var admin = {};

// 后台首页
admin.index = function(req,res){
	//获取查询信息
	var con = {
		key:'qwert12345'

	}
	//console.log(con);
	webModel.findOne(con,function(err,adminData){
		console.log(adminData);
		res.render('admin/index',{adminData:adminData});
	});
	//res.render('admin/index');
};
// 后台首页---添加数据
admin.doIndex = function(req,res){
	//获取查询信息
	var con = {
		key:req.body.key,

	}
	// 获取更新数据
	var web = req.body
	//console.log(req.body);
	webModel.findOne(con,function(err,data){
		if(data){
			webModel.update(con,{$set:web},function(err,webData){
				if(err){
					return;
				}
				// 响应模板

				//res.render('admin/index',{webData:webData});
				res.redirect('back');

				
			});
		}else{
			webModel.create(web,function(err,webData){
				if(err){
					return;
				}
				// 响应模
				//res.render('admin/index',{webData:webData})
				res.redirect('back');
				
			});
		}
	});
};
// 后台登录页面
admin.login = function(req,res){
	// 响应对应的模板
	res.render('admin/user/login');
};
// 后台登录数据处理
admin.doLogin = function(req,res){
	// 获取数据
	// var con = req.body;
	var con = {
		uname : req.body.uname,
		upwd : cryStr(req.body.upwd)
	}

	// 验证是否存在
	userModel.findOne(con,function(err,data){
		// console.log(data);
		if(!data){
			// 设置错误信息，跳转回登录页面
			req.flash('errMsg','账户或密码有误....')
			res.redirect('/admin/login');
			// 终止程序
			return;
		}else if(data.level==0){
			// 设置错误信息，跳转回登录页面
			req.flash('errMsg','您没有管理权限....')
			res.redirect('/admin/login');
			// 终止程序
			return;
		}else{

			// 向下将data数据存储到session中
			req.session.user = data;

			// 跳转
			res.redirect('/admin');
		}

	})
	
};
// 登出操作
admin.doLogout = function(req,res){
	//设置session为null
	req.session.user = null;
	// 跳转登录页
	res.redirect('/admin/user/login');
};
//展示所有的用户
admin.userShow = function(req,res){
	//计算总数量
	userModel.find().count(function(err,total){
		// 每页显示20条
		var pageSize = 20;
		//当前的页数
		var page = req.query.page?req.query.page:1;
		//页数最大值
		var pageMax = Math.ceil(total/pageSize);
		//得到的偏移量
		var pageOffset = (page-1)*pageSize;
		//查询所有的用户数据
		userModel.find().skip(pageOffset).limit(pageSize).exec(function(err,userData){
			//console.log(userData);
			//查询所有的用户数据
			// 分配的数据
			var data = {
				userData:userData,
				page:page,
				pageMax:pageMax
			}
			res.render('admin/user/userShow',data);

		});

	});	
};
//用户添加
admin.userAdd = function(req,res){
	res.render('admin/user/userAdd');
};
//用户添加
admin.userdoAdd = function(req,res){
	// 获取添加数据
	var con = {
		uname:req.body.uname.trim(),
		upwd:cryStr(req.body.upwd.trim()),
		email:req.body.email.trim(),
		des:req.body.des,
		gold:req.body.gold.trim(),
		age:req.body.age.trim(),
		sex:req.body.sex,
		level:req.body.level,
		regip:((req.ip).slice(7)),
		lastLogin : new Date(),
		isActive:1
	}
	// 检测邮箱是否已存在...
	var email = {
		email : req.body.email.trim()
	};

	//console.log(con);
	// 检测用户是否已存在...
	var uname = {
		uname : req.body.uname.trim()
	};
	userModel.findOne(email,function(err,emaildata){
		if(emaildata){
			// 返回错误信息
			req.flash('errMsg','邮箱已经存在....');

			// 跳转添加用户页
			res.redirect('/admin/userAdd');

			// 终止程序
			return; 
		}else{
			// 查询用户有没有被注册
			userModel.findOne(uname,function(err,data){
				if(err){
					console.log(err);

					// 终止
					return;
				}

				// data不存在说明可以注册,存在就不可以注册
				if(data){
					// 返回错误信息
					req.flash('errMsg','用户名已存在....');

					// 跳转添加用户页
					res.redirect('/admin/userAdd');

					// 终止程序
					return; 
				}else{
						userModel.create(con,function(err){
						if(err){
							//提示错误信息
							req.flash('errMsg','数据异常,  添加失败...');
							//跳转当前页面  注册页
							res.redirect('/admin/userAdd');
							//终止程序
							return;
						}else{
							//成功跳转用户展示页面
							res.redirect('/admin/userShow');
						}
					});
				}
			});
		}
	});
};
//修改个人信息页面

admin.userEdit = function(req,res){
	// 响应当前用户的数据
	// 获取地址栏上的用户id
	con = {
		_id:req.query._id
	}
	//查询
	userModel.findOne(con,function(err,data){
		// 响应到页面
		//console.log(data)
			res.render('admin/user/userEdit',{data:data});
	});
};

//更新用户数据
admin.userUpdate = function(req,res){
	// 获取用户信息
	var con = {
		_id:req.params._id
	};
	//console.log(con)
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
					var errMsg = '文件格式错误....';
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

//禁止用户
admin.userStop = function(req,res){
	// 获取id
	var con = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isAllow:0}};
	// 更新
	userModel.update(con,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//解封用户
admin.userStart = function(req,res){
	// 获取id
	var con = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isAllow:1}};
	// 更新
	userModel.update(con,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//封禁用户ip
admin.userIpno = function(req,res){
	// 获取id
	var con = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isip:0}};
	// 更新封ip用户的状态
	userModel.update(con,newdata,function(err){
		if(err){
			return;
		}
	});
	//查询用户的注册ip
	userModel.findOne(con,function(err,data){
		//console.log(data.regip);
		// 添加的数据
		var newData = {
			ip:data.regip,
			uid:req.query._id
		};
		ipModel.create(newData,function(err){
			if(err){
				return;
			};
			// 添加完跳回原页面
			res.redirect('back');
		});
	});

};

//解封用户ip
admin.userIpyes = function(req,res){
	// 获取id
	var con = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isip:1}};
	// 更新封ip用户的状态
	userModel.update(con,newdata,function(err){
		if(err){
			return;
		}
	});
	//查询用户的注册ip
	userModel.findOne(con,function(err,data){
		console.log(data.regip);
		// 删除ip库的数据
		var newData = {
			uid:req.query._id
		};
		ipModel.remove(newData,function(err){
			if(err){
				return;
			};
			// 添加完跳回原页面
			res.redirect('back');
		});
	});
};

//话题展示
admin.topicShow = function(req,res){
	//计算总数量
	topicModel.find().count(function(err,total){
		// 每页显示20条
		var pageSize = 20;
		//当前的页数
		var page = req.query.page?req.query.page:1;
		//页数最大值
		var pageMax = Math.ceil(total/pageSize);
		//得到的偏移量
		var pageOffset = (page-1)*pageSize;
		//查询所有的用户数据
		topicModel.find().sort({createTime:-1}).populate('user','uname').populate('cid','cateName').skip(pageOffset).limit(pageSize).exec(function(err,topicData){
			console.log(topicData);
			//查询所有的话题数据
			// 分配的数据
			var data = {
				topicData:topicData,
				page:page,
				pageMax:pageMax
			}
			res.render('admin/topic/topicShow',data);

		});

	});	
};

//话题屏蔽
admin.topicStop = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isActive:0}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//话题解封
admin.topicStart = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{isActive:1}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//话题删除
admin.topicRemove = function(req,res){
	// 获取id
	var topic = {
		tid:req.query._id
	}
	//查询话题id条件
	var topicremove = {
		_id:req.query._id
	}
	replyModel.find(topic,function(err,data){
		if(data){
			//删除评论
			replyModel.remove(topic,function(err){
				if(err){
					return;
				}
			});
			//删除话题
			topicModel.remove(topicremove,function(err){
				if(err){
					return;
				}else{
					//查询对应的发表用户id
					topicModel.findOne().populate('user','_id').exec(function(err,topicData){
						// 获取作者id
						var data = {
							_id:topicData.user._id
						}
						if(err){
							return;
						}else{
							userModel.update(data,{$inc:{gold:-10}},function(err){
								if(err){
									return;
								}

							req.flash('succ','话题修改成功');
							// 删除完跳回原页面
							res.redirect('back');
						})
						}
					});
				}
			});
		}else{
			// 删除话题
			topicModel.remove(topicremove,function(err){
				if(err){
					return;
				}else{
					//查询对应的发表用户id
					topicModel.findOne().populate('user','_id').exec(function(err,topicData){
						// 获取作者id
						var data = {
							_id:topicData.user._id
						}
						if(err){
							return;
						}else{
							userModel.update(data,{$inc:{gold:-10}},function(err){
								if(err){
								return;
							}

							req.flash('succ','话题修改成功');
							// 删除完跳回原页面
							res.redirect('back');
						})
						}
					});
				}
			});
		}
	});
	
};

//话题置顶
admin.topicTop = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{top:1}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//话题取消置顶
admin.topictopNo = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{top:0}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};
//话题加精  
admin.topicLove = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{love:1}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//话题取消加精
admin.topicloveNo = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	// 更新的数据
	var newdata = {$set:{love:0}};
	// 更新
	topicModel.update(topic,newdata,function(err){
		// 更新完跳回原页面
		res.redirect('back');
	});
};

//话题预览
admin.topiconeShow = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	topicModel.findOne(topic).populate('user','uname').populate('cid','cateName').exec(function(err,topicData){
		//响应模板
		var data = {
			topicData:topicData
		}
		res.render('admin/topic/topiconeShow',data);
	});
	
};

//话题编辑--页面
admin.topicEdit = function(req,res){
	// 获取id
	var topic = {
		_id:req.query._id
	}
	topicModel.findOne(topic).populate('user','uname').populate('cid','cateName').exec(function(err,topicData){
		//响应模板
		var data = {
			topicData:topicData
		}
		res.render('admin/topic/topicEdit',data);
	});

};
//话题编辑--数据
admin.topicdoEdit = function(req,res){
	// 获取id条件
	var topic = {
		_id:req.body._id
	}
	//console.log(topic);
	var con = req.body;
	//console.log(con);
	topicModel.update(topic,{$set:con},function(err){
		if(err){
			return;
		}
		req.flash('succ','话题修改成功');
		res.redirect('back');
	});
};

// 话题分类---页面
admin.cateShow = function(req,res){
	cateModel.find(function(err,cateData){
		//console.log(cateData)
		var data = {
			cateData:cateData
		}
		res.render('admin/cate/cateShow',data);
	});
	
};

//话题删除修改页面
admin.cateEdit = function(req,res){
	cateModel.find(function(err,cateData){
		//console.log(cateData)
		var data = {
			cateData:cateData
		}
		res.render('admin/cate/cateEdit',data);
	});
};

//话题分类删除
admin.cateRemove = function(req,res){
	// 获取话题分类id
	var cate = {
		_id:req.query._id
	}
	//查询话题id条件
	var cateremove = {
		cid:req.query._id
	}
	topicModel.findOne(cateremove,function(err,data){
		console.log(data)
		if(data){
			req.flash('errMsg','该话题分类下有话题,不允许删除');
			res.redirect('back');
		}else{
			cateModel.remove(cate,function(){
				req.flash('succ','删除成功');
				res.redirect('back');
			});
		}
	});

};

//话题修改编辑---页面
admin.cateEditor = function(req,res){
	// 获取id
	var cate = {
		_id:req.query._id
	}
	// 查询话题
	cateModel.findOne(cate,function(err,cateData){
		res.render('admin/cate/cateEditor',{cateData:cateData});
	});
	
};

//话题修改编辑---数据
admin.catedoEditor = function(req,res){
	var cate = {
		_id:req.body._id
	}
	var newData ={
		cateName:req.body.cateName,
		cate_top:req.body.cate_top
	}
	//console.log(cate)
	//console.log(newData)
	cateModel.update(cate,{$set:newData},function(err){
		if(err){
			req.flash('errMsg','操作错误,请稍后重试');
			res.redirect('back');
			return;
		}else{
			req.flash('succ','修改成功');
			res.redirect('back');
		}

	});
};

//话题分类添加--页面
admin.cateAdd = function(req,res){
	res.render('admin/cate/cateAdd')

};
//话题分类添加--数据
admin.catedoAdd = function(req,res){

	var cate = req.body;
	//console.log(cate)
	cateModel.create(cate,function(err){
		if(err){
			req.flash('errMsg','操作错误,请稍后重试');
			res.redirect('back');
			return;
		}else{

			res.redirect('/admin/cateShow');
		}
	});
};
//全部回复预览---页面
admin.replieShow = function(req,res){
	//计算总数量
	replyModel.find().count(function(err,total){
		// 每页显示20条
		var pageSize = 20;
		//当前的页数
		var page = req.query.page?req.query.page:1;
		//页数最大值
		var pageMax = Math.ceil(total/pageSize);
		//得到的偏移量
		var pageOffset = (page-1)*pageSize;
		//查询所有的用户数据
		replyModel.find().sort({rTime:-1}).skip(pageOffset).limit(pageSize).populate('user','uname').populate('tid','tName').exec(function(err,replyData){
			//console.log(userData);
			//查询所有的用户数据
			// 分配的数据
			var data = {
				replyData:replyData,
				page:page,
				pageMax:pageMax
			}
			res.render('admin/reply/replieShow',data);

		});

	});	
};

//回复编辑修改--页面
admin.replieEdit = function(req,res){
	// 获取id
	var reply = {
		_id:req.query._id
	};
	//console.log(reply)
	replyModel.findOne(reply).populate('user','uname').populate('tid','tName').exec(function(err,replyData){
		var data = {
			replyData:replyData
		}
		res.render('admin/reply/replieEdit',data);
	});
	
};
//回复编辑修改--数据
admin.repliedoEdit = function(req,res){
	// 获取id--条件
	var reply = {
		_id:req.body._id
	}
	var newData = {
		rContent:req.body.rContent
	}
	//console.log(reply)
	//console.log(newData)
	// 更新数据
	replyModel.update(reply,{$set:newData},function(err){
		if(err){
			req.flash('errMsg','数据异常,修改失败');
			res.redirect('back');
		}else{
			req.flash('succ','修改成功');
			res.redirect('back');
		}
	});
};
// 向外暴露

//回复删除--数据
admin.replieRemove = function(req,res){
	// 获取id --条件
	var reply = {
		_id:req.query._id
	};
	replyModel.remove(reply,function(err){
		if(err){
			req.flash('errMsg','数据异常,删除失败');
			res.redirect('back');
		}else{
			//查询对应的发表用户id
			replyModel.findOne().populate('user','_id').exec(function(err,replyData){
				if(err){
					return;
				}
				//获取回复用户id
				var data = {
					_id:replyData.user._id
				}
				// 更新积分数量
				userModel.update(data,{$inc:{gold:-2}},function(err){
					if(err){
						return;
					}
					//响应成功的信息
					req.flash('succ','删除成功');
					res.redirect('back');
				});

			});
		}
	});

};

//友情链接--页面
admin.kindness = function(req,res){
	kindModel.find(function(err,kindData){
		res.render('admin/kindness/kindness',{kindData:kindData});
	});
};

//友情链接添加  --- 页面
admin.kindnessAdd = function(req,res){
	res.render('admin/kindness/kindnessAdd');
};

//友情链接添加  --- 数据
admin.kindnessdoAdd = function(req,res){
	var con = req.body;
	//console.log(con)
	kindModel.create(con,function(err){
		if(err){
			return;
		}else{
			//响应成功的信息
			req.flash('succ','操作成功');
			// 成功跳转
			res.redirect('/admin/kindness'); 
		}
	});
};

//友情链接审核  --- 数据
admin.kinddoNo = function(req,res){
	// 获取id
	var kind = {
		_id:req.query._id
	}
	//更新的数据
	var newData ={
		isShow:1
	}
	// 更新状态
	kindModel.update(kind,{$set:newData},function(err){
		if(err){
			return;
		}else{
			// 成功跳转
			res.redirect('back');
		}
	});
};

//友情链接预览修改--页面

admin.kindEdit = function(req,res){
	// 获取id
	var kind = {
		_id:req.query._id
	}
	// 查询数据
	kindModel.findOne(kind,function(err,kindData){
		// 分配数据
		res.render('admin/kindness/kindnessEdit',{kindData:kindData});
	});
};

//友情链接预览修改--数据处理
admin.kinddoEdit = function(req,res){
	// 获取id
	var kind = {
		_id:req.body._id
	};
	var newData = {
		webName : req.body.webName,
		webUrl : req.body.webUrl,
		email : req.body.email,
		webpic : req.body.webpic,
		webContent : req.body.webContent,
		web_top : req.body.web_top,
		isShow : req.body.isShow
	}
	//console.log(kind)
	//console.log(newData)
	kindModel.update(kind,{$set:newData},function(err){
		if(err){
			//响应失败的信息
			req.flash('errMsg','数据异常,操作失败');
			// 失败跳转
			res.redirect('back'); 
			return;
		}else{
			//响应成功的信息
			req.flash('succ','修改成功');
			// 成功跳转
			res.redirect('back'); 
		}
	});
}

//友情链接删除--数据处理
admin.kindRemove = function(req,res){
	// 获取id
	var kind = {
		_id:req.query._id
	};
	//执行删除
	kindModel.remove(kind,function(err){
		if(err){
			//响应失败的信息
			req.flash('errMsg','数据异常,操作失败');
			// 失败跳转
			res.redirect('back'); 
			return;
		}else{
			//响应成功的信息
			req.flash('succ','删除成功');
			// 成功跳转
			res.redirect('back'); 
		}
	});
}

//暴漏对象
module.exports = admin;