import React, { useState, useEffect } from 'react';
import './App.css';
import VoiceSynthesizer from './utils/audio'; // Make sure to import VoiceSynthesizer

function App() {
  const [text, setText] = useState('');
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [synth, setSynth] = useState(new VoiceSynthesizer());
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Initialize the VoiceSynthesizer instance and load voices
    const synthInstance = new VoiceSynthesizer();
    setSynth(synthInstance);

    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices; // Update voices if they change
  }, []);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handlePitchChange = (event) => {
    const newPitch = parseFloat(event.target.value);
    setPitch(newPitch);
    synth.setPitch(newPitch);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    synth.setVolume(newVolume);
  };

  const handleRateChange = (event) => {
    const newRate = parseFloat(event.target.value);
    setRate(newRate);
    synth.setRate(newRate);
  };

  const handleVoiceSelection = (event) => {
    synth.setVoice(event.target.value);
  };

  const handleGenerateVoice = () => {
    if (text.trim()) {
      synth.speakText(text); // Synthesize and send the audio to the backend
    } else {
      alert('Please enter text to synthesize.');
    }
  };

  const handleStopVoice = () => {
    synth.stopSpeech();
  };

  return (
    <div className="App">
      <h1>Spring-Ai</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text here"
        rows="5"
        cols="40"
      />
      <div className="controls">
        <label>
          Pitch:
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
          />
          {pitch}
        </label>
        <label>
          Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
          {volume}
        </label>
        <label>
          Speed:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
          />
          {rate}
        </label>
        <label>
          Select Voice:
          <select onChange={handleVoiceSelection}>
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
        <div className="buttons">
          <button onClick={handleGenerateVoice}>Generate Voice</button>
          <button onClick={handleStopVoice}>Stop Voice</button>
        </div>
      </div>
    </div>
  );
}

export default App;