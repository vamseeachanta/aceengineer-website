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
var FundamentalIndicatorHandler = {
    
    /** This Object Holds the Bench Mark Data default Bench mark is SPY */
    benchMarkData : null,
    
    mainDiv : {},
    /** This Should Be Created as Crossbrowser Element */
    xml : null,
    /** This Varible Holds the Response Content That loaded from through AJAX */
    responseData : null,
    /** This Varible Holds The Google Chart Table Data */
    chartData : null,
    /** This Variable holds the Clone Object of the Chart Data Used for Making Any Modifications */
    cloneData : null,
    /** This Object Holds the DataView of the Annual Return Chart */
    chartDataView : null,    
    /** This Object Holds The Google Chart Object */
    chart: null,    
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
    /** This Object holds the Starting Date */
    startDate : null,
    /** This Object hodsl the Ending Date */
    endDate : null,    
    /** this object holds the list of current ticker selected by user*/
    selectedTickers : [],
    /** This Object holds the hidden Ticker data so this enable us redisplaying a hidden data very
     Quickly*/
    hiddenTickers : [],
    /**This Object Holds teh Benck Mark Ticker Check box */
    benchMark : null,
    /** this Object Holds the All the Charts Data */
    chartsDataStack : [],
    /** This Variable tells whether the Tickers should be store in DB or NOt
     * this is useful for User Portfolio not for Indenpendent Portfolio 
     * */
    storeInDB : false,
                            
                                            
    /**
     * This Method is USed TO Initiliaze THe Retrun Assessemnt Fileds And Charts By Default
     */
    initilize: function()
    {     
        var that = this;        
        this.mainDiv = document.getElementById('fundamentalIndicatorDiv');
        this.newTickerText = $(this.mainDiv).find('#fiNewTicker');
        // Restricting the Input box to allowing the special Characters
        Input.excludeCharacters(this.newTickerText, "`~!@#$%&*()-=+", function(){});
        
        this.compareTickers = $(this.mainDiv).find('input[name="fiTickerChk"]');
        this.compareTickerDiv = document.getElementById('fiTickerCompareDiv');
        this.controlsDiv = document.getElementById('controlDivFI');
             
        this.addTickerBtn = document.getElementById('fiAddTickerBtn');
        this.reloadBtn = document.getElementById('relodBtnFI');
        
        // Creating Mask Div
        this.maskDiv = document.createElement('div');
        $(this.controlsDiv).append(this.maskDiv);
        
        //Adding Change Listener to the StartDate Textbox
        $('#fiStartDate').bind("change",function(){
            //alert(Date.parse($(this).val()));
            var d1 = Date.parse($(this).val());
            var d2 = Date.parse($('#fiEndDate').val());
        //that.updateChartAsPerDate(that.chartDataView, d1, d2);            
        });
        
        // Handling CHange Listener to the EndDate Textbox
        $('#fiEndDate').bind("change",function(){
            //alert(Date.parse($(this).val()));
            that.updateChartAsPerDate(that.chartDataView, Date.parse($('#fiStartDate').val()), Date.parse($(this).val()));
        });
        
        
        // Adding Listener to Moving Average Check Boxes
        $('input=[name="fiMaChk"]').each(function(){
            $(this).change(function()
            {                
                that.updateChartVisiblity();
            });
        });
        
        //adding ResetDates Click Listener
        // When User Clicks on Reset Button THen it Will Reset the Date Fields
        // so THe Data Will be Displayed from SAtart to End
        $('#fiResetDatesBtn').click(function()
        { 
            that.drawChart(that.chart, that.chartDataView, "", ":", "");
            $('#fiStartDate').val("Choose Date....");
            $('#fiEndDate').val("Choose Date....");
        });
        
        // Adding EnterKey Listener to add ticker text this will add ticker
        // when user pressees the enter Key
        $(this.newTickerText).keydown(function(evt){
            if(evt.keyCode == 13)
            {
                var tName = $(that.newTickerText).val();
                addTicker(tName);
            }        
        });
                                
        //alert(this.chartDataAR.getNumberOfColumns());
        // Adding Click Listener to Button
        $(this.addTickerBtn).click(function()
        {
            var tName = $(that.newTickerText).val();
            addTicker(tName);
        });
        
        /**
         * This Method Usd to add a new Ticker
         */
        function addTicker(ticker)
        {
            var tName = ticker;
            /* if(tName.toLowerCase() == 'spy'){
                $(that.newTickerText).val("");
                alert("SPY is Bench Mark. You Can't Add it Again");
                return;
            }*/
            that.addNewTickerToCompare(tName,false);
            ReturnAssessmentHandler.addNewTickerToCompare(tName, true,function(){
                alert("Ticker Add in Other Tab Also");
            });
        }
        
        $(this.reloadBtn).click(function(){
            //alert('Reloading Chart...........');
            // Deselecting all The Privious Comparison Checkboxes            
            that.reloadChart();
        });
                                
        // Adding Check box Listener to The Existing Check Boxes
        $(this.compareTickers).each(function(){
            that.addCheckboxTickerListener(this);
        });
        
        
        
        // Adding The Listener to the Bench Mark Ticker
        that.benchMark = $('#fiBenchMark')[0];
        $(that.benchMark).change(function(){
            if(this.checked==true)
                addTicker("SPY");
            else
            {
                $('input[name="fiTickerChk"]').each(function(){
                    if(this.value == 'SPY' && this.checked == true){
                        $(this).trigger('click');
                    }
                });
                
                
            }
                
        });
    /* $(that.benchMark).change(function()
        {
            var isChecked = this.checked;
            for(var i=0;i<that.chartsDataStack.length;i++)
            {                
                var cols = [];
                if(isChecked)
                {
                    cols = [0,1,2,6,7,8,9,10,11];
                }
                else{
                    cols = [0,1,2,6,7,8,9,10];
                }
                $('input[name="maChk"]',that.chartsDataStack[i].div).each(function(ind)
                {
                    if(this.checked)
                    {
                        cols.push(ind+3);
                        if(isChecked)
                            cols.push(ind+3+9);
                    }
                    
                });
                
                var obj = that.chartsDataStack[i];
                obj.dataView.setColumns(cols);
                that.drawChart(obj.chart, obj.dataView, "pTitle", "pXtitle", "pYtitle");
            }
        });
        */
    // Loading Chart
    //this.loadChart();
    },
            
    /**
     * This Method Loads Loads Default When This Object is Created
     * This Block Should performs basic charting oerations like
     * loading Google Chart api and Drawing Default Chart
     */
    loadChart: function()
    {
        var FI = FundamentalIndicatorHandler;
        
    //FundamentalIndicatorHandler.getFundamentalIndicatorDataForTicker("SPY", "", "", function(data){
    //    FI.benchMarkData = data;
    //var ticker = $('#tickerName').val();
    //alert("Ticker : "+ticker);
    //ticker = (ticker==undefined||ticker.length<1)?"GOOG":ticker;
    //FI.createNewChartDiv(ticker);
    //});        
    },
    
    
    /**
     * This MEthod Reload The Chart With The Current User Modifications
     */
    reloadChart : function()
    {
        var FI = FundamentalIndicatorHandler;
        // Loading Base Chart
        
        //var sDate = $('#fiStartDate').val();
        //var eDate = $('#fiEndDate').val();                
        var sDate = "";
        var eDate = "";
        //var tickers = $('input[name="fiTickerChk"]');
        var ticker = $('#tickerName').val();
        
        if(ticker.length < 1)
        {
            alert("Please Enter Proper Ticker name");
            return;
        }
        
        if(this.isTickerAlreadyExistInDataTable(ticker))
        {
            alert("Sorry! Ticker already exist in the chart data");
            return;
        }
        
        // Removing The First Three Columns
        this.chartData.removeColumns(1,4);
        
        FI.applyMask(1);
        /**
         * This Method Handles the Data Retrived from the AJAX Call
         */                
        function dataHandler(data)
        {
            //alert(data);
            if(data == null)
            {
                FI.applyMask(0);
                return;
            }
            //alert(' data Retrived :'+ticker);
            FI.chartData = FI.addNewTickerData(ticker, data,1);
            FI.updateChartVisiblity();            
            FI.applyMask(0);
        }
        FI.getFundamentalIndicatorDataForTicker(ticker, sDate, eDate, dataHandler);            
        
    // now Adding The Comparision Tickers to the Existing base Chart
    },
    
    /**
     * This Method Updates the Given Chart as per the Dates Choosen By the End User
     */
    updateChartAsPerDate: function(pDataView,pStartDate,pEndDate)
    {       
        
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
            //alert($(this.controlsDiv).offset().left);
            $(this.maskDiv).css({
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
            $(this.maskDiv).html("<table style='width:100%;height:100%'><tr><td style='vertical-align:middle;text-align:center'><img src='res/images/334.gif' /></td></tr></table>");
            $(this.maskDiv).offset($(pDiv).offset());
            $(this.maskDiv).fadeTo(0, 0.8, null);
            $(this.maskDiv).show();
            $(pDiv).find('*').each(function(){
                this.disabled = true;
            });
        }
        else
        {
            $(pDiv).find('*').each(function(){
                this.disabled = false;
            });
            $(this.maskDiv).hide();
        }
    },
                
    /**
     * This Method Draws the Chart based upon the Given Inputs And Divisions
     */
    drawChart: function(pChart,pChartDataView,pTitle,pXtitle,pYtitle,drawMode,Lc)
    {     
        drawMode = !drawMode?0:drawMode;
        //this.updateChartAsPerDate(pChartDataView,'', '');
        //alert('drawing Chart :'+pChart);
        Lc = !Lc?false:true;
        var sd = new Date();
        sd.setDate(sd.getDate()-100);
        var sDate = null,eDate = new Date();
        if(Lc == false)
        {
            if(pChart.getVisibleChartRange() != null  )
            {
                sDate = pChart.getVisibleChartRange().start;
                eDate = pChart.getVisibleChartRange().end;
            //alert(sDate+'    '+eDate);
            }        
        }
        
        if(drawMode == 0)
        {
            pChart.draw(pChartDataView, {
                dateFormat : 'dd-MMM-yyyy',            
                legendPosition: 'newRow',            
                fill : 0,
                thickness : 1,
                displayAnnotations:true,
                displayAnnotationsFilter:true,
                scaleType:'maximized',
                //                zoomStartTime : sDate,
                zoomStartTime : sd,
                zoomEndTime: eDate,
                allowRedraw: true
            });
        }
        else if(drawMode == 2){
            pChart.draw(pChartDataView,{
                annotation:{
                    'column_id':'line'
                },
                hAxis: {
                    slantedText:true,
                    viewWindow:'pretty'
                    
                },
                
                width:800,
                height:450
            });
        }
        else{            
            pChart.draw(pChartDataView, {
                dateFormat : 'dd-MMM-yyyy',            
                legendPosition: 'newRow',            
                fill : 0,
                thickness : 1,
                displayAnnotations:true,
                displayAnnotationsFilter:true,
                scaleType:'maximized',
                //                zoomStartTime : sDate,
                zoomStartTime : sd,
                zoomEndTime: eDate                
            });
        }
        
    //        try{
    //            pChart.setVisibleChartRange(new Date('jan,1 2006'),new Date('jan,1 2010'));
    //        }catch(e){
    //            alert(e);
    //        }
    },
                
    /**
     * This method Loads The Return Assessment Data Like
     * Annual Return to Date
     * AD
     * Year on Year
     * et..... data of the Specified Ticker Name (through AJAX)
     * function Handler is the Chart Handler this Function Should handle The Charting
     */ 
    getFundamentalIndicatorDataForTicker: function(pTicker,pStartDate,pEndDate,functionHandler)
    {           
        // Escaping Special Characters
        pTicker = escape(pTicker);        
        if(Date.parse(pStartDate) >= Date.parse(pEndDate))
        {
        //alert("Not Reasonable Date");
        }        
        
        //alert('function Called');
        if(pTicker==undefined || pTicker.length<1)
            pTicker = 'GOOG';
        // holding in local Object For Further Usage
        var FI = FundamentalIndicatorHandler;
                    
        var xmlObj = StockCore.makeXMLRequestObj();
        //alert(xmlObj);
                    
        //alert(pStartDate);        
        //alert(pEndDate);        
        var tokens1 = StockCore.splitDate(pStartDate);
        var tokens2 = StockCore.splitDate(pEndDate);
        
        // Query in format of startingMonth,staringDay,startingYear and endingMonth,endingDay,endingYear
        var query = "s="+pTicker+"&a="+tokens1[0]+"&b="+tokens1[1]+"&c="+tokens1[2]+"&d="+tokens2[0]+"&e="+tokens2[1]+"&f="+tokens2[2]+"&g=d&ignore=.csv";
        //alert(query);
        //xmlObj.open('GET','historicalPrices.do?baseURL=http://ichart.finance.yahoo.com/table.csv?&'+query,true);
        //alert(query);
        
        doAjax("http://ichart.finance.yahoo.com/table.csv?"+query, "", function(data){
            //alert("Retrived Data Is :"+data);
            // if the Data is NULL then 
            if(data == null){
                alert("There is No Data Exist for the Given Symbol");
                FI.applyMask(0);
                functionHandler(null);
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
            //alert("My Call \n"+csvData);
            if(csvData.length < 1)
            {
                alert("There is No Data Exist for the Given Symbol");
                FI.applyMask(0);
                functionHandler(null);
                return;
            //return;
            }
                
            var dates = getSpecifiedData(csvData, "date","date");
            var rates = getSpecifiedData(csvData, "close","number");
            var ma = [];
            ma[0] = rates;
            ma[1] = StockAnalysis.getMovingAverages(rates, 5);
            ma[2] = StockAnalysis.getMovingAverages(rates, 13);
            ma[3] = StockAnalysis.getMovingAverages(rates, 50);
           
            // Retriving The Starting and Ending Date of The Current Stock
            FI.startDate = dates[0];
            FI.endDate = dates[dates.length-2];
            //alert(FI.startDate);
            //alert(ma[0]);
            
            var EMA = [];
            var bB = [];
            var twoSigma= [];
            var threeSigma= [];
            var upperBW=[];
            var lowerBW=[];
            var extLowerBW=[];
            var extUpperBW=[];
            var percentB = [];
            var bandWidth=[];
            var noDays = 50;
            var smoothingConstant = 2/(noDays+1);
            
            EMA = StockAnalysis.getEMA(smoothingConstant, ma[3], rates);
            bB = StockAnalysis.getBollingerBands(rates,ma[3].length);
            twoSigma= StockAnalysis.getSigmaMultiple(bB, 2);
            threeSigma= StockAnalysis.getSigmaMultiple(bB, 3);
            lowerBW=StockAnalysis.getLowerBand(ma[3], twoSigma);
            upperBW= StockAnalysis.getUpperBand(ma[3], twoSigma);
            extLowerBW= StockAnalysis.getLowerBand(ma[3], threeSigma);
            extUpperBW= StockAnalysis.getUpperBand(ma[3], threeSigma);
            percentB= StockAnalysis.getPercentB(ma[0], upperBW, lowerBW);
            bandWidth = StockAnalysis.getBandwidth(upperBW, lowerBW, ma[3]);
            ma[4]=EMA;
            ma[5]=bB;
            ma[6]=twoSigma;
            ma[7]=threeSigma;
            ma[8]=lowerBW;
            ma[9]=upperBW;
            ma[10]=extLowerBW;
            ma[11]=extUpperBW;
            ma[12]=percentB;
            ma[13]=bandWidth;
            ma[14]= chartRecommendations(rates, EMA, lowerBW, upperBW, extLowerBW, extUpperBW);
            //            chartRecommendationsSummary(EMA, upperBW, lowerBW, extUpperBW, extLowerBW, ma[2], rates);
            /* alert("EMA \n"+EMA);
            alert("2Sigma \n"+twoSigma);
            alert("3 Sigma \n"+threeSigma);
            alert("Lower bandwidth \n"+lowerBW);
            alert("Upper bandwidth \n"+upperBW);
            alert("Ext lower bandwidth \n"+extLowerBW);
            alert("Ext upper bandwidth \n"+extUpperBW);
            alert("percent B \n"+percentB);
            alert("bandwidth \n"+bandWidth);*/
            // Calling The Handler Fuction To Draw the Chart
            functionHandler([dates,ma]);                
        });
        
        
    /***
         * this Was Disabled for Performace
         * this reads the Data from the Locasa servlet
         * now we are using YQL for Retriving the data this will Improve the
         * speed of application by Double
        xmlObj.onreadystatechange = function()
        {
            if(xmlObj.readyState==4 && xmlObj.status==200)
            {
                var csvData = xmlObj.responseText;
                //alert("My Call \n"+csvData);
                if(csvData.length < 1)
                {
                    alert("There is No Data Exist for the Given Symbol");
                    FI.applyMask(0);
                    functionHandler(null);
                    return;
                //return;
                }
                
                var dates = getSpecifiedData(csvData, "date","date");
                var rates = getSpecifiedData(csvData, "close","number");
                
                var ma = [];
                ma[0] = rates;
                ma[1] = StockAnalysis.getMovingAverages(rates, 5);
                ma[2] = StockAnalysis.getMovingAverages(rates, 13);
                ma[3] = StockAnalysis.getMovingAverages(rates, 50);
                
                // Retriving The Starting and Ending Date of The Current Stock
                FI.startDate = dates[0];
                FI.endDate = dates[dates.length-2];
                //alert(FI.startDate);
                
                // Calling The Handler Fuction To Draw the Chart
                functionHandler([dates,ma]);                
            }
        }
    //xmlObj.send(null);
         * This Block Disabled Temporarly Because of performance Issuse
         */
       
       
    },
    
    /**
     * This Mehtod Checks Whether The Ticeker Name Already Exist in the Chart Table Data
     * it returns true if the data exist
     * false otherwise
     */
    isTickerAlreadyExist : function(pTickerName)
    {
        // Convertinf to Lower Case for Comparison
        //pTickerName += "5-Day";
        //pTickerName = pTickerName;
        //alert("Selected Tickers are : "+this.selectedTickers);
        for(i=0;i<this.selectedTickers.length;i++)
        {
            if(pTickerName.toLowerCase() == this.selectedTickers[i].toLowerCase())
                return true;
        }
        return false;
    },
    
    /**
     * This Method Adds a New Ticker name to The existing Compare Ticker list
     */
    addNewTickerToCompare: function(tName,dontTrigger,handler)
    {
        tName = !tName?$(this.newTickerText).val():tName;
        dontTrigger = !dontTrigger?false:dontTrigger;
        
        var tickerName = tName;
        
        // Adding the Ticker to Return Assessment List
        //ReturnAssessmentHandler.addNewTickerToCompare(tickerName, false);
        tickerName = tickerName.toUpperCase();
        
        if(tickerName.length < 1){
            // Calling the Handler That the Adding Process Abort
            handler(false);
            return;
        }
        var tickerExist = false;        
        
        // if there are no tickers then clear the old text
        //alert($('input[name="fiTickerChk"]').length);
        //if($('input[name="fiTickerChk"]').length<1)
        //    $(this.compareTickerDiv).html("");m
            
        $('input[name="fiTickerChk"]',this.compareTickerDiv).each(function(){
            //alert($(this).val());
            if($(this).val() == tickerName)
            {
                tickerExist = true;
                if(!dontTrigger)
                    alert('Symbol already exist');
                $(this).focus();
            }                           
        });
            
        if(tickerExist)
        {
            $(this.newTickerText).val("");
            // Calling the Handler
            handler(false);
            return;
        }                    
        
        // Adding to the Tickers List
        this.selectedTickers.push(tickerName);
        
        
        var newTicker = document.createElement('input');
            
        $(newTicker).attr({
            type:'checkbox',
            name:'fiTickerChk',
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
        
        try{
            //$(newTicker).after(tickerName);
            //$(newTicker).after("tickerName");
            //alert("New Ticker Is : "+newTicker);
            var label = document.createElement('label');
            $(label).append(newTicker).append(tickerName);            
        
            $(label).css({
                'padding':'5px',
                'display':'inline-block'
            });
        }catch(e){
            alert(e);
        }        
        
        $(this.compareTickerDiv).prepend(label);
        $(this.newTickerText).val("");
        
        // trigger if the user not to do
        if(!dontTrigger)
        {
            $(newTicker).attr("checked","checked");
            $(newTicker).trigger("change", [handler]);
        }
        
    //alert('Adding Ticker hi '+newTicker);
    //        DOMElement.makeAsClosable([label], {            
    //            CSS:'closeBtn'
    //        }, function(obj){
    //            var id = tickerName.replace(/[\^\.]/gi, '_')+"ChartDiv";
    //            $('#'+id).remove();
    //        });    
    },
    
    
    /**
     * This Method Used to Remove the Ticker frm the Comparison
     */
    removeTicker : function(ticker){
        
    },
    
    /**
     * This Method removes the Duplicate Ticker names and return the New Array
     * Note : this won't allow duplicate of tickers they will be automatically removed
     */
    removeDuplicateTickers : function(newTickers)
    {
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
     * This Method Used to Add the Ticker Checkbox Listener
     */
    addCheckboxTickerListener: function(obj)
    {        
        var FI = FundamentalIndicatorHandler;                    
        
        // adding the title attribute to the element
        $(this).attr()
        
        //alert(this);
        $(obj).change(function(evt,handler)
        {
            var ticker = $(this).val();
            
            //alert(ticker);
            //alert(obj.checked);
            var ind;
            if(obj.checked)
            {
                // Changing to the Upper Case
                ticker = ticker.toUpperCase();                
                ind = FI.hiddenTickers.getIndex(ticker);
                
                // Checking Whether the Data Requested previously or not
                // if didn't the request for the data from the server'
                if(ind < 0)
                {
                    //alert('Adding new Data');
                    FI.createNewChartDiv(ticker,function(addedTicker)
                    {
                        // if User Portfolio enable then only Store 
                        if(FI.storeInDB){
                            if(addedTicker){
                                //alert(addedTicker);
                                $.get('stockUtilHandler.do',{
                                    mode:0,
                                    ticker:addedTicker,
                                    no:1
                                },function(data){
                                    //alert(data);
                                    });
                            }
                        }
                    });
                }
                //else show the hidden div
                else
                {
                    var id = ticker.replace(/[\^\.]/gi, '_');
                    $('#'+id+'ChartDiv').show();
                    StockCore.goToByScroll($('#'+ticker+'ChartDiv'));
                    FI.hiddenTickers.removeElement(ticker);
                }                
            }
            // When User Deselect the Check boxes of the Comparision Checkboxes
            else
            {
                try{
                    //alert(FI.selectedTickers);
                    ind = FI.selectedTickers.getIndex(ticker);
                    //alert(ind);
                    FI.selectedTickers.removeElement(ticker);
                    //alert(FI.selectedTickers);
                    FI.hiddenTickers.push(ticker);
                    id = ticker.replace(/[\^\.]/gi, '_');
                    $('#'+id+'ChartDiv').hide();
                }catch(e){
                    alert("Error While adding Listener to Check Box"+e);
                }
            //alert('Index is : '+FI.selectedTickers);
            }
        });
    },
    
    /**
     * This method creates a new Chart Div for The New Fundamental Indicator Symbol name
     */
    createNewChartDiv: function(ticker,handler)
    {   
        //alert(ticker);
        //        
        //        if(this.isTickerAlreadyExist(ticker))
        //        {
        //            alert('Ticker Already Exist');
        //            return;
        //        }
        
        // Adding The Ticker name to the selected list
        //this.selectedTickers.push(ticker);
        
        var FI = FundamentalIndicatorHandler;
        var dataTable = new google.visualization.DataTable();
        var dataTableLine = new google.visualization.DataTable();
        var dataView = null;
        var dataViewLine = null;
        var outerDiv = document.createElement('div');
        var foldDiv = document.createElement('div');
        var chartDiv = document.createElement('div');
        var chartDivL = document.createElement('div');
        var maBlock = document.createElement('div');
        var summaryDiv = document.createElement('div');
        
       
        
        var bodyTable = document.createElement('table');
        $(bodyTable).attr({
            'border':'0'
        });
        
                
        $(maBlock).
        append("Compare With : <input type='checkbox' name='maChk' value='5-Day' />5-Day").
        append("<input type='checkbox' name='maChk' value='13-Day' />13-Day").
        append("<input type='checkbox' name='maChk' value='50-Day' />50-Day").
        append("<input type='checkbox' name='maChk' value='EMA' />EMA").
        append("<input type='checkbox' name='maChk' value='lowerband' />Lower band").
        append("<input type='checkbox' name='maChk' value='upperband' />Upper band").
        append("<input type='checkbox' name='maChk' value='ext.lowerband' />Ext. Lower band").
        append("<input type='checkbox' name='maChk' value='ext.upperband' />Ext. Upper band")
        .css({
            'text-align':'right',
            'background':'#0b6998',
            'font-size':'14px',
            'color':'white',
            'padding':'5px'
        });
        
        var id = ticker.replace(/[\^\.]/gi, '_');
        //alert(id);
        
        $(outerDiv).attr({
            'id':id+'ChartDiv',
            'class':'foldableDiv'
        })
        .css({
            'padding':'0px'
        });
        
        $(chartDiv).css({
            'width':'600px',
            'height':'300px',
            'overflow':'hidden',
            'z-index':'0'
        }).attr({
            'name':'chart'
        });
        $(chartDivL).css({
            
            'overflow':'hidden',
            'z-index':'0',
            'display':'none'
        }).attr({
            'name':'chartL'
        });
        
        $(summaryDiv).css({
            'height':'300px',
            'overflow':'auto'
        });
        
        $(outerDiv).append("<p class='titleheading' tabindex='1' title='Click to toggle the folding'>Moving Average Comparison of <b>"+ticker+"</b></p>");
        $(outerDiv).append(maBlock);
        $(foldDiv).append(maBlock);
        //$(foldDiv).append(chartDiv);
        
        var row = document.createElement('tr');
        var td = document.createElement('td');        
        $(td).append(chartDiv);
        $(td).append(chartDivL);
        $(row).append(td);
        td = document.createElement('td');
        $(td).append(summaryDiv).css({
            'vertical-align':'top'
        });
        $(row).append(td);
        
        $(bodyTable).append(row);
        
        $(foldDiv).append(bodyTable);
        
        $(outerDiv).append(foldDiv);
        $('#chartsDivFI').prepend(outerDiv);
        
        $('.titleheading',outerDiv).click(function(){
            $(foldDiv).slideToggle(1000, null);
        });
        
        
        //var newChart = new google.visualization.AnnotatedTimeLine(chartDiv);        
        var newChart = new google.visualization.AnnotatedTimeLine(chartDiv);
        var newLineChart = new google.visualization.LineChart(chartDivL);
        google.visualization.events.addListener(newChart, 'ready', function(){
            //FI.applyMask(chartDiv, 0);
            });
        
        function myHandler(data)
        {
            // Checking whether the data existed or not
            if(data == null)
            {
                // if data not found then remove the newly added div
                $(outerDiv).remove();
                // and call the Handler with no Argument to say that the transaction is invalid
                handler();
                // also remove the added ticker
                //alert(FI.compareTickerDiv);
                
                $(FI.compareTickerDiv).find(':input').each(function()
                {
                    if(ticker == $(this).val())
                    {
                        //alert('hi');
                        $(this).parent('label').remove();                                             
                    }
                });
                
                return;
            }
                
            try
            {
                var dates = data[0];                
                var ma = data[1];
                var ma1 = ma[0];
                var ma5 = ma[1];
                var ma13 = ma[2];
                var ma50 = ma[3];
                var EMA = ma[4];
                var bB = ma[5];
                var lB= ma[8];
                //alert(lB);
                var uB= ma[9];
                var ext_lB= ma[10];
                var ext_uB= ma[11];
                var cR = chartRecommendationsSummary(EMA, uB, lB,  ext_uB,ext_lB, ma[2], ma[0]);
                
                dataTable.addColumn('date','Date');
                dataTable.addColumn('number',ticker+"-1Day");
                dataTable.addColumn('string',"recommendations");
                dataTable.addColumn('number',ticker+"-5Day");
                dataTable.addColumn('number',ticker+"-13Day");
                dataTable.addColumn('number',ticker+"-50Day");
                dataTable.addColumn('number',ticker+"-EMA");
                dataTable.addColumn('number',ticker+"-LowerBand");
                dataTable.addColumn('number',ticker+"-UpperBand");
                dataTable.addColumn('number',ticker+"-Ext.LowerBand");
                dataTable.addColumn('number',ticker+"-Ext.UpperBand");
                dataTable.addColumn('number',"Spy-1Day");
                dataTable.addColumn('number',"Spy-5Day");
                dataTable.addColumn('number',"Spy-13Day");
                dataTable.addColumn('number',"Spy-50Day");
                //--------------------Line chart data-------------------------//
                
                dataTableLine.addColumn('date','Date');
                dataTableLine.addColumn('number','Price');
                dataTableLine.addColumn({
                    type:'string',
                    role:'annotation'
                });
               
                dataTableLine.addColumn('number','EMA');
                dataTableLine.addColumn('number','LB');
                dataTableLine.addColumn('number','UB');
                dataTableLine.addColumn('number','ELB');
                dataTableLine.addColumn('number','EUB');
                
                
                
                //--------------------End of Line chart data------------------//
                var rcmds = ma[14];//chart recommendations
                
                // Bench Mark Data
                var bDates = FI.benchMarkData[0];
                var bMa = FI.benchMarkData[1];
                var bMa1 = bMa[0];
                var bMa5 = bMa[1];
                var bMa13 = bMa[2];
                var bMa50 = bMa[3];
            
                var rows = [];
                var LCrows= [];
                var counter = 0;
                
                for(var i=0;i<dates.length;i++,counter++)
                {
                    //$('#tempDiv').append("<tr><td>"+dates[i]+"</td><td>"+bDates.indexOf(dates[i])+"</td></tr>");
                    rows[i] = [dates[i],ma1[i],rcmds[i],ma5[i],ma13[i],ma50[i],EMA[i],lB[i],uB[i],ext_lB[i],ext_uB[i],bMa1[i],bMa5[i],bMa13[i],bMa50[i]];
                    
                }
                
                for(var j=0;j<15;j++,counter++){
                    //                    LCrows[i] =[dates[i],ma1[i],rcmds[i],(ma1[i]+2),(ma1[i]-2),EMA[i],lB[i],uB[i],ext_lB[i],false,ext_uB[i],false]; 
                    LCrows[j] =[dates[j],ma1[j],rcmds[j],EMA[j],lB[j],uB[j],ext_lB[j],ext_uB[j]]; 
                }
                
                dataTable.addRows(rows);
                dataTableLine.addRows(LCrows);
                var viewCols = [];
                dataView = new google.visualization.DataView(dataTable);
                dataViewLine = new google.visualization.DataView(dataTableLine);
                
                viewCols = [0,1,2,6,7,8,9,10];
                
                if(FI.benchMark.checked){
                    viewCols.push(11);
                }
                dataView.setColumns(viewCols);
                FI.drawChart(newChart, dataView, "pTitle", "pXtitle", "pYtitle");
                FI.drawChart(newLineChart, dataViewLine, 'pTitle', 'pXtitle', 'pYtitle',2,true);
                
                //now call the Handler with the Current Ticer name as Argument
                handler(ticker)
                
                // Adding the Current Chart Data to the stack
                var dataObj = {
                    chart:newChart,
                    data:dataTable,
                    dataView:dataView,
                    div:outerDiv
                    
                };
                FI.chartsDataStack.push(dataObj);
                
                
                FI.applyMask(outerDiv, 0);                
                
                var len = $('input[name="maChk"]').length;
                for(var x=0;x<len;x++){
                    if(x>2)
                        $('input[name="maChk"]')[x].checked = true;
                }
                
                $('input[name="maChk"]',outerDiv).change(function()
                {
                    //var vCols = [0,1,2,6,7,8,9,10];
                    var vCols = [0,1,2];
                    
                    if(FI.benchMark.checked){
                    //  vCols.push(11);
                    // addNewTickerToCompare('SPY', dontTrigger, handler);
                    }
                    
                    //FI.applyMask(chartDiv, 1);
                    $('input[name="maChk"]',outerDiv).each(function(ind){
                        if(this.checked)
                        {
                            vCols.push(ind+3);
                            if(FI.benchMark.checked){
                            //vCols.push(ind+3+8);
                            }
                        }                                            
                    });
                    dataView.setColumns(vCols);                    
                    FI.drawChart(newChart, dataView, "", "", "",1);
                });
            }
            catch(e){
                alert(e);
                FI.applyMask(outerDiv, 0);
            }
            try{
                StockData.loadTickerSummary(ticker, function(data){
                    $(summaryDiv).append(StockData.makeSummaryDiv(data,cR));
                    DOMElement.makeAsStrippyTable($('table',summaryDiv)[0],{
                        CSS:'strippyTable'
                    });
                });
            }catch(e){
                alert(e);
            }
        }
        
        //alert(outerDiv);        
        FI.applyMask(outerDiv, 1);
        
        
        // First Loading the Bench mark Data
        if(FI.benchMarkData == null)
        {        
            FundamentalIndicatorHandler.getFundamentalIndicatorDataForTicker("SPY", "", "", function(data)
            {
                FI.benchMarkData = data;
                FI.getFundamentalIndicatorDataForTicker(ticker, "", "",myHandler);
            //var ticker = $('#tickerName').val();
            //alert("Ticker : "+ticker);
            //ticker = (ticker==undefined||ticker.length<1)?"GOOG":ticker;
            //FI.createNewChartDiv(ticker);
            });        
        }
        else{
            FI.getFundamentalIndicatorDataForTicker(ticker, "", "",myHandler);
        }
        
    }
}