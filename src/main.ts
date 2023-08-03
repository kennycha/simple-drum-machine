import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DrumCell from "./DrumCell";
import { COLORS } from "./constant";
import DrumMachine from "./DrumMachine";

const DRUM_SOUND_FILE_NAMES = [
  "drum-fx-01.mp3",
  "drum-fx-02.mp3",
  "drum-hh-01.mp3",
  "drum-hh-02.mp3",
  "drum-kd-01.mp3",
  "drum-kd-02.mp3",
  "drum-oh-01.mp3",
  "drum-oh-02.mp3",
  "drum-perc-01.mp3",
  "drum-perc-02.mp3",
  "drum-sd-01.mp3",
  "drum-sd-02.mp3",
];

interface DrumCellMap {
  [key: string]: DrumCell;
}

const audioContext = new AudioContext();
let isInitialized = false;

const getAudioBufferByFileName = async (context: BaseAudioContext, fileName: string) => {
  const res = await fetch(`/assets/sounds/${fileName}`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  return audioBuffer;
};

const buildMainBus = async (context: BaseAudioContext) => {
  const compressor = new DynamicsCompressorNode(context);
  const irBuffer = await getAudioBufferByFileName(context, "ir-hall.mp3");
  const convolver = new ConvolverNode(context, { buffer: irBuffer });
  const reverbGain = new GainNode(context, { gain: 0.25 });

  compressor.connect(context.destination);
  convolver.connect(reverbGain).connect(context.destination);
  compressor.connect(convolver);

  return compressor;
};

const buildDrumCellMap = async (outputNode: AudioNode) => {
  const drumCellMap: DrumCellMap = {};
  for (const fileName of DRUM_SOUND_FILE_NAMES) {
    const audioBuffer = await getAudioBufferByFileName(outputNode.context, fileName);
    drumCellMap[fileName] = new DrumCell(outputNode, audioBuffer);
  }

  return drumCellMap;
};

const bindKeyToDrumCellMap = (drumCellMap: DrumCellMap) => {
  const keys = "qwerasdfzxcv".split("");
  const drumCells = Object.values(drumCellMap);
  const keyToDrumCellMap: { [key: string]: DrumCell } = {};
  for (let i = 0; i < drumCells.length; i += 1) {
    keyToDrumCellMap[keys[i]] = drumCells[i];
  }

  window.addEventListener("keydown", (event) => {
    if (event.key in keyToDrumCellMap) {
      keyToDrumCellMap[event.key].playSample();
    }
  });
};

const initializeDrumMachine = async () => {
  const mainBus = await buildMainBus(audioContext);
  const drumCellMap = await buildDrumCellMap(mainBus);
  bindKeyToDrumCellMap(drumCellMap);
  isInitialized = true;
};

const onWindowLoad = () => {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const app = document.querySelector("#app");
  if (!app) return;
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.scene);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 22, 5);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.maxPolarAngle = Math.PI / 6;

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 3, 1);
  directionalLight.castShadow = true;
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemisphereLight.position.set(1, 3, 1);
  hemisphereLight.castShadow = true;
  scene.add(directionalLight, hemisphereLight);

  const drumMachine = new DrumMachine();
  controls.target = drumMachine.mesh.position.clone();
  scene.add(drumMachine.mesh);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const draw = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(draw);
  };

  draw();

  const onPointerDown = async (event: PointerEvent) => {
    pointer.set((event.clientX / window.innerWidth - 0.5) * 2, -(event.clientY / window.innerHeight - 0.5) * 2);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && intersects[0].object.name === "PowerButton") {
      if (drumMachine.isOn) {
        audioContext.suspend();
      } else {
        if (isInitialized) {
          audioContext.resume();
        } else {
          await initializeDrumMachine();
          audioContext.resume();
        }
      }
      drumMachine.toggle();
    }
  };
  window.addEventListener("pointerdown", onPointerDown);

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", onWindowResize);
};

window.addEventListener("load", onWindowLoad);
