# Robotic Arm Control App

A React web/desktop application to control a custom-built 6-axis robotic arm.

![image-20210108214619733](/home/calvang/Projects/RA Personal/control_app/images/render2.png)

## Controls

This application provides two methods of controlling the robotic arm: manual control and automatic. The manual control mode allows the user to navigate the arm using keyboard bindings while the automatic mode uses inverse kinematics to move the end effector of the arm to a specific point.

## Submodules

This project is a submodule for the larger [Personal Robotic Arm] project.

- [Kinematics Python Module](https://github.com/calvang/kinematics)

To build it alone, you must clone this repository and initialize submodules:

```bash
git submodule update --remote --recursive
```

You can also use the above command to update all submodules to the most recent commits. To update a single specific submodule:

```bash
cd kinematics_engine/kinematics
git fetch
git merge origin/master
```



