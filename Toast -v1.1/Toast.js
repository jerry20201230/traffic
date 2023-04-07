/**
  Toast.js
 * @version 1.1

*/
var Toast = {},
    isactive = true,
    displaytime = 1500,
    iconctrl = 0

var icon = new Array(1);
//icon[1]:error-icon
    icon[0] = '';
    icon[1] = '<svg style="color: #dc3545 !important; float:left; max-width:1em; max-height:1em;margin-top: 5px;margin-left: 2px;" xmlns="http://www.w3.org/2000/svg"  fill="currentColor"class="bi bi-x-circle-fill " viewBox="0 0 16 16" title="發生錯誤"><path title="發生錯誤"d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" /> </svg>';
Toast.toast = function (msg,time) {

    if (isactive) {
        console.log('Toast訊息已開啟，顯示訊息:' + msg);
        let active = "toast-active";

        let div = document.createElement("div");
        div.classList.add("toast-container")
        div.innerHTML = `<div class="toast-message-container">${icon[iconctrl]}${msg}</div>`
        div.addEventListener("webkitTransitionEnd", function () {
            div.classList.contains(active) || div.parentNode.removeChild(div)
        });
        document.body.appendChild(div)
        div.offsetHeight
        div.classList.add(active);

        setTimeout(function () {
            div.classList.remove(active)
        }, time)
    } else {
        console.warn('Toast訊息已關閉，封鎖的訊息:' + msg);
    }
}
//////////////

Toast.setactive = function (bool) {
    if (bool === 'true') {
        isactive = true;
        console.log('Toast訊息已開啟');
    } else
        if (bool === 'false') {
            isactive = false;
            console.warn('Toast訊息已關閉!');
        }
}

Toast.isactive = function () {
    return isactive;
}

//////////////
Toast.settimeout = function (time) {

  console.error("無法再使用此功能，請改用 Toast.toast('msg',timeout)")



}
Toast.gettimeout = function () {
 
    console.error("無法再使用此功能，請改用 Toast.toast('msg',timeout)")
}
//////////////
Toast.seticon = function(_icon){
    if(_icon == 'none'||_icon == 0 ||_icon =='x'){
        iconctrl = 0;
        console.log('Toast icon 已變更為 沒有icon');
    }
  if(_icon == 'error'||_icon =='err' ||_icon =='error-icon'||_icon == 1){
      iconctrl = 1;
      console.log('Toast icon 已變更為 error-icon');
  }

}
Toast.geticon = function(){
if(iconctrl == 0){
    return 'no_icon';
}else
if(iconctrl == 1){
    return 'error-icon';
}
}
//////////////