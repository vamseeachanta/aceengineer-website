<%-- 
    Document   : GroupedData
    Created on : Jul 16, 2012, 1:06:04 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link type="text/css" rel="StyleSheet" href="res/css/fittingPage.css" media="screen"/>
        <title></title>
    </head>
    <%
    HttpSession ses = request.getSession();
                double[] lowerBound = (double[]) ses.getAttribute("GroupedLower");
                double[] frequency = (double[]) ses.getAttribute("GroupedFrequency");
                double[] upperBound = (double[]) ses.getAttribute("GroupedUpper");
    %>

    <body>
        <form action="dataFittingSuccess.jsp" target="_blank">
            <table border="1" align="center">
                <tr style="background: #426094;color: white">
                    <th> LowerInterval</th>
                    <th> UpperInterval </th>
                    <th> Frequency </th>
                </tr>
                <% for (int i = 0; i < lowerBound.length; i++) {
                                String str = "tdbody1";
                                if (i % 2 == 0) {
                                    str = "tdbody2";
                                }%>
                <tr class="<%=str%>">
                    <td class="body" align="center"><%=lowerBound[i]%></td>
                    <td class="body" align="center"><%=upperBound[i]%></td>
                    <td class="body" align="center"><%=frequency[i]%></td>
                </tr>
                <% }%>
            </table>
                <div align="center" >Number of Intervals is : <%=lowerBound.length%></div>
        </form>
    </body>
</html>
