import PubSub from 'pubsub-js';
import moment from 'moment'
import request from '../../../utils/request'
var mongonSDK = require('../../../utils/mongoSDK');
// 获取全局实例
const appInstance = getApp();
var self = this;
var times = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放
    song: {}, // 歌曲详情对象
    musicId: '', // 音乐id
    musicLink: '', // 音乐的链接
    currentTime: '00:00', // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条的宽度
    isLeader: false,
    isMember: false,
    openId: '',
    groupId: 0
  },

  // 页面数据更新（包括数据库读，写）
  pageDataUpdate(data) {
    // 进行判断（isleader，ismember）
    var dataInfo = data
    var self = this;
    console.log("dataInfo", dataInfo)
    if (this.data.isLeader == true && this.data.isMember == false) {
      //  |——》是组长——》通过groupId 调用update(使用参数data)
      var groupId=self.data.groupId;
      var whereStr={
        groupId
      }
      var updateStr=dataInfo
      var data={
        whereStr,
        updateStr
      }
      mongonSDK.updateData(data).then(res => {
        console.log(res)
      }).catch((reason, data)=>{
        console.log("失败原因",reason);
        console.log("相关数据",data)
      })

    } else if (this.data.isLeader == false && this.data.isMember == false) {
      //  |——》是组员——》、、        调用get——》setdata
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    // console.log(JSON.parse(options.songPackage));
    var infoStr = options.infoStr;
    var info = JSON.parse(infoStr);
    this.setData(info);
    let musicId = info.musicId;
    var data = {
      musicId
    }
    this.pageDataUpdate(data)
    // 获取音乐详情
    this.getMusicInfo(info.musicId);

    /*
     * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决方案：
     *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
     *
     * */
    // 判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
      // pageDataUpdate 进行更新
      var isPlay = true;
      var data = {
        isPlay
      }
      this.pageDataUpdate(data);
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });

    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原成 0；时间还原成 0；isPlaya变为false       
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        isPlay:false
      })
      // 进行更新// 进行更新
      var currentWidth = 0;
      var currentWidth = '00:00';
      var data = {
        currentWidth,
        currentWidth
      }
      this.pageDataUpdate(data);
    });
var self=this;
    // 监听音乐实时播放的进度
    var self = this;
    let currentWidth = 0
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      if (self.data.isPlay) {
        currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
      }
      this.setData({
        currentTime,
        currentWidth
      })
      // 进行更新// 进行更新
      var data = {
        currentTime,
        currentWidth
      }
      self.pageDataUpdate(data)
    })
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    // 修改音乐是否的状态
    this.setData({
      isPlay
    })
    // 进行更新
    var data = {
      isPlay
    }
    this.pageDataUpdate(data);
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {
      ids: musicId
    });
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    // 进行更新    // 进行更新
    var song = songData.songs[0];
    var data = {
      song,
      durationTime
    }
    this.pageDataUpdate(data);

    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },
  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    let {
      musicId,
      musicLink
    } = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },

  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) { // 音乐播放
      if (!musicLink) {
        // 获取音乐播放链接
        let musicLinkData = await request('/song/url', {
          id: musicId
        });
        musicLink = musicLinkData.data[0].url;

        this.setData({
          musicLink
        })
        // 进行更新
        var data = {
          musicLink
        }
        this.pageDataUpdate(data);
      }
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    } else { // 暂停音乐
      this.backgroundAudioManager.pause();
    }

  },

  // 点击切歌的回调
  handleSwitch(event) {
    // 获取切歌的类型
    let type = event.currentTarget.id;
    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    // // 订阅来自recommendSong页面发布的musicId消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.setData({
        musicId
      })
      var data = {
        musicId
      }
      this.pageDataUpdate(data)
      // 获取音乐详情信息
      this.getMusicInfo(musicId);
      // 自动播放当前的音乐
      this.musicControl(true, musicId);
      // 取消订阅
      PubSub.unsubscribe('musicId');
    })
    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
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