/**
  Toast.js
 * @version 1.1

*/
var Toast = {

    isactive: true,
    displaytime: 1500,
    iconctrl: 0,
    icon: ["",'<svg style="color: #dc3545 !important; float:left; max-width:1em; max-height:1em;margin-top: 5px;margin-left: 2px;" xmlns="http://www.w3.org/2000/svg"  fill="currentColor"class="bi bi-x-circle-fill " viewBox="0 0 16 16" title="發生錯誤"><path title="發生錯誤"d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" /> </svg>'],

    toast : function (msg, time) {

        if (this.isactive) {
            
            let active = "toast-active";
    
            let div = document.createElement("div");
            div.classList.add("toast-container")
            div.innerHTML = `<div class="toast-message-container">${msg}</div>`
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
}
