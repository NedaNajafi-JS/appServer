/**
 * use nodemailer module
 * require contact schema
 * require email page
 */
var nodemailer = require('nodemailer');

module.exports = function sendemail(submitted_info,recipientemail,subject)
{
    var transporter = nodemailer.createTransport({
      host: 'mail.mapnaec.com',//mail server
      port: 25,//outgoing server(SMTP) 
      secure: false,
      auth: {
        user: 'info@mapev.ir',
        pass: 'AJf097yhGmQ'
      }
    });
        
    var mailOptions = {
      from: 'info@mapev.ir',
      to:recipientemail,
      subject: subject,
      html:submitted_info
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}