$(document).ready(function () {
    $(".delete-btn").click(function (event) {
        event.preventDefault();
        const id = $(this).attr("data");
        $.ajax(`/remove/${id}`, {
            type: "PUT"
        }).then(function () {
            location.reload();
        })
    });

    $(document).on("click", "#home-btn", function () {
        $.ajax(`/`, {
            method: "GET"
        }).then(function () {
            location.replace("/")
        });
    });

    $(document).on("click", "#favs-btn", function () {
        $.ajax(`/saved`, {
            method: "GET"
        }).then(function () {
            location.replace("/saved")
        });
    });

    $(document).on("click", "#scrape", function () {
        $.ajax(`/scrape`, {
            method: "GET"
        }).then(function () {
            location.replace("/")
        });
    });

    $(document).on("click", "#clear", function () {
    $("#articles-view").empty();
    });

    $(".save-btn").click(function (event) {
        event.preventDefault();
        const button = $(this);
        const id = button.attr("id");
        const saved = button.attr("isSaved")
        $.ajax(`/save/${id}`, {
            type: "PUT"
        }).then(function () {
            const alert = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
            The article has been saved! Find it by clicking on Popular.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>`
            button.parent().append(alert);
        });
    });
  
    $(".note-btn").click(function (event) {
        event.preventDefault();
        const id = $(this).attr("data");
        $("#article-id").text(id);
        $("#save-note").attr("data", id);
        $.ajax({
            method:"GET",
            url: `/articles/${id}`
        })
        .then(function (data) {
            console.log(data)
            $(".articles-available").empty();
            if (data[0].note.length > 0) {
                data[0].note.forEach(v => {
                    $(".articles-available").append($(`<li class="list-group-item">${v.text}<button type="button" class="btn btn-danger btn-sm float-right btn-deletenote" data="${v._id}">X</button></li>`));
                })
            }
            else {
                $(".articles-available").append($(`<li class="list-group-item">No notes for this article yet</li>`));
                console.log("No dice! (But it worked.)")
            }
        })
        $("#note-modal").modal("toggle");
    });

  $(document).on("click", ".btn-deletenote", function (){
          event.preventDefault();
          console.log($(this).attr("data"))
          const id = $(this).attr("data");
          console.log(id);
          $.ajax(`/note/${id}`, {
              type: "DELETE"
          }).then(function () {
              $("#note-modal").modal("toggle");
          });
  });

  $("#save-note").click(function (event) {
      event.preventDefault();
      const id = $(this).attr("data");
      const noteText = $("#note-input").val().trim();
      $("#note-input").val("");
      $.ajax(`/note/${id}`, {
          type: "POST",
          data: { text: noteText}
      }).then(function (data) {
          console.log(data)
      })
      $("#note-modal").modal("toggle");
  });

// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "data-isSaved=" + data[i].isSaved + "'>" + data[i].title + "<br/>" + data[i].link + "</p>");
    }
    console.log(data)
  });
  
  
//   // Whenever someone clicks a p tag
//   $(document).on("click", "p", function() {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");
  
//     // Now make an ajax call for the Article
//     $.ajax({
//       method: "GET",
//       url: "/articles/" + thisId
//     })
//       // With that done, add the note information to the page
//       .then(function(data) {
//         console.log(data);
//         // The title of the article
//         $("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
//         $("#notes").append("<input id='titleinput' name='title' >");
//         // A textarea to add a new note body
//         $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
//         $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
//         // If there's a note in the article
//         if (data.note) {
//           // Place the title of the note in the title input
//           $("#titleinput").val(data.note.title);
//           // Place the body of the note in the body textarea
//           $("#bodyinput").val(data.note.body);
//         }
//       });
//   });
  
//   // When you click the savenote button
//   $(document).on("click", "#savenote", function() {
//     // Grab the id associated with the article from the submit button
//     var thisId = $(this).attr("data-id");
  
//     // Run a POST request to change the note, using what's entered in the inputs
//     $.ajax({
//       method: "POST",
//       url: "/articles/" + thisId,
//       data: {
//         // Value taken from title input
//         title: $("#titleinput").val(),
//         // Value taken from note textarea
//         body: $("#bodyinput").val()
//       }
//     })
//       // With that done
//       .then(function(data) {
//         // Log the response
//         console.log(data);
//         // Empty the notes section
//         $("#notes").empty();
//       });
  
//     // Also, remove the values entered in the input and textarea for note entry
//     $("#titleinput").val("");
//     $("#bodyinput").val("");
//   });
});