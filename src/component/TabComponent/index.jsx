import { useState } from "react";

import RecordSound from "../RecordSound";
import DownloadedSounds from "../DownloadedSound";
import SearchSound from "../SearchSound";

import "./styles.scss";

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState("search");

  const renderTabContent = () => {
    switch (activeTab) {
      case "search":
        return <SearchSound />;
      case "record":
        return <RecordSound />;
      case "downloaded":
        return <DownloadedSounds />;
      default:
        return null;
    }
  };

  return (
    <div className="tabs-container">
      <div className="tab-buttons">
        <button
          className={activeTab === "search" ? "active" : ""}
          onClick={() => setActiveTab("search")}
        >
          Search Sounds
        </button>
        <button
          className={activeTab === "record" ? "active" : ""}
          onClick={() => setActiveTab("record")}
        >
          Record Sounds
        </button>
        <button
          className={activeTab === "downloaded" ? "active" : ""}
          onClick={() => setActiveTab("downloaded")}
        >
          Downloaded Sounds
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default TabComponent;
