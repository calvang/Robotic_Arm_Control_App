import { useState, useEffect, useCallback } from 'react';
import Menu from "./Menu"
import Controls from "./Controls";
import './App.css';
import './font-awesome-4.7.0/css/font-awesome.min.css'
// const { ipcRenderer } = window.require('electron')

const controlKeys_false = {
  "ArrowUp": false, "ArrowDown": false, "ArrowLeft": false, "ArrowRight": false,
  "w": false, "s": false, "a": false, "d": false, "r": false, "f": false,
  "x": false, "z": false
}

// keys that will still be active in auto mode
const controlKeys_auto = { "a": false, "d": false, "x": false, "z": false }

export default function App() {
  const [mode, setMode] = useState(false) // false if control mode, true if auto
  const [taskRecord, setTaskRecord] = useState(false)
  const [currentTask, setCurrentTask] = useState([]) // stores task being recorded
  const [taskList, setTaskList] = useState([[]])
  const [controlTask, setControlTask] = useState(false) // activated if control task
  const [controlAngles, setControlAngles] = useState([])
  const [controlKeys, setKeys] = useState(controlKeys_false)
  const [target, setTarget] = useState([1,0,0]) // tracks the location of the target to create
  const [base_theta_delta, setBaseSpeed] = useState(0.04)
  const [joints_theta_delta, setJointSpeed] = useState(0.02)
  const [wrist_theta_delta, setWristSpeed] = useState(0.02)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prevKeys => ({...prevKeys, [e.key]: true}))
  }, [])

  const handleKeyUp = useCallback((e : KeyboardEvent) => {
    setKeys(prevKeys => ({...prevKeys, [e.key]: false}))
  }, [])

  const handleAutoKeyDown = useCallback((e : KeyboardEvent) => {
    if (e.key in controlKeys_auto)
      setKeys(prevKeys => ({...prevKeys, [e.key]: true}))
  }, [])

  const handleAutoKeyUp = useCallback((e : KeyboardEvent) => {
    if (e.key in controlKeys_auto)
      setKeys(prevKeys => ({...prevKeys, [e.key]: false}))
  }, [])

  const setControlMode = () => {
    if (mode) { // set to control mode
      setMode(false)
      window.removeEventListener("keydown", handleAutoKeyDown, true)
      window.removeEventListener("keyup", handleAutoKeyUp, true)
      window.addEventListener("keydown", handleKeyDown, true)
      window.addEventListener("keyup", handleKeyUp, true)
    } 
  }

  const setAutomaticMode = () => {
    if (!mode) { // set to automatic mode
      setMode(true)
      setKeys(controlKeys_false)
      window.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("keyup", handleKeyUp, true)
      window.addEventListener("keydown", handleAutoKeyDown, true)
      window.addEventListener("keyup", handleAutoKeyUp, true)
    }
  }

  const saveTask = () => { // TODO
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
    window.addEventListener("keydown", handleKeyDown, true)
  }, [handleKeyDown]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp, true)
  }, [handleKeyUp]);

  return (
    <div className="App">
      <Menu 
        mode={mode} 
        setControlMode={setControlMode} 
        setAutomaticMode={setAutomaticMode}
        handleTaskRecord={handleRecordTask}
        base_theta_delta={base_theta_delta} 
        joints_theta_delta={joints_theta_delta} 
        wrist_theta_delta={wrist_theta_delta}
        setBaseSpeed={setBaseSpeed}
        setJointSpeed={setJointSpeed}
        setWristSpeed={setWristSpeed} 
        target={target}
        setTarget={setTarget} 
        controlTask={controlTask}
        setControlTask={setControlTask}
        setControlAngles={setControlAngles} />
      <Controls 
        mode={mode} 
        controlKeys={controlKeys} 
        target={target}
        setTarget={setTarget}
        base_theta_delta={base_theta_delta} 
        joints_theta_delta={joints_theta_delta} 
        wrist_theta_delta={wrist_theta_delta}
        controlTask={controlTask}
        setControlTask={setControlTask}
        controlAngles={controlAngles}
        setControlAngles={setControlAngles} />

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
