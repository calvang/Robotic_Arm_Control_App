import Renderer from "./Render"
// const { ipcRenderer } = window.require('electron');

interface ControlProps {
  controlKeys: any
}

export default function Controls(props: ControlProps) {

  // for (let key in props.controlKeys){
  //   if (props.controlKeys[key])
  //     console.log(ipcRenderer.sendSync("control", key))
  // }   
  return (
    <div style={{height: "100vh", overflow: "hidden"}}>
      <Renderer controlKeys={props.controlKeys}/>
    </div>
  );
}
