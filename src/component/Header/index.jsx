import React from "react";
import "./styles.scss";

const Header = ({ onLogout }) => {
  return (
    <div className="header-wrapper">
      <div className="header-text">
        Sound Mixer
        <div>
          <img src="/sound-mixer.png" alt="logo" width="40px" />
        </div>
      </div>
      <div className="logout-wrapper">
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
