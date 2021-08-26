export function getOpenId(){
  wx.login({

    success: function (res) {
      if (res.code) {
        //发起网络请求
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wxa0cec3a6df864250&secret=2b77731a700670d9d47578ed11ddbad5&js_code=' + res.code + '&grant_type=authorization_code',
          method: "POST",
          success: function (res) {
              return res.data.openid
          }
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  });
}
