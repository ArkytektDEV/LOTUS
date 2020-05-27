const {ipcRenderer} = require('electron');
let $ = require('jquery');

const version = document.getElementById('version');
const updateMsg = document.getElementById('updateMsg');



function setSize(){
    var window = remote.getCurrentWindow();
    window.focus();
    window.setResizable(false);
}


      ipcRenderer.send('app_version');
      ipcRenderer.on('app_version', (event, arg) => {
        ipcRenderer.removeAllListeners('app_version');
        version.innerText = ' Version ' + arg.version;
      });


      ipcRenderer.on('checking_for_update', () => {
        ipcRenderer.removeAllListeners('checking_for_update');
        updateMsg.innerText = 'CHECKING FOR UPDATES';
      });

      ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        updateMsg.innerText = 'UPDATE AVAILABLE!';
      });

      ipcRenderer.on('update_not_available', () => {
        ipcRenderer.removeAllListeners('update_not_available');
        updateMsg.innerText = '';
        window.location.href = '../HTML/dashboard.html';
      });

      ipcRenderer.on('download_progress', (event, message) => {
        updateMsg.innerText = message;
      });


ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  updateMsg.innerText = 'UPDATE SUCCESSFUL!';
  ipcRenderer.send('restart_app');
});
