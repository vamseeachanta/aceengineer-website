<%-- 
    Document   : AboutUs
    Created on : 12 Jul, 2011, 10:56:28 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/lavalamp_test.css" type="text/css" media="screen">
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">

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
    <div id="test" class="stickynote">
        <h3>
            <a href="#" id="commentLink" onclick="return handleClick()">Comment Here</a></h3>
    </div>


    <title>::About Us</title>
</head>
<body>

    <div align="center">
        <table cellpadding="0" cellspacing="0" width="840" class="entire">
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
                            <td width="20%" class="nav-a"><a href="test.jsp">About Us</a></td>
                            <td width="20%" class="nav-a"><a href="Feedback.jsp">Feedback</a></td>
                        </tr>
                    </table>
                   <table>
                            <tr>
                                <td>
                                    <h1>About Us</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size: 11pt">
                                    <!-- <p>AceEngineer is a experienced and skillful team providing solutions in financial and engineering sectors. The team is highly experienced,qualified and motivated to find solutions for real world problems. AceEngineer provides customized software solutions for highly specialized companies.</p><br>-->
                                    <p>AceEngineer is an experienced and skillful team providing solutions in financial and engineering sectors. The team is highly experienced, qualified and motivated to find solutions for real world problems. AceEngineer through research & development and latest technologies shall provide cutting edge engineering solutions for various industries</p><br>
                                   <!-- <p>Founded by four Indian Institute of Technology (IIT) alumni as an AceMatrix group in 2005, AceMatrix as services provider company provided skilled expertise at client sites for well reputed clients like University of Pheonix, Siemens and Capital One. </p><br>-->
                                    <p>AceEngineer is the engineering services unit of Prarohana Enterprises Private Ltd., a venture started by alumni of IIT Madras. We have a young and dynamic team to perform high quality work cost effectively. You will experience your requirements being met on time, within budget and with utmost satisfaction</p><br>
                                    <!--<p>AceMatrix transformed from a consultancy to a specialized software services firm, AceEngineer. AceEngineer is power by Prarohana, a venture capital investor company based in India</p><br>-->
                                    <p>AceEngineer is currently doing development work in the financial, electrical and mechanical fields. Our short-term goal is to provide services to key clients in these fields. Our aim is to become a leading specialist software solution provider with multi-disciplinary knowledge of engineering and process automation in the long run</p><br>
                                    <!--<p><b>Currently there are engineering projects under development and a few of them in progress are mentioned below:</b><br>
                                        &rArr; Finance market analytics in the emerging economy of India in the field of Financial engineering<br>
                                        &rArr; Develop a WIFI operated sensor to help detect a lost cell phone or any electronic devices<br>
                                        &rArr; Develop customized prototype software for an multi-national engineering firm in the field of heat transfer and electronic cooling<br>
                                        &rArr; Develop customized prototype software for an multi-national engineering firm in the field of oil and gas industry
                                    </p><br>-->
                                    <p>
                                        AceEngineer  people are experts. From day one, our employees receive some of the finest training in the industry, coupled with hands–on mentoring. We are as dedicated to the success of the people we hire to build our projects as we are to the people who hire us to build them.
                                    </p><br>

                                </td>
                            </tr>
                        </table>




                    <table width="100%" cellpadding="0" cellspacing="0" class="footer">
                        <tr>
                            <td width="500">
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
</html>
