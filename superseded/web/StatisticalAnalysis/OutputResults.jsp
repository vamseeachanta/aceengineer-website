<%--
    Document   : dataFittingSuccess
    Created on : Nov 10, 2011, 3:44:54 PM
    Author     : PEPL-SM
--%>


<%@page import="java.io.PrintWriter"%>
<%@page import="java.io.FileWriter"%>
<%@page import="java.text.DecimalFormat"%>
<%@page import="java.text.NumberFormat"%>
<%@page import="java.io.File" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html"%>
<%@taglib  uri="http://struts.apache.org/tags-bean" prefix="form"%>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic"%>
<%@page import="java.util.ArrayList"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">


<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link type="text/css" rel="StyleSheet" href="res/css/fittingPage.css" media="screen"/>
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/rgbcolor.js"></script>
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/canvg.js"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/GoogleCharting.js"></script>
        <title>Success</title>
        <script type="text/javascript">
            $(function(){
                loadTabNavigation();
            });

            function loadTabNavigation()
            {
                var tabs = $('.navigator');
                $(tabs).click(function(){
                    var me = this;
                    $('.tabContent').slideToggle(500, function(){
                        $('#changeText').html($('#changeText').html()=="Hide data values"?"Show data values":"Hide data values");
                        $('#changeImage').html($('#changeText').html()=="Hide data values"?"<img src='res/images/minus.png' alt='' />":"<img src='res/images/Add.png' alt='' />");
                    });
                });
            }
        </script>
        <%
                    try {
                        HttpSession ses = request.getSession();
                        String CSV = (String) ses.getAttribute("CSVFile");
                        if (!CSV.contains("Normal")) {
                            response.sendRedirect("errorPage.jsp");
                        }
                        double[] lowerBound = null;
                        double[] frequency = null;
                        double[] upperBound = null;
                        double[] dataPoints = null;
                        double Mean = ((Double) ses.getAttribute("Mean")).doubleValue();
                        double Mode = ((Double) ses.getAttribute("Mode")).doubleValue();
                        double Median = ((Double) ses.getAttribute("Median")).doubleValue();
                        double Variance = ((Double) ses.getAttribute("Variance")).doubleValue();
                        double Kurtosis = ((Double) ses.getAttribute("Kurtosis")).doubleValue();
                        double Skewness = ((Double) ses.getAttribute("Skewness")).doubleValue();
                        double[] cdf = (double[]) ses.getAttribute("CDF");
                        double[] pdf = (double[]) ses.getAttribute("PDF");
                        double[] exepectedFrequency = (double[]) ses.getAttribute("ExpectedFrequency");
                        int pattern = ((Integer) ses.getAttribute("pattern")).intValue();
                        if (pattern == 3) {
                            lowerBound = (double[]) ses.getAttribute("lowerBound");
                            frequency = (double[]) ses.getAttribute("frequency");
                            upperBound = (double[]) ses.getAttribute("upperBound");
                        } else {
                            dataPoints = (double[]) ses.getAttribute("dataPoints");
                            frequency = (double[]) ses.getAttribute("frequency");
                        }
        %>
    </head>
    <body>
        <form action="" method="post">
            <table class="body-layout" align="center">
                <tr>
                    <td>
                        <table align="center">
                            <tr>
                                <th>Mean:</th>
                                <td><%=Mean%> &nbsp;&nbsp;&nbsp;</td>
                                <th>Mode:</th>
                                <td><%=Mode%>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                <th>Median:</th>
                                <td><%=Median%>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                <th>Variance:</th>
                                <td><%=Variance%>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                <th>Skewness:</th>
                                <td><%=Skewness%></td>
                                <th>Kurtosis:</th>
                                <td><%=Kurtosis%></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table>
                            <tr>
                                <td class="navigator" style="background: lightsteelblue; color: #1858B8; cursor: pointer;width: 890px"><span id="changeText">Hide data values</span></td>
                                <td align="right" style="background: lightsteelblue; color: #1858B8; cursor: pointer;" class="navigator"><span id="changeImage"><img src="res/images/minus.png" alt="" /></span></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="tabContent">
                    <td>
                        <!--                        <div style="height: 500px; overflow: scroll;">-->
                        <table border ="1" align="center" >
                            <% if (pattern == 3) {

                            %>
                            <tr style="background: #426094;color: white">
                                <th> Lower Interval</th>
                                <th> Upper Interval</th>
                                <th> Frequency </th>
                                <th> CDF  </th>
                                <th> PDF  </th>
                                <th>Expected Frequency</th>
                            </tr>
                            <%  for (int i = 0; i < cdf.length; i++) {

                                     String str = "tdbody1";
                                     if (i % 2 == 0) {
                                         str = "tdbody2";
                                     }%>
                            <tr class="<%=str%>">
                                <td align="center"><%=lowerBound[i]%></td>
                                <td align="center"><%=upperBound[i]%></td>
                                <td align="center"><%=frequency[i]%></td>
                                <td align="center" width="70px"><%=cdf[i]%></td>
                                <td align="center" width="70px"><%=pdf[i]%></td>
                                <td align="center"><%=exepectedFrequency[i]%></td>
                            </tr>
                            <% }
                             } else {

                            %>
                            <tr style="background: #426094;color: white">
                                <th> Data Point</th>
                                <th> Frequency </th>
                                <th> CDF </th>
                                <th> PDF </th>
                                <th>Expected Frequency</th>
                            </tr>
                            <% for (int i = 0; i < cdf.length; i++) {

                                     String str = "tdbody1";
                                     if (i % 2 == 0) {
                                         str = "tdbody2";
                                     }%>
                            <tr class="<%=str%>">
                                <td align="center"><%=dataPoints[i]%></td>
                                <td align="center"><%=frequency[i]%></td>
                                <td align="center" width="70px"><%=cdf[i]%></td>
                                <td align="center" width="70px"><%=pdf[i]%></td>
                                <td align="center"><%=exepectedFrequency[i]%></td>
                            </tr>
                            <% }
                                                    }

                            %>
                        </table>
                        <!--                        </div>-->
                    </td>
                </tr>
                <tr>
                    <td>
                        <table  align="center">
                            <tr>
                                <td class="body">
                                    <div id="CDFchart" style="width: 900px; height: 500px;"></div>
                                </td>
                            </tr>
                            <tr>
                                <td class="body">
                                    <div id="PDFchart" style='width: 900px; height: 500px;'></div>
                                </td>
                            </tr>
                            <tr>
                                <td class="body" colspan="2">
                                    <div id="chart_div" style="width: 900px;height: 500px"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <script type="text/javascript" src='https://www.google.com/jsapi'></script>
                <script type="text/javascript">
                    google.load('visualization', '1', {packages:['corechart']})
                    google.setOnLoadCallback(drawChart);
                    function drawChart() {
                        var cdfdata = new google.visualization.DataTable();
                        var pdfdata = new google.visualization.DataTable();
                        cdfdata.addColumn('string','Datavalues');
                        cdfdata.addColumn('number', 'CDF');
                        cdfdata.addRows(<%=cdf.length%>);
                        pdfdata.addColumn('string','Datavalues');
                        pdfdata.addColumn('number', 'PDF');
                        pdfdata.addRows(<%=cdf.length%>);
                    <%
                                            for (int i = 0; i < cdf.length; i++) {
                                                if (pattern == 3) {%>
                                                        cdfdata.setValue(<%=i%>,<%=0%>,'<%=lowerBound[i]%>');
                                                        cdfdata.setValue(<%=i%>,<%=1%>,<%=cdf[i]%>);
                                                        pdfdata.setValue(<%=i%>,<%=0%>,'<%=lowerBound[i]%>');
                                                        pdfdata.setValue(<%=i%>,<%=1%>,<%=pdf[i]%>);
                    <%  } else {%> cdfdata.setValue(<%=i%>,<%=0%>,'<%=dataPoints[i]%>');
                            cdfdata.setValue(<%=i%>,<%=1%>,<%=cdf[i]%>);
                            pdfdata.setValue(<%=i%>,<%=0%>,'<%=dataPoints[i]%>');
                            pdfdata.setValue(<%=i%>,<%=1%>,<%=pdf[i]%>); <%}
                                                    }%>
                                                            var cdfchart = new google.visualization.LineChart(document.getElementById('CDFchart'));
                                                            cdfchart.draw(cdfdata,
                                                            {
                                                                width:
                                                                    900,
                                                                height:
                                                                    500,
                                                                title: 'CDF Chart',
                                                                vAxis: {title: 'CDF', titleTextStyle: {color: 'red'}},
                                                                hAxis:{title: 'DataValues',titleTextStyle:{color:'red'}},
                                                                enableInteractivity: true
                                                            }
                                                        );
                                                            var pdfchart = new google.visualization.LineChart(document.getElementById('PDFchart'));
                                                            pdfchart.draw(pdfdata,
                                                            {
                                                                width:
                                                                    900,
                                                                height:
                                                                    500,
                                                                title: 'PDF Chart',
                                                                vAxis: {title: 'PDF', titleTextStyle: {color: 'red'}},
                                                                hAxis:{title: 'DataValues',titleTextStyle:{color:'red'}},
                                                                enableInteractivity: true
                                                            }
                                                        );
                                                            var data = new google.visualization.DataTable();
                                                            data.addColumn('string', 'Year');
                                                            data.addColumn('number', 'Frequency');
                                                            data.addColumn('number', 'Expected Frequency');
                                                            data.addRows(<%=cdf.length%>);
                    <% for (int i = 0; i < cdf.length; i++) {
                                                if (pattern == 3) {%>
                                                        data.setValue(<%=i%>,<%=0%>,'<%=lowerBound[i]%>');
                                                        data.setValue(<%=i%>,<%=1%>,<%=frequency[i]%>);
                                                        data.setValue(<%=i%>,<%=2%>,<%=exepectedFrequency[i]%>);
                    <%} else {%>
                            data.setValue(<%=i%>,<%=0%>,'<%=dataPoints[i]%>');
                            data.setValue(<%=i%>,<%=1%>,<%=frequency[i]%>);
                            data.setValue(<%=i%>,<%=2%>,<%=exepectedFrequency[i]%>);
                    <%      }
                                    }
                                } catch (Exception e) {
                                    System.out.println("Exception" + e);
                                    response.sendRedirect("errorPage.jsp");
                                }
                    %>
                            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                            chart.draw(data, {width: 900, height: 500, title: 'Frequency Comparison',
                                vAxis: {title: 'Frequency', titleTextStyle: {color: 'red'}},
                                hAxis:{title: 'DataValues',titleTextStyle:{color:'red'}}
                            });
                            saveCsv();

                        }

                        function saveImage()
                        {
                            try
                            {
                                var data1 = GooleCharting.getImgData($('#CDFchart')[0]);
                                var data2 = GooleCharting.getImgData($('#PDFchart')[0]);
                                data1 = data1.replace('data:image/png;base64,', '');
                                data2 = data2.replace('data:image/png;base64,', '');
                                var xml = new XMLHttpRequest();
                                xml.open("POST", "imageWriter.do", true);
                                xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                xml.onreadystatechange = function()
                                {
                                    if(xml.readyState==4 && xml.status==200)
                                    {
                                    }
                                }
                                xml.send("size=2"
                                    +"&imgData1="+encodeURIComponent(data1)+"&imgName1=CDF1.png"
                                    +"&imgData2="+encodeURIComponent(data2)+"&imgName2=PDF1.png");
                            }
                            catch(e){}
                        }
                        function saveCsv()
                        {
                            var xml = new XMLHttpRequest();
                            xml.open("post","csv.do",true);
                            xml.onreadystatechange = function()
                            {
                                if(xml.readyState==4 && xml.status==200)
                                {
                                }
                            }
                            xml.send(null);
                        }
                </script>
            </table>
<!--            <div align="right">
                <a  href="OutputResults.jsp" target="_blank">Open result in a new tab</a> &nbsp;|
                <a href="PDFFiles/MyCSV.csv" target="_blank">DownLoad CSV File</a>&nbsp;|
                <a  href="PDFFiles/NormalDistribution.pdf" target="_blank" class="Charting" onclick="saveImage();"><img src="res/images/PDF.png" alt="Download" class="Charting"/>Download as PDF</a>
            </div>-->
        </form>
    </body>
</html>