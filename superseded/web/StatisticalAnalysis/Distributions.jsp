<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Statistical Analysis</title>
        <link rel="shortcut icon" href="res/images/logoIcon.ico"/>
        <link href="res/css/ace.css" rel="stylesheet" type="text/css"/>
        <link href="res/css/core.css" rel="stylesheet" type="text/css"/>
        <link type="text/css" rel="StyleSheet" href="res/css/fittingPage.css"/>
        <link rel="stylesheet" href="res/css/themes/default/default.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="res/css/themes/light/light.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="res/css/themes/dark/dark.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="res/css/themes/bar/bar.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="res/css/nivo-slider.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="res/css/style1.css" type="text/css" media="screen" />
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/NormalDistribution.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/core.js"></script>
        <script type="text/javascript">
            $(function(){
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
                /*slider*/
                $(window).load(function() {
                    $('#slider').nivoSlider();
                });
                /*End of slider call*/
                var div = $('.feedback')[0];
               
                $(window).scroll(function(){
                    var v = ($(window).height()-$(div).height())/2;
                    v += $(window).scrollTop();
                    $(div).css({
                        //                left:'-'+($(div).width()-20)+'px',
                        top:v-100
                    });
                });
            });
            function paramValue()
            {
                return(<%=request.getParameter("mode")%>);
            }
           
            
            
        </script>

    </head>
    <body onload="designManualTable(0);" >
        <form id="FirstForm" action="dataFittingAction.do?" method="POST" enctype="multipart/form-data" target="iframe2">
            <div align="center">
                <div class="feedback">
                    <a id="feedback_button" class="a"><img src="res/images/feedback.png"/></a>
                    <div class="form">
                        <h2>Feedback Please</h2>
                        <p><label>Name: </label><input type="text" /></p>
                        <p><label>Email: </label><input type="text" /></p>
                        <p><label>Subject: </label><input type="text" /></p>
                        <p><label>Message: </label><textarea></textarea></p>
                        <p><input type="button" value="Send" class="btn"/></p>
                    </div>
                </div>
                <table width="990" class="content" border="0">
                    <tr>
                        <td>
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr valign="top">
                                    <td width="200">
                                        <a href="http://aceengineer.com/AceEngineer/Home.html"><img src="res/images/logo.png" ></a>
                                    </td>
                                    <td width="790">
                                        <img src="res/images/Phase_II/stat.jpg" alt="" class="AppLogo" height="80px" align="right"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="bottom" class="menu1" colspan="2">
                                    <ul class="dropMenu">
                                        <li ><a class="active" href="http://aceengineer.com/AceEngineer/Home.html">Home</a></li>
                                        <li ><a href="http://aceengineer.com/AceEngineer/Services.html">Services</a></li>
                                        <li class="hasSubMenu"><a href="http://aceengineer.com/AceEngineer/applications.html">Applications</a>
                                            <ul class="subMenu ">
                                                <li><a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a></li>
                                                <li><a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a></li>
                                                <li><a href="http://aceengineer.com/StockAnalysis/">Stock Management</a></li>
                                                <li><a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a></li>
                                                <li><a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a></li>
                                                <li class="bottom_border"><a href="#">Fluid Mechanics</a></li>

                                            </ul>
                                        </li>
                                        <li class="hasSubMenu" ><a href="http://aceengineer.com/AceEngineer/aboutUs.html" >About Us</a>
                                        <li><a href="http://aceengineer.com/AceEngineer/Careers.html">Careers</a></li>
                                        <li><a href="http://aceengineer.com/AceEngineer/contactus.html">Contact Us</a></li>
                                    </ul>
                                </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="left">
                            <div id="AppMenu">
                                <ul class="menu">
                                    <div class="AppMenuClass"><li id="AppIntroduction">Introduction</li></div>
                                    <div class="AppMenuClass"> <li id="Distributions" class="active">   Distributions   </li></div>
                                    <div class="AppMenuClass"><li id="InputMode">  Input Mode   </li></div>
                                    <div class="AppMenuClass"><li id="OutputResults">  Output Results  </li></div>
                                </ul>
                                <table class="innerTable">
                                    <tr>
                                        <td>
                                            <table>
                                                <tr>
                                                    <td class="body">
                                                        <fieldset id="introduction" style="width: 930px" class="distSelectCSS"> <legend id="introduction">What is Statistical Data Analysis?</legend>
                                                            <div class="introduceContent" id="introDiv">
                                                                The statistical data application helps determine the key statistical parameters based on sample/laboratory data obtained and interpret information from data.
                                                                <span id="moreonstat" class="extendSpan" onclick="flodSpan();">&dArr; More on statistics...</span><br>
                                                                <span id="hideInfo" style="display: none;">
                                                                    <p align="justify" >
                                                                        Statistics is the study of the collection, organization, analysis, and interpretation of data.<br><br>
                                                                        <img src="res/images/arrow.png" alt=""/>   Obtain information from copious amount of data.<br>
                                                                        <img src="res/images/arrow.png" alt=""/>	provide tools for prediction and forecasting by using data and statistical models.<br>
                                                                        <img src="res/images/arrow.png" alt=""/>	help plan of data collection in terms of the design of surveys and experiments.<br><br>
                                                                        Even though you may not have realized it, you probably have made some statistical statements in
                                                                        your everyday conversation or thinking. Statements like "I sleep for about eight hours per night on
                                                                        average" and "You are more likely to pass the exam if you start preparing earlier" are actually
                                                                        statistical in nature.<br><br>
                                                                        Statistics is a discipline which is concerned with: <br><br>

                                                                        <img src="res/images/arrow.png" alt=""/> Designing experiments and other data collection,<br>
                                                                        <img src="res/images/arrow.png" alt=""/> Summarizing information to aid understanding,<br>
                                                                        <img src="res/images/arrow.png" alt=""/> Drawing conclusions from data, and<br>
                                                                        <img src="res/images/arrow.png" alt=""/> Estimating the present or predicting the future.<br>
                                                                    </p>
                                                                    <p align="justify" >
                                                                        Today, statistics has become an important tool in the work of many academic disciplines such as
                                                                        medicine, psychology, education, sociology, engineering and physics, just to name a few. Statistics is
                                                                        also important in many aspects of society such as business, industry and government.
                                                                    </p>
                                                                </span>
                                                                <span id="close" class="extendSpan" style="display: none;" onclick="openSpan();">
                                                                    ^Close.
                                                                </span>
                                                                <p align="justify">
                                                                    Application Features:<br><br>
                                                                    <img src="res/images/arrow.png" alt=""/>	Analyze data using various types of distributions<br>
                                                                    <img src="res/images/arrow.png" alt=""/>	Help choose the best distribution that fits given data<br>
                                                                    <img src="res/images/arrow.png" alt=""/>	Customized report (PDF) for peer presentation and future reference<br>
                                                                </p>
                                                            </div>
                                                        </fieldset>
                                                    </td>
                                                </tr>
                                                <tr id="FirstImage" style="display: none;">
                                                    <td>
                                                        <img src="res/images/Forward.png" align="right" title="Move to Next Tab" onclick="changeMenu(1)">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="body" >
                                                        <fieldset id="distSelectDiv" >
                                                            <legend>Select Distribution
                                                                <select name="distribution" id="selectDistribution">
                                                                    <option value="0" selected="true">--Choose Distribution--</option>
                                                                    <option value="1">Normal Distribution</option>
                                                                    <option value="2">Cauchy Distribution</option>
                                                                    <option value="3">Gamma Distribution</option>
                                                                    <option value="4">Rayleigh Distribution</option>
                                                                    <option value="5">Weibull Distribution</option>
                                                                </select></legend>
                                                            <div class="Distributions">
                                                                <div id="propertiesDiv" class="propertiesCSS">
                                                                    <table style="height: 350px">
                                                                        <tr>
                                                                            <td valign="top">
                                                                                Select Any One Distribution from the Drop Down List...
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </fieldset>
                                                    </td>
                                                </tr>
                                                <tr id="SecondImage">
                                                    <td>
                                                        <img src="res/images/Forward.png" align="right" title="Move to Next Tab" onclick="changeMenu(2)">
                                                        <img src="res/images/Reverse.png" align="left" title="Back to previous Tab" onclick="changeMenu(0)">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="body">
                                                        <fieldset id="dataInputDiv" style="display: none">
                                                            <legend><b>Input Modes</b></legend>
                                                            <div id="container">
                                                                <div><input type="radio" id="Rawdata" class="active inputMode manual" name="radio_button" checked="true">Frequency Mode</input>
                                                                    <input type="radio" id="Continuous" class="inputMode manual" name="radio_button">Grouped Frequency Mode</input>
                                                                    <input type="radio" id="Copy" class="inputMode" name="radio_button">Copy & paste Mode</input>
                                                                    <input type="radio" id="Csv"  class="inputMode" name="radio_button">Upload File Mode</input></div>
                                                                <br/>
                                                                <table class="">
                                                                    <tr>
                                                                        <td>
                                                                            <table  width="100%"  border="0" id="myTable">
                                                                                <tr>
                                                                                    <td>
                                                                                        <div id="InputDescription" style="vertical-align: top;">
                                                                                            <p>
                                                                                                &bull;	The Frequency data mode let you enter the data with their corresponding Frequency.<br>
                                                                                                &bull;	Here the word frequency represents the number of occurrences of particular data.
                                                                                            </p><span id="readmore" class="extendSpan" onclick="flodImage();">Example...</span>

                                                                                        </div>
                                                                                        <div id="imageDescription" style="display: none;">
                                                                                            <table align='center'>
                                                                                                <tr>
                                                                                                    <td>
                                                                                                        Ex:
                                                                                                        <br>
                                                                                                        <table border='1' >
                                                                                                            <tr align="center"><th>Salary(Data Value)</th><th>No Of Employees(Frequency)</th></tr>
                                                                                                            <tr><td>8000</td><td>44</td></tr>
                                                                                                            <tr><td>10000</td><td>56</td></tr>
                                                                                                            <tr><td>12000</td><td>32</td></tr>
                                                                                                            <tr><td>18000</td><td>26</td></tr>
                                                                                                            <tr><td>24000</td><td>12</td></tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        &bull;	The Above table describes the Frequency Data Input Mode.<br>
                                                                                                        &bull;	The First Column 'Salary' is the Data Value, <br>
                                                                                                        &bull;	Second Column 'No of Employees' is frequency.<br>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <table>
                                                                                                <tr>
                                                                                                    <td>
                                                                                                        <span id="closeImage" class="extendSpan" style="display: none" onclick="openImage()">^close</span>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table>
                                                                                            <tr>
                                                                                                <td>
                                                                                                    <div id="copyandCsv" style="display: none;">
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div id="inputDiv" class="inputDiv">
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div id="copyDiv"  class="copyDivCSS" style="">
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div id="inDiv" style="display: none;">
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </div>
                                                        </fieldset>
                                                    </td>
                                                </tr>
                                                <tr style="padding-top: -1.0em;">
                                                    <td>
                                                        <input type="button" name="Submit" value="Submit" id="sub" style="display: none;cursor: pointer;" class="Mybutton" onclick="getSubmit();"/>
                                                    </td>
                                                </tr>
                                                <tr id="ThirdImage"  style="display: none;" >
                                                    <td>
                                                        <img src="res/images/Forward.png" align="right" title="Move to Next Tab" onclick="changeMenu(3)">
                                                        <img src="res/images/Reverse.png" align="left" title="Back to previous Tab" onclick="changeMenu(1)">
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td id="OutputResultsTab" style="display: none;height: 350px;" valign="top">
                                            <table>
                                                <tr>
                                                    <td>
                                                        <div style="width: 900px;">

                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table id="MYTAB" style="" class="tabNavigator" align="center">
                                                <tr>
                                                    <td align="left" style="color: red;">
                                                        &dArr; Click on below tabs to See Output Results..
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td id="row1" colspan="2"  onclick="getData1();" class="navHead" style="" align="center">
                                                        Raw Data Mode <img src="res/icons/ques.png" alt="info" title="it's shows each data value and it's frequency. ex:<table border='1'><tr><td>DataValue</td><td>Frequency</td></tr><tr><td>5</td><td>1</td></tr><tr><td>8</td><td>1</td></tr><tr><td>10</td><td>1</td></tr></table>">
                                                    </td>
                                                </tr>
                                                <tr class="tabContent">
                                                    <td id="rrow1" align="center">
                                                        <iframe onload="resizeFrameToFitContent(this);" class="MyIframe" name="iframe1" id="iframe1" width="100%" height="0">
                                                        </iframe><br/>
                                                        <input type="button" class="Mybutton" value="Proceed" id="myProceed1" style="display: none" onclick="getJsp1(1)"/>
                                                        <input type="button" class="Mybutton" id="myButton1" value="Back" style="display: none" onclick="goBack()"/><br/>
                                                        <iframe class="noFrame" name="firstIframe" id="firstIframe">
                                                        </iframe>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td id="row3" colspan="2" class="navHead" onclick="getData3();" align="center" >Frequency Data Mode <img src="res/icons/ques.png"  alt="info" title="it's shows each data value and it's frequency ex:<table border='1'><tr><td>DataValue</td><td>Frequency</td></tr><tr><td>5</td><td>2</td></tr><tr><td>8</td><td>4</td></tr><tr><td>10</td><td>3</td></tr></table>">
                                                    </td>
                                                </tr>
                                                <tr class="tabContent">
                                                    <td id="rrow3" align="center">
                                                        <iframe onload="resizeFrameToFitContent(this);"  class="MyIframe" name="iframe3" id="iframe3" width="100%" height="0">
                                                        </iframe><br/>
                                                        <input type="button" class="Mybutton" value="Proceed" id="myProceed3" style="display: none"  onclick="getJsp3(3)"/>
                                                        <input type="button" class="Mybutton" id="myButton3" value="Back"  style="display: none" onclick="goBack()"/><br/>
                                                        <iframe class="noFrame" name="thirdIframe" id="thirdIframe"></iframe>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="navHead" colspan="2" id="row2" onclick="getData2();" align="center">Grouped Data Mode<img alt="info"  src="res/icons/ques.png" title=" it's shows data in form of class intervals ex:<table border='1'><tr><td>LowerInterval</td><td>UpperInterval</td><td>Frequency</td></tr><tr><td>1</td><td>10</td><td>5</td></tr><tr><td>11</td><td>20</td><td>8</td></tr><tr><td>20</td><td>30</td><td>9</td></tr></table> ">
                                                    </td>
                                                </tr>
                                                <tr class="tabContent">
                                                    <td id="rrow2" align="center">
                                                        <iframe onload="resizeFrameToFitContent(this);" class="MyIframe" name="iframe2" id="iframe2">
                                                        </iframe><br/>
                                                        <input type="button" class="Mybutton" id="myInterval" value="Change Interval" name="ChangeInterval" style="display: none"  onclick="getInterval()"/>
                                                        <input type="button" class="Mybutton" name="myProceed2" value="Proceed" id="myProceed2" style="display: none" onclick="getJsp2()"/>
                                                        <input type="button" class="Mybutton" id="myButton2" value="Back" style="display: none"  onclick="goBack()"/><br/>
                                                        <iframe class="noFrame" name="secondIframe" id="secondIframe"></iframe>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr id="FourthImage" style="display: none;">
                                        <td>
                                            <img src="res/images/Reverse.png" align="left" title="Back to Previous Tab" onclick="changeMenu(2)">
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <input type="text" id="mydiv" name="mydiv" style="visibility: hidden;display: none;"/>
        </form>
        <form action="RawData.jsp" method="POST" target="iframe1">
            <input type="submit" style="display: none"/>
        </form>
        <form action="FrequencyData.jsp" method="POST" target="iframe3">
            <input type="submit" style="display: none"/> 
        </form>
        <form action="RawMode.do" method="POST" target="firstIframe"></form>
        <form action="FrequencyMode.do" method="POST" target="thirdIframe"></form>
        <form action="GroupedData.jsp" method="POST" target="iframe2"></form>
        <form action="GroupedMode.do" method="POST" target="secondIframe"></form>

        <!--            Starting of Site Map Content-->

        <div id="Footer" style="border: 1px solid #ffffff">
            <table id="siteMap" width="990" align="center">
                <tr>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="http://aceengineer.com/AceEngineer/Home.html"><strong>Home</strong></a></li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/aboutUs.html"><strong>About Us</strong></a><br> 
                                <a href="http://aceengineer.com/AceEngineer/Home.html">Mission and Values</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Home.html">History</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li> 
                                <a href="http://aceengineer.com/AceEngineer/Services.html"><strong>Services</strong></a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Financial Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Mechanical Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Civil and Structural Engineering</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Project Management Tools</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Web Designing and Web Hosting</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Mobile Apps development</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Services.html">Business improvement plans</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/applications.html"><strong>Applications</strong></a><br>
                                <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a><br>
                                <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a><br>
                                <a href="http://aceengineer.com/StockAnalysis/">Stock Management</a><br>
                                <a href="#">Heat Transfer</a><br>
                                <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a><br>
                                <a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a><br>
                                <a href="#">Fluid Mechanics</a><br>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li>
                                <a href="http://aceengineer.com/AceEngineer/Careers.html"><strong>Careers</strong></a><br>
                                <a href="http://aceengineer.com/AceEngineer/Careers.html">Current Openings</a>
                            </li>
                        </ul>
                    </td>
                    <td valign="top">
                        <ul type="none">
                            <li><a href="http://aceengineer.com/AceEngineer/contactus.html"><strong>Contact Us</strong></a></li>
                        </ul>
                    </td>
                </tr>
                <tr>

                    <td colspan="6" align="right" valign="baseline" style="border-bottom: 1px solid white;">
                        <label  style="color:white; vertical-align: top; font-size:16px; ">Follow us on :</label>
                        <a target="blank" href="http://www.facebook.com/AceEngineer?ref=hl"><img src="res/images/Facebook-Buttons-1-10-.png"/></a>
                        <a target="blank" href="https://twitter.com/AceEngineer1"><img src="res/images/twitter.png"/></a>
                        <a target="blank" href="https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"><img src="res/images/Googleplus.png"/></a>
                        <a target="blank" href="http://www.linkedin.com/company/aceengineer"><img src="res/images/linkin_icon.png"/></a>
                    </td>
                </tr>

                <tr align="center">
                    <td colspan="6">
                        <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas &nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis &nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Heat Transfer&nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis&nbsp;&Vert;&nbsp;</a>
                        <a href="http://aceengineer.com/DataManipulation/">Data Manipulation&nbsp;&Vert;&nbsp;</a>
                        <a href="#">Fluid Mechanics</a><br>
                        <a href="Terms-conditions.html">Terms & Conditions&nbsp;&Vert;&nbsp;</a>
                        <a href="Terms-conditions.html">Privacy policy</a>
                    </td>
                </tr>
                <tr align="center">
                    <td colspan="6" style="color:#ffffff;">
                        AceEngineer &copy; 2011, powered by PEPL
                    </td>
                </tr>
            </table>
        </div>
        <!--        Ending of the Site Map Content-->

    </body>
    <script type="text/javascript">
        $(function(){
            DOMElement.setAsSideBar($("#slideDiv"),"");
        });
    </script>
</html>
