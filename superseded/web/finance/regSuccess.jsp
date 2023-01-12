<%-- 
    Document   : regSuccess
    Created on : May 11, 2012, 10:24:23 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
        <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css" />
        <style type="text/css">
            .myLink{
                padding: 10px;
                text-decoration: none;
                background: url('res/images/button_1.jpg') repeat-x;
                color: white;
                font-size: 1.1em;
                display: inline-block;

                transition: all 1s;
                -moz-transition: all 1s; /* Firefox 4 */
                -webkit-transition: all 1s; /* Safari and Chrome */
                -o-transition: all 1s; /* Opera */
            }
            .myLink:hover{                
                opacity : 0.9;
                color: black;
                text-shadow: 0px 0px 2px red;
                -webkit-box-shadow: 0px 0px 10px black;
            }
        </style>

        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>        
        <script type="text/javascript">
            $(function(){
                $('#accountLink').click(function(){
                    if($('input[name="acceptCond"]').attr('checked') == undefined){
                        alert("Please Accept Terms and Conditions");
                        return false;
                    }                    
                });
            })
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
    </head>
    <body>
        <table class="bodyLayout" align="center">
            <tr>
                <td>
                    Hi,
                    <logic:present name="RegistrationForm">
                        <bean:write name="RegistrationForm" property="fName" />
                        <bean:write name="RegistrationForm" property="lName" />
                    </logic:present>
                    <logic:notPresent name="RegistrationForm">
                        Welcome Guest
                    </logic:notPresent>
                    Your Registration is Successful,
                    <br/>
                    You can login to your Account Now at any time with your login credentials<br/>
                    <textarea style="width:100%;height:200px" readonly="true">
                        Terms and Conditions Text will be placed Here........
                    </textarea>
                    <input type="checkbox" name="acceptCond" />I Accepted all the Terms and Conditions
                    <a href="login.do" class="myLink border10" id="accountLink">Go to My Account</a>
                </td>
            </tr>
        </table>        
    </body>
</html>
