<%-- 
    Document   : index
    Created on : Dec 13, 2011, 9:30:33 AM
    Author     : Vamsee Achanta
--%>

<%@page import="com.ace.stock.SQLConnector"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jstl/sql" prefix="sql"%>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c"%>
<%@taglib uri="/WEB-INF/struts-html.tld" prefix="html"%>
<%@taglib uri="/WEB-INF/struts-bean.tld" prefix="bean"%>
<jsp:forward page="login.do"/>
<!--
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
        <style type="text/css">
            .bodyLayout
            {
                margin: 0px;
                width: 100%;
                border: 1px solid red;
                display: table;
                text-align: center;
            }

            .bodyLayout .cell
            {
                width: 1000px;
                border: 1px solid red;
                background: #666666;
            }

            .button
            {
                padding: 6px 20px;
                font-family: serif;
                font-size: 16px;
                color: black;
                cursor: pointer;
            }
        </style>

    </head>
    <body>
        <table class="bodyLayout">
            <tr>
                <td></td>
                <td class="body">                    
                </td>
                <td>
<html:form method="POST" action="login.do">
    <bean:write name="LoginForm" property="error" filter=""></bean:write>
    <table class="loginDiv">                            
        <tr>
            <td>Enter Login ID</td>
            <td><html:text property="userId" /></td>
        </tr>
        <tr>
            <td>Enter Password</td>
            <td><html:password property="password" /></td>
        </tr>
        <tr>
            <td colspan="2" align="right">
                <input type="submit" value="Login" class="button"/>
                <input type="button" value="Reset" class="button"/>                           
            </td>
        </tr>
    </table>
</html:form>
</td>
</tr>
</table>        
</body>
</html>-->
