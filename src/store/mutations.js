/**
 * Created by administrator on 2019/4/23.
 */
const mutations = {
  setPlayList(state, n){
    state.playList = n;
  },
  setPlayId(state, n){
    state.playId = n
  },
  setShowPlay(state, n){
    state.showPlay = n;
  },
  setPlayMode(state, n){
    state.playMode = n
  },
  setSourceId(state, n){
    state.sourceId = n
  }

}

export default mutations
