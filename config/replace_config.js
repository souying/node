function pingBi(str){
	// 替换 ---一一替换
	//var str = '这是一段字符串，为了演示效果，不代表本人观点:前两天，朝阳群众又发力，举报了法轮功，举报了马路上的包小姐,举报了枪支、迷药';

	// 定义正则
	var search = /法轮功|包小姐|枪支|迷药/g;

	// 替换
	var newStr = str.replace(search,function(res){
		// res 拿到的是匹配的结果
		switch(res){
			case '法轮功':
				return '***';
			break;
			case '包小姐':
				return '***';
			break;
			case '枪支':
				return '**';
			break;
			case '迷药':
				return '**';
			break;
		}
	})
	return newStr;
};

// 向外暴露方法
module.exports = pingBi;
