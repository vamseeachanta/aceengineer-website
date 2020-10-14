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

        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript" src="js/vmstress.js"></script>
        <script type="text/javascript" src="js/Toggle.js"></script>
        <script type="text/javascript" src="js/core.js"></script>
        <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>

        <style type="text/css">
            .strippyTable{
                background-color: white;
                -web-kit-box-shadow:0px 2px 2px black;
                -moz-box-shadow:0px 2px 2px black;
                box-shadow:0px 2px 2px black;

                -web-kit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;
            }
            .strippyTable .even{background: #D8E6FF;}
            .strippyTable .odd{}

        </style>
        <script type="text/javascript" src="js/comment.js"></script>
        <!--        <script src="stickynote.js"></script>-->
        <script type="text/javascript">
            
            google.load("visualization", "1", {packages:["corechart"]});
            $(function(){
                chart();

                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
           
                var tables = $('.strippyRows');
                tables.each(function(ind){
                    StripyTable.makeAsStrippyTable(this, {CSS:'strippyTable'});
                });
            });
            
        </script>

        <!--        <script>
                    var unqiuevar=new stickynote({
                        content:{divid:'test', source:'inline'},
                        pos:['right', 'top'],
                        showfrequency:'always'
        
                    })
                </script>
        -->
        <!--    <div id="test" class="stickynote">
                <h3>
                    <a href="#" id="commentLink" onclick="return handleClick()">Comment Here</a></h3>
            </div>-->

        <title>::Charts & Input Values</title>
    </head>
    <body>

        <logic:empty name="vmStressCheckForm">
            yes is there
        </logic:empty>
        <div align="center">


            <table   id="tabDiv"  width="990" class="content" >
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
                            <li class="selected"><a href="#">Charts & Input Values</a></li>

                            <li><a href="VmStressTheory.jsp">Theory</a></li>
                            <!--                        <li><a href="VmStressRecommendations.html">Recommendations</a></li>-->
                        </ul>

                        <script type="text/javascript">
                            //initialize tab menu, by passing in ID of UL
                            initalizetab("maintab")
                        </script>
                        <br><br>

                        <table>
                            <tr class="title">
                                <td>
                                    <label class="headingMedium">Suggested Title:</label>
                                </td>
                                <td>
                                    <bean:write name="vmStressCheckForm" property="title"/>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <a href="vmStressCheck.jsp">
                            <font color="red">
                                < Click here to go back and edit input values
                            </font>
                        </a>
                        <table class="tableDiv">
                            <tr>
                                <td>
                                    <div id="firstChart_div">

                                    </div>
                                    <!--                                <img src="./images/chart.JPG" alt="null" align="center">-->
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div id="secondChart_div">

                                    </div>
                                    <!--                                <img src="./images/chart1.JPG" alt="null" align="center">-->
                                </td>
                            </tr>
                        </table>
                        <!--Hidden field to capture the Json data for charting purpose    -->
                        <html:hidden property="jsonFirstChartData" name="vmStressCheckForm" />
                        <html:hidden property="jsonSecondChartData" name="vmStressCheckForm" />

                        <%--
                                back to input page
                        --%>
                        <h3><center>INPUT ECHO</center></h3>
                        <a href="vmStressCheck.jsp">
                            <font color="red">
                                < Click here to go back and edit input values
                            </font>
                        </a>


                        <%--
                            this is used for give the inputvalues in table ---kd
                        --%>


                        <table border="0"  width="100%" class="strippyRows" >

                            <tr>
                                <td colspan="2">
                                    <h3>Pipe Properties</h3>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%">External Diameter, D<sub>o</sub> (inch)</td>
                                <td width="50%"><bean:write name="vmStressCheckForm" property="outerDia"/></td>

                            </tr>
                            <tr>
                                <td width="50%">
                                    Pipe Wall Thickness, t<sub>nom</sub> (inch)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="temppipeWallThickness"/>
                                </td>

                            </tr>
                            <tr>
                                <td width="50%">
                                    Inner Diameter, D<sub>i</sub> (inch)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="tempinnerDia"/>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%">
                                    Pipe Tolerance (%)
                                </td >
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="tolerance"/>
                                </td>
                            </tr>

                            <tr>
                                <td width="50%">
                                    Internal Corrosion, t<sub>corr</sub> (inch)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="tCorrosion"/>
                                </td>
                            </tr>
                        </table>
                        <logic:notEmpty name="vmStressCheckForm" property="stdpipe">
                            <font color="red" size="2">Note:
                                <bean:write name="vmStressCheckForm" property="stdpipe"/>
                            </font>
                        </logic:notEmpty>
                        <br>




                        <table border="0" cellpadding="0" width="100%" cellspacing="1" class="strippyRows">
                            <tr>
                                <td colspan="2">
                                    <h3>Pipe Material</h3>
                                </td>
                            </tr>

                            <tr>
                                <td width="50%">
                                    Yield Strength, E (ksi)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="yieldStrength"/>
                                </td>
                            </tr>
                        </table>
                        <br>



                        <table border="0" cellpadding="0" cellspacing="1" width="100%" class="strippyRows">
                            <tr>
                                <td colspan="2">
                                    <h3>Loads on Pipe</h3>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%">
                                    Bending Moment, M (kNm)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="bendingMoment"/>
                                </td>
                            </tr>

                            <tr>
                                <td width="50%">
                                    External Pressure, P<sub>o</sub> (Pa)
                                </td>
                                <td width="50%">
                                    <bean:write name="vmStressCheckForm" property="exterPressure"/>
                                </td>
                            </tr>
                        </table>
                        <!--                        <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                                                    <tr>
                                                        <td>
                                                            <div align="right">
                                                                <a href="http://aceengineer.com">Home</a><br/>
                                                                AceEngineer &copy; 2011, powered by PEPL
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>-->
                    </td>
                </tr>
            </table>
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
    </body>
</html>
