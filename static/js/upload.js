let upload = document.getElementById('upload');
let reset = document.getElementById('reset');
let fileName = document.getElementById('fileName');
let confirm = document.getElementById('confirm');
let upform = document.getElementById('upform');
let newFolder = document.getElementById('newFolder');
let newFile = document.getElementById('newFile');
let { value: requestUrl } = document.getElementById('requestUrl');
let toast = document.getElementById('toast');
let processing = document.getElementById('processing');

window.onload = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	if (!upload.files.length) {
		disable(confirm, reset);
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
		enable(reset, confirm);
	} else {
		disable(confirm, reset);
	}
};
reset.onclick = function () {
	upload.value = null;
	fileName.innerHTML = '无';
	disable(reset, confirm);
};
confirm.onclick = function () {
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
