# Stateum [![Circle CI](https://circleci.com/gh/thecaddy/stateum.svg?style=svg)](https://circleci.com/gh/thecaddy/stateum)
An attachable state machine for your javascript objects.

## Installation
```
$ npm install stateum
```

Stateum is supported in node v4+.

## Basic Usage

```
import stateum from 'stateum'
import myMachine from './myMachine'

const obj = {
    state: 'PAUSE'
}
const stateMachine = stateum(myMachine)

stateMachine(obj)

/*
Attached methods:

Get current state:
obj.getState()

List all states in machine:
obj.states()

List available states to transition to:
obj.transitionState()

Transition to one of the available states:
obj.transitionTo()
*/
```

## Basic State Machine

```
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
          this.state = 'STOP'
          return this
        }
      }
    },
    START: {
      transitions: {
        START() {
          return this
        },
        PAUSE() {
          this.state = 'PAUSE'
          return this
        },
        STOP() {
          this.state = 'STOP'
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
```

## Advanced State Machine

```
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
```

