/**
 * Created by administrator on 2019/4/10.
 */
const state = {
    playList: [], // 播放列表
    playId:0,//播放id
    showPlay:false,
    playMode:1,//1列表循环，2单曲循环，3随机播放
    sourceArr:[
      {id:1,name:'站内'},
      {id:2,name:'QQ',label:'qq'},
      {id:3,name:'网易云',label:'netease'},
      {id:4,name:'百度',label:'baidu'},
      // {id:5,name:'酷我',label:'kuwo'},
      {id:6,name:'蜻蜓',label:'qingting'},
      {id:7,name:'喜马拉雅',label:'ximalaya'},
      ],
    sourceId:1
}

export default state
