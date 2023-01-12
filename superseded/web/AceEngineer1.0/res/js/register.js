///* 
// * To change this template, choose Tools | Templates
// * and open the template in the editor.
// */
//
//
//$(function(){
//    $('#RegisterForm').click(function()
//    {
//                    
//        $('body').append($('.RegisterDiv'));
//        $('.layer').fadeTo(0,0,null).fadeTo(1000,0.50,function(){
//            $('.RegisterDiv').                            
//            slideDown(500,null).
//            css({
//                'left':($(document).width()-$('.RegisterDiv').width())/2
//                ,
//                'top':0
//            });
//        });
//    });
//                
//    $('.layer').click(function(){
//        $('.RegisterDiv').slideUp(200);
//        $('.layer').fadeOut(500, null);
//    });
//    
//    
//    window.onkeydown =function(evt){
//        if(evt.keyCode == 27)
//        {
//            $('.RegisterDiv').slideUp(200);
//            $('.layer').fadeOut(500, null); 
//        }
//    }        
//                
//    $('.RegisterDiv').click(function(evt){
//        //evt.stopPropagation();
//        });
//    $("#reg_Submit").click(function()
//    {
//        formValid = $("#Reg_form").validate(
//        {
//            rules: {
//                reg_Name: {
//                    required: true,
//                    FN: true,
//                    minlength: 2,
//                    maxlength: 25
//                },
//                reg_Mail: {
//                    required: true,
//                    email: true,
//                    minlength: 2
//                },
//                reg_Password: {
//                    required: true,
//                    minlength: 8
//                },
//                reg_Con_Password: {
//                    required: true,
//                    equalTo : $("#reg_Password")[0],
//                    minlength: 8
//                },
//                //                            mobileNo: {
//                //                                number: true,
//                //                                phNo: true,
//                //                                minlength: 9
//                //                            },
//                checkbox:
//                {
//                    required: true
//                }
//            },
//            messages: {
//                reg_Name: {
//                    required: "Required",
//                    FN: "only characters required!",
//                    minlength: jQuery.format("At least {0} characters required!")
//                },
//                reg_Mail:
//                {
//                    required: "Required",
//                    email: "Enter correct email-id"
//                //minlength: jQuery.format("At least {0} characters required!")
//                },
//                reg_Password:
//                {
//                    required: "Required",
//                    minlength: jQuery.format("At least {0} required!")
//                },
//                reg_Con_Password: {
//                    required: "Required",
//                    minlength: jQuery.format("At least {0} required!"),
//                    equalTo:"Confirm Doesn't Match"
//                },
//                //                            mobileNo: {
//                //                                phNo: "please enter number",
//                //                                minlength: jQuery.format("At least {0} required!")
//                //                            },
//                checkbox:
//                {
//                    required: "Please accept the terms & conditions"
//                }
//
//            },
//            errorPlacement: function(error, element)
//            {
//                var span = error;
//                var pos = $(element).position();
//                $(span).css({
//                    'position':'absolute',
//                    'padding':'1px',
//                    'font-size':'12px',
//                    'background':'red',
//                    'color':'white',
//                    'border':'red',
//                    '-webkit-border-radius':'2px',
//                    '-webkit-box-shadow':'3px 3px 3px black',
//                    'display':'block',
//                    'left':pos.left+$(element).outerWidth(),
//                    'top':pos.top
//                });
//                $(span).appendTo(element.parent());
//            },
//            success: function(label){
//                $(label).remove();
//                
//            }
//        });
//        
//        $.validator.addMethod('FN', function (value) {
//            return /^[a-zA-Z]+$/.test(value);
//        });
//    //                    $.validator.addMethod('CC', function (value) {
//    //                        return /^[a-zA-Z]+$/.test(value);
//    //                    });
//    //                    $.validator.addMethod('EE', function (value) {
//    //                        return /^[a-zA-Z]+$/.test(value);
//    //                    });
//    //                    $.validator.addMethod('ED', function (value) {
//    //                        return /^[a-zA-Z]+$/.test(value);
//    //                    });
//    //                    $.validator.addMethod('phNo', function (value) {
//    //                        return /^[0-9]+$/.test(value);
//    //                    });
//    //alert($("#loginForm").validate().form());
//    //alert($(formValid).validate().form());
//    });
//});

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


$(function(){
    // alert("register load");
    $('#RegisterForm').click(function()
    {
        
        $('body').append($('.RegisterDiv'));
        $('.layer').fadeTo(0,0,null).fadeTo(1000,0.50,function(){
            $('.RegisterDiv').                            
            slideDown(500,null).
            css({
                'left':($(document).width()-$('.RegisterDiv').width())/2
                ,
                'top':0
            });
        });
    });
    //Escape key event to close the overlay div
    
    
    window.onkeydown =function(evt){
        if(evt.keyCode == 27)
        {
            $('.RegisterDiv').slideUp(200);
            $('.QC').slideUp(200);
            $('.FP').slideUp(200);
            $('.layer').fadeOut(500, null); 
        }
    }    
           
    $('.layer').click(function(){
        $('.RegisterDiv').slideUp(200);
        $('.QC').slideUp(200);
        $('.FP').slideUp(200);
        $('.layer').fadeOut(500, null);
    });
                
    $('.RegisterDiv').click(function(evt){
        //evt.stopPropagation();
        });
        
    $('#QCForm').click(function()
    {
                    
        $('body').append($('.QC'));
        $('.layer').fadeTo(0,0,null).fadeTo(1000,0.50,function(){
            $('.QC').                            
            slideDown(500,null).
            css({
                'left':($(document).width()-$('.QC').width())/2
                ,
                'top':($(document).height()-$('.QC').width())/2
            });
        });
    });
    
    $('#fgtPwd').click(function()
    {
                    
        $('body').append($('.FP'));
        $('.layer').fadeTo(0,0,null).fadeTo(1000,0.50,function(){
            $('.FP').                            
            slideDown(500,null).
            css({
                'left':($(document).width()-$('.FP').width())/2
                ,
                'top':($(document).height()-$('.FP').width())/3
            });
        });
    });
       
    //Validations for Forgot password
    formValid = $("#fgtPwdForm").validate(
    {
        rules: {
            uId: {
                required: true,
                //FN: true,
                minlength: 2,
                maxlength: 25
            },
            pEmail: {
                required: true,
                email: true,
                minlength: 2
            }
            
            
        //                            mobileNo: {
        //                                number: true,
        //                                phNo: true,
        //                                minlength: 9
        //                            },
           
        },
        messages: {
            uId: {
                required: "Required"
            //FN: "only characters required!",
            // minlength: jQuery.format("At least {0} characters required!")
            },
            pEmail:
            {
                required: "Required",
                email: "invalid email-id"
            //minlength: jQuery.format("At least {0} characters required!")
            }
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
                        
    });
 
    //
    //Validations for Register From
    //$("#reg_Submit").click(function()
    //{
    formValid = $("#Reg_form").validate(
    {
        rules: {
            reg_Name: {
                required: true,
                FN: true,
                minlength: 2,
                maxlength: 25
            },
            reg_Mail: {
                required: true,
                email: true,
                minlength: 2
            },
            reg_Password: {
                required: true,
                minlength: 8
            },
            reg_Con_Password: {
                required: true,
                equalTo : $("#reg_Password")[0],
                minlength: 8
            },
            //                            mobileNo: {
            //                                number: true,
            //                                phNo: true,
            //                                minlength: 9
            //                            },
            checkbox:
            {
                required: true
            }
        },
        messages: {
            reg_Name: {
                required: "Required",
                FN: "only characters required!",
                minlength: jQuery.format("At least {0} characters required!")
            },
            reg_Mail:
            {
                required: "Required",
                email: "Enter correct email-id"
            //minlength: jQuery.format("At least {0} characters required!")
            },
            reg_Password:
            {
                required: "Required",
                minlength: jQuery.format("At least {0} required!")
            },
            reg_Con_Password: {
                required: "Required",
                minlength: jQuery.format("At least {0} required!"),
                equalTo:"Confirm Doesn't Match"
            },
            //                            mobileNo: {
            //                                phNo: "please enter number",
            //                                minlength: jQuery.format("At least {0} required!")
            //                            },
            checkbox:
            {
                required: "Please accept the terms & conditions"
            }

        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
                        
    });
    $.validator.addMethod('FN', function (value) {
        return /^[a-zA-Z]+$/.test(value);
    });
    //});
    //Validation for Feed_Back Form
    
    // $("#feedback_Submit").click(function()
    //{
    formValid = $("#form").validate(
    {
        rules: {
            senderName: {
                required: true,
                // FN: true,
                minlength: 2,
                maxlength: 25
            },
            Email: {
                required: true,
                email: true,
                minlength: 2
            },
            Subject: {
                required: true,
                minlength: 2,
                maxlength: 25
            },
            msgBody: {
                required: true
            }
               
        },
        messages: {
            senderName: {
                required: "Required",
                FN: "only characters required!",
                minlength: jQuery.format("At least {0} characters required!")
            },
            Email:
            {
                required: "Required",
                email: "Enter correct email-id"
            //minlength: jQuery.format("At least {0} characters required!")
            },
            Subject: {
                required: "Required",
                minlength: jQuery.format("At least {0} characters required!")
            },
            msgBody: {
                required: "Required"
            }

        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                //                    'left':pos.bottom+$(element).outerWidth(),
                'left':pos.left+180,
                'top':pos.top+20
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
                        
    });
        
    $.validator.addMethod('FN', function (value) {
        return /^[a-zA-Z]+$/.test(value);
    });
    // });
    
    // Validation for Quick_Contact
    
    //$("#Quick_Submit").click(function()
    //{
    formValid = $("#Quick_Form").validate(
    {
        rules: {
            Contact_Name: {
                required: true,
                FN: true,
                minlength: 2,
                maxlength: 25
            },
            Contact_Email: {
                required: true,
                email: true,
                minlength: 2
            },
            Contact_ph: {
                //required: true,
                //email: true,
                number:true,
                minlength: 10
            },
            Contact_Msg: {
                required: true
            }
               
        },
        messages: {
            Contact_Name: {
                required: "Required",
                FN: "only characters required!",
                minlength: jQuery.format("At least {0} characters required!")
            },
            Contact_Email:
            {
                required: "Required",
                email: "Enter correct email-id"
            //minlength: jQuery.format("At least {0} characters required!")
            },
            Contact_ph:
            {
                
                
            //minlength: jQuery.format("At least {0} characters required!")
            },
            Contact_Msg: {
                required: "Required"
            }

        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                //                    'left':pos.bottom+$(element).outerWidth(),
                'left':pos.left+180,
                'top':pos.top+20
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
                        
    });
        
    $.validator.addMethod('FN', function (value) {
        return /^[a-zA-Z]+$/.test(value);
    });
    //});
    
    
    //alert($('.submitBtn'));
    //Login form
    $('.LoginSub').click(function()
    
    {
            formValid = $("#loginForm").validate(
            {
                rules: {
                    uId: {
                        required: true,
                        //FN: true,
                        minlength: 2,
                        maxlength: 25
                    },
                
                    pwd: {
                        required: true
                    //minlength: 8
                    },
                    //                            mobileNo: {
                    //                                number: true,
                    //                                phNo: true,
                    //                                minlength: 9
                    //                            },
                    checkbox:
                    {
                //  required: true
                }
                },
                messages: {
                    uId: {
                        required: "Required",
                        FN: "only characters required!",
                        minlength: jQuery.format("At least {0} characters required!")
                    },
                    reg_Mail:
                    {
                        required: "Required",
                        email: "Enter correct email-id"
                    //minlength: jQuery.format("At least {0} characters required!")
                    },
                    pwd:
                    {
                        required: "Required",
                        minlength: jQuery.format("At least {0} required!")
                    },
                
                    //                            mobileNo: {
                    //                                phNo: "please enter number",
                    //                                minlength: jQuery.format("At least {0} required!")
                    //                            },
                    checkbox:
                    {
                //  required: "Please accept the terms & conditions"
                }

                },
                errorPlacement: function(error, element)
                {
                    var span = error;
                    var pos = $(element).position();
                    $(span).css({
                        'position':'absolute',
                        'padding':'1px',
                        'font-size':'12px',
                        'background':'red',
                        'color':'white',
                        'border':'red',
                        '-webkit-border-radius':'2px',
                        '-webkit-box-shadow':'3px 3px 3px black',
                        'display':'block',
                        'left':pos.left+$(element).outerWidth(),
                        'top':pos.top
                    });
                    $(span).appendTo(element.parent());
                },
                success: function(label){
                    $(label).remove();
                }
                        
            });
            $.validator.addMethod('FN', function (value) {
                return /^[a-zA-Z]+$/.test(value);
            });
        });
});