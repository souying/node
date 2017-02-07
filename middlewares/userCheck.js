
//自己做中间价 功能防止没登录权限进入页面
module.exports.isLogin = function(req,res,next){
	//检测用户是否登录
	if(!req.session.user){  //取反如果没有session
		//跳到登录页面
		res.redirect('/user/login');
		// 终止程序
		return;
	};

	// 移交下一个
	next();
};