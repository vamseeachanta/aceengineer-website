<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean"%>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<head>
    <script type="text/javascript">
        function logout(){
            $.get("employeeHandler.do?mode=2",null,function(data){
                window.location = "Login.jsp";
            });
        }
        
    </script>
    <script type="text/javascript" src="res/js/latest.pack.js"></script>
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
                
                if(changePass != conchangePass){
                    $('#result').html("<h4 style='text-align:center;margin:0px;color:red'>Please Make Sure Confirm Password is Correct</h4>")
                    $('input[name="changePass"]').val("");
                    $('input[name="conchangePass"]').val("");
                    return;
                }
                
                $.get("employeeHandler.do?mode=6&curPass="+curPass+"&changePass="+changePass+"&conchangePass="+conchangePass,null,function(data){
                    data = eval("("+data+")");
                    if(data.state == 1)
                    {
                        $('.formFields','#dialog').hide();
                        window.setTimeout(function(){
                            $('#mask').trigger('click', null);
                        }, 2000);
                        
                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:green'>"+data.msg+"</h4>");
                    }
                    else{                        
                        $('#result').html("").append("<h4 style='text-align:center;margin:0px;color:red'>"+data.msg+"</h4>");
                    }                    
                    
                });
                //alert("testing: "+curPass)
                curPass = "";
                changePass = "";
                conchangePass = "";
            });
	
        });

    </script>
    <style>

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

    <style type='text/css'>
        .myLabel{
            padding: 5px 10px;
            color: #088fff;
            margin: 2px;
            display: inline-block;
            cursor: pointer;

            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
        }
        .mySetting{
            width: 22px;
            height: 18px;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<table width="100%">
    <tr>
        <td><img src="res/images/icons/logo.png"></img></td>
        <td align="right" style="vertical-align: bottom">            
            <label class="myLabel">
                <logic:equal name="LoginActionFormBean" property="authority" value="0">
                    <img src="res/images/icons/user.png" alt="admin"/>
                </logic:equal>
                <logic:notEqual name="LoginActionFormBean" property="authority" value="0">
                    <img src="res/images/icons/admin.png" alt="admin"/>
                </logic:notEqual>
                <bean:write name="LoginActionFormBean" property="empnameinfo"/>                
            </label>

            <a href="#dialog" name="modal" class="myLabel"><img src="res/images/icons/settings.gif" alt=""/>&nbsp;Settings</a>
            <label class="myLabel" onclick="logout();"><img src="res/images/icons/logout.png" />&nbsp;Logout</label>

            <div id="boxes">
                <div id="dialog" class="window">
                    <a href="#" class="close"><img src="res/images/icons/close_button.png" /></a>
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

            <!--            <label class="mySetting" onclick="setting();" name="modal"><img src="res/images/icon.png" class="mySetting"/></label>-->

        </td>
    </tr>
</table>



