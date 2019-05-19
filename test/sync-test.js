import stateum from '../'
import syncSM from './mocks/sync'

const obj = {
  state: 'PAUSE'
}
describe('sync-test', () => {
  beforeEach(() => {
    obj.state = 'PAUSE'
    const stateMachine = stateum(syncSM)
    stateMachine(obj)
  });


  it('state is found', async () => {
    expect(await obj.getState()).toEqual('PAUSE')
  })


  it('should return transitionable states', async () => {
    const transitions = await obj.transitionStates()

    expect(transitions).toEqual({ state: 'PAUSE', transitionStates: [ 'START', 'STOP' ] })
  })

  it('should transition from PAUSE to START', async () => {
    const newObj = await obj.transitionTo('START')

    expect(await newObj.getState()).toEqual('START')
  })

  it('should transition PAUSE to START to START to STOP', async () => {
    let newObj = await obj.transitionTo('START')
    expect(await newObj.getState()).toEqual('START')
    newObj = await newObj.transitionTo('START')
    expect(await newObj.getState()).toEqual('START')
    newObj = await newObj.transitionTo('STOP')
    expect(await newObj.getState()).toEqual('STOP')
  });

})
