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
        <script type="text/javascript" src="js/jquery-1.1.3.1.min.js"></script>
        <script type="text/javascript" src="js/jquery.easing.min.js"></script>
        <script type="text/javascript" src="js/jquery.lavalamp.min.js"></script>
        <script type="text/javascript" src="js/ShowEnvironments.js"></script>
        <script type="text/javascript" src="js/Toggle.js"></script>
        <script type="text/javascript" src="js/Tabs.js"></script>
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
        <title>Theory</title>
    </head>
    <body>
        <center>
            <br>

            <table cellpadding="0" cellspacing="0" width="1000" class="entire" style="font-size: 11pt" >
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
                        <table  align="center" cellpadding="0" cellspacing="0" class="header">
                            <ul id="maintab" class="basictab">
                                <li ><a href="demoChart.jsp">Charts & Input Values</a></li>

                                <li class="selected"><a href="">Theory</a></li>
<!--                                <li><a href="VmStressDemoRecommendations.html">Recommendations</a></li>-->
                            </ul>
                        </table>

                        <script type="text/javascript">
                            //initialize tab menu, by passing in ID of UL
                            initalizetab("maintab")
                        </script>
                        <br><br>


                        <%--
                            this is used for give the what i do internal ---kd
                        --%>
                        <font face="Tahoma">

                            <p>


                                <b> A stress response of a pipe shall be dependent on the following physical properties of pipe (all properties supplied by user):</b>
                                <br>
                                &rArr; External diameter, D<sub>o</sub>;
                                <br>
                                &rArr; Internal diameter, D<sub>i</sub>;
                                <br>
                                &rArr; Pipe wall thickness, t<sub>nom</sub>;
                                <br>
                                &rArr; Pipe tolerance (absolute negative tolerance value in %, typically 12.5), % tol;
                                <br>
                                &rArr; Internal corrosion, tcorr;
                                <br>
                                &rArr; Yield Strength, σ<sub>yield</sub>.
                                <br>
                            </p>

                            <p>


                                <b> The V M stress in a given pipe is evaluated by API-RP-2RD recommended practice and is dependent on the following loads on the pipe:</b>
                                <br>
                                &rArr; Bending moment, M (supplied by user);
                                <br>
                                &rArr; True axial force, N (assumed by programmer);
                                <br>
                                &rArr; Internal pressure (P<sub>i</sub>) (calculated by programmer);
                                <br>
                                &rArr; External pressure (P<sub>o</sub>) (supplied by user).
                                <br>

                                The VM stress, σ<sub>vm</sub> is given by:
                                <br>

                                σ<sub>vm</sub> = √(0.5[(σ<sub>Axial</sub> + σ<sub>Bend</sub> - σ<sub>Hoop</sub>)<sup>2</sup>   + (σ<sub>Hoop</sub> - σ<sub>Radial</sub>)<sup>2</sup> + (σ<sub>Radial</sub> - σ<sub>Axial</sub> - σ<sub>Bend</sub>)<sup>2</sup>])

                                <br>
                            </p>
                            <p>

                                Where:
                                <br>
                                σ<sub>Radial</sub> = - (P<sub>o</sub> D<sub>o</sub> + P<sub>i</sub> D<sub>i</sub>) / (D<sub>o</sub> + D<sub>i</sub>)
                                <br>
                                σ<sub>Hoop</sub> = (P<sub>i</sub> - P<sub>o</sub>) D<sub>o</sub> / 2 tmin - P<sub>i</sub>
                                <br>
                                σ<sub>Axial</sub> = N / (A<sub>o</sub> - A<sub>i</sub> )
                                <br>
                                σ<sub>Bend</sub>= M (D<sub>o</sub> - t<sub>nom</sub>) / 2 I
                                <br>
                            </p>
                            <p>


                                <b>  The steps for generating the plot is given below: </b>
                                <br>
                                &rArr; A true axial force, N is assumed
                                <br>
                                &rArr; Solve the equation  σ<sub>vm</sub> = 0.67 σ<sub>yield</sub> to calculate the values of internal pressure, P<sub>i</sub> satisfying this equation;
                                <br>
                                &rArr; Solve for pairs of N and P<sub>i</sub> ;
                                <br>
                                &rArr; Based on N, P<sub>i</sub> , P<sub>o</sub>, the effective tension,   is calculated;
                                <br>
                                &rArr; A plot of effective tension, teff  and P<sub>i</sub>  is generated;
                                <br>
                                &rArr; Solve the pairs of N and P<sub>i</sub>  for σ<sub>vm</sub> = 0.67 σ<sub>yield</sub> , σ<sub>vm</sub> = 0.80σ<sub>yield</sub> ,σ<sub>vm</sub> = 0.90 σ<sub>yield</sub> and σ<sub>vm</sub> = 1.00 σ<sub>yield</sub>
                                <br>
                            </p>

                        </font>
                        <table width="840" cellpadding="0" cellspacing="0" class="footer">
                            <tr>
                                <td>
                                    <div align="left">
                                        <a href="Home.jsp">Home</a><br/>
                                        Copyright &copy; AceEngineer powered by Prarohana
                                    </div>
                                </td>
                            </tr>
                        </table>
            </table>
        </center>
    </body>
</html>