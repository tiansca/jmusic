<template>
  <div id="app">
    <div id="inputWrap">
      <input type="search" id="searchInput" placeholder="输入后按下回车搜索" v-model="searchValue" @input="inputFun" @keyup.enter="search" ref="search">
      <span class="sourceName" @click="showSourceList = true">{{source.name}}</span>
    </div>

    <mt-navbar v-model="searchType" v-show="searchFinish && sourceId == 1">
      <mt-tab-item id="1">单曲</mt-tab-item>
      <mt-tab-item id="2">歌手</mt-tab-item>
      <mt-tab-item id="3">专辑</mt-tab-item>
    </mt-navbar>
    <div id="listBox" ref="listBox">
      <div id="listContent">
        <div id="topLoading" v-if="topLoading" ref="topLoading">
          <div v-if="triggerRefresh && isTopLoading1 == false" ref="trigger" id="trigger">{{topLoadingText}}</div>
          <mt-spinner type="fading-circle" class="moreLoading" color="#666" :size="20" v-show="isTopLoading"></mt-spinner>
        </div>

        <div >
          <div v-for="(item, index) in searchList" class="aSong" @click="playMusic(item)" :class="playId==item.id?'activeMusic':''">
            <div class="songTitle">{{item.title}}</div>
            <div class="songArtist" :class="playId==item.id?'activeMusic':''">{{item.artist}} <span style="font-weight: 600" v-if="item.album">·</span><span v-if="item.album"> {{item.album}}</span></div>
          </div>
          <div class="moreButton" v-show="searchList && searchList.length > 0 && sourceId != 1" @click="getMore(page)">
            <span v-show="!moreLoading">加载更多</span>
            <mt-spinner type="fading-circle" class="moreLoading" color="#666" :size="20" v-show="moreLoading"></mt-spinner>
          </div>
        </div>
        <div style="height: 60px"></div>
        <div style="font-size: 14px;color: rgb(153, 153, 153);text-align: center" v-show="searchFinish && searchList && searchList.length == 0">
          <span>搜索结果为空</span>
        </div>
      </div>
    </div>
    <div v-if="playId">
      <play id="playPage"></play>
    </div>

    <mt-spinner type="fading-circle" class="loading" color="#26a2ff" :size="50" v-show="isLoading"></mt-spinner>

    <!--选择搜索来源-->
    <mt-popup
      v-model="showSourceList"
      position="bottom" style="width: 100%;padding-top: 12px;">
      <mt-picker :slots="slots" @change="onValuesChange" value-key="name" :defaultIndex="pickerId"></mt-picker>
      <div style="text-align: center;margin: 18px 0;">
        <span class="button" @click="showSourceList = false">确定</span>
      </div>
    </mt-popup>


  </div>
</template>

<script>
  import play from './components/play.vue';
  import BScroll from 'better-scroll'
export default {
  name: 'App',
  components:{
      play
  },
  computed:{
    playId(){
        return this.$store.state.playId;
    },
    sourceId(){
        return this.$store.state.sourceId;
    },
    sourceArr(){
        return this.$store.state.sourceArr;
    },
    source(){
        return this.$store.getters.source[0];
    }
  },
  data(){
      return{
        searchType:'1',
        searchValue:'',
        searchFinish:false,
        searchList:[],
        scroll:null,
        isLoading:false,
        slots:[],
        showSourceList:false,
        pickerId:1,
        page:1,
        moreLoading:false,
        triggerRefresh: false,
        topLoading:false,
        isTopLoading:false,
        isTopLoading1:false,
        topLoadingText:''
      }
  },
  methods:{
    inputFun(){
        this.searchFinish = false;
        this.searchList = [];
        this.page = 1;
    },
    search(type){
        this.page = 1;
        this.$refs.search.blur();
        this.searchFinish = false;
        if(!this.searchValue){
          this.$toast({
            message: '搜索内容不能为空',
            position: 'bottom',
            duration: 3000
          });
        }else {
          if(type !== 'refresh'){
            this.isLoading = true;
            this.searchList = [];
          }
          if(this.sourceId == 1){
            this.$.ajax({
              method:'GET',
              url:'getMusicList.php?keyword=' + this.searchValue + '&type=' + this.searchType,
            }).then((res)=>{
              this.searchFinish = true;
              this.isTopLoading = false;
              console.log(res);
              this.searchList = res;
              this.isLoading = false;
              setTimeout(()=>{
                this.scroll.refresh()
              });
              this.scroll.finishPullDown()
            }).catch((err)=>{
              this.searchFinish = true;
              this.isTopLoading = false;
              this.isLoading = false;
              console.log(err);
              this.scroll.finishPullDown()
              this.$toast({
                message: '搜索失败，请重试',
                position: 'bottom',
                duration: 3000
              });
            })
          }else{
            this.$.ajax({
              url:'http://liyq.club/music/search.php',
              method:'POST',
              data:this.qs({
                input: this.searchValue,
                filter: 'name',
                type: this.source.label,
                page: this.page
              })
            }).then((res)=>{
              console.log(res);
              this.scroll.finishPullDown();
              this.isTopLoading = false;
              this.searchFinish = true;
              this.isLoading = false;
              if(res.code == 200){
                this.buildList(res.data);
                setTimeout(()=>{
                  this.scroll.refresh()
                })
              }else if(res.code == 404){
                this.searchFinish = true;
                this.isLoading = false;
              }else {
                this.searchFinish = true;
                this.isLoading = false;
                this.$toast({
                  message: '搜索失败，请重试',
                  position: 'bottom',
                  duration: 3000
                });
              }
            }).catch(err=>{
                this.scroll.finishPullDown();
                this.isTopLoading = false;
                this.searchFinish = true;
                this.isLoading = false;
                console.log(err);
                this.$toast({
                  message: '搜索失败，请重试',
                  position: 'bottom',
                  duration: 3000
                });
            });
          }

        }
    },
    playMusic(item){
      this.$refs.search.blur();
      if(this.playId != item.id){
        this.$store.commit('setPlayId',item.id);
        this.$store.commit('setPlayList',this.searchList);
      }
      this.$store.commit('setShowPlay',true);
    },
    onValuesChange(a,b){
        if(b && b.length > 0){
          this.pickerId = b[0].id
        }
    },
    buildList(list,isMore){
        for(var i = 0; i < list.length; i++){
          list[i].artist= list[i].author;
          list[i].album = null;
          list[i].mp3Url = list[i].url
          list[i].cover = list[i].pic

          if(list[i].lrc){
            list[i].lrcUrl = 'toLrc'
          }else {
            list[i].lrcUrl = 'none'
          }

          list[i].id = list[i].songid
        }
        if(isMore){
            this.searchList = this.searchList.concat(list)
        }else {
            this.searchList = list;
        }
    },
    getMore(page){
      this.moreLoading = true;
      this.$.ajax({
        url:'http://liyq.club/music/search.php',
        method:'POST',
        data:this.qs({
          input: this.searchValue,
          filter: 'name',
          type: this.source.label,
          page: page + 1
        })
      }).then((res)=>{
//        console.log(res);
        this.scroll.finishPullUp()
        this.page = page + 1;
        this.searchFinish = true;
        this.moreLoading = false;
        if(res.code == 200){
          this.buildList(res.data, true);
          setTimeout(()=>{
            this.scroll.refresh()
          })
        }else if(res.code == 404){
          this.$toast({
            message: '没有更多',
            position: 'bottom',
            duration: 3000
          });
        }else {
          this.searchFinish = true;
          this.moreLoading = false;
          this.$toast({
            message: '搜索失败，请重试',
            position: 'bottom',
            duration: 3000
          });
        }
      }).catch(err=>{
        this.scroll.finishPullUp()
        this.searchFinish = true;
        this.moreLoading = false;
        console.log(err);
        this.$toast({
          message: '搜索失败，请重试',
          position: 'bottom',
          duration: 3000
        });
      });
    }
  },
  mounted(){
    this.scroll = new BScroll(this.$refs.listBox,{click:true,
      mouseWheel: true,
      taps: true,
      scrollY: true,
      scrollX: false,
      pullUpLoad: {
        threshold: -30
      },
      pullDownRefresh: {
// 下拉距离超过30px触发pullingDown事件
        threshold: 30,
// 回弹停留在距离顶部20px的位置
        stop: 20
      }
    });

    //上拉加载
    this.scroll.on('pullingUp', () => {
      console.log('处理上拉加载操作');
      if(this.sourceId != 1 && this.searchValue){
        this.getMore(this.page);
      }
      /*setTimeout(() => {
// 事情做完，需要调用此方法告诉 better-scroll 数据已加载，否则上拉事件只会执行一次
        this.scroll.finishPullUp()
      }, 2000)*/
    });

    //下拉刷新
    this.scroll.on('pullingDown', () => {
      console.log('处理下拉刷新操作');
      this.isTopLoading = true;
//      setTimeout(() => {
//        console.log('asfsaf')
//// 事情做完，需要调用此方法告诉 better-scroll 数据已加载，否则下拉事件只会执行一次
//        this.scroll.finishPullDown()
//      }, 2000)
      this.search('refresh');
    })

    //监听滚动
    this.scroll.on('scroll',(pos)=>{
        if(!this.searchValue){
            return;
        }
        if(pos.y > 0){
          this.topLoading = true;
          if(this.$refs.topLoading){
            this.$refs.topLoading.style.height = pos.y + 'px'
            this.$refs.topLoading.style.top = - pos.y + 'px';
          }
          this.triggerRefresh = true;
          if(this.$refs.trigger){
            if(pos.y > 30){
              this.topLoadingText = '释放立即刷新'
            }else if(pos.y > 14){
              this.topLoadingText = '下拉刷新'
            }else {
              this.topLoadingText = ''
            }
          }

        }else {
            this.topLoadingText = ''
            if(this.$refs.topLoading){
              this.$refs.topLoading.style.height = '0px'
              this.$refs.topLoading.style.top = '0px';
              this.topLoading = false;
            }
        }
//        this.$refs.trigger.style.height = -(pos.y - 14) / 2 + 'px'
//
    });

    this.slots = [
      {
        flex: 1,
        values: this.sourceArr,
        className: 'slot1',
        textAlign: 'center',
        defaultIndex:this.sourceId - 1
      }
    ]


//    测试

  },
  watch:{
    searchType(){
        if(this.searchValue){
            this.search();
        }
    },
    showSourceList(){
        this.$store.commit('setSourceId',this.pickerId)
    },
    sourceId(n, o){
        if(this.searchValue){
            this.search();
        }
        let listBox = document.querySelector('#listBox')
        if(this.sourceId == 1){
          listBox.style.height = 'calc(100% - 120px)'
        }else {
          listBox.style.height = 'calc(100% - 75px)'
        }
    },
    isTopLoading(){
        if(this.isTopLoading){
            this.isTopLoading1 = true
        }else {
            setTimeout(()=>{
              this.isTopLoading1 = false
            },500)
        }
    }
  }
}
</script>

<style>
  body,html{
    padding: 0;
    margin:0;
    height: 100%;
    overflow: hidden;
  }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 900px;
  margin:0 auto;
  width: 100%;
  height: calc(100% - 1px);
  padding-top:1px;
  overflow: hidden;
}
  #searchInput{
    width: calc(100% - 80px);
    padding: 5px 8px;
    outline: none;
    margin-top: 1px;
  }
  #inputWrap{
    width: 90%;
    margin:20px 5% 3px;
    padding-top: 1px;
  }
  #listBox{
    margin-top: 20px;
    height: calc(100% - 120px);
    overflow: hidden;
  }
  .songArtist{
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .songTitle{
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width:100%;
  }
  .aSong{
    width: 90%;
    margin: 0 auto;
    text-align: left;
    border-bottom: 1px solid #eee;
    padding: 8px 0;
    cursor: pointer;
  }
  .loading{
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 50px;
    height: 50px;
  }
  #playPage{
    /*transition: all 0.3s;*/
    position: absolute;
    z-index: 2;
  }
  .activeMusic{
    color:#26a2ff;
  }
  .mt-range-thumb{
    width: 24px!important;
    height: 24px!important;
    top:3px;
  }
  .sourceName{
    font-size: 14px;
    /*border: 1px solid ;*/
    display:  inline-block;
    width: 60px;
    text-align: center;
    /*background-color: #26a2ff;*/
    background-color: #5eb95e;
    border-radius: 12px;
    padding:0 6px;
    height: 30px;
    line-height: 30px;
    color: #efefef;
    float: right;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .button{
    padding:5px 28px;
    color: rgb(13, 135, 148);
  }
  .button:active{
    background-color: #efefef;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border-radius: 6px;
  }
  .moreButton{
    text-align: center;
    margin-top:18px;
  }
  .moreButton>span{
    color: #666;
    font-size: 14px;
    padding:5px 8px;
  }
  .moreLoading{
    display: block;
    width: 20px;
    text-align: center;
    margin: 0 auto;
  }
  #topLoading{
    width: 100%;
    text-align: center;
    position: absolute;
    /*top:-30px;*/
    font-size: 13px;
    /*background-color: #efefef;*/
    display: flex;
    justify-content: center;
    align-items: center;
    color:#666
  }
  #trigger{
    width: 100%;

  }
</style>
