/**
 * Created by administrator on 2019/4/24.
 */
const getters = {
  playMusic(state){
    console.log(state);
    return state.playList.filter(music=>music.id==state.playId)
  },

}

export default getters
