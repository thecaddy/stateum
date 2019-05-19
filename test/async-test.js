import stateum from '../'
import asyncSM from './mocks/async'

describe('async-test', () => {
  const obj = {
    state: 'PAUSE'
  };
  beforeEach(() => {
    // this runs before each test
    obj.state = 'PAUSE';
    const stateMachine = stateum(asyncSM);
    stateMachine(obj)
  });


  it('should return overrideable transitionable states', async () => {

    const transitions = await obj.transitionStates();

    expect(transitions).toEqual({state: 'PAUSE', transitionStates: {START: true, STOP: false}})
  });


  it('should transition from PAUSE to START', async () => {
    const newObj = await obj.transitionTo('START');
    expect(await newObj.getState()).toEqual('START')
  });

  it('should throw exception from PAUSE to STOP', async () => {
    await expect(obj.transitionTo('STOP')).rejects.toThrow();
  });

  it('should transition PAUSE to START to START to STOP', async () => {
    let newObj = await obj.transitionTo('START');
    expect(await newObj.getState()).toEqual('START');
    newObj = await newObj.transitionTo('START');
    expect(await newObj.getState()).toEqual('START');
    newObj = await newObj.transitionTo('STOP');
    expect(await newObj.getState()).toEqual('STOP')
  });
});
