import UnlockPage from "./unlock.jsx";
import Modal from "react-modal";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0)",
    zIndex: 9999,
  },
  content: {
    top: "0",
    right: "350px",
    bottom: "auto",
    left: "auto",
    padding: "0",
    border: "0",
    width: "400px",
    height: "600px",
    borderRadius: "none",
    boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
  },
};

Modal.setAppElement("#root")

export default function MetamaskModal(props) {
  return (
    <Modal
      style={customStyles}
      {...props}
    >
      <UnlockPage />
    </Modal>
  );
}
