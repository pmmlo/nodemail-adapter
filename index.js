var nodemailer = require('nodemailer')

module.exports = function (options) {

    var hostFromEmail = email => {
        if (email && email.includes("@")) {
            return "mail." + email.substring(email.indexOf("@") + 1)
        } else {
            return null
        }
    }
    var smtpHostFromEmail = email => {
        if (email && email.includes("@")) {
            return "smtp." + email.substring(email.indexOf("@") + 1)
        } else {
            return null
        }
    }
    var securityStatusFromPort = port => {
        if (!port) return false
        port = parseInt(port)
        if (port == 587 || port == 465) return true
        return false
    }
    var transporter;
    console.log("Moo");
    if (options.type == "OAuth2") {
        if (options.accessToken) {
            /// Token-Based Authentication
            transporter = nodemailer.createTransport({
                host: options.host || smtpHostFromEmail(options.email),
                port: options.port || 465,
                secure: true,
                auth: {
                    type: options.type, // OAuth2
                    user: options.email, // Your email id
                    accessToken: options.accessToken
                }
            });
        } else if (options.clientId && options.clientSecret && options.refreshToken && options.accessToken && options.expires) {
            /// 3-Legged OAuth2
            transporter = nodemailer.createTransport({
                host: options.host || smtpHostFromEmail(options.email),
                port: options.port || 465,
                secure: true,
                auth: {
                    type: options.type, // OAuth2
                    user: options.email, // Your email id
                    clientId: options.clientId, // xlskjdf.apps.googleusercontent.com
                    clientSecret: options.clientSecret,
                    refreshToken: options.refreshToken,
                    accessToken: options.accessToken,
                    expires: options.expires
                }
            });
        } else if (options.serviceClient && options.privateKey && options.accessToken && options.expires) {
            /// 2-Legged OAuth2
            transporter = nodemailer.createTransport({
                host: options.host || smtpHostFromEmail(options.email),
                port: options.port || 465,
                secure: true,
                auth: {
                    type: options.type, // OAuth2
                    user: options.email, // Your email id
                    serviceClient: options.serviceClient, // e.g. 113600000000000000000
                    privateKey: options.privateKey,
                    accessToken: options.accessToken,
                    expires: options.expires
                }
            });
        } else if (options.serviceClient && options.privateKey) {
            /// 2-Legged OAuth2
            console.log('2-legged');
            transporter = nodemailer.createTransport({
                host: options.host || smtpHostFromEmail(options.email),
                port: options.port || 465,
                secure: true,
                auth: {
                    type: options.type, // OAuth2
                    user: options.email, // Your email id
                    serviceClient: options.serviceClient, // e.g. 113600000000000000000
                    privateKey: options.privateKey
                }
            });
        }
    } else {
        if (options.password) {
            transporter = nodemailer.createTransport({
                host: options.host || hostFromEmail(options.email),
                port: options.port || 25,
                secure: options.secure || securityStatusFromPort(options.port || 25),
                auth: {
                    user: options.email, // Your email id
                    pass: options.password // Your password }
                }
            });
        }
    }

    var sendMail = function (mail) {
        return new Promise(function (resolve, reject) {
            var mailOptions = {
                ...mail,
                from: mail.from || options.from || options.email, // sender address
                to: [mail.to], // Comma separated list or an array of recipients email addresses that will appear on the To: field
                subject: mail.subject, // Subject line
                text: mail.text, //, // plaintext body
                html: mail.html,
                attachments: mail.attachments
            }

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error)
                    return
                }
                resolve(info)
            });
        });
    };


    return {
        sendMail: sendMail
    }
};