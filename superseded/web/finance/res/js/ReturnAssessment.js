/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 *$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 * This Class is Responsible for handling All The Return Assesssment Events
 * and The Controls charts etc...... work
 * $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 */
var ReturnAssessmentHandler = {
    
    // This Variable used to Show the Resiliance Factor for the Current Ticker 
    generateResilianeFactor: false,
    
    
    mainDiv : {},
    /** This Should Be Created as Crossbrowser Element */
    xml : new XMLHttpRequest(),
    /** This Varible Holds the Response Content That loaded from through AJAX */
    responseData : null,
    /** This Object Holds the Dividend Data for THe Selected Tasks */
    dividendData : null,
    /** This Varible Holds The Google Chart Table Data fo Annual Return */
    chartDataAR : null,
    /** This Variable holds the Clone Object of the Chart Data Used for Making Any Modifications */
    cloneData : null,
    /** This Object Holds the DataView of the Annual Return Chart */
    chartDataARView : null,
    /** This Object holds the Chart data for Adsolute Date */
    chartDataAD : null,
    chartDataADView : null,
    /** This object holds the Chart data for Return to Date */
    chartDataRD : null,
    chartDataRDView : null,
    /** This object holds the chart data for Year to Year */
    chartDataYY : null,
    chartDataYYView : null,
    /** This Object Holds The Google Chart Object */
    chartAR: null,
    chartAD : null,
    chartRD : null,
    chartYY : null,
    /** This Object Holds The New Ticker Add Tec box */
    newTickerText : null,
    /** This Object Hodsl the Compare Ticker Check boxes */
    compareTickers : [],
    /** This Object holds the Divisoin of Compare ticker */
    compareTickerDiv : null,
    /** This Division Holds the Control Division Object */
    controlsDiv : null,
    /** This Object Used to Mask the Controls Div */
    maskDiv : null,
    /** This Holds The Add Ticker button */
    addTickerBtn : null,
    /** This Object Holds the Relod Button */
    reloadBtn : null,
    /** This Variable tell whether the graph is stacked or not */
    stackMode : false,
    /** This variable holds the Divind mode this tells whether the Dividend should be 
     *Re-Investment or Exclude */
    dividendMode : true,
    /** This Object Holds the Starting Data */
    startDate : null,
    /** This ObjectHolds teh Ending Date */
    endDate : null,
    /** This Object holds the Previous Start Date */
    prevStartDate : null,
    /** This Object holds the Previous End Date */
    prevEndDate : null,
    /** this array object holds the array of tickers currently showing in the Graph */
    currentTickersQueue : [],
    /** This Variable holds the Previously Computed Annual Return Value */
    annualReturnCompVal : [],
    /** This Object Tells whether the User chenge the Date Explicitly or not */
    isDateChanged :false,
    benchMark : null,
    /** This Variable tells whether the Tickers should be store in DB or NOt
     * this is useful for User Portfolio not for Indenpendent Portfolio 
     * */
    storeInDB : false,
    
    startDates : [],
    
    sdC : 0,
                            
                                            
    /**
     * This Method is USed TO Initiliaze THe Retrun Assessemnt Fileds And Charts By Default
     */
    initilize: function()
    {
        var RA = this;        
        this.mainDiv = document.getElementById('returnAssessmentDiv');
        this.newTickerText = $(this.mainDiv).find('#raNewTicker');
        // Restricting the Input box to allowing the special Characters
        Input.excludeCharacters(this.newTickerText, "`~!@#$%&*()-=+", function(){});
        
        this.compareTickers = $(this.mainDiv).find('input[name="raTickerChk"]');
        this.compareTickerDiv = document.getElementById('raTickerCompareDiv');
        this.controlsDiv = document.getElementById('controlDivRA');
        this.benchMark = $(this.mainDiv).find('#raBenchMark')[0];        
             
        this.addTickerBtn = document.getElementById('raAddTickerBtn');
        this.reloadBtn = document.getElementById('relodBtnRA');
        this.sdC = 0;
        this.startDates = [];
        // Creating Mask Div
        this.maskDiv = document.createElement('div');
        $(this.controlsDiv).append(this.maskDiv);
        
        
        $('input[name="raDividend"]').each(function(ind)
        {
            $(this).change(function()
            {
                $($('input[name="raDividend"]').parent('label')).css({
                    'color':'black'
                });
                if(ind == 1)
                {
                    if(this.checked){
                        $($(this).parent('label')).css({
                            'color':'red'
                        });
                    }
                }                
                
                RA.dividendMode = ind==0?true:false;
                
                if(RA.isDateChanged){
                    RA.updateChartAsPerDate($('#raStartDate').val(), $('#raEndDate').val(), ind==0?true:false);
                }
                else{
                    RA.updateChartAsPerDate(null, null, ind==0?true:false);
                }
                    
            //RA.dividendMode = ind==0?true:false;
            });
        });
        
        // Loading The Chart Mode
        // normal mode or stacked Mode
        $('img[name="chartModeRA"]').each(function(ind){
            
            $(this).css({
                'border':'2px ridge gray',
                'cursor':'pointer'
            });
            
            $(this).click(function()
            {
                $('img[name="chartModeRA"]').fadeTo(1,1.0);
                $(this).fadeTo(1000,0.2);
                
                RA.stackMode = ind==0?false:true;
                RA.drawChart(RA.chartAR,RA.chartDataAR,"Comparison of Annual Returns","Return (%)","Year");
                RA.drawChart(RA.chartAD,RA.chartDataAD,"Comparison of Absolute Returns","Amount (USD)","Year");
                RA.drawChart(RA.chartRD,RA.chartDataRD,"Comparison of Return to Date","Return (%)","Year");
                RA.drawChart(RA.chartYY,RA.chartDataYY,"Comparison of Year on Year","Return (%)","");            
            });
            
            $(this).hover(function(){
                $(this).css({
                    'border':'2px grove blue'
                });
            },function(){
                $(this).css({
                    'border':'2px ridge gray'
                });
            });
        });
        
        
        //Adding Change Listener to the StartDate Textbox
        $('#raStartDate').bind("change",function()
        {
            RA.isDateChanged = true;
            RA.prevStartDate = RA.startDate;
            RA.updateChartAsPerDate($('#raStartDate').val(),$('#raEndDate').val(),RA.dividendMode);
        });
        
        // Handling CHange Listener to the EndDate Textbox
        $('#raEndDate').bind("change",function(){
            RA.prevEndDate = RA.endDate;
            RA.updateChartAsPerDate($('#raStartDate').val(),$('#raEndDate').val());
        });
        
        //alert(new Date().toString("dd-MMM-yyyy"));
        $('#raEndDate').val(new Date().toString("yyyy-MM-dd"));
        
        // Adding EnterKey Listener to add ticker text this will add ticker
        // when user pressees the enter Key
        $(this.newTickerText).keydown(function(evt){
            if(evt.keyCode == 13)
            {
                
                var tName = $(RA.newTickerText).val();
                addTicker(tName);
            }
        });
                                
        //alert(this.chartDataAR.getNumberOfColumns());
        // Adding Click Listener to Button
        $(this.addTickerBtn).click(function(){
            
            var tName = $(RA.newTickerText).val();
            addTicker(tName);
        });
        
        /**
         * This Method Usd to add a new Ticker
         */
        function addTicker(ticker)
        {
            var tName = ticker;
            if(tName.toLowerCase() == 'spy'){
                $(RA.newTickerText).val("");
                alert("SPY is Bench Mark. You Can't Add it Again");                
                return;
            }
            RA.addNewTickerToCompare(tName,false);            
            FundamentalIndicatorHandler.addNewTickerToCompare(tName, true,function(){
                
                });
        }
        
        $(this.reloadBtn).click(function()
        {
            //alert('Reloading Chart');
            RA.reloadChart();
        });
        
        $('#raResetDatesBtn').click(function(){
            $('#raStartDate').val("Choose Date.....");
            $('#raEndDate').val(new Date().toString("yyyy-MM-dd")).trigger("change");
        });
                                
        // Adding Check box Listener to The Existing Check Boxes
        $(this.compareTickers).each(function(){
            RA.addCheckboxTickerListener(this);
        });                    
        
        google.load("visualization", "1", {
            packages:["corechart"]
        });        
        google.setOnLoadCallback(this.loadChart());
    },
            
    /**
     * This Method Loads Default When This Object is Created
     * This Block Should performs basic charting oerations like
     * loading Google Chart api and Drawing Default Chart
     */
    loadChart: function()
    {   
        var RA = ReturnAssessmentHandler;
        //alert('Google Chart Libraries Loaded');
        var ticker = $('#tickerName').val();
        //alert("Ticker : "+ticker);
        ticker = (ticker==undefined||ticker.length<1)?"SPY":ticker;
        
        // Applying mask
        RA.applyMask(RA.controlsDiv,1);
        this.getReturnAssessmentDataForTicker(ticker, $('#raStartDate').val(), $('#raEndDate').val(),myHandler);                    
                    
        /*
         * This Method handles the Return Assessment Request
         * The Charting Process Should be done Here
         * years,AD,AR,RD,YY
         */
        function myHandler(data)
        {
            
            $('#raStartDate').val(RA.startDate.toString("yyyy-MM-dd"));
            
            // adding the Current Ticker to the Queue
            RA.currentTickersQueue.push(ticker);            
            // Creating Data Table Objects
            RA.chartDataAR = new google.visualization.DataTable();
            RA.chartDataAD = new google.visualization.DataTable();
            RA.chartDataRD = new google.visualization.DataTable();
            RA.chartDataYY = new google.visualization.DataTable();            
                        
            // adding Default Columns
            RA.chartDataAR.addColumn('string', 'Year');
            RA.chartDataAR.addColumn('number', ticker);
            RA.chartDataAD.addColumn('string', 'Year');
            RA.chartDataAD.addColumn('number', ticker);
            RA.chartDataRD.addColumn('string', 'Year');
            RA.chartDataRD.addColumn('number', ticker);
            RA.chartDataYY.addColumn('string', 'Year');
            RA.chartDataYY.addColumn('number', ticker);
            
            var years = data[0];
            var AR = data[1];
            var AD = data[2];
            var RD = data[3];
            var YY = data[4];
            
            //alert(YY.length);
            var tableDataAR = [];
            var tableDataAD = [];
            var tableDataRD = [];
            var tableDataYY = [];
            
            var sYear = "";
            var actualStartYear = 0;            
            
            try
            {
                sYear = (Date.parse($('#raStartDate').val())).getFullYear();
                actualStartYear = parseInt(years[years.length-1]) - sYear;            
            }catch(e){
                sYear = '';
                actualStartYear = 0;
            }            
            //alert(sYear);            
            
            //alert("Actual Start Year index is :"+actualStartYear);
            for(var i=0,j=0;j<AR.length;i++)
            {
                if( i >= actualStartYear )
                {                                
                    //alert(AR[i]+":"+AD[i]+":"+RD[i]+":"+YY[i]);
                    tableDataAR[i] = [''+years[years.length-1-j],AR[j]];
                    tableDataAD[i] = [''+years[years.length-1-j],AD[j]];
                    tableDataRD[i] = [''+years[years.length-1-j],RD[j]];
                    tableDataYY[i] = [''+years[years.length-1-j],YY[j]];                    
                    j++;
                }
                else
                {
                    //alert('No data for This Year');
                    tableDataAR[i] = [''+sYear,NaN];
                    tableDataAD[i] = [''+sYear,NaN];
                    tableDataRD[i] = [''+sYear,NaN];
                    tableDataYY[i] = [''+sYear,NaN];                    
                    sYear++;
                }                
            }
            
            //alert('Data Loaded');
            RA.chartDataAR.addRows(tableDataAR);
            RA.chartDataAD.addRows(tableDataAD);
            RA.chartDataRD.addRows(tableDataRD);
            RA.chartDataYY.addRows(tableDataYY);                        
            
            
                    
            // Creating Google Chart Objects
            RA.chartAR = new google.visualization.ColumnChart(document.getElementById('chartDivAR'));
            RA.chartAD = new google.visualization.ColumnChart(document.getElementById('chartDivAD'));
            RA.chartRD = new google.visualization.ColumnChart(document.getElementById('chartDivRD'));
            RA.chartYY = new google.visualization.ColumnChart(document.getElementById('chartDivYY'));            
                        
            //now Drawing Charts
            RA.drawChart(RA.chartAR,RA.chartDataAR,"Comparison of Annual Returns","Return (%)","Year");
            RA.drawChart(RA.chartAD,RA.chartDataAD,"Comparison of Absolute Returns","Amount (USD)","Year");
            RA.drawChart(RA.chartRD,RA.chartDataRD,"Comparison of Return to Date","Return (%)","Year");
            RA.drawChart(RA.chartYY,RA.chartDataYY,"Comparison of Year on Year","Return (%)","Year");
            
            // Removing The Mask
            RA.applyMask(RA.controlsDiv,0);
            
            // After Base Chart Draqwn Then Fill the Date fields with The Current Stock 
            //Origin Dtae
            //            var d1 = new Date(RA.startDate);
            //            var d2 = new Date(RA.endDate);
            //            $('#raStartDate').val(d2.getDay()+"-"+StockCore.months[d2.getMonth()]+"-"+d2.getFullYear());
            //            $('#raEndDate').val(d1.getDay()+"-"+StockCore.months[d1.getMonth()]+"-"+d1.getFullYear());
            
            // Generating Chart Summary
            //RA.generateChartSummary(RA.chartDataAR,null);
            // Generating Chart Summary
            RA.generateChartSummary(RA.chartDataYY,$('#chartDivYY'),'Year on Year','YY');
            RA.generateChartSummary(RA.chartDataAR,$('#chartDivAR'),'Annual Return','AR');
            RA.generateChartSummary(RA.chartDataAD,$('#chartDivAD'),'Absolute Return','AD',RA.annualReturnCompVal);                
            RA.generateChartSummary(RA.chartDataRD,$('#chartDivRD'),'Return to Date','RD',RA.annualReturnCompVal);
        }
    },
    
    /**
     * This MEthod Is USed to Chart
     */
    reloadChart : function()    
    {
        var RA = ReturnAssessmentHandler;
        // Loading Base Chart
        
        //this.loadChart();
        //return;
        
        var sDate = $('#raStartDate').val();
        var eDate = $('#raEndDate').val();                
        //var sDate = "";
        //var eDate = "";
        
        //alert(sDate+" to "+eDate);
        var ticker = $('#tickerName').val().toUpperCase();
        
        $(this.newTickerText).val(ticker);
        this.addNewTickerToCompare();
        
        if(ticker.length < 1)
        {
            alert("Please Enter Proper Ticker name");
            return;
        }
        
        if(RA.isTickerAlreadyExistInDataTable(ticker))
        {
            alert('Ticker Already Exist in the Chart');
            return;
        }
        
        
        
        RA.applyMask(RA.controlsDiv,1);
        /**
         * This Method Handles the Data Retrived from the AJAX Call
         */                
        function dataHandler(data)
        {   
            // if the data is null then skip
            if(data == null)
            {
                RA.applyMask(RA.controlsDiv,0);
                return;
            }
            
            RA.currentTickersQueue.removeElement(RA.currentTickersQueue[0]);
            RA.currentTickersQueue.push(ticker);
            //alert(RA.currentTickersQueue);
            
            var years = data[0];
            var AR = data[1];
            var AD = data[2];
            var RD = data[3];
            var YY = data[4];            
            
            // Removing The First Columns
            RA.chartDataAR.removeColumn(1);
            RA.chartDataAD.removeColumn(1);
            RA.chartDataRD.removeColumn(1);
            RA.chartDataYY.removeColumn(1);
            
            RA.chartDataAR = RA.updateChartData(RA.chartDataAR, ticker, years, AR,1);
            RA.chartDataAD = RA.updateChartData(RA.chartDataAD, ticker, years, AD,1);
            RA.chartDataRD = RA.updateChartData(RA.chartDataRD, ticker, years, RD,1);
            RA.chartDataYY = RA.updateChartData(RA.chartDataYY, ticker, years, YY,1);
            //alert('after');
            //RA.chartDataAR = RA.cloneData;                                
            RA.drawChart(RA.chartAR,RA.chartDataAR,"Comparison of Annul Returns","Return (%)","Year");
            RA.drawChart(RA.chartAD,RA.chartDataAD,"Comparison of Absolute Returns","Amount (USD)","Year");
            RA.drawChart(RA.chartRD,RA.chartDataRD,"Comparison of Return to Date","Return (%)","Year");
            RA.drawChart(RA.chartYY,RA.chartDataYY,"Comparison of Year on Year","Return (%)","Year");
            RA.applyMask(RA.controlsDiv,0);            
            
            // Generating Chart Summary
            RA.generateChartSummary(RA.chartDataYY,$('#chartDivYY'),'Year on Year','YY');
            RA.generateChartSummary(RA.chartDataAR,$('#chartDivAR'),'Annual Return','AR');
            RA.generateChartSummary(RA.chartDataAD,$('#chartDivAD'),'Absolute Return','AD',RA.annualReturnCompVal);                
            RA.generateChartSummary(RA.chartDataRD,$('#chartDivRD'),'Return to Date','RD',RA.annualReturnCompVal);
            
        }
        RA.getReturnAssessmentDataForTicker(ticker, sDate, eDate, dataHandler);
    },
    
    /**
     * This MEthod is Used to apply the Mask
     * if state is 1 then it applys the mask
     * if state is 0 then it removes the mask
     * tha main use of this mask is to stop the user changes when the data loading
     */
    applyMask: function(pDiv,state)
    {        
        if(state == 1)
        {
            var maskDiv = document.createElement('div');            
            //alert($(this.controlsDiv).offset().left);
            $(pDiv).append(maskDiv)
            $(maskDiv).css({
                'position':'absolute',
                width: $(pDiv).width()+'px',
                height: $(pDiv).height()+'px',
                align:'center',
                verticalAlign: 'middle',
                display:'block',                    
                fontSize: '26px',
                color: 'white',
                '-webkit-border-radius':'10px',
                '-moz-border-radius':'10px',
                background: '#0b6998'
            //'background-image' :"url('res/images/overlay_bg.jpg')"
            });           
            
            
            $(maskDiv).addClass('maskDiv');
            $(maskDiv).html("<table style='width:100%;height:100%'><tr><td style='vertical-aling:middle;text-align:center'><img src='res/images/loading.gif' /></td></tr></table>");
            $(maskDiv).offset($(pDiv).offset());
            $(maskDiv).fadeTo(0, 0.9, null);
            $(maskDiv).show();
        //$(this.controlsDiv).find('*').each(function(){
        //    this.disabled = true;
        //});            
        }
        else
        {
            //$(this.controlsDiv).find('*').each(function(){
            //    this.disabled = false;
            //});
            $(pDiv).find('.maskDiv').remove();
        }
    },
                
    /**
     * This Method Draws the Chart based upon the Given Inputs And Divisions
     */
    drawChart: function(pChart,pChartData,pTitle,pXtitle,pYtitle)
    {
        var dataView;
        try
        {
            var rows = pChartData.getNumberOfRows();
            var cols = pChartData.getNumberOfColumns();
            //alert("Noof Rows : "+rows+"  No of Cols :"+cols);
            var sRowInd = 0;
            var eRowInd = rows;
            var temp = false;            
            for(var i=0;i<rows;i++)
            {
                temp = true;                
                for(var j=1;j<cols;j++)
                {
                    if(pChartData.getValue(i,j) != null)
                        temp = false;
                    
                }                
                if(temp)
                {
                    sRowInd++;
                //alert('Found At : '+i);
                //break;
                }
            }            
            //alert("Rows are : "+rows+" : Cols : "+cols);
            dataView = new google.visualization.DataView(pChartData);            
            dataView.setRows(sRowInd,eRowInd-1);
        }
        catch(e){
            alert("Error While Drawing The Chart : "+e);
        }
        //for(i=0)
        
        //alert('drawing Chart :'+pChart);
        pChart.draw(dataView, {
            width: 580,
            height: 300,
            animation:{
                duration: 2000,
                easing: 'inAndOut'
            },                    
            //title: pTitle,
            vAxis: {
                title: pXtitle                
            },
            hAxis: {
                slantedText :true,
                title: pYtitle                
            },
            backgroundColor: 'white',
            chartArea:{
                //left:60,
                top:20,                
                width:"75%",
                height:"70%"
            },
            isStacked: this.stackMode,
            legend: 'bottom'
        });        
    },
                
    /**
     * This method Loads The Return Assessment Data Like
     * Annual Return to Date
     * AD
     * Year on Year
     * et..... data of the Specified Ticker Name (through AJAX)
     * function Handler is the Chart Handler this Function Should handle The Charting
     */ 
    getReturnAssessmentDataForTicker: function(pTicker,pStartDate,pEndDate,functionHandler,includeDividend)
    {
        // Escaping Special Characters
        pTicker = escape(pTicker);
        var RA = ReturnAssessmentHandler;
        
        if(pStartDate!=null && pStartDate.length>1 && pEndDate!=null && pEndDate.length>1)
        {
            try{
                if(Date.parse(pStartDate)>=Date.parse(pEndDate)){
                    RA.applyMask($('#chartDivAR'), 0);
                    RA.applyMask($('#chartDivAD'), 0);
                    RA.applyMask($('#chartDivRD'), 0);
                    RA.applyMask($('#chartDivYY'), 0);
                    //alert("Please Make Sure The Date Shoould Be Valid");
                    return;
                }
            }catch(e){
            //alert("Error Getting Data : "+e);
            }
        }
        
        //alert(pStartDate+"    "+pEndDate);
        // This Object holds the Dates of the Rates
        var dates = [];
        var tickerRates = [];
        
        //alert('function Called');
        if(pTicker==undefined || pTicker.length<1)
            pTicker = 'GOOG';
        // holding in local Object For Further Usage
        
                    
        var xmlObj = StockCore.makeXMLRequestObj();
        //alert(xmlObj);
                    
        //alert(pStartDate);
        var tokens1 = StockCore.splitDate(pStartDate);        
        //alert("Start Dat is :"+pStartDate);
        var tokens2 = StockCore.splitDate(pEndDate);
            
        // Query in format of startingMonth,staringDay,startingYear and endingMonth,endingDay,endingYear
        var query = "s="+pTicker+"&a="+tokens1[0]+"&b="+tokens1[1]+"&c="+tokens1[2]+"&d="+tokens2[0]+"&e="+tokens2[1]+"&f="+tokens2[2];
        //alert("Query is : "+query);
        
        /**
         * This Methods adds the Dividend Data to The Retrived Data Array
         */
        function appendDividendData(data)
        {
            var RA = ReturnAssessmentHandler;
            
            //alert('Dividend Data Append Here');
            var dXml = StockCore.makeXMLRequestObj();
            dXml.open('GET','historicalPrices.do?baseURL=http://ichart.finance.yahoo.com/table.csv?&'+query+"&g=v&ignore=.csv",true);
            dXml.onreadystatechange = function()
            {
                if(dXml.readyState==4 && dXml.status==200)
                {
                    //alert(dXml.responseText);
                    //$('#contentDiv').html(dXml.responseText);
                    // patrioning The Dividend Data By Year Wise
                    var dividendData = RA.partionDividendData(dXml.responseText);
                    var dividends = [];
                    
                                        
                    // Checking for whether there is any dividend data or not
                    var years = data[0];
                    var rates = data[1];
                    var divDates = data[2];
                    var dividend = 0;
                    
                    // By default Filling the Dividend Data with Zero's
                    
                    //alert(years);
                    //alert("Dividend Data Is :"+dividendData);
                    
                    if(dividendData != null)
                    {
                        var divYears = dividendData[0];
                        
                        var dDates = dividendData[0];
                        var dPrices = [];
                        for(var i=0;i<years.length;i++)
                            dividends[i] = 0;
                        
                        var ind = -1;
                        for(var i=0;i<dDates.length;i++)
                        {                               
                            ind = -1;
                            for(var j=0;j<dates.length;j++)
                            {
                                if(dDates[i]<=dates[j]){
                                    ind = j;
                                }
                            }
                            dPrices.push(tickerRates[ind]);                            
                        //dDates[i] = Date.parse(dDates[i]).toString("yyyy-MM-dd");
                        }
                        
                        var additionalShares = [];
                        var dividendYears = [];
                        
                        computeAdditionalShares();
                        
                        function computeAdditionalShares()
                        {
                            var divDates = dividendData[0];
                            var currYear = divDates[0].getFullYear();
                            divDates = divDates.removeNulls();
                            var dividend = 0;
                            var tabCnt = "<table border=1>";
                            tabCnt += currYear;
                            for(var i=0;i<divDates.length;i++)
                            {
                                try
                                {                                    
                                    if(currYear != divDates[i].getFullYear())
                                    {                                        
                                        additionalShares.push(dividend);
                                        dividendYears.push(currYear);
                                        dividend = 0;
                                        currYear = divDates[i].getFullYear();                                        
                                    }
                                    dividend += (dividendData[1][i]/dPrices[i]);
                                    tabCnt += "<tr><td>"+dividendData[1][i]+"</td></tr>";
                                //additionalShares.push(dividendData[1][i]/dPrices[i]);
                                    
                                }catch(e){
                                    alert(e);
                                }
                            }
                            additionalShares.push(dividend);
                            dividendYears.push(currYear);
                            
                            for(i=0;i<dividendYears.length;i++){
                                tabCnt += "<tr><td>"+dividendYears[i]+"</td><td>"+additionalShares[i]+"</td><tr>";
                            }
                            cnt += "</table>";
                        //$('#contentDiv').html(tabCnt);
                        }                        
                        
                        dDates = dDates.removeNulls();
                        var sYear = dDates[0].getFullYear();
                        var cnt = 0;
                        
                        for(i=0;i<dDates.length;i++)
                        {
                            //alert(cnt +"     "+dividendData[1][i]+"    "+dPrices[i]);
                            if(sYear != dDates[i].getFullYear()){
                                cnt++;
                                sYear = dDates[i].getFullYear();
                            }
                            dividends[cnt] += (dividendData[1][i]/dPrices[i]);
                        //alert(dividends[cnt])
                        }                        
                    }                    
                    
                    //for(i=0;i<dividends.length;i++)
                    //    alert("Dividend Data on "+years[i]+" is "+dividends[i]);
                    //alert("No of Rates Are :"+rates.length);                    
                    //alert("Dividend Years are :"+dividendYears);
                    // Now Calling Hander Function
                    try{
                        var calData;
                        if(dividendYears == undefined)
                            calData = RA.doComputations(years,rates,null,true);
                        else
                            calData = RA.doComputations(years,rates,[dividendYears,additionalShares],true);
                    }catch(e){
                        alert("Error While Coputing "+e); 
                    }
                    //alert(calData.length);
                    
                    // Computing Resiliance Factors
                    RA.computeResilianceFactor(dates,tickerRates, 5);
                    
                    functionHandler(calData,pTicker);
                    
                }
            }
            dXml.send(null);            
        }
        
        //alert("Ticker is "+pTicker);
        doAjax("http://ichart.finance.yahoo.com/table.csv?&"+query+"&g=d&ignore=.csv", "", function(data){
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
            // If there is no data then Return null
            if(csvData==null || csvData.length<2)
            {
                alert('There is no data exist for '+pTicker+' In the given date Range');
                functionHandler(null);
            }
                
            //alert(xmlObj.responseText);
            dates = getSpecifiedData(csvData, "date", "date");
            RA.startDate = dates[dates.length-2];
            tickerRates = getSpecifiedData(csvData, "close", "number");
            var partionedData = RA.partionData(csvData);
            var years = partionedData[0];
            var rates = partionedData[1];
            //alert("No of Years are :"+years.length);
            //document.getElementById('myDiv').innerHTML = years;
            //alert("No of Rates Are :"+rates.length);                
                
            //alert(dates[dates.length-2]);
            
                            
            var RD = [];
            var AR = [];
            var AD = [];
            var YY = [];
            // Computing  the Key Parameters for the Given Ticker
            var obj = RA.computeKeyParameters(years, rates);
            RD = obj.RD;
            AR = obj.AR;
            AD = obj.AD;
            YY = obj.YY;
            
            /*
            var yearOpenRate;
            var capital = 1000;
            var noOfYears = years.length;
            var noOfShares = capital/rates[noOfYears-1][rates[noOfYears-1].length-1];
            //alert('No of Shares :'+noOfShares);
                            
            for(i=years.length-1,j=0;i>=0;i--,j++)
            {
                yearOpenRate = rates[i][rates[i].length-1];
                //alert(years[i]+" Open Rate is :"+yearOpenRate);
                if(j==0)
                {
                    AR[j] = YY[j] = RD[j] = 0;
                    AD[j] = capital;
                }
                else
                {
                    RD[j] = ( (noOfShares*yearOpenRate-capital)/capital )*100;
                    //AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                    AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                    YY[j] = ( (noOfShares*yearOpenRate-AD[j-1])/AD[j-1]) * 100;
                    AD[j] = noOfShares*yearOpenRate;
                //alert(noOfShares+"   * "+yearOpenRate+"      ="+AD[j]);
                }
            }
            **/
            // Calling The Handler Function  To Process the Response Data
            //functionHandler([years,AR,AD,RD,YY]);
            // If Dividend Included then apend the dividend data
            // or else append the dividend data
            if(includeDividend)
            {
                appendDividendData([years,rates]);
            }                    
            else
            {
                RA.computeResilianceFactor(dates,tickerRates, 5);
                functionHandler(RA.doComputations(years, rates, [null,null], false),pTicker);
            }
        });
        
    /**
         * This Block Temporarly Blocked because performance Isseue
         * you can enable this if you found any bugs in the Abovew YQL Method
         *
        xmlObj.open('GET','historicalPrices.do?baseURL=http://ichart.finance.yahoo.com/table.csv?&'+query+"&g=d&ignore=.csv",true);
        xmlObj.onreadystatechange = function()
        {
            if(xmlObj.readyState==4 && xmlObj.status==200)
            {
                // If there is no data then Return null
                if(xmlObj.responseText==null || xmlObj.responseText.length<2)
                {
                    alert('There is no data exist for '+pTicker+' In the given date Range');
                    functionHandler(null);
                }
                
                //alert(xmlObj.responseText);
                dates = getSpecifiedData(xmlObj.responseText, "date", "date");
                RA.startDate = dates[dates.length-2];
                tickerRates = getSpecifiedData(xmlObj.responseText, "close", "number");
                var partionedData = RA.partionData(xmlObj.responseText);                
                var years = partionedData[0];
                var rates = partionedData[1];
                //alert("No of Years are :"+years.length);
                //document.getElementById('myDiv').innerHTML = years;
                //alert("No of Rates Are :"+rates.length);                
                
                //alert(dates[dates.length-2]);
                
                var RD = [];
                var AR = [];
                var AD = [];
                var YY = [];
                var yearOpenRate;
                var capital = 1000;
                var noOfYears = years.length;
                var noOfShares = capital/rates[noOfYears-1][rates[noOfYears-1].length-1];
                //alert('No of Shares :'+noOfShares);
                            
                for(i=years.length-1,j=0;i>=0;i--,j++)
                {
                    yearOpenRate = rates[i][rates[i].length-1];
                    //alert(years[i]+" Open Rate is :"+yearOpenRate);
                    if(j==0)
                    {
                        AR[j] = YY[j] = RD[j] = 0;
                        AD[j] = capital;
                    }
                    else
                    {
                        RD[j] = ( (noOfShares*yearOpenRate-capital)/capital )*100;
                        //AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                        AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                        YY[j] = ( (noOfShares*yearOpenRate-AD[j-1])/AD[j-1]) * 100;
                        AD[j] = noOfShares*yearOpenRate;
                    //alert(noOfShares+"   * "+yearOpenRate+"      ="+AD[j]);
                    }
                }                
                // Calling The Handler Function  To Process the Response Data
                //functionHandler([years,AR,AD,RD,YY]);
                // If Dividend Included then apend the dividend data
                // or else append the dividend data
                if(includeDividend)
                {
                    appendDividendData([years,rates]);
                }                    
                else
                {
                    RA.computeResilianceFactor(dates,tickerRates, 5);
                    functionHandler(RA.doComputations(years, rates, [null,null], false),pTicker);
                }                    
            // after retriving Historical Prices Then Retrive the Dividens Values
            // The Diviend Value Retrived is Given on One Share                
            }
        }
        
    // Sending AJAX Request
    //xmlObj.send(null);
        *
        *
        */
    },
    
    
    /**
     * This Method Used to compute the Key parameters for the ReturnAssessment 
     * Return to Data
     * Annual Return     
     * Absolute Return to Date
     * Yera on Year
     */
    computeKeyParameters: function(years,rates){
        //alert("Computing Key parameters");
        var RD = [];
        var AR = [];
        var AD = [];
        var YY = [];
        //alert("Rates Length is :"+rates);
        var yearOpenRate;
        var capital = 1000;
        var noOfYears = years.length;
        
        var noOfShares = capital/rates[noOfYears-1][rates[noOfYears-1].length-1];
        
        //alert('No of Shares :'+noOfShares);
                            
        for(var i=years.length-1,j=0;i>=0;i--,j++)
        {
            yearOpenRate = rates[i][rates[i].length-1];
            //alert(years[i]+" Open Rate is :"+yearOpenRate);
            if(j==0)
            {
                AR[j] = YY[j] = RD[j] = 0;
                AD[j] = capital;
            }
            else
            {
                RD[j] = ( (noOfShares*yearOpenRate-capital)/capital )*100;
                //AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;
                YY[j] = ( (noOfShares*yearOpenRate-AD[j-1])/AD[j-1]) * 100;
                AD[j] = noOfShares*yearOpenRate;
            //alert(noOfShares+"   * "+yearOpenRate+"      ="+AD[j]);
            }
        }
        return {
            AR:AR,
            RD:RD,
            YY:YY,
            AD:AD
        };
    },
    
    /**
     *This Method Performs The Computations Work in THe Return Assessment Data
     *Like Computing Annual Return to Date, AD ,RD, YY etc
     *@param years years
     *@param rates the Rates of the Stock
     *@param mode the mode tells whether the Dividend Should be Included or Not
     *@param dividendsData the Dividends Values
     *@return this method Return an array of Object
     *that holds years,AR,AD,RD,YY
     */
    doComputations: function(years,rates,dividendsData,mode)
    {
        //mode = !mode?true:mode;
        //mode = false;
        var RD = [];
        var AR = [];
        var AD = [];
        var YY = [];        
        var capital = 1000;
        var noOfYears = years.length;
        var yearOpenRate = rates[noOfYears-1][rates[noOfYears-1].length-1];
        var noOfShares = capital/yearOpenRate;
        
        
        if(dividendsData == null)
        {
            dividendsData = [];
            var td = [];
            var tr = [];
            for(var i=0;i<noOfYears;i++){
                td.push(0);
                tr.push(0);
            }
            dividendsData.push(td,tr);
        }
        
        var dividendYears = dividendsData[0];
        var dividends = dividendsData[1];
        
        
        var cnt = "<table border=1>";
        //cnt += "<tr><td>"+noOfShares+"</td><td>"+yearOpenRate+"</td></tr>";
        //alert('Rate is : '+rates[noOfYears-1][rates[noOfYears-1].length-1]);
        //alert('No of Shares :'+noOfShares);                            
        for(i=years.length-1,j=0;i>=0;i--,j++)
        {
            yearOpenRate = rates[i][rates[i].length-1];
            //alert('Year Open Rate :'+yearOpenRate);
            
            
            if(j==0)
            {
                AR[j] = YY[j] = RD[j] = 0;
                AD[j] = capital;
            }
            else
            {
                if(mode)
                {                    
                    var divInd = -1;
                    for(var l=0;l<dividendYears.length;l++)
                    {
                        if(years[i] == dividendYears[l])
                        {
                            noOfShares +=  ( noOfShares*dividends[l]);
                            //alert("Dividend on "+dividendYears[i]+"   "+years[i]+" is : "+dividends[i]);
                            cnt += "<tr><td>"+i+"</td><td>"+years[i]+"</td><td>"+noOfShares+"</td><td>"+yearOpenRate+"</td><td>"+dividends[i]+"</td></tr>";
                            break;
                        }
                    }
                    
                    
                    
                //alert("No of Shares on "+years[i]+" is "+noOfShares);
                }
                RD[j] = ( (noOfShares*yearOpenRate-capital)/capital )*100;
                AR[j] = ( Math.pow(noOfShares*yearOpenRate/capital,(1/j))-1 )*100;                
                AD[j] = noOfShares*yearOpenRate;
                YY[j] = ( (AD[j]-AD[j-1])/AD[j-1]) * 100;
                
                RD[j] = MyMath.round(RD[j], 2);
                AR[j] = MyMath.round(AR[j], 2);
                AD[j] = MyMath.round(AD[j], 2);
                YY[j] = MyMath.round(YY[j], 2);
            //alert(AD[j]+"      "+AD[j-1]);
            }            
        }
        cnt += "<table>";
        //$('#contentDiv').html(cnt);
        return [years,AR,AD,RD,YY];
    },
    
    /**
     * This Method Patrion the Givend CSV Data and Retrive the
     * Dividend data by year wise
     * @Return : an Array containing two sub Arrays of years and dividendRates by Year wise
     * this method return 'null' if there is no Dividend Data     
     */     
    partionDividendData: function(pCsvData)
    {        
        var data = [];
        var dates = getSpecifiedData(pCsvData, 'date', 'date');
        var dividends = getSpecifiedData(pCsvData, 'Dividends', 'number');
        
        
        //alert("Data From Dividends"+dates.length+"   "+dividends.length);
        // if There is no Data Then Skip This Process
        if(dates==null || dates.length<2)
        {
            return null;
        }
        
        return [dates,dividends];
        
        var dividendYearWise = [];
        var dividendYears = [];
        var count = 0;
        var sYear = dates[0].getFullYear();
        dividendYears.push(sYear);
        //alert("Dividend Data Retrived :"+dividendYears[0]);
        //var startYear = (Date.parse(dates[0])).getFullYear();
        //alert("Start Year is : "+startYear);
        dividendYearWise[0] = 0;
        for(i=0;i<dates.length;i++)
        {
            try
            {
                //alert("I :"+dates[i].getFullYear());
                if(sYear != dates[i].getFullYear())
                {
                    sYear = dates[i].getFullYear();
                    dividendYears.push(sYear);
                    count++;
                    dividendYearWise[count] = 0;
                }
                dividendYearWise[count] += dividends[i];
            //alert("Year Wise Dividend :"+dividendYearWise[count]+"\nActual Dividend :"+dividends[i]);
            }catch(e){//alert("Exception :"+e);}
            }
        }
        //alert('Dividends Partioned to Year Wise');
        //        for(i=0;i<dividendYearWise.length;i++)
        //        {
        //            alert("Dividenr in Year "+dividendYears[i]+" is "+dividendYearWise[i]);
        //        }
        
        //return [dividendYears,dividendYearWise,dates];
        return [dates,dividends];
    },
    
    /**
     * This Method is used to genarate the Chart Summary
     * this method should be called before updating the Charts
     * pChartData - the Object of the Chart Data
     * pChartDiv  - hte division of the Chart
     * pKeyWord- the key word is used to compare thr Tickers "YY AD AR RD etc.."
     */
    generateChartSummary: function(pChartData,pChartDiv,pKeyWord,type,generateTheory)
    {
        generateTheory = !generateTheory?false:generateTheory;
        
        var RA = ReturnAssessmentHandler;
        
        // first clearing all the previous chart Summaries
        var tab = $(pChartDiv).parents('table');
        //alert("Div is : "+pChartDiv);
        var summaryDiv = $(tab).find('.chartSummaryDiv')[0];
        $(summaryDiv).html("");
        var summaryTab = $(tab).find('.chartDataTab')[0];
        //alert(summaryTab);
        $(summaryTab).html("");        
        
        var cols = pChartData.getNumberOfColumns();
        
        // Generatinhg the Return Table
        //alert("Generating");
        
        
        //if(cols < 2)
        //    return;
        
        // Retriving Ticker names for Generating Chart Summary
        var tickerNames = [];
        for(var i=1;i<cols;i++)
        {
            tickerNames[i-1] = pChartData.getColumnLabel(i);
        //alert(tickerNames[i-1]);
        }        
        
        //alert("Will generate Summary");
        // Retriving the Tabel Data to Two Dimensional Array For Computationla Purpose
        var rows = pChartData.getNumberOfRows();
        var data = [];
        for(i=1;i<cols;i++)
        {
            data[i-1] = [];
            for(j=0;j<rows;j++)
            {
                data[i-1][j] = pChartData.getValue(j,i);
            //alert(data[i][j]);
            }
        }
        //alert(tickerNames);
        RA.generateChartTable(pChartDiv,data,tickerNames,type);
        
        if(cols < 3)
            return;
        //alert(data);
        //alert("No Of Comparisons are :"+data.length);        
        var content = "<h3 style='font-size:12px;font-face:serif;color:black;font-weight:100'>";
        var t1,t2;
        
        // now COmputing The Average Differences and Generating the Comparision Strings
        var data1,data2;
        data1 = data[0];
        data2 = data[1];
        
        t1 = tickerNames[0];
        t2 = tickerNames[1];
        var anDiff = 0;
        
        if(type=='AD' || type=='RD')
        {
            var tb = $('#chartDivAR').parents('table')[0];            
            var html = $('.chartSummaryDiv',tb).clone().html();
            var keys = ["Absolute Return to Date","Return to Date"];
            var ind = type=='AD'?0:1;
            html = html.replace(/Annual Return/gi, keys[ind]);
            $(summaryDiv).html(html);         
        }
        else
        {
            for(i=1;i<data.length;i++)
            {
                //alert(i+" in the Iteration of "+cols);
                try{
                    t1 = tickerNames[i-1];
                    t2 = tickerNames[i];
                    //alert("Comparing "+t1+"   "+t2);                
                    var diffAvg = this.computeDifferences(data[i-1],data[i]);
                    if(diffAvg<0){
                    //alert(t1+" is Better Than "+t2);
                    }
                    //var diffAvg = this.computeDifferences(data1,data2);                
                    //t1 = t2;
                    //t2 = tickerNames[i-1];                
                
                    //content += (diffAvg+"<br/>");
                    if(!generateTheory)
                    {
                        content += this.generateComparisonTheory(t2, t1, diffAvg, pKeyWord)+"<br/>";
                    }                                     
                }catch(e){
                    alert("Error While Generating Chart Summary :"+e);
                }                
            }
            content += "</h3>";        
            $(summaryDiv).html(content);
        }
        
    //$('#myDiv').html(content);
            
    },
    
    /**
     * This Method Generates the Chart Summary for the Given Data
     * with the the Following Information
     * 1year 2years,5 and 10 Years Returns
     */
    generateChartTable:function(div,d,tickers,type){
        var tab = $(div).parents('table');
        var summaryTab = $(tab).find('.chartDataTab')[0];
        //alert(summaryTab);
        var data = d;
        //alert("No of Tickers Data is "+data.length);
        var content = "";
        var periods = [0,1,2,5,10];
        if(type=='AD'){
            periods = [0,1,2,5,10];
        }
        else
        {
            periods = [2,3,6,11];            
        }
        
        content += "<table cellspacing=0 width='100%' class='summaryTable'>";
        content += "<thead>";
        if(type=='AD'){
            
        }
        else{
            content += "<tr><th colspan='"+(periods.length+1)+"' style='text-align:center;color:black'>* Indicate for \"Last\"</th></tr>";
        }
        content += "<tr><th>Ticker</th>";
        for(var i=0;i<periods.length;i++){
            if(type=='AD'){
                content += "<th>"+ (periods[i]==0?"Start":""+periods[i]+" Yr") +"</th>";                
            }
            else{
                content += "<th>"+ (periods[i]==0?"Start":"*"+(periods[i]-1)+" Yr") +"</th>";
            }
        }
        content += "</tr></thead>";
        content += "<tbody>"
        for(i=0;i<data.length;i++)
        {
            content += "<tr><th>"+tickers[i]+"</th>";
            for(var j=0;j<periods.length;j++)
            {
                var vals = data[i].removeNulls();
                var v;
                if(type=='AD')
                    v = MyMath.round(vals[periods[j]],2);
                else{
                    v = MyMath.round(vals[vals.length-periods[j]],2);
                    v = v==0?'-N.A-':v;                    
                }
                    
                v = isNaN(v)?'-NA-':v;
                content += "<td>"+v+"</td>";
            //content += "<td>"+vals.length+"</td>";
            }
            content += "</tr>";
        }
        content += "</tbody></table>";        
        $(summaryTab).html(content);        
        
        DOMElement.makeAsStrippyTable($('table',summaryTab), {
            CSS:'strippyTable'
        });
    //alert(content);
    },
    
    
    /**
     * This Method Computes the Resiliance Factor for the Given Rates
     */
    computeResilianceFactor: function(pDates,pRates,noOfFactors)
    {   
        // if user donsen't need then skip this
        //if(!this.generateResilianeFactor)
        //    return;        
        
        var rates = pRates.slice(0, pRates.length-1);
        var dates = pDates.slice(0, pRates.length-1);        
        
        //alert(dates[0]);
        var n = !noOfFactors?5:noOfFactors;
        
        n = 6;
        var len = rates.length;
        //alert("Rates Size is : "+len+"Dates : "+dates.length);
        var spanSize = parseInt(''+len/n);        
        var content = "<h4 style='color:white;background:#0b4980;padding: 10px;text-align:center'>Resiliance Factor</h4>";
        content += "<table border=1>";
        content +="<thead><tr><th>Date</th><th>Min</th><th>Date</th><th>Max</th></tr></thead>";
        var dataPoints = [];
        content += "<tbody>";
        for(var i=0;i<n-1;i++)
        {
            dataPoints = rates.slice(i*spanSize, (i+1)*spanSize);
            //alert(dataPoints);
            var bounds = StockAnalysis.getBounds(dataPoints);
            //alert("Bounds are : "+bounds);
            content += ( "<tr><td>"+dates[bounds.MIN.pos+spanSize*i].toString("dd-MMM-yyyy")+"</td><td>"+bounds.MIN.val+"</td><td>"+dates[bounds.MAX.pos+spanSize*i].toString("dd-MMM-yyyy")+"</td><td>"+bounds.MAX.val+"</td></tr>" );
        //alert(i+" Data size is :"+dataPoints);
        }
        content += "</tbody>";        
        content += "</table>";
    //$('#contentDiv').html(content);
    },
    
    /**
     * This MEthod Generate a Statement 
     */
    generateComparisonTheory: function(pTicker1,pTicker2,pAvg,pCompareSrc)
    {        
        pAvg = MyMath.round(pAvg, 2);
        //pAvg = Math.round(pAvg);
        var theory = "";
        //alert("Hello");
        var isNegative = pAvg<0;
        var temp = pAvg;
        pAvg = isNegative?-pAvg:pAvg;
        var comp;
        if(isNegative){
            comp = "Lower by ( <label style='color:red'>-"+pAvg+" %</label> )";
        }
        else{
            comp = "Higher by ( <label style='color:green'>"+pAvg+" %</label> )";
        }
        if(pAvg>=0 && pAvg < 1)
            theory = pCompareSrc+" of <label style='color:blue'>"+pTicker1+"</label> is Marginally "+comp+" Than "+pCompareSrc+" of <label style='color:blue'>"+pTicker2+"</label>";
        else if(pAvg>=1 && pAvg<4)
            theory = pCompareSrc+" of <label style='color:blue'>"+pTicker1+"</label> is Moderatly "+comp+" Than "+pCompareSrc+" of <label style='color:blue'>"+pTicker2+"</label>";
        else
            theory = pCompareSrc+" of <label style='color:blue'>"+pTicker1+"</label> is Significantly "+comp+" Than "+pCompareSrc+" of <label style='color:blue'>"+pTicker2+"</label>";
        
        return theory;
    },
    
    /**
     * This Method Computes the Difference of the Given Two Data Sets
     * the differences are seconddata - firstData
     */
    computeDifferences: function(pData1,pData2)
    {
        var diff = [];
        var l1 = pData1.length;
        var l2 = pData2.length;
        var len = l1<l2?l1:l2;
        var sum1 = 0;
        var sum2 = 0;
        //alert("Length is :"+len);
        //var counter = 0;
        for(i=0;i<len;i++)
        {
            //alert("Data Values are : "+pData1[i]+ " : "+pData2[i]);
            if(pData1[i]!=null && pData2[i]!=null)
            {
                sum1 += pData1[i];
                sum2 += pData2[i];
                //alert(pData2[i]+"      "+pData1[i]);
                diff.push(pData2[i] - pData1[i]);
            }
        //alert("Difference is "+diff[i]);
        }
        
        //alert("No of Differences are : "+diff.length);
        //for(i=0;i<diff.length;i++)
        // {
        //    alert("Difference is : "+diff[i]);
        //}
        sum1 /= diff.length;
        sum2 /= diff.length;        
        
        var d = StockAnalysis.avg(diff);
        //d = ( d / (sum1>sum2?sum1:sum2)) * 100;
        //alert("Percentage is : "+d);
        
        //alert("Average Difference is : "+d);
        return d;
    },
    
                
    /**
     * This Method Used to Partion The Given Data into the Years wise
     * it  returns the years wise data and years
     * if dataMode is o then it tries to parse the CSV Data
     * other wise accepts the Actual Data
     */
    partionData: function(pCsvData,dataMode)
    {       
        dataMode = !dataMode?0:dataMode;
        //alert("Data Mode is : "+dataMode);
        var data = [];
        if(dataMode == 0){
            data[0] = getSpecifiedData(pCsvData, 'date', 'date');
            data[1] = getSpecifiedData(pCsvData, 'close', 'number');
        }else{
            data[0] = pCsvData[0];
            data[1] = pCsvData[1];
        }
        
        // Retriving The Starting and Ending Date of The Current Stock
        this.endDate = data[0][0];
        if(this.startDate == null){
            this.startDate = data[0][data[0].length-2];
        }
        else{
            this.startDate = this.startDate>data[0][data[0].length-2]?this.startDate:data[0][data[0].length-2];
        }
        
        //alert("Start year is :"+this.startDate+"\nEnd Date Is :"+this.endDate);
        
        // This Variable holds the Year wise data
        var yearWiseData = [];
        // This Variable holds the Year values
        var years = [];
            
        var cY = (data[0][0].getFullYear());
            
        var yearInd = 0;                    
            
        yearWiseData[0] = [];
        years.push(cY);
        for(var i=0;i<data[0].length;i++)
        {
            if(data[0][i] == null)
                continue;
            if(cY != data[0][i].getFullYear())
            {
                yearInd++;
                yearWiseData[yearInd] = [];                                                        
                cY = data[0][i].getFullYear();
                years.push(cY);
            }                        
            // holding both the date and rates
            //yearWiseData[yearInd].push([data[0][i],data[1][i]]);
            
            // Holding Rates only because we are holding the year on 'years' array
            // but the years array holds only the year valu not the particular date                        
            yearWiseData[yearInd].push(data[1][i]);
        }                    
            
        return [years,yearWiseData];
    },
            
    /**
     * This Method Adds a New Ticker name to The existing Ticker list                 
     */
    addNewTickerToCompare: function(tName,dontTrigger,handler)
    {
        tName = !tName?$(this.newTickerText).val():tName;
        dontTrigger = !dontTrigger?false:dontTrigger;
        //alert(tName);
        //alert(dontTrigger);
        var tickerName = tName;
        
        tickerName = tickerName.toUpperCase();
        if(tickerName.length < 1)
            return;
        var tickerExist = false;
        
        // if there are no tickers then clear the old text
        //if($('input[name="raTickerChk"]').length<1)
        //   $(this.compareTickerDiv).html("");
       
        $('input[name="raTickerChk"]',this.compareTickerDiv).each(function()
        {
            //alert($(this).val());
            if($(this).val() == tickerName)
            {
                tickerExist = true;
                if(!dontTrigger)
                    alert('Symbol already exist in Return Assessment');
                $(this).focus();
            }                           
        });
            
        if(tickerExist)
        {
            $(this.newTickerText).val("");
            return;
        }
            
            
        var newTicker = document.createElement('input');
            
        $(newTicker).attr({
            type:'checkbox',
            name:'raTickerChk',
            value:tickerName,
            title: 'Add '+tickerName+' To Compare'            
        });
        
        // if the ticker was forwarded tehn make it Removable by Manually
        if(dontTrigger){
            $(newTicker).attr({
                'key':'forwardedTicker'
            });            
        }
        
        this.addCheckboxTickerListener(newTicker);
            
        //$(newTicker).after(tickerName);
        
        var label = document.createElement('label');
        $(label).css({
            'padding':'5px',
            'display':'inline-block'
        });
        //alert('dskfasdfjlaksdf');
        $(label).append(newTicker).append(tickerName);
            
        $(this.compareTickerDiv).prepend(label);        
        $(this.newTickerText).val("");
        
        if(!dontTrigger){
            $(newTicker).attr("checked","checked");
            $(newTicker).trigger("change",[true]);
        }
    //jd return assesment
    /* DOMElement.makeAsClosable([label], {            
            CSS:'closeBtn',
            before: function(ele){
                $(newTicker).removeAttr("checked");
                $(newTicker).trigger("change",[0,handler]);
            },
            prompt:'Are you sure'
        }, function(obj){            
            //$(newTicker).trigger("change",null);
            //$('#'+id).remove();
            });
        */
    },
    
    
    /**
     * This Method removes the Duplicate Ticker names and return the New Array
     * Note : this won't allow duplicate of tickers they will be automatically removed
     */
    removeDuplicateTickers : function(newTickers)
    {
        // making clone
        var nTicks = [];
        for(var i=0;i<newTickers.length;i++)
            nTicks.push(newTickers[i]);
        
        var existingTickers = [];
        // first Get the ASll Existing Tickers
        $(this.compareTickerDiv).find(':input').each(function()
        {
            existingTickers.push($(this).val());
        });
        
        // Removing all the Duplicate Tickers
        for(i=0;i<existingTickers.length;i++)
        {
            for(var j=0;j<nTicks.length;j++)
            {
                if(existingTickers[i] == nTicks[j])
                {
                    nTicks = nTicks.removeElement(existingTickers[i]);
                    break;
                }
            }
        }
        return nTicks;
    },
    
    /**
     * This Mehtod Checks Whether The Ticeker Name Already Exist in the Chart Table Data
     * it returns true if the data exist
     * false otherwise
     */
    isTickerAlreadyExistInDataTable : function(pTickerName)
    {
        // Convertinf to Lower Case for Comparison
        pTickerName = pTickerName.toLowerCase();
        
        var cols = this.chartDataAR.getNumberOfColumns();
        for(i=0;i<cols;i++)
        {
            if(this.chartDataAR.getColumnLabel(i).toLowerCase() == pTickerName)
                return true;
        }
        return false;
    },
            
    /**
     * This Method Used to Add the Ticker Checkbox Listener
     */
    addCheckboxTickerListener: function(obj)
    {
        //alert("Adding To The Data base");
        var RA = ReturnAssessmentHandler;
        
        //alert(this);
        $(obj).change(function(evt,triggerBySys,handler)
        {            
            triggerBySys = !triggerBySys?false:triggerBySys;            
            
            var ticker = $(this).val();
            //alert(obj.checked);
            if(obj.checked)
            {
                if(RA.isTickerAlreadyExistInDataTable(ticker))
                {
                    $(this).removeAttr('checked');
                    alert("Symbol Already Exist in Chart!");                    
                    return;
                }
                // Disabling all The inputs Because Waiting for data Load
                RA.applyMask(RA.controlsDiv,1);
                //alert('Before Calling :'+ticker);
                
                // Data handler for AJAX Data
                function myHandler(data)
                {                   
                    // Checking whether the data is null or not
                    if(data == null)
                    {
                        // Removing the Mask
                        RA.applyMask(RA.controlsDiv,0);
                        // Rermoving the Added Tciker Symbol Also
                        $(RA.compareTickerDiv).find(':input').each(function()
                        {
                            if(ticker == $(this).val())
                            {
                                $(this).parent('label').remove();                                             
                            }
                        });
                        return;
                    }
                    
                    // Adding the Newly added ticker to the Queue
                    RA.currentTickersQueue.push(ticker);
                    //alert(RA.currentTickersQueue);                    
                    
                    // Now add this Ticker to the Data Base throught AJAX Call
                    // if User Portfolio enable then only Store 
                    if(RA.storeInDB){                        
                        //alert(addedTicker);
                        $.get('stockUtilHandler.do',{
                            mode:0,
                            ticker:ticker,
                            no:1
                        },function(){
                            //alert(data);
                            });                        
                    }
                    
                    
                    if(!RA.isDateChanged){
                        $('#raStartDate').val(RA.startDate.toString("yyyy-MM-dd"));
                    }
                    RA.startDates[RA.sdC] = RA.startDate;
                    RA.sdC++;
                    
                    //RA.updateAllCharts(data,ticker);
                    
                    RA.updateChartAsPerDate(RA.startDate.toString("yyyy-MM-dd"), $('#raEndDate').val(), RA.dividendMode);
                }                
                try
                {
                    // Sending AJAX Request
                    //alert(RA.dividendMode);
                    
                    if(!RA.isDateChanged){
                        RA.getReturnAssessmentDataForTicker(ticker, "","",myHandler,RA.dividendMode);
                    }
                    //                        RA.getReturnAssessmentDataForTicker(ticker, "","",myHandler,RA.dividendMode);
                    else{
                        RA.getReturnAssessmentDataForTicker(ticker, $('#raStartDate').val(), $('#raEndDate').val(),myHandler,RA.dividendMode);
                    }
                        
                }
                catch(e){
                    alert("Error Occured :"+e);
                }
                
            }
            // When User Deselect the Check boxes of the Comparision Checkboxes
            else
            {  
                if(!RA.benchMark.checked)
                {
                    if($(RA.compareTickerDiv).find(':checked').length <1)
                    {
                        $(this).attr('checked','checked');
                        alert("You Can't Remove all the Tickers");
                        return;
                    }
                }
                /*
                if($(RA.compareTickerDiv).find('input[type="checkbox"]').length <1 && !RA.benchMark.checked)
                {
                    $(this).attr('checked','checked');
                    alert("You Can't Remove all the Tickers");
                    return;
                }
                 */                
                
                // Removing the Ticker name form the Queue
                RA.currentTickersQueue.removeElement(ticker);
                
                //alert("Removing Ticker Name from Chart :"+ticker);
                //Colining THe Current Data Object for Modifications                            
                RA.chartDataAR = RA.removeColumnFromChart(RA.chartDataAR, ticker);
                RA.chartDataAD = RA.removeColumnFromChart(RA.chartDataAD, ticker);
                RA.chartDataRD = RA.removeColumnFromChart(RA.chartDataRD, ticker);
                RA.chartDataYY = RA.removeColumnFromChart(RA.chartDataYY, ticker);
                
                //chartDataARView = new google.visualization.DataView(this.chartDataAR);
                RA.drawChart(RA.chartAR,RA.chartDataAR,"Comparison of Annual Returns","Return (%)","Year");
                RA.drawChart(RA.chartAD,RA.chartDataAD,"Comparison of Absolute Returns","Amount (USD)","Year");
                RA.drawChart(RA.chartRD,RA.chartDataRD,"Comparison of Return to Date","Return (%)","Year");
                RA.drawChart(RA.chartYY,RA.chartDataYY,"Comparison of Year on Year","Return (%)","Year");
                
                // Generating Chart Summary
                RA.generateChartSummary(RA.chartDataYY,$('#chartDivYY'),'Year on Year','YY');
                RA.generateChartSummary(RA.chartDataAR,$('#chartDivAR'),'Annual Return','AR');
                RA.generateChartSummary(RA.chartDataAD,$('#chartDivAD'),'Absolute Return','AD',RA.annualReturnCompVal);                
                RA.generateChartSummary(RA.chartDataRD,$('#chartDivRD'),'Return to Date','RD',RA.annualReturnCompVal);                                
            //RA.updateChartVisiblity(obj, ind);
            }
        });
    },
    
    /**
     * This MEthod Handles the Dividend Mode
     * and this Method Also redraws all the Charts automatically
     */
    handleDividendMode: function()
    {
        var cols = this.chartDataAR.getNumberOfColumns();
        alert("Number of Columns :"+cols);
    },
    
    /**
     * This Method Used to Update all the Charts with the Given Data
     * @param data the data of all charts
     * @param ticker the Ticker Name
     */
    updateAllCharts : function(data,ticker)
    {
        var RA = ReturnAssessmentHandler;
        
        var years = data[0];
        var AR = data[1];
        var AD = data[2];
        var RD = data[3];
        var YY = data[4];
        // alert(years);
        // alert(AR);
        //alert('Before');
        RA.chartDataAR = RA.updateChartData(RA.chartDataAR, ticker, years, AR);
        RA.chartDataAD = RA.updateChartData(RA.chartDataAD, ticker, years, AD);
        RA.chartDataRD = RA.updateChartData(RA.chartDataRD, ticker, years, RD);
        RA.chartDataYY = RA.updateChartData(RA.chartDataYY, ticker, years, YY);
        //alert('after');
        //RA.chartDataAR = RA.cloneData;
        // alert(RA.chartDataAR);
                                
        //alert(years);
        RA.drawChart(RA.chartAR,RA.chartDataAR,"Comparison of Annual Returns","Return (%)","Year");
        RA.drawChart(RA.chartAD,RA.chartDataAD,"Comparison of Absolute Returns","Amount (USD)","Year");
        RA.drawChart(RA.chartRD,RA.chartDataRD,"Comparison of Return to Date","Return (%)","Year");
        RA.drawChart(RA.chartYY,RA.chartDataYY,"Comparison of Year on Year","Return (%)","Year");                    
                    
        // Enabling all the Inputs When the Data is Loaded
        RA.applyMask(RA.controlsDiv,0);
                    
        // Generating Chart Summary
        RA.generateChartSummary(RA.chartDataYY,$('#chartDivYY'),'Year on Year','YY');
        RA.generateChartSummary(RA.chartDataAR,$('#chartDivAR'),'Annual Return','AR');
        RA.generateChartSummary(RA.chartDataAD,$('#chartDivAD'),'Absolute Return','AD',RA.annualReturnCompVal);                
        RA.generateChartSummary(RA.chartDataRD,$('#chartDivRD'),'Return to Date','RD',RA.annualReturnCompVal);
    //alert(RA.annualReturnCompVal);
    },
                
    /**
     * This MEthod Removes the Specified Ticker From the Given Chart Data
     */ 
    removeColumnFromChart : function(pChartData,pTicker)
    {
        this.cloneData = pChartData.clone();
        var cols = pChartData.getNumberOfColumns();
        var ind = -1;
        for(i=0;i<cols;i++)
        {
            //alert(chartDataAR.getColumnLabel(i));
            if(pChartData.getColumnLabel(i) == pTicker)
            {
                //alert(chartDataAR.getColumnLabel(i));
                ind = i;
                break;
            }
        }
        //alert("Column Index is :"+ind);
        if(ind == -1)
            return this.cloneData;
        this.cloneData.removeColumn(ind);
        return this.cloneData;
    },
    
    
    
    /**
     * This Method Updates the Given Chart as per the Dates Choosen By the End User
     */
    updateChartAsPerDate: function(pStartDate,pEndDate,includeDividend)
    {   
        //alert(Date.parse(pStartDate));
        //alert(Date.parse(pEndDate));
        
        if( (pStartDate!=null && pEndDate!=null) && Date.parse(pStartDate) >= Date.parse(pEndDate))
        {
            alert("Please Make Sure The Dates are Valid");
            try{
                this.startDate = this.prevStartDate;
                this.endDate = this.prevEndDate;
                $('#raStartDate').val(this.prevStartDate.toString('yyyy-MM-dd'));
                $('#raEndDate').val(this.prevEndDate.toString('yyyy-MM-dd'));
            //alert(this.prevStartDate);
                
            }catch(e){
            //alert(e);
            }
            return;
        }
        
        var RA = ReturnAssessmentHandler;
        
        RA.applyMask($('#chartDivAR'), 1);
        RA.applyMask($('#chartDivAD'), 1);
        RA.applyMask($('#chartDivRD'), 1);
        RA.applyMask($('#chartDivYY'), 1);
        
        var counter = 0;
        for(var i=0;i<RA.currentTickersQueue.length;i++)
        {                
            var cols = null;
            // This Handles the Data Retrived Data
            function functionHandler(data,ticker)
            {
                if(cols == null)                        
                    cols = RA.chartDataAR.getNumberOfColumns();
                    
                counter++;
                //alert("data Retrived for :"+ticker);
                //RA.chartDataAR = RA.updateChartData(pChartData, pTicker, pYears, pData, ind)
                RA.updateAllCharts(data,ticker);
                //alert("Chart Updated");
                
                if(counter == RA.currentTickersQueue.length)
                {
                    try
                    {
                        //alert('Need to Remove first '+cols+' Columns');
                        RA.chartDataAR.removeColumns(1,cols-1);
                        RA.chartDataAD.removeColumns(1,cols-1);
                        RA.chartDataRD.removeColumns(1,cols-1);
                        RA.chartDataYY.removeColumns(1,cols-1);
                        
                        
                        
                        RA.chartDataARView = new google.visualization.DataView(RA.chartDataAR);
                        RA.chartDataADView = new google.visualization.DataView(RA.chartDataAD);
                        RA.chartDataRDView = new google.visualization.DataView(RA.chartDataRD);
                        RA.chartDataYYView = new google.visualization.DataView(RA.chartDataYY);
                        RA.drawChart(RA.chartAR,RA.chartDataARView,"Comparison of Annual Returns","Return (%)","Year");
                        RA.drawChart(RA.chartAD,RA.chartDataADView,"Comparison of Absolute Returns","Amount (USD)","Year");
                        RA.drawChart(RA.chartRD,RA.chartDataRDView,"Comparison of Return to Date","Return (%)","Year");
                        RA.drawChart(RA.chartYY,RA.chartDataYYView,"Comparison of Year on Year","Return (%)","Year");
                        
                        // Generating Chart Summary
                        RA.generateChartSummary(RA.chartDataYY,$('#chartDivYY'),'Year on Year','YY');
                        RA.generateChartSummary(RA.chartDataAR,$('#chartDivAR'),'Annual Return','AR');
                        RA.generateChartSummary(RA.chartDataAD,$('#chartDivAD'),'Absolute Return','AD',RA.annualReturnCompVal);                
                        RA.generateChartSummary(RA.chartDataRD,$('#chartDivRD'),'Return to Date','RD',RA.annualReturnCompVal);
                        
                        RA.applyMask($('#chartDivAR'), 0);
                        RA.applyMask($('#chartDivAD'), 0);
                        RA.applyMask($('#chartDivRD'), 0);
                        RA.applyMask($('#chartDivYY'), 0);
                    }
                    catch(e){
                        alert(e);
                    }
                }                        
            }
            RA.getReturnAssessmentDataForTicker(RA.currentTickersQueue[i], pStartDate, pEndDate, functionHandler,includeDividend);
        }    
    },    
    
    /**
     * This Method Updates the chart data and the graph of the given
     * chart 
     */
    updateChartData : function(pChartData,pTicker,pYears,pData,ind)
    {
        // Holding Parent Object for Further Referrence
        var RA = ReturnAssessmentHandler;
                    
        RA.cloneData = pChartData.clone();
        
        // if THe index is Undefined then inset the new data at End
        // or else insert the data at the specified index
        if(ind == undefined)
        {
            ind = pChartData.getNumberOfColumns();
        }
        
        //alert("New Column Inserted : "+ind);
        RA.cloneData.insertColumn(ind,'number',pTicker);
        var pRows = pChartData.getNumberOfRows();
        var cRows = pData.length;        
        //var pRows  = pData.length;
        
        
        for(var i=0;i<cRows;i++)
        {            
            try{                
                //alert(RA.cloneData.getValue(i,1));
                //alert(pYears[i]+"   :  "+pData[i]);
                if(i>=pRows)
                {                    
                    var i1 = RA.cloneData.insertRows(0,1);
                    //alert("Inserting New Row : "+i1);
                    RA.cloneData.setCell(i1,0,''+pYears[i]);
                    RA.cloneData.setCell(i1,ind,pData[cRows-1-i]);
                }
                else if(cRows <= pRows)
                {
                    //alert(pYears[i]);
                    
                    RA.cloneData.setCell(pRows-1-i,0,''+pYears[i]);
                    RA.cloneData.setCell(pRows-1-i,ind,pData[cRows-1-i]);
                }                
                else
                {
                    RA.cloneData.setCell(pRows-1-i,ind,pData[cRows-1-i]);
                }
            }
            catch(e){
                alert(e);
            }
        }
        
        // Sorting The Data based on THe Year
        //RA.cloneData.sort(0);        
        return RA.cloneData;
    },
            
    /**
     * This Mehotd Is Used to reset THe Return Assessment Chart Visibility
     */
    resetChartVisibility : function()
    {
        var vcells = chartDataAR.getNumberOfColumns();
        var visibleCells = [];
        for(var i=0;i<vcells;i++)
            visibleCells[i] = i;
        // Showing all cells
        this.chartDataARView.setColumns(visibleCells);
    },
            
    /**
     * This Mehotd Updates the Chart According to The User Changes
     * this method Automatically Call to The ResetChart Visibility method
     */
    updateChartVisiblity: function()
    {
        // First reseting the Chart 
        this.resetChartVisibility();
        this.chartAR.draw(this.chartDataARView,{});
    }
}