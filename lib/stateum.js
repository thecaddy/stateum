import _ from 'lodash';

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

function isObject(val) {
  return Object == val.constructor;
}

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });
}

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return new Promise(resolve => resolve(obj));
}

export default sm => {
  if (!sm.getState || typeof sm.getState !== 'function') {
    throw new Error('Stateum requires "getState" function to be initialized')
  }
  if (!sm.states || !Object.keys(sm.states).length) {
    throw new Error('Stateum requires "states", otherwise whats the point right?')
  }

  let stateMachine = sm;
  return obj => {
    if (!obj
      || obj.constructor !== Object) {
      throw new Error('Object passed in does not exist or is not an object')
    }

    obj.getState = function() {
      if(!stateMachine.getState){
        throw new Error(`State Machine getState not implemented`);
      }
      return toPromise(stateMachine.getState.apply(this));
    };
    obj.transitionStates = function() {
      // console.log('here',this)
      return obj.getState.apply(this)
      .then(state => {
        if(!stateMachine.states[state]) {
          throw new Error(`State "${state}" not implemented`);
        }
        let ret = { state: state }
        if(stateMachine.states[state].transitionStates) {
          return toPromise(stateMachine.states[state].transitionStates.apply(_.extend(this, { STATE_MACHINE: stateMachine.states[state] })))
          .then(transitionStates => {
            ret.transitionStates = transitionStates;
            return ret;
          }).then(resp => {
            delete resp.STATE_MACHINE;
            return resp;
          });
        }else{
          if(stateMachine.states[state].transitions) {
            ret.transitionStates = Object.keys(stateMachine.states[state].transitions);
          }else{
            ret.transitionStates = [];
          }
          return ret;
        }
      });
    };
    obj.transitionTo = function(to) {
      return obj.transitionStates.apply(this)
      .then(ret => {
        if(!~ret.transitionStates.indexOf(to)){
          return obj.getState().then(state => {
            throw new Error(`Transition "${to}" not permitted in current state "${state}"`);
          });
        }
        return toPromise(stateMachine.states[ret.state].transitions[to].apply(_.extend(this, { STATE_MACHINE: stateMachine.states[ret.state] })))
        .then(resp => {
          delete resp.STATE_MACHINE;
          return resp;
        });
      });
    };
    obj.states = function() {
      if(!stateMachine.states){
        throw new Error('Failed to find states')
      }
      return toPromise(Object.keys(stateMachine.states));
    };
  };
};