var upload = document.getElementById("upload");
var reset = document.getElementById("reset");
var fileName = document.getElementById("fileName");
window.onload = function () {
   upload.value = null;
   fileName.innerHTML = '无';
}
upload.onchange = function () {
   var filename = '<br>';
   for (var i = 0; i < this.files.length; i++) {
      filename += this.files[i].name + ";<br>";
      console.log(this.files[i].name);
   }
   fileName.innerHTML = filename;
}
reset.onclick = function () {
   upload.value = null;
   fileName.innerHTML = '无';
}
function checkVal() {
   if (upload.files.length) {
      return true;
   } else {
      return false;
   }
}