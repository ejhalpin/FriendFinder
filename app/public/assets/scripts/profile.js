var brandStatement = "";
var selectedID = "";
var profileUrl = "";
var instance = JSON.parse(sessionStorage.getItem("instance"));
$(document).ready(function() {
  if (localStorage.getItem("instance")) {
    $("input:checkbox").prop("checked", true);
  }
  if (instance.token) {
    loadProfile();
  } else {
    window.location.href = "/";
  }
});

// load the user profile
async function loadProfile() {
  //load the brand statement from the database
  $.get("/user/" + instance.quantum + "/brand", response => {
    console.log("get brand");
    console.log(response);
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
  //query the matches table and load the matches
  $.get("/api/match/" + instance.quantum, response => {
    //using the above data, get all the info!
    console.log(response);
    response.data.forEach(row => {
      var div = $('<div class="row">');
      $("<div>")
        .addClass("col-4")
        .attr("id", "survey-name")
        .text(row.survey_name)
        .appendTo(div);
      $('<div class="col-4" id="match-name">')
        .append('<a id="show-info" href="#" data-index="' + row.match_id + '">' + row.match_name + "</a>")
        .appendTo(div);
      $('<div class="col-4" id="match-score">')
        .text(row.score)
        .appendTo(div);
      div.appendTo($("#survey-data"));
    });
  });
}

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
//listent for the update-picture button click
$("#update-picture").on("click", () => {
  $("#img-modal").modal("show");
  $.get("/api/giphy", data => {
    $("#loading-gif")
      .detach()
      .appendTo($(".tooltray"));
    $("#custom-url-div")
      .detach()
      .appendTo($("#img-modal-body"));
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

      $("#img-modal-body").append(thumbnail);
    });
  });
});
//listen for the set-image click on the update picture modal
$("#setImage").on("click", () => {
  //set the profile image to the url selected
  $("#profile-image").attr("src", profileUrl);
  //update the database with this information
  $.post("/api/user", { data: [{ photo: profileUrl }, { id: instance.quantum }] }, res => {
    if (res.status === 200) {
      instance.photo = profileUrl;
      sessionStorage.setItem("instance", JSON.stringify(instance));
    }
  });
  //close the modal
  closeModal();
});
//listen for the update-brand button click
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
//listen for the cancel-brand-update click
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
//an asynchronous function to handle updating the brand in the database
async function saveBrand(statement) {
  $.post("/api/user", { data: [{ brand: statement }, { id: instance.quantum }] }, res => {
    console.log(res);
  });
}
//bind a change listener to the brand statement text aria to update the small help text
$("#brand-statement").bind("input propertychange", function(event) {
  $("#numchar").text((255 - $("#brand-statement").val().length).toString());
});
//set a listener for the manual photo href input submisison on the update picture modal
$("#use-custom-url").on("click", function() {
  profileUrl = $("#custom-url")
    .val()
    .trim();
  //set the profile image to the url selected
  $("#profile-image").attr("src", profileUrl);
  //update the database with this information
  $.post("/api/user", { data: [{ photo: profileUrl }, { id: instance.quantum }] }, res => {
    if (res.status === 200) {
      instance.photo = profileUrl;
    }
  });
  //close the modal
  closeModal();
});
//listen for the modal close button click
$("#close-modal").on("click", function() {
  closeModal();
});
//listen for the profile modal close button click
$("#close-profile-modal").on("click", function() {
  $("#modal-body")
    .empty()
    .append($("#loading-gif-1"));
  $("#modal").modal("hide");
});
//listen for the close modal x click
$("#close-modal-x").on("click", function() {
  closeModal();
});
//listen for the close profile modal x click
$("#close-profile-modal-x").on("click", function() {
  $("#modal-body")
    .empty()
    .append($("#loading-gif-1"));
  $("#modal").modal("hide");
});
//a routine to handle the modal layout on close
function closeModal() {
  //empty the custom url input
  $("#custom-url").val("");
  //stash the custum url div in the tooltray
  $("#custom-url-div")
    .detach()
    .appendTo($(".tooltray"));
  $("#img-modal-body")
    .empty()
    .append($("#loading-gif"));
  $("#img-modal").modal("hide");
}
//listen for the state-change of the checkbox
$("input:checkbox").change(function() {
  if ($(this).is(":checked")) {
    localStorage.setItem("instance", JSON.stringify(instance));
  } else {
    localStorage.clear();
  }
});

$(document).on("click", "#show-info", function() {
  console.log("show-info");
  var match_id = $(this).attr("data-index");
  console.log(match_id);
  $("#modal").modal("show");
  $.post("/match/" + match_id, response => {
    console.log(response);
    if (!response.brand) {
      response.brand = "this user hasn't written a brand statement yet";
    }
    if (!response.photo) {
      response.photo = "http://lorempixel.com/200/200/cats";
    }
    $("#loading-gif-1")
      .detach()
      .appendTo($(".tooltray"));
    $("#modal-body").append(
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
