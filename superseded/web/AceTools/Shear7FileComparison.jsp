<%-- 
    Document   : Shear7FileComparison
    Created on : 1 Jul, 2011, 2:17:53 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<%@taglib uri="http://struts.apache.org/tags-bean"  prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">
        <script type="text/javascript" src="js/jquery-1.1.3.1.min.js"></script>
        <script type="text/javascript" src="js/jquery.easing.min.js"></script>
        <script type="text/javascript" src="js/jquery.lavalamp.min.js"></script>
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
        <title>::Inputs</title>
    </head>
    <body>
        <div align="center">
            <table cellpadding="0" cellspacing="0" width="840" class="entire">
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
                        <table align="center">
                            <tr>
                                <td width="740" style="font-size: 11pt">
                                    <h2><b>Shear7 File Comparison</b></h2>
                                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This application reads 2 to 3 shear7 output files and gives a comparison of key input and output data.<br></p>
                                    <p>&rArr; This application has been tested for Shear7 version 4.4 files only.<br></p>
                                    <p>&rArr; Application is not programmed to handle no VIV response files. The Shear7 files should show VIV response and excite the structure</p>
                                    <br>
                                    <html:form action="/FileCompare" method="post" enctype="multipart/form-data">
                                        <table>
                                            <tr>
                                                <td><p>
                                                        &rArr; For sample calculation of this application, click&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <html:submit property="action" value="demo">Demo</html:submit>
                                                    </p>
                                                    
                                                </td>
                                            </tr>
                                        </table>
                                        <br><br>
                                        <table align="center">
                                            <tr>
                                                <td>
                                                    <div style="color: red"><p><html:errors /></p></div>
                                                </td>
                                            </tr>
                                        </table>
                                        <table align="center">
                                            <thead><center>Select Shear7 files to compare</center></thead>
                                            <br>
                                            <tr>
                                                <td>File 1:</td>
                                                <td><html:file property="firstFile"/></td>
                                            </tr>
                                            <tr>
                                                <td>File 2:</td>
                                                <td><html:file property="secondFile"/></td>
                                            </tr>
                                            <tr>
                                                <td>File 3:</td>
                                                <td><html:file property="thirdFile"/></td>
                                            </tr>
                                            <tr>
                                                <td><html:reset>Reset</html:reset></td>
                                                <td><html:submit property="action" value="compare">Compare</html:submit></td>
                                            </tr>
                                        </table>
                                    </html:form>
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
