<%--
    Document   : TabsTest3_2
    Created on : 26 Apr, 2011, 4:10:51 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <%@taglib  uri="http://struts.apache.org/tags-html" prefix="html" %>
        <%@taglib  uri="http://struts.apache.org/tags-bean" prefix="bean" %>
        <%@taglib  uri="http://struts.apache.org/tags-logic" prefix="logic" %>
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
        <title>::Lift Coefficient Comparison</title>
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

                        <table width="100%">
                            <tr>
                                <td>
                                    <ul id="maintab" class="basictab">
                                        <li><a href="CurrentComparison.jsp">Currents</a></li>
                                        <li><a href="ComparisonOfPowerRatios.jsp">Modal Power ratios</a></li>
                                        <li class ="selected"><a href="#">Lift Coefficient </a></li>
                                        <li><a href="ResultComparison.jsp">Stress,Displacement,Damage</a></li>
                                        <li><a href="Shear7Recommendation.html">Recommendations</a></li>
                                    </ul>
                                    <br><p style="font-size: 11pt">

                                        &rArr; The higher magnitude of lift coefficient and the greater extent of coverage gives higher damage rates</p>
                                    <br>
                                </td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td align="right">
                                    <a href="Shear7FileComparison.jsp" title=" navigates to file inputs page"  >Back to Inputs Page</a>
                                </td>
                            </tr>
                        </table>
                        <table width="100%">
                            <tr>
                                <td>
                                    <table border="1" align="center">
                                        <thead><center><b><font size="3pt">No. of Modes Excited</font></b></center></thead>
                                        <tr>
                                            <td><b>File Name</b></td>
                                            <logic:iterate id="fileName" name="FileComparisonForm" property="fileNames">
                                                <td align="center"><bean:write name="fileName"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr>
                                            <td><b>No. Of Modes</b></td>
                                            <logic:iterate id="NoOfModes" name="FileComparisonForm" property="noOfModes">
                                                <td align="center"><bean:write name="NoOfModes"/></td>
                                            </logic:iterate>
                                        </tr>
                                    </table>
                                    <br>
                                    <table border="1" align="center">
                                        <thead><center><b><font size="3pt">Lift Coefficient Statistics</font></b></center></thead>
                                        <tr>
                                            <td><b> File Name</b></td>
                                            <logic:iterate id="fileName" name="FileComparisonForm" property="liftCoffFileNames">
                                                <td align="center"><bean:write name="fileName"/></td>
                                            </logic:iterate>
                                        </tr>

                                        <tr>
                                            <td><b> Mode Numbers</b></td>
                                            <logic:iterate id="Modes" name="FileComparisonForm" property="modeNumbers">
                                                <td align="center"><bean:write name="Modes"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr>
                                            <td><b>Average Lift Coefficient </b></td>
                                            <logic:iterate id="avgLift" name="FileComparisonForm" property="avgLiftCoff">
                                                <td align="center"><bean:write name="avgLift"/></td>
                                            </logic:iterate>
                                        </tr>
                                        <tr>
                                            <td><b>Maximum Lift Coefficient </b></td>
                                            <logic:iterate id="maxLift" name="FileComparisonForm" property="maxLiftCoff">
                                                <td align="center"><bean:write name="maxLift"/></td>
                                            </logic:iterate>
                                        </tr>

                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td>
                                    <br>
                                    <img src="./images/LiftCoefficient.JPG" alt="Lift Coefficient Comparison" align="middle">
                                    <script type="text/javascript">
                                        //initialize tab menu, by passing in ID of UL
                                        initalizetab("maintab")
                                    </script>
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

