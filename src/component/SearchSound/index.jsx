import { useState } from "react";

import "./styles.scss";

const API_KEY = process.env.REACT_APP_FREESOUND_API_KEY;

const SearchSound = () => {
  const [searchSound, setSearchSound] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadDisabled, setDownloadDisabled] = useState(null);

  const freeSoundSearch = () => {
    setLoading(true);
    setResults([]);

    const apiUrl = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
      searchSound
    )}&fields=id,name,previews,duration&token=${API_KEY}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          setLoading(false);
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.results) {
          setResults(data.results);
        }
        setLoading(false);
      });
  };

  const downloadFreeSound = async (sound) => {
    // setDownloadDisabled(true);
    setDownloadDisabled(sound.id);
    const url = sound.previews["preview-lq-mp3"];
    try {
      // debugger
      const response = await fetch(url);
      const blob = await response.blob();
      createIndexedDB(sound.id, sound.name, blob);
      setDownloadDisabled(null);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const createIndexedDB = (id, name, blob) => {
    const request = indexedDB.open("DownloadedSound", 1);

    request.onupgradeneeded = (e) => {
      const freeSound = e.target.result;
      freeSound.createObjectStore("downloads", { keyPath: "id" });
    };

    request.onsuccess = (e) => {
      const freeSound = e.target.result;
      const freeSoundStore = freeSound.transaction("downloads", "readwrite");
      freeSoundStore.objectStore("downloads").put({
        id,
        name,
        blob,
      });

      freeSoundStore.oncomplete = () => alert(`${name} downloaded`);
      freeSoundStore.onerror = (err) => alert("Save failed", err);
    };
  };

  const formatDuration = (duration) => {
    const totalSeconds = Math.round(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")} s`;
  };

  return (
    <div className="outer-container">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search free sound"
          value={searchSound}
          onChange={(e) => setSearchSound(e.target.value)}
        />
        <button className="search-button" onClick={freeSoundSearch}>
          Search
        </button>
      </div>
      {loading && <span className="loader" />}
      {results.map((sound) => (
        <div className="sound-card" key={sound.id}>
          <p className="sound-name">{sound.name}</p>
          <p className="sound-duration">
            Duration: {formatDuration(sound.duration)}
          </p>
          {sound.previews?.["preview-lq-mp3"] && (
            <>
              <audio
                controls
                onPlay={(e) =>
                  document
                    .querySelectorAll("audio")
                    .forEach((a) => a !== e.target && a.pause())
                }
              >
                <source
                  src={sound.previews["preview-lq-mp3"]}
                  type="audio/mp3"
                />
              </audio>

              {downloadDisabled === sound.id ? (
                <span className="loader" />
              ) : (
                <button
                  className="download-button"
                  onClick={() => downloadFreeSound(sound)}
                >
                  Download
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchSound;
