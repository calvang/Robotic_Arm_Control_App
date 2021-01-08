import { useState, useEffect, useCallback } from 'react';
import Menu from "./Menu"
import Controls from "./Controls";
import './App.css';
import './font-awesome-4.7.0/css/font-awesome.min.css'
// const { ipcRenderer } = window.require('electron');

export default function App() {
  const [mode, setMode] = useState(false) // false if control mode, true if auto
  const [taskRecord, setTaskRecord] = useState(false)
  const [currentTask, setCurrentTask] = useState([]) // stores task being recorded
  const [taskList, setTaskList] = useState([[]])
  const [controlKeys, setKeys] = useState({
    "ArrowUp": false, "ArrowDown": false, "ArrowLeft": false, "ArrowRight": false,
    "w": false, "s": false, "a": false, "d": false, "r": false, "f": false,
    " ": false
  })

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prevKeys => ({...prevKeys, [e.key]: true}))
    // console.log(e.key, "down")
  }, [])

  const handleKeyUp = useCallback((e : KeyboardEvent) => {
    setKeys(prevKeys => ({...prevKeys, [e.key]: false}))
    // console.log(e.key, "up")
  }, [])

  const setControlMode = () => {
    if (mode) { // set to control mode
      setMode(false)
      window.addEventListener("keydown", handleKeyDown, true)
      window.addEventListener("keyup", handleKeyUp, true)
    } 
  }

  const setAutomaticMode = () => {
    if (!mode) { // set to automatic mode
      setMode(true)
      window.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("keyup", handleKeyUp, true)
    }
  }

  const saveTask = () => {
    // var res = ipcRenderer.sendSync("tasks", "save"))
    setTaskList([...taskList, currentTask])
    setCurrentTask([]) // reset current task
  }

  const handleRecordTask = () => {
    if (taskRecord) {
      setTaskRecord(false)
      saveTask()
    }
    else {
      setTaskRecord(true)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);  
    // return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp, true);  
    // return () => window.removeEventListener("keyup", handleKeyUp, true);
  }, [handleKeyUp]);

  return (
    <div className="App">
      <Menu mode={mode} 
        setControlMode={setControlMode} 
        setAutomaticMode={setAutomaticMode}
        handleTaskRecord={handleRecordTask} />
      <Controls controlKeys={controlKeys} />

        {/* <button onClick={()=>{
              ipcRenderer.send('anything-asynchronous', 'ping')
              ipcRenderer.on('asynchronous-reply', (_event: any, arg: any) => {
                console.log("Hiii",arg)
              })
          }}>Async</button>

        <button onClick={()=>{          
            // prints "pong"         
            console.log(ipcRenderer.sendSync('synch', 'ping'))     
        }}>Sync</button> */}
    </div>
  );
}
