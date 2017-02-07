var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('./email_config.js')
//开启连接池
//根据配置文件生成 smtpTransport                               
smtpTransport = nodemailer.createTransport(smtpTransport({
    service: config.email.service,
    auth: {
        // QQ号--config身上的一个方法
        user: config.email.user,
        // QQ密--config身上的一个方法
        pass: config.email.pass
    }
}));
//声明一个函数  3个实参
var sendMail = function (recipient, subject, html) {

    smtpTransport.sendMail({

        from: config.email.user,  //发件地址
        to: recipient,            //收件人
        subject: subject,         //邮件标题
        html: html                //邮件内容

    }, function (error, response) {
        if (error) {

            console.log(error);
        }
        console.log('发送成功');
    });

    // 如果没用，关闭连接池
    //transport.close();
};

//sendMail('1223105966@qq.com','注册成功了', 'Hi 小伙子,欢迎注册使用');

// 暴露sendMail
module.exports = sendMail;