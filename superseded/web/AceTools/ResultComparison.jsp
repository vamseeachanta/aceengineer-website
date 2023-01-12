<%--
    Document   : 
    Created on : 26 Apr, 2011, 4:11:18 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
        <%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
        <%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" />
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" />

        <script type="text/javascript" src="js/Tabs.js"></script>
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
        <title>::Result Comparison</title>
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
                                        <li><a href="CurrentComparison.jsp">Currents</a></li>
                                        <li><a href="ComparisonOfPowerRatios.jsp">Modal Power ratios</a></li>
                                        <li><a href="LiftCoefficientComparison.jsp">Lift Coefficient</a></li>
                                        <li class="selected"><a href="#">Stress,Displacement,Damage</a></li>
                                        <li><a href="Shear7Recommendation.html">Recommendations</a></li>
                                    </ul>
                                    <br><br>
                                    <table>
                                        <tr>
                                            <td align="right">
                                                <a href="Shear7FileComparison.jsp" title=" navigates to file inputs page"  >Back to Inputs Page</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <table border="1" align="center">
                                        <thead><center><b><font size="3pt">Summary of the Results</font></b></center></thead>
                                        <tr><td><b>File Name</b> </td>
                                            <logic:iterate id="fileName" property="fileNames" name="FileComparisonForm">
                                                <td align="center"><bean:write name="fileName"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr><td><b>Max Displacement (m)</b> </td>
                                            <logic:iterate id="MaxDisp" property="maxRmsDisp" name="FileComparisonForm">
                                                <td align="center"><bean:write name="MaxDisp"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr><td><b>Max RMS A/D</b> </td>
                                            <logic:iterate id="maxRmsAd" property="maxRmsAD" name="FileComparisonForm">
                                                <td align="center"><bean:write name="maxRmsAd"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr><td><b>Max Stress (mpa)</b> </td>
                                            <logic:iterate id="maxStress" property="maxRmsStress" name="FileComparisonForm">
                                                <td align="center"><bean:write name="maxStress"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr><td><b>Max Damage (1 /year)</b> </td>
                                            <logic:iterate id="maxDamage" property="maxRmsDamage" name="FileComparisonForm">
                                                <td align="center"><bean:write name="maxDamage"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr><td><b>Unfactored Min Life (years)</b> </td>
                                            <logic:iterate id="unMinLife" property="unfactoredMinLife" name="FileComparisonForm">
                                                <td align="center"><bean:write name="unMinLife"/></td>
                                            </logic:iterate>
                                        </tr>
                                    </table>
                                    <br><br>
                                    <img alt="X/L and RMS Stress" src="./images/XLandRmsStress.JPG" align="middle"><br><br>
                                    <img alt="X/L and Displacement" src="./images/XLandDisplacement.JPG" align="middle"><br><br>
                                    <img alt="X/L and Damage" src="./images/XLandAD.JPG" align="middle">
                                    <script type="text/javascript">
                                        //initialize tab menu, by passing in ID of UL
                                        initalizetab("maintab")
                                    </script>
                                </td>
                            </tr>
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
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>

