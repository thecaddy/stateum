# Stateum 

[![Circle CI](https://circleci.com/gh/thecaddy/stateum.svg?style=svg)](https://circleci.com/gh/thecaddy/stateum)

An attachable state machine for your javascript objects, made necessary by the need to make sense of complex business logic.

## Installation
```
$  npm install stateum
```

Stateum is supported in node v4+.

## Table of Contents

- [Use Cases](#use-cases)
- [Basic Usage](#basic-usage)
- [Setting up a Basic State Machine](#setting-up-a-basic-state-machine)
- [Advanced Stateum usage, but not too advanced](#advanced-stateum-usage-but-not-too-advanced)
- [Connecting Stateum to Sequelize models](#connecting-stateum-to-sequelize-models)

## Use Cases
- Turning on and off a light switch, e.g. ON, OFF, FAILED
- User payment states, e.g. UNPAID, PAID, CANCELLED, PENDING
- Data processing, e.g. PENDING, PROCESSING, COMPLETE, FAILED, CANCELLED
- Email, e.g. PENDING, SENDING, SENT, FAILED, CANCELLED

## Basic Usage

```
import stateum from 'stateum'

const myMachine = {
  getState() {...},
  states: {
    DUMMYSTATE1: {
      transitions: {...}
    },
    ...
  }
}
const obj = {
    state: 'PAUSE'
}
const stateMachine = stateum(myMachine)

stateMachine(obj)
```
Four methods are  now attached to your object allowing you to interact with the state machine.

Get current state:
`obj.getState()`

List all states in machine:
`obj.states()`

List available states to transition to:
`obj.transitionState()`

Transition to one of the available states:
`obj.transitionTo()`


## Setting up a Basic State Machine

The state machine object defines the way you can interact with the states of your object.  Two pieces are needed for a basic functioning
machine, defining `getState` and the `states` with their available `transitions`.

In this case this state machine expects a value of `state` on the object to tell us the state of this object.  It probably looks something like:
```
const obj = {
  state: 'PAUSE'
}
```

Next we need to define the available states and the transitions of those states, in the case of our example we have three available states which we can retrieve
by calling `obj.getStates()`.  This would return to us `['PAUSE', 'START', STOP]`.

Since in our exmaple we arein the `PAUSE` state I want to list out the available
states to transition to and my current state should I can make a logical decision on transitioning.  `obj.transitionStates()` returns:
```
{
  state: 'PAUSE',
  transitionStates: [ 'START', 'STOP' ] }
}
```

Finally if I want to request a transition to another state `obj.transitionTo('START')` will return me the transitioned object with all completed business logic.


```
export default {

  // Defines how to retrieve the state of your object, context this is of the object.
  getState(){
    if(!this.state){
      throw new Error('Failed to find state');
    }
    return this.state;
  },

  // Define available states
  states: {
    PAUSE: {

      // define available transitions for this state
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

## Advanced Stateum usage, but not too advanced

Stateum is not isolated to synchronous calls and returns everything as a promise allowing us to make for complex state transitions.

Two available methods are `allowTransition(to, transitionState)` which allows for us to change the complexity of what states are available to be
transitioned to.  `allowTransition` will be passed the returned object from the `transitionStates()` method nested in each state (more on this method later)
and the state being requested in the `transitionTo(to)`.

In the exmaple below assuming we are in the 'PAUSE' state:
```
const obj = {
  state: 'PAUSE'
}
const transitionStates = await obj.transitionStates()
// returns:
// {
//  state: 'PAUSE',
//  transitionState: {
//    START: true,
//    STOP: false
//  }
// }
```

Requesting `obj.transitionTo('START')` will evaluate in the `allowTransition` method to valid and transition to start.  Because we see 'STOP' evaluated to 'false',
requesting `obj.transitionTo('STOP')` will throw an exception that the transition is not valid.

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

## Connecting Stateum to Sequelize models

Attaching Stateum to the instance methods will make the statemachine available on all instances of your model and sequelize available within your state machine.

```
import stateum from 'stateum'

const myMachine = {
  getState() {...},
  states: {
    DUMMYSTATE1: {
      transitions: {...}
    },
    ...
  }
}

export default (sequelize, DataTypes) => {
  const definition = {
    id: type: DataTypes.INTEGER,
    ...
  }
  const options = {
    instanceMethods: {...}
  }

  const myModelMachine = stateum(myMachine)
  myModelMachine(options.instanceMethods)

  return sequelize.define('myModel', definition, options);
};

```

