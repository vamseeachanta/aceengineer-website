<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
        <link type="text/css" rel="stylesheet" href="css/StyleSheet.css" media="screen">
        <link type="text/css" rel="stylesheet" href="css/Tabs.css" media="screen">

   
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
         </head>
    <div id="test" class="stickynote">
        <h3>
            <a href="#" id="commentLink" onclick="return handleClick()">Comment Here</a></h3>
    </div>
    <body >
        <form action="radio.jsp">
            <div align="center">
                <table width="840" class="entire">
                    <tr>
                        <td>
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
                             <h3> <center>Riser Information Database</center> </h3><br>
                            <a href="radio.jsp">DevelopmentData ></a>
                            <a href="vessel.jsp">Vessel</a>
                            <br><center>
                            <img src="images/chart2_12.JPG" alt=""/><br>
                            <input type="submit" value="Back"/><br><br></center>
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
            </div></form>
    </body>

</html>