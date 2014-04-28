// test script

function insertUI(event) {
  alert(event);
}

var insertListener = function(event){
  if(event.animationName == "composeInserted"){
    insertUI();
  }
}

document.addEventListener("webkitAnimationStart", insertListener, false);

