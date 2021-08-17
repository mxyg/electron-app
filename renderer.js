const { app, ipcRenderer, remote } = require('electron');
const { Menu, dialog } = remote;
const { appMenuEdit } = require('./appmenu.js');

let currentFile = null; //当前文档保存的路径
let isSaved = true;     //当前文档是否已保存
let txtEditor = document.getElementById('txtEditor'); //获得TextArea文本框的引用

document.title = "未命名"; //设置文档标题，影响窗口标题栏名称

//给文本框增加右键菜单
const contextMenuTemplate = appMenuEdit;
const contextMenu=Menu.buildFromTemplate(contextMenuTemplate);
txtEditor.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.popup(remote.getCurrentWindow());
});

//监控文本框内容是否改变
txtEditor.oninput = (e) => {
  if(isSaved) document.title += " *";
  isSaved = false;
};

//监听与主进程的通信
ipcRenderer.on('action', (event, arg, message) => {
  switch(arg){        
  case 'new': //新建文件
    askSaveIfNeed();
    currentFile = null;
    txtEditor.value = '';   
    document.title = "未命名";
    isSaved = true;
    break;
  case 'recentdocuments': //打开最近使用
    currentFile = message;
    const txtRead = readText(currentFile);
    txtEditor.value = txtRead;
    document.title = currentFile;
    isSaved = true;
    break;
  case 'open': //打开文件
    askSaveIfNeed();
    const files = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
      filters: [
        { name: "JSON", extensions: ['json'] }, 
        { name: 'All Files', extensions: ['*'] } ],
      properties: ['openFile']
    });
    if(files) {
      currentFile = files[0];
      ipcRenderer.sendSync('reqaction', 'addRecentDocument', currentFile);
      //ipcRenderer.postMessage('reqaction', currentFile, []);
      //app.addRecentDocument(currentFile);
      const txtRead = readText(currentFile);
      txtEditor.value = txtRead;
      document.title = currentFile;
      isSaved = true;
    };
    break;
  case 'save': //保存文件
    saveCurrentDoc();
    break;
  case 'exiting':
    askSaveIfNeed();
    ipcRenderer.sendSync('reqaction', 'exit');
    break;
  }
});

//读取文本文件
function readText(file){
  const fs = require('fs');
  return fs.readFileSync(file, 'utf8');
}
//保存文本内容到文件
function saveText(text, file){
  const fs = require('fs');
  fs.writeFileSync(file, text);
}

//保存当前文档
function saveCurrentDoc(){
  if(!currentFile){
    const file = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
      filters: [
        { name: "JSON", extensions: ['json'] }, 
        { name: 'All Files', extensions: ['*'] } 
      ]
    });
    if(file) currentFile = file;
  }
  if(currentFile){
    const txtSave = txtEditor.value;
    saveText(txtSave, currentFile);
    isSaved = true;
    document.title = currentFile;
  }
}

//如果需要保存，弹出保存对话框询问用户是否保存当前文档
function askSaveIfNeed(){
  if(isSaved) return;
  const response = dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    message: '是否保存当前文件?',
    type: 'question',
    buttons: [ '是', '否' ]
  });
  if(response == 0) saveCurrentDoc(); //点击Yes按钮后保存当前文档
}