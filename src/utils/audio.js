class VoiceSynthesizer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.recorder = null;
    this.chunks = [];
    this.voice = null;
    this.pitch = 1; // Default pitch
    this.volume = 1; // Default volume
    this.rate = 1; // Default rate (speed)
  }

  setVoice(voiceName = 'Google Hindi') {
    const voices = this.synth.getVoices();
    this.voice = voices.find(voice => voice.name.toLowerCase().includes(voiceName.toLowerCase())) || voices[0];
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  setRate(rate) {
    this.rate = rate;
  }

  speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    utterance.rate = this.rate;

    // Connect utterance to a MediaStreamDestination
    const mediaStreamDestination = this.audioContext.createMediaStreamDestination();

    // Start recording
    this.startRecording(mediaStreamDestination.stream);

    utterance.onend = () => {
      this.stopRecording();
    };

    this.synth.speak(utterance);
  }

  startRecording(stream) {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported('audio/webm')) {
      alert('Your browser does not support audio recording.');
      return;
    }

    this.recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    this.chunks = [];

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.onstop = async () => {
      const blob = new Blob(this.chunks, { type: 'audio/webm' });
      console.log('Blob size:', blob.size);

      if (blob.size > 0) {
        const formData = new FormData();
        formData.append('audio', blob, 'synthesized_voice.webm');

        try {
          const response = await fetch('http://localhost:5000/upload-audio', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (data.success) {
            alert(`Audio saved! Download your file from: ${data.downloadUrl}`);
          } else {
            alert('Error uploading audio');
          }
        } catch (error) {
          console.error('Error uploading audio:', error);
          alert('Error uploading audio');
        }
      } else {
        alert('Recording failed. Please try again.');
      }
    };

    this.recorder.start();
  }

  stopRecording() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  }

  stopSpeech() {
    this.synth.cancel();
    this.stopRecording();
  }
}

export default VoiceSynthesizer;
