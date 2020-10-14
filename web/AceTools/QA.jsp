<%-- 
    Document   : QA
    Created on : 4 Jul, 2011, 2:18:31 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" />
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" />

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
        <title>::QA</title>
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
                        <table width="840" cellpadding="0" cellspacing="0" class="nav">
                            <tr>
                                <td width="20%" class="nav-a"><a href="Home.jsp">Home</a></td>
                                <td width="20%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                <td width="20%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                <td width="20%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                            </tr>
                        </table>
                        <table width="840">
                            <tr>
                                <td>
                                    <ul id="maintab" class="basictab">
                                        <li><a href="LSJCheckResults.jsp">Flexcom Properties</a></li>
                                        <li class="selected"><a href="#">QA</a></li>
                                        <li><a href="Sensitivity.jsp">Sensitivity</a></li>
                                        <li><a href="FEATheory.jsp">Theory</a></li>

                                        <li><a href="FEARecommendations.html">Recommendations</a></li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <h3>Layer Dimensional Properties</h3><br>
                        <table align="center">
                            <tr>
                                <td>
                                    <table border="1" align="center" style="text-align: center">
                                        <tr>
                                            <td><b>Layer</b></td>
                                            <td><b>Internal Diameter (m)</b></td>
                                            <td><b>External/Drag Diameter (m)</b></td>
                                            <td><b>Thickness (m)</b></td>
                                        </tr>
                                        <tr>
                                            <td>Pipe</td>
                                            <td><bean:write name="lSJCheckForm"  property="pipeInnerDiaFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="outerDiameterFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="pipeWallThicknessFmtd"/></td>
                                        </tr>
                                        <tr>
                                            <td>Coating 1</td>
                                            <td><bean:write name="lSJCheckForm"  property="outerDiameterFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="coat1OuterDiaFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="coat1WallThicknesFmtd"/></td>
                                        </tr>
                                        <tr>
                                            <td>Coating 2</td>
                                            <td><bean:write name="lSJCheckForm"  property="coat1OuterDiaFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="coat2OuterDiaFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="coat2WallThicknesFmtd"/></td>
                                        </tr>
                                        <tr>
                                            <td>Strake Layer</td>
                                            <td><bean:write name="lSJCheckForm"  property="coat2OuterDiaFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="dragDiamterFmtd"/></td>
                                            <td><bean:write name="lSJCheckForm"  property="strakeWallThicknessFmtd"/></td>
                                        </tr>
                                        <tr>
                                            <td>Composite</td>
                                            <td>NA</td>
                                            <td><bean:write name="lSJCheckForm"  property="dragDiamterFmtd"/></td>
                                            <td>NA</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <h3>Layer Weight Properties</h3><br>
                        <table  align="center" style="text-align: center">
                            <tr>
                                <td>
                                    <table border="1">
                                        <tr>
                                            <td><b>Layer</b></td>
                                            <td><b>Mass in Air (Kg/m)</b></td>
                                            <td><b>Buoyancy (Kg/m)</b></td>
                                            <td><b>Mass in Water (Kg/m)</b></td>
                                            <td><b>Buoyancy Diameter d<sub>b</sub> (m)</b></td>
                                        </tr>
                                        <tr>
                                            <td>Internal Fluid</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirIntFluidFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyIntFluidFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="massInWaterIntFluidFmtd" /></td>
                                            <td> - </td>
                                        </tr>
                                        <tr>
                                            <td>Pipe</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirPipeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyPipeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="massInWaterPipeFmtd" /></td>
                                            <td> - </td>
                                        </tr>
                                        <tr>
                                            <td>Coating 1</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirCoat1Fmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyCoat1Fmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="massInWaterCoat1Fmtd" /></td>
                                            <td> - </td>

                                        </tr>
                                        <tr>
                                            <td>Coating 2</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirCoat2Fmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyCoat2Fmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="massInWaterCoat2Fmtd" /></td>
                                            <td> - </td>
                                        </tr>
                                        <tr>
                                            <td>Strake Layer</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirStrakeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyStrakeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="massInWaterStrakeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="buoyancyDia"/></td>
                                        </tr>
                                        <tr>
                                            <td>Composite</td>
                                            <td><bean:write name="lSJCheckForm" property="massInAirCompositeFmtd" /></td>
                                            <td><bean:write name="lSJCheckForm" property="bouyancyCompositeFmtd" /></td>
                                            <td>NA</td>
                                            <td><bean:write name="lSJCheckForm" property="intVarDbFmtd"/></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
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
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>
