var questions = [];
var instance = JSON.parse(sessionStorage.getItem("instance"));
$(document).ready(function() {
  if (!instance) {
    window.location.href = "/";
  }
});

$("#add").on("click", function() {
  var index = questions.length;
  var question = $("#question")
    .val()
    .trim();
  if (question.length === 0) return;
  $("#question").val("");
  questions.push(question);
  $("<div>")
    .text(question)
    .prepend('<button type="button" data-index="' + index + '" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
    .appendTo("#question-box");
  if (questions.length === 15) {
    $("#hook")
      .detach()
      .appendTo(".tooltray");
    $("#alert")
      .detach()
      .appendTo("#target");
  }
});

$(document).on("click", ".close", function() {
  var index = parseInt($(this).attr("data-index"));
  var temp = [];
  for (var i = 0; i < questions.length; i++) {
    if (i === index) continue;
    temp.push(questions[i]);
  }
  questions = temp;
  $("#question-box").empty();
  questions.forEach((question, index) => {
    $("<div>")
      .text(question)
      .prepend('<button type="button" data-index="' + index + '" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
      .appendTo("#question-box");
  });
  $("#alert")
    .detach()
    .appendTo($(".tooltray"));
  $("#hook")
    .detach()
    .appendTo($("#target"));
});

$("#submit").on("click", function() {
  var data = {
    name: $("#name")
      .val()
      .trim(),
    nq: questions.length,
    author: instance.name,
    questions: questions
  };

  $.post("/survey/create", data).then(response => {
    //on response, hit the survey link
    console.log(response);
    window.location.href = "/survey";
  });
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
