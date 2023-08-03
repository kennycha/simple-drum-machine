import * as THREE from "three";
import { COLORS } from "./constant";
import DrumButton from "./DrumButton";
import PowerMonitor from "./PowerMonitor";
import PowerButton from "./PowerButton";

const SIZE = {
  outerWidth: 28,
  outerHeight: 15,
  leftInnerWidth: 3,
  leftInnerHeight: 5.5,
  rightInnerWidth: 22,
  rightInnerHeight: 13,
  depth: 1,
  radius: 0.5,
};

class DrumMachine {
  mesh: THREE.Mesh;
  powerMonitor: PowerMonitor;
  powerButton: PowerButton;
  drumButtons: DrumButton[] = [];
  isOn = false;

  constructor() {
    const { outerWidth, leftInnerWidth, leftInnerHeight, rightInnerWidth, outerHeight, rightInnerHeight, radius } =
      SIZE;

    const outerX = outerWidth / 2 - radius;
    const outerY = outerHeight / 2 - radius;
    const outerShape = new THREE.Shape();
    outerShape
      .absarc(outerX, outerY, radius, Math.PI / 2, 0, true)
      .lineTo(outerX + radius, -outerY)
      .absarc(outerX, -outerY, radius, 0, -Math.PI / 2, true)
      .lineTo(-outerX, -(outerY + radius))
      .absarc(-outerX, -outerY, radius, -Math.PI / 2, Math.PI, true)
      .lineTo(-(outerX + radius), outerY)
      .absarc(-outerX, outerY, radius, Math.PI, Math.PI / 2, true);
    const outerGeometry = new THREE.ExtrudeGeometry(outerShape, {
      depth: SIZE.depth,
      bevelThickness: 0.5,
    });
    const outerMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.machineOuter,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(outerGeometry, outerMaterial);
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.machineInner,
      side: THREE.DoubleSide,
    });

    const leftInnerX = leftInnerWidth / 2 - radius;
    const leftInnerY = leftInnerHeight / 2 - radius;
    const leftInnerShape = new THREE.Shape([
      new THREE.Vector2(leftInnerX, leftInnerY),
      new THREE.Vector2(-leftInnerX, leftInnerY),
      new THREE.Vector2(-leftInnerX, -leftInnerY),
      new THREE.Vector2(leftInnerX, -leftInnerY),
    ]);
    const leftInnerGeometry = new THREE.ExtrudeGeometry(leftInnerShape, {
      depth: SIZE.depth,
      bevelThickness: 1,
    });
    const leftInner = new THREE.Mesh(leftInnerGeometry, innerMaterial);
    leftInner.position.x -= 11.5;
    leftInner.position.y -= 3.75;
    leftInner.position.z -= 0.5;
    mesh.add(leftInner);
    leftInner.receiveShadow = true;
    leftInner.castShadow = false;

    const powerMonitor = new PowerMonitor();
    powerMonitor.mesh.position.x -= 11.5;
    powerMonitor.mesh.position.y -= 4.75;
    powerMonitor.mesh.position.z -= 1;
    mesh.add(powerMonitor.mesh);
    this.powerMonitor = powerMonitor;

    const powerButton = new PowerButton();
    powerButton.mesh.position.x -= 11.5;
    powerButton.mesh.position.y -= 2.25;
    powerButton.mesh.position.z -= 1.5;
    mesh.add(powerButton.mesh);
    this.powerButton = powerButton;

    const rightInnerX = rightInnerWidth / 2 - radius;
    const rightInnerY = rightInnerHeight / 2 - radius;
    const rightInnerShape = new THREE.Shape([
      new THREE.Vector2(rightInnerX, rightInnerY),
      new THREE.Vector2(-rightInnerX, rightInnerY),
      new THREE.Vector2(-rightInnerX, -rightInnerY),
      new THREE.Vector2(rightInnerX, -rightInnerY),
    ]);
    const rightInnerGeometry = new THREE.ExtrudeGeometry(rightInnerShape, {
      depth: SIZE.depth,
      bevelThickness: 1,
    });
    const rightInner = new THREE.Mesh(rightInnerGeometry, innerMaterial);
    rightInner.position.x += 2;
    rightInner.position.z -= 0.5;
    mesh.add(rightInner);

    const keys = "qwerasdfzxcv".split("");
    keys.forEach((key, idx) => {
      const button = new DrumButton(key);
      button.mesh.position.x -= 5.5 - (idx % 4) * 5;
      button.mesh.position.y -= 4 - (idx % 3) * 4;
      button.mesh.position.z -= 1.5;
      this.drumButtons.push(button);
      mesh.add(button.mesh);
    });

    mesh.rotateX(Math.PI / 2);
    this.mesh = mesh;
  }

  toggle() {
    this.isOn = !this.isOn;
    this.powerButton.toggle();
    this.powerMonitor.toggle();
  }
}

export default DrumMachine;
