const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const bridgePort = 3001;
let bridgeProcess;

function waitForBridge() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      const request = http.get(`http://127.0.0.1:${bridgePort}/api/pc/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) resolve();
        else retry();
      });
      request.on("error", retry);
      request.setTimeout(1000, () => request.destroy());
    };
    const retry = () => {
      if (Date.now() - startedAt > 15000) reject(new Error("Luccy AI bridge did not start."));
      else setTimeout(check, 250);
    };
    check();
  });
}

function startBridge() {
  const serverPath = path.join(__dirname, "..", "server-build", "server.js");
  bridgeProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", PORT: String(bridgePort) },
    stdio: "ignore",
    windowsHide: true,
  });
  bridgeProcess.once("error", (error) => console.error("Bridge process error:", error));
}

async function createWindow() {
  startBridge();
  await waitForBridge();

  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#07111f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await window.loadURL(`http://127.0.0.1:${bridgePort}`);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:") || url.startsWith("tel:") || url.startsWith("skype:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

app.whenReady().then(() => createWindow().catch((error) => {
  console.error(error);
  app.quit();
}));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (bridgeProcess && !bridgeProcess.killed) bridgeProcess.kill();
});