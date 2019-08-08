var instance = JSON.parse(sessionStorage.getItem("instance"));
var brandStatement = "";
var selectedID = "";
var profileUrl = "";

$(document).ready(function() {
  if (instance.token) {
    loadProfile();
  } else {
    window.location.href = "/";
  }
});

// load the user profile
async function loadProfile() {
  //load the brand statement from the database
  $.get("/api/user/" + instance.quantum + "/brand").then(response => {
    //set the brand statement element with the data
    $("#brand-statement").val(response.data.brand);
    $("#numchar").text((255 - $("#brand-statement").val().length).toString());
  });
  //load the user name
  $("#user-name").text(instance.name);
  //load the user photo if it extist, otherwise load a stock photo
  if (instance.photo.length > 0) {
    $("#profile-image").attr("src", instance.photo);
  } else {
    $("#profile-image").attr("src", "http://lorempixel.com/200/200/cats");
  }
  //query the user table and load the matches
  $.get("/api/table/" + instance.quantum + "/table").then(response => {
    response.rows.forEach(row => {
      var row = $('<div class="row">');
      $('<div class="col-4" id="survey-name">')
        .text(row.survey_name)
        .appendTo(row);
      $('<div class="col-4" id="match-name">')
        .text(row.match_name)
        .appendTo(row);
      $('<div class="col-4" id="match-score">')
        .text(row.score)
        .appendTo(row);
      row.appendTo($("#survey-data"));
    });
  });
}

//listen for the logout click
$("#logout").on("click", () => {
  $.post("/auth/logout/" + instance.quantum).then(res => {
    if (res.status === 200) {
      sessionStorage.clear();
      window.location.href = "/";
    }
  });
});
$("#update-picture").on("click", () => {
  $.get("/api/giphy", data => {
    $("#custom-url-div")
      .detach()
      .appendTo($(".modal-body"));
    data.urls.forEach((url, index) => {
      var thumbnail = $("<img id='image" + index.toString() + "' src='" + url + "' class='img-thumbnail mx-auto' />");
      thumbnail.on("click", event => {
        var img = $(event.target);
        if (selectedID.length > 0) {
          $("#" + selectedID).toggleClass("selected");
        }
        img.toggleClass("selected");
        selectedID = img.attr("id");
        profileUrl = img.attr("src");
      });
      $(".modal-body").append(thumbnail);
    });
    $("#img-modal").modal("show");
  });
});

$("#setImage").on("click", () => {
  //set the profile image to the url selected
  $("#profile-image").attr("src", profileUrl);
  //update the database with this information
  $.post("/api/user", { data: [{ photo: profileUrl }, { id: instance.quantum }] }).then(res => {
    if (res.status === 200) {
      instance.photo = profileUrl;
      sessionStorage.setItem("instance", JSON.stringify(instance));
    }
  });
  //close the modal
  closeModal();
});

$("#update-brand").on("click", event => {
  //get the button text
  var button = $(event.target);
  var area = $("#brand-statement");
  var cancel = $("#cancel-brand-update");
  var help = $("#charlimit");
  var text = button.text();
  switch (text) {
    case "edit":
      button.text("save");
      area.prop("readonly", false).toggleClass("form-control-plaintext");
      help.toggleClass("hidden");
      //move the cancel button to before the save button...
      cancel.detach().prependTo($("#brand-button-box"));
      break;

    case "save":
      cancel.detach().appendTo($("#tooltray"));
      button.text("edit");
      area.prop("readonly", true).toggleClass("form-control-plaintext");
      help.toggleClass("hidden");
      saveBrand(area.val());
      brandStatement = area.val();
      break;
  }
});

$("#cancel-brand-update").on("click", event => {
  $(event.target)
    .detach()
    .appendTo($(".tooltray"));
  $("#charlimit").toggleClass("hidden");
  $("#update-brand").text("edit");
  $("#brand-statement")
    .prop("readonly", true)
    .toggleClass("form-control-plaintext")
    .val(brandStatement);
});

async function saveBrand(statement) {
  $.post("/api/user", { data: [{ brand: statement }, { id: instance.quantum }] }).then(res => {});
}

$("#brand-statement").bind("input propertychange", function(event) {
  $("#numchar").text((255 - $("#brand-statement").val().length).toString());
});

$("#use-custom-url").on("click", function() {
  profileUrl = $("#custom-url")
    .val()
    .trim();
  //set the profile image to the url selected
  $("#profile-image").attr("src", profileUrl);
  //update the database with this information
  $.post("/api/user", { data: [{ photo: profileUrl }, { id: instance.quantum }] }).then(res => {
    if (res.status === 200) {
      instance.photo = profileUrl;
    }
  });
  //close the modal
  closeModal();
});

$("#close-modal").on("click", function() {
  closeModal();
});
$("#close-modal-x").on("click", function() {
  closeModal();
});

function closeModal() {
  //empty the custom url input
  $("#custom-url").val("");
  //stash the custum url div in the tooltray
  $("#custom-url-div")
    .detach()
    .appendTo($(".tooltray"));
  $(".modal-body").empty();
  $("#img-modal").modal("hide");
}
