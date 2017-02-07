// 加载对应的模型
// var userModel = require('../models/userModel');

// 加载分类模型
var cateModel = require('../models/cateModel');

// 加载话题模型
var topicModel = require('../models/topicModel');

// 加载回复集合模型
var replyModel = require('../models/replyModel');
// 加载用户模型
var userModel = require('../models/userModel');
// 加载站点模型
var webModel = require('../models/webModel');
// 加载模型 回复点赞
var replyLikeModel = require('../models/replyLikeModel');
// 加载模型 ip库
var ipModel = require('../models/ipModel');
// 加载模型 网站屏蔽词
var pingBi = require('../config/replace_config');
// 加载模型 回复权限库
var replyqModel = require('../models/replyqModel');



// 加载eventProxy
var eventproxy = require('eventproxy');
var ep = new eventproxy();

// 定义topic对象
var topic = {};

// 创建话题路由
topic.create = function(req,res){
	// res.send('这是发表话题的页面')
	ep.all('webData','cateData',function(webData,cateData){
		// 关联查询 -- 以设置user(存储是用户的_id)
		// console.log(111);
		// console.log(topicData[0].user.uname);

		// 分配数据
		var data = {
			title:'帖子发布页',
			webData:webData,
			cateData:cateData
		}

		// 响应数据
		res.render('home/create',data);
	});
	// 查询分类
	cateModel.find(function(err,cateData){
		//console.log(cateData);
		ep.emit('cateData',cateData);
	});
	// 条件查询站点信息
	var web = {
		key:'qwert12345'
	}
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('webData',webData);
	});
};

// 处理添加的数据
topic.doCreate = function(req,res){
	// 获取信息
	// console.log(req.body);
	// 获取ip
	var ip = {
		ip:req.session.user.regip
	}
	var id = {
		uid:req.session.user._id
	}
	//console.log(id);
	// 通过ip查询
	ipModel.findOne(ip,function(err,data){
		//console.log(data)
		if(data){
			// 返回错误信息
			req.flash('errMsg','该账户已被封ip禁言处理,请联系管理员解封');

			// 跳转返回
			res.redirect('back');
			return;
		}else{
			// 通过id查询
			ipModel.findOne(id,function(err,data){
				if(data){
					// 返回错误信息
					req.flash('errMsg','该账户已被封ip禁言处理,请联系管理员解封');

					// 跳转返回
					res.redirect('back');
					return;
				}else{
					// 数据
					var data = {
						tName : pingBi(req.body.tName),
						tContent : pingBi(req.body.tContent),
						cid : req.body.cid,
						//获取可回复权限
						isShow:req.body.isShow,

						// 作者信息 -- 当前登录的用户的_id
						user : req.session.user._id,
						lastEdit : new Date()
					};

					topicModel.create(data,function(err,result){
						if(err){
							// 返回错误信息
							req.flash('errMsg','数据有误，请重新尝试');

							// 跳转返回
							res.redirect('back');
						}else{
							//console.log(result);
							// 条件
							var con = {
								_id:result._id
							}
							topicModel.findOne(con).populate('user','gold').exec(function(err,goldData){
								//console.log(goldData.user._id);
								var con ={
									_id:goldData.user._id
								}
								//更新金币
								userModel.update(con,{$inc:{gold:10}},function(err,data){
									console.log(err);
									//req.session.user = data;
								});
								
								// 发表成功--直接跳转到显示话题详情页面
								res.redirect('/topic/'+result._id);

							});

							// 发表成功--直接跳转到显示话题详情页面
							//res.redirect('/topic/'+result._id);
						}
					})

				}
			});
		}
	});

	/*
		对数据库进行的是插入操作
			result 返回插入的新数据

		对数据库进行的是更新、删除
			result 返回的ok,匹配的行数
	*/

};

// 显示当前话题详情的数据
topic.details = function(req,res){
	// 条件
	var con = {
		_id : req.params.id
	};
	//console.log(con);
	// 进来的时候就应该更新该话题的访问数量 -- 在原有的访问数量上+1
	topicModel.update(con,{$inc:{visitNum:1}},function(err){
		// console.log(err);
	})

	// 使用req.params接收路由 /topic/585cd04dc7a76c16d4da9aca
	ep.all('topicData','replyData','wuData','webData','uData',function(topicData,replyData,wuData,webData,uData){
		res.render('home/details',{topicData:topicData,replyData:replyData,wuData:wuData,webData:webData,uData:uData,title:'--帖子'})
	});

	// 去topicModel查询对应的话题的详情 -- 关联查询用户的信息/关联查询该话题所属的分类
	topicModel.findOne(con).populate('user','uname gold des upic').populate('cid').exec(function(err,topicData){
		// console.log(data);


		// 响应
		ep.emit('topicData',topicData);
	});

	// 查询回复的数据
	var con = {
		tid : req.params.id
	}

	// 查询该话题的回复
	replyModel.find(con).populate('user','uname upic').exec(function(err,replyData){
		ep.emit('replyData',replyData);
		//console.log(replyData);
	});

	//查询无人回复的话题
	var wuData = {
		rid:{$size:0}
	}
	topicModel.find(wuData).sort({createTime:-1}).limit(5).exec(function(err,wuData){
		console.log(wuData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('wuData',wuData);
	});	
	//查询站点信息
	// 条件
	var web = {
		key:'qwert12345'
	}
	webModel.findOne(web,function(err,webData){
		//console.log(webData);
		// 设置触发(事件名称,传递的数据)
		ep.emit('webData',webData);
	});
	// 话题条件
	var data = {
		_id : req.params.id
	};
	//查询到作者的id
	topicModel.findOne(data).populate('user','_id').exec(function(err,uuData){
		// 设置作者的id  查询这个id有多少话题
		console.log(uuData.user._id)
		 var con = {
			user:uuData.user._id
		 }
		//console.log(con)
		//查询这个id有多少话题
		topicModel.find(con).sort({createTime:-1}).limit(5).exec(function(err,uData){
			//console.log(uData);
			ep.emit('uData',uData);
		});
	});
	// 查询条件
	var tid = {
		tid:req.params.id
	};
	
	
};

// 回复话题
topic.reply = function(req,res){


	var ip = {
		ip:req.session.user.regip
	}
	var id = {
		uid:req.session.user._id
	}
	//console.log(id);
	// 通过ip查询
	ipModel.findOne(ip,function(err,data){
		//console.log(data)
		if(data){
			// 返回错误信息
			req.flash('errMsg','该账户已被封ip禁言处理,请联系管理员解封');

			// 跳转返回
			res.redirect('back');
			return;
		}else{
			// 条件
			var con = {
				_id:req.params.id
			}
			//根据id查询当前话题回复的是多少楼
			topicModel.findOne(con,'rid',function(err,topicData){
				// 接收参数
				var data = {
					tid : req.params.id,
					rContent : pingBi(req.body.rContent),
					user : req.session.user._id,
					floow:topicData.rid.length?topicData.rid.length+1:1
				};

				// 插入到reply集合中
				replyModel.create(data,function(err,result){
					if(err){
						// 回复失败了
					}else{
						// result对应了产生回复的_id
						var con = {
							_id : req.params.id,
						};

						// 新数据
						var newData = {
							$push:{
								rid:result._id
							}
						}
						topicModel.update(con,newData,function(err){
							if (!err) {
								// 回复成功了
								// 条件
								var con ={
									_id:req.session.user._id
								};
								//添加回复权限条件
								var newData = {
									tid:req.params.id,
									uid:req.session.user._id
								}
								// 在权限集合中添加话题和回复用户的id
								replyqModel.create(newData,function(err){
									if(err){
										return;
									}
								});
								userModel.update(con,{$inc:{gold:2}},function(err,data){
									console.log(err);
									//req.session.user = data;
								});
								//条件
								var con = {
									_id : req.params.id,
								};
								topicModel.update(con,{$set:{isShow:0}},function(err){
									if(err){
										return;
									}
								});
								res.redirect('back');
							}
						});
					}
				})

			});

		}
	});

};

// 给回复点赞
topic.replyLike = function(req,res){
	// console.log(req.session.user);

	// 检测用户是否已经登录
	if(!req.session.user){
		// 响应数据
		res.send('nologin');
		// 终止程序
		return;
	}

	// 接收参数
	var con = {
		// 要点赞的回复的_id
		_id : req.params.id,

		// 点赞的人的_id
		likePerson : req.session.user._id
	};

	// 在bbs_reply中检测该用户是否已经点赞该话题
	replyModel.findOne(con,function(err,data){
		// 设置响应 res.send()不能单纯的响应数字
		// res.send(200,0);	// 200是状态码，0实际返回的响应数据

		// 在likePerson中如果用户已经点赞，在该数组中已经存储了该用户的_id
		// 在likePerson中如果用户没有点赞，在该数组中没有存储了该用户的_id
		// console.log(data);
		if(data){
			// 已经点赞 -- 将该用户的_id从数组中移除
			var newData = {
				$pull:{
					likePerson:req.session.user._id
				}
			};

			// 条件
			var con = {
				_id : req.params.id
			}

			// 更新
			replyModel.update(con,newData,function(err,result){
				if (!err) {
					res.send('-');
				};
			})
		}else{
			// 还没有点赞
			var newData = {
				$push:{
					likePerson:req.session.user._id
				}
			};

			// 条件
			var con = {
				_id : req.params.id
			}

			// 更新
			replyModel.update(con,newData,function(err,result){
				if (!err) {
					res.send('+');
				};
			})
		}
	})

	/*
		用户单击时查询bbs_reply_like集合中是否有该数据
			有，说明已经点赞，将该文档删除
			没有有，说明还没有点赞，将添加相关的文档
	*/
}

// 将对象暴露
module.exports = topic;
