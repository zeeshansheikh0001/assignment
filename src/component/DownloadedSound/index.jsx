import React, { useEffect, useState } from "react";

import * as wavEncoder from "wav-encoder";
import * as Tone from "tone";

import "./styles.scss";

const DownloadedSounds = () => {
  const [downloads, setDownloads] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [selectedDownload, setSelectedDownload] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [mixUrl, setMixUrl] = useState(null);

  useEffect(() => {
    const openIndexDB = (dbName, storeName, setState) => {
      indexedDB.databases().then((dbs) => {
        const isDownloaded = dbs.some((db) => db.name === dbName);
        if (isDownloaded) {
          const freeSoundStore = indexedDB.open(dbName,  1);
          freeSoundStore.onsuccess = (e) => {
            const freeSoundStoreDB = e.target.result;
            if (freeSoundStoreDB.objectStoreNames.contains(storeName)) {
              const store = freeSoundStoreDB
                .transaction(storeName, "readonly")
                .objectStore(storeName);
              store.getAll().onsuccess = (e) => setState(e.target.result);
            } else {
              setState([]);
            }
          };
        }
      });
    };

    openIndexDB("DownloadedSound",  "downloads", setDownloads);
    openIndexDB("VoiceRecordedSound", "voiceRecord", setRecordings);
  }, []);

  const mixAudio = async () => {
    const downloadURL = URL.createObjectURL(selectedDownload.blob);
    const recordURL = URL.createObjectURL(selectedRecording.blob);

    const downloaded = await new Promise((res) => {
      const buf = new Tone.ToneAudioBuffer(downloadURL, () => res(buf));
    });

    const recorded = await new Promise((res) => {
      const buf = new Tone.ToneAudioBuffer(recordURL, () => res(buf));
    });

    const duration = Math.max(downloaded.duration, recorded.duration);

    const mixed = await Tone.Offline(async ({ transport }) => {
      const download1 = new Tone.Player(downloaded).toDestination();
      const record1 = new Tone.Player(recorded).toDestination();

      download1.sync().start(0);
      record1.sync().start(0);

      transport.start();
    }, duration);

    const wav = await wavEncoder.encode({
      sampleRate: mixed.sampleRate,
      channelData: Array.from({ length: mixed.numberOfChannels }, (_, i) =>
        mixed.getChannelData(i)
      ),
    });

    const blob = new Blob([wav], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    setMixUrl(url);
  };

  return (
    <div className="downloaded-sounds-container">
      <div>
        <h2>Downloaded FreeSounds</h2>
        {downloads.length === 0 && <p>No downloaded sounds found.</p>}
        {downloads.map((sound) => (
          <div className="sound-container">
            <input
              type="radio"
              name="download"
              checked={selectedDownload && selectedDownload.id === sound.id}
              onChange={() => setSelectedDownload(sound)}
            />
            <div className="sound-card" key={sound.id}>
              <p className="sound-name">{sound.name}</p>
              <audio controls>
                <source
                  src={URL.createObjectURL(sound.blob)}
                  type="audio/mpeg"
                />
              </audio>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2>Voice Recorded Sounds</h2>
        {recordings.length === 0 && <p>No recorded sounds found.</p>}
        {recordings.map((sound) => (
          <div className="sound-container">
            <input
              type="radio"
              name="recording"
              checked={selectedRecording && selectedRecording.id === sound.id}
              onChange={() => setSelectedRecording(sound)}
            />
            <div className="sound-card" key={sound.id}>
              <p className="sound-name">{sound.name}</p>
              <audio controls>
                <source
                  src={URL.createObjectURL(sound.blob)}
                  type="audio/mpeg"
                />
              </audio>
            </div>
          </div>
        ))}
      </div>

      <div className="mixsound-container">
        <button
          className="mixsound-button"
          onClick={mixAudio}
          disabled={!selectedDownload || !selectedRecording}
        >
          Mix Sound
        </button>

        {mixUrl && (
          <div style={{ marginTop: "20px" }}>
            <audio controls src={mixUrl}></audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadedSounds;
