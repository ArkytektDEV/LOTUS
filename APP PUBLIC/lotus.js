const { app, BrowserWindow, ipcMain} = require('electron')
const DiscordRPC = require('discord-rpc');
const config = require('./package.json');
const { autoUpdater } = require('electron-updater');

let win
const clientId = '676326859851563018';

// only needed for discord allowing spectate, join, ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !win) {
    return;
  }

  rpc.setActivity({
    details: `LOTUS DAW`,
    state: 'Version ' + config.version,
    startTimestamp,
    largeImageKey: 'lotus',
    largeImageText: 'Lotus DAW',
    smallImageKey: 'online',
    smallImageText: 'Online',
    instance: false,
  });
}

rpc.on('ready', () => {
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login({ clientId }).catch(console.error);

console.log(config.version);

function createWindow () {
  win = new BrowserWindow({
    width: 450,
    height: 350,
    icon: "PANEL/IMG/lotus.jpg",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  })

  win.loadFile('PANEL/HTML/load.html')

  win.on('closed', () => {
    win = null
  })

  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

autoUpdater.on('checking-for-update', () => {
  win.webContents.send('checking_for_update');
});

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});

autoUpdater.on('update-not-available', () => {
  win.webContents.send('update_not_available');
});

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});



autoUpdater.on('download-progress', (progressObj) => {
  let log_message = ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  win.webContents.send('download_progress', log_message);
})



ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
