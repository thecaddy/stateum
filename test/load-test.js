import test from 'ava';
import stateum from '../'
import syncSM from './shill/sync'
import asyncSM from './shill/async'


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
});


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
});

test('load stateum', t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)

  t.ok(obj.getState)
  t.ok(obj.transitionStates)
  t.ok(obj.transitionTo)
  t.ok(obj.states)

  t.pass();
});


test('read states', async t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
  const states = await obj.states()

  t.same(states, ['PAUSE', 'START', 'STOP'])
  t.pass();
});

test('sync: state is found', async t => {
  let obj = {
    state: 'PAUSE'
  }
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
  t.is(await obj.getState(), 'PAUSE')
  t.pass()
})

test('sync: error if no value for state is found', t => {
  let obj = {}
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
  t.throws(obj.getState)
  t.pass()
})

test('async: state is found', async t => {
  let obj = {
    state: 'PAUSE'
  }
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)
  t.is(await obj.getState(), 'PAUSE')
  t.pass()
})

test('async: error if no value for state is found', async t => {
  let obj = {}
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)
  try{
    const state = await obj.getState()
    t.fail(`Found state: ${state}`)
  } catch(err) {
    t.ok(err)
    t.pass()
  }
  t.pass()
})
