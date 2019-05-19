import stateum from '../'
import syncSM from './mocks/sync'
import asyncSM from './mocks/async'


describe('load-test', () => {
  it('fail for invalid state machine, no state machine', () => {
    expect(() => stateum()).toThrow();
  });

  it('fail for invalid state machine, no getState', () => {
    expect(() => stateum({
        getState: {}
    })).toThrow();
  });

  it('fail for invalid state machine, no states', () => {
    expect(() => stateum({
      getState: function () {
      },
      states: {}
    })).toThrow();
  });

  it('fail to load stateum with empty object', () => {
    let obj;
    const stateMachine = stateum(syncSM);
    expect(() => stateMachine(obj)).toThrow();
  });


  it('fail to load stateum with not an object', () => {
    let obj = [];
    const stateMachine = stateum(syncSM);
    expect(() =>  stateMachine(obj)).toThrow();
  });

  it('load stateum', () => {
    let obj = {};
    const stateMachine = stateum(syncSM);
    stateMachine(obj);

    expect(obj.getState);
    expect(obj.transitionStates);
    expect(obj.transitionTo);
    expect(obj.states)
  });

  it('error if no value for state is found', () => {
    let obj = {};
    const stateMachine = stateum(syncSM);
    stateMachine(obj);
    expect(() => obj.getState()).toThrow();
  });

  it('error if no value for state is found', async () => {
    let obj = {};
    const stateMachine = stateum(asyncSM);
    stateMachine(obj);
    await expect(obj.getState()).rejects.toThrow();
  });

  it('state is found', async () => {
    let obj = {
      state: 'PAUSE'
    };
    const stateMachine = stateum(asyncSM);
    stateMachine(obj);
    expect(await obj.getState()).toEqual('PAUSE')
  });

  it('read states', async () => {
    let obj = {};
    const stateMachine = stateum(syncSM);
    stateMachine(obj);
    const states = await obj.states();

    expect(states).toEqual(expect.arrayContaining(['PAUSE', 'START', 'STOP']))
  })
});
