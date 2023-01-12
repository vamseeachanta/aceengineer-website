var opts ="";
$(function() {


 opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

    //Display Html editor     
    jQuery('#summernote').summernote({
        height: "600px",
        width: "80%",
        onImageUpload: function(files, editor, welEditable) {
          sendFile(files[0], editor, welEditable);
        }
    });


    //Get all the blog dates
    GetBlogDate();




    //Retrieving the blog content based on choosen date
    $("#DropdownBlogDate").change(function() {

        try
        {
            var SelectedValue = encodeURIComponent($("#DropdownBlogDate option:selected").text());

            $.ajax({
                type: "POST",
                url: "Database.php",
                data: "Mode=" + "GetSelectedContent" + "&BlogDate=" + SelectedValue,
                success: function(result) {

                    $("#txtUpdateHeading").val(result);
                    var res = eval("(" + result + ")");

                    if (res.length === 1)
                    {
                        var ContentArray = res[0].Content;
                         $("#txtHeading").val(res[0].BlogHeading);
                         $("#txtUrlHeading").val(res[0].UrlHeading);
                        $('#summernote').code(ContentArray);
                    }//if
                },
                error: function(error) {
                    alert(error);
                }
            });


        }
        catch (ex)
        {
            alert(ex.message);
        }

    });


});


//Saving image in specific folder
function sendFile(file, editor, welEditable) {

//  //$('.ProgressBarSpin').attr('id', 'Spinbar');
//  $('.ProgressBarSpin').append("<div id='Spinbar'></div>");
//var target = document.getElementById('Spinbar');
//var spinner = new Spinner(opts).spin(target);



    data = new FormData();
    data.append("file", file);
    
    $.ajax({
        
        data: data,
        type: "POST",
        url: "ImageSave.php",
        cache: false,
        contentType: false,
        processData: false,
        success: function(url) {
//            $("#Spinbar").remove();
            alert(url);
            editor.insertImage(welEditable, url);
            
        },
        error: function(error) {
            alert(error);
        }
    });
}


//Filling the (Date) dropdown values
function  GetBlogDate() {

    $.ajax({
        data: "Mode=" + "GetBlogDates",
        type: "POST",
        url: "Database.php",
        success: function(result) {
            var res = eval("(" + result + ")");
            if (res.length !== 0) {
                var options = '<option value="Choose">Choose</option>';

                for (var i = 0; i < res.length; i++) {

                    options += '<option value=' + res[i].BlogDate + '>' + res[i].BlogDate + '</option>';

                }//for

                $("#DropdownBlogDate").empty().append(options);

            }//if

        },
        error: function(error) {
            alert(error);
        }
    });

}

//Save the content into database
function save() {

    var content = encodeURIComponent($('#summernote').code());
     var headingTitle=encodeURIComponent($("#txtHeading").val());
     var UrlheadingTitle=encodeURIComponent($("#txtUrlHeading").val());
    $.ajax({
        data: "Mode=" + "SaveContent" + "&Content=" + content  + "&HeadingTitle=" +headingTitle + "&UrlHeadingTitle=" + UrlheadingTitle,
        type: "POST",
        url: "Database.php",
        success: function(res) {
            alert(res);
            $('#summernote').code("");
            GetBlogDate();

        },
        error: function(error) {
            alert(error);
        }
    });


}


// Update the content 
function Update() {
    if ($("#DropdownBlogDate option:selected").text() !== "Choose")
    {
        var SelectedBolgDate = $("#DropdownBlogDate option:selected").text();
        var content = encodeURIComponent($('#summernote').code());
        var Heading = encodeURIComponent($('#txtHeading').val());
        var BlogUrlHeading = encodeURIComponent($('#txtUrlHeading').val());
        

        $.ajax({
            data: "Mode=" + "UpdateMode" + "&UpdateContent=" + content + "&SelectedBolgDate=" + SelectedBolgDate + "&BlogHeading=" +Heading + "&BlogUrlHeading=" +BlogUrlHeading ,
            type: "POST",
            url: "Database.php",
            success: function(res) {
                alert(res);
                $('#summernote').code("");
                $('#txtHeading').val("");
                $('#txtUrlHeading').val("");
                GetBlogDate();

            },
            error: function(error) {
                alert(error);
            }
        });
    }//if
}

//Delete the content from database

function Delete()
{
    if ($("#DropdownBlogDate option:selected").text() !== "Choose")
    {
        var Confirm = window.confirm("Are you Sure ? You want to delete blog content");
        if (Confirm)
        {
            var SelectedBolgDate = $("#DropdownBlogDate option:selected").text();
            var content = encodeURIComponent($('#summernote').code());
var datee=$("#DropdownBlogDate option:selected").text() ;
            $.ajax({
                data: "Mode=" + "DeleteMode" + "&SelectedBolgDate=" + SelectedBolgDate + "&dateTime=" +datee,
                type: "POST",
                url: "Database.php",
                success: function(res) {
                    alert(res);
                    $('#summernote').code("");
                    GetBlogDate();

                },
                error: function(error) {
                    alert(error);
                }
            });
        }//if confirm
    }//if
}


    