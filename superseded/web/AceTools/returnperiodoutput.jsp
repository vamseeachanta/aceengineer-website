<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>:: Metocean</title>

        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
    </head>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
    <script type="text/javascript" src="js/comment.js"></script>
    <script type=""  src="stickynote.js"></script>


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

    <body bgcolor="DDDDDD" onload="return popup_check()"><center>
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
                            <table>
                                <tr>
                                    <td>
                                        <a href="radio.jsp">DevelopmentData ></a>
                                        <a href="metaocean.jsp">Metocean ></a>
                                        <a href="returnperiod.jsp">ReturnPeriods</a>
                                    </td>
                                </tr>
                            </table>
                            <center>
                                <h4> METOCEAN Extreme Wave</h4>
                            </center>

                            <form action="radio.jsp" name="myform">
                                <img src="images/chart2_3.JPG" alt=""/><center>
                                    <table>
                                        <tr>
                                            <td>
                                                <table border="1">
                                                    <th> Condition </th>

                                                    <logic:iterate id="cond" name="returnperiodform" property="cond">
                                                        <tr> <td><bean:write name="cond" /></td></tr>
                                                    </logic:iterate>
                                                </table>
                                            </td>
                                            <td>
                                                <table border="1">
                                                    <th> Development </th>
                                                    <logic:iterate id="dev" name="returnperiodform" property="dev">
                                                        <tr><td><bean:write name="dev" /></td></tr>
                                                    </logic:iterate>
                                                </table>
                                            </td>
                                            <td>  <table border="1">
                                                    <th> Significant Wave Height(m) </th>
                                                    <logic:iterate id="hs" name="returnperiodform" property="hs">
                                                        <tr>
                                                            <td><bean:write name="hs" /></td>
                                                        </tr>
                                                    </logic:iterate>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </center><br>

                                <center>
                                    <input type="submit" value="Back"/>
                                </center>
                            </form>
                            <table align="center">
                                <tr>
                                    <td>
                                        <form>
                                            <input type="button" value="Insert Data"  onclick="popup()"/>
                                        </form>
                                    </td>

                                    <td>
                                        <form>
                                            <input type="button" value="Update Data" onclick="popup_update()"/>
                                        </form>
                                    </td>
                                    <td>
                                        <form>
                                            <input type="button" value="Delete Data" onclick="popup_delete()"/>
                                        </form>
                                    </td>
                                </tr>
                            </table>
                            <br><br>
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
        </center>
    </body>
</html>