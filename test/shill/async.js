export default {
  getState() {
    return new Promise((res, rej) => {
      if(!this.state){
       rej(new Error('Failed to find state'))
      }
      res(this.state)
    })
  },
  states: {
    PAUSE: null,
    START: null,
    STOP: null
  }
}