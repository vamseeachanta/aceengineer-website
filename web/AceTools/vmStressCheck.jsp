<%-- 
    Document   : vmStressCheck
    Created on : 4 Jul, 2011, 12:23:39 AM
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
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/ace.css" type="text/css">
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">

        <script type="text/javascript" src="js/raphael-min.js"></script>        
        <script type="text/javascript" src="js/vmstress.js"></script>        

        <script type="text/javascript" src="js/Toggle.js"></script>


        <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>

        <!-- code Added by naga Srinivas -->
        <script type="text/javascript" src="js/NagaLib.js"></script>
        <script type="text/javascript" src="js/validations.js"></script>     
        <script type="text/javascript" src="js/core.js"></script>     


        <!-- code Added by naga Srinivas -->

        <!--        <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>-->

        <!--        <script type="text/javascript" src="js/comment.js"></script>-->


        <script type="text/javascript">
            window.onload = function(){
                showTextBox();
                registerSVGPipe();
                validateDiameter();
                //sBar.setAsSideBar(document.getElementById('sideBar'), {});
            };
            $(function(){
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
            })
        </script>


        <!--    <div id="test" class="stickynote">
                <h3>
                    <a href="#" id="commentLink" onclick="return handleClick()">Comment Here</a></h3>
            </div>-->
        <title>::V M Stress Inputs</title>
    </head>
    <body>
        <div align="center" id="bodyDiv">

            <table  width="990" class="content">
                <tr>
                    <td>
                        <table width="100%" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="360" valign="top" >
                                    <div align="left">
                                        <a href="http://aceengineer.com"/>
                                        <img src="images/AceEngineer logo 320x129.jpg" height="83" width="200"/>
                                        </a></div>
                                </td>

                            </tr>
                        </table>
                        <!--    <table width="100%" cellpadding="0" cellspacing="0" class="homeButtoninApp">
                              <tr>
                                     <td width="20%" ><a href="http://aceengineer.com/AceEngineer/OGHome.html">Oil & Gas Home</a></td>
      
                                                                                         <td width="20%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                                                                          <td width="20%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                                                                          <td width="20%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                                                                          <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                              </tr>
                          </table> -->

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
                        <html:form action="/vmStress" onsubmit="return validateVmForm();">

                            <h3><center>Pipe Capacity Utilization</center></h3>
                            <br>
                            <blockquote>
                                <p>
                                    This application determines the 67%, 80%, 90%, 100% pipe capacity envelopes with varying

                                    internal pressure & tension for given bending moment loading and external pressure.

                                </p>    
                            </blockquote>

                            <br>
                            <bean:write name="vmStressCheckForm" property="error" filter="false" />

                            <!--                            <p>&rArr; For sample calculation of this application, click
                                                            <a href="demoChart.jsp" >
                                                                <img src="images/cooltext537069825.png" onmouseover="this.src='images/cooltext537071818MouseOver.png';"
                                                                     onmouseout="this.src='images/cooltext537069825.png';" alt="Demo" align="center"/>
                                                            </a>
                                                        </p>-->

                            <blockquote>
                                <b>Title:</b>
                                <html:text property="title" size="100" title="Enter title that displays the heading for chart"></html:text>
                                </blockquote>



                                <blockquote>
                                    <table width="100%"  >
                                        <tr class="left" >
                                            <td>

                                                <table  width="100%" border="0" >

                                                    <tr >
                                                        <td width="300">External Diameter, D<sub>o</sub> (inch)</td>
                                                        <td><html:text property="outerDia" onchange="" /></td>
                                                    <td>
                                                        <div style="color:red"<html:errors property="OuterDia"  /></div>
                                                        <p id="outerDiaError"><!-- Client Side Validation Added by Srinivas --></p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="300"><html:radio property="selectOpt" value="thickness"  onclick="show()"/>Pipe Wall Thickness, t<sub>nom</sub> (inch)</td>
                                                    <td><html:text property="pipeWallThickness" onchange="limit1()" /></td>
                                                    <td>
                                                        <div style="color:red"<html:errors property="pipeWallThickness"/></div>
                                                        <p id="pipeWallThicknessError"><!-- Client Side Validation Added by Srinivas --></p>
                                                    </td>

                                                </tr>
                                                <tr>
                                                    <td width="300"><html:radio property="selectOpt" value="innerDia1" />Inner Diameter, D<sub>i</sub> (inch)</td>
                                                    <td><html:text property="innerDia" disabled="true" onchange="limit2()"  /></td>
                                                    <td>
                                                        <p id="innerDiaError"><!-- Client Side Validation Added by Srinivas --></p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="300"> Pipe Tolerance (%) </td>
                                                    <td><html:text property="tolerance" onchange="limit3()"   /></td>
                                                    <td>
                                                        <div style="color:red"<html:errors property="tolerance"/></div>
                                                        <p id="toleranceError"><!-- Client Side Validation Added by Srinivas --></p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="300">Internal Corrosion, t<sub>corr</sub> (inch):</td>
                                                    <td><html:text property="tCorrosion" onchange="limit4()"  /></td>
                                                    <td>
                                                        <div style="color:red"<html:errors property="tCorrosion"/></div>
                                                        <p id="tCorrosionError"><!-- Client Side Validation Added by Srinivas --></p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>

                                        <td>
                                            <div id="pipeDiv" style="width:200px;height:200px; border-color: green;">
                                                Pipe cross section diagram will generated here.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </blockquote>


                            <br>
                            <h3>Pipe Material</h3><br>
                            <blockquote>
                                <table border="0" cellpadding="0" cellspacing="0" >
                                    <tr>
                                        <td width="300">Yield Strength, E (ksi)</td>
                                        <td><html:text property="yieldStrength"  onchange="limit5()"  /></td>
                                        <td>
                                            <div style="color:red"<html:errors property="yieldStrength"/></div>
                                            <p id="yieldStrengthError"><!-- Client Side Validation Added by Srinivas --></p>
                                        </td>
                                    </tr>
                                </table>
                            </blockquote>


                            <h3>Loads on Pipe</h3>
                            <br>
                            <blockquote>
                                <table border="0" cellpadding="0" cellspacing="1" >

                                    <tr>
                                        <td width="300">Bending Moment, M (kNm)</td>
                                        <td><html:text property="bendingMoment"  onchange="limit6()"  /></td>
                                        <td>
                                            <div style="color:red"<html:errors property="bendingMoment"/></div>
                                            <p id="bendingMomentError"><!-- Client Side Validation Added by Srinivas --></p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="300">External Pressure, P<sub>o</sub> (Pa)</td>
                                        <td><html:text property="exterPressure"  onchange="limit7()"  /></td>
                                        <td>
                                            <div style="color:red"<html:errors property="exterPressure"  /></div>
                                            <p id="exterPressureError"><!-- Client Side Validation Added by Srinivas --></p>
                                        </td>
                                    </tr>
                                </table>

                                <table border="0"  id="alternatecolor">
                                    <td width="325"></td>

                                    <td width="500"><html:submit property="acentAction" value="submit" styleClass="btn"/></td>
                                </table>
                            </blockquote>
                        </td>
                    </tr>
                </table>

            </html:form>

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

        </div>

        <!--        <div id="sideBar">
                    <h1>Other Areas</h1><hr>
                    <a href="http://aceengineer.com/AceEngineer/statHome.html">Statistical Analysis</a><br>
                    <a href="#">Stock Analysis </a><br>
                    <a href="#">Heat Transfer</a><br>
                    <a href="#">Data Manipulation</a><br>
                    <a href="#">Structural Analysis</a><br>
                </div>-->
    </body>
</html>
