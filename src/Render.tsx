import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, MeshProps, Vector3Props, useFrame, useLoader, useThree, extend, ReactThreeFiber } from 'react-three-fiber'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Mesh, Vector3, MeshPhongMaterial } from 'three'
extend({ OrbitControls })

declare global { // workaround for using OrbitControls as a JSX component
  namespace JSX {
    interface IntrinsicElements {
      'orbitControls': ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
    }
  }
}

interface CompProps {
  file: string,    // path to .obj file
  color: number[]  // RGB color values
}

interface RenderProps {
  controlKeys: any
}

const z_axis             = new Vector3(0, 0, 1)
const joints_theta_delta = 0.02        // change in angle for joints
const base_theta_delta   = 0.04        // change in angle for bae
const blue = [0.05, 0.15, 0.6]
const white = [0.5, 0.5, 0.5]

const arm_comps = {
  AB: { file: "models/AB_stepper.obj", // .obj file path
        color: white,                  // color to set object to
        position: [1.76, -0.2, -0.46], // starting position
        rotation: [0, 0, Math.PI/2],   // starting angle
        joint: [1.58, 0.28, 0],        // pivot point for joint
        pos_key: "w", neg_key: "s" },
  BC: { file: "models/BC.obj",
        color: blue,
        position: [0.22, 0.38, 0.47],
        rotation: [Math.PI , Math.PI, Math.PI/2],
        joint: [0.46, 0.18, 0],
        pos_key: "r", neg_key: "f" },
  CD: { file: "models/CD.obj",
        color: white,
        position: [0.35, 1.93, -0.22],
        rotation: [-Math.PI , Math.PI, -Math.PI/2 ],
        joint: [0.16, 0.81, 0],
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
  obj.scale.set( 0.01, 0.01, 0.01 );
  return <mesh {...props} ref={mesh}><primitive object={obj} /></mesh>
}

const AB: React.FC<MeshProps & Vector3Props & CompProps & RenderProps> = (props) => {
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
    if (vec.current) {
      if (props.controlKeys[arm_comps.AB.pos_key])
        pivot(vec.current, +joints_theta_delta)
      else if (props.controlKeys[arm_comps.AB.neg_key])
        pivot(vec.current, -joints_theta_delta)
    }
  })

  return (
    <mesh {...props} ref={mesh}>
      <ArmComp file={props.file} color={props.color}/>
      <vector3 ref={vec} args={arm_comps.AB.joint as any}/>
    </mesh>
  )
}

const BC: React.FC<MeshProps & Vector3Props & CompProps & RenderProps> = (props) => {
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
    if (vec.current) {
      if (props.controlKeys[arm_comps.BC.pos_key])
        pivot(vec.current, +joints_theta_delta)
      else if (props.controlKeys[arm_comps.BC.neg_key])
        pivot(vec.current, -joints_theta_delta)
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
          rotation={arm_comps.AB.rotation as any} />
    </mesh>
  )
}

const CD: React.FC<MeshProps & Vector3Props & CompProps & RenderProps> = (props) => {
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
    if (vec.current) {
      if (props.controlKeys[arm_comps.CD.pos_key])
        pivot(vec.current, +joints_theta_delta)
      else if (props.controlKeys[arm_comps.CD.neg_key])
        pivot(vec.current, -joints_theta_delta)
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
          rotation={arm_comps.BC.rotation as any} />
    </mesh>
  )
}

const Arm: React.FC<MeshProps & RenderProps> = (props) => {
  const mesh = useRef<Mesh>()
  const z_axis = new Vector3(0, 0, 1)

  useFrame(() => {
    if (mesh.current) {
      if (props.controlKeys.ArrowRight)
        mesh.current.rotation.y -= base_theta_delta
      else if (props.controlKeys.ArrowLeft)
        mesh.current.rotation.y += base_theta_delta
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
          rotation={arm_comps.CD.rotation as any} />
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
      onPointerOut={(event) => setHover(false)}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const ViewControls = () => {  
  const controls = useRef<OrbitControls>()
  const { camera, gl: { domElement },  } = useThree()

  useEffect(() => {
    if (controls.current) {
      controls.current.target = new Vector3(0, 1.6, 0)
    }
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

  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw", 
      overflow: "hidden", 
      position: "absolute",
      zIndex: 0 }}>
    <Canvas camera={{ position: [0, 3, 3] }}>
      <ViewControls />
      <directionalLight intensity={0.8}/>
      <gridHelper />
      <pointLight position={[0, 10, 20]} />
      <Arm controlKeys={props.controlKeys}/>
    </Canvas>
    </div>
  )
}
