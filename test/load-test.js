import test from 'ava';
import stateum from '../'
import states from './shill/states'

test('load stateum', t => {
  let obj = {}
  const stateMachine = stateum(states)
  stateMachine(obj)
  t.pass();
});