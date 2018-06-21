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

window.onload = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	if (!upload.files.length) {
		disable(confirmBtn, reset);
	}
	autoHook();
	new QRCode(qrcode, requestUrl);
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

document.querySelector('.files').onclick = function () {
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

document.body.onclick = function () {
	qrcode.className = 'qrcode';
	setTimeout(() => {
		qrcode.style.display = 'none';
	}, 600);
};

qrcodeSmall.onclick = function () {
	qrcode.style.display = 'block';
	setTimeout(() => {
		qrcode.className += ' display';
	}, 10);
	event.stopPropagation();
	return false;
};

toast.onclick = function () {
	this.className = 'toast';
};

function processResult (res, message = '创建成功') {
	toast.style.display = 'inline-block';
	if (res.status === 'ok') {
		toast.innerHTML = message;
		setTimeout(() => {
			location.reload();
		}, 1000);
	} else {
		toast.innerHTML = JSON.stringify(res);
		console.error(res);
	}
	setTimeout(() => {
		toast.className += ' show';
	}, 100);
}
