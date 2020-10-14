<%--
    Document   : AboutUs
    Created on : 17 May, 2011, 11:21:04 PM
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
        <title>::Services</title>
    </head>
    <body>
        <div align="center">
            <table cellpadding="0" cellspacing="0" width="840" class="entire">
                <tr>
                    <td>
                        <table width="840" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="360" valign="top" >
                                    <div align="left">
                                        <a href="Home.jsp">
                                            <img src="images/AceEngineer logo 320x129.jpg" height="70" width="150">
                                        </a></div>
                                </td>

                            </tr>
                        </table>
                         <table width="100%" cellpadding="0" cellspacing="0" class="nav">
                            <tr>
                                <td width="20%" class="nav-a"><a href="Home.jsp">Home</a></td>
                                <td width="20%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                <td width="20%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                <td width="20%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                            </tr>
                        </table>
                          <table>
                            <tr>
                                <td>
                                    <table>
                                        <tr>
                                            <td>
                                                <h1>Services</h1>

                                                <p style="font-size: 11pt" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;At AceEngineer, we provide quality financial and engineering software application services. We offer time and budget saving services that meet the organizational objectives of our clients. Our services are constantly monitored for quality to ensure delivery of client desired solutions and maintain client satisfaction. We have world class expertise with financial and engineering leads having undergraduate degrees from IITs in India and graduate (Masters) degrees from US.</p>
                                                <p style="font-size: 11pt" >Key engineering aspects that we bring based on our experience are the need for verifying day to day mathematical and engineering problems through simplified examples.<br> We also support varying key input parameters where possible as this will help in validating: <br>
                                                    &rArr; Complex Mathematical Models<br>
                                                    &rArr; Non-Linear finite element analysis with various phenomenon</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><p style="font-size: 11pt">We can provide software application services of our clients in the following areas:</p><br>
                                                <h3>Financial Engineering</h3><br>

                                                <p style="font-size: 11pt">&rArr; Data analysis and trend analysis (technical analysis)<br>
                                                    &rArr; Statistics<br>
                                                    &rArr; Stochastic models</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <h3>Mechanical Engineering</h3><br>
                                                <p style="font-size: 11pt">We can provide software application services for our clients in the following areas: <br>
                                                    &rArr; Control system engineering.<br>
                                                    &rArr; Mass transfer, Heat transfer and fluid mechanics.<br>
                                                    &rArr; Strength of materials and fracture mechanics.<br>
                                                </p>
                                        </tr>
                                        <tr>
                                            <td>
                                                <h3>Civil and Structural Engineering</h3><br>
                                                <p style="font-size: 11pt">
                                                    &rArr; Structural engineering.<br>
                                                    &rArr; Soil mechanics.<br>
                                                    &rArr; Hydrology and fluid mechanics.<br>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>

                                                <h3>Project Management Tools</h3><br>
                                                <p style="font-size: 11pt">
                                                    &rArr; Customized tools for lean manufacturing.<br>
                                                    &rArr; Optimization of resources, process improvement and increased efficiency.<br>
                                                </p>
                                            </td>
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
