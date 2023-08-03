import * as THREE from "three";
import { COLORS } from "./constant";

const SIZE = {
  width: 4,
  height: 3,
  depth: 1,
  radius: 0.1,
};

class DrumButton {
  mesh: THREE.Mesh;
  bindedKey: string;

  constructor(key: string) {
    this.bindedKey = key;

    const { width, height, depth, radius } = SIZE;

    const x = width / 2 - radius;
    const y = height / 2 - radius;
    const shape = new THREE.Shape();
    shape
      .absarc(x, y, radius, Math.PI / 2, 0, true)
      .lineTo(x + radius, -y)
      .absarc(x, -y, radius, 0, -Math.PI / 2, true)
      .lineTo(-x, -(y + radius))
      .absarc(-x, -y, radius, -Math.PI / 2, Math.PI, true)
      .lineTo(-(x + radius), y)
      .absarc(-x, y, radius, Math.PI, Math.PI / 2, true);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelThickness: 0.3,
    });
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.drumButtonOff,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    this.mesh = mesh;
  }
}

export default DrumButton;
