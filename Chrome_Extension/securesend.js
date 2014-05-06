function encrypt(event){
  var recipient = getContentRecipient(event);
  var contents = getContents(event);
  alert("Got recipient: " + recipient);
  alert("Got contents: " + contents.msg);
  var encrypted = rsa_encrypt(recipient, contents.msg);
  writeContents(contents.g_editable, encrypted);
  //TODO Akash: click the send button
}

function decrypt(event){
  $password = $(event.currentTarget).parent().find(".ss-decrypt-input");
  if($password.val() && $password.val().length > 0){
    $password.css({"border": "1px solid #dcdcdc"});
    var recipient = getMessageRecipient(event);
    var message = getMessage(event);
    alert("Got recipient: " + recipient);
    alert("Got message: " + message.msg);
    var decrypted = rsa_decrypt(recipient, message.msg, $password.val());
    $(message.message_box.html(decrypted.replace(/\n/g,"<br>")));
  }
  else {
    $password.focus();
    $password.css({"border": "1px solid #dd4b39"});
  }
}

function decrypt_key(event){
  if(event.keyCode == 13){
    decrypt(event);
  }
}

function getContentRecipient(event) {
  return $(event.currentTarget).parents().find('[email]').last().attr("email");
}

function getContents(event) {
  var msg;
  var g_editable = $(event.currentTarget).parents().find('[g_editable]').first();
  msg = g_editable.html().replace(/(<div>)/g,'\n');
  msg = msg.replace(/(<\/div>)/g,'');
  return {g_editable: g_editable, msg: msg};
}

function writeContents(g_editable, message) {
  message = message.split('\n').join('<br/>');
  g_editable.html(message);
}

function getMessage(event){
  var $message_box = $(event.currentTarget).closest("div[class='gs']").find("[class*='ii gt'] div").first();
  return {message_box: $message_box, msg: $message_box.html().replace(/<(.*?)>/g,'')};
}

function getMessageRecipient(event){
  return $(event.currentTarget).parents('div[class="gE iv gt"]').find("span [email]").attr("email")
}

function rsa_encrypt(recipient, content) {
  //TODO Vikas: get the recipient's public key from the server
  // and encrypt that shit using some algorithms!

  var armoredKey;

  // request public key from server
  $.ajax({
    url: 'http://peaceful-ocean-5864.herokuapp.com/pk',
    data: {
      email: recipient,
    },
    async: false,
  }).done(function(data) {
    if (data['success']) {
      armoredKey = data['pk'];
    }
  }).fail(function() {
    //TODO update DOM to indicate public key was not retrieved
    return content;
  })

  var publicKey = openpgp.key.readArmored(armoredKey);
  var ciphertext = openpgp.encryptMessage(publicKey.keys, content);
  console.log(ciphertext);

  return ciphertext;
}

function rsa_decrypt(recipient, content, passphrase){
  var armoredKey;

  // request public key from server
  $.ajax({
    url: 'http://peaceful-ocean-5864.herokuapp.com/sk_pad',
    data: {
      email: recipient,
    },
    async: false,
  }).done(function(data) {
    if (data['success']) {
      armoredKey = data['sk_pad'];
      console.log(armoredKey);
    }
  }).fail(function() {
    //TODO update DOM to indicate public key was not retrieved
    return content;
  })

  var privateKey = openpgp.key.readArmored(armoredKey)['keys'][0];
  if (!privateKey.decrypt(passphrase)) {
    // TODO decryption failed message
    console.log("wrong passphrase")
  }

  var messageObj = openpgp.message.readArmored(content);
  var message = openpgp.decryptMessage(privateKey, messageObj);
  return message
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
        $(this).append("<input class='ss-decrypt-input' type='password' placeholder='Decryption Password'/>");
        $(this).find(".ss-decrypt-button").click(decrypt);
        $(this).find(".ss-decrypt-input").keyup(decrypt_key);
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
