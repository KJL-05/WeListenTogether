// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wangyiUserinfo: '',
    weixinUserInfo: ''
  },

  wangyiAvatar() {
    var wangyiUserinfo = wx.getStorageSync('userInfo')
    if(!wangyiUserinfo){
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  
  // 问题反馈回调
  toFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },
  // 关于我们回调
  toAboutus() {
    wx.navigateTo({
      url: '/pages/aboutus/aboutus',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wangyiUserinfo = wx.getStorageSync('userInfo');
    if (wangyiUserinfo) {
      // 更新userInfo的状态
      this.setData({
        wangyiUserinfo: JSON.parse(wangyiUserinfo)
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})