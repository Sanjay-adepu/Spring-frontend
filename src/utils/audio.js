import { saveAs } from 'file-saver'; // Import FileSaver.js

class VoiceSynthesizer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
    this.recorder = null;
    this.chunks = [];
    this.voice = null;
    this.pitch = 1; // Default pitch
    this.volume = 1; // Default volume
    this.rate = 1; // Default rate (speed)
  }

  // Set up SpeechSynthesis voice
  setVoice(voiceName = 'Google Hindi') {
    const voices = this.synth.getVoices();
    this.voice = voices.find(voice => voice.name.toLowerCase().includes(voiceName.toLowerCase())) || voices[0];
  }

  // Set pitch
  setPitch(pitch) {
    this.pitch = pitch;
  }

  // Set volume
  setVolume(volume) {
    this.volume = volume;
  }

  // Set speech rate (speed)
  setRate(rate) {
    this.rate = rate;
  }

  // Speak text with speech synthesis and record audio
  speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    utterance.rate = this.rate;

    // Connect speech synthesis to audio context
    const audioSource = this.audioContext.createMediaStreamDestination();
    const sourceNode = this.audioContext.createMediaStreamSource(audioSource.stream);

    // Route the audio stream for recording
    sourceNode.connect(this.mediaStreamDestination);

    // Start recording
    this.startRecording(this.mediaStreamDestination.stream);

    // Stop recording when speech ends
    utterance.onend = () => {
      this.stopRecording();
    };

    // Speak the text
    this.synth.speak(utterance);
  }

  // Start recording
  startRecording(stream) {
    try {
      this.recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.chunks = [];

      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.recorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });

        try {
          // Send the audio blob to the backend
          const formData = new FormData();
          formData.append('audio', blob, 'synthesized_voice.webm');

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
          alert('An error occurred while uploading the audio. Please try again.');
        }
      };

      this.recorder.start();
    } catch (error) {
      console.error('Error starting the recorder:', error);
    }
  }

  // Stop recording
  stopRecording() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  }

  // Stop speech
  stopSpeech() {
    this.synth.cancel();
    this.stopRecording();
  }
}

export default VoiceSynthesizer;
