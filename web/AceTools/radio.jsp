<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>



<html>
    <head>
        <title>WELCOME</title>
        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
    <head>
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
                        <h3><center>Riser Information Database</center></h3><br>
                        <table>
                            <tr>
                                <td>
                                </td>
                            </tr>
                        </table>
                        <center>
                           
                            <html:form action="/radiobutton">
                                <h5><bean:write name="radioform" property="error" filter="false"/></h5>

                                <table border="0">

                                    <tbody>
                                        <tr>
                                            <td> <b>Metocean Data</b> </td>
                                            <td> <html:radio property="data" value="METAOCEAN"/> </td>
                                        </tr>
                                        <tr>
                                            <td> <b> Vessel Data</b> </td>
                                            <td> <html:radio property="data" value="VESSEL"/> </td>
                                        </tr>
                                        <tr>
                                            <td> <b>Riser data</b> </td>
                                            <td> <html:radio property="data" value="RISER"/> </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <html:submit value="Click"/>
                                <html:reset/>
                            </html:form></center><br><br>
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
