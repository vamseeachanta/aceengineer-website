<%-- 
    Document   : tickers
    Created on : May 14, 2012, 3:19:25 PM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--       includes All title and SEO-->

        <!--                <link rel="stylesheet" type="text/css" href="res/css/StockAnalysisCSS.css" />
                        <link rel="stylesheet" type="text/css" href="res/css/DOMElements.css" />
                        <link rel="stylesheet" type="text/css" href="res/css/ElementManipulator.css" />
                        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css" />
                        <link rel="shortcut icon" href="res/icons/stock_icon.gif"/>
                        <link rel="stylesheet" href="res/css/chosen.css" />
                        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>-->
        <!--         includes All CSS-->
        <style type="text/css">
            .myTable td.positiveVal{
                color: green;
                font-weight: bold;
            }
            .myTable td.negetiveVal{
                color: red;
                font-weight: bold;
            }

            #totalSummaryTab{

            }
            #totalSummaryTab tbody td{
                font-size: 1.3em;
                padding: 5px;
                text-align: right;

            }
            #summaryHiddenDiv{
                display: none;
            }
        </style>

        <!--         Includes ALL JS -->
        <!--        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
                <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        -->     
        <!--        <script type="text/javascript" src="res/js/chosen.jquery.js"></script>
                <script type="text/javascript" src="res/js/ForExChart.js"></script>
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
                <script type="text/javascript" src="res/js/FundAnalyzer.js"></script>-->

        <script type="text/javascript">
            google.load("visualization", "1", {packages:["corechart"]});
            var autoComplete;
            var summaryDiv;
            var totalSummaryTab;
            var tickers = [];
            var symbols = [];
            var watchListTickersSymbol = [];
            var watchListForexSymbol = [];
            var watchlist = [];
            var forexList = [];
            var tickerTxt;            
            var resilienceFactorTable;
            var chartMarketCompare =[];
            var chartPortfolioCompare =[];
            var marketCompareArray = [];
            var portfolioCompareArray = [];
            var marketCompareValue = 0;
            var marketCompareTicker = [];
            var marketCompareQuantity = [];
            var marketCompareDates = [];
            var marketCompareRates = [];
            var watchListPerformance = [];
            var forexListPerformance = [];
            var watchListPerformanceCount  = 0;
            var forexListPerformanceCount = 0;
            var marketCompareCount = 0;
            var fundNames;
            var quantity;
            var controlsDiv1;
            var controlsDiv2;
            var controlsDiv3;
            var maskDivTicker1;
            var maskDivTicker2;
            var maskDivTicker3;
            var outerDiv1;
            var outerDiv2;
            var outerDiv3;
            /*
             * This Variable is Used for Compare the Total Portfolio values into AceEngineer Benchmark value
             */
            var totalMarketValue = 0;
            var cashinhold = 0;
            var FundAnalyzer;
            // These variables for Report
            var TABLE_SECTION_SEPARATOR = "#SEC#";
            var ROW_SEPARATOR = "#ROW#";
            var COLUMN_SEPARATOR = "#COL#";
            var TABLE_SEPARATOR = "#TAB#";
            google.load("visualization", "1", {packages:["corechart"]});
            google.setOnLoadCallback(function()
            {
                ReturnAssessmentHandler.initilize();
                ReturnAssessmentHandler.storeInDB = true;
            });
            
            google.load('visualization', '1', {'packages':['annotatedtimeline']});
            google.setOnLoadCallback(function(){  
                FundamentalIndicatorHandler.initilize();
                FundamentalIndicatorHandler.storeInDB = true;
            });    
            function initilizeSymbolLookupFields()
            {
                autoComplete = new AutoComplete($('.symbolLookup'),{});
            }
            $(function()
            {
                try{
                   
                    TempTickerMaskEffect();
                    initilizeSymbolLookupFields();
                    summaryDiv = $('#userTickersSummary')[0];
                    tickerTxt = $('input[name="addTickerText"]')[0];
                    resilienceFactorTable = document.getElementById('resilienceFactorTable');                
                
                    // Registering the Report Linke Event
                    $('#pdfLink').click(function(){
                        var url = "reportMaker.do?";
                        var cnt = '';
                        var cnt2 = '';
                    
                        //                    $("#userTickersSummary").each(function(){
                        $('.portfolioTable').each(function(){
                            cnt2 += parseTable(this);
                            cnt2 += TABLE_SEPARATOR;
                        });
                        $('.reportTable').each(function(){
                            cnt += parseTable(this);
                            cnt += TABLE_SEPARATOR;
                        });                    
                        url += "data="+escape(cnt)+"&data2="+escape(cnt2);
                        $(this).attr("href",url);                    
                    });
                
                
                    // Restricting the Input box to allowing the special Characters
                    Input.excludeCharacters(tickerTxt,"`~!@#$%&*()-=+", function(){});
                
                    totalSummaryTab = $('#totalSummaryTab')[0];
                    //alert(totalSummaryTab);
                
                
                    //                var data = $('#userPortfolio_DB_Data').html();
                    //                if(data.length>2){
                    //                    data = eval("("+data+")");
                    //                    tickers = data.tickers; 
                    //                    cashinhold = data.cash;
                    //                    if(cashinhold == 0)
                    //                    {
                    //                        cashinhold = $(summaryDiv).find('table tfoot').find('th').eq(5).text();
                    //                    }
                    //                    alert("Cash Here is "+cashinhold);
                    //                }
                
                    //tickers = ["GOOG","XLE","VGENX","SBI.BO","XME","VGPMX","VDIGX","VIPSX"];
                   
                    var cnt ="<table class='myTable border10 portfolioTable' width='100%' cellspacing='1'>";
                    cnt += "<thead>"
                    cnt += "<tr><th>Symbol</th><th>Name</th><th>Fund Type</th><th>Quantity</th><th>Current Price($)</th><th>Change($)</th><th>Market Value($)</th><th>Day Change($)</th><th></th></tr>";
                    cnt += "</thead>";
                    cnt += "<tbody>"                   
                        +"</tbody>";
                    cnt +="<tfoot>"+
                        "<tr><th>Cash In Hold</th><th></th><th></th><th></th><th></th><th class='value'></th><th>10000</th><th></th><th></th></tr>"+
                        "<tr><th>Total Portfolio</th><th></th><th></th><th></th><th></th><th class='value'></th><th>10000</th><th></th><th></th></tr>"+
                        "</tfoot>";
                    cnt += "</table>";
                
                    $(summaryDiv).html(cnt);
                    var data = $('#userPortfolio_DB_Data').html();
                    if(data.length>2){
                        data = eval("("+data+")");
                        if(data.userId == "guest@gmail.com")
                        {
                            $("#scheduleCPR").hide();     
                        }
                        else
                        {
                            $("#scheduleCPR").show();         
                        }
                        tickers = data.tickers; 
                        cashinhold = data.cash;
                        watchlist = data.watchListTickers;
                        forexList = data.forexWatchList;
                        if(cashinhold == 0)
                        {
                            cashinhold = $(summaryDiv).find('table tfoot').find('th').eq(6).text();
                        }
                        updateSummaryForexList(forexList);
                        updateSummaryWatchList(watchlist);
                       
                    }
                    registerFooterCashinhold();
                
                    try{
                        FundAnalyzer = new FundAnalyzer("SPY",function(data){                    
                            //alert("Fund Analyzer Loaded Successfully");
                            // Loading the user Saved Ticker Data When Fund Analyzer Loaded
                            
                            for(var i=0;i<tickers.length;i++)
                            {
                                var tickerData = tickers[i];
                                symbols.push(tickerData.name);
//                                alert("Alert Here"+tickerData.name+"     "+tickerData.fType)
                                addToResilienceFactor(tickerData.name,tickerData.fType);
                                var checkCount = 0;
                                StockData.loadTickerSummary(tickerData.name, function(data,optionData)
                                {
                                    var quote = data.query.results.quote;
                                    if(quote.ErrorIndicationreturnedforsymbolchangedinvalid != "N/A"){
                                        alert("No Symbol Exist!");
                                        return;
                                    }                                
                                    $(summaryDiv).find('tbody').append(createSummaryDiv(quote,optionData));
                                    applyMaskTicker1($("#userTickersSummary"), 1);
                                    applyMaskTicker2($("#watchList"),1);
                                    applyMaskTicker3($("#forexList"),1);
                                    updateFooter();
                                    checkCount++;
                                    if(tickers.length == checkCount)
                                    {
                                        if(tickers.length>0)
                                        {
                                            $('input[name="benchMark"]').attr('checked','checked');
                                            compareAceEngineerBenchMark();
                                        }
                                        removeMaskEffect();
                                    }
                                },tickerData);
                            }
                        });
                    }catch(e){
                        alert("Error While Initilizing Fund Analyzer");
                    }
                
                
                    /**
                     * this method used to store the Entered ticker to be stored at server side
                     **/
                    function addToPortfoliBean(ticker,fType,handler){
                        $.get('stockUtilHandler.do',{
                            mode:0,
                            ticker:ticker,
                            fType:fType,
                            no:1,
                            cash: $(summaryDiv).find('table tfoot').find('th').eq(6).text()
                        },function(data){
                            //alert("Ticker Stored: "+data);
                        });
                    }
                    $('input[name="benchMark"]').change(function(){
                        if($(this).is(':checked'))
                        {
                            compareAceEngineerBenchMark();
                        }
                        else{
                            $("#comparisonTable").hide();
                        }
                    });
                    
                    function compareAceEngineerBenchMark()
                    {
                        try
                        {
                            chartMarketCompare =[];
                            chartPortfolioCompare =[];
                            marketCompareArray = [];
                            portfolioCompareArray = [];
                            marketCompareValue = 0;
                            marketCompareTicker = [];
                            marketCompareQuantity = [];
                            marketCompareDates = [];
                            marketCompareRates = [];
                            marketCompareCount = 0;
                            marketCompareValue = 0;
                            $("#comparisonTable").show();
                            var sd = new Date();
                            sd.setDate(sd.getDate()-60);
                            fundNames = [];
                            quantity = [];
                            //                            fundNames.push("SPY");
                            fundNames.push("AceEngineer_SPY");
                            quantity.push(1);
                            $('.portfolioTable>tbody>tr>td:nth-child(1)').each( function(){
                                //add item to array
                                fundNames.push( $(this).text());       
                            });
                            $('.portfolioTable>tbody>tr>td:nth-child(4)').each( function(){
                                //add item to array
                                quantity.push( $(this).text());       
                            });
                            for(var i=0;i<fundNames.length;i++)
                            {
                                gettingDataforTicker(fundNames[i],sd,new Date(),quantity[i]);
                            }
                        }catch(e)
                        {
                            alert("exception is "+e);
                        }
                    }
                    
                    
                
                    //alert($('input[name="addTickerText"]')[0]);
                    $('button[name="addTickerBtn"]').click(function(){
                        var  t = $(tickerTxt).val();
                        var fType = $(tickerTxt).attr('key');
                        //alert(t);
                        if(t.length<1){
                            alert("Please enter proper ticker name");
                            return;
                        }
                        //alert(symbols);
                        // Checking for Previous Existance of the Symbol
                        if(symbols.indexOf(t.toUpperCase())>=0){
                            alert("Ticker already exist in your portfolio");
                            return;
                        }
                    
                        // adding to the Server
                        addToPortfoliBean(t,fType);
                    
                        StockData.loadTickerSummary(t, function(data,optionData){
                            //alert("loading ticker summary");
                            //alert(data);
                            //alert(tickerTxt.value);
                            $(tickerTxt).val("");
                            var quote = data.query.results.quote;
                        
                            //alert(quote.symbol);
                            //alert(quote.Name);
                            if(quote.ErrorIndicationreturnedforsymbolchangedinvalid != "N/A"){
                                alert("No Symbol Exist!");
                                return;
                            }
                            // Adding to Resilience Factor Table
                            addToResilienceFactor(t,fType);
                        
                            symbols.push(t);
                            if(t != 'SPY'){
                                FundamentalIndicatorHandler.addNewTickerToCompare(t, true, function(){});
                                ReturnAssessmentHandler.addNewTickerToCompare(t, true, function(){});
                            }
                            $(summaryDiv).find('tbody').append(createSummaryDiv(quote,{name:t,no:1,fType:fType}));
                            updateFooter();
                        },{name:t,no:1,fType:fType});
                    });
                
                
                    //event listener for enter button to add ticker to the portfolio
                    $(tickerTxt).keydown(function(evt){
                        if(evt.keyCode == 13)
                        {
                            var  t = $(tickerTxt).val();
                            var fType = $(tickerTxt).attr('key');
                            //alert(t);
                            if(t.length<1){
                                alert("Please enter proper ticker name");
                                return;
                            }
                            //alert(symbols);
                            // Checking for Previous Existance of the Symbol
                            if(symbols.indexOf(t.toUpperCase())>=0){
                                alert("Ticker already exist in your portfolio");
                                return;
                            }
                    
                            // adding to the Server
                            addToPortfoliBean(t,fType);
                    
                            StockData.loadTickerSummary(t, function(data,optionData){
                                //alert("loading ticker summary");
                                //alert(data);
                                //alert(optionData);
                                //alert(tickerTxt.value);
                                $(tickerTxt).val("");
                                //alert(data);
                                var quote = data.query.results.quote;
                        
                                // /alert(quote.Symbol);
                                // alert(quote.Name);
                                // /alert(quote.ErrorIndicationreturnedforsymbolchangedinvalid);
                                //if(quote.ErrorIndicationreturnedforsymbolchangedinvalid != null){//old code
                                if(quote.ErrorIndicationreturnedforsymbolchangedinvalid != "N/A"){//code changed by jd
                                    alert("No Symbol Exist!");
                                    return;
                                }
                                // Adding to Resilience Factor Table
                                addToResilienceFactor(t,fType);
                        
                                symbols.push(t);
                                if(t != 'SPY'){
                                    FundamentalIndicatorHandler.addNewTickerToCompare(t, true, function(){});
                                    ReturnAssessmentHandler.addNewTickerToCompare(t, true, function(){});
                                }
                                $(summaryDiv).find('tbody').append(createSummaryDiv(quote,{name:t,no:1,fType:fType}));
                                updateFooter();
                            },{name:t,no:1,fType:fType});
                        }
                    });
                
                    // by Default Closing the Table
                    $('#summaryHiddenDiv').slideUp(10, null);
                    // Registering the Summary Details Button
                    var toggleStatus = 0;
                    var btnLabel;
                    $('#summaryDetailsBtn').click(function(){
                        // Changing the TYoggle Status
                        toggleStatus = toggleStatus!=0?0:1;
                        //alert(toggleStatus);
                        $('#summaryHiddenDiv').slideToggle(1000, null);
                        switch(toggleStatus){
                            case 0:
                                btnLabel = "Show Summary Details";
                                break;
                            case 1:
                                btnLabel = "Hide Summary Details";
                                break;
                        }
                        //alert(btnLabel);
                    
                        $(this).html(btnLabel);
                    });   
                
                    $('input[name="addTickerText"]').click(function(){
                        $(this).val("");
                   
                    }); 
                    $('input[name="addTickerText"]').blur(function(){
                        if($(this).val() == "")
                        {
                            $(this).val("Search Fund"); 
                        }
                    });
                    $('input[name="addTickerTextWatch"]').click(function(){
                        $(this).val("");
                   
                    }); 
                    $('input[name="addTickerTextWatch"]').blur(function(){
                        if($(this).val() == "")
                        {
                            $(this).val("Search Fund"); 
                        }
                    });
                    
                    $('button[name="addToWatchList"]').click(function()
                    {
                        var sym =  $('input[name="addTickerTextWatch"]').val();
                        if(watchListTickersSymbol.indexOf(sym.toUpperCase())>=0){
                            alert("Ticker already exist in your portfolio");
                            $('input[name="addTickerTextWatch"]').val("Search Fund");
                            return;
                        }
                        watchListTickersSymbol.push(sym);
                        gettingDataforWatchListTicker(sym);
                        addToPortfolioBeanWatch(sym);
                        $('input[name="addTickerTextWatch"]').val("Search Fund");
                    });
                    
                    
                    
                    
                    
                    
                    
                    
                
                
                    $("#AddForexPortfolio").click(function(){
                        try
                        {
                            var sym = $("#ToCurTicker").val()+$("#FromCurTicker").val();
                            if(watchListForexSymbol.indexOf(sym.toUpperCase())>=0){
                                alert("Ticker already exist in your portfolio");
                                $(".tochoose").val('').trigger('liszt:updated');
                                $(".fromchoose").val('').trigger('liszt:updated');
                                return;
                            }
                            if($("#ToCurTicker").val()!= "default" && $("#FromCurTicker").val() != "default")
                            {
                                watchListForexSymbol.push(sym);
                                gettingDataforexPortfolioWatchList(sym);
                                addToPortfolioBeanForex(sym);
                                addCurrencyComparewithUncheck(sym);
                                $(".tochoose").val('').trigger('liszt:updated');
                                $(".fromchoose").val('').trigger('liszt:updated');
                            }
                            else
                            {
                                alert("Please Choose Currency");
                            }
                        }catch(e)
                        {
                            alert("Exception in Add Forex List"+e);
                        }
                    });
                    $(".tochoose").chosen();
                    $(".fromchoose").chosen();
                }catch(e)
                {
                    alert("Exception in Tickers JSP page"+e);
                }
       
                
            });
            
            
            function TempTickerMaskEffect()
            {
                controlsDiv1 = document.getElementById('tempTickerDiv1');
                controlsDiv2 = document.getElementById('tempTickerDiv2');
                controlsDiv3 = document.getElementById('tempTickerDiv3');
                maskDivTicker1 = document.createElement('div');
                maskDivTicker2 = document.createElement('div');
                maskDivTicker3 = document.createElement('div');
                $(controlsDiv1).append(maskDivTicker1);
                $(controlsDiv2).append(maskDivTicker2);
                $(controlsDiv3).append(maskDivTicker3);
                outerDiv1 = document.createElement('div');
                outerDiv2 = document.createElement('div');
                outerDiv3 = document.createElement('div');
                $('#tempTickerDiv1').prepend(outerDiv1);
                $('#tempTickerDiv2').prepend(outerDiv2);
                $('#tempTickerDiv3').prepend(outerDiv3);
            }
            
            
            function applyMaskTicker1(pDiv,state)
            {
                try
                {
                    if(state == 1)
                    {  
                        $(maskDivTicker1).css({
                            'position':'absolute',
                            '-webkit-border-radius':'10px',
                            '-moz-border-radius':'10px',
                            width: $(pDiv).width()+'px',
                            height: $(pDiv).height()+'px',
                            align:'center',
                            verticalAlign: 'middle',
                            display:'block',
                            fontSize: '18px',
                            color: 'white',
                            background: '#0b6998'
                            //'background-image' :"url('res/images/overlay_bg.jpg')"
                        });            
                        $(maskDivTicker1).html("<table style='width:100%;height:100%'><tr><td style='vertical-align:middle;text-align:center'><img src='res/images/334.gif' /></td></tr></table>");
                        $(maskDivTicker1).fadeTo(0, 0.8, null);
                        $(maskDivTicker1).show();
                        $(pDiv).find('*').each(function(){
                            this.disabled = true;
                        });
                    }
                    else
                    {
                        $(pDiv).find('*').each(function(){
                            this.disabled = false;
                        });
                        $(maskDivTicker1).hide();
                    }
                }catch(e)
                {
                    alert("Exception isss "+e);
                }
            }
            
            function applyMaskTicker2(pDiv,state)
            {
                try
                {
                    if(state == 1)
                    {  
                        $(maskDivTicker2).css({
                            'position':'absolute',
                            '-webkit-border-radius':'10px',
                            '-moz-border-radius':'10px',
                            width: $(pDiv).width()+'px',
                            height: $(pDiv).height()+'px',
                            align:'center',
                            verticalAlign: 'middle',
                            display:'block',
                            fontSize: '18px',
                            color: 'white',
                            background: '#0b6998'
                            //'background-image' :"url('res/images/overlay_bg.jpg')"
                        });            
                        $(maskDivTicker2).html("<table style='width:100%;height:100%'><tr><td style='vertical-align:middle;text-align:center'><img src='res/images/334.gif' /></td></tr></table>");
                        $(maskDivTicker2).offset($("#watchList").offset());
                        //                        $(maskDivTicker2).offset(50);
                        $(maskDivTicker2).fadeTo(0, 0.8, null);
                        $(maskDivTicker2).show();
                        $(pDiv).find('*').each(function(){
                            this.disabled = true;
                        });
                    }
                    else
                    {
                        $(pDiv).find('*').each(function(){
                            this.disabled = false;
                        });
                        $(maskDivTicker2).hide();
                    }
                }catch(e)
                {
                    alert("Exception isss "+e);
                }
            }
            function applyMaskTicker3(pDiv,state)
            {
                try
                {
                    if(state == 1)
                    {  
                        $(maskDivTicker3).css({
                            'position':'absolute',
                            '-webkit-border-radius':'10px',
                            '-moz-border-radius':'10px',
                            width: $(pDiv).width()+'px',
                            height: $(pDiv).height()+'px',
                            align:'center',
                            verticalAlign: 'middle',
                            display:'block',
                            fontSize: '18px',
                            color: 'white',
                            background: '#0b6998'
                            //'background-image' :"url('res/images/overlay_bg.jpg')"
                        });            
                        $(maskDivTicker3).html("<table style='width:100%;height:100%'><tr><td style='vertical-align:middle;text-align:center'><img src='res/images/334.gif' /></td></tr></table>");
                        $(maskDivTicker3).offset($("#forexList").offset());
                        $(maskDivTicker3).fadeTo(0, 0.8, null);
                        $(maskDivTicker3).show();
                        $(pDiv).find('*').each(function(){
                            this.disabled = true;
                        });
                    }
                    else
                    {
                        $(pDiv).find('*').each(function(){
                            this.disabled = false;
                        });
                        $(maskDivTicker3).hide();
                    }
                }catch(e)
                {
                    alert("Exception isss "+e);
                }
            }
            function removeMaskEffect()
            {
                applyMaskTicker1($("#userTickersSummary"), 0);
                applyMaskTicker2($("#watchList"),0);
                applyMaskTicker3($("#forexList"),0);
            }
            
            function addToPortfolioBeanWatch(watchList)
            {
                $.get('stockUtilHandler.do',{
                    mode:2,
                    watchListTicker:watchList
                },function(data){
                    //alert("Ticker Stored: "+data);
                });
            }
            
            
            function addToPortfolioBeanForex(forexList)
            {
                $.get('stockUtilHandler.do',{
                    mode:5,
                    currencyPair:forexList
                },function(data){
                      
                });
            }
            
            function updateSummaryWatchList(watchList)
            {
                if(watchList.length != 0)
                {
                    gettingDataforWatchListTicker(watchList[watchListPerformanceCount].name);
                }
            }
            
            
            
            function gettingDataforWatchListTicker(tickerName)
            {
                try
                {
                    $.ajaxSetup({async:false});
                    watchListTickersSymbol.push(tickerName);
                    doAjax("http://ichart.finance.yahoo.com/table.csv?s="+tickerName,"", function(data){
                        if(data == null){
                            alert("There is No Data Exist for the Given Symbol");
                            return;
                        }
                        data = data.replace("Adj Close", "Adj_Close");
                        data = data.replace("<p>", "");
                        data = data.replace("</p>", "");
                        function parseCSVData(data){
                            var rows = data.split(" ");
                            var newData = "";
                            for(var i=0;i<rows.length;i++){
                                if(rows[i].length>=30){
                                    newData += (rows[i]+"\n");
                                }
                            }
                            return newData;
                        }
                        var csvData = parseCSVData(data);
                        if(csvData.length < 1)
                        {
                            alert("There is No Data Exist for the Given Symbol");
                            //                            functionHandler(null);
                            return;
                        }
                        var dates = getSpecifiedData(csvData, "date","date");
                        var rates = getSpecifiedData(csvData, "close","number");
                        watchListPerformance[watchListPerformanceCount] = forexWatchChart.chartRecommendations(dates, rates, tickerName);
                        //                        watchListPerformance[watchListPerformanceCount] = gettingForexWatchListReturn(tickerName);
                        //                        applyMaskTicker2($("#watchList"),1);
                        applyMaskTicker1($("#userTickersSummary"), 1);
                        applyMaskTicker2($("#watchList"),1);
                        applyMaskTicker3($("#forexList"),1);
                        $("#watchList").find('tbody').append(createSummaryWatchList(tickerName,watchListPerformance[watchListPerformanceCount]));
                        if(watchListPerformanceCount<watchlist.length)
                        {
                            watchListPerformanceCount++;
                            if(watchListPerformanceCount != watchlist.length)
                                gettingDataforWatchListTicker(watchlist[watchListPerformanceCount].name);
                        }
                        removeMaskEffect();
                    });
                }catch(e)
                {
                    alert("Exception is Raised "+e);
                }
            }
            function updateSummaryForexList(forexList)
            {
                if(forexList.length != 0)
                {
                    gettingDataforexPortfolioWatchList(forexList[forexListPerformanceCount].name);    
                }
            }
            
            function gettingDataforexPortfolioWatchList(currencyPair)
            {
                $.ajaxSetup({async:false});
                try{
                    watchListForexSymbol.push(currencyPair);
                    var  toCur = currencyPair.slice(0,3);
                    var  fromCur =   currencyPair.slice(3,6);
                    var tempDates = [];
                    var tempRates = [];
                    var dates = [];
                    var rates = [];
                    var symbol;
                    var mode = true;
                    if(toCur==fromCur)
                    {
                        alert("Both are Same country names! Please chnage any one ");
                        return false;
                    }
                    if(toCur == "USD")
                    {
                        symbol = toCur+fromCur;
                    }
                    if(fromCur == "USD")
                    {
                        symbol = fromCur+toCur;
                        mode = false;
                    }
                    if(toCur != "USD" && fromCur!= "USD")
                    {
                        $.get('stockUtilHandler.do',{
                            mode:4,
                            currencyPair:"USD"+toCur
                        },function(data)
                        {
                            var indirectDates = [];
                            var intermediateRates = [];
                            var indirectRates = [];
                            try
                            {
                                data = eval("("+data+")");
                                for(var i=0;i<data[0].results.length;i++)
                                {
                                    indirectDates[i] = new Date(data[0].results[i].dates); 
                                    intermediateRates[i] = 1/(data[0].results[i].rates);
                                }
                                $.get('stockUtilHandler.do',{
                                    mode:4,
                                    currencyPair:"USD"+fromCur
                                },function(data)
                                {
                                    data = eval("("+data+")");
                                    for(var i=0;i<data[0].results.length;i++)
                                    {
                                        indirectRates[i] = (data[0].results[i].rates)*(intermediateRates[i]);
                                    }
                                    tempDates = reverseArray(indirectDates);
                                    tempRates = reverseArray(indirectRates);
                                });
                            }catch(e)
                            {
                                alert("Exception is Raised "+e);
                            }
                        });
                    }
                    else
                    {
                        $.post('stockUtilHandler.do',{
                            mode:4,
                            currencyPair:symbol
                        },function(data)
                        {
                            try
                            {
                                data = eval("("+data+")");
                                for(var i=0;i<data[0].results.length;i++)
                                {
                                    dates[i] = new Date(data[0].results[i].dates);
                                    if(mode==false)
                                    {
                                        rates[i] = 1/(data[0].results[i].rates); 
                                
                                    }
                                    else
                                    {
                                        rates[i] = data[0].results[i].rates;
                                    }
                                }
                                tempDates = reverseArray(dates);
                                tempRates = reverseArray(rates);
                            }catch(e)
                            {
                                alert("Exception is Raised "+e);
                            }
                        });
                    }
                    forexListPerformance[forexListPerformanceCount] = forexWatchChart.chartRecommendations(tempDates, tempRates, currencyPair);
                    applyMaskTicker1($("#userTickersSummary"), 1);
                    applyMaskTicker2($("#watchList"),1);
                    applyMaskTicker3($("#forexList"),1);
                    $("#forexList").find('tbody').append(createSummaryForexList(currencyPair,forexListPerformance[forexListPerformanceCount]));
                    if(forexListPerformanceCount<forexList.length)
                    {
                        forexListPerformanceCount++;
                        if(forexListPerformanceCount != forexList.length)
                            gettingDataforexPortfolioWatchList(forexList[forexListPerformanceCount].name);
                    }
                    removeMaskEffect();
                }catch(e)
                {
                    alert("Here Main Cause "+e);
                }
            }
            
                        
            /*
             * This method makes a summary div for WatchList
             */
            function createSummaryWatchList(ticker,performance)
            {
                var cnt = "";
                cnt += "<td align='center'><b>"+ticker+"</b></td><td>"+performance+"</td>";
                cnt += "<td  align='center'><img src='res/images/DeleteRed.png' alt='' class='removeLinkwatchList' style='text-decoration: underline;cursor: pointer;'/></td>"
                var row = document.createElement('tr');
                $(row).append(cnt);
                registerSummaryRowWatchList(row);
                return row;
            }
             
            function createSummaryForexList(ticker,performance)
            {
                var cnt = "";
                cnt += "<td align='center'><b>"+ticker+"</b></td><td>"+performance+"</td>";
                //                             cnt += "<td class='value'><a class='removeLinkwatchForexList' style='text-decoration: underline;cursor: pointer;'>Remove</a></td>"
                cnt += "<td  align='center'><a class='removeLinkwatchForexList' style='text-decoration: underline;cursor: pointer;'><img src='res/images/DeleteRed.png' alt='' /></a></td>"
                var row = document.createElement('tr');
                $(row).append(cnt);
                registerSummaryRowForexWatchList(row);
                return row;
            }   
             
            
            /*
             * This Function is used for Register the Footer
             */
            function registerFooterCashinhold()
            {
                var tfoot = $(summaryDiv).find('table tfoot');
                $(tfoot).find('th').eq(6).click(function(){
                    var val = window.prompt("Enter Cash in Hold", $(tfoot).find('th').eq(6).html());
                    // if the user cancel the Prompt box then just simplly skip all the work
                    if(val == null){
                        return;                        
                    }
                    val = parseFloat(val);
                    
                    if(isNaN(val)){                        
                        alert("Please Enter Numbers only");
                        return;
                    };
                    $.get('stockUtilHandler.do',{
                        mode:7,
                        cash:val
                    },function(data){
                        $(tfoot).find('th').eq(6).text(val);
                        cashinhold = val;
                        updateFooter();
                    });
                });
            }
            
            /**
             * THis method updates the Footer of the Summary Table
             */
            function updateFooter(){
                var totalMarketVal = 0;
                var totChngVal = 0;
                var tbody = $(summaryDiv).find('table tbody');
                var tfoot = $(summaryDiv).find('table tfoot');
                //alert($(tbody).find('tr').length);
                $(tbody).find('tr').each(function(){
                    //alert($(this).find('td').eq(5).html());
                    totalMarketVal += parseFloat($(this).find('td').eq(6).html());
                    totChngVal += parseFloat($(this).find('td').eq(7).html());
                });
                $(tfoot).find('th').eq(6).text(cashinhold);
                $(tfoot).find('th').eq(15).html((MyMath.round(parseFloat(totalMarketVal)+parseFloat(cashinhold),2)));
                $(tfoot).find('th').eq(16).html(Math.ceil(totChngVal*100)/100);
                if(totChngVal<0){
                    $(tfoot).find('th').eq(16).css({'color':'red'});
                }else{
                    $(tfoot).find('th').eq(16).css({'color':'green'});
                }
                var body = $(totalSummaryTab).find('tbody');
                //                var changePer = (totChngVal/(totalMarketVal-totChngVal))*100;
                var changePer = (totChngVal*100)/(totalMarketVal+cashinhold);
                changePer = (isNaN(changePer))?"0.0":changePer;
                changePer = MyMath.round(changePer,2);
                //                alert(MyMath.round((totalMarketVal+cashinhold),2));
                $(body).find('td').eq(0).html("&#36;"+(MyMath.round((parseFloat(totalMarketVal)+parseFloat(cashinhold)),2)));
                $(body).find('td').eq(1).html(MyMath.round(totChngVal,2)+"("+changePer+"%)");
                if(changePer<0){
                    $(body).find('td').eq(1).css({'color':'red'});
                }else{
                    $(body).find('td').eq(1).css({'color':'green'});
                }
                totalMarketValue = MyMath.round(parseFloat(totalMarketVal)+parseFloat(cashinhold),2);
                //                totalMarketValue = parseFloat(MyMath.round(totalMarketVal,2))+parseFloat($(tfoot).find('th').eq(5).text());
            }
            
            /**
             * This Method Makes the Summary Div for the Given quote Object
             */
            
            
            function createSummaryDiv(quote,tickerData){
                //quote.AskRealtime = MyMath.round(quote.AskRealtime,2);
                //quote.Change = MyMath.round(quote.Change,2);
                //quote.LastTradePriceOnly = MyMath.round(quote.LastTradePriceOnly,2);
                //alert(tickerData);
                var no = tickerData.no;
                var fType = tickerData.fType;
                var cnt = "";
                cnt += "<td>"+quote.Symbol+"</td><td>"+quote.Name+"</td><td>"+fType+"</td><td class='value'>"+no+"</td><td class='value'>"+quote.LastTradePriceOnly;
                if(quote.Change<0){                    
                    cnt += "</td><td class='value negetiveVal'>"+quote.Change;
                }
                else{
                    cnt += "</td><td class='value positiveVal'>"+quote.Change;
                }
                cnt += "</td><td class='value'>"+MyMath.round((quote.LastTradePriceOnly*no),2)+"</td>";
                if(quote.Change<0){
                    cnt += "<td class='value negetiveVal'>";
                }
                else{
                    cnt += "<td class='value positiveVal'>";
                }
                cnt += MyMath.round(no*(quote.Change),2)+"</td>";
                //                cnt += "<td class='value'><a class='removeLink' href='' >Remove</a></td>"
                cnt += "<td  align='center'><img src='res/images/DeleteRedSmall.png' alt='' class='removeLink' style='text-decoration: underline;cursor: pointer;'/></td>"
                var row = document.createElement('tr');
                $(row).append(cnt);
                registerSummaryRow(row);
                return row;
            }
            
            /*
             * This method Register the Row Element
             */
            function registerSummaryRow(rowEle){
                $(rowEle).click(function(){
                    var val = window.prompt("Enter Quantity", $(rowEle).find('td').eq(3).html());
                    // if the user cancel the Prompt box then just simplly skip all the work
                    if(val == null){
                        return;                        
                    }
                    try{
                        var data = {
                            mode : 0,ticker:"",no:1,cash:10000,fType:""
                        }
                        
                        val = parseFloat(val);
                        if(isNaN(val)){                        
                            alert("Please Enter Numbers only");
                            return;
                        }
                        data.ticker = $(rowEle).find('td').eq(0).html();
                        data.no = val;
                        data.cash = $(summaryDiv).find('table tfoot').find('th').eq(6).text();
                        data.fType = $(rowEle).find('td').eq(2).html();
                        storeInDB(data, function(d)
                        {
                            //alert("Stored :\n"+d);
                            $(rowEle).find('td').eq(3).html(val);
                            $(rowEle).find('td').eq(6).html( MyMath.round(parseFloat($(rowEle).find('td').eq(4).html())*val,2) );
                            $(rowEle).find('td').eq(7).html( MyMath.round(parseFloat($(rowEle).find('td').eq(5).html())*val,2) );
                            //                          alert($(summaryDiv).find('table tfoot').find('th').eq(5).text());
                            updateFooter();
                        });
                        
                    }catch(e){
                        alert("Please Enter Numbers only");
                    }
                });
                
                $(rowEle).find('.removeLink').click(function(evt){
                    evt.stopPropagation();
                    var row = $(this).parents('tr').eq(0);
                    var removeTicker = $(row).find('td:first').text();
                    if(removeTicker == 'SPY')
                    {
                        $('input[name="benchMark"]')[0].checked = false;
                    }
                    if(!confirm("Are you sure to delete '"+removeTicker+"' fund from your portfolio?")){
                        return false;
                    }
                    $.get('stockUtilHandler.do',{
                        mode:1,
                        ticker:removeTicker
                    },function(data)
                    {
                        //alert("remove ticker : "+removeTicker)
                        // removing from the List
                        symbols.removeElement(removeTicker);
                        // Removing the Row form the Table
                        $(row).remove();
                        // Updating the Table Footer
                        updateFooter();
                        $(fundSummaryTable).find('tbody tr').each(function(){
                            if($(this).find('th:first').text() == removeTicker){
                                $(this).remove();
                            }
                        });                        
                        $(resilienceFactorTable).find('tbody tr').each(function(){
                            if($(this).find('th:first').text() == removeTicker){
                                $(this).remove();
                            }
                        });
                        
                        // Now Updating the Summary Table
                        updateSummaryTable();
                    });                    
                    return false;                
                });
            }
            
            /*
             * This method Register the Row Element for WatchList
             */
            
            
            function registerSummaryRowWatchList(rowEle){
                //                $(rowEle).click(function(){
                //                    var val = window.prompt("Enter Quantity", $(rowEle).find('td').eq(2).html());
                //                    // if the user cancel the Prompt box then just simplly skip all the work
                //                    if(val == null){
                //                        return;                        
                //                    }
                //                    try{
                //                        var data = {
                //                            mode : 0,ticker:"",no:1,cash:10000
                //                        }
                //                        
                //                        val = parseFloat(val);
                //                        if(isNaN(val)){                        
                //                            alert("Please Enter Numbers only");
                //                            return;
                //                        }
                //                        data.ticker = $(rowEle).find('td').eq(0).html();
                //                        data.no = val;
                //                        data.cash = $(summaryDiv).find('table tfoot').find('th').eq(5).text();
                //                        storeInDB(data, function(d)
                //                        {
                //                            //alert("Stored :\n"+d);
                //                            $(rowEle).find('td').eq(2).html(val);
                //                            $(rowEle).find('td').eq(5).html( MyMath.round(parseFloat($(rowEle).find('td').eq(3).html())*val,2) );
                //                            $(rowEle).find('td').eq(6).html( MyMath.round(parseFloat($(rowEle).find('td').eq(4).html())*val,2) );
                //                            //                          alert($(summaryDiv).find('table tfoot').find('th').eq(5).text());
                //                            updateFooter();
                //                        });
                //                        
                //                    }catch(e){
                //                        alert("Please Enter Numbers only");
                //                    }
                //                });
                
                $(rowEle).find('.removeLinkwatchList').click(function(evt){
                    evt.stopPropagation();
                    var row = $(this).parents('tr').eq(0); 
                    var removeTicker = $(row).find('td:first').text();
                    watchListTickersSymbol.removeElement(removeTicker);
                    $(row).remove();
                    //                    var removeTicker = $(row).find('td:first').text();
                    //                    if(removeTicker == 'SPY')
                    //                    {
                    //                        $('input[name="benchMark"]')[0].checked = false;
                    //                    }
                    //                    if(!confirm("Are you sure to delete '"+removeTicker+"' fund from your portfolio?")){
                    //                        return false;
                    //                    }
                    $.get('stockUtilHandler.do',{
                        mode:3,
                        ticker:removeTicker
                    },function(data)
                    {
                        //                                            //alert("remove ticker : "+removeTicker)
                        //                                            // removing from the List
                        //                                            symbols.removeElement(removeTicker);
                        //                                            // Removing the Row form the Table
                        //                                            $(row).remove();
                        //                                            // Updating the Table Footer
                        //                                            updateFooter();
                        //                                            $(fundSummaryTable).find('tbody tr').each(function(){
                        //                                                if($(this).find('th:first').text() == removeTicker){
                        //                                                   $(this).remove();
                        //                                                }
                        //                                            });                        
                        //                                            $(resilienceFactorTable).find('tbody tr').each(function(){
                        //                                                if($(this).find('th:first').text() == removeTicker){
                        //                                                    $(this).remove();
                        //                                                }
                        //                                            });
                        //                                            
                        //                                            // Now Updating the Summary Table
                        //                                            updateSummaryTable();
                    });                    
                    return false;                
                });
            }
            
            
            
            function registerSummaryRowForexWatchList(rowEle){
                $(rowEle).find('.removeLinkwatchForexList').click(function(evt){
                    evt.stopPropagation();
                    var row = $(this).parents('tr').eq(0); 
                    var removeTicker = $(row).find('td:first').text();
                    watchListForexSymbol.removeElement(removeTicker);
                    $(row).remove();
                    $.get('stockUtilHandler.do',{
                        mode:6,
                        currencyPair:removeTicker
                    },function(data)
                    {
                        
                    });                    
                    return false;                
                });
            }
            /**
             * this Method Used to remove a row from the Summary Table
             */
            function removeRow(ticker){
                ticker = ticker.toUpperCase();
                var body = $(userTickersSummary).find('table tbody');
                $(body).find('tr').each(function(){
                    var key = $(this).find('td').eq(0).html();
                    key = key.toUpperCase();
                    if(key == ticker){
                        $(this).remove();
                        return;
                    }
                });
            }
            
            /**
             * This Method Used to add the Ticker to The Resilience Factor Table
             */
            var resilienceTicker = "";
            function addToResilienceFactor(ticker,fType){
                
                FundAnalyzer.getResilienceFactor(ticker,fType,null, function(data){                        
                    if(data == null){
                        resilienceTicker += ticker+",";
                        $("#ResilienceNote").text("Note: The "+resilienceTicker+"Ticker is too young to Compute Resilience Factor");
                        //                        alert("Entered Ticker is too young to Compute Resilience Factor")
                        return;
                    }
                            
                    //alert($.toJSON(data));
                    var betaObj = data[2];
                    var summaryObj = betaObj.summaryData;
                    // Adding Summary to The Summary Table
                    addToSummaryTable(summaryObj);
                        
                    var returns = betaObj.returns;
                    var cnt = "<tr key='"+escape(betaObj.ticker)+"'><th>"+betaObj.ticker+"</th>";
                    for(var i=0;i<returns.length;i++){
                        cnt += "<td class='value returns'>"+(returns[i]==undefined?"N/A":returns[i])+"</td>";
                    }
                    cnt += "<td class='value'>"+MyMath.round(betaObj.avgPullBack,2)+"</td>"
                        +"<td class='value'>"+MyMath.round(betaObj.avgBounceBack,2)+"</td>"
                    //+"</td><td class='value'>"+MyMath.round(betaObj.extreamBeta,2)
                        +"<td class='value'>N/A</td></tr>";
                        
                    $(resilienceFactorTable).find('tbody').append(cnt);
                    //alert("Results are :"+avgPullBack+"    "+avgBounceBack+"     "+extreamBeta);
                    
                    // Updating the Summary Table
                    updateSummaryTable();
                });
            }
            
            /**
             * THis Method Computes the Resilience Factor Values baSED ON THE gIVEN
             * down and peek values
             */
            function computeResilienceValue(data){
                var rf = [];
                var d = [];
                for(var i=0;i<data[0].length;i++){
                    d.push(data[1][i].rate,data[0][i].rate);
                }                
                for(var i=1;i<d.length;i++){
                    rf.push( ((d[i]-d[i-1])/(d[i-1]))*100 );
                }
                //alert('Resilience Factor Values are : '+rf);
                return rf;
            }
            
            /**
             * This Method Used to Create A Resilience Table Row
             */
            function createResilienceRow(data){
                //alert($.toJSON(data));
                var mins = data[0];
                var maxs = data[1];
                var cnt = "<tr>";
                for(var i=0;i<mins.length;i++){
                    cnt += "<td>"+ (maxs[i]!=null?(maxs[i].rate):"N/A") +"</td>";
                    cnt += "<td>"+ (mins[i]!=null?(mins[i].rate):"N/A") +"</td>";
                }
                cnt += "</tr>";
                return cnt;
            }
            
            /**
             * This Method Used to add the Summary data to the Summary Tabel
             */
            function addToSummaryTable(obj){
                var body = $(fundSummaryTable).find('tbody');
                $(body).append(createSummaryRow(obj));
                //alert("Summary Object is :"+$.toJSON(obj));
                // to create a summary Row
                
//                alert($(summaryDiv).find('tbody').find('td').eq(2).text());
                function createSummaryRow(obj){  
//                    alert(obj.TICKER+" "+obj.fType);
                    var cnt = "<tr key='"+obj.TICKER+"'>";
                    cnt += "<th>"+(obj.TICKER==null?"N/A":obj.TICKER)+"</th>";
                    cnt += "<td>"+(obj.CATEGORY==null?obj.fType:obj.CATEGORY)+"</td>";
                    cnt += "<td>"+(obj.FUND_FAMILY==null?"N/A":obj.FUND_FAMILY)+"</td>";
                    cnt += "<td>"+(obj.INCEPTION_DATE==null?"N/A":obj.INCEPTION_DATE)+"</td>";
                    cnt += "<td class='value'>"+(obj.NET_ASSET==null?"N/A":obj.NET_ASSET)+"</td>";
                    cnt += "<td class='value'>"+(obj.EXPENSE_RATIO==null?"N/A":obj.EXPENSE_RATIO)+"</td>";
                    cnt += "<td class='value'>"+MyMath.round(obj.BETA,2)+"</td>";
                    cnt += "<td class='value'>"+MyMath.round(obj.extreamBeta,2)+"</td>";
                    cnt += "<td class='value'>N/A</td>";
                    cnt += "<td class='value'>N/A</td>";
                    cnt += "</tr>";
                    return cnt;
                }
            }
            
            function storeInDB(data,handler){
                $.get('stockUtilHandler.do',data,function(data){
                    handler(data);
                });                
            }
            
            // to parse the Table
            function parseTable(tableObj){
                var cnt = "";
                var head = $(tableObj).find('thead');
                var body = $(tableObj).find('tbody');
                $(head).find('tr:last').each(function(){
                    $(this).find('td,th').each(function(){
                        //alert("Table Cell is : "+$(this).html());
                        if($(this).html()!= "")
                        {
                            cnt += ($(this).html()+COLUMN_SEPARATOR);
                        }
                    });
                    cnt += ROW_SEPARATOR;
                });                
                cnt += TABLE_SECTION_SEPARATOR;
                $(body).find('tr').each(function(){
                    $(this).find('td,th').each(function(){  
                        if($(this).text()!="Remove")
                        {
                            cnt += ($(this).html()+COLUMN_SEPARATOR);
                        }
                    });
                    cnt += ROW_SEPARATOR;
                });                
                return cnt;
            }
            
            /**
             * This MEthod Updates the Summary Table
             */
            function updateSummaryTable()
            {
                var tableBody = $('#overallSummary').find('tbody');
                var fTable = $('#fundSummaryTable').find('tbody');
                var returns = [];                
                $(resilienceFactorTable).find('tbody tr').each(function(ind){                    
                    var rts = [];
                    var obj = {};
                    $(this).find('.returns').each(function(){                        
                        // push only when its a number                        
                        if(!isNaN($(this).text()))
                            rts.push(parseFloat($(this).text()));
                    });
                    obj.returns = StockAnalysis.avg(rts);
                    obj.ticker = $(this).find('th').eq(0).text();
                    obj.category = $(fTable).find('tr').eq(ind).find('td:eq(0)').text();
                    //                    obj.category = $(this).find('th').eq(0).text();
                    returns.push(obj);
                });
                
                var cnt = "";
                
                // First Sort the Return Object Based on their Returns
                var pos;
                var temp;
                for(var i=0;i<returns.length;i++){                
                    pos = -1;
                    temp = returns[i];
                    for(var j=i+1;j<returns.length;j++){
                        if(temp.returns < returns[j].returns){
                            pos = j;
                            temp = returns[j];
                        }
                    }
                    if(pos != -1){
                        var t = returns[i];
                        returns[i] = returns[pos];
                        returns[pos] = t;
                    }
                }                
                for(i=0;i<returns.length&&i<10;i++){
                    cnt += "<tr><th>"+returns[i].ticker+"</th><td>"+returns[i].category+"</td><td class='value'>N/A</td><td>Market Return</td></tr>";
                }
                $(tableBody).html("").append(cnt);
            }
        
        
            /*
             * This function is used for getting data for tickers to compare market returns with portfolio returns 
             */
            function gettingDataforTicker(tickerName,startDate,endDate,quantity)
            {
                try
                {
                    var tempTickerName = tickerName;
                    if(tickerName == "AceEngineer_SPY")
                    {
                        tickerName =  "SPY";
                    }
                    var tokens1 = StockCore.splitDate(startDate);
                    var tokens2 = StockCore.splitDate(endDate);
                    var results = [];
                    // Query in format of startingMonth,staringDay,startingYear and endingMonth,endingDay,endingYear
                    var query = "s="+tickerName+"&a="+tokens1[0]+"&b="+tokens1[1]+"&c="+tokens1[2]+"&d="+tokens2[0]+"&e="+tokens2[1]+"&f="+tokens2[2]+"&g=d&ignore=.csv";
                    $.ajaxSetup({async:false});
                    doAjax("http://ichart.finance.yahoo.com/table.csv?"+query, "", function(data){
                        //                        alert("Retrived Data Is :"+data);
                        // if the Data is NULL then 
                        if(data == null){
                            alert("There is No Data Exist for the Given Symbol");
                            //                        FI.applyMask(0);
                            //                        functionHandler(null);
                            return;
                        }
                        data = data.replace("Adj Close", "Adj_Close");
                        data = data.replace("<p>", "");
                        data = data.replace("</p>", "");
            
                        function parseCSVData(data){
                            var rows = data.split(" ");
                            var newData = "";
                            for(var i=0;i<rows.length;i++){
                                if(rows[i].length>=30){
                                    newData += (rows[i]+"\n");
                                }
                            }
                            return newData;
                        }
           
                        var csvData = parseCSVData(data);
                        if(csvData.length < 1)
                        {
                            alert("There is No Data Exist for the Given Symbol");
                            FI.applyMask(0);
                            functionHandler(null);
                            return;
                        }
                        results[0] = getSpecifiedData(csvData, "date","date");
                        results[1] = getSpecifiedData(csvData, "close","number");
                        handlerMarketComparison(tempTickerName,results,quantity);
                    });
                }catch(e)
                {
                    alert("Exception is Raised "+e);
                }
            }
            function handlerMarketComparison(tickerName,results,noOfShares)
            {
                marketCompareTicker[marketCompareCount] = tickerName;
                var tempRates =[];
                var tempDates =[];
                //                alert(results[1].length);
                for(var i=0;i<results[1].length-1;i++)
                {
                    tempDates[i] = results[0][i];
                    tempRates[i] = results[1][i];
                }
                marketCompareDates[marketCompareCount] = tempDates;
                marketCompareRates[marketCompareCount] = tempRates;
                marketCompareQuantity[marketCompareCount] = noOfShares;
                if(tickerName == "AceEngineer_SPY")
                {
                    
                }
                else
                {
                    marketCompareValue += marketCompareQuantity[marketCompareCount]*marketCompareRates[marketCompareCount][marketCompareRates[marketCompareCount].length-1];
                }
                var len = fundNames.length;
                if(marketCompareCount == len-1)
                {
                    marketCompareValue += cashinhold;
                    for(var i=0;i<marketCompareCount;i++)
                    {
                        if(marketCompareTicker[i] == "AceEngineer_SPY")
                        {
                            marketCompareQuantity[i] = marketCompareValue/marketCompareRates[i][marketCompareRates[i].length-1];
                            calculateMarketCompare();
                        }
                    }
                }
                marketCompareCount++;
            }
            
            function calculateMarketCompare()
            {
                var temp=0;
                var totalPortfolioValue;
                var totalMarketValue;
                for(var i=0;i<marketCompareRates[0].length;i++)
                {
                    totalPortfolioValue = 0;
                    totalMarketValue = 0;
                    for(var j=0;j<marketCompareCount;j++)
                    {
                        if(marketCompareTicker[j] == "AceEngineer_SPY")
                        {
                            totalMarketValue += parseFloat(marketCompareQuantity[j]*marketCompareRates[j][marketCompareRates[j].length-(1+temp)]);
                        }
                        else
                        {
                            totalPortfolioValue += parseFloat(marketCompareQuantity[j]*marketCompareRates[j][marketCompareRates[j].length-(1+temp)]);
                        }
                    }
                    temp = temp+1;
                    portfolioCompareArray[i] = MyMath.round(totalPortfolioValue,2)+cashinhold;
                    marketCompareArray[i] = MyMath.round(totalMarketValue,2);
                }
               
                for(var i=0;i<portfolioCompareArray.length-1;i++)
                {
                    //                    chartMarketCompare[i] = Math.ceil(((100*(marketCompareArray[i+1]-marketCompareArray[i]))/marketCompareArray[i])*100)/100;
                    //                    chartPortfolioCompare[i] = Math.ceil(((100*(portfolioCompareArray[i+1]-portfolioCompareArray[i]))/portfolioCompareArray[i])*100)/100;
                    chartMarketCompare[i] = MyMath.round(((100*(marketCompareArray[i+1]-marketCompareArray[i]))/marketCompareArray[i]),2);
                    chartPortfolioCompare[i] = MyMath.round(((100*(portfolioCompareArray[i+1]-portfolioCompareArray[i]))/portfolioCompareArray[i]),2);
                }
                //                alert("results is \n dates is "+marketCompareDates);
                //                alert("results is \n market percentage is "+chartMarketCompare);
                //                alert("results is \n chart percentage is "+chartPortfolioCompare);
                google.setOnLoadCallback(drawChart());
            }
            function drawChart() 
            {
                try
                {
                    var data = new google.visualization.DataTable();
                    data.addColumn('date','xaxis');
                    data.addColumn('number','Portfolio');
                    data.addColumn('number','Market');
                    var rows = [];
                    for(var i=0,j=marketCompareDates[0].length-2;i<marketCompareDates[0].length-1;i++,j--)
                    {
                        rows[i] = [marketCompareDates[0][i],chartPortfolioCompare[j],chartMarketCompare[j]];
                    }
                    data.addRows(rows);
                    var options = {
                        title: 'Portfolio Performance',
                        scaleType:'maximized',
                        colors:['blue','green']
                        //                        fill:30
                    };
                    var chart =  new google.visualization.AnnotatedTimeLine(document.getElementById('comparisonChartDiv'));
                    chart.draw(data, options);
                    var portRec = (chartPortfolioCompare[marketCompareDates[0].length-2]-chartPortfolioCompare[marketCompareDates[0].length-9]);
                    var marketRec = (chartMarketCompare[marketCompareDates[0].length-2]-chartMarketCompare[marketCompareDates[0].length-9]);
                    if(isNaN(portRec))
                    {
                        portRec = (chartPortfolioCompare[marketCompareDates[0].length-2]-chartPortfolioCompare[marketCompareDates[0].length-9]);
                    }
                    var temp;
                    if(Math.abs(portRec-marketRec>2))
                    {
                        temp = " <b>Significantly</b>";
                    }
                    else
                    {
                        if(Math.abs(portRec-marketRec>1))
                        {
                            temp = "<b>Moderately</b>";       
                        }
                        else
                        {
                            temp="<b>Marginally</b>";         
                        }
                    }
                    //                    alert("Portfolio Return is "+portRec);
                    var cnt = "<h4 style='color:white;background:#0b4980;padding: 10px;text-align:center'>Comparison Returns of Portfolio and SPY</h4>";
                    cnt +=" \u2022 The Portfolio ";
                    cnt += portRec<0?"<span style='color:red;'><b>Loss</b></span>":"<span style='color:green;'><b>Gain</b></span>";
                    cnt +=" is  "+portRec.toFixed(2)+"%  While the market ";
                    cnt += marketRec<0?"<span style='color:red;'><b>Loss</b></span>":"<span style='color:green;'><b>Gain</b></span>";
                    cnt += " is "+marketRec.toFixed(2)+" for the week. "
                    cnt += "&nbsp; <br/>  \u2022 The portfolio returns is ";
                    cnt += temp;
                    cnt += (marketRec-portRec)>0?" <span style='color:red;'><b> Lower </b></span>":"<span style='color:green;'><b> Higher </b></span> ";
                    cnt += "(by "+(Math.abs(marketRec)-Math.abs(portRec)).toFixed(2)+ ") than the Market Returns.";
                    $("#comparePortfolioSummary").html(cnt);
                    //                    removeMaskEffect();
                }catch(e)
                {
                    alert("DrawChart Ticker Jsp \n"+e);
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
    <!--    inlcudes all Html Tags-->
    <body>
        <!--        <h4 class="heading">Portfolio Positions.</h4>-->

        <table id="totalSummaryTab" class="formFields" width="100%" align="left">
            <thead>
                <tr align="center">
                    <th>Total Market Value</th>
                    <th>Day Change</th>
                    <th></th>
                    <!--                    <th>Comparison</th>-->
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border-right: 1px solid grey">
                        0.0
                    </td>
                    <td style="border-right: 1px solid grey">
                        0.0
                    </td>
                    <td width="70%">
                        <table class="formFields">
                            <tr>
                                <td><input type="text" class="symbolLookup" name="addTickerText" value="Search fund" style="color:#888;"/></td>
                                <td>
                                    <button class="myButton" name="addTickerBtn">Add To My Portfolio</button>
                                    <span align="left">  Compare AceEngineer Benchmark is : <input type="checkbox" name="benchMark"  style="width:15px;" />SPY </span>
                                </td>
                            </tr>
                        </table>  
                    </td>
                </tr>
            </tbody>
        </table>
        <div id="tempTickerDiv1">  
            <hr/> 
            <table id="comparisonTable" style="display: none;" width="100%">
                <tbody>
                    <tr>
                        <td>
                            <div id="comparisonChartDiv" style="width: 600px; height: 300px;">
                            </div>
                        </td>
                        <td valign="top" id="comparePortfolioSummary">
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="userTickersSummary">
        </div>
        <div id="ResilienceNote"></div>   
        <table width="100%">
            <tr>
                <td valign="top" width="40%">
                    <div id="tempTickerDiv2">
                        <table class="myTable reportTable border10" align="center" id="watchList">
                            <caption>Tickers Watch List</caption>
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <input type="text" class="symbolLookup" name="addTickerTextWatch" value="Search fund" style="color:#888;"/>
                                        <button class="myButton" name="addToWatchList">Add To Watch List</button>                           
                                    </th>
                                </tr>
                                <tr>
                                    <th>FundName</th>
                                    <th>Performance</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </td>
                <td align="left" valign="top" width="60%">
                    <div id="tempTickerDiv3">
                        <table class="myTableForex reportTable border10" align="center" id="forexList">
                            <caption>Forex List</caption>
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <div  class="side-by-side clearfix">
                                            <select style="color: red;" data-placeholder="Choose From Currency..." id="ToCurTicker" class="fromchoose" tabindex="10">
                                                <option selected="selected" value="default"></option> 
                                                <option value="USD">US Dollar</option> 
                                                <option value="EUR">Euro</option> 
                                                <option value="GBP">British Pound</option> 
                                                <option value="INR">Indian Rupee</option> 
                                                <option value="AUD">Australian Dollar</option> 
                                                <option value="CAD">Canadian Dollar</option> 
                                                <option value="AED">Emirati Dirham</option> 
                                                <option value="CHF">Swiss Franc</option> 
                                                <option value="MYR">Malaysian Ringgit</option> 
                                                <option value="CNY">Chinese Yuan Renminbi</option> 
                                                <option value="THB">Thai Baht</option> 
                                                <option value="NZD">New Zealand Dollar</option> 
                                                <option value="JPY">Japanese Yen</option> 
                                                <option value="PHP">Philippine Peso</option> 
                                                <option value="SGD">Singapore Dollar</option> 
                                                <option value="SAR">Saudi Arabian Riyal</option> 
                                                <option value="MXN">Mexican Peso</option> 
                                                <option value="SEK">Swedish Krona</option> 
                                                <option value="ZAR">South African Rand</option> 
                                                <option value="HKD">Hong Kong Dollar</option> 
                                                <option value="HUF">Hungarian Forint</option> 
                                                <option value="TRY">Turkish Lira</option> 
                                                <option value="BRL">Brazilian Real</option> 
                                                <option value="IDR">Indonesian Rupiah</option> 
                                                <option value="NOK">Norwegian Krone</option> 
                                                <option value="DKK">Danish Krone</option> 
                                                <option value="PKR">Pakistani Rupee</option> 
                                                <option value="QAR">Qatari Riyal</option> 
                                                <option value="OMR">Omani Riyal</option> 
                                                <option value="KWD">Kuwaiti Dinar</option> 
                                                <option value="EGP">Egyptian Pound</option> 
                                                <option value="COP">Colombian Peso</option> 
                                                <option value="KRW">South Korean Won</option> 
                                                <option value="ARS">Argentine Peso</option> 
                                                <option value="CLP">Chilean Peso</option> 
                                                <option value="PLN">Polish Zloty</option> 
                                                <option value="RUB">Russian Ruble</option> 
                                                <option value="CZK">Czech Koruna</option> 
                                                <option value="ILS">Israeli Shekel</option> 
                                                <option value="LKR">Sri Lankan Rupee</option> 
                                                <option value="MAD">Moroccan Dirham</option> 
                                                <option value="TWD">Taiwan New Dollar</option> 
                                                <option value="NGN">Nigerian Naira</option> 
                                                <option value="BHD">Bahraini Dinar</option> 
                                                <option value="VND">Vietnamese Dong</option> 
                                                <option value="BDT">Bangladeshi Taka</option> 
                                                <option value="KES">Kenyan Shilling</option> 
                                                <option value="IQD">Irqi Dinar</option> 
                                                <option value="XOF">CFA Franc</option> 
                                                <option value="JOD">Jordanian Dinar</option> 
                                                <option value="GHS">Ghanaian Cedi</option> 
                                                <option value="TND">Tunisian Dinar</option> 
                                                <option value="RON">Romanian New Leu</option> 
                                                <option value="PEN">Peruvian Nuevo Sol</option> 
                                                <option value="BGN">Bulgarian Lev</option> 
                                                <option value="XAF">Central Aferican</option> 
                                                <option value="FJD">Fijian Dollar</option> 
                                                <option value="HRK">Croatian Kuna</option> 
                                                <option value="ISK">Icelandic Krona</option> 
                                                <option value="DOP">Dominican Peso</option> 
                                                <option value="MUR">Mauritian Rupee</option> 
                                                <option value="NPR">Nepalese Rupee</option> 
                                                <option value="DZD">Algerian Dinar</option> 
                                                <option value="UAH">Ukrainian Hryvna</option> 
                                                <option value="XPF">CFP Franc</option> 
                                                <option value="CRC">Costa Rican Colon</option> 
                                                <option value="JMD">Jamaican Dollar</option> 
                                                <option value="AZN">Azerbaijani New Manat</option> 
                                                <option value="BAM">Bosnian Convertible Marka</option> 
                                                <option value="IRR">Iranian Rail</option> 
                                            </select>
                                            <!--                        </div>
                                                                    <div class="side-by-side clearfix">-->
                                            <select data-placeholder="Choose To Currency..." id="FromCurTicker" class="tochoose" tabindex="10">
                                                <option value="default"></option> 
                                                <option value="USD">US Dollar</option> 
                                                <option value="EUR">Euro</option> 
                                                <option value="GBP">British Pound</option> 
                                                <option value="INR">Indian Rupee</option> 
                                                <option value="AUD">Australian Dollar</option> 
                                                <option value="CAD">Canadian Dollar</option> 
                                                <option value="AED">Emirati Dirham</option> 
                                                <option value="CHF">Swiss Franc</option> 
                                                <option value="MYR">Malaysian Ringgit</option> 
                                                <option value="CNY">Chinese Yuan Renminbi</option> 
                                                <option value="THB">Thai Baht</option> 
                                                <option value="NZD">New Zealand Dollar</option> 
                                                <option value="JPY">Japanese Yen</option> 
                                                <option value="PHP">Philippine Peso</option> 
                                                <option value="SGD">Singapore Dollar</option> 
                                                <option value="SAR">Saudi Arabian Riyal</option> 
                                                <option value="MXN">Mexican Peso</option> 
                                                <option value="SEK">Swedish Krona</option> 
                                                <option value="ZAR">South African Rand</option> 
                                                <option value="HKD">Hong Kong Dollar</option> 
                                                <option value="HUF">Hungarian Forint</option> 
                                                <option value="TRY">Turkish Lira</option> 
                                                <option value="BRL">Brazilian Real</option> 
                                                <option value="IDR">Indonesian Rupiah</option> 
                                                <option value="NOK">Norwegian Krone</option> 
                                                <option value="DKK">Danish Krone</option> 
                                                <option value="PKR">Pakistani Rupee</option> 
                                                <option value="QAR">Qatari Riyal</option> 
                                                <option value="OMR">Omani Riyal</option> 
                                                <option value="KWD">Kuwaiti Dinar</option> 
                                                <option value="EGP">Egyptian Pound</option> 
                                                <option value="COP">Colombian Peso</option> 
                                                <option value="KRW">South Korean Won</option> 
                                                <option value="ARS">Argentine Peso</option> 
                                                <option value="CLP">Chilean Peso</option> 
                                                <option value="PLN">Polish Zloty</option> 
                                                <option value="RUB">Russian Ruble</option> 
                                                <option value="CZK">Czech Koruna</option> 
                                                <option value="ILS">Israeli Shekel</option> 
                                                <option value="LKR">Sri Lankan Rupee</option> 
                                                <option value="MAD">Moroccan Dirham</option> 
                                                <option value="TWD">Taiwan New Dollar</option> 
                                                <option value="NGN">Nigerian Naira</option> 
                                                <option value="BHD">Bahraini Dinar</option> 
                                                <option value="VND">Vietnamese Dong</option> 
                                                <option value="BDT">Bangladeshi Taka</option> 
                                                <option value="KES">Kenyan Shilling</option> 
                                                <option value="IQD">Irqi Dinar</option> 
                                                <option value="XOF">CFA Franc</option> 
                                                <option value="JOD">Jordanian Dinar</option> 
                                                <option value="GHS">Ghanaian Cedi</option> 
                                                <option value="TND">Tunisian Dinar</option> 
                                                <option value="RON">Romanian New Leu</option> 
                                                <option value="PEN">Peruvian Nuevo Sol</option> 
                                                <option value="BGN">Bulgarian Lev</option> 
                                                <option value="XAF">Central Aferican</option> 
                                                <option value="FJD">Fijian Dollar</option> 
                                                <option value="HRK">Croatian Kuna</option> 
                                                <option value="ISK">Icelandic Krona</option> 
                                                <option value="DOP">Dominican Peso</option> 
                                                <option value="MUR">Mauritian Rupee</option> 
                                                <option value="NPR">Nepalese Rupee</option> 
                                                <option value="DZD">Algerian Dinar</option> 
                                                <option value="UAH">Ukrainian Hryvna</option> 
                                                <option value="XPF">CFP Franc</option> 
                                                <option value="CRC">Costa Rican Colon</option> 
                                                <option value="JMD">Jamaican Dollar</option> 
                                                <option value="AZN">Azerbaijani New Manat</option> 
                                                <option value="BAM">Bosnian Convertible Marka</option> 
                                                <option value="IRR">Iranian Rail</option> 
                                            </select>

                                            <button class="myButton"  id="AddForexPortfolio">Add To Portfolio</button>    
                                        </div>
                                    </th>
                                </tr>
                                <tr>
                                    <th>Currency Name</th>
                                    <th>Performance</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

        <table width="100%">
            <tr>
                <td valign="top" colspan="2" >
                    <table class="myTable reportTable border10" id="overallSummary">
                        <caption>Summary table</caption>
                        <thead>
                            <tr>
                                <th>Fund symbol</th>
                                <th>Category</th>
                                <th>% Contribution</th>
                                <th>Basis</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table> 
                </td>
                <!--            </tr>
                        </table>-->
                <td valign="top">
                    <span class="myButton" id="summaryDetailsBtn">Show Summary Details</span>
                    <a href="" class="myButton" target="_blank" id="pdfLink">Download as PDF</a>    <span id="scheduleCPR" style="display: none">&nbsp;&nbsp;&nbsp;&nbsp; Scheduling CPR : <select type="checkbox" checked="true"  name="scheduling CPR"><option>None</option> <option selected="true">Weekly</option> <option>15 Days</option></select></span>
                </td>
            </tr>
        </table>
        <div id="summaryHiddenDiv">
            <div>            
                <table id="resilienceFactorTable" class="myTable border10 reportTable" align="center">
                    <caption>Fund analysis summary</caption>
                    <thead>                       
                        <tr>
                            <th></th>
                            <th colspan="6" style="padding:4px;">
                                Annual returns for last
                            </th>
                            <th colspan="4"></th>
                        </tr>
                        <tr>
                            <th>Ticker</th>
                            <th>1 Year</th>
                            <th>2 Years</th>
                            <th>3 Years</th>
                            <th>5 Years</th>
                            <th>7 Years</th>
                            <th>10 Years</th>
                            <th>Average Pull Back</th>
                            <th>Average Bounce back</th>                            
                            <th>Morning Stars</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <div>            
                <table id="fundSummaryTable" class="myTable border10 reportTable">
                    <caption>Fund summary</caption>
                    <thead>                        
                        <tr>
                            <th>Fund Name</th>
                            <th>Category</th>
                            <th>Manager</th>
                            <th>Inception Date</th>
                            <th>Market Capital</th>
                            <th>Expense Ratio</th>
                            <th>Stability Beta</th>
                            <th>Extreme Beta</th>
                            <th>Morning Stars</th>
                            <th>AceEngineer Recommend</th>                        
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="userPortfolio_DB_Data" style="display: none">
            <logic:present name="tickersBean">
                <bean:write name="tickersBean" />
            </logic:present>
        </div>
    </body>
</html>