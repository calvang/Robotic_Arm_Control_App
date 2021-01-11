const { app, BrowserWindow, ipcMain } = require('electron')

const flask_server = "http://localhost:8080"

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    //   worldSafeExecuteJavaScript: true,
    //   contextIsolation: true
    }
  })

  //load the index.html from a url
  win.loadURL('http://localhost:3000');

  // Open the DevTools.
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('anything-asynchronous', (event, arg) => {
    // gets triggered by the async button defined in the App component
    console.log("async",arg) // prints "async ping"
    event.reply('asynchronous-reply', 'pong')
})

// gets triggered by the sync button defined in the App component
ipcMain.on("control", (event, arg) => {
    console.log("control",arg) 
    let joint = 1 // TODO: change these
    let delta = -10 // TODO: change these
    fetch(`${flask_server}/control/${joint}/${delta}`, { method: "GET" })
      .catch(error => {
        console.error(error)})
    event.returnValue = `recieved ${arg}`
    // event.returnValue = true
})

ipcMain.on("moveto", (event, arg) => {
  console.log("moveto", arg)
  fetch(`${flask_server}/moveto/${arg}`, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(arg)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)})
    .catch(error => {
      console.error(error)})
  event.returnValue = `moved to ${arg}`
})