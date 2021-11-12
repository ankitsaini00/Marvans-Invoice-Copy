const axios = require('axios');

module.exports = {
  //send otp for login
  async sendSms(message, number) {
    await axios({
      method: 'POST',
      url: 'https://control.msg91.com/api/sendhttp.php',
      params: {
        route: "4",
        sender: 'HAPDLS',
        country: "91",
        mobiles: number,
        message: message,
        authkey: process.env.msg91Key
      }
    })
  },

  async sendSmsAll(sms) {
    sms.forEach(async (msg) => {
      await axios({
        method: 'POST',
        url: 'https://control.msg91.com/api/sendhttp.php',
        params: {
          route: "4",
          sender: 'MWMOBI',
          country: "91",
          mobiles: msg.mobile,
          message: msg.message,
          authkey: process.env.msg91Key
        }
      })
    })

  }
}