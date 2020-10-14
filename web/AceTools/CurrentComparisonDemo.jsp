<%--
    Document   : TabsTest3
    Created on : 26 Apr, 2011, 3:51:06 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" />
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" media="screen">
       <script type="text/javascript" language="javascript" src="js/Tabs.js">
        </script>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
        <script type="text/javascript" src="js/comment.js"></script>
        <script src="stickynote.js"></script>


        <script>
            var unqiuevar=new stickynote({
                content:{divid:'test', source:'inline'},
                pos:['right', 'top'],
                showfrequency:'always'

            })
        </script>
    <div id="test" class="stickynote">
        <h3>
            <a href="#" id="commentLink" onclick="return handleClick()">Comment Here</a></h3>
    </div>
        <title>Current Comparison</title>
    </head>
    <body>
        <div align="center">
            <table width="840" cellpadding="0" cellspacing="0" class="entire">
                <tr>
                    <td>
                        <table width="740" cellpadding="0" cellspacing="0" class="header">
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

                                    <ul id="maintab" class="basictab">
                                        <li class="selected"><a href="#">Currents</a></li>
                                        <li><a href="ComparisonOfPowerRatiosDemo.jsp"> Modal Power ratios</a></li>
                                        <li><a href="LiftCoefficientComparisonDemo.jsp">Lift Coefficient  </a></li>
                                        <li><a href="ResultComparisonDemo.jsp">Stress,Displacement,Damage</a></li>
                                        <li><a href="Shear7Recommendation.html">Recommendations</a></li>
                                    </ul>
                                    <br>

                                    <p style="font-size: 11pt" align="center">
                                        This is a Demo given for two OUT files <a href="DemoFiles/VIV030E3.out" target="_blank">VIV020E3.out</a> and <a href="DemoFiles/VIV030E3.out" target="_blank">VIV030E3.out</a><br><br>
                                        &rArr;	One of the primary input driving the simulation response<br>
                                        &rArr;	The magnitude of current is directly proportional to the damage of the riser. Higher current speeds shall usually give higher damage<br>
                                        &rArr;	Low shear current (slab current) can give higher damage compared to the high sheared current<br>
                                    </p><br>
                                    <table>
                                        <tr>
                                            <td align="right">
                                                <a href="Shear7FileComparison.jsp" title=" navigates to file inputs page"  >Back to Inputs Page</a>
                                            </td>
                                        </tr>
                                    </table><br>
                                    <img src="DemoImages/currentCompare.JPG" alt="Current Comparison" align="middle">
                                </td>
                            </tr>

                            <script type="text/javascript">
                                //initialize tab menu, by passing in ID of UL
                                initalizetab("maintab")
                            </script>
                            <br>

                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                            <tr>
                                <td>
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
