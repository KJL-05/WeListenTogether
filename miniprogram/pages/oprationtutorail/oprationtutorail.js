// pages/oprationtutorail/oprationtutorail.js
var index = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tutorailImages: [
      "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/各按钮介绍/创建小组介绍.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/各按钮介绍/加入小组介绍.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/各按钮介绍/歌曲列表介绍.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/各按钮介绍/使用教程png.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组长使用介绍/组长使用01.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组长使用介绍/组长使用02.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组长使用介绍/组长使用03.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组员使用介绍/组员使用介绍01.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组员使用介绍/组员使用介绍02.png", "cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/组员使用介绍/组员使用介绍03.png"
    ],
    currentImage: 'cloud://dbof-listen-together-9br5a8c0016.6462-dbof-listen-together-9br5a8c0016-1306708025/使用教程img/各按钮介绍/创建小组介绍.png'
  },
  // 切换图片
  changeImageIndex(e) {
    if (e.currentTarget.id == 1) {
      if (index == 0) {
        index = this.data.tutorailImages.length - 1
      } else {
        index--;
      }
      console.log(index)
      this.setData({
        currentImage: this.data.tutorailImages[index]
      })
    } else {
      if (index == this.data.tutorailImages.length - 1) {
        index = 0
      } else {
        index++;
      }
      console.log(index)
      this.setData({
        currentImage: this.data.tutorailImages[index]
      })
    }
    if (index < 4) {
      wx.setNavigationBarTitle({
        title: "各按钮介绍"
      })
    } else if (index < 7) {
      wx.setNavigationBarTitle({
        title: "组长使用介绍"
      })
    } else {
      wx.setNavigationBarTitle({
        title: "组员使用介绍"
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "使用教程"
    })
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