<%-- 
    Document   : indicators
    Created on : May 11, 2012, 12:10:27 PM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<!DOCTYPE html>
<html>
    <head> 
        <!--        Page Titles-->
        <title>AceEngineer Stock Analysis Application</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta NAME="description" CONTENT="AceEngineer is currently developing individual investor stock analysis tools as online applications for general use. This will help individual investors to be disciplined with a pre-planned set of rules to help manage their long-term capital."/>
        <meta NAME="keywords" CONTENT="stock analysis, stock market analysis, stock analysis software, stock technical analysis, free stock analysis, fundamental stock analysis, stock market comparison" />
        <meta NAME="keywords" CONTENT="stock Marketing, Stock Comparison" />
        <!--        Includes ALL CSS-->
        <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css" />
        <link rel="stylesheet" type="text/css" href="res/css/DOMElements.css" />
        <link rel="stylesheet" type="text/css" href="res/css/ElementManipulator.css" />
        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css" />
        <link rel="shortcut icon" href="res/icons/stock_icon.gif"/>
        <link rel="stylesheet" href="res/css/chosen.css" />
        <!-- For Date Picker -->
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>

        <style type="text/css">
            body{
                /*                background: url('res/images/bg.jpg') 0 0 fixed #3274B1;*/

                color: black;                
                /*                font-family: Georgia, serif;                */
            }
            .bodyLayout{
                width: 980px;                
                background-color: white;

                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;

                -webkit-box-shadow: 0px 0px 10px black;
            }

            .foldableDiv .titleheading
            {
                margin-bottom: 5px;
                display: block;
                text-align: center;
                font-size: 13px;
                color: #17181A;
                /*                font-weight: bold;                */
                text-shadow: 0px 0px 3px lightblue;
                cursor: pointer;
                vertical-align: middle;
                -webkit-border-radius: 10px;
                -webkit-box-shadow: 2px 2px 2px black;
                -moz-border-radius: 10px;                
                border-radius: 10px;
                padding: 6px;
                background: url('res/images/titleBg.jpg') repeat-x #17181A;
                background: url('res/images/button_1.jpg');
            }

            .foldableDiv .titleheading:hover{
                background: url('res/images/button_bg.jpg');
            }

            p.titleHover
            {
                color: white;
                background: url('res/images/titleBg2.jpg') repeat-x;
            }

            .label
            {
                text-align: right;                
                white-space: nowrap;                
            }

            .controlsTable
            {
                table-layout: inherit;
            }


            .toolTipCSS
            {
                background : #a8d2f5;
                -webkit-border-radius: 10px;
                -webkit-box-shadow: 5px 5px 10px black;

                overflow: hidden;
            }

            .toolTipCSS .content
            {                
                padding: 10px 20px;
                text-align: center;
                background: #3f5b8d;
                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                color: white;                
            }

            .modalDivCss
            {
                padding: 10px;
                background: #082038;                
                opacity:1.0;
                filter:alpha(opacity=100);
                -moz-opacity:1.0;
                color: white;
                font-family: 'Comic Sans MS', cursive;
                z-index: 1200;
                border: 2px solid gray;
                border-radius: 5px 25px 5px 25px;
                -webkit-box-shadow: 15px -15px 15px #082038;
                -moz-box-shadow: 15px -15px 15px #082038;
                -webkit-border-radius: 5px 25px 5px 25px;
            }

            .modalDivCss button{
                padding: 5px 10px;
            }

            .alertCSS
            {
                background : #a8d2f5;
                -webkit-border-radius: 10px;
                -webkit-box-shadow: 5px 5px 10px black;

                overflow: hidden;
            }
            .alertCSS .title{                
                background: #1470bc;
                color: white;
                text-align: center;
                -webkit-border-radius: 5px;
            }
            .alertCSS.content
            {
                padding: 10px;
            }

            #liveData
            {
                /*                display: none;*/
                -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.1);  
                -moz-box-shadow: 0 0 4px rgba(0, 0, 0, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.1);  
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.1);
            }            

            #liveData .container{
                max-height: 350px;
                overflow: auto;
            }

            .chartDataTab{                
                max-height: 300px;
                overflow: auto;
            }

            .summaryTable td, .summaryTable th{
                border: 1px ridge #cacaca;
            }

            .tickerBlock{
                background: #c8e6f1;
            }

            /** Calendar Properties Ends **/
        </style>


        <!--        Includes All JS-->
        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/CrossDomainXML.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/date.js"></script>        
        <script type="text/javascript" src="res/js/StockComputationNew.js"></script>
        <script type="text/javascript" src="res/js/StockCore.js"></script>
        <script type="text/javascript" src="res/js/GoogleCharting.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/DataRetriver.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/jqFancyTransitions.1.8.min.js"></script>
        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>
        <script type="text/javascript" src="res/js/ReturnAssessment.js"></script>
        <script type="text/javascript" src="res/js/FundamentalIndicatorNew.js"></script>
        <script type="text/javascript" src="res/js/FundAnalyzer.js"></script>
        <script type="text/javascript" src="res/js/chosen.jquery.js"></script>
        <script type='text/javascript'>
            //alert("Hello Hi.");
            var autoComplete;
            var toolTip;
            var alertWindow;
            // This holds the User Portfolio Data base Tickers 
            var tickersObj;
//            google.load("visualization", "1", {packages:["corechart"]});
//            google.setOnLoadCallback(function()
//            {
//                ReturnAssessmentHandler.initilize();
//                ReturnAssessmentHandler.storeInDB = true;
//            });
//            
//            google.load('visualization', '1', {'packages':['annotatedtimeline']});
//            google.setOnLoadCallback(function(){                
//                FundamentalIndicatorHandler.initilize();
//                FundamentalIndicatorHandler.storeInDB = true;
//            });            
            
            /**
             * This Method Initilizes the Foldable Divisions
             */
            function initilizeFoldableDivs()            
            {                
                var foldableDivs = (".foldableDiv");
                $(foldableDivs).find(".titleheading").each(function(ind)
                {
                    $(this).attr({title:'Click to Toggel Folding'});
                    $(this).hover(function(){
                        $(this).addClass('titleHover');
                    },function(){});
                    $(this).click(function()
                    {               
                        $(this).toggleClass('titleHover');
                        $(this).siblings('.foldableContent').slideToggle(1000,null);
                    });
                });
                
                $(foldableDivs).find('.titleheading').each(function(){
                    
                });
            }
            
            /**
             * This Method Initializes the Login Window
             */
            function initializeLogin()
            {
                
                var modal = new ModalDialog({modalDivCSS:'modalDivCss'});
                
                //alertWindow = new Alert({CSS:'alertCSS',mode:"ALERT",approveText:"Yes",cancelText:"No"});
                
                //alertWindow.show("Welcome To Ace Engineer");
                
                var content;
                content = "<h2 style='text-align:center;margin:0px'>Do you have an Account?</h2>";
                content += "<hr />";
                content += "<table>";
                content += "<tr>";
                content += "<td>Enter Login Id</td>";
                content += "<td><input type='text' name='loginId' /></td>";
                content += "</tr>";
                content += "<tr>";
                content += "<td>Enter Password</td>";
                content += "<td><input type='password' name='password' /></td>";
                content += "</tr>";                
                
                modal.setContent(content);
                modal.show();
                modal.onSubmit = function()
                {
                    var data = modal.getInputs();
                    var labels = data[0];
                    var fields = data[1];
                    var loginId = fields[0];
                    var password = fields[1];
                    if(loginId == "ace" && password=="ace")
                    {
                        modal.hide();                                                
                    }
                    else if(loginId=="naga" && password=="sai")
                    {
                        ReturnAssessmentHandler.generateResilianeFactor = true;
                        modal.hide();
                    }
                    else
                    {
                        alert("Entered Login Credintials are not Valid");
                    }                    
                }
                modal.onHide = function()
                {
                    $('.content').css('visibility','visible');
                }                
            }
            
            /**
             * This Method Initializes the SymbolLookups
             */
            function initilizeSymbolLookupFields()
            {
                autoComplete = new AutoComplete($('.symbolLookup'),{});
            }
            
            
            /**
             * This Method used to Register t6he Tabbed pane
             */
            function registerTabbedPane(tabDiv)
            {
                // Initializing Tabs
                var tabs = $(tabDiv).find('.tabs').find('span');                    
                var blocks = $(tabDiv).find('.tabContent');                    
                // Hiding All The Tabs by Default
                $(blocks).hide();
                $(blocks).eq(0).show();
                $(tabs).eq(0).addClass('active');
                    
                $(tabs).each(function(ind){
                    $(this).click(function()
                    {
                        $(tabs).removeClass('active');
                        $(this).addClass('active');
                        $(blocks).hide(200);
                        $(blocks).eq(ind).show(200);
                            
                        if(ind==1)
                        {
                            // if there are no ticker by default then load the Default Chart in Moving Average
                            if(FundamentalIndicatorHandler.selectedTickers.length<1)
                                FundamentalIndicatorHandler.loadChart();
                        }
                    });
                });
            }
            
            function loadTabs()
            {
                $(".menu li").hover(function(){
                    $(this).addClass("titleHover");
                },function(){
                    $(this).removeClass("titleHover");
                });
                
                $(".menu  li").click(function(e){
                    switch(e.target.id){
                        case "FundInd":
                            $("#FundInd").addClass("active");
                            $("#RetAss").removeClass("active");
                            $("div.fund").fadeIn(800,'easeInSine',null);
                            $("div.Ret").css("display", "none");
                            break;

                        case "RetAss":
                            $("#FundInd").removeClass("active");
                            $("#RetAss").addClass("active");
                            $("div.Ret").fadeIn(800,'easeInSine',null);
                            $("div.fund").css("display","none");
                            break;
                    }
                });
            }
            
            
            /**
             * This Method Register the Live Data Display Divison
             */
            function registerLiveDataDiv()
            {
                
                var tbody= $('.data','#liveData').find('tbody');
                var text = $('[name="ticker"]','#liveData');
                    
                $(text).change(function()
                {
                    var ticker = $(this).val();
                    if(!isSymbolExist(ticker))
                    {
                        loadData(ticker);
                    }
                    else
                    {
                        $(text).val("");
                    }                    
                });
                
                $('.addButton','#liveData').click(function(){
                    // alert("click");                    
                    $(tbody).find('tr').each(function(ind)
                    {
                        var t = $(this).attr('key');
                        var row = this;
                        $(row).css({'background':'#eaafea'});
                        StockData.loadTickerSummary(t,function(json)
                        {
                            var info = json.query.results.quote;
                            $(row).html(makeRow(info));
                            $(row).css({'background':'white'});
                        });
                    });
                });
                
                function loadData(ticker){
                    StockData.loadTickerSummary(ticker, function(json){
                        var info = json.query.results.quote;
                        var tr = document.createElement('tr');
                        $(tr).attr({'key':ticker})
                        $(tr).html(makeRow(info));
                        $(tbody).append(tr);
                        $(text).val("");
                    });                    
                }
                
                function makeRow(info){                    
                    var cnt = "<td>"+info.symbol+"</td>"
                        +"<td>"+info.LastTradePriceOnly+"</td>"
                        +"<td>"+info.AskRealtime+"</td>"
                        +"<td>"+info.Change_PercentChange+"</td>";
                    return cnt;
                }
                
                /**
                 * This Method Checks whether the Given Ticker Exist in the Table or NOt
                 */
                function isSymbolExist(ticker){
                    $(tbody).find('tr').each(function()
                    {
                        var t = $(this).find('td')[0].html();
                        // alert(t);
                        if(t.toLowerCase() == ticker.toLowerCase()){
                            return true;
                        }
                    });
                    return false;
                }
            }
            
            /**
             * This method loads the Tickers from the Data base
             */
            function loadDBTickers(){
                var data = $('#userPortfolio_DB_Data').html();
                // First assigning null Object
                tickersObj = null;
                if(data.length>1){
                    tickersObj = eval("("+data+")");                    
                }
                
                if(tickersObj == null)
                    return;
                
                var tickers = [];
                for(var i=0;i<tickersObj.tickers.length;i++){
                    tickers.push(tickersObj.tickers[i].name);
                }
                try{
                    FundamentalIndicatorHandler.addNewTickerToCompare("XLE",true,function(){});
                }catch(e){alert("UserPorfolio JSP"+e);}
            }
            
            /**
             * When DOM Loaded
             */
            $(function()
            {   
                // This Fucnction for Showing the Resiliance Factor
                $('#resilianceFactorEle').click(function(){
                    $('#contentDiv').slideToggle(1000, null);
                });
                
                // Setting As Side Bar
                DOMElement.setAsSideBar($('.sideBar')[0], {easing:'linear',speed:400});                
                registerLiveDataDiv();
                Input.setTextMask($('.maskText'), {});
                //First Initializing the Login Window
                try{
                    //initializeLogin();
                }catch(e){alert(e);}                
                
                
                loadDBTickers();
                
                //$('.content').css('visibility','hidden');
                 
                registerTabbedPane(document.getElementById('techIndicatorTab'));
                initilizeFoldableDivs();
                initilizeSymbolLookupFields();
                loadTabs();
                //initilizeTootip();
                
                var racompareTicksDiv = document.getElementById('raTickerCompareDiv');
                var ficompareTicksDiv = document.getElementById('fiTickerCompareDiv');
                
                $('#sectorList').
                    html(StockCore.prepareList('option', StockCore.suggestedSectors)).
                    change(function(){
                    
                    var selInd = this.selectedIndex;
                    
                    
                    generateSectorContent(selInd);
                    
                    
                    // Removing all the Unchecked check boxes from the compare Ticker div
                    var chks = $(ficompareTicksDiv).find('input');
                    $(chks).each(function()
                    {
                        if(!this.checked && $(this).attr('key')==undefined)
                            $(this).parent('label').remove();
                    });
                    
                    chks = $(racompareTicksDiv).find('input');
                    $(chks).each(function()
                    {
                        if(!this.checked && $(this).attr('key')==undefined)
                            $(this).parent('label').remove();
                    });
                                        
                    var newTickers = FundamentalIndicatorHandler.removeDuplicateTickers(StockCore.suggestedSymbols[selInd]);
                    $(ficompareTicksDiv).append(StockCore.prepareCheckboxes('fiTickerChk', newTickers));
                    newTickers = ReturnAssessmentHandler.removeDuplicateTickers(StockCore.suggestedSymbols[selInd]);
                    $(racompareTicksDiv).append(StockCore.prepareCheckboxes('raTickerChk', newTickers));
                    
                    //adding Fundamental Indicator Checkbox Listeners
                    $(ficompareTicksDiv).find("input[name='fiTickerChk']").each(function(){
                        FundamentalIndicatorHandler.addCheckboxTickerListener(this); 
                    });
                    
                    // Addding ReturnAssessment Checkbox Listeners
                    $(racompareTicksDiv).find("input[name='raTickerChk']").each(function(){
                        ReturnAssessmentHandler.addCheckboxTickerListener(this); 
                    });
                });
                
                
                /**
                 * This Method Generates the Sector Theory
                 */
                generateSectorContent = function(ind){
                    var cnt = "";
                    $("#sectorContent").show();
                    $('#sectorContent').html("");
                    switch(ind){
                        case 0:
                            $("#sectorContent").hide();
                            break;
                        case 1:
                            cnt += "The energy Sector is the totality of all of "+
                                "the industries involved in the production and sale "+
                                "of energy, including fuel extraction, manufacturing,refining and distribution."+
                                "The energy sector contains petroleum industry, oil companies, "+
                                "gas industry, electrical power industry, nuclear power industry, "+
                                "renewable energy industry. <b>AceEngineer default tickers are XLE, VGENX</b>"+
                                "";
                            break;
                        case 2:
                            cnt += "The metal industry is a key sector in the Global economy as it meets the requirements"+
                                " of a wide range of important industries such as engineering, electrical and electronics, "+
                                "infrastructure, automobile and automobile components, packaging etc. <br/>"+
                                "<b>AceEngineer default tickers are XME, VGPMX, VAW</b>";
                            break;
                        case 3:
                            cnt +="A category of stocks for utilities such as gas and power. "+
                                "The utilities sector contains companies such as electric, gas and water firms "+
                                "and integrated providers. <b>AceEngineer default tickers are BULIX, RYUIX, GASFX</b>";
                            break;
                        case 4:
                            cnt +="Science & Technology sector relating to the research, "+
                                "development and distribution of technologically based goods and services."+
                                " This sector contains businesses revolving around the manufacturing of electronics, "+
                                "creation of software, computers or products and services relating to information technology. "+
                                "<b>AceEngineer default tickers are PPTIX, JAGIX, MATFX</b>";
                            break;
                        case 5:
                            cnt +="Pharmacy is the health profession that links the health sciences. "+
                                "The scope of pharmacy sector includes more traditional roles such as compounding and "+
                                "dispensing medications , services related to health care, clinical services, reviewing medications for safety and efficacy, "+
                                "and providing drug information. <b>AceEngineer default tickers are ASDS,APLI</b>";
                            break;
                    }
                    $('#sectorContent').html(cnt);
                }
                
                
                // When The user Changes the Main Ticker Name
                $("#tickerName").keydown(function(evt)
                {
                    var keyVal = evt.keyCode;
                    // When User Presses Enter Then Go
                    if(keyVal == 13)                    
                    {
                        $('.menu').find('li').each(function(ind)
                        {
                            if($(this).hasClass('active'))
                            {
                                //alert(ind);
                                if(ind == 0)
                                    FundamentalIndicatorHandler.createNewChartDiv($('#tickerName').val());
                                else if(ind == 1)
                                    ReturnAssessmentHandler.reloadChart();
                            }
                        });
                    }
                });                
                
                
                //loading The Date fields in the Document
                var f = $("input[name='dateField']");
                //$(f).datepicker();
                try{
                    $(f).datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:'yy-mm-dd'});
                }catch(e){alert(e);}
                //new Calendar(f, 1900, 2500);
                
                $('input[name="resultType"]').each(function(ind)
                {
                    var divs = [$('#fundamentalIndicatorDiv')[0],$('#returnAssessmentDiv')[0]];
                    $(this).change(function()
                    {
                        $(divs).hide();
                        $(divs[ind]).show();
                    });
                });
                
                
                // This is For PDF Report Generation
                $('#report').click(function(){
                    generatePDFReport();
                    return false;
                });
                
            });
            
            /**
             * ThisMethod used to initialize tthe tooltips
             */
            function initilizeTootip()
            {
                toolTip = new ToolTip($('*'),{divCSS:'toolTipCSS'});
            }
            
            function generatePDFReport()
            {
                var data1 = GooleCharting.getImgData($('#chartDivAD')[0]);
                var data2 = GooleCharting.getImgData($('#chartDivAR')[0]);
                var data3 = GooleCharting.getImgData($('#chartDivYY')[0]);
                var data4 = GooleCharting.getImgData($('#chartDivRD')[0]);
                var choosedTickers = "";
                $('#raTickerCompareDiv').find(':input').each(function(){
                    choosedTickers += ($(this).val()+","); 
                });
                
                data1 = data1.replace('data:image/png;base64,', '');
                data2 = data2.replace('data:image/png;base64,', '');
                data3 = data3.replace('data:image/png;base64,', '');
                data4 = data4.replace('data:image/png;base64,', '');
                
                var sum1 = ($('#chartDivAD').siblings('.chartSummaryDiv').html());
                var sum2 = ($('#chartDivAR').siblings('.chartSummaryDiv').html());
                var sum3 = ($('#chartDivYY').siblings('.chartSummaryDiv').html());
                var sum4 = ($('#chartDivRD').siblings('.chartSummaryDiv').html());
                
                //sum1 = sum1.replace(/<br>/g, ",");
                //sum1 = sum1.replace(/<.*?>/g,'');
                ///alert(escape(sum1));
                //return;
                
                function splitStatements(pText)
                {
                    var tokens = pText.replace(/<br>/g, ',');
                    tokens = tokens.replace(/<.*?>/g,'');
                    return tokens;
                }
                sum1 = splitStatements(sum1);
                sum2 = splitStatements(sum2);
                sum3 = splitStatements(sum3);
                sum4 = splitStatements(sum4);
                alert(sum1);
                //return;
                
                var xml = new XMLHttpRequest();
                xml.open("POST", "imageWriter.do", true);
                //Send the proper header information along with the request
                xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    
                    
                xml.onreadystatechange = function()
                {
                    if(xml.readyState==4 && xml.status==200)
                    {
                        alert(xml.responseText);
                    }
                }
                //                xml.send("chst="+escape(choosedTickers)
                //                    +"&img1="+encodeURIComponent(data1)+"&sum1="+escape(sum1)
                //                    +"&img2="+encodeURIComponent(data2)+"&sum2="+escape(sum2)
                //                    +"&img3="+encodeURIComponent(data3)+"&sum3="+escape(sum3)
                //                    +"&img4="+encodeURIComponent(data4)+"&sum4="+escape(sum4));
                xml.send("size=4"
                    +"&imgData1="+encodeURIComponent(data1)+"&imgName1=ARImg.png"
                    +"&imgData2="+encodeURIComponent(data2)+"&imgName2=ADImage.png"
                    +"&imgData3="+encodeURIComponent(data3)+"&imgName3=YYImage.png"
                    +"&imgData4="+encodeURIComponent(data4)+"&imgName4=RDImage.png");
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
        <table class="containerLayout" align="center" border="0">
            <tr>
                <td>
                    <div class="tabsContainer">
                        <div class="tabContent">
                            <jsp:include page="tickers.jsp" ></jsp:include>
                            </div>
                        </div>
                    </td>
                </tr>   
            </table>
            <div id="tempDiv"></div>
            <div id="userPortfolio_DB_Data" style="display: none">
            <logic:present name="tickersBean">
                <bean:write name="tickersBean" />
            </logic:present>
        </div>
    </body>
</html>
