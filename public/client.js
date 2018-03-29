let user = "";

window.fbAsyncInit = function() {
    FB.init({
        appId      : '159879151414699',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.8'
    })
    FB.AppEvents.logPageView();   
};
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    $("#FBB").toggle();
    FB.api('/me', function(response) {
      user = response.name;
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

$("#searchButt").on('click', function(event) {
    event.preventDefault();
    let loc = $("#locInput").val();
    $.get(`/search?city=${loc}`, function(obj) {
      //console.log("pollspace",obj);
      displayResults(obj);
    });
});

$("#containerDiv").on('click', 'button', function(event) {
  event.preventDefault();
  let $this = $(this);
  let id = $this.data("key");
  if (user.length === 0) {
    window.alert("must be logged in to attend");
  } else {
    $.get(`/attending?id=${id}&user=${user}`, function(obj) {
      console.log(obj);
      $this.parent().find("ul").remove();
      let $att = $(displayAttending(obj.attending));
      console.log($att);
      $att.insertAfter($this);
      $this.text(obj.total);
    });
  }
});

function displayAttending(arr) {
  let htmlStr = `<ul id=>`;
  $.each(arr, function( index, value ) {
    htmlStr += `<li>${value}</li>`
  });
  htmlStr += `</ul>`
  return htmlStr;
}

function displayResults(obj) {
  let htmlStr = `<table><tr><th colspan="5">Bars</th></tr>`;
  htmlStr += `<tr><td class="tg">Image</td><td class="tg">Name</td><td class="tg">Location</td><td class="tg">URL</td><td class="tg">Attending</td></tr>`;
  $.each(obj, function(key,value) {
    let addr = value.location;
    console.log("addr",value,key);
    htmlStr += `<tr><td><img src="${value.image_url}" style="height: 200px; object-fit: contain"></td>`;
    htmlStr += `<td>${value.name}</td>`;
    htmlStr += `<td>${addr.address1},${addr.city}</td>`;
    htmlStr += `<td><a href="${value.url}">Site</a></td>`;
    htmlStr += `<td><button data-key="${value.id}" class="attButt">${value.attending}</button></td></tr>`;
  });
  htmlStr += `</table>`;
  $("#containerDiv").append(htmlStr);
}

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else {
      // The person is not logged into your app or we are unable to tell.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    }
}