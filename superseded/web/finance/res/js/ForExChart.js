/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var forexWatchChart = {
   
    maskDivForex : null,
    controlDiv:null,
    /** This Object holds the Starting Date */
    startDate : null,
    /** This Object hodsl the Ending Date */
    endDate : null, 
    /* 
     * this hiddenCurrencyPair is useful for store the total currency pair list
     */
    hiddenCurrencyPair : [],
  
    initializeForEx: function(dates,rates,symbol)
    {
        this.controlDiv = document.getElementById('TempDiv');
        this.maskDivForex = document.createElement('div');
        $(this.controlDiv).append(this.maskDivForex);
        var fx  = forexWatchChart;
        //        fx.applyMaskForexChart(this.controlDiv, 1);
        var ma = [];
        ma[0] = rates;
        ma[1] = StockAnalysis.getMovingAverages(rates, 5);
        ma[2] = StockAnalysis.getMovingAverages(rates, 13);
        ma[3] = StockAnalysis.getMovingAverages(rates, 50);
        fx.startDate = dates[0];
        fx.endDate = dates[dates.length-1];
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
        fx.createNewChartDiv(symbol,[dates,ma]);
    },
    createNewChartDiv: function(symbol,data)
    {
        try
        {
            var dataTable = new google.visualization.DataTable();
            var dataTableLine = new google.visualization.DataTable();
            var dataView = null;
            var dataViewLine = null;
            var outerDiv = document.createElement('div');
            var foldDiv = document.createElement('div');
            var chartDiv = document.createElement('div');
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
        
            //        var id = ticker.replace(/[\^\.]/gi, '_');
            var id = symbol;
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
        
            $(summaryDiv).css({
                'height':'300px',
                'overflow':'auto'
            });
        
            $(outerDiv).append("<p class='titleheading' tabindex='1' title='Click to toggle the folding'>Moving Average Comparison of <b>"+id+"</b></p>");
            $(outerDiv).append(maBlock);
            $(foldDiv).append(maBlock);
            //$(foldDiv).append(chartDiv);
        
            var row = document.createElement('tr');
            var td = document.createElement('td'); 
            var fx  = forexWatchChart;
            $(td).append(chartDiv);
            $(row).append(td);
            td = document.createElement('td');
            $(td).append(summaryDiv).css({
                'vertical-align':'top'
            });
            $(row).append(td);
        
            $(bodyTable).append(row);
        
            $(foldDiv).append(bodyTable);
        
            $(outerDiv).append(foldDiv);
            $('#chartDivCC').prepend(outerDiv);
        
            $('.titleheading',outerDiv).click(function(){
                $(foldDiv).slideToggle(1000, null);
            });
        
        
            //var newChart = new google.visualization.AnnotatedTimeLine(chartDiv);        
            var newChart = new google.visualization.AnnotatedTimeLine(chartDiv);
            //var newLineChart = new google.visualization.LineChart(chartDiv);
            google.visualization.events.addListener(newChart, 'ready', function(){
                fx.applyMaskForexChart(outerDiv, 0);
                //FI.applyMask(chartDiv, 0);
                });
        
            function myHandler(data)
            {
                try
                {
                    fx.applyMaskForexChart(outerDiv, 1);
                    var dates = data[0];    
                    var ma = data[1];
                    var ma1 = ma[0];
                    var ma5 = ma[1];
                    var ma13 = ma[2];
                    var ma50 = ma[3];
                    var EMA = ma[4];
                    var bB = ma[5];
                    var lB= ma[8];
                    var uB= ma[9];
                    var ext_lB= ma[10];
                    var ext_uB= ma[11];
                    var cR = chartRecommendationsSummary(EMA, uB, lB,  ext_uB,ext_lB, ma[2], ma[0]);
                    dataTable.addColumn('date','Date');
                    dataTable.addColumn('number',id+"-1Day");
                    dataTable.addColumn('string',"recommendations");
                    dataTable.addColumn('number',id+"-5Day");
                    dataTable.addColumn('number',id+"-13Day");
                    dataTable.addColumn('number',id+"-50Day");
                    dataTable.addColumn('number',id+"-EMA");
                    dataTable.addColumn('number',id+"-LowerBand");
                    dataTable.addColumn('number',id+"-UpperBand");
                    dataTable.addColumn('number',id+"-Ext.LowerBand");
                    dataTable.addColumn('number',id+"-Ext.UpperBand");
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
                    dataTableLine.addColumn({
                        type:'boolean',
                        role:'certainity'
                    });
                    dataTableLine.addColumn('number','EUB');
                    dataTableLine.addColumn({
                        type:'boolean',
                        role:'certainity'
                    });
                
                
                    //--------------------End of Line chart data------------------//
                    var rcmds = ma[14];//chart recommendations
                
            
                    var rows = [];
                    var LCrows= [];
                    var counter = 0;
                    for(var i=0;i<dates.length;i++,counter++)
                    {
                    
                        //$('#tempDiv').append("<tr><td>"+dates[i]+"</td><td>"+bDates.indexOf(dates[i])+"</td></tr>");
                        //                    rows[i] = [dates[i],ma1[i],rcmds[i],ma5[i],ma13[i],ma50[i],EMA[i],lB[i],uB[i],ext_lB[i],ext_uB[i],bMa1[i],bMa5[i],bMa13[i],bMa50[i]];
                        rows[i] = [dates[i],ma1[i],rcmds[i],ma5[i],ma13[i],ma50[i],EMA[i],lB[i],uB[i],ext_lB[i],ext_uB[i]];
                    
                    }
                    for(var j=0;j<30;j++,counter++){
                        //                    LCrows[i] =[dates[i],ma1[i],rcmds[i],(ma1[i]+2),(ma1[i]-2),EMA[i],lB[i],uB[i],ext_lB[i],false,ext_uB[i],false]; 
                        LCrows[j] =[dates[j],ma1[j],rcmds[j],EMA[j],lB[j],uB[j],ext_lB[j],false,ext_uB[j],false]; 
                    }
                
                    dataTable.addRows(rows);
                    dataTableLine.addRows(LCrows);
                    var viewCols = [];
                    dataView = new google.visualization.DataView(dataTable);
                    dataViewLine = new google.visualization.DataView(dataTableLine);
                
                    viewCols = [0,1,2,6,7,8,9,10];
                    //                if(FI.benchMark.checked){
                    //                    viewCols.push(11);
                    //                }
                    dataView.setColumns(viewCols);
                     
                    FundamentalIndicatorHandler.drawChart(newChart, dataView, "pTitle", "pXtitle", "pYtitle");
                    //FI.drawChart(newLineChart, dataViewLine, 'pTitle', 'pXtitle', 'pYtitle',2,true);
                
                    //now call the Handler with the Current Ticer name as Argument
                    //                handler(ticker)
                
                    // Adding the Current Chart Data to the stack
                    var dataObj = {
                        chart:newChart,
                        data:dataTable,
                        dataView:dataView,
                        div:outerDiv
                    
                    };
                    
                    var len = $('input[name="maChk"]').length;
                    
                    for(var x=0;x<len;x++){
                        if(x>2)
                            $('input[name="maChk"]')[x].checked = true;
                    }
                    $('input[name="maChk"]',outerDiv).change(function()
                    {
                        var vCols = [0,1,2];
                        $('input[name="maChk"]',outerDiv).each(function(ind){
                            if(this.checked)
                            {
                                vCols.push(ind+3);
                            }                                            
                        });
                        dataView.setColumns(vCols);                    
                        FundamentalIndicatorHandler.drawChart(newChart, dataView, "", "", "",1);
                    });
                }
                catch(e){
                    alert("MyData Exception "+e);
                }
                try{
                    $(summaryDiv).append(cR);
                }catch(e){
                    alert("Stock Data Exception "+e);
                }
            }
            myHandler(data);
        }catch(e)
        {
            alert("Exception is Raised in Forex Chart JS "+e);
        }    
        
    },
    applyMaskForexChart: function(pDiv,state)
    {
        if(state == 1)
        {  
            //            alert($(pDiv).width());
            //            alert($(pDiv).height());
            //alert($(this.controlsDiv).offset().left);
            $(this.maskDivForex).css({
                'position':'absolute',
                '-webkit-border-radius':'10px',
                '-moz-border-radius':'10px',
                width: $(pDiv).width()+'px',
                height: $(pDiv).height()+'px',
                //                width: 500+'px',
                //                height: 500+'px',
                align:'center',
                verticalAlign: 'middle',
                display:'block',
                fontSize: '18px',
                color: 'white',
                background: '#0b6998'
            //'background-image' :"url('res/images/overlay_bg.jpg')"
            });            
            $(this.maskDivForex).html("<table style='width:100%;height:100%'><tr><td style='vertical-align:middle;text-align:center'><img src='res/images/334.gif' /></td></tr></table>");
            $(this.maskDiv).offset($(pDiv).offset());
            $(this.maskDiv).offset(50);
            $(this.maskDivForex).fadeTo(0, 0.8, null);
            $(this.maskDivForex).show();
            $(pDiv).find('*').each(function(){
                this.disabled = true;
            });
        }
        else
        {
            $(pDiv).find('*').each(function(){
                this.disabled = false;
            });
            $(this.maskDivForex).hide();
        }
    },
    chartRecommendations: function(dates,rates,symbol)
    {     
        var ma = [];
        ma[0] = rates;
        ma[1] = StockAnalysis.getMovingAverages(rates, 5);
        ma[2] = StockAnalysis.getMovingAverages(rates, 13);
        ma[3] = StockAnalysis.getMovingAverages(rates, 50);
        var EMA = [];
        var bB = [];
        var twoSigma= [];
        var threeSigma= [];
        var upperBW=[];
        var lowerBW=[];
        var extLowerBW=[];
        var extUpperBW=[];
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
        var cR = chartRecommendationsSummary(EMA,upperBW, lowerBW,  extUpperBW,extLowerBW, ma[2], ma[0]); 
        return cR;
    },
    addNewTickerToCompare: function(tName,dontTrigger,handler)
    {
        tName = !tName?$(this.newTickerText).val():tName;
        dontTrigger = !dontTrigger?false:dontTrigger;
        
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
    }
    
    
    
}
function addCurrencyCompare(currencyPair)
{
    var newTicker = document.createElement('input');
    var compareCurrencyList = document.getElementById('currencyCompareDiv');
    $(newTicker).attr({
        type:'checkbox',
        checked: true,
        //                        name:'fiTickerChk',
        name:'currencyTickerChk',
        value:currencyPair,
        title: 'Add '+currencyPair+' To Compare'
    });
                    
    try{
        var label = document.createElement('label');
        $(label).append(newTicker).append(currencyPair);            
        $(label).css({
            'padding':'5px',
            'display':'inline-block'
        });
    }catch(e){
        alert("Add Currency Compare CC Page \n"+e);
    } 
                    
    $(compareCurrencyList).prepend(label);
    addCheckboxTickerListener(newTicker);
//                compareTickers = $(compareCurrencyList).find('input[name="currencyTickerChk"]');
//                $(compareTickers).each(function(ind){
//                    addCheckboxTickerListener(this,ind);
//                }); 
}
               
function addCurrencyComparewithUncheck(currencyPair)
{
    var newTicker = document.createElement('input');
    var compareCurrencyList = document.getElementById('currencyCompareDiv');
    $(newTicker).attr({
        type:'checkbox',
        checked: false,
        //                        name:'fiTickerChk',
        name:'currencyTickerChk',
        value:currencyPair,
        title: 'Add '+currencyPair+' To Compare'
    });
                    
    try{
        var label = document.createElement('label');
        $(label).append(newTicker).append(currencyPair);            
        $(label).css({
            'padding':'5px',
            'display':'inline-block'
        });
    }catch(e){
        alert("Add Currency Compare CC Page \n"+e);
    } 
                    
    $(compareCurrencyList).prepend(label);
    addCheckboxTickerListener(newTicker);
//                compareTickers = $(compareCurrencyList).find('input[name="currencyTickerChk"]');
//                $(compareTickers).each(function(ind){
//                    addCheckboxTickerListener(this,ind);
//                }); 
}             
               
function addCheckboxTickerListener(obj)
{   
    $(obj).change(function(evt,handler)
    {
        var ticker = $(this).val();
        var ind;
        if(obj.checked)
        {
            
            gettingDataforexWatchList(ticker);
        }
        else
        {
            try{
                $('#'+ticker+'ChartDiv').hide();
            }catch(e){
                alert("Error While adding Listener to Check Box"+e);
            }
        //alert('Index is : '+FI.selectedTickers);
        }
    });
}

