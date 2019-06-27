<template>
  <div id="app">
    <div id="inputWrap">
      <input type="search" id="searchInput" placeholder="搜单曲、搜歌手、搜专辑" v-model="searchValue" @input="inputFun" @keyup.enter="search" ref="search">
    </div>
    <mt-navbar v-model="searchType" v-show="searchFinish">
      <mt-tab-item id="1">单曲</mt-tab-item>
      <mt-tab-item id="2">歌手</mt-tab-item>
      <mt-tab-item id="3">专辑</mt-tab-item>
    </mt-navbar>
    <div id="listBox" ref="listBox">
      <div id="listContent">
        <div >
          <div v-for="(item, index) in searchList" class="aSong" @click="playMusic(item)" :class="playId==item.id?'activeMusic':''">
            <div class="songTitle">{{item.title}}</div>
            <div class="songArtist" :class="playId==item.id?'activeMusic':''">{{item.artist}} <span style="font-weight: 600">·</span> {{item.album}}</div>
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
    }
  },
  data(){
      return{
        searchType:'1',
        searchValue:'',
        searchFinish:false,
        searchList:[],
        scroll:null,
        isLoading:false
      }
  },
  methods:{
    inputFun(){
        this.searchFinish = false;
        this.searchList = []
    },
    search(){
        this.$refs.search.blur();
        if(!this.searchValue){
          this.$toast({
            message: '搜索内容不能为空',
            position: 'bottom',
            duration: 3000
          });
        }else {
          this.isLoading = true;
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
        }
    },
    playMusic(item){
      this.$refs.search.blur();
      if(this.playId != item.id){
        this.$store.commit('setPlayId',item.id);
        this.$store.commit('setPlayList',this.searchList);
      }
      this.$store.commit('setShowPlay',true);
    }
  },
  mounted(){
    this.scroll = new BScroll(this.$refs.listBox,{click:true,
      mouseWheel: true,
      taps: true,
      scrollY: true,
      scrollX: false,
    })
  },
  watch:{
    searchType(){
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
    width: 100%;
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
</style>
