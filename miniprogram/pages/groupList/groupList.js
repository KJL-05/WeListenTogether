// pages/groupList/groupList.js
const db = wx.cloud.database();
const dbLT = db.collection("dbListenTogether")
var mongonSDK = require('../../utils/mongoSDK');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLeader: false,
    groupId: 0,
    inputValue: 0,
    isMember: false,
    openId: '',
    modalHidden: true,
    groupList: [],
    groupInfo: []
  },
  // 点击加号功能测试
  test(res) {
    var self = this;
    console.log('标签传过来的数据', res)
    var groupId = res.target.dataset.grpid
    var selfOpenId = self.data.openId
    wx.showModal({
      title: '温馨提示',
      content: '是否加入该小组',
      success(res) {
        if (res.confirm) {
          var groupOpenId
          var data = {
            groupId
          };
          mongonSDK.getData(data).then(res => {
            groupOpenId = res.result[0]._openid
            if (groupId == self.data.groupId) {
              wx.showModal({
                content: '您已在小组内',
                showCancel: false
              })
            } else if (selfOpenId != groupOpenId) {
              console.log('selfOpenId', selfOpenId)
              console.log('groupOpenId', groupOpenId)
              wx.showLoading({
                title: '加入小组中',
              })
              setTimeout(function () {
                wx.hideLoading()
                self.setData({
                  isMember: true,
                  isLeader: false,
                  groupId: groupId
                })
                // // 跳转到memberSongDetatil页面，传参：
                self.memberPageJump()
              }, 2000)
            } else if (selfOpenId == groupOpenId) {
              wx.showToast({
                title: '您是该小组组长',
                icon: 'success',
                duration: 1000
              })
              self.setData({
                isMember: false,
                isLeader: true,
                groupId: groupId
              })
              self.leaderPageJump()
            }
          }).catch((reason, data)=>{
            console.log("失败原因",reason);
            console.log("相关数据",data);
            return
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 显示弹窗
   */
  showPopUpWin: function () {
    if (this.data.groupInfo.length == 1) {
      this.setData({
        modalHidden: false,
        isFinded: true
      })
    } else {
      this.setData({
        modalHidden: false,
        isFinded: false
      })
    }
  },

  /**
   * 点击取消
   */
  modalCandel: function () {
    //     |-->点击取消--》默认
    this.setData({
      modalHidden: true
    })
  },

  /**
   *  点击确认
   */
  modalConfirm: function () {
    var self = this
    this.setData({
      modalHidden: true,
    })
    var groupOpenId
    var selfOpenId = this.data.openId
    var tempGroupId = Number(this.data.inputValue)
    var data = {
      groupId: tempGroupId,
    };
    mongonSDK.getData(data).then(res => {
      console.log('res的数据', res)
      groupOpenId = res.result[0]._openid
      if (tempGroupId == self.data.groupId) {
        wx.showModal({
          content: '您已在小组内',
          showCancel: false
        })
      } else if (selfOpenId != groupOpenId) {
        console.log('selfOpenId', selfOpenId)
        console.log('groupOpenId', groupOpenId)
        wx.showLoading({
          title: '加入小组中',
        })
        setTimeout(function () {
          wx.hideLoading()
          self.setData({
            isMember: true,
            isLeader: false,
            groupId: tempGroupId
          })
          self.memberPageJump()
        }, 2000)
      } else if (selfOpenId == groupOpenId) {
        wx.showToast({
          title: '您是该小组组长',
          icon: 'success',
          duration: 1000
        })
        self.setData({
          isMember: false,
          isLeader: true,
          groupId: tempGroupId
        })
        self.leaderPageJump()
      }
    }).catch((reason, data)=>{
      console.log("失败原因",reason);
      console.log("相关数据",data);
      return
    })

  },

  // 输入框输入
  oninput(res) {
    var value = res.detail.value.replace(/\D/g, '');
    this.setData({
      inputValue: value
    })
  },
  // 输入框输入搜索
  serchByGrpId() {
    var grpId = this.data.inputValue;
    var groupId = Number(grpId);
    var data = {
      groupId
    };

    // 通过输入框输入的值inputValue查询数据库
    /* wx.cloud.callFunction({
      name: "searchByGrpId",
      data: {
        groupId: grpIdNum
      }
    }) */

    mongonSDK.getData(data).then(res => {
      console.log('js获取到res', res.result);
      this.setData({
        groupInfo: res.result
      })
      // 弹窗--->提示找到小组
      //     |-->在弹窗中显示出小组得 组长，组长的头像
      //     |-->点击确定--》加入小组-->setdata:isLeader,isMemeber,groupId
      //     |-->点击取消--》默认
      this.showPopUpWin();
    }).catch((reason, data) => {
      console.log("失败原因", reason);
      console.log("相关数据", data)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var infoStr = options.infoStr;
    var info = JSON.parse(infoStr);
    this.setData({
      openId: info.openId,
      groupId: info.groupId
    });
    var data = {};
    mongonSDK.getGroupList().then(res => {
      console.log('js获取到的getData数据', res.result)
      this.setData({
        groupList: res.result
      })
    }).catch((reason, data) => {
      console.log("失败原因", reason);
      console.log("相关数据", data)
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

  },

  /**
   * 组长加入小组后的页面跳转
   */
  leaderPageJump: function () {
    var self = this
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    console.log('getCurrentPages的数据', pages)
    let prevPage = pages[pages.length - 2]
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      isLeader: self.data.isLeader,
      groupId: self.data.groupId,
      isMember: self.data.isMember
    })
    //上一个页面内执行setData操作，将我们想要的信息保存住。当我们返回去的时候，页面已经处理完毕。

    wx.navigateBack({
      delta: 3 // 返回上一级页面。
    })
  },


  memberPageJump: function () {
    var self = this
    var musicId = 0
    var groupId = self.data.groupId
    var data = {
      groupId
    };
    mongonSDK.getData(data).then(res => {
      musicId=res.result[0].musicId
      console.log('musicID数据',musicId)
      var dataInfoStr = {
        isLeader: self.data.isLeader,
        groupId: self.data.groupId,
        isMember: self.data.isMember,
        openId: self.data.openId,
        musicId
      }
      dataInfoStr = JSON.stringify(dataInfoStr)
      wx.navigateTo({
        url: '/songPackage/pages/memberSongDetail/memberSongDetail?dataInfoStr=' + dataInfoStr,
      })
    }).catch((reason,data)=>{
      console.log('失败原因',reason);
      console.log('相关数据',data)
    })
    
  }
})