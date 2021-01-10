/**
 * Kinematics Javascript Library
 * 
 * Constraints:
 * - The base must be centered at [0,0,0]
 * - The arm joints must all be constrained to a 2D plane
 *   aside from the base and the wrist
 */

/**
 * Find the distance between two 2D points
 */
function distance(pt1: number[], pt2: number[]) {
    return Math.sqrt(Math.pow(pt2[0]-pt1[0],2) + Math.pow(pt2[1]-pt1[1],2))
}

/**
 * Solve for the angle of a given coordinate wrt the x-axis
 */
function signed_arctan(coord: number[]) {
    return Math.atan(coord[1] / coord[0]) + Math.PI * (1 - Math.sign(coord[0])) / 2
}

/**
 * Find position of the end effector and update joint positions (forward kinematics)
 * 
 * @param joints 
 * @param angles 
 */
export function solve_fk(joints: number[][], angles: number[], links: number[]) {
    var prev_angle = angles[0]
    var prev_joint = [...joints[0]]
    for (let i = 1; i < angles.length; ++i) {
        prev_joint[0] += links[i] * Math.cos(prev_angle)
        prev_joint[1] += links[i] * Math.sin(prev_angle)
        prev_angle += angles[i]
        joints[i] = [...prev_joint]
    }
    return joints // updated joint positions with end effector
}

/**
 * Update angles based on correct joint positions
 * 
 * @param joints 
 * @param angles 
 */
export function update_angles(joints: number[][], angles: number[]) {
    var prev_angle = 0
    var curr_vec = [0,0]
    for (let i = 1; i < angles.length; ++i) { // update the angles
        curr_vec[0] = joints[i][0] - joints[i-1][0]
        curr_vec[1] = joints[i][1] - joints[i-1][1]
        var curr_angle = signed_arctan(curr_vec) - prev_angle
        if (curr_angle > Math.PI) curr_angle -= 2*Math.PI
        else if (curr_angle < -Math.PI) curr_angle += 2*Math.PI
        angles[i-1] = curr_angle
        prev_angle += curr_angle
    }
    return angles
}

/**
 * Find the angles to reach the target (inverse kinematics)
 * 
 * @param joints      - size 4x2 array of 2D joint positions ([0,0],D,C,B)
 * @param angles      - size 4 array of joint angles (D, C, B, 0)
 * @param links       - size 4 array of link lengths (0, CD, BC, AB)
 * @param length      - total length of the arm
 * @param target      - 2D target coordinates
 */
export function solve_ik(joints: number[][], angles: number[],
    links: number[], length: number, target: number[] ) {

    var eps = 0.01 // distance threshold
    if (distance([0,0], target) > length) {
        console.error("Target out of range:", target)
        return 
    }

    // get the position of the end effector
    var current_e = solve_fk(joints, angles, links)[joints.length-1]
    var curr_dist = distance(current_e, target)

    const reach = (headIdx: number, tailIdx: number, linkIdx: number) => {
        let r = distance(joints[headIdx], joints[tailIdx])
        let scale = links[linkIdx] / r
        joints[tailIdx][0] = (1-scale)*joints[headIdx][0] + scale*joints[tailIdx][0]
        joints[tailIdx][1] = (1-scale)*joints[headIdx][1] + scale*joints[tailIdx][1]
        // joints[tailIdx] = [(1-scale)*joints[headIdx][0] + scale*joints[tailIdx][0],
        //                     (1-scale)*joints[headIdx][1] + scale*joints[tailIdx][1]]
    }
    // console.log(joints)
    while (curr_dist > eps) { // solve for the new joint positions
        joints[joints.length-1] = target
        for (let i = joints.length-2; i > 0; --i)
            reach(i+1, i, i+1)
        for (let i = 1; i < joints.length-1; ++i)
            reach(i, i+1, i+1)
        current_e = joints[joints.length-1]
        curr_dist = distance(current_e, target)
    }

    return update_angles(joints, angles)
}

/**
 * Orient the base towards the desired target point using inverse kinematic
 */
export function orient_base(target: number[]) {
    var xz_comp = [target[0], target[2]]
    var new_base_angle = signed_arctan(xz_comp)
    if (new_base_angle > Math.PI) new_base_angle -= 2*Math.PI
    else if (new_base_angle < -Math.PI) new_base_angle += 2*Math.PI
    var h = distance([0,0], xz_comp)
    return { base_angle: new_base_angle,
             target_2D:  [h, target[1]] }
}
