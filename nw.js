let Service = require('node-windows').Service;

let svc = new Service({
	name: 'server_yun', // 服务名称
	description: '文件共享服务器', // 描述
	script: 'M:/Documents/git/server-localdisk' // nodejs项目要启动的文件路径
});

svc.on('install', () => {
	svc.start();
});

svc.install();
