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

  },
async sendWhatsApp(message, number) {
    // console.log(number);
    const numberCheck = await axios.post(
      `https://api.chat-api.com/${process.env.whatsapp_instance}/contacts?token=${process.env.whatsapp_token}`, 
    {
        blocking: "wait",
        force_check: true,
        contacts: [`+${number}`]
      });
    // console.log(numberCheck); 
    console.log(numberCheck.data);
    if(numberCheck.data.contacts[0].status == "valid"){
      const template = await axios.post(
        `https://api.chat-api.com/${process.env.whatsapp_instance}/sendTemplate?token=${process.env.whatsapp_token}`, 
          {          
            template: "greeting_message",
            language: {
            "policy": "deterministic",
            "code": "en"
            }, 
            namespace: "521bac4a_4623_4a26_9ccc_6db1db9fa73a",
            chatId : "",
            phone: number
          }
      );
      console.log(template.data);
      // console.log('here');
      const resp = await axios.post(
        `https://api.chat-api.com/${process.env.whatsapp_instance}/sendMessage?token=${process.env.whatsapp_token}`,
      {
        body : message,
        phone  : number
      });
      console.log(resp.data);
    }
    else {
      return false;
    }
  }
}