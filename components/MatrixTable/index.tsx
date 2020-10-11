import classnames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { MatrixTableContext, MatrixTableContextProvider } from './context'
import axios from "axios"

type Props = {
  initialMatrix?: import('../../types').Matrix
} & import('react').HTMLAttributes<HTMLDivElement>

/**
 * Add 4 buttons: 
 * - Cancel to reset the matrix to how it was before changing the values (only when in edit mode)
 * - Edit to make the fields editable (only when not in edit mode)
 * - Clear to completely clear the table
 * - Save to save the table
 * @param param0 
 */
const MatrixTable: import('react').FC<Omit<Props, 'initialMatrix'>> = ({ className, children, ...props }) => {
  // State ------------------------------------------------------------------- //
  const [{ matrix }, dispatch] = useContext(MatrixTableContext)
  
  // Get data from pricing.json
  const fetchData = async () => {    
    const resp = await axios.get('/api/pricing');
    dispatch({ type: 'SET_MATRIX', payload: resp.data});
  };

  // Handlers ---------------------------------------------------------------- //
  // You can save (to api) the matrix here. Remember to update originalMatrix when done.
  const save = async () => {
    alert('save');
    axios({
      method: 'post',
      url: '/api/save-pricing',
      data: matrix
    }).then(
      resp=> {
        console.log('resp>>', resp);
        dispatch({ type: 'SET_MATRIX', payload: matrix})
        setLocalState( prevState => (
          { ...initLocalState }
        ));
      }
    ).catch(
      (err)=>{
        alert(err.response.data.error);
      }
    );
  }

  const toggleEdit = () => {
    setLocalState( prevState => (
      {...prevState, 
        readonly: false,
        btnEditCancel: {btnLabel : "Cancel", btnFn: toggleCancel}, 
        btnClear: { show: true },
        btnSave: { show: true }
      }
    ));
  }

  const toggleCancel = () => {
    dispatch({
      type: 'SET_ORIGINAL_MATRIX'
    })
  }

  const clear = () => {
    dispatch({
      type: 'CLEAR_MATRIX'
    })
  }

  // Initial value for local state to manipulate input/button etc
  const initLocalState = {
    readonly: true,
    btnSave: {
      show: false
    },
    btnClear: {
      show: false
    },
    btnEditCancel: {
      btnLabel: "Edit",
      btnFn: toggleEdit
    }
  }

  // Effects ----------------------------------------------------------------- //
  // local state to manipulate input/button etc
  const [state, setLocalState] = useState(initLocalState);
  
  // Call fetchData after render
  useEffect(() => {
    fetchData();
  }, [])

  // Rendering --------------------------------------------------------------- //

  return (    
    <div className='container'>
      <div className="shortrow">        
        <button id="btnSave" onClick={save} style={{ display: state.btnSave.show ? "block" : "none" }}>Save</button>&nbsp;
        {/* Use 1 button toggle edit/cancel */}
        <button id="btnEditCancel" onClick={state.btnEditCancel.btnFn}>{ state.btnEditCancel.btnLabel }</button>&nbsp;
        <button id="btnClear" onClick={clear} style={{ display: state.btnClear.show ? "block" : "none" }}>Clear</button>
      </div>
      <div className="shortrow">
        <div className="cardheader"></div>
        <div className="cardheader">Lite</div>
        <div className="cardheader">Standard</div>
        <div className="cardheader">Unlimited</div>
      </div>      
      <div className="container">
        {/* Populate input base on matrix data */}
        {Object.keys(matrix).map(function(keyName, keyIndex) {
            return (
              <div className="row" key={keyIndex}>
                <div className="cardheader">{keyName}</div> 

                {Object.keys(matrix[keyName]).map(function(level, levelIndex) {
                  return (
                    <input key={levelIndex} id={keyName + "." + level} type="text" attr-months={keyName} attr-level={level} className={ !state.readonly ? "card card_editable" : "card" } readOnly={state.readonly }
                      value={matrix[keyName][level] || ''} 
                      onChange={(e) => {
                        // Reject if input key is not a number
                        if(!isNaN(Number(e.target.value))) {
                          dispatch({
                            type: 'EDIT_CELL',
                            payload: {
                              months: e.target.getAttribute('attr-months'),
                              level: e.target.getAttribute('attr-level'),
                              value: e.target.value
                            }
                          })
                        }
                        
                      } 
                    }/>
                  )
                })}                
              </div>
            )
        })}

      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: top;
          align-items: center;
        }

        .shortrow {
          height: 50px;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
        .row {
          height: 80px;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
        .cardheader {
          width: 100px;
          height: 45px;
          margin: 1rem;
          padding: 1.5rem;
          text-align: center;
          color: inherit;
          text-decoration: none;
          vertical-align: middle;
        }
        .card {
          width: 100px;
          height: 60px;
          margin: 1rem;
          padding: 1.5rem;
          text-align: center;
          color: inherit;
          text-decoration: none;
          border: 1px solid #818283;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .card_editable {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .btnDisplay: {
          display: block;
        }

        .btnHide: {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

const MatrixTableWithContext: import('react').FC<Props> = ({ initialMatrix, ...props }) => {
  // You can fetch the pricing here or in pages/index.ts
  // Remember that you should try to reflect the state of pricing in originalMatrix.
  // matrix will hold the latest value (edited or same as originalMatrix)

  // Could not access dispatch fn from here
  // fetchData done on MatrixTable which have access to dispatch function
  
  return (
    <MatrixTableContextProvider initialMatrix={initialMatrix}>
      <MatrixTable {...props} />
    </MatrixTableContextProvider>
  )
}

export default MatrixTableWithContext
