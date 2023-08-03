import * as THREE from "three";
import { COLORS } from "./constant";

const RADIUS = 1;

class PowerMonitor {
  mesh: THREE.Mesh;
  isOn = false;
  materials: { [key in "on" | "off"]: THREE.MeshStandardMaterial };

  constructor() {
    const geometry = new THREE.SphereGeometry(RADIUS, 32, 32);
    const offMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.powerMonitorOff,
      transparent: true,
      opacity: 0.9,
    });
    const onMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.powerMonitorOn,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometry, offMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    this.mesh = mesh;
    this.materials = {
      on: onMaterial,
      off: offMaterial,
    };
  }

  toggle() {
    if (this.isOn) {
      this.mesh.material = this.materials.off;
      this.isOn = false;
    } else {
      this.mesh.material = this.materials.on;
      this.isOn = true;
    }
  }
}

export default PowerMonitor;
