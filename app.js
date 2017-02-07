var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//加载session模块
var session = require('express-session');
//加载flash模块
var flash = require('connect-flash');
var index = require('./routes/index');
var user = require('./routes/user');
var topic = require('./routes/topic');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//在路由前面设置session存储信息
app.use(session({
	// 加密字符串
	secret:'zheshijiamizhifuchuan',
	cookie:{
		maxAge:60*1000*60,
		path:'/'
	}
}));

//加载flash
app.use(flash());
//设置错误信息和session信息
app.use(function(req,res,next){
	//全局对象
	//错误信息
	res.locals.errMsg = req.flash('errMsg');
	//密码修改错误信息
	res.locals.errMi = req.flash('errMi');
	//资料修改成功信息
	res.locals.succ = req.flash('succ');
	//session信息
	res.locals.user = req.session.user;
	console.log(res.locals.user);
	//继续走 移交权限
	next();
});
// 首页
app.use('/', index);
// 用户模块
app.use('/user', user);
// 话题模块
app.use('/topic',topic);
//后台模块  用户必须是管理员 必须登录了
app.use('/admin',function(req,res,next){
	//如果用户没有登录跳转到前台首页
	if(!req.session.user){
		// 跳转首页
		res.redirect('/');
		//终止程序
		return;
	}else if(req.session.user.level!=1){
		// 登录了但用户不是管理员
		// 跳转首页
		res.redirect('/');
		//终止程序
		return;
	};
	next();
},admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
