module.exports.appMenuEdit = [
  {
    label: '撤销',
    role: 'undo'
  },
  {
    label: '重做',
    role: 'redo'
  },
  {
    type: 'separator'
  },
  {
    label: '剪切',
    role: 'cut'
  },
  {
    label: '复制',
    role: 'copy'
  },
  {
    label: '粘贴',
    role: 'paste'
  },
  {
    label: '删除',
    role: 'delete'
  },
  {
    type: 'separator'
  },
  {
    label: '全选',
    role: 'selectall'
  }
];
module.exports.appMenuTemplate = [
  {
    label: '文件',
    submenu: []
  },
  {
    label: '编辑',
    submenu: this.appMenuEdit,
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新',
        role: 'reload'
      },
      {
        label: '强制刷新',
        role: 'forcereload'
      },
      {
        label: '开发者工具',
        role: 'toggledevtools'
      },
      {
        label: '全选',
        type: 'separator'
      },
      {
        label: '实际大小',
        role: 'resetzoom'
      },
      {
        label: '放大',
        role: 'zoomin'
      },
      {
        label: '缩小',
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        label: '切换全屏',
        role: 'togglefullscreen'
      }
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '主页',
        click() { require('electron').shell.openExternal('http://jlcloud.cn/'); },
      },
      {
        label: '关于',
        role: 'about',
      }
    ]
  }
];