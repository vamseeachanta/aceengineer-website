<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Data Manipulation</title>
        <link rel="shortcut icon" href="res/images/logoIcon.ico"/>
        <link type="text/css" rel="StyleSheet" href="res/css/DataManipulation.css" media="screen"/>
        <link type="text/css" rel="StyleSheet" href="res/css/ace.css" media="screen"/>
        <script type="text/javascript" src="res/js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/DataManipulation.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript" src="res/js/dynamicTable.js"></script>
        <script type="text/javascript" src="res/js/dragtable.js"></script>
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/GoogleCharting.js"></script>
        <script type="text/javascript">
            google.load('visualization', '1.0', {'packages':['corechart']});            
            google.setOnLoadCallback(function(){
                //alert("chart loaded");
                //Load.loadImg($('#imgLoad')[0], {});
            });
            $(function(){
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
            })
        </script>

    </head>

    <body onload="designManualTable(0);" >

        <input type="hidden" id="getChart"  value="chart"/>
        <form id="FirstForm" action="dataManipulation.do?" method="POST" enctype="multipart/form-data" target="iframe2">
            <div align="center">

                <table class="content" width="990" align="center">
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" class="header">
                                <tr>
                                    <td width="360" valign="top" ><div align="left"><a href="Home.html"><img src="res/images/logo.png" alt="Aceengineer Logo"></a></div> </td>
                                    <td><img align="right" class="roudedImg" alt="DataManipulation logo" src="res/images/dataManip.jpg"/></td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td valign="bottom" class="menu" colspan="2">
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
                    <tr>
                        <td>
                            <iframe class="MyIframe" style="border: 1px solid green;" name="iframe2" id="iframe2">

                            </iframe>
                            <div id="AppMenu" align="left" >
                                <ul class="menu">
                                    <div class="AppMenuClass"><li id="AppIntroduction" class="active">&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;  Introduction &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;</li></div>
                                    <!--                                    <div class="AppMenuClass"> <li id="Distributions">   Distributions </li></div>-->
                                    <div class="AppMenuClass"><li id="InputMode"> Application Tabs   </li></div>
                                    <!--                                    <div class="AppMenuClass"><li id="OutputResults">  Interpolations  </li></div>-->
                                </ul>
                                <table class="innerTable">
                                    <tr>
                                        <td valign="top">
                                            <table>
                                                <tr>
                                                    <td class="body">
                                                        <fieldset id="introduction" style="width: 950px;  "> <legend id="introduction" class="headingMedium">What is  Data Manipulation ? &nbsp;<span id="changeImage" class="introducation"><img alt="minus" src="res/images/minus.png"></span></legend>
                                                            <div class="introduceContent" id="introDiv">
                                                                <blockquote>
                                                                    <p> - The statistical data application helps determine the key statistical parameters based on sample/laboratory data obtained and interpret information from data.</p>

                                                                    <p> - Applications are user friendly and output can be saved as PDF for peer presentations and future reference.</p>
                                                                </blockquote>
                                                            </div>
                                                        </fieldset>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td class="body">
                                                        <fieldset id="dataInputDiv" style=" border:none; display: none">

                                                            <div id="calDiv">
                                                                <div id="modules" style="height: 300px;">
                                                                    <legend class="headingMedium">Manipulation Techniques</legend>
                                                                    <h4 class="headingSmall">Please select one of the methods :</h4>
                                                                    <!--                                                                    <input type="radio" name="modules" id="modeDr"  value="Data Re-Arrangement"/>Data Re-Arrangement
                                                                                                                                         <input type="radio" name="modules" id="modeInterpolation" value="Interpolations"/>Interpolations-->
                                                                    <table align="center">
                                                                        <tr>
                                                                            <td>
                                                                                <span  id="modeDr">Data Re-Arrangement</span> 
                                                                            </td>
                                                                            <td>
                                                                                <span id="modeInterpolation">Data Interpolation</span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>


                                                            </div>
                                                            <div id="selectedModule" style="display: none;">

                                                            </div>
                                                            <div align="right">
                                                                <span align="right" id="backBtn" style="display:none;">Back to Applications</span>    
                                                            </div>

                                                            <div id="container"  >
                                                                <div id="inputsDiv">
                                                                    <ul class="menu2">
                                                                        <div class="inputMode manual"><li id="Rawdata" style="text-align: justify;" class="active">Data Mode</li></div>
                                                                        <!--                                                                    <div class="inputMode manual"> <li id="Continuous">   Grouped Frequency Mode   </li></div>-->
                                                                        <div class="inputMode"><li id="Copy">  Copy & Paste Mode   </li></div>
                                                                        <div class="inputMode"><li id="Csv">  Upload File Mode  </li></div>
                                                                    </ul>
                                                                    <br/>
                                                                    <table class="tabBorder">
                                                                        <tr>
                                                                            <td>
                                                                                <table  width="100%"  border="0" id="myTable">
                                                                                    <tr>
                                                                                        <td>
                                                                                            <div id="InputDescription" style="vertical-align: top;">


                                                                                            </div>

                                                                                        </td>
                                                                                    </tr>


                                                                                    <tr>
                                                                                        <td>
                                                                                            <table width="100%">
                                                                                                <tr>
                                                                                                    <td>
                                                                                                        <div id="copyandCsv" style="display: none;">

                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td >
                                                                                                        <div id="inputDiv"  class="inputDiv">
                                                                                                        </div>
                                                                                                        <div id="btnsDiv">
                                                                                                            <input type='button'  value='Add Row' id="addRow" />
                                                                                                            <input type='button' value='Delete Row' id="delRow" onclick='delRow()'/>
                                                                                                            <input type='button' value='Delete All' id="delAllRow" onclick='delRow()'/>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <div id="copyDiv"  class="copyDivCSS" >

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
                                                                        <tr style="padding-top: -1.0em;">
                                                                            <td>
                                                                                <input type="button" name="Submit" value="Preview" id="sub" style="cursor: pointer;" class="Mybutton" />

                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                                <p id="prvwLabel" style="display: none; color: #0C6B9B; font-weight: bold;" >Input data is shown below </p>
                                                                <div id="previewDiv" style="width: 950px; overflow: scroll;"  >

                                                                </div>
                                                                <div align="center" id="prviewBtnsDiv" style="display: none;">
                                                                    <input type="button" value="Proceed" id="prcd" />
                                                                    <input type="button" value="Back" id="backPrcd" />
                                                                </div>
                                                            </div>
                                                            <div id="methods" style="display: none;">

                                                            </div>
                                                            <div id="interpolDiv" style="display:none;" >
                                                                <div id="inputValDiv">
                                                                    Please enter the interpolate value you want to find:
                                                                    <input type="text" id="inputVal" class="required number" style="width: 40px;"/><br>
                                                                </div>
                                                                <input type="radio" id="inputArray"/>
                                                                More than one interpolated points
                                                            </div>
                                                            <div id="inputArrayValDiv" style="display:none;">
                                                                <label class="arrayLabel" for="inputArrayVal">Please enter the interpolate with comma (,) delimiter:</label>
                                                                <textarea id="inputArrayVal" class="required " rows="1" cols="30"></textarea>
                                                            </div>
                                                            <div align="right" id="intInput" style="display: none;">
                                                                <input  type="button" id="calculate"  value="Apply"/>
                                                            </div>

                                                        </fieldset>
                                                    </td>

                                                </tr>
                                                <!--                                                <tr id="ThirdImage"  style="display: none;" >
                                                                                                    <td>
                                                                                                        <img src="res/images/SlideBarOuter.png" align="right"  onclick="changeMenu(3)">
                                                                                                        <img src="res/images/SlideBar.png" align="left"  onclick="changeMenu(1)">
                                                                                                    </td>
                                                                                                </tr>-->
                                            </table>

                                            <div id="resultDiv" style="overflow: auto; width: 990px;">
                                                <h1 id="outLabel" style="display: none;">The Output result is:</h1>
                                                <div id="resultTranposeDiv" align="center" >

                                                </div>
                                                <div id="dragOut" align="center">

                                                </div>
                                            </div>
                                            <div id="chartDiv"  align="center" style=" display: none;"></div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                </table>
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
                                        <a href="http://aceengineer.com/AceEngineer/aboutUs.html">Mission and Values</a><br>
                                        <a href="http://aceengineer.com/AceEngineer/aboutUs.html">History</a>
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
                                        <!--<a href="#">Heat Transfer</a><br>-->
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
                                        <a href="http://aceengineer.com/AceEngineer/careers.html">Current Openings</a>
                                    </li>
                                </ul>
                            </td>
                            <td valign="top">
                                <ul type="none">
                                    <li><a href="http://aceengineer.com/AceEngineer/contactUs.html"><strong>Contact Us</strong></a></li>
                                </ul>
                            </td>
                        </tr>
                        <tr>

                            <td colspan="6" align="right" valign="baseline" style="border-bottom: 1px solid white;">
                                <label  style="color:white; vertical-align: top; font-size:16px; ">Follow us on :</label>
                                <a target="blank" href="http://www.facebook.com/AceEngineer?ref=hl"><img src="http://aceengineer.com/AceEngineer/res/images/Facebook-Buttons-1-10-.png"/></a>
                                <a target="blank" href="https://twitter.com/AceEngineer1"><img src="http://aceengineer.com/AceEngineer/res/images/twitter.png"/></a>
                                <a target="blank" href="https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"><img src="http://aceengineer.com/AceEngineer/res/images/Googleplus.png"/></a>
                                <a target="blank" href="http://www.linkedin.com/company/aceengineer"><img src="http://aceengineer.com/AceEngineer/res/images/linkin_icon.png"/></a>
                            </td>
                        </tr>

                        <tr align="center">
                            <td colspan="6">
                                <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas &nbsp;&Vert;&nbsp;</a>
                                <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis &nbsp;&Vert;&nbsp;</a>
                                <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management&nbsp;&Vert;&nbsp;</a>
                                <!--<a href="#">Heat Transfer&nbsp;&Vert;&nbsp;</a>-->
                                <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis&nbsp;&Vert;&nbsp;</a>
                                <a href="http://aceengineer.com/DataManipulation/">Data Manipulation&nbsp;&Vert;&nbsp;</a>
                                <a href="#">Fluid Mechanics</a><br>
                                <a href="http://aceengineer.com/AceEngineer/Terms-conditions.html">Terms & Conditions&nbsp;&Vert;&nbsp;</a>
                                <a href="http://aceengineer.com/AceEngineer/Terms-conditions.html">Privacy policy</a>
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
            <!--            <input type="text" id="mydiv" name="mydiv" style="visibility: hidden"/>
                    </form>
                    <form action="FirstData.jsp" method="POST" target="iframe1"> 
                        <input type="submit" style="display: none"/>
                    </form>
                    <form action="SecondData.jsp" method="POST" target="iframe3">
                        <input type="submit" style="display: none"/> 
                    </form>
                    <form action="first.do" method="POST" target="firstIframe"></form>
                    <form action="first.do" method="POST" target="thirdIframe"></form>
                            <form action="second.do" method="POST" target="iframe2"></form>
                    <form action="second.do" method="POST" target="secondIframe"></form>-->
    </body>
    <script type="text/javascript">
        $(function(){
            DOMElement.setAsSideBar($("#slideDiv"),"");
        });
    </script>
</html>
