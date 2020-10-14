<%--
    Document   : LSJCheckResults
    Created on : Dec 28, 2010, 2:23:14 PM
    Author     : sivakumar pabolu
--%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>

<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html:html>
    <head>
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" media="screen">
        <link rel="stylesheet" type="text/css" href="css/ImageRotator.css" media="screen">
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" media="screen">
        
        <script type="text/javascript" src="js/imageRotator.js"></script>
        <script type="text/javascript" src="js/displayStrake.js"></script>
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

        <title>::Flexcom Properties!!</title>
    </head>


    <body onload="showData('<bean:write name="lSJCheckForm" property="tmpcheckbox1" />',
        '<bean:write name="lSJCheckForm" property="tmpcheckbox2" />',
        '<bean:write name="lSJCheckForm" property="tmpcheckbox3" />')">
        <div align="center">
            <table width="840" cellpadding="0" cellspacing="0" class="entire" >
                <tr>
                    <td>
                        <table width="840" cellpadding="0" cellspacing="0" class="header">
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
                        <div align="center">
                            <ul id="maintab" class="basictab">
                                <li class="selected"><a href="#">Flexcom Properties</a></li>
                                <li><a href="LSJCheck.do?acentAction=display_results">QA </a></li>
                                <li><a href="Sensitivity.jsp">Sensitivity</a></li>
                                <li><a href="FEATheory.jsp">Theory </a></li>

                                <li><a href="FEARecommendations.html">Recommendations</a></li>
                            </ul>
                        </div>


                        <div style="color:red"><html:errors/></div><br>

                        <p align="center">Do You Want to edit the values?
                            <a href="LSJCheck.jsp" title="Edit the values" >[Click Here]</a>
                        </p>

                        <br>
                        <h3 align="center"> Flexcom Properties</h3><br>
                        <table align="center"  border="1" >
                             <tbody id="<bean:write name="lSJCheckForm" property="tmpcheckbox1" />" style="display: none;">



                            <tr>
                                <td>C</td>
                                <td>EIyy</td>
                                <td>EIzz</td>
                                <td>GJ</td>
                                <td>EA</td>
                                <td>m/l</td>
                                <td>p</td>
                                <td>ID</td>
                                <td>DD</td>
                                <td>BD</td>
                                <td>ODStr</td>
                            </tr>
                            <tr>
                                <td>C</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>SET=TBA</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><bean:write name="lSJCheckForm" property="eIyyFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="eIzzFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="gJFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="eAFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="intVarMpLSteelFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="intVarpJFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="pipeInnerDiaFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="intVarDdFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="intVarDbFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="outerDiameterFmtd"/></td>

                            </tr>
                             </tbody>
                        </table>
                                <br><br>
                                <h3>Shear7 Properties</h3><br>
                        <table align="center" border="1">
                             <tbody id="<bean:write name="lSJCheckForm" property="tmpcheckbox2" />" style="display: none;">
                            <tr>
                                <td><bean:write name="lSJCheckForm" property="dragDiaFmtd"/></td>
                                <td><bean:write name="lSJCheckForm" property="outerDiameterFmtd"/></td>
                                <td><bean:write name="lSJCheckForm" property="pipeInnerDiaFmtd" /></td>
                                <td>Hydro dia,outer dia and inner strength dia</td>
                            </tr>
                            <tr>
                                <td><bean:write name="lSJCheckForm" property="momentOfInertiaFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="pipeAndFluidMplFmtd" /></td>
                                <td><bean:write name="lSJCheckForm" property="submergedWeightFmtd" /></td>
                                <td>Inertia(m<sup>4</sup>),mass in air+fluids(kg/m),sub wt.(N/m)</td>
                            </tr>
                             </tbody>
                        </table>
                                <br><br>
                                <h3>ANSYS FEA Properties</h3>
                                <br>
                        <table align="center" border="1">
                             <tbody id="<bean:write name="lSJCheckForm" property="tmpcheckbox3" />" style="display: none;">
                            <tr>
                                <td> R,1,</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,1,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod1Fmtd" /></td>
                                <td>!, Outer diameter Do</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,2,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod2Fmtd" /></td>
                                <td>!, Wall Thickness T<sub>wall</sub></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,3,</td>
                                <td>TBA</td>
                                <td>!, Coefficient of normal drag</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,4,</td>
                                <td>TBA</td>
                                <td>!, Inertia coefficient C<sub>m</sub></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,5,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod5Fmtd" /></td>
                                <td>!, Density of internal fluid (pressure effect only)</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,6,</td>
                                <td>TBA</td>
                                <td>!, Free surface elevation of internal fluid</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,7,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod7Fmtd" /></td>
                                <td>!, Free surface elevation of internal fluid</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,8,</td>
                                <td>TBA</td>
                                <td>!, Added mass C<sub>a</sub></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,9,</td>
                                <td>TBA</td>
                                <td>!, Buoyancy coefficient</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,10,</td>
                                <td>TBA</td>
                                <td>!,Coefficient of Tangential Drag</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,12,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod12Fmtd" /></td>
                                <td>!,External Coating density</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td> RMOD,1,13,</td>
                                <td><bean:write name="lSJCheckForm" property="rMod13Fmtd" /></td>
                                <td>!,Thickness Coating</td>
                            </tr>
                             </tbody>
                        </table>

                        <br><br>
                        
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
</html:html>
