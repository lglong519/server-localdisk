
function request (config) {
	config = merge(config);
	let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('microsoft.XMLHTTP'),
		isPost = (/post/i).test(config.type);
	config.data = jsonToStr(config.data);
	isPost || (
		config.url += `${(config.url.indexOf('?') > -1 ? '&' : '?') + (config.cache ? '' : `${new Date().getTime()}=1`)}&${config.data}`
	);
	xhr.open(config.type, config.url, config.async);
	isPost
		&& xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
	typeof config.beforeSend == 'function'
		&& config.beforeSend();
	xhr.send(config.data);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (typeof config.complete == 'function') {
				config.complete(xhr.status, xhr);
			}
			if (typeof config.success == 'function') {
				if (config.dataType.toLowerCase() == 'json') {
					let data = [];
					try {
						data = eval(`(${xhr.responseText})`);
					} catch (e) {
						console.error('返回数据错误');
					}
					config.success(data, xhr);
					return;
				}
				config.success(xhr.responseText, xhr);
			}
		}
	};
}

function jsonToStr (data) {
	let str = '';
	for (let i in data) {
		str += `${i}=${data[i]}&`;
	}
	return str.replace(/&+$/, '');
}
function merge (ini) {
	let config = {
		type: 'get',
		url: '',
		async: true,
		cache: false,
		data: {},
		dataType: '',
		success () {},
		beforeSend () {},
		complete () {}
	};
	ini = ini || {};
	for (let i in config) {
		config[i] = typeof ini[i] === 'undefined' ? config[i] : ini[i];
	}
	return config;
}
