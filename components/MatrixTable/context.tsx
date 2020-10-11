import { createContext, useReducer } from 'react'
import axios from "axios";
/**
 * This is the state shape
 */
interface MatrixTableState {
  /**
   * This is the price matrix that contains the latest value
   */
  matrix: import('../../types').Matrix
  /**
   * We will use original matrix to help us "reset" the table when we want to cancel editing it.
   * Remember that **whenever** you get the matrix from the server, you must set originalMatrix
   * to that value; originalMatrix should try to mirror the matrix in our database.
   */
  originalMatrix: import('../../types').Matrix
}

/**
 * These are the types of the actions you can dispatch. Add actions you want to help you
 * type the dispatch function
 */
type MatrixAction = {
  type: 'SET_MATRIX',
  /**
   * When payload is empty, we will need to set the values from originalMatrix
   */ 
  payload?: import('../../types').Matrix
  metadata?: {
    /**
     * If this is set to true, then instead of resetting to the originalMatrix,
     * we reset to the emptyMatrix
     */
    resetToEmpty?: boolean
  }
} | {
  type: 'SET_ORIGINAL_MATRIX',
  /**
   * When empty, set the value from emptyMatrix
   */
  payload?: import('../../types').Matrix
} | {
  type: 'EDIT_CELL',
  payload: any
} // Here you will need to add your other action(s) in order to edit the pricing (remove EDIT_CELL).
| {
  type: 'CLEAR_MATRIX',
  payload?: import('../../types').Matrix
}
/**
 * This is for the Provider component. No need to change.
 */
type ProviderProps = {
  initialMatrix?: import('../../types').Matrix
}

/**
 * This is an empty matrix. No need to change any value in here. The variable is read-only
 */
const emptyMatrix = {
  "36months": {
      "lite": 0,
      "standard": 0,
      "unlimited": 0,
  },
  "24months": {
      "lite": 0,
      "standard": 0,
      "unlimited": 0
  },
  "12months": {
      "lite": 0,
      "standard": 0,
      "unlimited": 0
  },
  "mtm": {
      "lite": 0,
      "standard": 0,
      "unlimited": 0
  }
} as const

/**
 * This is the default state we will start with. No need to change anything in here.
 */
const defaultState: MatrixTableState = {
  matrix: emptyMatrix,
  originalMatrix: emptyMatrix,
}

/**
 * Your reducer is here. This is a la Redux reducer, you simply take an action, then
 * you work on it and return the state.
 * 
 * @param state 
 * @param action 
 */
const reducer = (state: MatrixTableState, action: MatrixAction): MatrixTableState => {
  console.log("action>>", action.type)
  console.log("action payload>>", action.payload)
  console.log("full state>>", state);
  switch(action.type) {
    // Save latest matrix
    case 'SET_MATRIX':
      state.matrix = action.payload;
      state.originalMatrix = action.payload;      
      return {
        ...state
      }
    // Revert matrix to original value
    case 'SET_ORIGINAL_MATRIX':
      const resetState: MatrixTableState = {
        matrix: state.originalMatrix || emptyMatrix,
        originalMatrix: state.originalMatrix || emptyMatrix
      }
      return resetState;
    // Empty current matrix
    case 'CLEAR_MATRIX':
      const clearState: MatrixTableState = {
        matrix: emptyMatrix,
        originalMatrix: state.originalMatrix || emptyMatrix
      }
      return clearState;
    // Update matrix on every keystroke
    case 'EDIT_CELL': 
      if(action.payload.level === 'lite') {
        // Update standard to 2x and unlimited to 3x if cell being change is lite
        return {
          ...state, matrix: { 
            ...state.matrix, [action.payload.months]: {
              lite:Number(action.payload.value),
              standard:Number(action.payload.value)*2,
              unlimited:Number(action.payload.value)*3
          }}
        }
      }
      else {
        // Update specific cell (standard/unlimited)
        return {
          ...state, matrix: { ...state.matrix, [action.payload.months]: { ...state.matrix[action.payload.months], [action.payload.level]:Number(action.payload.value)}}
        }
      }

    default:
      return state
  }
}

// Creating the context, you don't need to change this.
export const MatrixTableContext = createContext<[MatrixTableState, import('react').Dispatch<MatrixAction>]>([defaultState, () => {}])

/**
 * This is the provider that hosts the state. You don't need to change this.
 * @param param0 
 */
export const MatrixTableContextProvider: import('react').FC<ProviderProps> = ({ initialMatrix, children }) => {
  const state = useReducer(reducer, { matrix: initialMatrix || emptyMatrix, originalMatrix: initialMatrix || emptyMatrix })

  return (
    <MatrixTableContext.Provider value={state}>
      {children}
    </MatrixTableContext.Provider>
  )
}