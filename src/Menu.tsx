import { useState } from 'react'
import { Slider, Table, TableBody, TableCell, TableContainer,
         TableHead, TableRow, Paper, withStyles  } from '@material-ui/core'
import * as default_tasks from './default_tasks.json'
// const { ipcRenderer } = window.require('electron')

const default_angles = [0, 90, -90, -90, 0, 0]

interface MenuProps {
  mode: boolean,
  setControlMode: any,
  setAutomaticMode: any,
  handleTaskRecord: any,
  base_theta_delta: number,
  joints_theta_delta: number,
  wrist_theta_delta: number,
  setBaseSpeed: any,
  setJointSpeed: any, 
  setWristSpeed: any,
  target: number[],
  setTarget: any,
  controlTask: boolean,
  setControlTask: any,
  setControlAngles: any,
  taskRecord: boolean,
  setTaskRecord: any,
  recordedTask: number[][],
  setRecordedTask: any
}

interface PopupProps {
  target: number[],
  setTarget: any,
  index: number // index to change within the target
}

interface AutoProps {
  target: number[],
  setTarget: any,
}

interface TaskProps {
  tasks: any[],
  changeTask: any,
  currentTask: number,
  isPlaying: boolean,
  handlePlayStop: any,
  handleView: any
}

interface TaskViewProps {
  tasks: any[],
  changeTask: any,
  isPlaying: boolean,
  setIsPlaying: any,
  activeTask: number,
  setActiveTask: any,
  executeTask: any,
  controlTask: boolean,
  setControlTask: any,
  setControlAngles: any
}

interface RecordProps {
  mode: boolean,
  taskRecord: boolean,
  stopRecording: any,
  startRecording: any
}

interface SettingsProps {
  base_theta_delta: number,
  joints_theta_delta: number,
  wrist_theta_delta: number,
  setBaseSpeed: any,
  setJointSpeed: any, 
  setWristSpeed: any,
  taskInterval: number,
  setTaskInterval: any
}

interface MenuButtonProps {
  icon: string,
  handler: any,
  active: boolean
}

const field_map = ["x", "y", "z"]

const PopupField = (props: PopupProps) => {
  const handleChange = (e: any) => {
    let new_target = [...props.target]
    new_target[props.index] = e.target.value
    props.setTarget(new_target)
  }

  return ( 
    <td>
      <label>{field_map[props.index]}</label>
      <input className="PopupField" type="text" 
        name={field_map[props.index]} 
        value={props.target[props.index]}
        onChange={handleChange} />
    </td>
  )
}

const Automatic = (props: AutoProps) => {
  const handleSubmit = (e: any) => { // this is here to prevent reloading
    e.preventDefault()
  }

  return (
    <div className="Popup">
      <b>Target Coordinates</b>
      <form onSubmit={handleSubmit}>
        <table><tbody><tr>
          <PopupField 
            target={props.target}
            setTarget={props.setTarget} 
            index={0} />
          <PopupField 
            target={props.target}
            setTarget={props.setTarget} 
            index={1} />
          <PopupField 
            target={props.target}
            setTarget={props.setTarget} 
            index={2} />
        </tr></tbody></table>
        <input type="submit" style={{ display: "none" }} />
      </form>
    </div>
  )
}

const task_columns = [
  { field: "name", headerName: "Task", width: 70 },
  { field: "length", headerName: "Length", width: 30 },
  { field: "desc", headerName: "Description", width: 200 }
]

const TaskList = (props: TaskProps) => {
  const { tasks, isPlaying, handlePlayStop, handleView } = props

  return (
    <TableContainer component={Paper}>
      <Table aria-label="tasks table">
        <TableHead>
          <TableRow>
            { task_columns.map((col) => {
              return <TableCell 
                key={col.field}
                style={{ width: col.width}}>
                <b>{col.headerName}</b>
              </TableCell>
            })}
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { tasks.map((row, idx) => {
            return <TableRow key={idx}>
              <TableCell scope="row">
                <button className="TableButton"
                  onClick={() => handleView(idx)}>
                  {row.name}
                </button>
              </TableCell>
              <TableCell>{row.length}</TableCell>
              <TableCell>{row.desc}</TableCell>
              <TableCell>
                <button 
                  className={isPlaying ? "StopButton" : "PlayButton"}
                  onClick={() => handlePlayStop(idx)}>
                  { isPlaying ? <i className="fa fa-stop-circle fa-2x"></i>
                    : <i className="fa fa-play-circle fa-2x"></i> }
                </button>
              </TableCell>
            </TableRow>
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const task_command_control_columns = [
  { field: "e", headerName: "Base (E)", width: 50 },
  { field: "d", headerName: "Joint D", width: 50 },
  { field: "c", headerName: "Joint C", width: 50 },
  { field: "b", headerName: "Joint B", width: 50 },
  { field: "a", headerName: "Joint A", width: 50 },
  { field: "claw", headerName: "Claw", width: 50 }
]

const task_command_automatic_columns = [
  { field: "x", headerName: "X", width: 100 },
  { field: "y", headerName: "Y", width: 100 },
  { field: "z", headerName: "Z", width: 100 }
]

const TaskCommand = (props: TaskProps) => {
  const { tasks, changeTask, currentTask, 
          isPlaying, handlePlayStop, handleView } = props
  const columns = tasks[currentTask].type === "control" ? task_command_control_columns 
                : task_command_automatic_columns
  const [data, setData] = useState(tasks[currentTask].data)

  function handleChange(e: any, row_idx: number, col_idx: number) {
    var new_data = [...data]
    new_data[row_idx][col_idx] = e.target.value
    setData(new_data)
  }

  return (
    <>
      <h4>{tasks[currentTask].name}</h4>
      <div style={{ color: "rgb(173, 173, 173)", marginTop: "-20px"}}>
        <button onClick={() => handleView(currentTask)} 
          style={{ width: "50px" }}>
          <i className="fa fa-arrow-circle-left fa-2x"></i>
        </button>
        <button 
          className={isPlaying ? "StopButton" : "PlayButton"}
          style={{ width: "50px" }}
          onClick={() => handlePlayStop(currentTask)}>
          { isPlaying ? <i className="fa fa-stop-circle fa-2x"></i>
            : <i className="fa fa-play-circle fa-2x"></i> }
        </button>
        <button type="submit"
          form={tasks[currentTask].name}
          style={{ width: "50px" }}>
          <i className="fa fa-save fa-2x"></i>
        </button>
      </div>
      <form id={tasks[currentTask].name} 
        onSubmit={(e) => changeTask(e, data, currentTask)}>
        <TableContainer component={Paper}>
          <Table aria-label="tasks table">
            <TableHead>
              <TableRow>
                { columns.map((col) => {
                  return <TableCell 
                    key={col.field}
                    style={{ textAlign: "center", width: col.width }}>
                    <b>{col.headerName}</b>
                  </TableCell>
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              { tasks[currentTask].data.map((row: any[], row_idx: number) => {
                return <TableRow key={row_idx}>
                  { columns.map((col, col_idx) => {
                    return <TableCell 
                        key={col.field} style={{ textAlign: "center" }} >
                        <input 
                          className="PopupField"
                          style={{ backgroundColor: "white", borderColor: "white" }}
                          type="text" 
                          name={`${row_idx},${col_idx}`} 
                          value={data[row_idx][col_idx]}
                          onChange={(e) => handleChange(e, row_idx, col_idx)} />
                      </TableCell>
                  })}
                </TableRow>
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <input type="submit" style={{ display: "none" }} />
      </form>
    </>
  )
}

const Tasks = (props: TaskViewProps) => {
  const [currentTask, setCurrentTask] = useState(-1) // index to displayed task (-1) is null
  const { tasks, changeTask, isPlaying, setIsPlaying,
          activeTask, setActiveTask, executeTask } = props
  // var res = ipcRenderer.sendSync("tasks", "get"))

  function handlePlayStop(index: number) {
    if (isPlaying && activeTask !== -1) {
      setIsPlaying(false)
      setActiveTask(-1)
    }
    else if (!isPlaying && activeTask === -1) {
      setIsPlaying(true)
      setActiveTask(index)
      executeTask(index)
    }
  }

  function handleView(index: number) {
    if (currentTask === -1) // go from list to specific task
      setCurrentTask(index)
    else 
      setCurrentTask(-1)
  }

  return (
    <div className="Menu">
      <div className="MenuHeader"><h3>TASKS</h3></div>
      <div className="MenuBody" style={{ height: "calc(100vh - 56px" }}>
        <br/>
        { currentTask === -1 ? <TaskList 
            tasks={tasks}
            changeTask={null}
            currentTask={currentTask}
            isPlaying={isPlaying}
            handlePlayStop={handlePlayStop}
            handleView={handleView} /> 
          : <TaskCommand 
          tasks={tasks}
          changeTask={changeTask}
          currentTask={currentTask}
          isPlaying={isPlaying}
          handlePlayStop={handlePlayStop}
          handleView={handleView} />}
      </div>
    </div>
  )
}

const Record = (props: RecordProps) => {
  const { mode, taskRecord, stopRecording, startRecording } = props

  const onClick = (e: any) => {
    if (taskRecord) stopRecording()
    else startRecording()
  }

  return (
    <div className={ `Record ${mode ? "RecordAuto" : "RecordControl"}` }>    
      { 
        !taskRecord ? <>Start Recording:&nbsp;&nbsp;
          <button className="RecordButton" onClick={onClick}>
            <i className="fa fa-circle fa-lg" ></i>
          </button></> 
        : <>Stop Recording:&nbsp;&nbsp;
          <button className="RecordButton" onClick={onClick}>
            <i className="fa fa-stop-circle fa-lg" ></i>
          </button></> 
      }
    </div>
  )
}

const ValueSlider = withStyles({
  root: {
    color: '#2469c4',
    height: 8,
    width: "90%"
  },
  thumb: {
    height: 14,
    width: 14,
    backgroundColor: '#cbcdcf',
    marginTop: -3,
    marginLeft: -7,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-64%)',
    // height: 4
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const Settings = (props: SettingsProps) => {
  // const classes = useStyles()

  const handleBase = (e: any, val: number | number[]) => {
    props.setBaseSpeed(val)
  }

  const handleJoints = (e: any, val: number | number[]) => {
    props.setJointSpeed(val)
  }

  const handleWrist = (e: any, val: number | number[]) => {
    props.setWristSpeed(val)
  }

  const handleTaskInterval = (e: any, val: number | number[]) => {
    props.setTaskInterval(val)
  }


  return (
    <div className="Menu">
      <div className="MenuHeader"><h3>Settings</h3></div>
      <div className="MenuBody">
        <p>
          The following parameters are rotational velocities in radians per frame of movement.
        </p>
        <h4>Base Rotation</h4>
          <ValueSlider 
            value={props.base_theta_delta}
            valueLabelDisplay="auto"
            track="inverted"
            step={0.01}
            min={0.02}
            max={1}
            onChange={handleBase} />
        <h4>Joint Rotation</h4>
          <ValueSlider 
            value={props.joints_theta_delta}
            valueLabelDisplay="auto"
            track="inverted"
            step={0.01}
            min={0.01}
            max={1}
            onChange={handleJoints} />
        <h4>Wrist Rotation</h4>
          <ValueSlider 
            value={props.wrist_theta_delta}
            valueLabelDisplay="auto"
            track="inverted"
            step={0.01}
            min={0.01}
            max={1}
            onChange={handleWrist} />
        <h4>Task Step Interval</h4>
          <ValueSlider 
            value={props.taskInterval}
            valueLabelDisplay="auto"
            track="inverted"
            step={100}
            min={500}
            max={8000}
            onChange={handleTaskInterval} /><br/><br/>
      </div>
    </div>
  )
}

const Help = () => {
  return (
    <div className="Menu">
      <div className="MenuHeader"><h3>HELP</h3></div>
      <div className="MenuBody">
        <h4><i className="fa fa-arrows fa-lg" ></i> Control Mode</h4>
        <p>
          In control mode, the arm is directly controlled via the following keybindings:<br/><br/>
          <code>ArrowRight/ArrowLeft</code> - Base E Yaw<br/>
          <code>ArrowUp/ArrowDown</code> - Joint D Pitch<br/>
          <code>R/F</code> - Joint C Pitch<br/>
          <code>W/S</code> - Joint B Pitch<br/>
          <code>D/A</code> - Wrist A Roll<br/>
          <code>X/Z</code> - End Effector Open/Close<br/>
        </p>
        <h4><i className="fa fa-magic fa-lg" ></i> Automatic Mode</h4>
        <p>
          In automatic mode, keyboard controls for the arm except for those for the wrist and claw are disabled, 
          and the arm uses inverse kinematics the navigate by following inputed coordinates.<br/><br/>
          Target coordinates are indicated by an orange point can be changed through a popup tool or by dragging the point
          around. To drag the point, click the object to disable orbit controls and then use the mouse to drag it.
          Tasks can be recorded in this mode by pressing the record button <i className="fa fa-plus-square-o fa-lg" ></i>.
        </p>
        <h4><i className="fa fa-files-o fa-lg" ></i> Tasks</h4>
        <p>
          Tasks are lists of instructions that can program the arm to move in a predetermined pattern. <br/><br/>
          Example instruction with arm angles: 
        </p>
        <pre>
          # Schema: angles in degrees <br/>
          # E  D  C  B  A Claw (0/1 = true/false)<br/>
          90 40 30 90 120 0
        </pre>
        <p>Example instruction with target positions: </p>
        <pre>
          # Schema: end effector positon <br/>
          # x   y   z <br/>
          1.56 5.87 2.35 
        </pre>
      </div>
    </div>
  )
}

const MenuButton = (props: MenuButtonProps) => {
  return (
    <li className={props.active ? "active_opt" : "" }>
      <button onClick={props.handler}>
        <i className={`fa ${props.icon} fa-2x`} ></i>
      </button>
    </li>
  )
}

export default function Menu(props: MenuProps) {
  const [help, setHelp] = useState(false)
  const [tasks, setTasks] = useState(false)
  const [settings, setSettings] = useState(false)
  const [record, setRecord] = useState(false)
  const [taskList, setTaskList] = useState(default_tasks.tasks)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTask, setActiveTask] = useState(-1)
  const [taskInterval, setTaskInterval] = useState(5000) // interval between task iters

  const handleHelp = () => {
    if (help) setHelp(false)
    else {
      if (tasks) setTasks(false)
      else if (settings) setSettings(false)
      setHelp(true)
    }
  }

  const handleTasks = () => {
    if (tasks) setTasks(false)
    else {
      if (help) setHelp(false)
      else if (settings) setSettings(false)
      setTasks(true)
    }
  }

  const handleSettings = () => {
    if (settings) setSettings(false)
    else {
      if (tasks) setTasks(false)
      else if (help) setHelp(false)
      setSettings(true)
    }
  }

  const handleRecord = () => {
    if (record) setRecord(false)
    else setRecord(true)
  }

  const changeTask = (e: any, data: any[], index: number) => {
    e.preventDefault()
    var new_tasks = [...taskList]
    new_tasks[index].data = data
    new_tasks[index].length = data.length
    setTaskList(new_tasks)
    console.log(0)
  }

  function executeTask(task_index: number) {
    if (taskList[task_index].type === "control") {
      props.setControlMode()
      props.setControlAngles(default_angles)
      props.setControlTask(true)
    }
    if (taskList[task_index].type === "automatic")
      props.setAutomaticMode()
    var current_interval = taskInterval
    var data_length = taskList[task_index].data.length
    for (let data_index = 0; data_index < data_length; ++data_index) {
      setTimeout(function(){
        iterateTask(task_index, data_index)
      }, current_interval)
      current_interval += taskInterval
    }
    setTimeout(function(){ // reset to starting position
      props.setControlAngles(default_angles)
    }, taskInterval * (data_length + 1))
    setTimeout(function(){
      props.setControlTask(false)
    }, taskInterval * (data_length + 2))
    setIsPlaying(false)
    setActiveTask(-1)
  }

  const iterateTask = (task_index: number, data_index: number) => {
    if (taskList[task_index].type === "control") {
      var rad_angles = [...taskList[task_index].data[data_index]]// convert to radians
      for (let i = 0; i < taskList[task_index].data[data_index].length-1; ++i) 
        rad_angles[i] *= 0.01745329
      props.setControlAngles(rad_angles)
    }
    else if (taskList[task_index].type === "automatic")
      props.setTarget(taskList[task_index].data[data_index])
  }

  const startRecording = () => {
    props.setTaskRecord(true)
  }

  const stopRecording = () => { 
    let new_taskList = [...taskList]
    let task_num = 1 + taskList.length - default_tasks.tasks.length
    var saved_recordedTask = [...props.recordedTask]
    if (!props.mode) { // convert to degrees
      for (let i = 0; i < saved_recordedTask.length; ++i) {
        for (let j = 0; j < saved_recordedTask[0].length-1; ++j)
          saved_recordedTask[i][j] *= 57.29578
      }
    }
    new_taskList.push({
      name: `task${task_num}`,
      desc: `Recorded Task ${task_num}`,
      type: props.mode ? "automatic" : "control",
      length: props.recordedTask.length,
      data: saved_recordedTask
    })
    setTaskList(new_taskList) // add recorded task to task list
    props.setTaskRecord(false)
    props.setRecordedTask([])
  }

  return (
    <div style={{ color: "white", position: "absolute", zIndex: 2 }}>
      <ul>
        <MenuButton icon="fa-arrows" handler={props.setControlMode} active={!props.mode} />
        <MenuButton icon="fa-magic" handler={props.setAutomaticMode} active={props.mode}/>
        <MenuButton icon="fa-files-o" handler={handleTasks} active={tasks}/>
        <MenuButton icon="fa-plus-square-o" handler={handleRecord} active={record}/>
        <MenuButton icon="fa-tasks" handler={handleSettings} active={settings}/>
        <MenuButton icon="fa-question-circle-o" handler={handleHelp} active={help}/>
      </ul>
      { props.mode && <Automatic 
        target={props.target}
        setTarget={props.setTarget} /> }
      { tasks && <Tasks 
        tasks={taskList} 
        changeTask={changeTask}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        activeTask={activeTask}
        setActiveTask={setActiveTask}
        executeTask={executeTask}
        controlTask={props.controlTask}
        setControlTask={props.setControlTask}
        setControlAngles={props.setControlAngles} /> }
      { record && <Record 
        mode={props.mode}
        taskRecord={props.taskRecord}
        stopRecording={stopRecording}
        startRecording={startRecording} /> }
      { settings && <Settings 
        base_theta_delta={props.base_theta_delta} 
        joints_theta_delta={props.joints_theta_delta} 
        wrist_theta_delta={props.wrist_theta_delta}
        setBaseSpeed={props.setBaseSpeed}
        setJointSpeed={props.setJointSpeed}
        setWristSpeed={props.setWristSpeed}
        taskInterval={taskInterval}
        setTaskInterval={setTaskInterval} /> }
      { help && <Help /> }
    </div>
  )
}