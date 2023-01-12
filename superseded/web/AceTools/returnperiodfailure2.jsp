<%--
    Document   : developmentfailure
    Created on : 26 Jun, 2011, 10:52:12 AM
    Author     : SAMBA
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
        <title>:: Failure</title>
            <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
             <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
    </head>
    
    <body bgcolor="DDDDDD">

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
                    <h3> <center>Riser Information Database</center></h3><br>
                    <table>
                                <tr>
                                    <td>
                                        <a href="radio.jsp">DevelopmentData ></a>
                                        <a href="metaocean.jsp">Metaocean ></a>
                                        <a href="returnperiod1.jsp">ReturnPeriod</a>
                                    </td>
                                </tr>
                            </table>

        <form action="returnperiod1.jsp">
        <center>
        <h4>Sorry, No data available for selected value</h4>
        <input type="submit" value="Retry"/></center>
        </form><br><br>
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
                </td>
            </tr>
        </table>
    </div>
    </body>
    
</html>
