export default {
  getState(){
    if(!this.state){
      throw new Error('Failed to find state');
    }
    return this.state;
  },
  states: {
    PAUSE: {
      transitions: {
        START() {
          this.state = 'START'
          return this
        },
        STOP() {
          this.state = 'PAUSE'
          return this
        }
      }
    },
    START: {
      transitions: {
        PAUSE() {
          this.state = 'PAUSE'
          return this
        },
        STOP() {
          this.state = 'PAUSE'
          return this
        }
      }
    },
    STOP: {
      transitions: {
        START() {
          this.state = 'START'
          return this
        }
      }
    }
  }
}