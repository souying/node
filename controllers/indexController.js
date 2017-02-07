// index控制器

// 加载分类对应的模型
var cateModel = require('../models/cateModel');
var topicModel = require('../models/topicModel');
var userModel = require('../models/userModel');
var replyModel = require('../models/replyModel');
var webModel = require('../models/webModel');
var kindModel = require('../models/kindModel');


// 加载eventProxy
var eventproxy = require('eventproxy');
var ep = new eventproxy();


// 设置空对象
var index = {};

// 首页
index.index = function(req,res){

	// 将分类模块的信息分配给前台页面 --- 针对分类的模型

	// 默认将所有的话题查询出来 -- 分页
	
	// 解决回调嵌套问题

	// 设置监听 
	ep.all('topicData','cateData','page','pageMax','tab','replyData','wuData','goldData','webData','catetopData','kindData',function(topicData,cateData,page,pageMax,tab,replyData,wuData,goldData,webData,catetopData,kindData){
		// 关联查询 -- 以设置user(存储是用户的_id)
		// console.log(111);
		// console.log(topicData[0].user.uname);

		// 分配数据
		var data = {
			cateData:cateData,
			topicData:topicData,
			page:page,
			pageMax:pageMax,
			tab:tab,
			replyData:replyData,
			wuData:wuData,
			goldData:goldData,
			webData:webData,
			catetopData:catetopData,
			kindData:kindData,
			title:'--首页'
		}
		// 检测网站状态
		if(webData.webActive==0){
			res.render('home/weihu',data);
			return;
		}else{


			// 响应数据
			res.render('home/index',data);
		}

		// 响应数据
		//res.render('home/index',data);
		
	});

	/*
		查询话题 --- 
			1. 同时需要查询出发表的用户
			2. 在首页显示时候，我们只需要获取的是话题的标题、浏览量、用户的头像(没有,使用用户名进行代替)
	*/
	
	/*
		话题查询是有条件的:
			全部 --- 没有条件		?tab=all
			分类					?tab=分类的_id
			精华					?tab=分类的_id
	*/

	// 获取条件
	// var tab = req.query.tab;
	// console.log(tab);

	// 按照分类进行查询
	var con = {};


	// 如果有条件 --- 第一次进来 req.query.tab 是undefined
	if(req.query.tab!='all' && req.query.tab!=undefined){
		con.cid = req.query.tab

		ep.emit('tab',con.cid);
	}else{
		ep.emit('tab','all');
	}

	// console.log(con);


	/*
		分页处理
	*/ 
	//  每页显示的条数
	var pageSize = 20;

	// 当前的页数
	var page = req.query.page?req.query.page:1;

	topicModel.find(con).sort({createTime:-1}).populate('user','uname upic').populate('cid','cateName cate_top').sort({cate_top:1}).count(function(err,total){

		// 获取总条数 total
		// console.log(total);
		
		// page的限制
		if(page<=1){
			page=1
		}

		// 最大的页数
		var pageMax = Math.ceil(total/pageSize);

		if(page>=pageMax){
			page=pageMax
		}

		// 当前的偏移量
		var pageOffset = (page-1)*pageSize;

		// 进行查询
		// 关联查询
		topicModel.find(con).sort({top:-1,createTime:-1}).skip(pageOffset).limit(pageSize).populate('user','uname upic').populate('cid','cateName').populate('rid','user').exec(function(err,topicData){
			ep.emit('topicData',topicData);
			ep.emit('page',page);
			ep.emit('pageMax',pageMax);
		});
		// 关联查询话题分类  按序号从大到小排序
		cateModel.find().sort({cate_top:-1}).exec(function(err,catetopData){
			ep.emit('catetopData',catetopData);
			
		});
	})
	// 查询最后一次回复的图片
	replyModel.findOne(con).sort({_id:-1}).limit(1).populate('user','upic').exec(function(err,replyData){
		console.log(replyData);

		// 设置触发(事件名称,传递的数据)
		ep.emit('replyData',replyData);
	});
	// 查询所有的分类
	cateModel.find(function(err,cateData){
		// console.log(data);

		// 设置触发(事件名称,传递的数据)
		ep.emit('cateData',cateData);
	});

	//查询无人回复的话题
	var wu = {
		rid:{$size:0}
	}
	topicModel.find(wu).sort({createTime:-1}).limit(5).exec(function(err,wuData){
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
	// 查询所有的友情链接
	kindModel.find().sort({web_top:-1}).exec(function(err,kindData){
		// console.log(data);

		// 设置触发(事件名称,传递的数据)
		ep.emit('kindData',kindData);
	});
	

};


// 向外暴露
module.exports = index;