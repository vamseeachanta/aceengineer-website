<%-- 
    Document   : header
    Created on : May 10, 2012, 10:49:30 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib  uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <!--        Page Title-->
        <title>JSP Page</title>
        <script>
            $(function()
            {	
                var data = $('#userPortfolio_DB_Data').html();
                data = eval("("+data+")");
                var userId = data.userId; 
                $("#settings").click(function(e) 
                {
                    $('.formFields').show();
                
                    $('.formFields','#dialog').find('input[type="password"]').val("");
                    $('#result','#dialog').html("");
                    //		 var id = $(this).attr('href');
                    var id = $("#dialog");
                    //Get the A tag
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
                    $("#dialog").show();
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
                
                    $.get("changeSettings.do?userId="+userId+"&curPass="+curPass+"&changePass="+changePass+"&mode="+0,null,function(data){
//                        alert("response is "+data);
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
                <script type="text/javascript">
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-38045252-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

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

        <!--        Includes All CSS-->
        <style type="text/css">
            .myLink{
                text-decoration: none;
                padding: 2px;  
            }

            .middleAlign{
                vertical-align: middle;
            }
        </style>

        <!--        Includes ALL JS-->
        <!--            Includes ALL Html Tags-->
    </head>
    <body>
        <table width="100%" border="0" class="header">
            <tr>
                <td>
                    <img src="res/images/logo.png"/>
                </td>
                <td style="text-align: right;">
                    Welcome, <bean:write name="name"/><img src="res/icons/user_ico.png" class="middleAlign"/> | 
                    <a id="settings" style="cursor: pointer;"> Settings <img src="res/icons/settings_ico.png" class="middleAlign"/> </a>| 
                    <a href="userHandler.do" class='myLink' title="logout From My Account" >Logout<img src="res/icons/logout_ico.png" class="middleAlign"/></a>
                    <br/>
                    <!--                    <img src="res/images/stockLogo.jpg" class="border10"/>-->
                    <img src="res/images/Stock4.jpg" class="border10"/>

                    <div id="boxes">
                        <div id="dialog" class="window">
                            <div align="right"><a href="#" class="close"><img src="res/images/close_button.png"/></a></div>
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
                    <div id="mask"></div>        
                    <div id="userPortfolio_DB_Data" style="display: none">
                        <logic:present name="tickersBean">
                            <bean:write name="tickersBean" />
                        </logic:present>
                    </div>
                </td>
            </tr>
        </table>        
    </body>
</html>
