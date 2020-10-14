<%-- 
    Document   : Applications
    Created on : 1 Jul, 2011, 2:33:08 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">
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
        <title>Applications</title>
    </head>
    <body>
        <div align="center">
            <table cellpadding="0" cellspacing="0" width="840" class="entire">
                <tr>
                    <td>
                        <table  align="center" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="200">
                                    <img src="images/AceEngineer logo 320x129.jpg" width="150" height="70">
                                </td>
                                <td>
                                    <ul class="lavaLampWithImage" id="1">
                                        <li><a href="Home.jsp">Home</a></li>
                                        <li class="current"><a href="Applications.jsp">Applications</a></li>
                                        <li><a href="Services.jsp">Services</a></li>
                                        <li><a href="AboutUs.jsp">About Us</a></li>

                                    </ul>
                                </td>
                            </tr>
                        </table>
                        <table align="center">
                            <tr>
                                <td>
                                    <table cellpadding="1" cellspacing="1">
                                        <tr>
                                            <td> <a href="LSJCheck.jsp"><img src="images/rig 1.jpg" width="200" height="150"/><br>FEA Properties</a> </td>
                                            <td> <a href="Shear7FileComparison.jsp"><img src="images/plans.jpg" width="200" height="150"/><br>Shear7 File Comparison</a> </td>
                                        </tr>
                                        <tr>
                                            <td> <a href="Login.jsp"><img src="images/rig 2.jpg" width="200" height="150"/><br>Riser Database</a> </td>
                                            <td> <a href="vmStressCheck.jsp"><img src="images/rig3.jpg" width="200" height="150"/><br>VM Stress Utilization</a> </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                            <tr>
                                <td width="500">
                                    <div align="left">
                                        <a href="Home.jsp">Home</a><br/>
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