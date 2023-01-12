<%--
    Document   : Sensitivity
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
        <link rel="stylesheet" type="text/css" href="css/Tabs.css" media="screen">
        <link rel="stylesheet" type="text/css" href="css/ImageRotator.css" media="screen">
       
        <script type="text/javascript" src="js/imageRotator.js"></script>
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
        <title>::Sensitivity!!</title>
    </head>

    <body>
        <div align="center">
            <table width="840" cellpadding="0" cellspacing="0" class="entire" >
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

                        
                        <div align="center">
                            <ul id="maintab" class="basictab">
                                <li ><a href="LSJCheckResults.jsp">Flexcom Properties</a></li>
                                <li><a href="LSJCheck.do?acentAction=display_results">QA </a></li>
                                <li class="selected"><a href="#">Sensitivity</a></li>
                                <li><a href="FEATheory.jsp">Theory </a></li>
                                <li><a href="FEARecommendations.html">Recommendations</a></li>
                                
                            </ul>
                        </div>
                        <br>


                        <%--<div style="color: red"><html:errors/></div>--%>
                        <div align="center">
                            <h4> To perform the Sensitivity check, please enter the following details</h4>
                            <html:form action="/SensitivityCheck">
                                <table border="0" >
                                    <bean:write name="sensitivityCheckForm" property="error" filter="false"/>
                                  
                                    <tr>
                                        <td>Select your Material:</td>
                                        <td>
                                            <html:select property="sensitivityProperty" title="Select Material Property" >
                                                <html:option value="Select property" />
                                                <html:option value="OuterDiameter" />
                                                <html:option value="Thickness" />
                                            </html:select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Select no.of Variation:</td>
                                        <td>
                                            <html:select property="sensitivityRange" title="Select Variation Range" >
                                                <html:option value="Select Range" />
                                                <html:option value="5" />
                                                <html:option value="10" />
                                                <html:option value="15" />
                                                <html:option value="20" />
                                            </html:select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Select your Step size:</td>
                                        <td>
                                            <html:select property="sensitivityStep" title="Select step" >
                                                <html:option value="Select Step"/>
                                                <html:option value="1" />
                                                <html:option value="2" />
                                                <html:option value="3" />
                                                <html:option value="4" />
                                                <html:option value="5" />
                                            </html:select>
                                        </td>
                                    </tr>
                                </table> <br>
                                <table  style="text-align: center" ><tr>
                                        <!-- &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;-->
                                        <td align="right"><html:submit property="acentAction" value="Calculate" styleClass="btn" /></td>
                                        <!--&nbsp;&nbsp; &nbsp;&nbsp;-->
                                    <tr></table>
                                </html:form>
                            <br><br>

                            <logic:notEmpty name="sensitivityCheckForm" property="results">
                                <table border="1" style="text-align: center">
                                    <tr>

                                        <td><b>Area of pipe(m2)</b></td>
                                        <td><b>Moment of Inertia </b></td>
                                        <td><b>Polar moment of Inertia</b></td>
                                        <td><b>m/l (kg/m)</b></td>
                                        <td><b>EIyy</b></td>
                                        <td><b>EIzz</b></td>
                                        <td><b>GJ</b></td>
                                        <td><b>EA</b></td>
                                        <td><b>Pj</b></td>
                                        <td><b>Di(m)</b></td>
                                        <td><b>Dd(m)</b></td>
                                        <td><b>Db(m)</b></td>
                                    </tr>
                                    <logic:iterate name="sensitivityCheckForm"
                                                   property="results" id="currResultBean"
                                                   type="tools.ResultsBean"
                                                   offset="0">
                                        <tr>
                                            <td> <bean:write name="currResultBean"
                                                        property="riser.pipe.xsection.area"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="riser.pipe.xsection.momentOfInertia"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="riser.pipe.xsection.polarInertia"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="riser.mpl"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>

                                            <td> <bean:write name="currResultBean"
                                                        property="eIyy"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                                <%-- <td> <bean:write name="sensitivityCheckForm"
                                                             property="eIyyFmtd"
                                                             /> </td>--%>
                                            <td> <bean:write name="currResultBean"
                                                        property="eIzz"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                                <%-- <td> <bean:write name="sensitivityCheckForm"
                                                            property="eIzzFmtd"
                                                            /> </td>--%>
                                            <td> <bean:write name="currResultBean"
                                                        property="gJ"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="eA"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="intVarpJ"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>

                                            <td> <bean:write name="currResultBean"
                                                        property="intVarDi"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="dragDia"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                            <td> <bean:write name="currResultBean"
                                                        property="buoyancyDia"
                                                        formatKey="acetools.fmt.decimal.4"
                                                        /> </td>
                                        </tr>
                                    </logic:iterate>
                                </table><br>
                                <html:form  action="/SensitivityCheck">
                                    <html:submit property="acentAction" value="Download" title="Download As Pdf">Download Data </html:submit>
                                </html:form>
                                <br>
                                <a href="SensCharts.jsp" style="padding: 20px; font-size: large; ">Click here for "Data Comparison Charts"</a>
                            </logic:notEmpty>
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
                        </div>
            </table>
        </div>
    </body>
</html:html>

