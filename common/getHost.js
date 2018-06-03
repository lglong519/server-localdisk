let interfaces = require('os').networkInterfaces();
let keys = Object.keys(interfaces);
module.exports = interfaces[keys[keys.length - 1]][0].address;
