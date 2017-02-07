// 引入加密模块
var crypto = require('crypto');

/**
*	定义加密的方法 cryStr()
*	@param string inStr 要加密的字符串
*	@param string outStr 加密之后的字符串
*/
function cryStr(inStr){
	// 选择加密方式
	var md5 = crypto.createHash('md5');

	// 加密
	md5.update(inStr);

	// 输出返回结果
	var outStr = md5.digest('hex');

	// 返回
	return outStr;
};

// 向外暴露方法
module.exports = cryStr;