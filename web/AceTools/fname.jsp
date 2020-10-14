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
        <script type="text/javascript" language="javascript">
            <jsp:include page="js/fname2.js" flush="false"/>
        </script>
        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
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
    </head>
    <body >
        <html:form action="/fname" onsubmit="return change(t1)">
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
                                    <td width="25%" class="nav-a"><a href="Home.jsp">Home</a></td>
                                    <td width="25%" class="nav-a"><a href="Applications.jsp">Applications</a></td>
                                    <td width="25%" class="nav-a"><a href="Services.jsp">Services</a></td>
                                    <td width="25%" class="nav-a"><a href="AboutUs.jsp">About Us</a></td>
                                    <td width="25%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                                </tr>
                            </table><br>
                            <center>
                                <h3><center>Riser Information Database</center></h3><br>
                            </center>
                             <table>
                                <tr>
                                    <td>
                                        <a href="radio.jsp">DevelopmentData ></a>
                                        <a href="riser.jsp">Riser</a>
                                    </td>
                                </tr>
                            </table>
                            <center>
                                <h4> Select from the below following:</h4>
                                <table border="0">
                                    <tr>
                                        <td>
                                            <b>Production</b></td>
                                        <td>
                                            <html:radio property="f_riser"   value="production"/></td></tr>
                                    <tr>
                                        <td>
                                            <b>Export</b></td>
                                        <td> <html:radio property="f_riser"   value="export" onclick="show()"/></td>
                                    </tr>
                                </table>
                                <br><br>
                                <b>Enter Minimum Water Depth :<input type="text" name="t1"/></b>
                                <input type="submit" value="Click"  />
                                <html:reset/>
                            </html:form>
                        </center><br><br>
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
