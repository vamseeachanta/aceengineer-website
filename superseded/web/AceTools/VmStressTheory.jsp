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
        <link rel="stylesheet" href="css/ace.css" type="text/css">
        <script type="text/javascript" src="js/jquery-1.1.3.1.min.js"></script>
        <script type="text/javascript" src="js/jquery.easing.min.js"></script>
        <script type="text/javascript" src="js/jquery.lavalamp.min.js"></script>
        <script type="text/javascript" src="js/ShowEnvironments.js"></script>
        <script type="text/javascript" src="js/Toggle.js"></script>
        <script type="text/javascript" src="js/Tabs.js"></script>
        <script type="text/javascript">
            $(function(){
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
            })
        </script>
        <title>Theory</title>
    </head>
    <body>
        <center>
            <br>

            <table  width="990" class="content">
                <tr>
                    <td>
                        <table width="100%" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="360" valign="top" >
                                    <div align="left">
                                        <a href="http://aceengineer.com/">
                                            <img src="images/AceEngineer logo 320x129.jpg" height="83" width="200">
                                        </a></div>
                                </td>

                            </tr>
                        </table>
                        <!--                        <table width="100%" cellpadding="0" cellspacing="0" class="homeButtoninApp">
                                                    <tr>
                                                        <td width="20%" ><a href="http://aceengineer.com/AceEngineer/OGHome.html">Oil & Gas Home</a></td>
                                                                                        <td width="20%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                                                                        <td width="20%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                                                                        <td width="20%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                                                                        <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                                                    </tr>
                                                </table>-->
                        <table width="100%">
                            <tr >
                                <td valign="bottom" class="menu" colspan="2">
                                    <ul class="dropMenu">
                                        <li ><a class="active" href="http://aceengineer.com/AceEngineer/Home.html">Home</a></li>
                                        <li ><a href="http://aceengineer.com/AceEngineer/Services.html">Services</a></li>
                                        <li class="hasSubMenu"><a href="http://aceengineer.com/AceEngineer/applications.html">Applications</a>
                                            <ul class="subMenu ">
                                                <li><a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a></li>
                                                <li><a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a></li>
                                                <li><a href="http://aceengineer.com/StockAnalysis/">Stock Management</a></li>
                                                <li><a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a></li>
                                                <li><a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a></li>
                                                <li class="bottom_border"><a href="#">Fluid Mechanics</a></li>

                                            </ul>
                                        </li>
                                        <li class="hasSubMenu" ><a href="http://aceengineer.com/AceEngineer/aboutUs.html" >About Us</a>
                                        <li><a href="http://aceengineer.com/AceEngineer/Careers.html">Careers</a></li>
                                        <li><a href="http://aceengineer.com/AceEngineer/contactus.html">Contact Us</a></li>
                                    </ul>
                                </td>
                            </tr>
                        </table>

                        <ul id="maintab" class="basictab">
                            <li ><a href="VmChart.jsp">Charts & Input Values</a></li>
                            <li class="selected"><a href="">Theory</a></li>
                            <!--                                <li><a href="VmStressRecommendations.html">Recommendations</a></li>-->

                        </ul>


                        <script type="text/javascript">
                            //initialize tab menu, by passing in ID of UL
                            initalizetab("maintab")
                        </script>
                        <br><br>


                        <%--
                            this is used for give the what i do internal ---kd
                        --%>

                        <blockquote>
                            <p>
                                <b> A stress response of a pipe shall be dependent on the following physical properties of pipe (all properties supplied by user):</b>
                                <br><br>
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
                                <br><br>
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
                                <br><br>
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
                        </blockquote>
                    </td>
                </tr>
            </table>
        </center>
        <div id="Footer" style="border: 1px solid #ffffff">
            <table id="siteMap" width="990" align="center">
                <tr>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="http://aceengineer.com/AceEngineer/Home.html"><strong>Home</strong></a></li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/aboutUs.html"><strong>About Us</strong></a><br> 
                                <a href="http://aceengineer.com/AceEngineer/aboutUs.html">Mission and Values</a><br>
                                <a href="http://aceengineer.com/AceEngineer/aboutUs.html">History</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li> 
                                <a href="http://aceengineer.com/AceEngineer/Services.html"><strong>Services</strong></a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Financial Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Mechanical Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Civil and Structural Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Project Management Tools</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Web Designing and Web Hosting</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Mobile Apps development</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Business improvement plans</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/applications.html"><strong>Applications</strong></a><br>
                                <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a><br>
                                <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a><br>
                                <a href="http://aceengineer.com/StockAnalysis/">Stock Management</a><br>
                                <!--<a href="#">Heat Transfer</a><br>-->
                                <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a><br>
                                <a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a><br>
                                <a href="#">Fluid Mechanics</a><br>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/Careers.html"><strong>Careers</strong></a><br>
                                <a href="http://aceengineer.com/AceEngineer/Careers.html">Current Openings</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="http://aceengineer.com/AceEngineer/contactUs.html"><strong>Contact Us</strong></a></li>
                        </ul>
                    </td>
                </tr>
                <tr>

                    <td colspan="6" align="right" valign="baseline" style="border-bottom: 1px solid white;">
                        <label  style="color:white; vertical-align: top; font-size:16px; ">Follow us on :</label>
                        <a target="blank" href="http://www.facebook.com/AceEngineer?ref=hl"><img src="http://aceengineer.com/AceEngineer/res/images/Facebook-Buttons-1-10-.png"/></a>
                        <a target="blank" href="https://twitter.com/AceEngineer1"><img src="http://aceengineer.com/AceEngineer/res/images/twitter.png"/></a>
                        <a target="blank" href="https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"><img src="http://aceengineer.com/AceEngineer/res/images/Googleplus.png"/></a>
                        <a target="blank" href="http://www.linkedin.com/company/aceengineer"><img src="http://aceengineer.com/AceEngineer/res/images/linkin_icon.png"/></a>
                    </td>
                </tr>

                <tr align="center">
                    <td colspan="6">
                        <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas &nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis &nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management&nbsp;&Vert;&nbsp;</a>
                        <!--<a href="#">Heat Transfer&nbsp;&Vert;&nbsp;</a>-->
                        <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis&nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/DataManipulation/">Data Manipulation&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Fluid Mechanics</a><br>
                        <a href="http://aceengineer.com/AceEngineer/Terms-conditions.html">Terms & Conditions&nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/AceEngineer/Terms-conditions.html">Privacy policy</a>
                    </td>
                </tr>
                <tr align="center">
                    <td colspan="6" style="color:#ffffff;">
                        AceEngineer &copy; 2011, powered by PEPL
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>