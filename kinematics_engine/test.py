import time
import numpy as np
# import kinematics_2D
from kinematics import Arm

def test_jt():
    arm = Arm(
        np.array([ 0.,   4.,  3.,  2., 1.]),
        np.array([45., -90., 45., 20., 0.]),
        np.array([[0, 180],
                  [-120, 120],
                  [-120, 120],
                  [-120, 120],
                  [0, 0]]))
    arm.plot("plots/testjt0.png")
    target = np.array((6., 6.))
    arm.inverse_kinematics_jt(target)
    arm.plot("plots/testjt1.png")
    target = np.array((1., 8.))
    arm.inverse_kinematics_jt(target)
    arm.plot("plots/testjt2.png")
    target = np.array((5.3, 2.1))
    arm.inverse_kinematics_jt(target)
    arm.plot("plots/testjt3.png")
    target = np.array((-6, 3))
    arm.inverse_kinematics_jt(target)
    arm.plot("plots/testjt4.png")

def test_jpi():
    arm = Arm(
        np.array([ 0.,   4.,  3.,  2., 1.]),
        np.array([45., -90., 45., 20., 0.]),
        np.array([[0, 180],
                  [-120, 120],
                  [-120, 120],
                  [-120, 120],
                  [0, 0]]))
    arm.plot("plots/testjpi0.png")
    target = np.array((6., 6.))
    arm.inverse_kinematics_jpi(target)
    arm.plot("plots/testjpi1.png")
    target = np.array((1., 8.))
    arm.inverse_kinematics_jpi(target)
    arm.plot("plots/testjpi2.png")
    target = np.array((5.3, 2.1))
    arm.inverse_kinematics_jpi(target)
    arm.plot("plots/testjpi3.png")
    target = np.array((-6, 3))
    arm.inverse_kinematics_jpi(target)
    arm.plot("plots/testjpi4.png")

def test_sgd():
    arm = Arm(
        np.array([ 0.,   4.,  3.,  2., 1.]),
        np.array([45., -90., 45., 20., 0.]),
        np.array([[0, 180],
                  [-120, 120],
                  [-120, 120],
                  [-120, 120],
                  [0, 0]]))
    arm.plot("plots/testsgd0.png")
    target = np.array((6., 6.))
    arm.inverse_kinematics_sgd(target)
    arm.plot("plots/testsgd1.png")
    target = np.array((1., 8.))
    arm.inverse_kinematics_sgd(target)
    arm.plot("plots/testsgd2.png")
    target = np.array((5.3, 2.1))
    arm.inverse_kinematics_sgd(target)
    arm.plot("plots/testsgd3.png")
    target = np.array((-6, 3))
    arm.inverse_kinematics_sgd(target)
    arm.plot("plots/testsgd4.png")

def test_fabrik():
    arm = Arm(
        np.array([ 0.,   4.,  3.,  2., 1.]),
        np.array([45., -90., 45., 20., 0.]),
        np.array([[0, 180],
                  [-120, 120],
                  [-120, 120],
                  [-120, 120],
                  [0, 0]]))
    arm.plot("plots/testfabrik0.png")
    target = np.array((6., 6.))
    arm.inverse_kinematics_fabrik(target)
    arm.plot("plots/testfabrik1.png")
    target = np.array((1., 8.))
    arm.inverse_kinematics_fabrik(target)
    arm.plot("plots/testfabrik2.png")
    target = np.array((5.3, 2.1))
    arm.inverse_kinematics_fabrik(target)
    arm.plot("plots/testfabrik3.png")
    target = np.array((-6, 3))
    arm.inverse_kinematics_fabrik(target)
    arm.plot("plots/testfabrik4.png")

if __name__ == "__main__":
    start = time.time()
    test_sgd()
    print("SGD: ", time.time() - start)
    start = time.time()
    test_jt()
    print("Jacobian Transpose: ", time.time() - start)
    start = time.time()
    test_jpi()
    print("Jacobian Pseudoinverse: ", time.time() - start)
    start = time.time()
    test_fabrik()
    print("FABRIK: ", time.time() - start)