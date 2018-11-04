import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import { toast } from "bulma-toast";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.register({
  onUpdate: registration => {
    showToast(() => {
      console.warn("RELOADING NOW!");
      registration.waiting.postMessage("skipWaiting");
      window.location.reload(true);
    });
  }
});

// setTimeout(() => {
//   showToast(() => {
//     console.warn("RELOAD NOW!");
//   });
// }, 2000);

function showToast(callback) {
  const a = document.createElement("a");
  a.onclick = function(event) {
    event.preventDefault();
    callback();
  };
  a.text = "New version available. Click to reload.";
  a.href = "/";
  toast({
    message: a,
    type: "is-info",
    dismissible: false,
    closeOnClick: true,
    duration: 10000
  });
}
