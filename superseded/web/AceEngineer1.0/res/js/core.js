/*
 * JQuery functions for slideout feedback form
 * 
 * Sets up a sliding form on click of a feedback button
 * On submit button will send the data to a php script
 * 
 * By http://www.paulund.co.uk
 */
//(function ($j) {
//
//    feedback_button = {
//
//        onReady: function () {  
//            //            alert("hi");
//            this.feedback_button_click();
//            this.send_feedback();
//            
//        },
//    
//        feedback_button_click: function(){
//            $("#feedback_button").click(function(){
//                $('.form').slideToggle();   		
//            });
//        },
//    
//        send_feedback: function(){
//            $('#submit_form').click(function(){
//                if($('#feedback_text').val() != ""){
//    			
//                    $('.status').text("");
//    			
//                    $.ajax({  
//                        type: "POST",  
//                        url: "./process_email.php",  
//                        data: 'feedback=' + $('#feedback_text').val(),  
//                        success: function(result,status) { 
//                            //email sent successfully displays a success message
//                            if(result == 'Message Sent'){
//                                $('.status').text("Feedback Sent");
//                            } else {
//                                $('.status').text("Feedback Failed to Send");
//                            }
//                        },
//                        error: function(result,status){
//                            $('.status').text("Feedback Failed to Send");
//                        }  
//                    });
//                }
//            });
//        }
//    
//    
//    };
//
//    $j().ready(function () {
//        feedback_button.onReady();
//    });
//
//})(jQuery);


$(function(){
    // alert("load");
    $("#feedback_button").click(function(){
        $('.form').slideToggle();   		
    });
    $("#feedback_Submit").click(function()
    {
        $("#feedback_Result").html("");
        if ($("#form").validate().form() == true) 
        {
            var sendName = $('input[name="senderName"]').val();
            var senderMail = $('input[name="Email"]').val();
            var subject = "Feedback "+$('input[name="Subject"]').val();
            var msgbdy = $("#msgBody").val();
            alert(msgbdy);
            //var success = "<span style='color:green;'>Message sent succesfully</span>";
            //var fail = "<span style='color:red;' >Message sending failed</span>";
            $.post("MailSend.do?senderName="+sendName+"&Email="+senderMail+"&Subject="+subject+"&msgBody="+msgbdy,null,function(data){
                // alert(data);
                if(data == 1){
                    $("#feedback_Result").html("<span style='color:green;'>Message sent succesfully</span>");
                    //alert($('input[name="senderName"]')[0]);
                    $('input[name="senderName"]').val("");
                    $('input[name="Email"]').val("");
                    $('input[name="Subject"]').val("");
                    $('textarea[name="msgBody"]').val("");
                }
                else{
                    $("#feedback_Result").html("<span style='color:red;'>Sorry, Message not sent</span>");
                }
                $("#feedback_Result").show();
                
            });
        }
    }); 
    
    $("#Quick_Submit").click(function()
    {
        $("#Quick_Result").html("");
        if($("#Quick_Form").validate().form() == true)
        {
            var sendName = $('input[name="Contact_Name"]').val();
            var senderMail = $('input[name="Contact_Email"]').val();
            var subject = "Need Help";
            var msgbdy = $("#Contact_Msg").val();
            //            var success = "<span style='color:green;'>Message sent succesfully</span>";
            //            var fail = "<span style='color:red;'>Message sending failed</span>";
            //var statusMsg;
            $.post("MailSend.do?senderName="+sendName+"&Email="+senderMail+"&Subject="+subject+"&msgBody="+msgbdy,null,function(data){
                if(data == 1){
                    $("#Quick_Result").html("<span style='color:green;'>Message sent succesfully</span>");
                    $('input[name="Contact_Name"]').val("");
                    $('input[name="Contact_Email"]').val("");
                    $('input[name="Contact_ph"]').val("");
                    $('textarea[name="Contact_Msg"]').val("");
                }
                else{
                    $("#Quick_Result").html("<span style='color:red;'>Message sending failed</span>");
                }
                $("#Quick_Result").show();
            });   
        }
    });
    $("#pwdSend").click(function()
    {
        $("#pwd_Status").html("");
        if($("#fgtPwdForm").validate().form() == true)
        {
            
            var userId = $('#pwdReqId').val();
            var senderMail = $('input[name="pEmail"]').val();
            var subject = "Password recovery";
            //var msgbdy = $("#Contact_Msg").val();
            //            var success = "<span style='color:green;'>Message sent succesfully</span>";
            //            var fail = "<span style='color:red;'>Message sending failed</span>";
            //var statusMsg;
            //alert(userId);
            //alert(senderMail);
            $.post("login.do?mode=2&uId="+userId+"&email="+senderMail,function(data){
                //alert(data);
                if(data != 0){
                    $("#pwd_Status").html("<span style='color:green;'>Message sent succesfully</span>");
                    $('#pwdReqId').val("");
                    $('input[name="pEmail"]').val("");
                }
                else{
                    $("#pwd_Status").html("<span style='color:red;'>Sorry, User id doesn't exists</span>");
                    $('#pwdReqId').val("");
                    $('input[name="pEmail"]').val("");
                }
                $("#pwd_Status").show();
            });   
        }
    });
    
    
    //Register submit click
    $("#reg_Submit").click(function()
    {
       
        $("#Ref_response").html("");
        
        if($("#Reg_form").validate().form() == true)
        {
            var regId = $('input[name="reg_Id"]').val();
            var regName = $('input[name="reg_Name"]').val();
            var email = $('input[name="reg_Mail"]').val();
            var cPwd = $('input[name="reg_Con_Password"]').val();
            var pwd = $('input[name="reg_Password"]').val();
            var msg;
            $.post("login.do?mode=0&uId="+regId+"&pwd="+cPwd+"&name="+regName+"&email="+email,null,function(data){
                //alert(data);
                if(data == "true")
                {
                    msg = "<span style='color:green; font-weight:bold;'>Succesfully registered</span>";  
                    $('input[name="reg_Id"]').val("");
                    $('input[name="reg_Name"]').val("");
                    $('input[name="reg_Mail"]').val("");
                    $('input[name="reg_Con_Password"]').val("");
                    $('input[name="reg_Password"]').val("");
                    //alert( $('#agreeChk')[0]);
                    $('#agreeChk')[0].checked = false;
                }
                else
                {
                    msg = "<span style='color:red; font-weight:bold;'>Sorry user id or user already exists</span>";    
                }
                $("#Ref_response").show();
                $("#Ref_response").html(msg);
                
            });   
        }
    });
    
    $(document).keyup(function(evt){
        if(evt.keyCode == 27)
        {
            $('.form').slideUp();  
        }
    });
    
    //Search box functionality
    
    $("#search").focus(function(){
        if(this.value == "Search")
            this.value = "";
    });
    $("#search").focusout(function(){
        if(this.value == "" || this.value == null)
            this.value = "Search";
    });
    $("#sBtn").click(function(){
        
        });
});
//Register form
