<%--
    Document   : metaocean
    Created on : 15 Jun, 2011, 2:14:46 PM
    Author     : SAMBA
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>

        <title></title>
        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
    </head>

    <body bgcolor="DDDDDD"><center>
            <html:form action="/compare">
                
                <div align="center">
                    <table width="840" class="entire">
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
                                </table><br>
                                <h3><center> Riser Information Database</center></h3><br>
                                <table>
                                    <tr>
                                        <td>
                                            <a href="radio.jsp">DevelopmentData ></a>
                                            <a href="metaocean.jsp">Metocean ></a>
                                            <a href="returnperiod2.jsp">LongCurrent</a>
                                        </td>
                                    </tr>
                                </table>
                                <center>

                                    <h4>Compare between Developments</h4>
<h5><bean:write name="compareform" property="error" filter="false"/></h5>
                                    <table border="0">
                                        <tr>
                                            <td>
                                                <b>Thunder Horse, Gulf of Mexico</b></td>
                                            <td>
                                                <html:checkbox property="compare1" value="Thunder Horse"/></td></tr>
                                        <tr>
                                            <td>
                                                <b>Gro, North Sea</b></td>
                                            <td> <html:checkbox property="compare2" value="Gro"/></td>
                                        </tr>
                                        <tr>
                                            <td><b>Azurite, West Africa</b></td>
                                            <td><html:checkbox property="compare3" value="Azurite"/></td>
                                        </tr>
                                    </table>
                                    <html:submit value="Click"/>
                                    <html:reset/>
                                </html:form><br><br>
                            </center>
                            <center>
                                <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                                    <tr>
                                        <td>
                                            <div align="left">
                                                <a href="Home.jsp">Home</a><br/>
                                                Copyright &copy; AceEngineer powered by Prarohana
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </center>
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </body>
</html>
