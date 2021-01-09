import { useState } from 'react'
// const { ipcRenderer } = window.require('electron');

interface MenuProps {
  mode: boolean,
  setControlMode: any,
  setAutomaticMode: any,
  handleTaskRecord: any
}

interface ButtonProps {
  icon: string,
  handler: any,
  active: boolean
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

  const handleHelp = () => {
    if (help) setHelp(false)
    else if (tasks) {
      setTasks(false)
      setHelp(true)
    }
    else setHelp(true)
  }

  const handleTasks = () => {
    if (tasks) setTasks(false)
    else if (help) {
      setHelp(false)
      setTasks(true)
    }
    else setTasks(true)
  }

  const Button = (props: ButtonProps) => {
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
        <Button icon="fa-arrows" handler={props.setControlMode} active={!props.mode} />
        <Button icon="fa-magic" handler={props.setAutomaticMode} active={props.mode}/>
        <Button icon="fa-files-o" handler={handleTasks} active={tasks}/>
        <Button icon="fa-tasks" handler={handleHelp} active={false}/>
        <Button icon="fa-plus-square-o" handler={handleHelp} active={false}/>
        <Button icon="fa-question-circle-o" handler={handleHelp} active={help}/>
      </ul>
      { help && <Help /> }
      { tasks && <Tasks /> }
    </div>
  )
}