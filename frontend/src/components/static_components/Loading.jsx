import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  content: {
    texAlign: "center",
    fontSize: "20px",
    marginLeft: "10px",
    color: "#2E3238"
  }
};

// TODO: we need a new way to apply the above JSX CSS styles
const Loading = ({ text = "Loading", speed = 300 }) => {
  const [content, setContent] = useState(text);
  const stopper = text + "...";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setContent((prevContent) =>
        prevContent === stopper ? text : prevContent + "."
      );
    }, speed);

    return () => {
      window.clearInterval(interval);
    };
  }, [text, speed, stopper]);

  return (
    <div className="loading-container">
      <FontAwesomeIcon
        style={{ color: "#2E3238" }}
        icon="spinner"
        size="lg"
        pulse
      />
      <p style={styles.content}>{content}</p>
    </div>
  );
};

export default Loading;
