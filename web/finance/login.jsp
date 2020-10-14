<%-- 
    Document   : login
    Created on : May 3, 2012, 4:47:58 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="/WEB-INF/struts-html.tld" prefix="html"%>
<%@taglib uri="/WEB-INF/struts-bean.tld" prefix="bean"%>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--SEO Stuff Goes Here-->
        <meta name="description" content="Stock market due to financial crisis has been very volatile lately. Individual investors need not only to monitor their holdings but also may need to make decisions of when to buy and sell their assets. A set plan and following defined rules with discipline will help investors reach their long term financial goals. AceEngineer provides a free online stock, mutual fund and currency analysis tools.">
        <meta name="keywords" content="stock market, stocks, mutual funds, stock analysis online tool, stock assessment, portfolio, portfolio management, portfolio assessment, currency trends, stock trend guidance, adaptive guidance, dynamic guidance, financial plans, financial goals, long term financial goals, advice investors, compare funds with sector benchmarks, compare funds with benchmark funds, suggest funds, technical strategies">
        <!--END of SEO Stuff-->
        <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css">
        <link rel="stylesheet" type="text/css" href="res/css/ace.css">
        <link rel="stylesheet" type="text/css" href="res/css/DOMElements.css">
        <link rel="stylesheet" type="text/css" href="res/css/ElementManipulator.css">
        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css">
        <link rel="stylesheet" type="text/css" href="res/css/chosen.css">
        <link rel="shortcut icon" href="res/icons/stock_icon.gif">
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">
        <link rel="icon" href="res/icons/logoIcon.ico">

        <!--                <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
                        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
                        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
                        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
                        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
                        <script type="text/javascript" src="res/js/jqFancyTransitions.1.8.min.js"></script>
                        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>-->


        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/chosen.jquery.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/jqFancyTransitions.1.8.min.js"></script>
        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>
        <script type="text/javascript" src="res/js/StockComputationNew.js"></script>
        <script type="text/javascript" src="res/js/ForExChart.js"></script>
        <script type="text/javascript" src="res/js/FundamentalIndicatorNew.js"></script>
        <script type="text/javascript" src="res/js/DataRetriver.js"></script>
        <script type="text/javascript" src="res/js/CrossDomainXML.js"></script>
        <script type="text/javascript" src="res/js/date.js"></script>        
        <script type="text/javascript" src="res/js/StockCore_New.js"></script>
        <script type="text/javascript" src="res/js/GoogleCharting.js"></script>
        <script type="text/javascript" src="res/js/ReturnAssessment.js"></script>
        <script type="text/javascript" src="res/js/FundAnalyzer.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
      


        <title>AceEngineer: Finance</title>
        <style type="text/css">
            .hideContainer{                
            }
            .hideContainer .container{
                padding: 10px;
            }
            .hideContainer .top{
            }
            .hideContainer .back{
                display: none;
            }

            .contentDiv{
                margin-top: 10px;
                padding: 12px;
                font-size: 1.1em;
                color: black;
                text-align: justify;
                background: #8cc7ec;
                transition: all 1s;
                -moz-transition: all 1s; /* Firefox 4 */
                -webkit-transition: all 1s; /* Safari and Chrome */
                -o-transition: all 1s; /* Opera */
            }
            .contentDiv:hover{
                background: #abd6f1;                
                -webkit-box-shadow: 0px 0px 6px black;
                -moz-box-shadow: 0px 0px 6px black;
                box-shadow: 0px 0px 6px black;                
            }
        </style>

        <script type="text/javascript">
            $(function(){
                registerHideContainer();
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
               
                $("#login").click(function(){
                    $("#flag").val("login");
                    formValid = $('.loginForm').validate(
                    {
                        rules:
                            {
                            userName:
                                {
                                required : true,
                                email: true
                            },
                            password:
                                {
                                required: true,
                                minlength: 8
                            }
                        },
                        messages:
                            {
                            userName:
                                {
                                required: "Enter Your User ID",
                                email: "please enter correct email-id"
                            },
                            password:
                                {
                                required: "Please provide password",
                                minlength: jQuery.format("At least {0} required!")
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
                                'left':pos.left,
                                'top':pos.top+$(element).outerHeight()});
                            $(span).appendTo(element.parent());
                        },
                        success: function(label){
                            $(label).remove();
                        }
                    }
                );
                });
                $("#signup").click(function(){
                    $("#flag").val("signup");
                    formValid = $('.regForm').validate(
                    {
                        rules: {
                            fName: {
                                required: true,
//                                FN: true,
                                minlength: 2,
                                maxlength: 25
                            },
                            lName: {
//                                required: true,
//                                LN: true,
//                                minlength: 2,
                                maxlength: 25
                            },
                            mailId: {
                                required: true,
                                email: true,
                                minlength: 2
                            },
                            password: {
                                required: true,
                                minlength: 8
                            },
                            c_Pwd: {
                                required: true,
                                equalTo : $(".regPassword")[0],
                                minlength: 8
                            },
                            mobileNo: {
                                number: true,
                                phNo: true,
                                minlength: 9
                            },
                            checkbox:
                                {
                                required: true
                            }
                        },
                        messages: {
                            fName: {
                                required: "Please Enter Your First Name",
//                                FN: "only charectors required!",
                                minlength: jQuery.format("At least {0} characters required!")

                            },
                            lName: {
                                required: "Please Enter Your Last Name",
                                LN: "only charectors required!",
                                minlength: jQuery.format("At least {0} characters required!")

                            },
                            mailID:
                                {
                                required: "Enter Your Email ID",
                                email: "please enter correct email-id"
                                //minlength: jQuery.format("At least {0} characters required!")
                            },
                            password:
                                {
                                required: "Please specify password for your Profile",
                                minlength: jQuery.format("At least {0} required!")
                            },
                            c_Pwd: {
                                required: "Confirm Password",
                                minlength: jQuery.format("At least {0} required!"),
                                equalTo:"Confirm password dosen't match"
                            },
                            mobileNo: {
                                phNo: "please enter number",
                                minlength: jQuery.format("At least {0} required!")
                            },
                            checkbox:
                                {
                                required: "Please accept the terms & conditions"
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
                    $.validator.addMethod('FN', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                    $.validator.addMethod('LN', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                    $.validator.addMethod('CC', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                    $.validator.addMethod('EE', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                    $.validator.addMethod('ED', function (value) {
                        return /^[a-zA-Z]+$/.test(value);
                    });
                    $.validator.addMethod('phNo', function (value) {
                        return /^[0-9]+$/.test(value);
                    });
                });
                
                $('.dropMenu').find('li').click(function()
                {
                    $('.dropMenu').find('li').removeClass('active');
                    $(this).addClass("active");
                    $('.public_tabs').eq(0).hide();
                    $('.public_tabs').eq(1).hide();
                    $('.public_tabs').eq(2).hide();
                    $('.public_tabs').eq(3).hide();
                    var ind = $(this).index();
                    if(ind == 1)
                    {
                        document.title = "AceEngineer: Finance/public/forex"
                    }
                    if(ind ==2)
                    {
                        document.title = "AceEngineer: Finance/public/StockAnalysis";    
                    }
                    if(ind ==3)
                    {
                        document.title = "AceEngineer: Finance/Login";   
                    }
                    $('.public_tabs').eq(ind).show();
                });
                DOMElement.makeAsTabbedPane(document.getElementById('mainTab'));
                var results = $("#registerResult").text();
                if(results.length>100)
                {
                    $('.public_tabs').eq(3).show();
                }
                else
                {
                    $('.public_tabs').eq(0).show();
                }
            });
            function newPopup(url) {
                popupWindow = window.open(
                url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes')
            }
            function registerHideContainer(){
                $('.hideContainer').hover(function(){
                    $(this).find('.top').stop().animate({'opacity':'0.0'},1000,'linear',function(){
                        $(this).siblings('.back').show().stop().animate({'opacity':'1.0'},1000,'linear',function(){                        
                        });
                        $(this).hide();
                    });
                    
                },function(){
                    $(this).find('.back').stop().animate({'opacity':'0.0'},1000,'linear',function(){
                        $(this).siblings('.top').show().stop().animate({'opacity':'1.0'},1000,'linear',function(){                        
                        });
                        $(this).hide();
                    });
                });
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
    <body class="myBody">
        <div align="center">
            <table class="content" width="990" style="height: 500px;" border="0">
                <tr>
                    <td width="500" valign="top" class="header">
                        <div align="left">
                            <a href="http://www.aceengineer.com">
                                <img src="res/images/logo.png" alt="Aceengineer Logo" title=""/>
                            </a>
                        </div>
                    </td>
                    <td valign="top">
                        <div align="right">
                            <a href="#">
                                <img src="res/images/Stock4.jpg" class="border10" title="" alt=""/>
                            </a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td  colspan="2" align="right" class="header" >
                        <html:form action="login" styleClass="loginForm">
                            <table class="fo">
                                <tr>
                                    <td colspan="3">
                                        <bean:write name="LoginForm" property="error" filter=""></bean:write>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>Email ID</b> <html:text property="userName" />     
                                    </td>
                                    <td>
                                        <b>Password</b>   <html:password property="password" />     
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" align="right">
                                        <a style="color: #2878C0;font-size: 10px;">Can't access your account?</a>
                                        <button type="submit" id="login" class="myButton">Log In</button>                                        
                                    </td>
                                </tr>
                            </table>
                        </html:form>
                    </td>
                </tr>
                <tr>
                    <td  height="35px" class="menu" colspan="2">
                        <ul class="dropMenu">
                            <li class="active"><span>Philosophy</span></li>
                            <li><span>Forex Watch</span></li>
                            <li><span>Stock Analysis</span></li>
                            <li><span>Portfolio</span></li>
                        </ul>
                    </td>
                </tr>
                <tr id="public_Philosophy" class="public_tabs">
                    <td colspan="2" valign="top" align="left">
                        <jsp:include page="public_philosophy.jsp"/>
                    </td>
                </tr>
                <tr id="public_Forex" class="public_tabs">
                    <td colspan="2" valign="top">
                        <jsp:include page="public_CurrencyConversion.jsp"/>
                    </td>
                </tr>
                <tr id="public_StockAnalysis" class="public_tabs">
                    <td colspan="2" valign="top">
                        <jsp:include page="independentPortfolio.jsp"/>
                    </td>
                </tr>
                <tr class="public_tabs">
                    <td style="vertical-align: top">
                        <blockquote>
                            <div class="contentDiv border10">
                                Hi, Welcome to AceEngineer.                            
                                <p>
                                    AceEngineer provides a free online tool to analyze Stock Market.<br/><br/>
                                    You can avail this facility for free. What have to do is just create an account,
                                    it's a one minute task but provide lots of features portfolio management, currency trends with preset rules and AceEngineer philosophy.
                                </p>
                                <p>
                                    You can't explore our features without an account. But we provide you a guest account
                                    that will explain all the feature with limited functionality try <a href="ipHandler.do">here</a>.
                                </p>
                            </div>
                        </blockquote>
                    </td>
                    <td valign="top">
                        <html:form action="/registration" styleClass="regForm">
                            Don't have an Account?
                            just <label style="font-size: 18px;font-weight: bold">Sign Up</label><hr/>
                            <table  class="formFields">
                                <tr>
                                    <td colspan="2">
                                        <h4 style="color:red;text-align: center;padding:0px;margin:0px">
                                            <span id="registerResult">
                                                <bean:write name="RegistrationForm" property="error" filter="false"></bean:write>
                                                </span>
                                            </h4>
                                        </td>

                                    </tr>
                                    <tr>
                                        <td class="label">
                                            <label for="fName">First Name:</label>
                                        </td>
                                        <td>
                                        <html:text property="fName" />
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">
                                        <label>Last Name:</label>
                                    </td>
                                    <td>
                                        <html:text property="lName" />                                            
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">
                                        <label>Mail ID:</label>
                                    </td>
                                    <td>
                                        <html:text property="mailId" />                                            
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">
                                        <label>Password:</label>
                                    </td>
                                    <td>
                                        <html:password property="password" styleClass="regPassword" />                                            
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">
                                        <label>Confirm Password: </label>
                                    </td>
                                    <td>
                                        <input type="password" name="c_Pwd" />
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">
                                        <label>Mobile No: </label>
                                    </td>
                                    <td>
                                        <html:text property="mobileNo" />
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <input type="checkbox" name="checkbox" style="width: 50px"/>I agree to the AceEngineer <a href="JavaScript:newPopup('webContent.html');" style="color: #2878C0">Terms of Services</a>
                                        and <a style="color: #2878C0">Privacy Policy</a><br>
                                    </td>
                                </tr>
                                <tr>
                                    <td>

                                    </td>
                                    <td>
                                        <button id="signup" type="submit" class="myButton">Sign Up</button> or 
                                        <a href="ipHandler.do" class="myButton">Login as Guest.</a>
                                    </td>
                                </tr>
                            </table>
                        </html:form>
                    </td>
                </tr>
            </table>
            <div id="Registration_Data" style="display:none">
                <logic:present name="RegistrationForm">
                    <bean:write name="RegistrationForm" />
                </logic:present>
            </div>       
            <input type="hidden" name="flag" id="flag"/>
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
        </div>
    </body>
</html>
