<%--
    Document   : Theory
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
        <script type="text/javascript" src="js/jquery-1.3.1.min.js" ></script>
        <script type="text/javascript" src="js/jquery.scrollTo.js"></script>
        <script type="text/javascript" src="js/imageRotator.js"></script>


        <title>::Theory!!</title>
    </head>


    <body>
        <div align="center">
            <table width="840" cellpadding="0" cellspacing="0" class="entire"  style="font-size: 11pt"  >
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
                                        <li><a href="LSJCheck.do?acentAction=display_results">QA</a></li>
                                        <li><a href="Sensitivity.jsp"> Sensitivity</a></li>
                                        <li class="selected"><a href="#">Theory  </a></li>
                                         <li><a href="FEARecommendations.html">Recommendations</a></li>
                                        
                                    </ul>
                                </td>
                            </tr>
                        </table>
                       
                        <h3 align="center">Theory </h3><br>
                        <table align="center" id="materialPropertyTable1">

                            <tr>
                                <td>
                                    <p>The theory used for the development of FEA properties is given below. The FEA program properties given are for structural analysis.</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h4>1.1.1 Material Properties</h4><br>
                                    <p>
                                        Density, ρ<br>
                                        Young’s modulus, E<br> 
                                        Shear modulus, G<br>
                                        <br>Typical properties used for the material are obtained from matweb.com
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h4>1.1.2 Sectional Properties</h4><br>
                                    <p>
                                        The basic sectional properties for any cross-section considered shall be:<br>
                                        &rArr; Area, A<br>
                                        &rArr; Moment of inertia, I<br>
                                        &rArr; Polar moment of inertia, J<br>

                                        The derived sectional properties are given below:<br>
                                        &rArr;	EIyy – Bending stiffness about local-y axis (N . m<sup>2</sup>)<br>
                                        &rArr;	EIzz – Bending stiffness about local-z axis (N . m<sup>2</sup>)<br>
                                        &rArr;	m/l – mass per unit length of section (kg/m)<br>
                                        &rArr;	GJ – Torsional stiffness (N . m<sup>2</sup>)<br>
                                        &rArr;	EA – Axial stiffness (N)<br>
                                        &rArr;	&rho;J – Polar inertia of cross-section per unit length (kg . m)<br>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h4>1.1.3 Pipe Properties</h4><br>
                                    <img src="images/PipeCrossSec.png" align="middle"><br>
                                    <p>
                                        The basic sectional properties for the circular section are calculated as follows:<br>

                                        &rArr;	Pipe Area,A<sub>pipe</sub>=&Pi;(r<sup>2</sup><sub>o,pipe</sub>-r<sup>2</sup><sub>i,pipe</sub>)=&Pi;(d<sup>2</sup><sub>o,pipe</sub>-d<sup>2</sup><sub>i,pipe</sub>)/4  , where r<sub>o</sub> and r<sub>i</sub> are outer and inner radii and d<sub>o</sub> and d<sub>i</sub> are outer and inner diameters, Figure 2.1<br>
                                        &rArr;	Internal area, A<sub>internal</sub>=&Pi;r<sup>2</sup><sub>i</sub>=&Pi;d<sub>i</sub><sup>2</sup>/4  <br>
                                        &rArr;	Moment of inertia , I<sub>pipe</sub>=&Pi;(r<sup>4</sup><sub>o,pipe</sub>- r<sup>4</sup><sub>i,pipe</sub>)/4 = &Pi;(d<sup>4</sup><sub>o,pipe</sub>- d<sup>4</sup><sub>i,pipe</sub>)/64 <br>
                                        &rArr;	Polar moment of inertia,I<sub>pipe</sub> =2I=&Pi;(r<sup>4</sup><sub>o,pipe</sub>- r<sup>4</sup><sub>i,pipe</sub>)/2=&Pi;(d<sup>4</sup><sub>o,pipe</sub>- d<sup>4</sup><sub>i,pipe</sub>)/32  <br>

                                        The derived sectional properties are given below:<br>

                                        &rArr;	Mass per unit length,(m/l)<sub>pipe</sub> = &rho; <sub>pipe</sub>A <sub>pipe</sub>

                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h4>1.1.4 Coating  Properties</h4><br>
                                    <img src="images/LayersOfInsulation.png" align="middle" >
                                    <p>
                                        The basic sectional properties for this section are calculated as follows:<br>

                                        &rArr;	Area of insulation,  , where rins1 is outer radius and dins1 is outer diameter of the 1st layer of insulation, Figure 2.2<br>
                                        &rArr;	Area of insulation,  , where rins2 is outer radius and dins2 is outer diameter of the 2nd layer of insulation, Figure 2.2<br>
                                        &rArr;	Inertia due to insulation layers is not considered due to low E value<br>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h4>1.1.5 Strake Properties</h4><br>
                                    <img src="images/LayersAndStrakes.png" align="middle" >
                                    <p>
                                        There are 2 ways of defining the buoyancy diameter of strakes using<br>
                                        a)	dry mass, density of strake material, wet weight of strakes to define buoyancy diameter; Strake shell thickness (t<sub>strake</sub>) to calculate the drag diameter<br>
                                        b)	density of strake material and cross-sectional area of strake to define buoyancy diameter; Strake shell thickness (t<sub>strake</sub>) to calculate the drag diameter (ONLY this is currently incorporated)<br>


                                        The drag diameter and the associated drag coefficient should always be defined as a pair.<br>
                                        &rArr;	Area of strake based on option a) above is, A<sub>Strake</sub>=(m<sub>dry</sub>/l)/&rho;<sub>strake</sub> where (m<sub>dry</sub>/l)   is dry mass of strake and &rho<sub>strake</sub> is the density of strake material<br>

                                        The derived sectional properties are given below:<br>

                                        &rArr;	Mass per unit length,(m/l)=&rho;<sub>pipe</sub>A<sub>pipe</sub>+&rho;<sub>coat1</sub>A<sub>coat1</sub>+&rho;<sub>coat2</sub>A<sub>caot2</sub>+&rho;<sub>strake</sub>A<sub>strake</sub>  , where &rho;<sub>coat1</sub> and &rho;<sub>coat2</sub> are densities of insulation layer 1 and layer 2.<br>
                                        &rArr;	The drag diameter and the associated drag coefficient should always be defined as a pair. When undefined, use drag diameter,d<sub>d</sub>  , where t<sub>strake</sub>=d<sub>coat2</sub>+2t<sub>strake</sub> is the thickness of the strake.<br>
                                        &rArr;	Buoyancy diameter,d<sub>b</sub>=&radic;d<sup>2</sup><sub>coat2</sub> + 4A<sub>strake</sub>/&Pi;  <br>

                                    </p>
                                </td>
                            </tr>
                        </table>
                        <table>

                            <tr>
                            <h4>1.2 Required outputs</h4>
                            <td>
                                <h4>1.2.1 Flexcom Properties</h4><br>
                                <p>
                                    Flexcom is a finite element analysis software where structures are modelled as beams and columns to determine the structural response under loading. The structural properties required by this software are given in this section:<br>

                                    &rArr;	EIyy – Bending stiffness about local-y axis (N . m<sup>2</sup>)<br>
                                    &rArr;	EIzz – Bending stiffness about local-z axis (N . m<sup>2</sup>)<br>
                                    &rArr;	GJ – Torsional stiffness (N . m<sup>2</sup>)<br>
                                    &rArr;	EA – Axial stiffness (N)<br>
                                    &rArr;	m/l – Mass per unit length (kg/m)<br>
                                    &rArr;	pJ – Polar inertia of cross-section per unit length (kg . m)<br>
                                    &rArr;	ID – Inner diameter (m)<br>
                                    &rArr;	DD – Drag diameter (m)<br>
                                    &rArr;	BD – Buoyancy diameter (m)<br>
                                    <&rArr; OD – Strength diameter (m)<br>
                                </p>
                            </td>
                </tr>

                <tr>
                    <td>
                        <h4>1.2.2 Shear7 Properties</h4><br>
                        <p>
                            Shear7 program is a analysis tool to predict VIV of deep water risers and pipelines for the oil and gas industry. The following are the required properties<br>

                            &rArr;	DD <br>
                            &rArr;	OD <br>
                            &rArr;	ID <br>
                            &rArr;	I  <br>
                            &rArr; (m/l)+Fluids = &rho;<sub>pipe</sub>A<sub>pipe</sub> + &rho;<sub>coat1</sub>A<sub>coat1</sub> + &rho;<sub>coat2</sub>A<sub>coat2</sub> + &rho;<sub>strake</sub>A<sub>strake</sub> + &rho;<sub>internal fluid</sub>A<sub>internal</sub><br>
                            &rArr;	Submerged weight =  ((m/l)+Fluids - &rho;<sub>sea water</sub> * &Pi;d<sup>2</sup><sub>b</sub>/4) * 9.81<br>

                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <h4>1.2.3 ANSYS FEA Properties</h4>
                        <p>
                            ANSYS is an FEA program. Simple Pipe59 element properties are given in this section<br></p>
                        <table align="center">
                            <tr>
                                <td>R,1,</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>RMOD,1,1,</td>
                                <td></td>
                                <td>!,Outer diameter D<sub>o</sub></td>
                            </tr>
                            <tr>
                                <td>RMOD,1,2,</td>
                                <td></td>
                                <td>!, Wall Thickness T<sub>wall</sub></td>
                            </tr>
                            <tr>
                                <td>RMOD,1,3,</td>
                                <td>TBA</td>
                                <td>!, Coefficient of normal drag</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,4,</td>
                                <td>TBA</td>
                                <td>!, Inertia coefficient C<sub>m</sub></td>
                            </tr>
                            <tr>
                                <td>RMOD,1,5,</td>
                                <td></td>
                                <td>!, Density of internal fluid (pressure effect only)</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,6,</td>
                                <td>TBA</td>
                                <td>!, Free surface elevation of internal fluid</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,7,</td>
                                <td></td>
                                <td>!, Mass/unit length internal fluid</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,8,</td>
                                <td>TBA</td>
                                <td>!, Added mass C<sub>a</sub></td>
                            </tr>
                            <tr>
                                <td>RMOD,1,9,</td>
                                <td>TBA</td>
                                <td>!, Buoyancy coefficient</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,10,</td>
                                <td>TBA</td>
                                <td>!, Coefficient of Tangential Drag</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,12,</td>
                                <td></td>
                                <td>!, External Coating density</td>
                            </tr>
                            <tr>
                                <td>RMOD,1,13,</td>
                                <td></td>
                                <td>!, Thickness Coating</td>
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
</html:html>
