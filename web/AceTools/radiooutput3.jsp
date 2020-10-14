<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>


<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>:: Radio OutPut page</title>
    </head>
    <body bgcolor="DDDDDD"><center>
        <html:form action="riser.jsp">
        <h3> Selected Data is: <bean:write name="radioform" property="data"/></h3>
        <h1>Click below</h1>
        <html:submit value="Click"/>
        </html:form></center>
    </body>
</html>