export default {
  getState() {
    return new Promise((res, rej) => {
      if(!this.state){
       rej(new Error('Failed to find state'))
      }
      res(this.state)
    })
  },
  allowTransition(to, transitionStates) {
    return transitionStates[to]
  },
  states: {
    PAUSE: {
      allowTransitionSTART(){
        return true;
      },
      allowTransitionSTOP(){
        return false;
      },
      transitionStates() {
        return {
          START: this.STATEUM.allowTransitionSTART(),
          STOP: this.STATEUM.allowTransitionSTOP() 
        };
      },
      transitions: {
        START() {
          if(!this.STATEUM.allowTransitionSTART()){
            throw new Error('Transition START not permitted');
          }
          return new Promise((res, rej) => {
            this.state = 'START'
            res(this) 
          })
        },
        STOP() {
          if(!this.STATEUM.allowTransitionSTOP()){
            throw new Error('Transition STOP not permitted');
          }
          return new Promise((res, rej) => {
            this.state = 'STOP'
            res(this) 
          })
        }
      }
    },
    START: {
      transitionStates() {
        return {
          START: true,
          STOP: true,
          PAUSE: true 
        };
      },
      transitions: {
        START() {
          return this
        },
        PAUSE() {
          return new Promise((res, rej) => {
            this.state = 'PAUSE'
            res(this) 
          })
        },
        STOP() {
          return new Promise((res, rej) => {
            this.state = 'STOP'
            res(this) 
          })
        }
      }
    },
    STOP: {
      transitionStates() {
        return {
          START: true,
          STOP: false,
          PAUSE: false 
        };
      },
      transitions: {
        START() {
          return new Promise((res, rej) => {
            this.state = 'START'
            res(this) 
          })
        }
      }
    }
  }
}