import test from 'ava';
import stateum from '../'
import asyncSM from './mocks/async'


const obj = {
  state: 'PAUSE'
}
test.beforeEach(t => {
  // this runs before each test
  obj.state = 'PAUSE'
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)
});



test('should return overrideable transitionable states', async t => {

  const transitions = await obj.transitionStates()

  t.same(transitions, { state: 'PAUSE', transitionStates: { START: true, STOP: false } })
});


test('should transition from PAUSE to START', async t => {
  const newObj = await obj.transitionTo('START')
  t.is(await newObj.getState(), 'START')
});

test('should throw exception from PAUSE to STOP', async t => {
  try{
    const state = await obj.transitionTo('STOP')
    t.fail(`Found state: ${state}`)
  } catch(err) {
    t.ok(err)
    t.pass()
  }
  t.pass()
});

test('should transition PAUSE to START to START to STOP', async t => {
  let newObj = await obj.transitionTo('START')
  t.is(await newObj.getState(), 'START')
  newObj = await newObj.transitionTo('START')
  t.is(await newObj.getState(), 'START')
  newObj = await newObj.transitionTo('STOP')
  t.is(await newObj.getState(), 'STOP')
});
