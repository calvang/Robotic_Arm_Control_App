import { useState } from 'react'
import Slider from '@material-ui/core/Slider'
import { withStyles } from '@material-ui/core/styles';
// const { ipcRenderer } = window.require('electron');

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
  createTarget: boolean,
  setCreateTarget: any
}

interface PopupProps {
  target: number[],
  setTarget: any,
  index: number // index to change within the target
}

interface AutoProps {
  target: number[],
  setTarget: any,
  createTarget: boolean,
  setCreateTarget: any
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
  const handleSubmit = (e: any) => {
    e.preventDefault()
    console.log(props.createTarget)
    props.setCreateTarget(true)
    console.log(props.createTarget)
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
        {/* <button className="PopupButton">Submit</button> */}
      </form>
    </div>
  )
}

const Tasks = () => {
  // var res = ipcRenderer.sendSync("tasks", "get"))
  return (
    <div className="Menu">
      <div className="MenuHeader"><h3>TASKS</h3></div>
      <div className="MenuBody">
        <p>Tasks</p>
      </div>
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
          In automatic mode, the arm uses inverse kinematics the navigate by following inputed coordinates.
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

export default function Menu(props: MenuProps) {
  const [help, setHelp] = useState(false)
  const [tasks, setTasks] = useState(false)
  const [settings, setSettings] = useState(false)

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

  const MenuButton = (props: MenuButtonProps) => {
    return (
      <li className={props.active ? "active_opt" : "" }>
        <button onClick={props.handler}>
          <i className={`fa ${props.icon} fa-2x`} ></i>
        </button>
      </li>
    )
  }

  return (
    <div style={{ color: "white", position: "absolute", zIndex: 2 }}>
      <ul>
        <MenuButton icon="fa-arrows" handler={props.setControlMode} active={!props.mode} />
        <MenuButton icon="fa-magic" handler={props.setAutomaticMode} active={props.mode}/>
        <MenuButton icon="fa-files-o" handler={handleTasks} active={tasks}/>
        <MenuButton icon="fa-tasks" handler={handleSettings} active={false}/>
        <MenuButton icon="fa-plus-square-o" handler={handleHelp} active={false}/>
        <MenuButton icon="fa-question-circle-o" handler={handleHelp} active={help}/>
      </ul>
      { props.mode && <Automatic 
        target={props.target}
        setTarget={props.setTarget}
        createTarget={props.createTarget}
        setCreateTarget={props.setCreateTarget} />}
      { tasks && <Tasks /> }
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