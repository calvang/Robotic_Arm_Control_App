import { useState } from 'react'
import { Slider, Table, TableBody, TableCell, TableContainer,
         TableHead, TableRow, Paper, withStyles  } from '@material-ui/core'
import * as default_tasks from './default_tasks.json'
// const { ipcRenderer } = window.require('electron')

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
  setTarget: any
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

interface RecordProps {
  mode: boolean,
  record: boolean
}

interface SettingsProps {
  base_theta_delta: number,
  joints_theta_delta: number,
  wrist_theta_delta: number,
  setBaseSpeed: any,
  setJointSpeed: any, 
  setWristSpeed: any
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

const Tasks = () => {
  const [isList, setIsList] = useState(true) // whether on the main task list
  const [tasks, setTasks] = useState(readData())
  // var res = ipcRenderer.sendSync("tasks", "get"))

  function readData() {
    var task_list = []
    for (let i in default_tasks.tasks)
      task_list.push({
        name: default_tasks.tasks[i].name, 
        length: default_tasks.tasks[i].data.length, 
        desc: default_tasks.tasks[i].desc })
    return task_list
  }

  return (
    <div className="Menu">
      <div className="MenuHeader"><h3>TASKS</h3></div>
      <div className="MenuBody" style={{ height: "calc(100vh - 56px" }}>
        <br/>
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
              </TableRow>
            </TableHead>
            <TableBody>
              { tasks.map((row, idx) => {
                return <TableRow key={idx}>
                  <TableCell scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.length}</TableCell>
                  <TableCell>{row.desc}</TableCell>
                </TableRow>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}

const Record = (props: RecordProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const { mode } = props

  const onClick = (e: any) => {
    if (isRecording) setIsRecording(false)
    else setIsRecording(true)
  }

  return (
    <div className={ `Record ${mode ? "RecordAuto" : "RecordControl"}` }>    
      { 
        !isRecording ? <>Start Recording:&nbsp;&nbsp;
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
            onChange={handleWrist} /><br/><br/>
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
          Tasks can be recorded in this mode by pressing the record button <i className="fa fa-plus-square-o fa-lg" ></i>.
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
          # E  D  C  B  A <br/>
          90 40 30 90 120 
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
      { tasks && <Tasks /> }
      { record && <Record 
        mode={props.mode}
        record={record} /> }
      { settings && <Settings 
        base_theta_delta={props.base_theta_delta} 
        joints_theta_delta={props.joints_theta_delta} 
        wrist_theta_delta={props.wrist_theta_delta}
        setBaseSpeed={props.setBaseSpeed}
        setJointSpeed={props.setJointSpeed}
        setWristSpeed={props.setWristSpeed} /> }
      { help && <Help /> }
    </div>
  )
}