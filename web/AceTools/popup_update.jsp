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
        <jsp:include page="js/check.js" flush="false"/>
        <jsp:include page="js/comment.js" flush="false"/>
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
            <table width="400" class="entire">
                <tr>
                    <td>
                        <table width="100" cellpadding="0" cellspacing="0" class="header">
                            <tr>
                                <td width="120" valign="top" >
                                    <div align="left">
                                        <a href="Home.jsp">
                                            <img src="images/AceEngineer logo 320x129.jpg" height="70" width="150">
                                        </a></div>
                                </td>

                            </tr>
                        </table>

                        <h3><center> Riser Information Database </center></h3><br><center>
                            <table>
                                <tr>
                                    <td>
                                        <table border="1" id="cond_tab">
                                            <th> Condition </th>
                                            <logic:iterate id="cond" name="updateForm" property="cond" >
                                                <tr> <td><bean:write name="cond" /></td></tr>
                                            </logic:iterate>
                                        </table>
                                    </td>
                                    <td>
                                        <table border="1" id="dev_tab">
                                            <th> Development </th>
                                            <logic:iterate id="dev" name="updateForm" property="dev">
                                                <tr><td><bean:write name="dev" /></td></tr>
                                            </logic:iterate>
                                        </table>
                                    </td>
                                    <td>
                                        <table border="1" id="hs_tab">
                                            <th> Significant Wave Height(m) </th>
                                            <logic:iterate id="hs" name="updateForm" property="hs">
                                                <tr><td><bean:write name="hs" /></td></tr>
                                            </logic:iterate>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table>
                                <tr>
                                    <td>Select Condition Type</td>
                                    <td><select name="condition" style="width:100%">
                                            <option value="condition">            </option>
                                            <option value="Cyclonic">Cyclonic</option>
                                            <option value="Non Cyclonic ">Non  Cyclonic</option>
                                            <option value="Hurricane">Hurricane</option>
                                            <option value="Swells">Swells</option>
                                            <option value="Winter-strom">Winter-strom</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Select Development Name</td>
                                    <td>
                                        <select name="development" style="width:100%">
                                            <option value="development">          </option>
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
                            </table>
                            Enter Significant-height :   <input type="text" name="height" style="width:25%"/>
                        </center><br>
                        <center>
                            <html:submit value="Go" onclick="return valid()"/>

                        </html:form><br><br>
                    </center>
                </td>
            </tr>
        </table>
    </body>
</html>
