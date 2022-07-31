import { differenceInSeconds } from 'date-fns'
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react'

import {
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/cycles/actions'
import { cyclesReducer } from '../reducers/cycles/reducer'

export interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CreateNewCycleData {
  task: string
  minutesAmount: number
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsElapsed: (seconds: number) => void
  createNewCycle: (newCycleData: CreateNewCycleData) => void
  interruptCurrentCycle: () => void
}

interface CyclesContextProviderProps {
  children: ReactNode
}

export const CyclesContext = createContext({} as CyclesContextType)

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const noCyclesState = {
    cycles: [],
    activeCycleId: null,
  }

  const [cyclesState, dispach] = useReducer(
    cyclesReducer,
    noCyclesState,
    () => {
      const storedStateAsJson = localStorage.getItem(
        '@ignite-timer:cycles-state',
      )
      return storedStateAsJson ? JSON.parse(storedStateAsJson) : noCyclesState
    },
  )

  useEffect(() => {
    const stateJSON = JSON.stringify(cyclesState)
    localStorage.setItem('@ignite-timer:cycles-state', stateJSON)
  }, [cyclesState])

  const { cycles, activeCycleId } = cyclesState

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    return activeCycle
      ? differenceInSeconds(new Date(), new Date(activeCycle.startDate))
      : 0
  })

  function createNewCycle(data: CreateNewCycleData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispach(addNewCycleAction(newCycle))

    setAmountSecondsPassed(0)
  }

  function interruptCurrentCycle() {
    dispach(interruptCurrentCycleAction())
  }

  function markCurrentCycleAsFinished() {
    dispach(markCurrentCycleAsFinishedAction())
  }

  function setSecondsElapsed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountSecondsPassed,
        markCurrentCycleAsFinished,
        setSecondsElapsed,
        createNewCycle,
        interruptCurrentCycle,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
