<%--
    Document   : LSJCheckDataInputs
    Created on : Dec 28, 2010, 1:14:58 PM
    Author     : sivakumar pabolu
--%>

<%@page contentType="text/html"%>
<%@page pageEncoding="UTF-8"%>

<%@taglib uri="http://struts.apache.org/tags-bean"  prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html:html>
    <head>
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css" media="screen">
        <link rel="stylesheet" type="text/css" href="css/ImageRotator.css" media="screen">

        <script type="text/javascript" src="js/imageRotator.js"></script>
        <script type="text/javascript" src="js/displayStrake.js"></script>
        <script type="text/javascript" src="js/altrows.js"></script>
        <script type="text/javascript" src="js/selectOption.js"></script>
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
    <title>::Inputs!!</title>

    <!-- code Added by naga Srinivas -->
    <script type="text/javascript" src="js/NagaLib.js"></script>
    <script type="text/javascript" src="js/validations.js"></script>

    <script type="text/javascript">
        function loadStandardValues()
        {
            var ind = document.forms[0].material.selectedIndex;
            switch(ind)
            {
                case 1:
                    setStandardValues("2.07E11", "0.3", "7.96E10", "7850");
                    break;
                case 2:
                    setStandardValues("6.8E10", "0.36", "2.5E10", "2698");
                    break;
            }
        }

        function setStandardValues(v1,v2,v3,v4)
        {
            form = document.forms[0];
            form.youngsModulus.value = v1;
            form.poissonsRatio.value = v2;
            form.shearModulus.value = v3;
            form.pipeDensity.value = v4;
        }
    </script>

    <!-- code Added by naga Srinivas -->

</head>

<%-- Loading The Values from THe Dat Base Code
<%
            int ind = 0;
            try {
                ind = Integer.parseInt((request.getParameter("material")));
            } catch (Exception e) {
            }
            String material = "";
            switch (ind) {
                case 1:
                    material = "Steel";
                    break;
                case 2:
                    material = "Aluminum";
                    break;
                default:
                    material = "";
            }
            com.app.db.FlexComPropsDB flexProps = new com.app.db.FlexComPropsDB(material);
            //out.print("<p style=\"color:red\">" + flexProps.getYoungsModulus() + "</p>");
            String youngsModulus = flexProps.getYoungsModulus();
            String poissonsRatio = flexProps.getPoissonsRatio();
            String shearModulus = flexProps.getShearModulus();
            String density = flexProps.getDensity();
%>
--%>

<body onload="alternate('strake','coat1','coat2'),test('coat1','coat2')">        
    <div align="center">
        <table width="840" cellpadding="0" cellspacing="0" class="entire">
            <tr>
                <td>
                    <table width="840" cellpadding="0" cellspacing="0" class="header">
                        <tr>
                            <td width="360" valign="top" >
                                <div align="left">
                                    <a href="Home.jsp">
                                        <img src="images/AceEngineer logo 320x129.jpg" height="70" width="150"/>
                                    </a></div>
                            </td>

                        </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" class="nav">
                        <tr>
                            <td width="20%" class="nav-a"><a href="Home.jsp" title="Home Page">Home</a></td>
                            <td width="20%" class="nav-a"><a href="Applications.jsp" title="Applications Page">Applications</a></td>
                            <td width="20%" class="nav-a"><a href="Services.jsp" title="Services Page">Services</a></td>
                            <td width="20%" class="nav-a"><a href="AboutUs.jsp" title="About Us Page">About Us</a></td>
                            <td width="20%" class="nav-a"><a href="Feedback.jsp" title="Feed back Page">Feedback</a></td>

                        </tr>
                    </table><br>

                    <h3>Pipe Properties for FEA Software</h3>
                    <br>
                    <p>This application takes the pipe properties of a typical riser and calculates properties in required software format<br>
                        This application<br>
                        &rArr; Gives properties for FEA software Flexcom,Shear7 and ANSYS<br>
                        &rArr; Handle up to two coating layers<br>
                        &rArr; Has unknown properties has "TBD" for the user to change as per need</p>

                    <html:form action="/LSJCheck" onsubmit="return validateFeaForm();" >
                        <table border="0"  >
                            <h3> Select material and cross-section </h3>
                            <br>
                            <tr>
                                <td>Material:</td>
                                <td> <html:select property="material" onchange="loadStandardValues();" >
                                        <html:option value="0">--Select--</html:option>
                                        <html:option value="1">Steel </html:option>
                                        <html:option value="2">Aluminum </html:option>
                                    </html:select>
                                </td>
                                <td>
                                    <p id="materialError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                            <tr>
                                <td>Cross-section:</td>
                                <td> <html:select property="shape" >
                                        <html:option value="0">--Select-- </html:option>
                                        <html:option value="1">Cylinder </html:option>
                                    </html:select>
                                </td>
                                <td>
                                    <p id="shapeError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                        </table><br>
                        <table border="0"  >
                            <h3> Material Properties </h3><br>
                            <tbody>
                                <tr>
                                    <td>Youngs Modulus, E(N/m<sup>2</sup>):</td>
                                    <td><html:text property="youngsModulus" /></td>
                                    <td style="color:red"><html:errors property="youngsModulus"/>
                                        <p id="youngsModulusError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>

                                </tr>
                                <tr>
                                    <td>Poissons Ratio:</td>
                                    <td><html:text property="poissonsRatio"/></td>
                                    <td style="color: red"><html:errors property="poissonsRatio"/>
                                        <p id="poissonsRatioError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Shear Modulus, G(N/m<sup>2</sup>):</td>
                                    <td><html:text property="shearModulus"  /></td>
                                    <td style="color: red"><html:errors property="shearModulus"/>
                                        <p id="shearModulusError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Density, ρ<sub>P</sub> (Kg/m<sup>3</sup>):</td>
                                    <td><html:text property="pipeDensity" /></td>
                                    <td style="color: red"><html:errors property="pipeDensity"/>
                                        <p id="pipeDensityError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                        </table><br>
                        <table  border="0">
                            <h3> Pipe Properties </h3><br>

                            <tr>
                                <td>Outer Diameter of the pipe, D<sub>o</sub> (Inch):</td>
                                <td><html:text property="pipeOuterDia" onchange="loadPipeApplet();"/></td>
                                <td style="color: red"><html:errors property="pipeOuterDia"/>
                                    <p id="pipeOuterDiaError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                            <tr>
                                <td><html:radio property="selectOpt" value="thickness" onclick="showFea()"/>
                                    Thickness of the pipe, T<sub>pipe</sub>(Inch):</td>
                                <td><html:text property="pipeThickness" onchange="loadPipeApplet();"/></td>
                                <td style="color: red"><html:errors property="pipeThickness"/>
                                    <p id="pipeThicknessError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                            <tr>
                                <td><html:radio property="selectOpt" value="innerDia" onclick="showFea()" />
                                    Inner Diameter of the pipe, D<sub>i</sub> (Inch):</td>
                                <td><html:text property="innerDiameter"  disabled="true" onblur="loadPipeApplet();"/></td>
                                <td style="color: red"><html:errors property="innerDiameter"/>
                                    <p id="innerDiameterError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <table border="0">
                            <h3> Fluid Properties </h3><br>
                            <tr>
                                <td>External fluid Density, ρExt(Kg/m<sup>3</sup>):</td>
                                <td><html:text property="seaWaterDen"/></td>
                                <td style="color: red"><html:errors property="seaWaterDen"/>
                                    <p id="seaWaterDenError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                            <tr>
                                <td>Internal fluid Density, ρInt(Kg/m<sup>3</sup>):</td>
                                <td><html:text property="internalFluidDensity"/></td>
                                <td style="color: red"><html:errors property="internalFluidDensity"/>
                                    <p id="internalFluidDensityError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                </td>
                            </tr>
                        </table><br>
                        <table border="0"   >
                            <h3> Coating Properties </h3><br>
                            <tbody>
                                <tr>
                                    <td >Select no of Coatings:</td>
                                    <td><html:select property="numOfCoats"
                                                 onchange="display(this,'coat1','coat2');">
                                            <html:option value="none"> 0 </html:option>
                                            <html:option value="coat1"> 1 </html:option>
                                            <html:option value="coat2"> 2 </html:option>
                                        </html:select>
                                    </td>
                                </tr>
                            </tbody>
                        </table><br>
                        <table border="0" >
                            <tbody id="coat1" style="display: none;">
                                <tr>
                                    <td>Thickness of coating1, Tcoat1 (Inch):</td>
                                    <td><html:text property="coat1Thickness" onchange="loadPipeApplet();" /></td>
                                    <td style="color: red"><html:errors property="coat1Thickness"/>
                                        <p id="coat1ThicknessError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Density of coating1, ρCoat1(Kg/m3):</td>
                                    <td><html:text property="coat1Density"  /></td>
                                    <td style="color: red"><html:errors property="coat1Density"/>
                                        <p id="coat1DensityError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody id="coat2" style="display: none;">
                                <tr>
                                    <td>Thickness of coating2, Tcoat2 (Inch):</td>
                                    <td><html:text property="coat2Thickness" onchange="loadPipeApplet();" /></td>
                                    <td style="color: red"><html:errors property="coat2Thickness"/>
                                        <p id="coat2ThicknessError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Density of coating2, ρCoat2(Kg/m3):</td>
                                    <td><html:text property="coat2Density"  /></td>
                                    <td style="color: red"><html:errors property="coat2Density"/>
                                        <p id="coat2DensityError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                    </td>
                                </tr>
                            </tbody>
                        </table><br>

                        <table border="0">
                            <h3> Strake Properties</h3><br>
                            <tbody>
                                <tr>
                                    <td>Strake Present:</td>
                                    <td>
                                        <html:select property="strakePresent"
                                                     onchange="displayStrake(this,'strake');">
                                            <html:option value="none"> No </html:option>
                                            <html:option value="strake"> Yes </html:option>
                                        </html:select>
                                    </td>
                                </tr>
                            </tbody>
                        </table><br>

                        <table>
                            <tr>
                                <td>
                                    <table border="0" cellpadding="0" cellspacing="0" >
                                        <tbody id="strake" style="display: none;">
                                            <tr>
                                                <td >Density of strake, ρ<sub>Strake</sub>(Kg/m<sup>3</sup>):</td>
                                                <td><html:text property="strakeDensity" /></td>
                                                <td style="color: red"><html:errors property="strakeDensity" />
                                                    <p id="strakeDensityError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Thickness of strake, T<sub>Strake</sub>(m):</td>
                                                <td><html:text property="strakeThickness"  /></td>
                                                <td style="color: red"><html:errors property="strakeThickness"/>
                                                    <p id="strakeThicknessError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Area of the Strake, A<sub>Strake</sub>(m<sup>2</sup>):</td>
                                                <td><html:text property="strakeArea" /></td>
                                                <td style="color: red"><html:errors property="strakeArea"/>
                                                    <p id="strakeAreaError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Drag Diameter of strake layers, D<sub>d</sub>(m):</td>
                                                <td><html:text property="dragDia" /></td>
                                                <td style="color: red"><html:errors property="dragDia"/></td>
                                                <td>
                                                    <p id="dragDiaError" style="color:red"><!-- Client Side Error added By Srinivas--></p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <br>

                                    <table cellpadding="0" cellspacing="0" >

                                        <tr>
                                            <td>
                                                <p id="flexcomPropsError" style="color:red;"></p>
                                                <b> Flexcom Properties</b><html:checkbox property="checkbox1" value="test1"  />
                                                <b> Shear7 Properties </b><html:checkbox property="checkbox2" value="test2"/>
                                                <b> Ansys Properties </b> <html:checkbox property="checkbox3" value="test3"  />
                                            </td>
                                        </tr>

                                        <tr>
                                            &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                                            <td><html:submit property="acentAction" value="Calculate" styleClass="btn"/></td>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table>
                                        <tr>
                                            <td>
                                                <div id="pipeDiv" style="width:200px;height:200px;">
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </html:form>

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

