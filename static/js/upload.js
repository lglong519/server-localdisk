let upload = document.getElementById('upload');
let reset = document.getElementById('reset');
let fileName = document.getElementById('fileName');
let confirm = document.getElementById('confirm');
let upform = document.getElementById('upform');

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
// form onsubmit 前检查上传的数据
