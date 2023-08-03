class DrumCell {
  private context: BaseAudioContext;
  private buffer: AudioBuffer;
  private outputNode: AudioNode;

  constructor(outputNode: AudioNode, audioBuffer: AudioBuffer) {
    this.context = outputNode.context;
    this.outputNode = outputNode;
    this.buffer = audioBuffer;
  }

  playSample() {
    const bufferSource = new AudioBufferSourceNode(this.context, { buffer: this.buffer });
    const amp = new GainNode(this.context);
    bufferSource.connect(amp).connect(this.outputNode);
    bufferSource.start();
  }
}

export default DrumCell;
