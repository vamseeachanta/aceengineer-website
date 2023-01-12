<%--
    Document   : TabsTest3
    Created on : 26 Apr, 2011, 3:51:06 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" />
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">
        
        <script type="text/javascript" src="js/ShowEnvironments.js"></script>
        <script type="text/javascript" src="js/Toggle.js"></script>
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
        
        <title>Charts & Input Values</title>
    </head>
    <body>
        <center>

            <br>
            <table cellpadding="0" cellspacing="0" width="1000" class="entire" >
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
                        <br>
                         <ul id="maintab" class="basictab">
                            <li class="selected"><a href="#">Charts & Input Values</a></li>

                            <li><a href="VmStressDemoThoery.jsp">Theory</a></li>
<!--                            <li><a href="VmStressDemoRecommendations.html">Recommendations</a></li>-->
                        </ul>

                        <script type="text/javascript">
                            //initialize tab menu, by passing in ID of UL
                            initalizetab("maintab")
                        </script>
                        <br><br>
                        <table class="table1">
                            <tr>
                                <td><img src="./DemoImages/chart.JPG" alt="null" align="center" ></td
                            </tr>
                            <tr>
                                <td><img src="./DemoImages/chart1.JPG" alt="null" align="center" ></td>
                            </tr>
                        </table>

                        <%--
                                back to input page
                        --%>
                        <h3><center>INPUT ECHO</center></h3>
                        <a href="vmStressCheck.jsp">
                            <font color="red">
                                <b>
                                    back to inputs page
                                </b>

                            </font>
                        </a>
                        <%--
                            this is used for give the inputvalues table ---kd
                        --%>

                        <table border="1" >
                            <tr><h3>Pipe Properties</h3></tr>
                <tr>
                    <td width="300">External Diameter, D<sub>o</sub> (inch)</td>
                    <td width="300">7.0000</td>

                </tr>
                <tr>
                    <td width="300">
                        Pipe Wall Thickness, t<sub>nom</sub> (inch)
                    </td>
                    <td width="300">
                        0.4530
                    </td>

                </tr>
                <tr>
                    <td width="300">
                        Inner Diameter, D<sub>i</sub> (inch)
                    </td>
                    <td width="300">
                        6.0940
                    </td>
                </tr>
                <tr>
                    <td width="300">
                        Pipe Tolerance (%)
                    </td>
                    <td width="300">
                        12.5
                    </td>
                </tr>

                <tr>
                    <td width="300">
                        Internal Corrosion, t<sub>corr</sub> (inch)
                    </td>
                    <td width="300">
                        0.0010
                    </td>
                </tr>
            </table>
            <font color="red" size="2">Note:
                Not a Standard Pipeline as per API-5L
            </font>
            <br>




            <table border="1" cellpadding="0" cellspacing="1" class="table1">
                <tr><center><h3>Pipe Material</h3></center></tr>
                <tr>
                    <td width="300">
                        Yield Strength, E (ksi)
                    </td>
                    <td width="300">
                        109E0
                    </td>
                </tr>
            </table>
            <br>



            <table border="1" cellpadding="0" cellspacing="1" class="table1">
                <tr><center><h3>Loads on Pipe</h3></center></tr>
                <tr>
                    <td width="300">
                        Bending Moment, M (kNm)
                    </td>
                    <td width="300">
                        29.2962
                    </td>
                </tr>

                <tr>
                    <td width="300">
                        External Pressure, P<sub>o</sub> (Pa)
                    </td>
                    <td width="300">
                        0
                    </td>
                </tr>
            </table>



        </table>
    </center>

</body>
</html>
