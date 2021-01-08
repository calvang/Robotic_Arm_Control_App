import sys
from flask import Flask, session, request
from flask_cors import cross_origin
from kinematics_2D import Arm_2D

arm = False
arm_status = False # true if arm exists

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route("/", methods = ["GET", "POST"])
@cross_origin()
def home():
    return "Connection Successful", 200

@app.route("/init", methods = ["GET", "POST"])
@cross_origin()
def init():
    global arm
    global arm_status
    if arm_status:
        return {"error": "Arm already initialized"}, 400
    if request.method == "POST":
        arm = Arm(
            request.args.get("links"),
            request.args.get("angles"),
            request.args.get("angle_constraints"))
    elif request.method == "GET":
        arm = Arm(
            [ 0.,   4.,  3.,  2., 1.],
            [45., -90., 45., 20., 0.],
            [[0, 180],
            [-120, 120],
            [-120, 120],
            [-120, 120],
            [0, 0]])
    if arm.check_status:
        arm_status = True
        return "", 200
    else:
        return {"error": "Failed to initialize arm"}, 500

@app.route("/position")
@cross_origin()
def current_arm_position():
    global arm
    global arm_status
    if arm_status:
        return { 
            "positions": arm.positions.tolist(),
            "angles": arm.angles.tolist()
        }, 200
    else:
        return {"error": "Arm has not been initialized"}, 400

@app.route("/control/<joint>/<delta>")
@cross_origin()
def control(joint, delta):
    global arm
    global arm_status
    if arm_status:
        if arm.change_angle(joint, delta):
            return "", 200
        else:
            return {"error": "Violated joint constraints"}, 400
    else:
        return {"error": "Arm has not been initialized"}, 400

@app.route("/moveto", methods = ["POST"])
@cross_origin()
def moveto():
    target = request.args.get("target")
    if target is None:
        return {"error": "No target provided"}, 400
    global arm
    global arm_status
    if arm_status:
        arm.move_to(target)
        return "", 200
    else:
        return {"error": "Arm has not been initialized"}, 400

if __name__ == "__main__":
    app.run

