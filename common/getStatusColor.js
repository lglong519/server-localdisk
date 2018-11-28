module.exports = statusCode => statusCode >= 500 ? 31 // red
	: statusCode >= 400 ? 33 // yellow
		: statusCode >= 300 ? 35 // magenta
			: statusCode >= 200 ? 36 // cyan
				: 0; // no color
