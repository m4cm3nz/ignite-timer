import produce from 'immer'
import { Cycle } from '../../contexts/CyclesContexts'
import { ActionTypes } from './actions'

interface CycleState {
  cycles: Cycle[]
  activeCycleId: string | null
}

export function cyclesReducer(state: CycleState, action: any) {
  switch (action.type) {
    case ActionTypes.ADD_NEW_CYCLE:
      return produce(state, (draft) => {
        draft.cycles.push(action.payload.newCycle)
        draft.activeCycleId = action.payload.newCycle.id
      })
    case ActionTypes.INTERRUPT_CURRENT_CYCLE: {
      const activeCycleIndex = state.cycles.findIndex(
        (cycle) => cycle.id === state.activeCycleId,
      )

      if (activeCycleIndex < 0) return state

      return produce(state, (draft) => {
        draft.activeCycleId = null
        draft.cycles[activeCycleIndex].interruptedDate = new Date()
      })
    }
    case ActionTypes.MARK_CURRENT_CYCLE_AS_FINISHED: {
      const activeCycleIndex = state.cycles.findIndex(
        (cycle) => cycle.id === state.activeCycleId,
      )

      if (activeCycleIndex < 0) return state

      return produce(state, (draft) => {
        draft.activeCycleId = null
        draft.cycles[activeCycleIndex].finishedDate = new Date()
      })
    }
    default:
      return state
  }
}
