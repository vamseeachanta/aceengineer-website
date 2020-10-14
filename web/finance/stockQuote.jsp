<%-- 
    Document   : stockQuote
    Created on : May 10, 2012, 9:19:39 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <!--        Page Title-->
        <title>AceEngineer: Finance/Portfolio</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="description" content="AceEngineer provides a free portfolio management to analyzing strengths, weakness, opportunities and threats for performing and balancing risk against the performance and suggest best investment on stocks">
        <meta name="keywords" content="stocks, mutual funds, shares, best investment strategies, investment, portfolio management, stocks to buy, free portfolio management, mutual fund investment">

        <!--        Include All CSS-->
        <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/ace.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/core.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/DOMElements.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/ElementManipulator.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css"/>
        <link rel="stylesheet" href="res/css/chosen.css"/>
        <link rel="shortcut icon" href="res/icons/stock_icon.gif"/>
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <style type="text/css">
            .frame{
                /*overflow: hidden;*/
                width:980px;
                height: 500px;
            }

            .footer{
                text-align: center;
            }
        </style>

        <!--        Complete All CSS-->
        <!--        Include All JS-->




        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/rgbcolor.js"></script> 
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/canvg.js"></script>

        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/chosen.jquery.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/jqFancyTransitions.1.8.min.js"></script>
        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>
        <script type="text/javascript" src="res/js/StockComputation_New2.js"></script>
        <script type="text/javascript" src="res/js/ForExChart.js"></script>
        <script type="text/javascript" src="res/js/FundamentalIndicator_New2.js"></script>
        <script type="text/javascript" src="res/js/DataRetriver_New.js"></script>
        <script type="text/javascript" src="res/js/CrossDomainXML.js"></script>
        <script type="text/javascript" src="res/js/date.js"></script>        
        <script type="text/javascript" src="res/js/StockCore_New.js"></script>
        <script type="text/javascript" src="res/js/GoogleCharting_New.js"></script>
        <script type="text/javascript" src="res/js/ReturnAssessment.js"></script>
        <script type="text/javascript" src="res/js/FundAnalyzer.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript" src="res/js/browser.js"></script>
      







        <script type="text/javascript">
            $(function(){
                var leave_message = 'AceEngineer'
                function goodbye(e) {
                    //                       if (!validNavigation) {
                    //      if (dont_confirm_leave!==1) {
                    if(!e) e = window.event;
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = leave_message;
                    //e.stopPropagation works in Firefox.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    //return works for Chrome and Safari
                    return leave_message;
                    //      }
                    //                        }
                }
                //               window.onbeforeunload=goodbye(e);
                //                window.onbeforeunload = function closeBrowser(e){
                //                    if(!e) e = window.event;
                ////                    $.get('userHandler.do',null,function(data){
                ////                        return "Samba Murthy";
                ////                    });
                //                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                //                    e.cancelBubble = true;
                //                    e.returnValue = leave_message;
                //                    //e.stopPropagation works in Firefox.
                //                    if (e.stopPropagation) {
                //                        e.stopPropagation();
                //                        e.preventDefault();
                //                    }
                //                    
                //                }
                //               var div = $('.feedback')[0];
                //                $(window).scroll(function(){
                //                    var v = ($(window).height()-$(div).height())/2;
                //                    v += $(window).scrollTop();
                //                    $(div).css({
                //                        //                left:'-'+($(div).width()-20)+'px',
                //                        top:v-100
                //                    });
                //                });
                $("#feedback_button").click(function(){
                    $('.form').slideToggle();   		
                });
                $("#feedback_Submit").click(function()
                {
                    $("#feedback_Result").html("");
                    formValid = $("#form").validate(
                    {
                        rules: {
                            senderName: {
                                required: true,
                                // FN: true,
                                minlength: 2,
                                maxlength: 25
                            },
                            Email: {
                                required: true,
                                email: true,
                                minlength: 2
                            },
                            Subject: {
                                required: true,
                                minlength: 2,
                                maxlength: 25
                            },
                            msgBody: {
                                required: true
                            }
               
                        },
                        messages: {
                            senderName: {
                                required: "Required",
                                FN: "only characters required!",
                                minlength: jQuery.format("At least {0} characters required!")
                            },
                            Email:
                                {
                                required: "Required",
                                email: "Enter correct email-id"
                                //minlength: jQuery.format("At least {0} characters required!")
                            },
                            Subject: {
                                required: "Required",
                                minlength: jQuery.format("At least {0} characters required!")
                            },
                            msgBody: {
                                required: "Required"
                            }

                        },
                        errorPlacement: function(error, element)
                        {
                            var span = error;
                            var pos = $(element).position();
                            $(span).css({
                                'position':'absolute',
                                'padding':'1px',
                                'font-size':'12px',
                                'background':'red',
                                'color':'white',
                                'border':'red',
                                '-webkit-border-radius':'2px',
                                '-webkit-box-shadow':'3px 3px 3px black',
                                'display':'block',
                                //                    'left':pos.bottom+$(element).outerWidth(),
                                'left':pos.left+180,
                                'top':pos.top+20
                            });
                            $(span).appendTo(element.parent());
                        },
                        success: function(label){
                            $(label).remove();
                        }
                        
                    });
        
                    $.validator.addMethod('FN', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                
                    if ($("#form").validate().form() == true) 
                    {
                        var sendName = $('input[name="senderName"]').val();
                        var senderMail = $('input[name="Email"]').val();
                        var subject = "Feedback "+$('input[name="Subject"]').val();
                        var msgbdy = $("#msgBody").val();
                        //var success = "<span style='color:green;'>Message sent succesfully</span>";
                        //var fail = "<span style='color:red;' >Message sending failed</span>";
                        $.post("changeSettings.do?senderName="+sendName+"&Email="+senderMail+"&Subject="+subject+"&msgBody="+msgbdy+"&mode="+1,null,function(data){
                            if(data == 1){
                                $("#feedback_Result").html("<span style='color:green;'>Message sent succesfully</span>");
                                //alert($('input[name="senderName"]')[0]);
                                $('input[name="senderName"]').val("");
                                $('input[name="Email"]').val("");
                                $('input[name="Subject"]').val("");
                                $('textarea[name="msgBody"]').val("");
                            }
                            else{
                                $("#feedback_Result").html("<span style='color:red;'>Sorry, Message not sent</span>");
                            }
                            $("#feedback_Result").show();
                        });
                    }
                }); 
                
                // Attach the event keypress to exclude the F5 refresh
                DOMElement.makeAsTabbedPaneStockQuote(document.getElementById('mainTabStockQuote'));
                $('#slideshowDiv').jqFancyTransitions({ width: 400, height: 300});   
                
                /*Start - for drop down menu*/
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
                /*End of drop down menu*/
                $('.dropMenu_Register').find('li').click(function()
                {
                    $('.dropMenu_Register').find('li').removeClass('active');
                    $(this).addClass("active");
                });
            });
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
    <!--       Complete Header part-->
    <!--           Inlcudes All HTML Tags-->
    <body class="myBody">
        <div class="feedback">
            <a id="feedback_button" class="a"><img src="res/images/feedback.png"/></a>
            <form class="form" id="form">
                <h2>Feedback Please</h2>
                <p><label>Name: </label><input type="text" name="senderName" id="senderName"/></p>
                <p><label>Email: </label><input type="text"  name="Email" id="Email"/></p>
                <p><label>Subject: </label><input type="text" name="Subject" id="Subject"/></p>
                <p><label>Message: </label><textarea id="msgBody" name="msgBody"></textarea></p>
                <p align="right"><input type="button" value="SEND" class="btn" id="feedback_Submit"/></p>
                <label id="feedback_Result" style="display: none; width: 300px"></label>
            </form>
        </div>
        <table class="content" align='center'>
            <tr>
                <td valign="top" height="100px">
                    <jsp:include page="header.jsp"/>
                </td>
            </tr>
            <tr valign="top" >
                <td>
                    <div id='mainTabStockQuote'>
                        <div class="tabsStockQuote">
                            <ul class="dropMenu_Register">
                                <!--                                <li class="active"><a><span style="height: 25px;">My Portfolio</span></a></li>
                                                                <li><a><span>My Stock Analysis</span></a></li>
                                                                <li><a><span>My Forex Watch</span></a></li>
                                                                <li><a><span>Our Philosophy</span></a></li>-->
                                <li class="active"><a>My Portfolio</a></li>
                                <li><a>My Stock Analysis</a></li>
                                <li><a>My Forex Watch</a></li>
                                <li><a>Our Philosophy</a></li>
                            </ul> 
                        </div>
                        <div class="tabsContainer">
                            <div class="tabContentStockQuote">
                                <jsp:include page="tickers.jsp"/>
                            </div>
                            <div class="tabContentStockQuote"  >                                
                                <jsp:include page="independentPortfolio.jsp"/>
                            </div>
                            <div class="tabContentStockQuote" >
                                <jsp:include page="currencyConversion.jsp"/>
                            </div>
                            <div class="tabContentStockQuote" >
                                <jsp:include page="public_philosophy.jsp"/>
                            </div>
                        </div>
                    </div>
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
                            <a href="https://www.facebook.com/AceEngineer"><img src="res/images/Facebook-Buttons-1-10-.png"/></a>
                            <a href="https://twitter.com/AceEngineer1"><img src="res/images/twitter.png"/></a>
                            <a href="http://www.linkedin.com/company/aceengineer"><img src="res/images/Googleplus.png"/></a>
                            <a href=" https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"><img src="res/images/linkin_icon.png"/></a>
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
        <!--        Loading CDN Based Java Scripts-->
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/rgbcolor.js"></script> 
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/canvg.js"></script>
        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    </body>
    <!--    Complete All HTML Tags-->
</html>
