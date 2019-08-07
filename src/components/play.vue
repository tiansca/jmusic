<template>
  <div class="bigBox">
    <div v-show="showPlay">
      <div class="background" :style="{'backgroundImage':'url('+ music.cover +')'}" :class="showPlay?'':'hide_back'">

      </div>
      <div class="hello" :class="showPlay?'':'hide_back1'">
      <span class="close"  @click="close">
        <i class="fa fa-angle-double-down" aria-hidden="true"></i>
      </span>

        <div class="name">
          {{music.title}}
        </div>
        <div class="artist">
          {{music.artist}}
        </div>
        <div class="cover" :style="{'backgroundImage':'url('+ music.cover +')'}"></div>

        <div class="lrcBox" ref="lrcBox">
          <div>
            <div style="height: 120px;padding-top: 20px;">
              <div class="lrcItem" v-if="isGeting === true">
                正在加载歌词...
              </div>
              <div class="lrcItem" v-if="isGeting == 'error'" @click="getLrc">
                点击重新加载歌词
              </div>
              <div class="lrcItem" v-if="isGeting == false && (!music.lrcUrl || music.lrcUrl == 'none')">
                没有歌词
              </div>
              <div class="lrcItem" v-if="isGeting == 'finish' && this.lrcArr.length == 0">
                没有歌词
              </div>
            </div>
            <div v-for="(item, index) in lrcArr" class="lrcItem" :class="index==lrcIndex?'activeLrc':''" v-show="item && item[1] !=''">
              {{item[1]}}
            </div>
            <div style="height: 140px"></div>
          </div>
        </div>
        <div class="rateBar" @touchstart="touchstart($event)"
             @touchend="touchend($event)"
             @mousedown="touchstart($event)"
             @mousemove="touchmove($event)"
             @mouseup="touchend($event)"
             @touchmove="touchmove($event)">
          <mt-range
            v-model="rate"
            :min="0"
            :max="100"
            :bar-height="2">
            <div slot="start">{{this.currentTime1}}</div>
            <div slot="end">{{this.duration1}}</div>
          </mt-range>
        </div>
        <div class="controlBar">
          <i class="fa fa-download" aria-hidden="true"  style="font-size: 18px; margin-right: 10px" @click="download(music.mp3Url,music.title + ' - ' + music.artist)"></i>
          <i class="fa fa-step-backward big-icon" aria-hidden="true" @click="ended(true, true)"></i>
          <i class="fa fa-play big-icon" aria-hidden="true" v-if="!isPlay" @click="setPlay"></i>
          <i class="fa fa-pause big-icon" aria-hidden="true" v-if="isPlay" @click="setPlay"></i>
          <i class="fa fa-step-forward big-icon" aria-hidden="true" @click="ended(true)"></i>
          <i @click="setplayMode">
            <img src="../assets/loop.png" class="playMode" v-if="playMode == 1">
            <img src="../assets/repeat.png" class="playMode" v-if="playMode == 2">
            <img src="../assets/random.png" class="playMode" v-if="playMode == 3">
          </i>
        </div>
      </div>
    </div>

    <div class="bottomBar" v-show="!showPlay" @click="open">
      <div class="bottomCover" :style="{'backgroundImage':'url('+ music.cover +')'}"></div>
      <div class="bottomText">
        <div class="bottomName">
          {{music.title}}
        </div>
        <div class="bottomArtist">
          {{music.artist}}
        </div>
      </div>

      <div style="font-size: 22px;color:#333" class="bottomPlay">
        <i class="fa fa-play" aria-hidden="true" v-if="!isPlay" @click.stop="setPlay"></i>
        <i class="fa fa-pause" aria-hidden="true" v-if="isPlay" @click.stop="setPlay"></i>
      </div>
      <div style="float: right;font-size: 20px;color:#333" @click.stop="showPlayList = true">
        <i class="fa fa-list-ul" aria-hidden="true"></i>
      </div>
    </div>

    <!--播放列表-->
    <mt-popup
      v-model="showPlayList"
      position="bottom">
      <h3 style="padding-left:20px">播放列表</h3>
      <div id="playListContent" ref="playListContent">
        <div>
          <div v-for="(item, index) in playList" class="aSong" @click="clickMusic(item)" :class="playId==item.id?'activeMusic':''">
            <div class="songTitle">{{item.title}}</div>
            <div class="songArtist" :class="playId==item.id?'activeMusic':''">{{item.artist}} <span style="font-weight: 600">·</span> {{item.album}}</div>
          </div>
          <div style="height: 50px;"></div>
        </div>
      </div>
    </mt-popup>

    <audio class="audio" :src="music.mp3Url" controls autoplay="autoplay"  @ended="ended" @play="start" @error="error" @timeupdate="timeupdate" hidden="true" @pause="onPause" ></audio>
  </div>

</template>

<script>
  import BScroll from 'better-scroll'
  import FileSaver from 'file-saver';
export default {
  name: 'play',
  computed:{
    showPlay(){
      return this.$store.state.showPlay;
    },
    playId(){
      return this.$store.state.playId;
    },
    playList(){
        return this.$store.state.playList;
    },
    playMode(){
        return this.$store.state.playMode;
    },
    playMusic(){
        return this.$store.getters.playMusic
    },
    music(){
        for(let i = 0; i < this.playList.length; i++){
          if(this.playList[i].id == this.playId){
            this.playIndex = i;
            break;
          }
        }
        return this.playMusic[0]
    },
    duration1(){
        if(!this.duration){
            return '0:00'
        }
        var m = Math.floor(this.duration / 60);
        var s = Math.floor(this.duration % 60);
        if(s < 10){
            s = '0' + s;
        }
        if(m > 0){
            return m + ':' + s
        }else {
            return s;
        }
    },
    currentTime1(){
      if(!this.currentTime){
        return '0:00'
      }
      var m = Math.floor(this.currentTime / 60);
      var s = Math.floor(this.currentTime % 60);
      if(s < 10){
        s = '0' + s;
      }
      if(Math.floor(this.duration / 60) > 0){
        return m + ':' + s
      }else {
        return s;
      }
    }
  },
  data () {
    return {
      audio:null,
      timer:null,
      currentTime:0,
      duration:0,
      rate:0,
      playIndex:0,
      isPlay:false,
      downloadUrl:'',
      showPlayList:false,
      scroll:null,
      lrcArr:[],
      lrcIndex:null,
      isGet:false,
      isGeting:false,
      playScroll:null,
      canBack:false,
      showLineNum:0
    }
  },
  methods:{
    play(){
      this.audio.play();
      console.log('可以播放')
    },
    close(){
        this.$store.commit('setShowPlay',false)
    },
    open(){
        this.$store.commit('setShowPlay',true);
    },
    ended(next,back){
        console.log(next,back);
        this.lrcIndex = null;
        if(this.lrcArr && this.lrcArr.length > 0){
          this.scroll.scrollTo(0, 0, 300)
        }
        if(back){
            console.log('****************0')
          if(next === true && this.playList.length == 1){
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.play();
            return;
          }
          //上一曲
          this.isPlay = false;
          if(this.playMode == 1 || this.playMode == 2){
            this.playIndex -= 1;
            if(this.playIndex < 0){
              this.playIndex = this.playList.length -1;
            }
            this.$store.commit('setPlayId',this.playList[this.playIndex].id);
          }else if(this.playMode == 3){
            if(this.playList.length > 1){
              let newIndex = Math.floor(Math.random() * this.playList.length);
              if(newIndex == this.playIndex){
                newIndex = this.index + 2;
                if(this.playIndex >= this.playList.length){
                  this.playIndex = 0;
                }
              }else {
                this.playIndex = newIndex
              }

            }
            this.$store.commit('setPlayId',this.playList[this.playIndex].id);
          }
        }else {
          if(next === true && this.playList.length == 1){
              console.log('***********************1')
              this.audio.pause();
              this.audio.currentTime = 0;
              this.audio.play();
              if(!this.music.type){
                this.updateHotCount(this.music.id)
              }
              return;
          }
          this.isPlay = false;
          if(this.playMode == 1 || (next===true && this.playMode == 2)){
              console.log('****************2');
            this.playIndex += 1;
            if(this.playIndex >= this.playList.length){
              this.playIndex = 0;
            }
            if(this.playId == this.playList[this.playIndex].id){
              if(!this.music.type){
                this.updateHotCount(this.music.id)
              }
              setTimeout(()=>{
                if(!this.isPlay && this.music.mp3Url){
                  this.audio.play()
                }
              },1000)
            }
            this.$store.commit('setPlayId',this.playList[this.playIndex].id);
            console.log(this.music)
          }else if(this.playMode == 3){
            console.log('****************3');
            if(this.playList.length > 1){
              let newIndex = Math.floor(Math.random() * this.playList.length);
              if(newIndex == this.playIndex){
                newIndex = this.index + 2;
                if(this.playIndex >= this.playList.length){
                  this.playIndex = 0;
                }
              }else {
                this.playIndex = newIndex
              }

            }
            this.$store.commit('setPlayId',this.playList[this.playIndex].id);
          }
        }

        setTimeout(()=>{
          if(this.music.mp3Url){
            this.audio.play()
          }
        })
        setTimeout(()=>{
          if(!this.isPlay && this.music.mp3Url){
            this.audio.play()
          }
        },1000)

    },
    error(){
        this.music.mp3Url = '';
        this.$toast({
          message: '无法播放此歌曲',
          position: 'bottom',
          duration: 3000
        });
    },
    start(){
//        alert('开始');
      console.log('*********'+'开始');
      this.isPlay = true;
    },
    onPause(){
      this.isPlay = false;
    },
    timeupdate(){
      this.currentTime = this.audio.currentTime;
      this.duration = this.audio.duration;
      this.rate = Math.round(this.currentTime/this.duration * 100);
      if(this.lrcArr && this.lrcArr.length>0){
        this.findLrcIndex();
      }
//      console.log(this.rate);
//      console.log(this.currentTime);
    },
    touchstart(e){
        if(e.target.className != 'mt-range-thumb'){
            return;
        }
        this.audio.pause();
    },
    touchend(e){
      if(e.target.className != 'mt-range-thumb'){
        return;
      }
//        this.audio.currentTime = this.duration * (this.rate/100);
        this.audio.play()
    },
    touchmove(e){
      if(e.target.className != 'mt-range-thumb'){
        return;
      }
      this.audio.currentTime = this.duration * (this.rate/100);
    },
    setplayMode(){
        if(this.playMode == 1){
            this.$store.commit('setPlayMode',2)
            this.$toast({
              message: '单曲循环',
              position: 'middle',
              duration: 2000
            });
        }else if(this.playMode == 2){
            this.$store.commit('setPlayMode',3);
            this.$toast({
              message: '随机播放',
              position: 'middle',
              duration: 2000
            });
        }else if(this.playMode == 3){
          this.$store.commit('setPlayMode',1);
          this.$toast({
            message: '列表循环',
            position: 'middle',
            duration: 2000
          });
        }
    },
    setPlay(){
        if(this.isPlay){
            this.audio.pause()
        }else {
            this.audio.play()
        }
    },
    download(url, name){
        // this.downloadUrl = this.music.mp3Url;
        FileSaver.saveAs(url, name)
    },
    clickMusic(item){
      if(this.playId != item.id){
        this.$store.commit('setPlayId',item.id);
      }
      this.$store.commit('setShowPlay',true);
      this.showPlayList = false;
    },
    getLrc(){
//      getLrc.php?myUrl=
      this.lrcArr = [];
      this.isGet = true;
      if(this.music.lrcUrl == 'none'){
        this.isGeting = false;
        return;
      }
      if(this.music.lrcUrl == 'toLrc'){
          this.isGeting = 'finish';
//          console.log('0000000' + this.music.lrc)
          this.music.lrc = this.music.lrc.replace(/\r\n/g,"");
          this.music.lrc = this.music.lrc.replace(/\[/g,"<br/>[");
//          console.log('1111111' + this.music.lrc)
          var geciArr = this.music.lrc.split('<br/>');
          if(geciArr.length > 0){
            let that = this;
            setTimeout(()=>{
              that.parsinglrc(geciArr);
            },200)
          }
          return;
      }
      this.isGeting = true;
      this.$.ajax({
        url:'getLrc.php?myUrl=' + this.music.lrcUrl
      }).then((res)=>{
          console.log(res);
          this.isGeting = 'finish';
          var geciArr = res.split('<br/>');
          if(geciArr.length > 0){
            this.parsinglrc(geciArr);
          }
      }).catch(err=>{
          this.isGeting = 'error';
          console.log(err);
      });
    },
    parsinglrc:function (lrc) {
      var regex=/\[|\]/g;
      var regex1=/ti/g;
      var regex2=/ar/g;
      var pattern1 = /\d{2}:\d{2}.\d{3}/g;
      var pattern = /\d{2}:\d{2}.\d{2}/g;
      var cacheLrc = [];
      // Vue.set(this.song,'lrc',cacheLrc);
      for(let a = 0; a < lrc.length; a++){
        lrc[a] = lrc[a].replace(regex,'');
        var itemArr = lrc[a].split(":");
        if(pattern1.test(lrc[a])){
          var aLrc = [];
          var time = lrc[a].match(pattern1)[0];
          aLrc[0] = Number(time.split(":")[0]) * 60 + Number(time.split(':')[1].split('.')[0]);
          aLrc[1] = lrc[a].replace(pattern1, '');
          aLrc[1] = aLrc[1].replace(/\r|\n|\\s/, '');

          cacheLrc.push(aLrc);
        }else {
          if(pattern.test(lrc[a])){
            var aLrc = [];
            var time = lrc[a].match(pattern)[0];
            aLrc[0] = Number(time.split(":")[0]) * 60 + Number(time.split(':')[1].split('.')[0]);
            aLrc[1] = lrc[a].replace(pattern, '');
            aLrc[1] = aLrc[1].replace(/\r|\n|\\s/, '');

            cacheLrc.push(aLrc);
          }
        }
      }
      this.lrcArr = cacheLrc;
      this.$forceUpdate()
      console.log(this.lrcArr);
//      setTimeout(()=>{
//        this.scroll = new BScroll(this.$refs.lrcBox,{click:true,
//          mouseWheel: true,
//          taps: true,
//          scrollY: true,
//          scrollX: false,
//        })
      this.scroll.refresh();
//      },50)

    },
    findLrcIndex(){
        var cacheIndex = 0;
        for(var i = 0; i < this.lrcArr.length; i++){
            if(i < this.lrcArr.length -1){
              if(this.currentTime >= this.lrcArr[i][0] && this.currentTime < this.lrcArr[i+1][0]){
                cacheIndex = i;
                if(cacheIndex !== this.lrcIndex && this.lrcArr[i][1] != ''){
                  this.lrcIndex = cacheIndex;
                  let avtiveLrc = document.querySelector('.activeLrc');
                  if(this.scroll){
                    this.scroll.refresh();
                    this.scroll.scrollToElement(avtiveLrc,300,0,-28 * (Math.floor(this.showLineNum / 2) - 2));
                  }
                }
                break;
              }
            }else if(this.currentTime >= this.lrcArr[i][0]){
              cacheIndex = i;
              this.lrcIndex = cacheIndex;
              console.log(this.lrcIndex);
              let avtiveLrc = document.querySelector('.activeLrc');
              if(this.scroll){
                this.scroll.scrollToElement(avtiveLrc,300,0,-28 * (Math.floor(this.showLineNum / 2) - 2));
              }
            }

        }
    },
  //  获取网易mp3链接
    getWangyi(){
      this.$.ajax({
        url:'http://liyq.club/wangyi/play/get.php?song=' + this.music.id,
        method:'GET'
      }).then((res)=>{
        console.log(res);
        if(res.url){
          this.music.mp3Url = res.url,
          this.audio.play();
          setTimeout(()=>{
            if(!this.isPlay && this.music.mp3Url){
              this.audio.play()
            }
          },1000)
        }else {
          this.$toast({
            message: '无法播放此歌曲',
            position: 'bottom',
            duration: 3000
          });
          if(this.playList.length > 0){
//              this.ended(true);
          }else {
            this.$store.commit('setPlayId',null)
          }

        }

      }).catch(err=>{
        this.$toast({
          message: '无法播放此歌曲',
          position: 'bottom',
          duration: 3000
        });
      });
    },
    //获取酷我歌词
    getKuwoLrc(){
      this.lrcArr = [];
      this.isGet = true;
      this.isGeting = true;
      this.$.ajax({
        url:'http://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId=' + this.music.id,
        method:'GET'
      }).then((res)=>{
        console.log(res);
        if(res.status == 200){
          if(res.data.songinfo && res.data.songinfo.pic){
              this.music.cover = res.data.songinfo.pic
          }
          this.isGeting = 'finish'
          console.log(res.data.lrclist);
          if(res.data.lrclist && res.data.lrclist.length > 0){
            for(var i = 0; i < res.data.lrclist.length; i++){
              this.lrcArr.push([res.data.lrclist[i].time, res.data.lrclist[i].lineLyric])
            }
          }
//          this.scroll = new BScroll(this.$refs.lrcBox,{click:true,
//            mouseWheel: true,
//            taps: true,
//            scrollY: true,
//            scrollX: false,
//          })
          this.scroll.refresh();
          console.log(this.lrcArr)
        }else {
          this.isGeting = 'error'
        }
      }).catch(err=>{
        this.isGeting = 'error'
      });
    },
    //获取qq链接
    getQQurl(){
        //token
      var url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361749&platform=yqq&cid=205361749&songmid=' + this.music.id + '&filename=C400' + this.music.id + '.m4a&guid=126548449';
      url = encodeURIComponent(url);
      this.$.ajax({
        url:'http://localhost/get/qqtoken.php?url=' + url,
        method:'GET'
      }).then((res)=>{
        console.log(res)
      })
    },
    //监听返回
    goBack(){
        if(this.showPlay){
          history.pushState(null, null, document.URL);
          this.$store.commit('setShowPlay',false);
        }else {
            if(this.canBack){
                window.history.back(-1);
            }else {
              history.pushState(null, null, document.URL);
              this.$toast({
                message: '再按一次退出',
                position: 'bottom',
                duration: 3000
              });
              this.canBack = true;
              setTimeout(()=>{
                  this.canBack = false;
              },1000)
            }
        }

    },
    updateHotCount(id) {
      var hotData = {
        musicId: id
      }

      this.$.ajax({
        method:'POST',
        url:'updateHotCount.php',
        data:this.qs(hotData)
      }).then((data)=>{
        if(data.code == 0){
          console.log('hot值更新成功')
        }else if(data.code == -2){
          console.log('hot值更新失败')
        }else if(data.code == -1){
          console.log('参数错误')
        }
      }).catch((err)=>{
        console.log('hot值更新失败',err);
      })
    }
  },
  watch:{
    showPlay(){
        var playPage = document.querySelector('.bigBox');
        var bottomBar = document.querySelector('.bottomBar');
        if(!this.showPlay){
            playPage.style.top = 'calc(100% - 50px)';
            playPage.style.height = '0';
            bottomBar.style.opacity = '1'
        }else {
            playPage.style.top = '0';
            playPage.style.height = '100%';
            bottomBar.style.opacity = '0'
            if(this.lrcArr && this.lrcArr.length > 0){
                setTimeout(()=>{
                  let avtiveLrc = document.querySelector('.activeLrc');
                  this.scroll.refresh();
                  if(this.scroll){
                    this.scroll.scrollToElement(avtiveLrc,0,0,-28 * (Math.floor(this.showLineNum / 2) - 2));
                  }
                  console.log(this.lrcIndex)
                },500)
            }
        }
    },
    playId(){
        this.isGet = false;
        this.isPlay = false;
        console.log('*********'+this.isPlay);
        if(this.music.lrcUrl && this.music.type != 'kuwo'){
          this.getLrc();
        }else if(this.music.type == 'kuwo'){
            this.getKuwoLrc();
        }
        this.lrcIndex = null;
        this.lrcArr = [];
        this.audio.currentTime = 0;
        this.audio.pause();
        if(this.music.type == 'netease' && !this.music.mp3Url){
          this.getWangyi();
        }
        if(this.music.type == 'qq'){
            this.music.mp3Url = '';
            this.getQQurl()
        }
      if(!this.music.type){
        this.updateHotCount(this.music.id)
      }
      //uc浏览器不自动播放
      setTimeout(()=>{
        if(!this.isPlay && this.music.mp3Url){
            this.audio.play()
        }
      },1000)
    },
    isPlay(){
        if(this.isPlay){
          var cover = document.querySelector('.cover');
          cover.style.animationPlayState = 'running';
        }else {
          var cover = document.querySelector('.cover');
          cover.style.animationPlayState = 'paused';
        }
    },
    playList: {
      handler(val, oldVal) {
        this.playScroll.refresh()
      },
      deep: true // 监听这个对象中的每一个属性变化
    },
    showPlayList(){
        if(this.showPlayList){
            setTimeout(()=>{
              this.playScroll.refresh()
            },200)
        }
    }
  },
  mounted(){
      this.isPlay = false;
      setTimeout(()=>{
        for(let i = 0; i < this.playList.length; i++){
          if(this.playList[i].id == this.playId){
            this.playIndex = i;
            break;
          }
        }

        let lrcBox = document.querySelector('.lrcBox');
//        alert(lrcBox.clientHeight);
        let boxHeight = lrcBox.clientHeight;
        if(boxHeight > 28){
            boxHeight = boxHeight - (boxHeight % 28);
            lrcBox.style.height = boxHeight + 'px'
        }
        console.log(boxHeight, (boxHeight / 28));
        this.showLineNum = boxHeight / 28;
        if(this.showLineNum){
            localStorage.setItem('lineNum',this.showLineNum)
        }else {
            this.showLineNum = Number(localStorage.getItem('lineNum'))
        }
        this.scroll = new BScroll(this.$refs.lrcBox,{click:true,
          mouseWheel: true,
          taps: true,
          scrollY: true,
          scrollX: false,
        })

      });

      this.audio = document.querySelector('.audio');
//      alert.log(this.audio);
      if(!this.isGet && !!this.music.lrcUrl && this.music.type != 'kuwo'){
          this.getLrc();
      }else if(!this.isGet && this.music.type == 'kuwo'){
          this.getKuwoLrc();
      }
      console.log(this.music)
      if(this.music.type == 'netease' && !this.music.mp3Url){
        this.getWangyi();
      }
//      alert('1111111')
      this.playScroll = new BScroll(this.$refs.playListContent,{click:true,
        mouseWheel: true,
        taps: true,
        scrollY: true,
        scrollX: false,
      });
//    alert('22222222222')
      if(!this.music.type){
        this.updateHotCount(this.music.id)
      }
    //uc浏览器不自动播放
    setTimeout(()=>{
      if(!this.isPlay && this.music.mp3Url){
        this.audio.play()
      }
    },1000)

      //监听返回
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
  },
  destroyed(){
    window.removeEventListener('popstate', this.goBack, false);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .bigBox{
    width: 100%;
    height: 100%;
    position: fixed;
    top:0;
    transition: top 0.3s
  }
  .background{
    width: 100%;
    height: 100%;
    background-color: rgb(78, 81, 74);
    position: absolute;
    top:0;
    max-width: 900px;
    z-index: 1;
    background-size: 200%;
    -webkit-filter: blur(4px) contrast(40%) saturate(800%) sepia(100%);  /* Chrome, Safari, Opera */
    filter: blur(4px) contrast(40%) saturate(800%) sepia(100%);
    opacity: 1;
  }
  .hide_back{
    opacity: 0;
  }
  .hide_back1{
    background-color: #fff;
  }
  .hello{
    width: 100%;
    height: 100%;
    background-color: rgba(58, 61, 54,0.8);
    position: absolute;
    top:0;
    max-width: 900px;
    color:#fff;
    z-index: 2;
  }
  .bottomBar{
    position: absolute;
    top:0;
    height: 51px;
    background-color: #efefef;
    width: 100%;
    z-index: 3;
    display: flex;
    align-items: center;
    transition: opacity 0.35s;
    max-width: 900px;
  }
  .close{
    font-size: 26px;
    position: absolute;
    top:12px;
    left: 18px;
    z-index: 2;
  }
  .cover{
    width: 180px;
    height: 180px;
    background-size: cover;
    margin: 18px auto;
    /*box-shadow: -5px 5px 26px 5px #999;*/
    /*position: relative;*/
    animation: rotate 9.5s linear 0s infinite;
    border-radius: 50%;
    border:5px solid #3F3D3E;
  }
  .name {
    /*margin-top: 18px;*/
    font-size: 18px;
    height: 24px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 75%;
    margin: 18px auto 0;
  }
  .artist {
    font-size: 14px;
    margin-top: 8px;
    height: 19px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .lrcBox{
    height: calc(100% - 420px);
    margin-bottom: 20px;
    overflow: hidden;
    font-size:0;
  }
  .rateBar{
    width: 90%;
    margin:0 auto;
  }

  .playMode{
    width: 24px;
  }
  .controlBar{
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 80px;
    color: #e6e6e6;
  }
  .big-icon{
    font-size: 34px;
    display: inline-block;
    width: 35px;
  }
  .bottomCover{
    width: 35px;
    height: 35px;
    background-size: cover;
    border-radius: 50%;
    margin-left:8px;
    color:#333;
    margin-right: 12px;
  }
  .bottomCover>div{
    display: inline-block;
  }
  .bottomName{
    font-size: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .bottomArtist{
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .bottomText{
    color: #333;
    display: inline-block;
    max-width: 50%;
  }
  .bottomPlay{
    position: absolute;
    right: 60px;
  }
  .bottomPlay+div{
    position: absolute;
    right: 20px;
  }
  #playListContent{
    width: 100%;
    max-height: 70vh;
    min-height: 300px;
    overflow: hidden;
  }
  .mint-popup-bottom{
    width: 100%!important;
    max-width: 900px;
  }
  .lrcItem{
    text-align: center;
    line-height: 28px;
    max-width: 90%;
    margin:0 auto;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #999;
    font-size: 14px;
  }
  .activeLrc{
    color: #efefef;
  }


  /*封面动画*/
  @-webkit-keyframes rotate{
    from{-webkit-transform:rotate(0deg)}
   	to{-webkit-transform:rotate(360deg)}
   	}
  @-moz-keyframes rotate{
   	from{-moz-transform:rotate(0deg)}
   	to{-moz-transform:rotate(360deg)}
   	}
  @-ms-keyframes rotate{
   	from{-ms-transform:rotate(0deg)}
    to{-ms-transform:rotate(360deg)}
    	}
  @-o-keyframes rotate{
   	from{-o-transform:rotate(0deg)}
   	to{-o-transform:rotate(360deg)}
   	}
</style>
