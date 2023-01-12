<%--
    Document   : TabsTest3
    Created on : 26 Apr, 2011, 3:51:06 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib  uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib  uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib  uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" />
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" />
        <script type="text/javascript">
            //initialize tab menu, by passing in ID of UL
            initalizetab("maintab")
        </script>
        <script type="text/javascript" language="javascript">
            <jsp:include page="js/Tabs.js"/>
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
                                <td style="font-size: 11pt">
                                    <ul id="maintab" class="basictab">
                                        <li class="selected"><a href="#">Currents</a></li>
                                        <li><a href="ComparisonOfPowerRatios.jsp"> Modal Power ratios</a></li>
                                        <li><a href="LiftCoefficientComparison.jsp">Lift Coefficient  </a></li>
                                        <li><a href="ResultComparison.jsp">Stress,Displacement,Damage</a></li>
                                        <li><a href="Shear7Recommendation.html">Recommendations</a></li>
                                    </ul>
                                

                                   
                                    
                                    <p>&rArr; Current speed is one of the primary inputs driving the VIV response of the structure.<br>
                                        &rArr; For similar current profiles, typically, the magnitude of current speed is directly proportional to the damage of the riser. Higher current speeds shall usually give higher damage. This conclusion is also based on the assumption that modes of the structure are continuous and curvature is monotonically increasing.<br>
                                        &rArr; For dissimilar current profiles, low shear current (slab current) may give higher damage compared to the highly sheared currents<br>

                                    </p><br>
                                    <table>
                                        <tr>
                                            <td align="right">
                                                <a href="Shear7FileComparison.jsp" title=" navigates to file inputs page"  >Back to Inputs Page</a>
                                            </td>
                                        </tr>
                                    </table>

                                    <table cellspacing="2" cellpadding="2" align="center" border="1">
                                        <thead><center><b><font size="3pt">Current Statistics for the Shear7 Files</font></b></center></thead>
                                        <tr><td><b> File Name</b></td>
                                            <logic:iterate id="filename" property="fileNames" name="FileComparisonForm">
                                                <td align="center"><bean:write name="filename"/> </td>
                                            </logic:iterate></tr>
                                        <tr><td><b>Maximum Velocity (m/s)</b></td>
                                            <logic:iterate id="maxVel" property="maxVelocity" name="FileComparisonForm">
                                                <td align="center"><bean:write name="maxVel"/></td>
                                            </logic:iterate></tr>
                                        <tr><td><b>Average Velocity (m/s)</b></td>
                                            <logic:iterate id="maxAvgVel" property="maxAvgVelocity" name="FileComparisonForm">
                                                <td align="center"><bean:write name="maxAvgVel"/></td>
                                            </logic:iterate>
                                        </tr>
                                    </table><br>

                                    <img src="./images/currentCompare.JPG" alt="Current Comparison" align="middle" >
                                </td>
                            </tr>
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
