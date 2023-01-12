<%-- 
    Document   : header
    Created on : Sep 11, 2012, 10:54:22 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib  uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<!DOCTYPE html>

<head>
    <script>

        $(document).ready(function() {	

            //select all the a tag with name equal to modal
            $('a[name=modal]').click(function(e) 
            {
                //Cancel the link behavior
                e.preventDefault();
                
                $('.formFields','#dialog').show();
                $('.formFields','#dialog').find('input[type="password"]').val("");
                $('#result','#dialog').html("");
		
                //Get the A tag
                var id = $(this).attr('href');
	
                //Get the screen height and width
                var maskHeight = $(document).height();
                var maskWidth = $(window).width();
	
                //Set heigth and width to mask to fill up the whole screen
                $('#mask').css({'width':maskWidth,'height':maskHeight});
		
                //transition effect		
                $('#mask').fadeIn(500);	
                $('#mask').fadeTo("slow",0.8);	
	
                //Get the window height and width
                var winH = $(window).height();
                var winW = $(window).width();
              
                //Set the popup window to center
                $(id).css('top',  winH/2-$(id).height()/2);
                $(id).css('left', winW/2-$(id).width()/2);
	
                //transition effect
                $(id).fadeIn(2000); 
	
            });
	
            //if close button is clicked
            $('.window .close').click(function (e) 
            {
                //Cancel the link behavior
                e.preventDefault();
                $('#mask').hide();
                $('.window').hide();
            });		
	
            //if mask is clicked
            $('#mask').click(function () {
                $(this).hide();
                $('.window').hide();
            });	
            $('#changeBtn').click(function()
            {
                var curPass = $('input[name="curPass"]').val();
                var changePass = $('input[name="changePass"]').val();
                var conchangePass = $('input[name="conchangePass"]').val();
                if(curPass.length<1 || changePass.length<1 || conchangePass.length<1)
                {
                    $('#result').html("<h4 style='text-align:center;margin:0px;color:red'>Please Fill All the Fields</h4>")
                    return;
                }
                
                if(changePass.length<8 || conchangePass.length<8){
                    $('#result').html("<h4 style='text-align:center;margin:0px;color:red'>Password should require 8 characters</h4>")
                    return;
                }
                
                if(changePass != conchangePass){
                    $('#result').html("<h4 style='text-align:center;margin:0px;color:red'>Please Make Sure Confirm Password is Correct</h4>")
                    $('input[name="changePass"]').val("");
                    $('input[name="conchangePass"]').val("");
                    return;
                }
                $.get("login.do?mode=3&curPass="+curPass+"&changePass="+changePass+"&conchangePass="+conchangePass,null,function(data){
                    //alert(data);
                    if(data != 0){
                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:green'>Successfully changed the password</h4>");    
                        $('input[name="changePass"]').val("");
                        $('input[name="conchangePass"]').val("");
                        $('input[name="curPass"]').val("")
                    }
                    else{
                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:red'>Sorry! Wrong password entered. </h4>");
                        $('input[name="changePass"]').val("");
                        $('input[name="conchangePass"]').val("");
                        $('input[name="curPass"]').val("")
                    }
                    
                    //                    data = eval("("+data+")");
                    //                    if(data.state == 1)
                    //                    {
                    //                        $('.formFields','#dialog').hide();
                    //                        window.setTimeout(function(){
                    //                            $('#mask').trigger('click', null);
                    //                        }, 2000);
                    //                        
                    //                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:green'>"+data.msg+"</h4>");
                    //                    }
                    //                    else{                        
                    //                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:red'>"+data.msg+"</h4>");
                    //                    }                    
                    
                });
                //alert("testing: "+curPass)
                curPass = "";
                changePass = "";
                conchangePass = "";
            });
	
        });

    </script>
    <style type="text/css">
        a
        {
            color:#333;
            text-decoration:none;
        }
        a:hover, .myLabel:hover
        {
            color: #003251;
            text-decoration:none
        }
        #mask{
            position:absolute;
            left:0;
            top:0;
            z-index:9000;
            background-color:#000;
            display:none;
        }
        #boxes .window
        {
            position:absolute;
            left:0;
            top:0;
            width:440px;
            height:200px;
            display:none;
            z-index:9999;
            padding:20px; 

            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
            border-radius: 10px;

            -webkit-box-shadow: 2px 2px 2px lightblue;
            -moz-box-shadow: 2px 2px 2px lightblue;
            box-shadow: 2px 2px 2px lightblue;
        }
        #boxes #dialog
        {
            width:420px;
            height:203px;
            padding:10px;
            background-color:#ffffff;
        }
    </style>
</head>
<table>
    <tr>
        <td>
            Welcome,<img src="res/images/icon/user.png" class="middleAlign"/> <bean:write name="name"/> | 
            <a href="#dialog" name="modal" class="myLabel"><img src="res/images/icon/settings.gif" class="middleAlign" /> Settings  </a>| 
            <a href="login.do?mode=4" class='myLink' title="logout From My Account"><img src="res/images/icon/logout.png" class="middleAlign"/>Logout</a>
            <br/>
            <div id="boxes">
                <div id="dialog" class="window">
                    <div align="right"><a href="#" class="close"><img src="res/images/icon/close_button.png" /></a></div>
                    <div id="result"></div>
                    <div>
                        <table border="0" class="formFields">
                            <tr>
                                <td class="label">
                                    Current Password
                                </td>
                                <td>
                                    <input type="password" name="curPass"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">
                                    New Password
                                </td>
                                <td>
                                    <input type="password" name="changePass"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">
                                    Confirm Password
                                </td>
                                <td>
                                    <input type="password" name="conchangePass"/>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" align="right"><input type="submit" id="changeBtn" value="Change"/></td>
                            </tr>
                        </table>
                    </div>
                </div>

            </div>
            <!-- Mask to cover the whole screen -->
            <div id="mask"></div>
        </td>
    </tr>
</table>


