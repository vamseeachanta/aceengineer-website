<%-- 
    Document   : login
    Created on : Jan 29, 2012, 11:33:27 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Welcome to AceEngineer</title>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>

        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>-->
        <script type="text/javascript" src="res/js/Core.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-38040262-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
        <script type="text/javascript">
            $(function()
            {                
                $('form').validate({
                    rules:{
                        username:{required:true},
                        password:{required:true}
                    },
                    messages:{
                        username:"Please Enter Your Login Id",
                        username:"Please Enter Your Login Password"
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
                        //alert(element[0]);
                        $(span).appendTo(element.parent());
                        //alert($(error).outerHeight(true));
                        //error.appendTo( element.parent() );
                    },
                    success: function(label){
                        $(label).remove();
                    }
                });                
                
                $('input[name="username"]').focus();
                
                $('#contactUs').hover(function(){
                    $(this).attr('src','res/images/contactUs2.png');
                },function(){
                    $(this).attr('src','res/images/contactUs1.png');
                }).click(function()
                {
                    $('body').append($('.contactInfoDiv'));
                    $('.layer').fadeTo(0,0,null).fadeTo(1000,0.50,function(){
                        $('.contactInfoDiv').                            
                            slideDown(500,null).
                            css({'left':($(document).width()-$('.contactInfoDiv').width())/2
                            ,'top':0});
                    });
                });
                
                $('.layer').click(function(){
                    $('.contactInfoDiv').slideUp(200);
                    $('.layer').fadeOut(500, null);
                });
                
                $('.contactInfoDiv').click(function(evt){
                    //evt.stopPropagation();
                });
            });            
        </script>
        <style type="text/css">
            .layer{
                left: 0px;
                top: 0px;
                display: none;
                position: absolute;
                position: fixed;
                width: 100%;
                height: 100%;
                background: black;                
            }
            .contactInfoDiv
            {
                background:#ffffff;
                width: 600px;
                display: none;
                position: absolute;
                padding: 20px;
                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;                

            }

            .justifiedPara{
                padding: 10px;
                text-align: justify;
                color: black;
            }

            .sideHeading{
                margin: 0px;
                padding: 5px 20px;
                background: #36a4ff;
                color: white;
            }
            .head{
                background: #8a8c8f;
            }

            #contactUs{
                cursor: pointer;
                font-weight: bolder;
                color: #3384E8;
                -webkit-transition: all 0.5s;
                transition: all 0.5s;
                -moz-transition:width 1s linear 2s;
            }
        </style>


        <!-- This Script for Google Tracking -->
        <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-34375695-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
    </head>
    <body>
        <table class="bodyLayout" align="center" border="0">
            <tr>
                <td colspan="2">
                    <img src="res/images/icons/logo.png" title="Hello" key="tootip" />

                </td>
                <td colspan="1" align="right">
                    <!--                    <img id="contactUs" src="res/images/contactUs1.png" alt="contactUs" style="cursor: pointer"/>-->
                    <label id="contactUs"  >Contact Us</label>
                    <img src="res/images/pmsLogo.png"/>
                </td>
            </tr>

            <tr>
                <td colspan="2">
                    <h4 style="background: #3384E8;padding: 20px;color: white">Welcome to AceEngineer</h4>
                    <p class="justifiedPara">
                        AceEngineer is a financial and engineering services provider company,
                        offering wide range of solutions meeting the organizational objectives
                        of our clients. The company is based in India. AceEngineer offers services in the fields of financial engineering, financial modeling, electrical engineering, mechanical engineering, civil engineering and environmental engineering.
                    </p>
                </td>

                <td  colspan="2" >
                    <html:form action="HomePage">
                        <fieldset class="myFieldset">
                            <legend>Login Here</legend>

                            <table class="formFields">
                                <tr>
                                    <td colspan="2">                                        
                                        <bean:write filter="false" name="LoginActionFormBean" property="error"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label" style="vertical-align: middle">Login Id</td>
                                    <td class="label"><html:text property="username" size="30" />
                                        <br/>@aceengineer.com
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Password</td>
                                    <td class="label"><html:password property="password" size="30"/></td>
                                </tr>
                                <tr>
                                    <td colspan="2" align="right">
                                        <html:submit value="Login" styleClass="button"/>
                                    </td>
                                </tr>
                            </table>
                        </fieldset>
                    </html:form>
                </td>
            </tr>

            <tr>
                <td colspan="3" style="vertical-align:top">
                    <h4 class="sideHeading top_border head">What is Project Management System?</h4>

                    <p class="justifiedPara border10" style="width:790px;display:inline-block;">

                        Project management software is a term covering many types of software, 
                        including estimation and planning, scheduling, cost control and budget 
                        management, allocation, collaboration, communication, quality management 
                        and documentation or administration systems, which are used to deal with 
                        the complexity of large projects.
                        <br/><br/>
                        One of the most common purposes is to schedule a series of events or tasks and the complexity of the schedule can vary considerably depending on how the tool is used.
                    </p>    

                    <img src="res/images/pms.png"  style="display: inline-block"/>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <h4 class="sideHeading top_border head">Application Features</h4>                                
                    <ul class="myList" style="display: inline-block;width:750px">                                        
                        <li>Can be accessed from any type of computer without installing software on user's computer.</li>
                        <li>Ease of access-control.</li>
                        <li>Naturally multi-user.</li>
                        <li>Only one software version and installation to maintain.</li>
                        <li>Centralized data repository.</li>
                        <li>Some solutions allow the user to go offline with a copy of the data.</li>
                        <li>Dynamic Reports & interactive Charts</li>
                    </ul>
                    <img src="res/images/salient-features.jpg" />
                </td>
            </tr>

            <tr>
                <td colspan="3">
                    <hr/>
                    <div style="text-align: center;padding: 10px;">
                        &COPY; By AceEngineer,<br/>
                        Powered by Prarohana Enterprises Pvt LTD.
                    </div>
                </td>
            </tr>
        </table>



        <div class="layer"></div>

        <div class="contactInfoDiv top_border">
            <h4 class="foldHeader">Contact Us</h4>
            <div class="foldableContent bottom_border">
                <table width="100%">
                    <tr>
                        <td>
                            For further information regarding the company, its services, or to provide feed back regarding the website content,
                            Please contact us at the following address:
                        </td>
                        <td rowspan="2">
                            <img src="res/images/contactUs.jpg" alt="Contact Us"/>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h3>Ace Engineer</h3>

                            401 Namitha's Fort, Panchavati Colony,<br/>
                            Manikonda, Hyderabad - 500089<br/>
                            Tel( India ): +91 9966550988<br/>


                            E-mail:surya.kompella@acematrix.com
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="color: blue;text-align: center">
                            Click outside to close Window.
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
</html>