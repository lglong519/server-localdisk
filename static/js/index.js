let upload = document.getElementById('upload');
let reset = document.getElementById('reset');
let fileName = document.getElementById('fileName');
let confirmBtn = document.getElementById('confirm');
let upform = document.getElementById('upform');
let newFolder = document.getElementById('newFolder');
let newFile = document.getElementById('newFile');
let { value: requestUrl } = document.getElementById('requestUrl');
let toast = document.getElementById('toast');
let processing = document.getElementById('processing');
let cancel = document.getElementById('cancel');
let deleteFile = document.getElementById('deleteFile');
let renameFile = document.getElementById('renameFile');
let crud = document.getElementById('crud');
let qrcode = document.getElementById('qrcode');
let qrcodeSmall = document.getElementById('qrcodeSmall');
let download = document.getElementById('download');
let sort = document.getElementById('sort');
let more = document.getElementById('more');
let loadEffect = document.getElementById('loadEffect');
let resStatus = -1;

let client = localStorage.getItem('client');
if (!client) {
	client = new Date().getTime();
	localStorage.setItem('client', client);
}

window.onload = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	if (!upload.files.length) {
		disable(confirmBtn, reset);
	}
	autoHook();
	let shareUrl = location.href;
	if (shareUrl.includes('?')) {
		shareUrl = shareUrl.replace(/\?(client=(\d*)&?)?/i, `?client=${client}&`);
	} else {
		shareUrl += `?client=${client}`;
	}
	new QRCode(qrcode, {
		text: shareUrl,
		width: 220,
		height: 220,
		colorDark: '#272F45',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.L
	});
	scanResponse();
	let params = location.href.match(/(\?|&)sort=(-)?(type|name|mtime|size)&?/);
	if (params) {
		let dir = params[2] ? '' : '-';
		document.querySelector('.sort .active').className = '';
		let a = document.getElementById(`sort${params[3]}`);
		a.parentNode.className = 'active';
		a.href = `?sort=${dir}${params[3]}`;
		if (!dir) {
			more.src = more.src.replace('asc', 'desc');
		}
	} else {
		document.getElementById('sortname').className = 'active';
	}
};
upload.onchange = function () {
	let filename = ' ';
	for (let i = 0; i < this.files.length; i++) {
		filename += `${this.files[i].name}<br>`;
		console.log(this.files[i].name);
	}
	fileName.innerHTML = filename;
	if (this.files.length) {
		enable(reset, confirmBtn);
	} else {
		disable(confirmBtn, reset);
	}
};
reset.onclick = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	disable(reset, confirmBtn);
};
confirmBtn.onclick = function () {
	disable(this);
	if (upload.files.length) {
		loadEffect.className += ' loading';
		upform.submit();
		// disable(upload, reset);
	}
};

function disable (...rest) {
	rest.forEach(elem => {
		elem.className += ' disabled';
		elem.disabled = true;
	});
}
function enable (...rest) {
	rest.forEach(elem => {
		elem.className = elem.className.replace(/disabled/g, '');
		elem.disabled = false;
	});

}

// request
newFolder.onclick = function () {
	let folderName = prompt('文件夹名称') || '';
	folderName = folderName.replace(/\s*/g, '');
	if (folderName) {
		request({
			type: 'post',
			url: `${requestUrl}/file/new-folder`,
			async: true,
			cache: false,
			data: {
				folderName
			},
			dataType: 'json',
			success (res) {
				processResult(res);
			},
		});
	}
};
newFile.onclick = function () {
	let checked = document.querySelector('.checked');
	let fileName;
	let content;
	let api = 'new-file';
	let method = 'POST';
	if (checked) {
		fileName = checked.parentNode.parentNode.querySelector('.file-name').innerHTML;
	}
	if (fileName) {
		api = 'append';
		method = 'PUT';
		content = prompt(`将写入文件：${fileName}，\n请输入写入的内容`) || '';
	} else {
		content = prompt('写入的内容') || '';
	}
	content = content.replace(/^\s*|\s*$/g, '');
	if (content) {
		request({
			type: method,
			url: `${requestUrl}/file/${api}`,
			async: true,
			cache: true,
			data: {
				content,
				fileName
			},
			dataType: 'json',
			success (res) {
				processResult(res, '写入成功');
			},
		});
	}
};

/**
 * @description 接收文件上传进度
 */
window.socket.on('processing', data => {
	processing.className = 'display';
	processing.innerHTML = data.percentage;
	qrcodeSmall.style.opacity = 0;
	if (data.percentage == '100%') {
		setTimeout(() => {
			processing.className = '';
			qrcodeSmall.style.opacity = 1;
		}, 200);
	}
});

/**
 * @description 接收二维码被扫描后的信息，显示成功图标，隐藏二维码
 */
window.socket.on(client, data => {
	if (data.status === 'success') {
		let mask = document.querySelector('.mask');
		mask.className = 'mask display';
		setTimeout(() => {
			mask.className = 'mask';
			hideQrcode();
		}, 1800);
	}
});

document.querySelector('.files').onclick = function (event) {
	event || (event = window.event);
	let src = event.target || event.srcElement;
	if (src.className.includes('check-box')) {
		src = src.children[0];
	}
	if (src.className.includes('check-btn')) {
		event.stopPropagation();
		if (src.className.includes('checked')) {
			src.className = 'check-btn';
			return false;
		}
		checkNone();
		src.className += ' checked';
		return false;
	}

};

cancel.onclick = checkNone;

function checkNone () {
	let ckecked = document.querySelectorAll('.checked');
	for (let i of ckecked) {
		i.className = i.className.replace('checked', '');
	}
}

deleteFile.onclick = function () {
	let checked = document.querySelector('.checked');
	if (!checked) {
		return;
	}
	let file = checked.parentNode.parentNode.querySelector('.file-name').innerHTML;

	let cf = confirm(`Delete File: ${file} ?`);
	if (cf) {
		request({
			type: 'delete',
			url: `${requestUrl}/file/delete`,
			async: true,
			cache: false,
			data: {
				fileName: file
			},
			dataType: 'json',
			success (res) {
				processResult(res, '删除成功');
			},
			complete (status) {
				resStatus = status;
			}
		});
	}
};

renameFile.onclick = function () {
	let checked = document.querySelector('.checked');
	if (!checked) {
		return;
	}
	let oldName = checked.parentNode.parentNode.querySelector('.file-name').innerHTML;
	let newName = prompt('新的名称', oldName) || '';
	newName = newName.replace(/\s*/g, '');
	if (newName && oldName != newName) {
		request({
			type: 'PATCH',
			url: `${requestUrl}/file/rename`,
			async: true,
			cache: false,
			data: {
				oldName,
				newName
			},
			dataType: 'json',
			success (res) {
				processResult(res, '修改成功');
			},
			complete (status) {
				resStatus = status;
			}
		});
	}
};

window.onresize = window.onscroll = autoHook;
function autoHook () {
	let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop, window.scrollY);
	if (scrollTop > 91) {
		if (!crud.className.includes('p-fixed')) {
			crud.className += ' p-fixed';
		}
	} else {
		crud.className = crud.className.replace('p-fixed', '');
	}
}

document.body.onclick = hideQrcode;
function hideQrcode () {
	sort.style.display = 'none';
	qrcode.className = 'qrcode';
	setTimeout(() => {
		qrcode.style.display = 'none';
	}, 600);
}

/**
 * @description 显示二维码
 */
qrcodeSmall.onclick = function () {
	qrcode.style.display = 'block';
	setTimeout(() => {
		qrcode.className += ' display';
	}, 10);
	event.stopPropagation();
};

toast.onclick = function () {
	if ((/show-toast/).test(this.className)) {
		this.className = 'toast hide-toast';
		setTimeout(() => {
			this.className = 'toast';
		}, 500);
	}
	if (resStatus == 401) {
		resStatus = -1;
		let password = (prompt('密码', 'password') || '').replace(/\s/g, '');
		if (password) {
			request({
				type: 'POST',
				url: `${requestUrl}/session`,
				async: true,
				cache: false,
				data: {
					password
				},
				dataType: 'json',
				success (res) {
					processResult(res, '登录成功');
				},
			});
		} else {
			alert('密码无效');
		}
	}
};

function processResult (res, message = '创建成功') {
	if (res.status === 'success') {
		toast.innerHTML = message;
		setTimeout(() => {
			location.reload();
		}, 1000);
	} else {
		toast.innerHTML = `操作失败：${JSON.stringify(res)}`;
		console.error(res);
	}
	toast.className += ' show-toast';
}

download.onclick = function () {
	let checked = document.querySelector('.checked');
	if (!checked) {
		return;
	}
	let anchor = checked.parentNode.parentNode;
	if (anchor.target === '_blank') {
		anchor.setAttribute('download', '');
		anchor.click();
		anchor.removeAttribute('download');
	}
	if (anchor.target === '_self') {
		let folderName = anchor.querySelector('.file-name').innerHTML;
		request({
			type: 'POST',
			url: `${requestUrl}/folder/download`,
			async: true,
			cache: false,
			data: {
				folderName
			},
			dataType: 'json',
			success (res) {
				if (res.status === 'success') {
					let uri = `${requestUrl}/${res.zip}`;
					let downloadLink = document.createElement('a');
					downloadLink.href = uri;
					downloadLink.download = `${folderName}.zip`;
					document.body.appendChild(downloadLink);
					downloadLink.click();
					document.body.removeChild(downloadLink);
				}
			},
		});
	}
};

/**
 * @description 扫码成功向服务器响应
 */
function scanResponse () {
	let reg = /client=([^&]+)/;
	let getClient = location.href.match(reg);
	if (getClient) {
		window.socket.emit('scanresponse', { client: getClient[1] });
		window.history.pushState({}, 0, location.href.replace(reg, ''));
	}
}

window.socket.on('broadcastReceiver', msg => {
	if (msg.status === 'resolved') {
		location.reload();
	} else {
		console.error(msg);
	}
});

const restart = () => {
	let code = prompt('认证码') || '';
	code = code.replace(/\s*/g, '');
	if (code) {
		window.socket.emit('broadcast', { code });
	}
};

more.onclick = () => {
	if (getComputedStyle(sort).display == 'none') {
		sort.style.display = 'inline-block';
		event.stopPropagation();
	}
};

document.ondragover = function (e) {
	e.preventDefault();
	return false;
};

document.ondrop = function (e) {
	upload.files = e.dataTransfer.files;
	e.preventDefault();
	return false;
};
