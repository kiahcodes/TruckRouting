import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import Typewriter from "typewriter-effect";

function Header({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ name: "User", role: "Manager" });
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo"));
    if (stored) {
      setUserInfo(stored);
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <img src="/truck-logo.png" alt="Logo" className="logo" />
        <div className="header-title">
        <h1>
          <Typewriter
            options={{
              strings: "Truck Routes",
              autoStart: true,
              loop: false,
              cursor: "",
            }}
          />
        </h1>
        </div>
      </div>
      <div className="header-center">
        <button
          className={`nav-btn ${currentPath === "/" ? "active" : ""}`}
          onClick={() => handleNavigation("/")}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${currentPath === "/DataEntry" ? "active" : ""}`}
          onClick={() => handleNavigation("/DataEntry")}
        >
          Customer List
        </button>
        <button
          className={`nav-btn ${
            currentPath === "/RoutesPlanning" ? "active" : ""
          }`}
          onClick={() => handleNavigation("/RoutesPlanning")}
        >
          Routes Planning
        </button>
        <button
          className={`nav-btn ${currentPath === "/ViewRoutes" ? "active" : ""}`}
          onClick={() => handleNavigation("/ViewRoutes")}
        >
          View Routes
        </button>
      </div>

      <div className="header-right">
        <div className="user-info" ref={dropdownRef}>
          <button
            className="user-dropdown-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {/* <img src="/user-icon.png" alt="User" className="user-avatar" /> */}
            <span>Hello, {userInfo.name}</span>
            <svg
              // class="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </button>
          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img src="/user-icon.png" alt="User" className="user-avatar" />
                <div className="user-details">
                  <span className="user-name">{userInfo.name}</span>
                  <span className="user-role">{userInfo.role}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <img
                    src="/profile-icon.png"
                    alt="Profile"
                    className="dropdown-icon"
                  />
                  Profile Settings
                </button>
                <button className="dropdown-item">
                  <img
                    src="/settings-icon.png"
                    alt="Settings"
                    className="dropdown-icon"
                  />
                  Account Settings
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={() => handleLogout()}
                >
                  <img
                    src="/logout-icon.png"
                    alt="Logout"
                    className="dropdown-icon"
                  />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
