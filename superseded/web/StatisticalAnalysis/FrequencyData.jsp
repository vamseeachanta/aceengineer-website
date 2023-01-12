<%-- 
    Document   : FrequencyData
    Created on : Jul 16, 2012, 1:04:34 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link type="text/css" rel="StyleSheet" href="res/css/fittingPage.css" media="screen"/>
        <title>Data Points</title>
    </head>
    <% try {
                    HttpSession ses = request.getSession();
                    String CSV = (String) ses.getAttribute("CSVFile");
                    if (!CSV.contains("Normal")) {
                        response.sendRedirect("errorPage.jsp");
                    }
                    double[] dataPoints = (double[]) ses.getAttribute("FrequencyDataPoints");
                    double[] frequency = (double[]) ses.getAttribute("FrequencyFrequency");
    %>
    <body>
        <table border ="1" align="center">
            <tr style="background: #426094;color: white">
                <th> Data Points</th>
                <th> Frequency </th>
            </tr>
            <% for (int i = 0; i < dataPoints.length; i++) {
                     String str = "tdbody1";
                     if (i % 2 == 0) {
                         str = "tdbody2";
                     }%>
            <tr class="<%=str%>">
                <td><%=dataPoints[i]%></td>
                <td><%=frequency[i]%></td>
            </tr>
            <% }
                        } catch (Exception e) {
                            response.sendRedirect("errorPage.jsp");
                        }%>
        </table>
    </body>
</html>
