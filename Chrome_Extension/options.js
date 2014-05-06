window.onload = function() {
  var register = function() {
    var email = $('#email').val();
    var pk = $('#public_key').val();
    var sk_pad = $('#private_key').val();

    $.ajax({
      url: "http://peaceful-ocean-5864.herokuapp.com/register",
      method: "POST",
      data: JSON.stringify({'email': email, 'pk': pk, 'sk_pad': sk_pad}),
      type: 'json'
    }).done(function(data) {
      if (data["success"]) {
        alert("Some message letting me know of my successful key upload");
      }
    });
  };

  var generate_keys = function() {
    var key_size = parseInt($('#key_size').val());
    var email = $('#email').val()
    var passphrase = $('#passphrase').val()

    var keys = openpgp.generateKeyPair(1, key_size, email, passphrase);

    $('#private_key').val(keys['privateKeyArmored']);
    $('#public_key').val(keys['publicKeyArmored']);
  }

  $('#register').click(register);
  $('#generate').click(generate_keys);
};
