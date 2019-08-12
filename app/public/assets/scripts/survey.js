var instance = JSON.parse(sessionStorage.getItem("instance"));
$(document).ready(function() {
  if (!instance) {
    window.location.href = "/";
  }
});

$(document).on("click", ".radio", function() {
  var previous = $($(this).parent()).attr("data-selected");
  if (previous.length > 0) {
    $.each($($(this).parent()).children(), function(index, value) {
      if ($(value).attr("data-value") === previous) {
        $(value).css("background-color", "unset");
      }
    });
  }
  $($(this).parent()).attr("data-selected", $(this).attr("data-value"));
  $(this).css("background-color", $(this).css("border-color"));
});

$("#submit").on("click", function() {
  var results = [];
  $.each($(".radiogroup"), function(index, element) {
    var value = parseInt($(element).attr("data-selected"));
    results.push(value);
  });
  if (
    results.includes(NaN) &&
    $("#alert-insert")
      .children()
      .toArray().length === 0
  ) {
    $("#alert-insert").append(
      '<div class="alert alert-warning alert-dismissible fade show" role="alert">' +
        "<strong>Hang on a sec!</strong> You need to answer all the questions before submitting." +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        "</button>" +
        "</div>"
    );
    return;
  }

  var data = {
    survey_id: $("#id").text(),
    nq: $("#nq").text(),
    user_id: instance.quantum,
    results: results.join(",")
  };
  $.post("/survey/submit", data, response => {
    console.log(response);
    if (response.status === 300) {
      //this block of code is reached if you are the first to take a survey
      $(".modal-body").append(
        '<p>You are the first to take this quiz, so there is no one to match you with. Why not take <a href="/surveys">another quiz</a> while you wait to be matched with a friend?'
      );
      $("#modal").modal("show");
      return;
    }
    $("#modal").modal("show");
    //get the name and photo of your match
    $.post("/match/" + response.match_id, response => {
      console.log(response);
      if (!response.brand) {
        response.brand = "this user hasn't written a brand statement yet";
      }
      if (!response.photo) {
        response.photo = "http://lorempixel.com/200/200/cats";
      }
      $("#loading-gif")
        .detach()
        .appendTo($(".tooltray"));
      $(".modal-body").append(
        '<div class="text-center"><h2>' +
          response.name +
          "</h2>" +
          '<img src="' +
          response.photo +
          '" alt="profile-image" />' +
          "<div>" +
          response.brand +
          "</div></div>"
      );
    });
  });
});

$("#close-modal").on("click", function() {
  $(".modal-body")
    .empty()
    .append($("#loading-gif"));
  $("#modal").modal("hide");
  window.location.href = "/profile";
});

$("#create").on("click", () => {
  window.location.href = "/create";
});
//listen for the logout click
$("#logout").on("click", () => {
  $.post("/auth/logout/", { id: instance.quantum }, res => {
    if (res.status === 200) {
      sessionStorage.clear();
      window.location.href = "/";
    }
    console.log(res);
  });
});
