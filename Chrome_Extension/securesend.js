function encrypt(event){
  $button = $(event.target);
}

function decrypt(event){
  
}

function insertUI() {
  var composeDivs = $(".n1tfz");
  if(composeDivs && composeDivs.length > 0){
    composeDivs.each(function(){
      var composeMenu = $(this).parent().parent().parent().parent();
      if(composeMenu && composeMenu.length > 0 && composeMenu.find(".ss-encrypt-form").length === 0) {
        var ssEncryptForm = 
          "<div class='ss-encrypt-form'>" +
            "<table style='width:100%'>" +
              "<tbody>" +
                "<tr>" + 
                  "<td style='width:80px'>" +
                    "<div class='ss-encrypt-button'>Send Secure</div>" +
                  "</td>" +
                  "<td><div class='Uz'></div></td>" +
                  "<td>" +
                    "<div class='ss-encrypt-info'>"+
                      "Use recipient's public key to encrypt message" +
                    "</div>" +
                  "</td>" +
                "</tr>" +
              "</tbody>" +
            "</table>" +
          "</div>";
        composeMenu.append(ssEncryptForm);
        composeMenu.find(".ss-encrypt-button").click(encrypt); 
      }
    });
  }
  var messageButtonBar = $("td[class='gH acX']");
  if(messageButtonBar && messageButtonBar.length > 0) {
    messageButtonBar.each(function(){
      if($(this).find(".ss-decrypt-button").length === 0){
        $(this).prepend("<div class='ss-decrypt-button'>Decrypt</div>");
        $(this).find(".ss-decrypt-button").click(decrypt);
      }
    });
  }
}

var insertListener = function(event){
  if(event.animationName == "messageOrComposeLoaded"){
    insertUI();
  }
}

document.addEventListener("webkitAnimationStart", insertListener, false);

