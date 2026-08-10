import React from "react";
import ReactDOM from "react-dom/client";
import { emit } from "@tauri-apps/api/event";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 首屏渲染完成（双 rAF 确保首帧已绘制）后通知 Rust 切换 splash → 主窗口
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    emit("main-ready").catch(() => {});
  });
});
