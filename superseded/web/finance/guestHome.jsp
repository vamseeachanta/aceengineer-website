<%-- 
    Document   : guestHome
    Created on : May 17, 2012, 8:36:39 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>AceEngineer: Finance/guest</title>
<!--        Start of SEO Stuff-->
        <meta name="description" content="Welcome to AceEngineer finance management service, AceEngineer offers portfolio management, free download of customized reports, free email alerts for stock market">
        <meta name="keywords" content="Finance management service, financial management, finance management, portfolio, portfolio management, stock reports, free stock reports, free stock email alerts, stock alerts">
<!--        END of SEO Stuff-->
        
        
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/ace.css"/>
        <link rel="icon" href="res/icons/logoIcon.ico" />
        <script type="text/javascript">
            $(function(){
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });

               
            });
             function manually()
                {
                 formValid = $("#guestForm").validate(
                    {
                        rules: 
                            {
                            guestEmail: {
                                required: true,
                                email: true,
                                minlength: 2
                            }
                        },
                        messages: 
                            {
                           guestEmail:
                                {
                                required: "Email Required",
                                email: "Enter correct email-id"
                                //minlength: jQuery.format("At least {0} characters required!")
                            }
                        },
                        errorPlacement: function(error, element)
                        {
                            var span = error;
                            var pos = $(element).position();
                              $(span).css({'position':'absolute','padding':'1px',
                                'font-size':'11px',
                                'background':'red','color':'white',
                                'border':'red',
                                '-webkit-border-radius':'2px',
                                '-webkit-box-shadow':'3px 3px 3px black',
                                'display':'block',
                                'left':pos.left+$(element).outerWidth(),
                                'top':pos.top});
                            $(span).appendTo(element.parent());
                        },
                        success: function(label){
                            $(label).remove();
                        }
                    });
//                   if($("#GuestEmail").val() == "")
//                    {
//                        alert("Failure");
//                        return false;
//                    }
                 if ($("#guestForm").validate().form() == true) 
                     {
                      window.location.href = "userHandler.do?mode=1&userId="+$("#GuestEmail").val();
                     }
                }
        </script>
                <script type="text/javascript">
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-38045252-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
    </head>
    <body>
        <table class="content" width="990" align="center">
            <tr>
                <td>
                    <table width="100%" cellpadding="0" cellspacing="0" class="header">
                        <tr>
                            <td width="360" valign="top" ><div align="left"><a href="Home.html"><img src="res/images/logo.png" alt="Aceengineer Logo"></a></div> </td>

                        </tr>
                    </table>

                </td>
            </tr>
<!--            <tr>
                <td valign="bottom" class="menu" colspan="2">
                    <ul class="dropMenu">
                        <li ><a class="active" href="Home.html">Home</a></li>
                        <li ><a href="Services.html">Services</a></li>
                        <li class="hasSubMenu"><a href="applications.html">Applications</a>
                            <ul class="subMenu ">
                                <li><a href="#">Oil & Gas</a></li>
                                <li><a href="#">Statistical Analysis</a></li>
                                <li><a href="#">Stock Management</a></li>
                                <li><a href="#">Structural Analysis</a></li>
                                <li><a href="#">Data Manipulation</a></li>
                                <li class="bottom_border"><a href="#">Fluid Mechanics</a></li>

                            </ul>
                        </li>
                        <li class="hasSubMenu" ><a href="aboutUs.html" >About Us</a>
                        <li><a href="Careers.html">Careers</a></li>
                        <li><a href="contactus.html">Contact Us</a></li>
                    </ul>
                </td>
            </tr>-->
            <tr>
                <td>
                    <blockquote>
                        <h3>Hi, Guest Welcome to AceEngineer Stock Management Service</h3>
                        <hr/>
                        <logic:present name="ipTrackBean">
                            <div>
                                <blockquote>
                                    Hello! You Already Visited this site before as a Guest.
                                    We suggested you to create an account. It will helps you a lot.
                                    If it is first time to Visit this Site Please Ignore this Message.
                                </blockquote>

                                <p>
                                    Your previous Site Visit log                            
                                </p>                            
                                <table class="myTable">
                                    <thead>
                                        <tr>
                                            <th>Your Ip Address</th>
                                            <th>Accessed On</th>
                                            <th>Accessed Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><bean:write name="ipTrackBean" property="ip" /></td>
                                            <td><bean:write name="ipTrackBean" property="la" /></td>
                                            <td class="value" align="center"><bean:write name="ipTrackBean" property="at" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </logic:present>
                        <p>it's free and very Easy to Create an Account. let's <a href="login.jsp" class="myButton" style="padding:12px;text-decoration: none">Create an Account</a></p>
                        <h4 class="heading">Benefits of having An Account</h4>
                        <img src="res/images/sign_up_256.png" style="float:right"/>
                        <ul>
                            <li>You can manage Your Portfolio</li>
                            <li>You can Download Customized reports</li>
                            <li>You will have a dedicated account</li>
                            <li>You can save reports for further use</li>
                            <li>E-Mail Alerts</li>
                        </ul>
                        <form id="guestForm">
                        Enter Mail ID:  <input type="text" id="GuestEmail" class="guest guestForm"  name="guestEmail"/></br>
                        <!--                        userHandler.do?mode=1-->
                        <a href="javascript:manually()" class="myButton" id="GuestButton" style="padding:12px 24px;text-decoration: none">No thanks Continue as Guest</a>   
                    </form>
                    </blockquote>

                </td>
            </tr>
        </table>
        <div id="Footer" style="border: 1px solid #ffffff">
            <table id="siteMap" width="990" align="center">
                <tr>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="Home.html"><strong>Home</strong></a></li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="#"><strong>About Us</strong></a><br> 
                                <a href="AboutUs.html">Mission and Values</a><br>
                                <a href="AboutUs.html">History</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li> 
                                <a href="#"><strong>Services</strong></a><br>
                                <a href="Services.html">Financial Engineering</a><br>
                                <a href="Services.html">Mechanical Engineering</a><br>
                                <a href="Services.html">Civil and Structural Engineering</a><br>
                                <a href="Services.html">Project Management Tools</a><br>
                                <a href="Services.html">Web Designing and Web Hosting</a><br>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="#"><strong>Applications</strong></a><br>
                                <a href="OGHome.html">Oil & Gas</a><br>
                                <a href="statHome.html">Statistical Analysis</a><br>
                                <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management</a><br>
                                <a href="#">Heat Transfer</a><br>
                                <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a><br>
                                <a href="#">Data Manipulation</a><br>
                                <a href="#">Fluid Mechanics</a><br>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="#"><strong>Careers</strong></a><br>
                                <a href="careers.html">Current Openings</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="ContactUs.html"><strong>Contact Us</strong></a></li>
                        </ul>
                    </td>
                </tr>
                <tr>

                    <td colspan="6" align="right" valign="baseline" style="border-bottom: 1px solid white;">
                        <label  style="color:white; vertical-align: top; font-size:16px; ">Follow us on :</label>
                        <a href="#"><img src="res/images/Facebook-Buttons-1-10-.png"/></a>
                        <a href="#"><img src="res/images/twitter.png"/></a>
                        <a href="#"><img src="res/images/Googleplus.png"/></a>
                        <a href="#"><img src="res/images/linkin_icon.png"/></a>
                    </td>
                </tr>

                <tr align="center">
                    <td colspan="6">
                        <a href="OGHome.html">Oil & Gas &nbsp;&Vert;&nbsp;</a>
                        <a href="statHome.html">Statistical Analysis &nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Heat Transfer&nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Data Manipulation&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Fluid Mechanics</a>
                    </td>
                </tr>
                <tr align="center">
                    <td colspan="6" style="color:#ffffff;">
                        AceEngineer &copy; 2011, powered by PEPL
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>
