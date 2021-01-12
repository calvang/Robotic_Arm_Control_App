import Renderer from "./Render"
// const { ipcRenderer } = window.require('electron')

interface ControlProps {
  mode: boolean,
  controlKeys: any,
  target: number[],
  setTarget: any,
  base_theta_delta: number,
  joints_theta_delta: number,
  wrist_theta_delta: number,
  controlTask: boolean,
  setControlTask: any,
  controlAngles: number[],
  setControlAngles: any
}

export default function Controls(props: ControlProps) {

  // for (let key in props.controlKeys){
  //   if (props.controlKeys[key])
  //     console.log(ipcRenderer.sendSync("control", key))
  // }   
  return (
    <div style={{height: "100vh", overflow: "hidden"}}>
      <Renderer 
        mode={props.mode} 
        controlKeys={props.controlKeys}
        target={props.target}
        setTarget={props.setTarget}
        base_theta_delta={props.base_theta_delta} 
        joints_theta_delta={props.joints_theta_delta} 
        wrist_theta_delta={props.wrist_theta_delta}
        controlTask={props.controlTask}
        setControlTask={props.setControlTask}
        controlAngles={props.controlAngles}
        setControlAngles={props.setControlAngles} />
    </div>
  );
}
