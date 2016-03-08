export default {
  getState(){
    if(!this.state){
      throw new Error('Failed to find state');
    }
    return this.state;
  },
  states: {
    PAUSE: null,
    START: null,
    STOP: null
  }
}