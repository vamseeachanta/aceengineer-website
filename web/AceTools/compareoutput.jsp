<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html">
        <title>Metocean</title>
        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">

    </head>
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
    <body>
        <div align="center">
            <table width="840" class="entire">
                <tr>
                    <td>
                       <table width="840" cellpadding="0" cellspacing="0" class="header">
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
                        <a href="radio.jsp">DevelopmentData ></a>
                        <a href="metaocean.jsp">Metocean</a>

                        <form action="radio.jsp">
                            <center>
                               
                                <b>METOCEAN Long Current Compare</b><br>
                                <img src="images/chart2_6.JPG" alt=""/><br><br>
                                <table border="1">
                                    <tr>
                                        <td>
                                            <table border="1">
                                                <th colspan="1"> Region: </th>
                                                <logic:iterate id="region" name="compareform" property="region">
                                                    <tr><td><bean:write name="region" /></td></tr>
                                                </logic:iterate>
                                            </table>
                                        </td>
                                        <td>
                                            <table border="1">
                                                <th colspan="1"> Current: </th>
                                                <logic:iterate id="current" name="compareform" property="current">
                                                    <tr><td><bean:write name="current" /></td></tr>
                                                </logic:iterate>
                                            </table>
                                        </td>
                                        <td>
                                            <table border="1">
                                                <th colspan="1"> Exceedence: </th>
                                                <logic:iterate id="exced" name="compareform" property="exced">
                                                    <tr><td><bean:write name="exced" /></td></tr>
                                                </logic:iterate>
                                            </table> 
                                        </td>

                                    <tr>
                                </table><br><br>
                                <input type="submit" value="Back"/><br></center></form><br><br>
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