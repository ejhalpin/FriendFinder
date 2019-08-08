$(document).ready(() => {
  //check session and local storage for a token. If found, load the profile page, otherwise, load the login page
  if (sessionStorage.ff_instance || localStorage.ff_instance) {
    location.replace("/profile");
  }
});

//toggle between the login and signup forms
$("#auth-swap").on("click", () => {
  var text = $("#auth-swap").text();
  console.log(text);
  switch (text) {
    case "sign up":
      $("#signup")
        .detach()
        .prependTo($("#auth-form"));
      $("#auth-swap").text("login");
      $("#login-submit").text("sign up");
      break;
    case "login":
      $("#signup")
        .detach()
        .appendTo($(".tooltray"));
      $("#auth-swap").text("sign up");
      $("#login-submit").text("login");
      break;
  }
});

//submit the auth form
$("#login-submit").on("click", event => {
  event.preventDefault();
  var endpoint = "/auth";
  var text = $("#login-submit").text();
  var credentials = {
    method: text,
    email: $("#login-email")
      .val()
      .trim(),
    pass: $("#login-password")
      .val()
      .trim(),
    user: ""
  };
  if (text === "sign up") {
    credentials.user = $("#signup-name")
      .val()
      .trim();
    endpoint += "/newuser";
  }

  // both sign up and login map to the same endpoint. The data returned by the server is placed in the session storage
  $.post(endpoint, credentials).then(res => {
    if (res.status === 409) {
      //add some form error handling for non unique entries or incorrect email/password entries
      console.log(res.reason);
    }
    if (res.status === 500) {
      //handle internal server errors on the server side, bro.
      console.log(res.reason);
    }
    //set the friend finder data instance in session storage
    sessionStorage.ff_instance = {
      token: res.body.token,
      quantum: res.body.quantum,
      photo: res.body.photo,
      name: res.body.name
    };
    location.replace("/profile");
  });
});
