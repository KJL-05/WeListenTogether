import moment from 'moment'
import request from '../../../utils/request'
var mongonSDK = require("../../../utils/mongoSDK");

// 获取全局实例
const appInstance = getApp();
var times = false;
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
    groupId: 0,
    message1:'请稍等',
    message2:'',
    timer: 0 //计时器
  },
  // 跳转测试
  seekTest() {
    this.backgroundAudioManager.seek(30);
  },
  // 获取一次同步
  getOnceSync() {
    var isPlay, musicId, currentTime,musicLink;
    var self = this;
    var groupId = this.data.groupId;
    var data = {
      groupId
    };
    mongonSDK.getData(data).then(res => {
      isPlay = res.result[0].isPlay;
      musicId = res.result[0].musicId;
      musicLink = res.result[0].musicLink;
      currentTime = res.result[0].currentTime;
      if (isPlay != this.data.isPlay || musicId != this.data.musicId) {
        if (isPlay != this.data.isPlay) {
          this.setData({
            message1:isPlay?"组长正在播放":"组长正在暂停",
          })
        }
        if (musicId!=this.data.musicId) {
          this.getMusicInfo(musicId)
        }
        this.setData({
          isPlay,
          musicId,
          musicLink,
          currentTime
        })
        console.log("11231", musicId);
        console.log('intervalGetData数据显示：=》isPlay', isPlay)
        console.log('intervalGetData数据显示：=》musicId', musicId)
        self.handleMusicPlay();
      }

    }).catch((reason, data)=>{
      console.log("失败原因",reason);
      console.log("相关数据",data)
    })
  },
  intervalGetData() {
    var countNum = 0;
    clearInterval(this.data.timer);
    this.setData({
      timer: null
    })
    this.setData({
      timer: setInterval(() => {
        this.getOnceSync();
      }, 1000)
    })
  },

  handleClick() {
    if (!times) {
      // 第一次点击
      this.getOnceSync();
      this.intervalGetData();
      times = true;
    } else {
      // 第二次点击
      this.setData({
        isPlay: false
      })
      clearInterval(this.data.timer);
      this.setData({
        timer: null
      })
      this.handleMusicPlay();
      times = false;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    // console.log(JSON.parse(options.songPackage));
    var dataInfoStr = options.dataInfoStr;
    var dataInfo = JSON.parse(dataInfoStr);

    var musicId = Number(dataInfo.musicId);
    var groupId = Number(dataInfo.groupId);
    var openId = dataInfo.openId;
    this.setData({
      musicId,
      groupId,
      openId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId);

    // 判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
      // 进行数据库读取——》isPlay——》setData
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 读取数据库，获取歌曲播放状态（isPlay，）
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      // this.changePlayState(true);
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      // this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      console.log('触发onStop')
      this.changePlayState(false);
    });

    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450;
      this.setData({
        currentTime,
        currentWidth
      })
      // 进行数据库读取
    })
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    // 修改音乐是否的状态
    this.setData({
      isPlay
    })
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {
      ids: musicId
    });
    if (!musicId) {
      wx.showToast({
        title: '还未加入歌曲，请稍等',
        icon: 'none',
        duration: 3000
      })
    }
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },
  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = this.data.isPlay;

    let {
      musicId,
      musicLink
    } = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },

  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) { // 音乐播放
      this.backgroundAudioManager.src = musicLink;
      // 获取音乐播放链接
      let musicLinkData = await request('/song/url', {
        id: musicId
      });
      musicLink = musicLinkData.data[0].url;
      this.setData({
        musicLink,
        message2:this.data.song.name
      });
      var seekTime = this.data.currentTime;
      var min = Number(seekTime.substring(0, 2));
      var sec = Number(seekTime.substring(3));
      seekTime = min * 60 + sec;
      this.backgroundAudioManager.seek(seekTime);
      this.backgroundAudioManager.title = this.data.song.name;
    } else { // 暂停音乐
      this.backgroundAudioManager.pause();
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