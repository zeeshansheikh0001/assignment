import { useState } from "react";

import { LiveAudioVisualizer } from "react-audio-visualize";

import "./styles.scss";

const RecordSound = () => {
  const [voiceRecord, setVoiceRecord] = useState(null);
  const [voiceRecordUrl, setVoiceRecordUrl] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [saveSound, setSaveSound] = useState();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const voiceRecorder = new MediaRecorder(stream);
    let storeVoiceRecording = [];
    console.log("Data", voiceRecord);

    voiceRecorder.ondataavailable = (e) => {
      storeVoiceRecording.push(e.data);
    };

    voiceRecorder.start();
    setVoiceRecord(voiceRecorder);
    console.log("started", voiceRecorder);

    voiceRecorder.onstop = () => {
      const audioBlob = new Blob(storeVoiceRecording, { type: "audio/mp3" });
      const url = URL.createObjectURL(audioBlob);

      setVoiceRecordUrl(url);
      setSaveSound(audioBlob);
    };
  };

  const stopRecording = () => {
    if (voiceRecord) {
      voiceRecord.stop();
      voiceRecord.stream.getTracks().forEach((track) => track.stop());
      console.log("Recording stopped");
    } else {
      console.log("No recording in progress");
    }
  };

  const pauseRecording = () => {
    if (voiceRecord && voiceRecord.state === "recording") {
      voiceRecord.pause();
      setIsPaused(true);
    } else if (voiceRecord && voiceRecord.state === "paused") {
      voiceRecord.resume();
      setIsPaused(false);
    }
  };

  const createIndexedDB = () => {
    const request = indexedDB.open("VoiceRecordedSound", 1);
    // debugger
    request.onupgradeneeded = (e) => {
      const freeSound = e.target.result;
      freeSound.createObjectStore("voiceRecord", { keyPath: "id" });
    };

    request.onsuccess = (e) => {
      const freeSound = e.target.result;
      const freeSoundStore = freeSound.transaction("voiceRecord", "readwrite");
      const id = new Date().toISOString();
      const name = `Recording-${id}`;
      freeSoundStore.objectStore("voiceRecord").put({
        id,
        name,
        blob: saveSound,
      });

      freeSoundStore.oncomplete = () => alert(`${name} saved`);
      freeSoundStore.onerror = (err) => console.error("Save failed", err);
    };
  };

  return (
    <>
      <div className="voice-record">🎤 Voice Recorder</div>
      {voiceRecord && (
        <div className="live-audio-visualizer">
          <LiveAudioVisualizer
            mediaRecorder={voiceRecord}
            width={400}
            height={100}
          />
        </div>
      )}
      <div className="record-sound-container">
        <button
          className="record-button"
          onClick={startRecording}
          disabled={voiceRecord !== null && voiceRecord.state !== "inactive"}
        >
          🎙️ Record
        </button>
        <button
          className="record-button"
          onClick={pauseRecording}
          disabled={!voiceRecord || voiceRecord.state === "inactive"}
        >
          {isPaused ? "⏯️ Resume" : "⏸️ Pause"}
        </button>

        <button
          className="record-button"
          onClick={stopRecording}
          disabled={!voiceRecord || voiceRecord.state === "inactive"}
        >
          🟥 Stop
        </button>
      </div>

      {voiceRecordUrl && (
        <>
          <div className="audio-player">
            <audio controls>
              <source src={voiceRecordUrl} type="audio/mp3" />
            </audio>
          </div>
          <div className="save-sound">
            <button onClick={createIndexedDB}>Save Recording</button>
          </div>
        </>
      )}
    </>
  );
};

export default RecordSound;
