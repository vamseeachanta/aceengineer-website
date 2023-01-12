<%-- 
    Document   : noChart
    Created on : Jun 30, 2011, 2:47:16 PM
    Author     : Dell
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/StyleSheet_1.css" type="text/css">
        <script type="text/javascript" src="js/jquery-1.1.3.1.min.js"></script>
        <script type="text/javascript" src="js/jquery.easing.min.js"></script>
        <script type="text/javascript" src="js/jquery.lavalamp.min.js"></script>
        <script type="text/javascript">
            $(function() {
                $("#1, #2, #3").lavaLamp({
                    fx: "backout",
                    speed: 700,
                    click: function(event, menuItem) {
                        return true;
                    }
                });
            });
        </script>
        <title>::About Us</title>
    </head>
    <body>
        <div align="center">
            <table cellpadding="0" cellspacing="0" width="1000" class="entire">
                <tr>
                    <td>
                        <table width="740" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="360" valign="top" >
                                    <div align="left">
                                        <a href="http://aceengineer.com">
                                            <img src="images/AceEngineer logo 320x129.jpg" height="83" width="200">
                                        </a></div>
                                </td>

                            </tr>
                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" class="homeButtoninApp">
                             <tr>
                                <td width="20%" ><a href="http://aceengineer.com/AceEngineer/OGHome.html">Oil & Gas Home</a></td>

                                <!--                                                    <td width="20%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                                                                    <td width="20%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                                                                    <td width="20%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                                                                    <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>-->
                            </tr>
                        </table>
                        <table align="center">
                            <tr>
                                <td>
                                    <h1><center>
                                            Chart can not be generated for this data.
                                            <br>

                                        </center></h1>
                                    <a href="vmStressCheck.jsp">
                                        <font color="red">
                                            <center>
                                                &lt;&lt; Click here to go back to inputs page
                                            </center>

                                        </font></a>
                                </td>
                            </tr>
                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                            <tr>
                                <td width="500">
                                    <div align="right">
                                        <a href="http://aceengineer.com">Home</a><br/>
                                        Copyright &copy; AceEngineer powered by Prarohana
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>


