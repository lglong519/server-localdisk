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

window.onload = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	if (!upload.files.length) {
		disable(confirmBtn, reset);
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
				if (res.status === 'ok') {
					toast.style.display = 'block';
					setTimeout(() => {
						toast.className += ' show';
					}, 10);
					setTimeout(() => {
						location.reload();
					}, 1200);
				} else {
					console.error(res);
				}
			},
		});
	}
};
newFile.onclick = function () {
	let content = prompt('写入的内容') || '';
	content = content.replace(/\s*/g, '');
	if (content) {
		request({
			type: 'post',
			url: `${requestUrl}/file/new-file`,
			async: true,
			cache: false,
			data: {
				content
			},
			dataType: 'json',
			success (res) {
				if (res.status === 'ok') {
					toast.style.display = 'block';
					setTimeout(() => {
						toast.className += ' show';
					}, 100);
					setTimeout(() => {
						location.reload();
					}, 1200);
				} else {
					console.error(res);
				}
			},
		});
	}
};

window.socket.on('processing', data => {
	processing.className = 'display';
	processing.innerHTML = data.percentage;
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

	let cf = confirm(`Delete file:${file}?`);
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
				if (res.status === 'ok') {
					toast.innerHTML = '删除成功';
					toast.style.display = 'block';
					setTimeout(() => {
						toast.className += ' show';
					}, 10);
					setTimeout(() => {
						location.reload();
					}, 1200);
				} else {
					console.error(res);
				}
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
				if (res.status === 'ok') {
					toast.innerHTML = '修改成功';
					toast.style.display = 'block';
					setTimeout(() => {
						toast.className += ' show';
					}, 10);
					setTimeout(() => {
						location.reload();
					}, 1200);
				} else {
					console.error(res);
				}
			},
		});
	}
};
