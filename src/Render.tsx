import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, MeshProps, Vector3Props, useFrame, useLoader, useThree, extend, ReactThreeFiber } from 'react-three-fiber'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { Mesh, Vector2, Vector3, MeshPhongMaterial } from 'three'
import { solve_fk, solve_ik, orient_base } from './kinematics'
extend({ OrbitControls, DragControls })

declare global { // workaround for using OrbitControls as a JSX component
  namespace JSX {
    interface IntrinsicElements {
      'orbitControls': ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>,
      'dragControls': ReactThreeFiber.Object3DNode<DragControls, typeof DragControls>
    }
  }
}

interface FingerProps {
  clawStep: number, // iterations of the claw
  setClawStep: any
}

interface WristProps {
  wrist_theta_delta: number
}

interface JointProps {
  joints_theta_delta: number,
  wrist_theta_delta: number,
  angles: number[],
  setAngles: any
}

interface CompProps {
  file: string,    // path to .obj file
  color: number[]  // RGB color values
}

interface ControlProps {
  controlKeys: any
}

interface TargetProps {
  target: number[],
  setTarget: any,
  targetSelected: boolean,
  setTargetSelected: any
}

interface RenderProps {
  target: number[],
  setTarget: any,
  createTarget: boolean,
  setCreateTarget: any,
  base_theta_delta: number,
  joints_theta_delta: number,
  wrist_theta_delta: number,
  mode: boolean,
  controlKeys: any
}

const x_axis             = new Vector3(1, 0, 0)
const z_axis             = new Vector3(0, 0, 1)
const arm_scale          = 0.01
const base_center        = [0, 0.31, 0]
const blue = [0.05, 0.15, 0.6]
const white = [0.5, 0.5, 0.5]
const base_constraints = [-125*180/Math.PI, 125*180/Math.PI] // angle contraints for base
const joint_constraints = [] // TODO
const inital_base_angle = -Math.PI/2
const initial_angles = [Math.PI/2, -Math.PI/2, -Math.PI/2]  // D, C, D angles (rad)
const link_lengths = [0, 1.58, 1.403, 1.54] // CD, BC, AB + Effector lengths
const arm_length = link_lengths.reduce((a,b) => { return a + b }) // total arm length
const claw_steps = 60 // max steps to take with the claw
const claw_theta_delta = 0.004 

const arm_comps = {
  Finger1: { file: "models/linkage_finger1.obj", // the further finger at the start
        color: white,
        position: [1.04, -0.11, 0.15],
        rotation: [Math.PI, 0, Math.PI],
        joint: [0, 0.14, 0.225 ],
        pos_key: "x", neg_key: "z" },
  Finger2: { file: "models/linkage_finger2.obj", // the closer finger at the start
        color: white,
        position: [1.04, 0.455, 0.05],
        rotation: [Math.PI , Math.PI, 0],
        joint: [0, 0.12, 0.225],
        pos_key: "x", neg_key: "z" },
  HandCover: { file:  "models/moment_body.obj",
        color: white,
        position: [0.666, 0, 0.072],
        rotation: [0, Math.PI, 0] },
  HandBase: { file:  "models/torque_base.obj",
        color: white,
        position: [0.668, 0, 0.176],
        rotation: [0, Math.PI, 0] },
  HandCase: { file: "models/torque_servo.obj",
        color: blue,
        position: [-0.42, 0.08, 0.05],
        rotation: [-Math.PI/2, 0, Math.PI],
        joint: [0, 0.16, 0.225],
        pos_key: "a", neg_key: "d" },
  AB: { file: "models/AB_stepper.obj", // .obj file path
        color: white,                  // color to set object to
        position: [1.76, -0.2, -0.46], // starting position
        rotation: [0, 0, Math.PI/2],   // starting angle
        joint: [1.58, 0.28, 0],        // pivot point for joint
        bounds: [-125, 125],
        pos_key: "w", neg_key: "s" },
  BC: { file: "models/BC.obj",
        color: blue,
        position: [0.22, 0.38, 0.47],
        rotation: [Math.PI , Math.PI, Math.PI/2],
        joint: [0.46, 0.18, 0],
        bounds: [-125, 125],
        pos_key: "r", neg_key: "f" },
  CD: { file: "models/CD.obj",
        color: white,
        position: [0.35, 1.93, -0.22],
        rotation: [-Math.PI , Math.PI, -Math.PI/2 ],
        joint: [0.16, 0.81, 0],
        bounds: [0, 180],
        pos_key: "ArrowUp", neg_key: "ArrowDown" },
  BaseE1: { file: "models/BaseEnew.obj",
        color: blue,
        position: [0.32, -0.02, 0.26],
        rotation: [-Math.PI/2, 0.24, Math.PI] },
  BaseE2: { file: "models/BaseEnewother.obj",
        color: blue,
        position: [-0.38, 0.14, 0.26],
        rotation: [-Math.PI/2, 0.24, 0] },
  TurnTable: { file: "models/newTurntable.obj",
        color: blue,
        position: [0, 0, 0],
        rotation: [Math.PI/2, Math.PI, -Math.PI/2] }
}

const ArmComp: React.FC<MeshProps & CompProps> = (props) => {
  const mesh = useRef<Mesh>()
  const obj: any = useLoader(OBJLoader2, props.file) // loader for .obj
  obj.traverse(function (child: any) {  // set mesh material colors
    if (child instanceof Mesh) {
      child.material = new MeshPhongMaterial()
      child.material.color.setRGB(props.color[0],props.color[1],props.color[2]) 
    }
    })    
  obj.scale.set( arm_scale, arm_scale, arm_scale );
  return <mesh {...props} ref={mesh}><primitive object={obj} /></mesh>
}

const Finger1: React.FC<MeshProps & Vector3Props & FingerProps
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()
  
  function pivot(point: Vector3, theta: number) { // rotate object around a given point
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(z_axis, theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
    }
  }

  useFrame(() => {
    if (vec.current) {
      if (props.controlKeys[arm_comps.Finger1.pos_key] 
        && props.clawStep < claw_steps) {
        props.setClawStep(props.clawStep + 1)
        pivot(vec.current, -claw_theta_delta)
      }
      else if (props.controlKeys[arm_comps.Finger1.neg_key]
        && props.clawStep >= 0) {
        props.setClawStep(props.clawStep - 1)
        pivot(vec.current, +claw_theta_delta)
      }
    }
  })

  return (
    <mesh {...props} ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.Finger1.joint as any}/>
    </mesh>
  )
}

const Finger2: React.FC<MeshProps & Vector3Props & FingerProps 
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()
  
  function pivot(point: Vector3, theta: number) { // rotate object around a given point
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(z_axis, -theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
    }
  }

  useFrame(() => {
    if (vec.current) {
      if (props.controlKeys[arm_comps.Finger2.pos_key] 
        && props.clawStep < claw_steps) {
        props.setClawStep(props.clawStep + 1)
        pivot(vec.current, -claw_theta_delta)
      }
      else if (props.controlKeys[arm_comps.Finger2.neg_key]
        && props.clawStep >= 0) {
        props.setClawStep(props.clawStep - 1)
        pivot(vec.current, +claw_theta_delta)
      }
    }
  })

  return (
    <mesh {...props} ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.Finger2.joint as any}/>
    </mesh>
  )
}


const Hand: React.FC<MeshProps & Vector3Props & WristProps
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()
  const [clawStep, setClawStep] = useState(0) // number of claw iterations
  
  function pivot(point: Vector3, theta: number) { // rotate object around a given point
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(x_axis, theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
      mesh.current.rotateOnAxis(x_axis, -theta) // rotate the OBJECT
    }
  }

  useFrame(() => {
    if (vec.current) {
      if (props.controlKeys[arm_comps.HandCase.pos_key])
        pivot(vec.current, +props.wrist_theta_delta)
      else if (props.controlKeys[arm_comps.HandCase.neg_key])
        pivot(vec.current, -props.wrist_theta_delta)
    }
  })

  return (
    <mesh {...props} ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.HandCase.joint as any}/>
      <ArmComp // Hand Base
        file={arm_comps.HandBase.file} 
        color={arm_comps.HandBase.color}
        position={arm_comps.HandBase.position as any}
        rotation={arm_comps.HandBase.rotation as any} />
      <ArmComp // Hande Cover
        file={arm_comps.HandCover.file} 
        color={arm_comps.HandCover.color}
        position={arm_comps.HandCover.position as any}
        rotation={arm_comps.HandCover.rotation as any} />
      <Finger1 // Finger 1
        controlKeys={props.controlKeys}
        file={arm_comps.Finger1.file}
        color={arm_comps.Finger1.color}
        position={arm_comps.Finger1.position as any}
        rotation={arm_comps.Finger1.rotation as any} 
        clawStep={clawStep}
        setClawStep={setClawStep} />
      <Finger2 // Finger 2
        controlKeys={props.controlKeys}
        file={arm_comps.Finger2.file}
        color={arm_comps.Finger2.color}
        position={arm_comps.Finger2.position as any}
        rotation={arm_comps.Finger2.rotation as any}
        clawStep={clawStep}
        setClawStep={setClawStep} />
    </mesh>
  )
}

const AB: React.FC<MeshProps & Vector3Props & JointProps
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()
  
  function pivot(point: Vector3, theta: number) { // rotate object around a given point
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(z_axis, theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
      mesh.current.rotateOnAxis(z_axis, theta) // rotate the OBJECT
    }
  }

  useFrame(() => {
    const { angles, setAngles, joints_theta_delta } = props
    if (vec.current) {
      if (props.controlKeys[arm_comps.AB.pos_key]) {
        pivot(vec.current, +joints_theta_delta)
        setAngles([angles[0], angles[1], angles[2] + joints_theta_delta])
      }
      else if (props.controlKeys[arm_comps.AB.neg_key]) {
        pivot(vec.current, -joints_theta_delta)
        setAngles([angles[0], angles[1], angles[2] - joints_theta_delta])
      }
    }
  })

  return (
    <mesh {...props} ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.AB.joint as any}/>
      <Hand 
        controlKeys={props.controlKeys} 
        file={arm_comps.HandCase.file} 
        color={arm_comps.HandCase.color}
        position={arm_comps.HandCase.position as any}
        rotation={arm_comps.HandCase.rotation as any}
        wrist_theta_delta={props.wrist_theta_delta} />
    </mesh>
  )
}

const BC: React.FC<MeshProps & Vector3Props & JointProps
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()
  
  function pivot(point: Vector3, theta: number) {
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(z_axis, theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
      mesh.current.rotateOnAxis(z_axis, theta) // rotate the OBJECT
    }
  }

  useFrame(() => {
    const { angles, setAngles, joints_theta_delta } = props
    if (vec.current) {
      if (props.controlKeys[arm_comps.BC.pos_key]) {
        pivot(vec.current, +joints_theta_delta)
        setAngles([angles[0], angles[1] + joints_theta_delta, angles[2]])
      }
      else if (props.controlKeys[arm_comps.BC.neg_key]) {
        pivot(vec.current, -joints_theta_delta)
        setAngles([angles[0], angles[1] - joints_theta_delta, angles[2]])
      }
    }
  })
  
  return (
    <mesh {...props}
      ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.BC.joint as any}/>
      <AB controlKeys={props.controlKeys}
          file={arm_comps.AB.file}
          color={arm_comps.AB.color}
          position={arm_comps.AB.position as any}
          rotation={arm_comps.AB.rotation as any}
          joints_theta_delta={props.joints_theta_delta}
          wrist_theta_delta={props.wrist_theta_delta}
          angles={props.angles}
          setAngles={props.setAngles} />
    </mesh>
  )
}

const CD: React.FC<MeshProps & Vector3Props & JointProps
  & CompProps & ControlProps> = (props) => {
  const mesh = useRef<Mesh>()
  const vec = useRef<Vector3>()

  function pivot(point: Vector3, theta: number) {
    if (mesh.current) {
      mesh.current.position.sub(point) // remove the offset
      mesh.current.position.applyAxisAngle(z_axis, theta) // rotate the POSITION
      mesh.current.position.add(point) // re-add the offset
      mesh.current.rotateOnAxis(z_axis, theta) // rotate the OBJECT
    }
  }

  useFrame(() => {
    const { angles, setAngles, joints_theta_delta } = props
    if (vec.current) {
      if (props.controlKeys[arm_comps.CD.pos_key]) {
        pivot(vec.current, +joints_theta_delta)
        setAngles([angles[0] + joints_theta_delta, angles[1], angles[2]])
      }
      else if (props.controlKeys[arm_comps.CD.neg_key]) {
        pivot(vec.current, -joints_theta_delta)
        setAngles([angles[0] - joints_theta_delta, angles[1], angles[2]])
      }
    }
  })

  return (
    <mesh {...props}
      ref={mesh}>
      <ArmComp file={props.file} color={props.color} />
      <vector3 ref={vec} args={arm_comps.CD.joint as any}/>
      <BC controlKeys={props.controlKeys}
          file={arm_comps.BC.file}
          color={arm_comps.BC.color}
          position={arm_comps.BC.position as any}
          rotation={arm_comps.BC.rotation as any}
          joints_theta_delta={props.joints_theta_delta}
          wrist_theta_delta={props.wrist_theta_delta}
          angles={props.angles}
          setAngles={props.setAngles} />
    </mesh>
  )
}

const Arm: React.FC<MeshProps & RenderProps> = (props) => {
  const mesh = useRef<Mesh>()
  const [modeInit, setModeInit] = useState(false)      // flag for initializing auto mode
  const [angles, setAngles] = useState(initial_angles) // store BCD joint angles
  const [joints, setJoints] = useState([[0,0],[0,0],[0,0],[0,0]])
  const [baseAngle, setBaseAngle] = useState(inital_base_angle)

  const calculate_kinematics = () => {

  }

  useFrame(() => {
    const { mode, base_theta_delta } = props 
    if (mesh.current) {
      if (props.controlKeys.ArrowRight) {
        mesh.current.rotation.y -= base_theta_delta
        setBaseAngle(baseAngle - base_theta_delta)
      }
      else if (props.controlKeys.ArrowLeft) {
        mesh.current.rotation.y += base_theta_delta
        setBaseAngle(baseAngle + base_theta_delta)
      }
    }
    // handle modeInit flag
    if (mode && !modeInit) {
      setModeInit(true) // calculate current joint positions
      let new_joints = solve_fk([...joints], angles, link_lengths)
      setJoints(new_joints)
    }
    else if (!mode && modeInit) setModeInit(false) // reset when in control mode
    // detect if arm is currently in auto mode
    if (mode && modeInit) {
      let new_angles = solve_ik([...joints], [...angles], link_lengths, arm_length, props.target)
      if (new_angles) setAngles(new_angles); console.log(new_angles)
    }
  })

  return (
    <mesh
      {...props}
      ref={mesh}>
      <Suspense fallback={<Box position={[1.2, 0, 0]} />}>
        <CD 
          controlKeys={props.controlKeys}
          file={arm_comps.CD.file} 
          color={arm_comps.CD.color}
          position={arm_comps.CD.position as any} 
          rotation={arm_comps.CD.rotation as any}
          joints_theta_delta={props.joints_theta_delta}
          wrist_theta_delta={props.wrist_theta_delta}
          angles={angles}
          setAngles={setAngles} />
        <ArmComp
          file={arm_comps.BaseE1.file} 
          color={arm_comps.BaseE1.color}
          position={arm_comps.BaseE1.position as any} 
          rotation={arm_comps.BaseE1.rotation as any} />
        <ArmComp
          file={arm_comps.BaseE2.file} 
          color={arm_comps.BaseE2.color}
          position={arm_comps.BaseE2.position as any} 
          rotation={arm_comps.BaseE2.rotation as any} />
        <ArmComp
          file={arm_comps.TurnTable.file} 
          color={arm_comps.TurnTable.color}
          position={arm_comps.TurnTable.position as any} 
          rotation={arm_comps.TurnTable.rotation as any} />
      </Suspense>
    </mesh>
  )
}

const Target: React.FC<MeshProps & TargetProps> = (props) => {
  const mesh = useRef<Mesh>()
  const controls = useRef<DragControls>()
  const { camera, gl: { domElement },  } = useThree()

  useFrame(() => {
    if (mesh.current) props.setTarget(mesh.current.position.toArray())
  })

  const toggleDrag = (e: any) => {
    if (props.targetSelected) props.setTargetSelected(false)
    else props.setTargetSelected(true)
  }

  return (
    <>
    <mesh 
      {...props}
      ref={mesh}
      onClick={toggleDrag} >
      <sphereBufferGeometry args={[0.1, 16, 16]} />
      <meshPhongMaterial color={"orange"} />
    </mesh>
    { mesh.current && 
    <dragControls 
      ref={controls}
      args={[[mesh.current], camera, domElement]} /> }
    </>
  )
}

const Box: React.FC<MeshProps> = (props) => {
  const mesh = useRef<Mesh>()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  useFrame(() => {
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)} >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const ViewControls = () => {  
  const controls = useRef<OrbitControls>()
  const { camera, gl: { domElement },  } = useThree()

  useEffect(() => {
    if (controls.current)
      controls.current.target = new Vector3(0, 1.6, 0)
  })

  useFrame(() => {
    if (controls.current) controls.current.update()  
  })

  return (
    <orbitControls 
      ref={controls} 
      args={[camera, domElement]} 
      enableZoom={true} />
  )
}

export default function Renderer(props: RenderProps) {
  const [targetSelected, setTargetSelected] = useState(false)
  return (
    <div className="Render">
    <Canvas camera={{ position: [0, 3, 3] }}>
      { !targetSelected && <ViewControls /> }
      <directionalLight intensity={0.8} />
      <gridHelper />
      <pointLight position={[0, 10, 20]} />
      { props.createTarget && <Target 
        position={props.target as any}
        target={props.target}
        setTarget={props.setTarget}
        targetSelected={targetSelected}
        setTargetSelected={setTargetSelected} /> }
      <Arm 
        target={props.target}
        setTarget={null}
        createTarget={props.createTarget}
        setCreateTarget={props.setCreateTarget}
        wrist_theta_delta={props.wrist_theta_delta}
        joints_theta_delta={props.joints_theta_delta}
        base_theta_delta={props.base_theta_delta}
        mode={props.mode} 
        controlKeys={props.controlKeys} />
    </Canvas>
    </div>
  )
}
