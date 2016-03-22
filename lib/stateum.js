'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  return new Promise(function (resolve) {
    return resolve(obj);
  });
}

exports["default"] = function (sm) {
  if (!sm.getState || typeof sm.getState !== 'function') {
    throw new Error('Stateum requires "getState" function to be initialized');
  }
  if (!sm.states || !Object.keys(sm.states).length) {
    throw new Error('Stateum requires "states", otherwise whats the point right?');
  }

  var stateMachine = sm;
  return function (obj) {
    if (!obj || obj.constructor !== Object) {
      throw new Error('Object passed in does not exist or is not an object');
    }

    obj.getState = function () {
      if (!stateMachine.getState) {
        throw new Error('State Machine getState not implemented');
      }
      return toPromise(stateMachine.getState.apply(this));
    };
    obj.transitionStates = function () {
      var _this = this;

      return obj.getState.apply(this).then(function (state) {
        if (!stateMachine.states[state]) {
          throw new Error('State "' + state + '" not implemented');
        }
        var ret = { state: state };
        if (stateMachine.states[state].transitionStates) {
          return toPromise(stateMachine.states[state].transitionStates.apply(_lodash2["default"].extend(_this, { STATEUM: stateMachine.states[state] }))).then(function (transitionStates) {
            ret.transitionStates = transitionStates;
            return ret;
          }).then(function (resp) {
            delete resp.STATEUM;
            return resp;
          });
        } else {
          if (stateMachine.states[state].transitions) {
            ret.transitionStates = Object.keys(stateMachine.states[state].transitions);
          } else {
            ret.transitionStates = [];
          }
          return ret;
        }
      });
    };
    obj.transitionTo = function (to) {
      var _this2 = this;

      return obj.transitionStates.apply(this).then(function (ret) {
        var allow = false;
        if (stateMachine.allowTransition) {
          allow = stateMachine.allowTransition(to, ret.transitionStates);
        } else {
          allow = !! ~ret.transitionStates.indexOf(to);
        }

        if (!allow) {
          return obj.getState().then(function (state) {
            throw new Error('Transition "' + to + '" not permitted in current state "' + state + '"');
          });
        }

        return toPromise(stateMachine.states[ret.state].transitions[to].apply(_lodash2["default"].extend(_this2, { STATEUM: stateMachine.states[ret.state] }))).then(function (resp) {
          delete resp.STATEUM;
          return resp;
        });
      });
    };
    obj.states = function () {
      if (!stateMachine.states) {
        throw new Error('Failed to find states');
      }
      return toPromise(Object.keys(stateMachine.states));
    };
  };
};