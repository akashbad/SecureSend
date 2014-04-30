// test script

function insertUI() {
  var composeDivs = $(".n1tfz");
  //alert(composeDivs);
}

var insertListener = function(event){
  if(event.animationName == "composeInserted"){
    insertUI();
  }
}

document.addEventListener("webkitAnimationStart", insertListener, false);

