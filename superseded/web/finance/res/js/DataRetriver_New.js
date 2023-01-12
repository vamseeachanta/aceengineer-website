/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var StockData = {
    
    yqlURL:"http://query.yahooapis.com/v1/public/yql?q=",
    dataFormat:"&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?",
    //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22CIG%22)%0A%09%09&
    // to get the stock quotes CSV   //http://download.finance.yahoo.com/d/quotes.csv?s=YHOO,AAPL,GOOG,MSFT&f=aa2bb2b3b4cc1c3c6c8dd1d2ee1e7e8e9ghjkg1g3g4g5g6ii5j1j3j4j5j6k1k2k4k5ll1l2l3mm2m3m4m5m6m7m8nn4opp1p2p5p6qrr1r2r5r6r7ss1s7t1t7t8vv1v7ww1w4xy
    /**
     * This Method Loads the Ticker Summary and calls
     * the handler when the Data Loaded
     */
    loadTickerSummary: function(ticker,handler,optionalData){
        optionalData = !optionalData?"":optionalData;
        //alert("Optional Data :"+optionalData[0]);
        //var query = this.getQuery(ticker);
        //var url = this.yqlURL + query + this.dataFormat;
        //alert(url);
        // $.getJSON(url, function(json) {//YQL Request
        // alert(json);
        //    handler(json,optionalData);
        // });   
        //        var url = "http://download.finance.yahoo.com/d/quotes.csv?s="+ticker+"&f=aa2bb2b3b4cc1c3c6c8dd1d2ee1e7e8e9ghjkg1g3g4g5g6ii5j1j3j4j5j6k1k2k4k5ll1l2l3mm2m3m4m5m6m7m8nn4opp1p2p5p6qrr1r2r5r6r7ss1s7t1t7t8vv1v7ww1w4xy";
        var url = "http://download.finance.yahoo.com/d/quotes.csv?s="+ticker+"&f=aa2bb2b3b4cc1c3c6c8dd1d2ee1e7e8e9ghjkg1g3g4g5g6ii5j1j3j4j5j6k1k2k4k5ll1l2l3mm2m3m4m5m6m7m8nn4opp1p2p5p6qrr1r2r5r6r7ss1s7t1t7t8vv1v7ww1w4xy";
        doAjax(url, "", function(data){
            data = parseCSV(data);
            handler(data,optionalData);
        });
       
    },
    
    /**
     * This Method Makes the Query from the Given Symbol
     */
    getQuery : function(symbol){
        return "select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22" + symbol + "%22)%0A%09%09&";
    },
    
    /**
     * This method makes the Summary Div of the Given Summary Object
     */
    makeSummaryDiv : function(summaryObj,cR){
        var div = document.createElement('div');
        
        var o = summaryObj.query.results.quote;        
        o.Name = getProperty(o.Name);
        o.Ask = getProperty(o.Ask = MyMath.round(o.Ask, 2));
        o.StockExchange = getProperty(o.StockExchange);
        o.LastTradeDate = getProperty(o.LastTradeDate);
        o.LastTradePriceOnly = getProperty(o.LastTradePriceOnly = MyMath.round(o.LastTradePriceOnly, 2));
        o.YearLow = getProperty(o.YearLow = MyMath.round(o.YearLow,2));
        o.YearHigh = getProperty(o.YearHigh = MyMath.round(o.YearHigh,2));
        o.FiftydayMovingAverage = getProperty(o.FiftydayMovingAverage = MyMath.round(o.FiftydayMovingAverage,2));
        o.TwoHundreddayMovingAverage = getProperty(o.TwoHundreddayMovingAverage = MyMath.round(o.TwoHundreddayMovingAverage,2));
        
        function getProperty(p){            
            return (!p||p==null)?"-N.A-":p;
        }
        
        var cnt = "<table cellspacing='0' cellpadding='0' border='1' width='100%'>";
        cnt += "<thead><tr>";
        cnt += "<th colspan=2>"+o.Name+" Details</th>";
        cnt += "</tr></thead>";
        cnt += "<tbody>";
        cnt += "<tr><td>Symbol Name</td><td>"+o.Name+"</td></tr>";
        cnt += "<tr><td>Current Price</td><td>"+o.Ask+"</td></tr>";
        cnt += "<tr><td>Volume</td><td>"+o.Volume+"</td></tr>";
        cnt += "<tr><td>Market Capital</td><td>"+o.MarketCapRealtime+"</td></tr>";
        cnt += "<tr><td>Stock Exchange Name</td><td>"+o.StockExchange+"</td></tr>";        
        //        cnt += "<tr><td>Last Trade Date</td><td>"+o.LastTradeDate+"</td></tr>";
        //        cnt += "<tr><td>Last Trade Price</td><td>"+o.LastTradePriceOnly+"</td></tr>";
        cnt += "<tr><td valign='top'>Recommendations Summary</td><td>"+cR+"</td></tr>";
        //cnt += "<tr><td>Average Daily Volume</td><td>"+o.AverageDailyVolume+"</td></tr>";
        //cnt += "<tr><td>Year Low Value</td><td>"+o.YearLow+"</td></tr>";
        //cnt += "<tr><td>Year High Value</td><td>"+o.YearHigh+"</td></tr>";
        //cnt += "<tr><td>50 day Moving Average</td><td>"+o.FiftydayMovingAverage+"</td></tr>";
        //cnt += "<tr><td>200 day Moving Average</td><td>"+o.TwoHundreddayMovingAverage+"</td></tr>";
        cnt += "</tbody>";
        cnt += "</table>";
        
        $(div).html(cnt);
        return div;
    },
    
    /**
     * This Method Retrives the Historical Data from the Yahoo Fianace service from the Specified Dates
     */
    getHistoricalData : function(ticker,sDate,eDate,successHandler,errorHandler){
        // Escaping Special Characters
        try{
            //alert("Before Skipping Special "+ticker);
            ticker = escape(ticker);
        //alert("After Skipping Special "+ticker);
        }catch(e){
            alert("Error While Using escape function "+e);
        }
        var tokens1 = StockCore.splitDate(sDate);
        var tokens2 = StockCore.splitDate(eDate);
        var query = "s="+ticker+"&a="+tokens1[0]+"&b="+tokens1[1]+"&c="+tokens1[2]+"&d="+tokens2[0]+"&e="+tokens2[1]+"&f="+tokens2[2]+"&g=d&ignore=.csv";        
        //query = encodeURIComponent(query);
        //alert("Query is :"+(query));
        doAjax("http://ichart.finance.yahoo.com/table.csv?"+query, "", function(data){
            //alert("Retrived Data Is :"+data);
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
            
            var dates = getSpecifiedData(csvData, "date","date");
            var rates = getSpecifiedData(csvData, "close","number");
            successHandler([dates,rates]);
        });
    }
}
/*
 *This function used to parse the csv data from the ajax CSV data.
 **/
function parseCSV(data){
    data = data.replace("<p>", "");
    data = data.replace("</p>", "");
    data = data.replace("<strong>", "");
    data = data.replace("</strong>", "");
    data = data.replace("<strong>", "");
    data = data.replace("</strong>", "");
    data = data.replace("<body>", "");
    for(var j=0 ;j<81;j++)
        data = data.replace('"','');
    var cNames = ["Ask","AverageDailyVolume","Bid","AskRealtime",'BidRealtime',"BookValue","Change&PercentChange","Change","Commission","ChangeRealtime","AfterHoursChangeRealtime","DividendShare","LastTradeDate","TradeDate","EarningsShare","ErrorIndicationreturnedforsymbolchangedinvalid","EPSEstimateCurrentYear","EPSEstimateNextYear","EPSEstimateNextQuarter","DaysLow","DaysHigh","YearLow","YearHigh","HoldingsGainPercent","AnnualizedGain","HoldingsGain","HoldingsGainPercentRealtime","HoldingsGainRealtime","MoreInfo","OrderBookRealtime","MarketCapitalization","MarketCapRealtime","EBITDA","ChangeFromYearLow","PercentChangeFromYearLow","LastTradeRealtimeWithTime","ChangePercentRealtime","ChangeFromYearHigh","PercebtChangeFromYearHigh","LastTradeWithTime","LastTradePriceOnly","HighLimit","LowLimit","DaysRange","DaysRangeRealtime","FiftydayMovingAverage","TwoHundreddayMovingAverage","ChangeFromTwoHundreddayMovingAverage","PercentChangeFromTwoHundreddayMovingAverage","ChangeFromFiftydayMovingAverage","PercentChangeFromFiftydayMovingAverage","Name","Notes","Open","PreviousClose","PricePaid","ChangeinPercent","PriceSales","PriceBook","ExDividendDate","PERatio","DividendPayDate","PERatioRealtime","PEGRatio","PriceEPSEstimateCurrentYear","PriceEPSEstimateNextYear","Symbol","SharesOwned","ShortRatio","LastTradeTime","TickerTrend","OneyrTargetPrice","Volume","HoldingsValue","HoldingsValueRealtime","YearRange","DaysValueChange","DaysValueChangeRealtime","StockExchange","DividendYield"]
    var cols = data.split(",");
    //alert(cols);
    var qData = [];
    var json = '{"query":{"results":{"quote":{'
   

    for(var i=0,k=0;i<cols.length;i++,k++){
        if(cols.length != 80 && i == 51 ){
            cols[i+1]= cols[i]+cols[i+1];
            k++;            
        }
        qData[i]=cols[k];
        json+='"'+cNames[i]+'"'+":"+'"'+qData[i]+'",';
    }
    json+='}}}}';
    //alert(json);
    json = eval("("+json+")");
    //alert(json);
    return json;    
}