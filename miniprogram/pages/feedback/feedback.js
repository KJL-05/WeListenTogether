// pages/feedback/feedback.js
var mongoSDK = require('../../utils/mongoSDK')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discraption: '',
    contactWay: ''
  },
  // 获取问题描述
  discraptionInput(e) {
    var discraption = e.detail.value;
    this.setData({
      discraption
    })
  },
  // 获取联系方式
  getContactWay(e) {
    var contactWay = e.detail.value;
    this.setData({
      contactWay
    })
  },
  // 提交问题反馈
  postProblem() {
    var {
      contactWay,
      discraption
    } = this.data
    if (!discraption) {
      return;
    } else {
      var data = {
        contactWay,
        discraption
      }
      mongoSDK.postFeedback(data).then(res => {
        wx.showLoading({
          title: res.msg,
        })
        setTimeout(function () {
          wx.hideLoading()
          if (res.code == 2250) {
            wx.navigateBack({
              delta: 1,
            })
          } else {
            this.onLoad();
          }
        }, 1200)

      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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