import test from 'ava';
import stateum from '../'
import syncSM from './shill/sync'

const obj = {
  state: 'PAUSE'
}
test.beforeEach(t => {
  obj.state = 'PAUSE'
  const stateMachine = stateum(syncSM)
  stateMachine(obj)
});


test('state is found', async t => {
  t.is(await obj.getState(), 'PAUSE')
  t.pass()
})


test('should return transitionable states', async t => {
  const transitions = await obj.transitionStates()

  t.same(transitions, { state: 'PAUSE', transitionStates: [ 'START', 'STOP' ] })
})

test('should transition from PAUSE to START', async t => {
 const newObj = await obj.transitionTo('START')

 t.is(await obj.getState(), 'START')
})