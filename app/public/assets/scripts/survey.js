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
