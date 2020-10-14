<%-- 
    Document   : welcome
    Created on : 15 Jun, 2011, 11:01:19 AM
    Author     : SAMBA
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html:html>
    <head>
        <LINK type="text/css" rel="stylesheet" href="Login.css" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Welcome to PEPL!!!</title>
    </head>

    <h1 align="center">PRAROHANA ENTERPRISES Pvt Ltd</h1>
    <br>
    <h2 align="center">SELECT TYPE OF DATA</h2>
    <html:form action="/welcome.jsp">
    <html:radio name="METAOCEAN" value="true" property="meta"> </html:radio>
    </html:form>
</html:html>