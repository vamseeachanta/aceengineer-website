<%-- 
    Document   : Login
    Created on : 15 Jun, 2011, 3:08:05 PM
    Author     : SAMBA
--%>


<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<head>
    <script type="text/javascript" language="javascript" src="js/menu.js"></script>
    <link type="text/css" rel="stylesheet" href="css/new.css" media="screen">
    <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">
    <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
</head>
<body>
<title>Login</title>
    <div align="center">

        <table width="840" class="entire">
            <tr><td>
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
                    <html:form action="/login"><center>
                            <table border="0">
                                <tbody>
                                    <tr>
                                        <td>Enter your name:</td>
                                        <td><html:text property="name" /></td>
                                    </tr>
                                    <tr>
                                        <td>Enter your password:</td>
                                        <td><html:password property="password" /></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td><html:submit value="Login" /></td>
                                    </tr>
                                </tbody>
                            </table></center>
                    </html:form><br><br>
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


