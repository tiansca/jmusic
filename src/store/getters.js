/**
 * Created by administrator on 2019/4/24.
 */
const getters = {
  playMusic(state){
    console.log(state);
    return state.playList.filter(music=>music.id==state.playId)
  },
  source(state){
    return state.sourceArr.filter(source=>source.id == state.sourceId)
  }
}

export default getters
