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
      <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
        <script type="text/javascript" src="js/comment.js"></script>
        <script src="stickynote.js"></script>
        <script type="text/javascript" language="javascrpit">
            <jsp:include page="js/edit.js" flush="false"/>
        </script>


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
    <body bgcolor="DDDDDD">
        <html:form action="/editdata" onsubmit="return valid()">
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
                             <h3><center> Riser Information Database </center></h3><br><center>
                            <table>
                                <tr>
                                    <td>Select Condition</td>
                                    <td><select name="condition">
                                            <option value="condition">Condition</option>
                                            <option value="cyclonic">Cyclonic</option>
                                            <option value="Non Cyclonic">Non Cyclonic</option>
                                            <option value="Hurricane">Hurricane</option>
                                            <option value="Swells">Swells</option>
                                            <option value="Winter-strom">Winter-strom</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Select Development</td>
                                    <td>
                                        <select name="development">
                                            <option value="development">development</option>
                                            <option value="Enfield">Enfield</option>
                                            <option value="Thunder Horse">Thunder Horse</option>
                                            <option value="Azurite">Azurite</option>
                                            <option value="Holstein">Holstein</option>
                                            <option value="West Dooish">West Dooish</option>
                                            <option value="South Uist">South Uist</option>
                                            <option value="Gro">Gro</option>
                                        </select>
                                    </td>
                                </tr>
                            </table></center>
                            <center>
                                Enter Significant-Height  :<input type="text" name="height"/><br><br>
                                <html:submit value="Go"/>
                                <html:reset  value="reset"/>
                            </html:form><br><br>
                        </center>    <table width="100%" cellpadding="0" cellspacing="0" class="footer">
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
