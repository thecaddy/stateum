import test from 'ava';
import stateum from '../'
import asyncSM from './shill/async'


test.beforeEach(t => {
    // this runs before each test
});


test('state is found', async t => {
  let obj = {
    state: 'PAUSE'
  }
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)
  t.is(await obj.getState(), 'PAUSE')
  t.pass()
})

test('error if no value for state is found', async t => {
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



test('should return overrideable transitionable states', async t => {
  let obj = {
    state: 'PAUSE'
  }
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)

  const transitions = await obj.transitionStates()

  t.same(transitions, { state: 'PAUSE', transitionStates: { START: true, STOP: false } })
});


test('should transition from PAUSE to START', async t => {
  let obj = {
    state: 'PAUSE'
  }
  const stateMachine = stateum(asyncSM)
  stateMachine(obj)

  const transitions = await obj.transitionStates()

});

// test('should transition from ACCRUING to DELETED and throw err', function(done) {   
//   let updatedReturn = null;

//   returns[1].transitionTo('DELETED')
//   .then(ret => {
//     expect(ret.state).to.equal('DELETED');
//     expect(ret.STATE_MACHINE).to.be.undefined;
//     updatedReturn = ret;

//     return ret.getState();
//   }).then(ret => {
//     expect(ret).to.equal('DELETED');
//     // console.log('oh man', updatedReturn.STATE_MACHINE)
//     return updatedReturn.transitionStates();
//   }).catch(err => {
//     expect(err.message).to.equal('State "DELETED" not implemented');
//     return true;
//   }).then(res => {
//     done();
//   }).catch(err => done(err));
// });


// test('should transition registration from ISFILE to ISFILE', function(done) {   
//   taxReg.transitionTo('HASDUE')
//   .then(res => {
//     expect(res.state).to.equal('HASDUE')
//     return res.transitionTo('ISFILE')
//   }).then(res => {
//     expect(res.state).to.equal('ISFILE')
//     return res.transitionTo('ISFILE')
//   }).then(res => {
//     expect(res.state).to.equal('ISFILE')
//     done()
//   }).catch(err => done(err))
// });

