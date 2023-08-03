import DrumCell from "./DrumCell";

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
};

const onWindowLoad = () => {
  const startButton = document.querySelector("#startButton") as HTMLButtonElement;
  startButton.disabled = false;
  startButton.addEventListener(
    "click",
    async () => {
      await initializeDrumMachine();
      audioContext.resume();
      startButton.disabled = true;
      startButton.textContent = "loaded";
    },
    false
  );
};

window.addEventListener("load", onWindowLoad);
