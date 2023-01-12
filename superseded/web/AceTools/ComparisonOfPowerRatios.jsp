<%--
    Document   : TabsTest3_1
    Created on : 26 Apr, 2011, 4:09:35 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib  uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib  uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<%@taglib  uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib  uri="http://struts.apache.org/tags-nested" prefix="nested" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
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

    <title>Comparison of Power Ratios</title>
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
                                    <li class="selected"><a href="#">Modal Power ratios</a></li>
                                    <li><a href="LiftCoefficientComparison.jsp">Lift Coefficient </a></li>
                                    <li><a href="ResultComparison.jsp">Stress,Displacement,Damage</a></li>
                                </ul>
                                <br>
                                <p style="font-size: 11pt">
                                    &rArr;	The number of modes above power cut-off are given a power ratio which will determine the extent of influence of each mode<br>
                                    &rArr;	If only one mode is above power cut-off, then it is single-mode response else it is multi-mode response<br>
                                    &rArr;	For single mode response for 2 current profiles, the current profile that excites higher mode has higher damage rate<br>
                                    &rArr;  A multi-mode response when compared to single mode response:<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp; &rArr;	can be less damaging provided the bandwidths used are recommended shear7 inputs. This is valid till Shear7 version 4.4. <br>
                                    &nbsp;&nbsp;&nbsp;&nbsp; &rArr;	For Shear7 Version 4.5, time sharing is used and can be dependent on how the timesharing is done between modes and is difficult to make a firm conclusion<br>
                                    &rArr;	When multi-mode response for 2 current profiles, the current profile that excites higher mode has higher damage rate
                                </p>
                            </td>
                        </tr>
                    </table>
                    <table align="center">
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
                                    <thead><center><b><font size="3pt">Modal Power Ratios</font></b></center></thead>
                                    <tr>
                                        <td><b>File Name</b></td>
                                        <logic:iterate id="Filename" name="FileComparisonForm" property="liftCoffFileNames">
                                            <td align="center"><bean:write name="Filename"/></td>
                                        </logic:iterate>
                                    </tr>
                                    <tr>
                                        <td><b>Mode Number</b></td>
                                        <logic:iterate id="modes" name="FileComparisonForm" property="modeNumbers">
                                            <td align="center"><bean:write name="modes"/></td>
                                        </logic:iterate>
                                    </tr>
                                    <tr>
                                        <td><b>Power Ratios</b></td>
                                        <logic:iterate id="modesValues" name="FileComparisonForm" property="modevalues">
                                            <td align="center"><bean:write name="modesValues"/></td>
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
                                <img src="./images/PowerRatios.JPG" align="middle">
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
