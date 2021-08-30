// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, ipcMain, remote, dialog } = require('electron');

const path = require('path')
const serve = require('electron-serve');

const loadURL = serve({directory: 'renderer'});

const { appMenuTemplate } = require('./appmenu.js');

require('electron-reload')(__dirname, {
  electron: require(path.join(__dirname, 'node_modules', 'electron')),
  hardResetMethod: 'exit'
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//是否可以安全退出
let safeExit = true;
let mainWindow;
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  // and load the index.html of the app.
  //mainWindow.loadFile('index.html');
  //loadURL(mainWindow);

	// The above is equivalent to this:
	mainWindow.loadURL('http://localhost:3000/');
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  //-----------------------------------------------------------------
  //增加主菜单（在开发测试时会有一个默认菜单，但打包后这个菜单是没有的，需要自己增加）
  const menu=Menu.buildFromTemplate(appMenuTemplate); //从模板创建主菜单

  menu.items[0].submenu.append(new MenuItem({
    label: '新建',
    click(){
      mainWindow.webContents.send('action', 'new');
    },
    accelerator: 'CmdorCtrl+n' 
  }));
  menu.items[0].submenu.append(new MenuItem({
    label: '打开',
    click(){
      const files = dialog.showOpenDialogSync(mainWindow, {
        filters: [
          { name: "JSON", extensions: ['json'] }, 
          { name: 'All Files', extensions: ['*'] } ],
        properties: ['openFile']
      });
      console.log(files);
      if(files) {
        currentFile = files[0];
        app.addRecentDocument(currentFile);
      };
      mainWindow.webContents.send('action', 'open'); //点击后向主页渲染进程发送“打开文件”的命令
    },
    accelerator: 'CmdorCtrl+o'
  }));
  menu.items[0].submenu.append(new MenuItem({
    label: '打开最近使用',
    role: 'recentdocuments',
    submenu: [
      {
        label: '清除最近使用',
        role: 'clearrecentdocuments'
      }
    ]
  }));
  menu.items[0].submenu.append(new MenuItem({
    label: '保存',
    click(){
      mainWindow.webContents.send('action', 'save');
    },
    accelerator: 'CmdorCtrl+s'
  }));
  //添加一个分隔符
  menu.items[0].submenu.append(new MenuItem({
    type: 'separator'
  }));
  //再添加一个名为Exit的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: '退出',
    role: 'quit'
  }));
  Menu.setApplicationMenu(menu); //注意：这个代码要放到菜单添加完成之后，否则会造成新增菜单的快捷键无效
  mainWindow.on('close', (e) => {
    app.quit();//退出程序
    if(!safeExit){
      e.preventDefault();
      mainWindow.webContents.send('action', 'exiting');
    }
  });
  //-----------------------------------------------------------------

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  //nodejs 服务
  new BrowserWindow({
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false,
    }
  }).loadFile(path.join(__dirname, 'src/server/index.html'));
  //主窗口
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    
  });
  app.on('open-file', function (event, path) {
    mainWindow.webContents.send('action', 'recentdocuments', path); 
  });

});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

//监听与渲染进程的通信
ipcMain.on('reqaction', (event, arg, message) => {
  switch(arg){
    case 'exit':
      //做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，这些数据需要使用其它的方式来保存和加载，这里就不作演示了。这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
      //...
      safeExit=true;
      app.quit();//退出程序
      break;
    case 'addRecentDocument':
      app.addRecentDocument(message);
      break;
  }
});

