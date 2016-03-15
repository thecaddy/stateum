import test from 'ava'
import stateum from '../'
import syncSM from './shill/sync'
import asyncSM from './shill/async'

test('fail for invalid state machine, no state machine', t => {
  try{
    const stateMachine = stateum()
    t.fail(`Allowed creation of machine without a statemachine`)
  } catch(err) {
    t.pass()
  }
})

test('fail for invalid state machine, no getState', t => {
  try{
    const stateMachine = stateum({
      getState: {}
    })
    t.fail(`Allowed creation of machine without getState function`)
  } catch(err) {
    t.pass()
  }
})

test('fail for invalid state machine, no states', t => {
  try{
    const stateMachine = stateum({
      getState: function() {},
      states: {}
    })
    t.fail(`Allowed creation of machine without states function`)
  } catch(err) {
    t.pass()
  }
})

test('fail to load stateum with empty object', t => {
  let obj
  const stateMachine = stateum(syncSM)
  try {
    stateMachine(obj)
    t.fail(`Allowed creation of machine with empty object`)
  } catch(err) {
    t.ok(err)
    t.pass()
  }
})


test('fail to load stateum with not an object', t => {
  let obj = []
  const stateMachine = stateum(syncSM)
  try {
    stateMachine(obj)
    t.fail(`Allowed creation of machine with array`)
  } catch(err) {
    t.ok(err)
    t.pass()
  }
})

test('load stateum', t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)

  t.ok(obj.getState)
  t.ok(obj.transitionStates)
  t.ok(obj.transitionTo)
  t.ok(obj.states)

  t.pass()
})

test('error if no value for state is found', t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
  t.throws(obj.getState)
  t.pass()
})

test('read states', async t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
  const states = await obj.states()

  t.same(states, ['PAUSE', 'START', 'STOP'])
  t.pass()
})