<template>
  <div id="app">
    <div id="inputWrap">
      <input type="search" id="searchInput" placeholder="搜单曲、搜歌手、搜专辑" v-model="searchValue" @input="inputFun" @keyup.enter="search" ref="search">
      <span class="sourceName" @click="showSourceList = true">{{source.name}}</span>
    </div>

    <mt-navbar v-model="searchType" v-show="searchFinish && sourceId == 1">
      <mt-tab-item id="1">单曲</mt-tab-item>
      <mt-tab-item id="2">歌手</mt-tab-item>
      <mt-tab-item id="3">专辑</mt-tab-item>
    </mt-navbar>
    <div id="listBox" ref="listBox">
      <div id="listContent">
        <div >
          <div v-for="(item, index) in searchList" class="aSong" @click="playMusic(item)" :class="playId==item.id?'activeMusic':''" v-show="item.mp3Url">
            <div class="songTitle">{{item.title}}</div>
            <div class="songArtist" :class="playId==item.id?'activeMusic':''">{{item.artist}} <span style="font-weight: 600" v-if="item.album">·</span><span v-if="item.album"> {{item.album}}</span></div>
          </div>
          <div class="moreButton" v-show="searchList && searchList.length > 0" @click="getMore(page)">
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
      position="bottom" style="width: 100%">
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
        moreLoading:false
      }
  },
  methods:{
    inputFun(){
        this.searchFinish = false;
        this.searchList = []
    },
    search(){
        this.$refs.search.blur();
        this.searchFinish = false;
        if(!this.searchValue){
          this.$toast({
            message: '搜索内容不能为空',
            position: 'bottom',
            duration: 3000
          });
        }else {
          this.isLoading = true;
          this.searchList = [];
          if(this.sourceId == 1){
            this.$.ajax({
              method:'GET',
              url:'getMusicList.php?keyword=' + this.searchValue + '&type=' + this.searchType,
            }).then((res)=>{
              this.searchFinish = true;
              console.log(res);
              this.searchList = res;
              this.isLoading = false;
              setTimeout(()=>{
                this.scroll.refresh()
              })
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
              this.searchFinish = true;
              this.isLoading = false;
              if(res.code == 200){
                this.buildList(res.data);
                setTimeout(()=>{
                  this.scroll.refresh()
                })
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
        this.page = page + 1;
        this.searchFinish = true;
        this.moreLoading = false;
        if(res.code == 200){
          this.buildList(res.data, true);
          setTimeout(()=>{
            this.scroll.refresh()
          })
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
    }
  }
}
</script>

<style>
  body,html{
    padding: 0;
    margin:0;
    height: 100%;
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
}
  #searchInput{
    width: calc(100% - 80px);
    padding: 5px 8px;
    outline: none;
  }
  #inputWrap{
    width: 90%;
    margin:20px 5% 3px;
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
  .songtitle{
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .aSong{
    width: 90%;
    margin: 0 auto;
    text-align: left;
    border-bottom: 1px solid #999;
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
</style>
