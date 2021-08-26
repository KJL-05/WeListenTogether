// pages/fitstPage/firstPage.js
import request from '../../utils/request'
var mongonSDK = require('../../utils/mongoSDK');

var times = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUploadTip: false,
    haveGetOpenId: false,
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单
    topList: [], // 排行榜数据
    isLeader: false,
    isMember: false,
    groupId: "",
    _id: '0',
    envId: '',
    openId: '',
    nickName: '',
    avatarUrl: '',
    isDelete: false,
    timer: 0 ,//计时器暂时存储
    coverTransform: 'translateY(0)',
    coveTransition: '',
    userInfo: {}, // 用户信息
    recentPlayList: [], // 用户播放记录
  },
  // info生成
  generateInfo() {
    var {
      isLeader,
      isMember,
      openId,
      groupId
    } = this.data
    var info = {
      isLeader,
      isMember,
      openId,
      groupId
    }
    var infoStr = JSON.stringify(info)
    return infoStr;
  },

  // 使用教程跳转
  toOprationTutorail(){
    wx.navigateTo({
      url: '/pages/oprationtutorail/oprationtutorail',
    })
  },


  // 点击轮播图跳转
  bannerToWeb(res) {
    var weburl = res.target.dataset.url;
    wx.navigateTo({
      url: "/pages/webview/webview?url=" + weburl,
    })
  },
  // 加入小组
  joinGroup() {
    var self = this
    wx.showModal({
      title: '请输入小组编号或选择小组',
      editable: true,
      placeholderText: "这里输入小组编号",
      confirmText: "加入小组",
      cancelText: "选择小组",
      success(res) {
        if (res.confirm) {
          var tempGroupIdStr = res.content;
          var tempGroupId = Number(tempGroupIdStr);
          var groupId = tempGroupId;
          var data = {
            groupId
          };
          mongonSDK.getData(data).then(dataInfo => {
            if (dataInfo.result.length == 1) {
              wx.showToast({
                title: '加入成功',
                icon: 'success',
                duration: 1000
              })
              self.setData({
                isMember: true,
                isLeader: false,
                groupId: tempGroupId
              })
              // 跳转到memberSongDetatil页面，传参：
              self.toMemberSongDetail();
            } else {
              wx.showToast({
                title: '未找到小组',
                icon: 'error',
                duration: 1000
              })
            }
          }).catch((reason, data)=>{
            console.log("失败原因",reason);
            console.log("相关数据",data)
          })
        } else if (res.cancel) {
          var infoStr = self.generateInfo();
          wx.navigateTo({
            url: '/pages/groupList/groupList?infoStr=' + infoStr
          })
        }
      }
    })
  },

  // 跳转toRecommendSong
  toRecommendSong() {
    var infoStr = this.generateInfo();
    if (this.data.isLeader || this.data.isMember) {
      if (this.data.isLeader == false && this.data.isMember == true) {
        this.toMemberSongDetail();
      } else {
        wx.navigateTo({
          url: '/songPackage/pages/recommendSong/recommendSong?infoStr=' + infoStr
        })
      }
    } else {
      var self = this;
      // 弹出提示：未创建或加入小组，是否直接进入歌单？按钮：取消  确认
      wx.showModal({
        title: '温馨提示',
        content: '你还没有创建或加入小组，是否创建或加入小组，选择取消进入歌曲推荐列表',
        success(res) {
          if (res.confirm) {
            // 弹窗：询问创建   /    加入
            wx.showActionSheet({
              itemList: ['创建', '加入'],
              success: function (res) {
                if (!res.cancel) {
                  //res.tapIndex这里是点击了那个按钮的下标
                  if (res.tapIndex == 0) {
                    self.creatGroup()
                  } else if (res.tapIndex == 1) {
                    self.joinGroup()
                  }
                }
              }
            })
          } else if (res.cancel) {
            // 跳转sondDetail navto
            wx.navigateTo({
              url: '/songPackage/pages/recommendSong/recommendSong?infoStr=' + infoStr
            })
          }
        }
      })
    }
  },

  //跳转至组员歌曲详情页
  toMemberSongDetail() {
    var groupId = this.data.groupId
    var data = {
      groupId
    }
    mongonSDK.getData(data).then(res => {
      var {
        groupId,
        musicId
      } = res.result[0];
      var openId = this.data.openId;
      var dataInfo = {
        groupId,
        musicId,
        openId
      };
      var dataInfoStr = JSON.stringify(dataInfo)
      // musicId-路由传参-memberSongdetail
      wx.navigateTo({
        url: '/songPackage/pages/memberSongDetail/memberSongDetail?dataInfoStr=' + dataInfoStr,
      })
    }).catch((reason, data)=>{
      console.log("失败原因",reason);
      console.log("相关数据",data);
      return
    })
  },

  // 创建小组
  async creatGroup() {
    var self = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    setTimeout(function () {
      wx.hideLoading();
    }, 500)
    // 通过_openid删除数据库中相应记录——》isDelete:true，
    if (!self.data.isDelete) {
      mongonSDK.delData(this.data.openId).then(res => {
        // 判断是否已经创建小组
        // 获取数据库中的数据
        var dataList;
        var _openid=self.data.openId;
        var data={_openid}
        mongonSDK.getData(data).then(res => {
          dataList = res.result
          console.log('正在比较是否相等')
          if (dataList.length == 1) {
            self.setData({
              isLeader: true,
              isMember: false,
              groupId
            })
          }

          // 没有创建小组-->
          //   |- 用openid生成groupId
          var time = self.gennerateGrpId();
          var groupId = self.data.groupId;
          var _openid=self.data.openId;
          var data = {
            groupId,
            _openid
          };
          mongonSDK.addData(data).then(res => {
            console.log(res)
            self.setData({
              isLeader: true,
              isMember: false,
              isDelete: true
            })
          }).catch((reason, data)=>{
            console.log("失败原因",reason);
            console.log("相关数据",data)
          })
          wx.showModal({
            title: '小组创建成功',
            content: "您的小组编号为" + self.data.groupId,
            success(res) {
              if (res.confirm) {
                console.log('正在创建小组，用户点击确定')
                wx.getUserProfile({
                  desc: '创建小组',
                  success(res) {
                    console.log('已经获取到用户信息', res)
                    self.setData({
                      nickName: res.userInfo.nickName,
                      avatarUrl: res.userInfo.avatarUrl
                    })
                    // update定位语句
                    var _openid = self.data.openId;
                    var whereStr = {
                      _openid
                    };
                    // update更新语句
                    var leaderNickName = self.data.nickName;
                    var leaderAvatarUrl = self.data.avatarUrl;
                    var updateStr = {
                      leaderNickName,
                      leaderAvatarUrl
                    };
                    var data = {
                      whereStr,
                      updateStr
                    };
                    mongonSDK.updateData(data).then(res => {
                      console.log('update更新结果', res)
                    }).catch((reason, data)=>{
                      console.log("失败原因",reason);
                      console.log("相关数据",data)
                    })
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })

        }).catch((reason, data)=>{
          console.log("失败原因",reason);
          console.log("相关数据",data)
        })

      }).catch((reason, data)=>{
        console.log("失败原因",reason);
        console.log("相关数据",data)
      })
    } else {
      // 已经创建小组--> 
      //        |--提示当前groupId
        var _openid=self.data.openId;
        var data={_openid};
        // 进行数据库查询
        mongonSDK.getData(data).then(res => {
          // 查询结果
          var tempData = res
          self.setData({
            groupId: tempData.result[0].groupId
          })
          wx.showModal({
            title: '已创建过小组',
            content: "您已创建过小组，您的小组编号为" + self.data.groupId + '你可以将小组编号分享给组员',
            success(res) {
              if (res.confirm) {
                console.log('创建过小组，用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }).catch((reason, data)=>{
          console.log("失败原因",reason);
          console.log("相关数据",data)
        })
      console.log('已经创建小组')
    }
  },

  // 加入小组
  joinGroup() {
    var self = this
    // 输入框
    //    |--请输入小组编号
    wx.showModal({
      title: '请输入小组编号或选择小组',
      editable: true,
      placeholderText: "这里输入小组编号",
      confirmText: "加入小组",
      cancelText: "查看小组",
      success(res) {
        if (res.confirm) {
          // 获取输入内容
          var tempGroupIdStr = res.content;
          var tempGroupId = Number(tempGroupIdStr);
          // 输入内容与自身比较
          //  |——》不相等则没有创建或加入过小组（if）
          if (tempGroupId != self.data.groupId) {
            var groupId=tempGroupId;
            var data={groupId};
            // 数据库查询
            mongonSDK.getData(data).then(res => {
              console.log('正在通过groupId查询数据库')
              console.log(res)
              //    |———》判断数据是否为空
              //    |——》拿到了数据-找到了小组
              if (res.result.length == 1) {
                // 判断小组是否为自己创建
                //  |——》不是自己创建则加入（if）
                if (self.data.openId != res.result[0]._openid) {
                  wx.showToast({
                    title: '加入成功',
                    icon: 'success',
                    duration: 1000
                  })
                  self.setData({
                    isMember: true,
                    isLeader: false,
                    groupId: tempGroupId
                  })
                  // 跳转到memberSongDetatil页面，传参：
                  self.toMemberSongDetail();
                } else {
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
                }
              } else {
                //    |——》数据为空：弹窗提示：没有找到小组
                wx.showToast({
                  title: '未找到小组',
                  icon: 'error',
                  duration: 1000
                })
              }
            }).catch((reason, data)=>{
              console.log("失败原因",reason);
              console.log("相关数据",data)
            })
          } else {
            wx.showModal({
              title: '温馨提示',
              content: '您已经在小组内',
              showCancel: false,
              complete(res){
                self.toMemberSongDetail();
              }
            })
          }
          //          }
        } else if (res.cancel) {
          console.log('用户点击取消')
          var infoStr = self.generateInfo();
          wx.navigateTo({
            url: '/pages/groupList/groupList?infoStr=' + infoStr ,
          })
        }
      }
    })
  },

  // 跳转toRecommendSong
  toRecommendSong() {
    var infoStr = this.generateInfo();
    if (this.data.isLeader || this.data.isMember) {
      console.log('正在跳转')
      if (this.data.isLeader == false && this.data.isMember == true) {
        this.toMemberSongDetail();
      } else {
        wx.navigateTo({
          url: '/songPackage/pages/recommendSong/recommendSong?infoStr=' + infoStr
        })
      }
    } else {
      var self = this;
      // 弹出提示：未创建或加入小组，是否直接进入歌单？按钮：取消  确认
      wx.showModal({
        title: '温馨提示',
        content: '你还没有创建或加入小组，是否创建或加入小组，选择取消进入歌曲推荐列表',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            // 弹窗：询问创建   /    加入
            wx.showActionSheet({
              itemList: ['创建', '加入'],
              success: function (res) {
                if (!res.cancel) {
                  console.log(res.tapIndex) //按钮的下标
                  if (res.tapIndex == 0) {
                    self.creatGroup()
                  } else if (res.tapIndex == 1) {
                    self.joinGroup()
                  }
                }
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
            // 跳转sondDetail navto
            wx.navigateTo({
              url: '/songPackage/pages/recommendSong/recommendSong?infoStr=' + infoStr
            })
          }
        }
      })
    }

  },





  // 获取组长的头像及昵称
  async getLeaderProfile() {
    var self = this;
    wx.getUserProfile({
      desc: "创建小组",
      success(res) {
        console.log(res);
        console.log('正在获取userInfo')
        self.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        })
      }
    })
  },


  // 用openid生成groupId
  gennerateGrpId() {
    var grpId = 0;
    var myDate = new Date();
    var mytime = myDate.toLocaleTimeString(); //获取当前时间
    for (var j = 0; j < mytime.length; j++) {
      grpId += mytime.charCodeAt(j)
    }
    for (var i = 0; i < this.data.openId.length; i++) {
      grpId = grpId + this.data.openId.charCodeAt(i);
    }
    this.setData({
      groupId: grpId
    })
    console.log('正在生成grpId')
    return myDate;
  },

  // 获取openid
  getOpenId() {
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.setData({
        haveGetOpenId: true,
        openId: resp.result.openid,
      })
      console.log('正在获取openid')
      wx.hideLoading()
     
    }).catch((e) => {
      this.setData({
        showUploadTip: true
      })
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/banner', {
      type: 2
    });
    this.setData({
      bannerList: bannerListData.banners
    })
    console.log('bannerList查看', bannerListData.banners)
    this.setData({
      envId: options.envId
    })
    this.getOpenId();

    // 读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo){ // 用户登录
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record', {uid: userId, type: 0});
    let index = 0;
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList
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
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo){ // 用户登录
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
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