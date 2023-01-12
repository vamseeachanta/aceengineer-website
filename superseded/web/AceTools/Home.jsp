<%-- 
    Document   : Home
    Created on : 1 Jul, 2011, 2:24:42 PM
    Author     : PEPL
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
        <script type="text/javascript" src="js/jquery-1.3.1.min.js" ></script>
        <script type="text/javascript" src="js/jquery.scrollTo.js"></script>
        <script type="text/javascript" src="js/imageRotator.js"></script>
        <title>:: Ace Tools</title>
    </head>
    <body>
        <div align="center">
            <table width="840" cellpadding="0" cellspacing="0" class="entire" >
                <tr>
                    <td><table width="840" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="420" valign="top" ><div align="left"><a href="Home.jsp"><img src="images/AceEngineer logo 320x129.jpg" height="70" width="150"></a></div> </td>
                                <td width="420" valign="bottom"><div align="right"><a href="Home.jsp"><b>Home</b></a><br>
                                        <a href="http://aceengineer.com/AceEngineer/ContactUs.html" class="space" target="_blank">Contact Us</a></div></td>
                            </tr>
                        </table>
                        <table width="840">
                            <tr>
                                <td>
                                    <div class="rotator">
                                        <ul>
                                            <li class="show"><img src="images/Eng-Calculations_Loading-Calculations.jpg" width="840" height="300"  alt="pic1" /></li>
                                            <li><img src="images/engineering_rulerandpencil.jpg" width="840" height="300"  alt="pic2" /></li>
                                            <li><img src="images/rig 1_hi.jpg" width="840" height="300"  alt="pic3" /></li>
                                            <li><img src="images/rig 2_hi.jpg" width="840" height="300"  alt="pic4" /></li>
                                            <li><img src="images/rig3_hi.JPG" width="840" height="300"  alt="pic5" /></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" class="nav">
                            <tr>
                                <td width="25%" class="nav-a"><a href="Home.jsp">Home</a></td>
                                <td width="25%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                <td width="25%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                <td width="25%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                            </tr>
                        </table>
                        <table width="840" cellpadding="0" cellspacing="0" class="main">
                            <tr>
                                <td width="600" valign="top"><h1>AceEngineer</h1>
                                    <p style="font-size: 10pt">
                                        &nbsp;&nbsp;&nbsp;&nbsp;AceEngineer is an Information Technology services provider company, offering wide range of solutions meeting the organizational objectives of our clients. The company is based in Texas. AceEngineer offers services in the fields of Software Testing, Quality Assurance, Strategic Staffing and Web Application Testing. AceEngineer employs client based solution approach that helps in understanding the exact requirements of our clients and deliver quality solutions. Timely monitoring of our services helps us offer world class business solutions with ground breaking approaches. AceEngineer offers innovative solutions and helps organizations optimize their business processes.
                                    </p>

                                </td>
                                <td width="240">
                                    <div class="rightbar">
                                        <div id="feature4">
                                            <div align="center">
                                                <br />
                                            </div>
                                        </div>
                                        <div id="feature2"> <img src="images/quickcontact.gif" alt="Contact" />
                                                <strong>Local:</strong> 614-804-8516<br />
                                                <strong>Email:</strong> <a href="mailto:prashanth.kakarapalli@acematrix.com">sales@acematrix.com</a><br />
                                        </div>
                                        <div id="feature4">
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        <table width="840" cellpadding="0" cellspacing="0" class="footer">
                            <tr>
                                <td width="500">
                                    <div align="left">

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