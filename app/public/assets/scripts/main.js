var local, session;
if (localStorage.getItem("instance")) {
  local = JSON.parse(localStorage.getItem("instance"));
}
if (sessionStorage.getItem("instance")) {
  session = JSON.parse(sessionStorage.getItem("instance"));
}
$(document).ready(() => {
  //check session and local storage for a token. If found, load the profile page, otherwise, load the login page
  if (local) {
    sessionStorage.setItem("instance", JSON.stringify(local));
    location.href = "/profile";
  }
  if (session) {
    if (session.token) location.href = "/profile";
  }
});

//toggle between the login and signup forms
$("#auth-swap").on("click", () => {
  var text = $("#auth-swap").text();
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
  var text = $("#login-submit").text();
  var credentials = {
    email: $("#login-email")
      .val()
      .trim(),
    password: $("#login-password")
      .val()
      .trim(),
    name: ""
  };
  if (credentials.email.length === 0 || credentials.password.length === 0) {
    $("#message").text("the fields can't be empty");
    $("#alert")
      .detach()
      .appendTo($("#alert-row"));
    return;
  }
  if (text === "sign up") {
    text = "signup";
    credentials.name = $("#signup-name")
      .val()
      .trim();
    if (credentials.name.length === 0) {
      $("#message").text("the fields can't be empty");
      $("#alert")
        .detach()
        .appendTo($("#alert-row"));
      return;
    }
  }
  console.log(credentials);
  // both sign up and login map to the same endpoint. The data returned by the server is placed in the session storage
  $.post("/auth/" + text, credentials, res => {
    console.log(res);
    if (res.status === 409) {
      $("#message").text(res.reason);
      $("#alert")
        .detach()
        .appendTo($("#alert-row"));

      console.log(res.reason);
      return;
    }
    if (res.status === 500) {
      //handle internal server errors on the server side, bro.
      console.log(res.reason);
      return;
    }
    if (res.status === 200) {
      //set the friend finder data instance in session storage
      var instance = {
        token: res.token,
        quantum: res.quantum,
        photo: res.photo || "",
        name: res.name
      };
      sessionStorage.setItem("instance", JSON.stringify(instance));

      location.href = "/profile";
    }
  });
});

$("#close").on("click", function() {
  $("#alert")
    .detach()
    .appendTo($(".tooltray"));
  $("#message").empty();
});
