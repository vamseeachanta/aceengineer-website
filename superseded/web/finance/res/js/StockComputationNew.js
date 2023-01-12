/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var chartMarketCompare =[];
var chartPortfolioCompare =[];
var marketCompareArray = [];
var portfolioCompareArray = [];
var marketCompareValue = 0;
var marketCompareTicker = [];
var marketCompareQuantity = [];
var marketCompareDates = [];
var marketCompareRates = [];
var marketCompareCount = 0;
var fundNames = [];
var quantity = [];

var StockAnalysis = 
{    
    /**
     * This Method Returns the Bounds of the Given Data Arrya
     * ['minimum','maximum']
     */
    getBounds : function(pArray)
    {
        var max = pArray[0];
        var min = pArray[1];
        var minPos = 0;
        var maxPos= 0;
        
        for(var i=0;i<pArray.length;i++)
        {
            if(max<pArray[i])
            {
                max = pArray[i];
                maxPos = i;
            }
            if(min>pArray[i])
            {
                min = pArray[i];
                minPos = i;
            }            
        }
        
        return (
        {
            MIN:
            {
                val: min,
                pos: minPos
            },
            MAX:
            {
                val:max,
                pos:maxPos
            }
        });
    },
    /**
     * This Method Computes the Moving Average of the Given Data with the Specified Moving Gap
     * in nUmber of Days
     */
    getMovingAverages : function(data,gap)
    {
        mAvg = [];
        for(var i=0;i<data.length;i++)
        {
            mAvg.push(this.avg(data.slice(i, i+gap)));
        }
        //alert(mAvg);
        return mAvg;
    },
    
    /**
     * This Method Computes the Average og the given Data Points
     */
    avg : function(dataPoints)
    {        
        return (this.sum(dataPoints)/dataPoints.length);
    },
    
    /**
     * This Method Computes the Sum of the Given Data points
     */
    sum: function(dataPoints)
    {
        var s = 0;
        for(var i=0;i<dataPoints.length;i++)
            s += dataPoints[i];
        return s;
    },
    
    /**
     * This Method Computes the Sumn of the Powers of the Given Data
     */
    sumOfPowers: function(dataPoints,pow){
        var s = 0;
        var n = dataPoints.length;
        for(var i=0;i<n;i++){
            s += Math.pow(dataPoints[i], pow);
        }
        return s;
    },
    
    /**
     * This Method Computes the Return to Date of the Given Vaules
     */
    returnToDate : function(netAmt,capital)
    {
        return ( ((netAmt - capital) / capital) * 100 );
    },
    
    /**
     * This method Computes the Annula Return to Date Value of the given Data
     */
    annualReturnToDate: function(endVal,startVal,noOfYears)
    {
        return (Math.pow((endVal/startVal), (1/noOfYears)) - 1) * 100;
    },
    
    /**
     * This Method Computes the Return Year on Year value of the given data
     */
    yearOnYear: function(presentVal,previousVal)
    {
        return ((presentVal-previousVal)/previousVal)*100;
    },
    
    /**
     * This Method Computes the AbsoluteReturnToDate Value of the Given Data
     */
    absoluteReturnToDate: function(capital,income)
    {
        return capital+income;
    },
    
    /**
     * This MethodComputes the Covariance of the Given Data
     */    
    covariance : function(data1,data2){
        var xy = 0;
        var n = data1.length<data2.length?data1.length:data2.length;        
        for(var i=0;i<n;i++){
            xy += data1[i]*data2[i];
        }
        var coVar = xy/n - this.avg(data1)*this.avg(data2);
        return coVar;
    },
    
    /**
     * This Method Computes the Variance oif the Gicven Data
     */
    variance : function(data){
        var mean = this.avg(data);
        var n = data.length;
        var cVar = this.sumOfPowers(data, 2)/n - Math.pow(mean,2);
        return cVar;
    },    
    
    /*
     *This function calculates the smoothing constant,Bollinger bands such as upper,lower,extreme upper,extreme lower,%b
     */
    getBollingerBands : function(close,length)
    {
        var bB = new Array(length);
        var closeRev = reverseArray(close);
        var sdArr = new Array(50);
        
        // alert(closeRev);
        for(var i=0;i<bB.length;i++){
            if(i<50){
                bB[i]= NaN;
            }else{
                for(var j=i;j>(i-50);j--){
                    sdArr[i-j]=closeRev[j];
                }
                sdArr = reverseArray(sdArr);
                bB[i]=getStandardDeviation(sdArr);
            }
        }
        return bB;
    },
    
    getSigmaMultiple:function(bB,val){
        var sigma=new Array(bB.length);
        for(var j=0;j<bB.length;j++){
            sigma[j]= val*bB[j];
        }
        return sigma;
    },
    
    getEMA : function(sc,fDMA,close){
        var EMA =new Array(fDMA.length);
        // EMA[0]= fDMA[0];
        var fdRev = reverseArray(fDMA);
        var clRev = reverseArray(close);
        // alert(fdRev);
        
        for(var i=0;i<fdRev.length;i++){
            if(i<50){
                EMA[i]=NaN;
            }else if(i == 50){
                EMA[i]= fdRev[i];        
            }else{
                EMA[i] = sc * (clRev[i]- EMA[i-1])+EMA[i-1];    
            }
        }
        EMA = reverseArray(EMA);
        return EMA;
    },
    
    getSD: function(datapts){
        //alert(datapts);
        var mean = avg(datapts);
        var msqD = 0;
        for(var i=0;i<datapts.length;i++){
            msqD+= Math.pow(datapts[i]-mean, 2);
        }
        //alert(msqD);
        msqD = msqD/datapts.length;
        var sd = Math.sqrt(msqD);
        return sd;
    },
    /*this function is used to calculate the upper band  and extreme upper band ,sd is 2sigma or 3sigma*/
    getUpperBand:function(fdMA,sd){
        //alert("50 Day MA : \n"+fdMA);
        fdMA = reverseArray(fdMA);
        var uB = new Array(fdMA.length);
        for(var j=0;j<fdMA.length;j++){
            uB[j]= fdMA[j]+sd[j];
        }
        uB = reverseArray(uB);
        return uB;
    },
    /*this function is used to calculate the lower band  and extreme lower band, sd is 2sigma or 3sigma*/
    getLowerBand:function(fdMA,sd){
        fdMA = reverseArray(fdMA);
        var lB = new Array(fdMA.length);
        for(var j=0;j<fdMA.length;j++){
            lB[j]= fdMA[j]-sd[j];
        }
        lB= reverseArray(lB);
        return lB;
    },
    
    getPercentB:function(close,uB,lB){
        close= reverseArray(close);

        var percentB = new Array(close.length);
        for(var k=0;k<close.length;k++){
            percentB[k]= (close[k]- lB[k])/(uB[k]-lB[k]);
        //alert("percent["+k+"] : "+percentB[k]+" \n"+(close[k]-lB[k])+"/"+(uB[k]-lB[k]));
        }
        percentB = reverseArray(percentB);
        return percentB;
    },
    
    getBandwidth:function(uB,lB,fdMA){
        fdMA= reverseArray(fdMA);
        var bw = new Array(fdMA.length);
        for(var i in fdMA){
            bw[i] = ((uB[i] - lB[i])/fdMA[i])*100;
        }
        bw = reverseArray(bw);
        return bw;
    }
}





// ############################################
// ############################################
// These are the Normal Methods which are used in StockAnalysis Project
// ############################################
// ############################################



/**
 * This Method Retrives the Specified Column Data from the Given CSV File
 * pcsvData -   for The Ginven CSV Data
 * columnName   - The required Column Name
 * format - the out put array Format it can be date, number etc...
 */
function getSpecifiedData(pcsvData,columnName,format)
{
    columnName = columnName.toLowerCase();
    try
    {
        rowTokens = pcsvData.split("\n");
        headerRow = rowTokens[0].split(",");
        var ind = -1;
        
        // Retriving The Required Column Index
        for(i=0;i<headerRow.length;i++)
        {
            if(headerRow[i].toLowerCase() == columnName)
            {
                ind = i;
                break;
            }                        
        }
        //alert("Required Column Index is :"+ind);
        var rqColumnData = [];
        if(format == "date")
        {
            for(var i=1;i<rowTokens.length;i++)
            {
                //alert(rowTokens[i].split(",")[ind]);
                rqColumnData[i-1] = Date.parse(rowTokens[i].split(",")[ind]);
            }
        }
        else
        {
            for(var j=1;
                j<rowTokens.length-1;
                j++)
                
                {
                rqColumnData.push( parseFloat(rowTokens[j].split(",")[ind]) );
            }
        }
    }
    // If The Date Can't be parsed Then Return null
    catch(e)
    {
        return null;
    }
    
    return rqColumnData;                
}
/*
 *This function used to reverse the given array.
 **/

function reverseArray(data){
    var fdRev = new Array(data.length-1);
    var length = data.length -1;
    
    for(var j=0 in data){
        fdRev[j] = data[length - j];
    }
    return fdRev;
}

/*
 *This function calculates the standard deviation for the given set of data points.
 */
function getStandardDeviation(datapts){
    var mean = StockAnalysis.avg(datapts);
    var msqD = 0;
    for(var i=0;i<datapts.length;i++){
        msqD+= Math.pow((datapts[i]-mean), 2);
    }
    var variance = msqD/datapts.length;
    var sd = Math.sqrt(variance);
    return sd;
}

/*
 *This chart gives the chart recommendations for the given data points and reflected into chart.
 */
function chartRecommendations(price,ema,lb,ub,elb,eub){
    var rcmds = [];
    var lop = price.length;
    var parts;
    var noOfParts;
    var mod;
    var init=0;
    var diff =0;
    lop=lop-50;
   
    
    if(lop>=200){
        lop = 200;
        noOfParts=5;
        parts= Math.ceil(lop/noOfParts);
        mod = lop%noOfParts;
    }
    else {
        noOfParts=4;
        parts= Math.ceil(lop/noOfParts);
        mod = lop%noOfParts;
    
    }
    
    var array=new Array(noOfParts);
    var maxPrice ;
    var minPrice ;
    var counter = 0;
    var rCounter = 0;
    
    for(var i=0;i<noOfParts;i++){
        if(mod!=0 && i==(noOfParts-1))
            parts = parts-(noOfParts-mod);
        array[i]= new Array(parts-1);
        
        for(var x=0;x<array[i].length;x++,counter++){
            array[i][x]= price[counter];
        }
        
        maxPrice = Math.max.apply(Math, array[i]);
        minPrice = Math.min.apply(null,array[i]);
        
        for(var j=0;j<array[i].length;j++,rCounter++)
        {
            if(rCounter == 0){
                if((ub[rCounter]>price[rCounter])&&(price[rCounter]>ema[rCounter])){
                    rcmds[rCounter]="Price Moving above the 50 Day EMA";
                }
                else if((eub[rCounter]>price[rCounter])&&(price[rCounter]>ub[rCounter])){
                    rcmds[rCounter]="Overbought";
                }
                else if((price[rCounter]>eub[rCounter])){
                    rcmds[rCounter]="Overbought and due correction";
                }
                else if(price[rCounter]<ema[rCounter]){
                    rcmds[rCounter]="Price moving down the 50-day EMA";
                }
                else if((ema[rCounter]>price[rCounter])&&(price[rCounter]>lb[rCounter])){
                    rcmds[rCounter]="Price Moving down the 50 Day EMA";
                }
                else if((lb[rCounter]>price[rCounter])&&(price[rCounter]>elb[rCounter])){
                    rcmds[rCounter]="Oversold";
                }
                else if((elb[rCounter]>price[rCounter])){
                    rcmds[rCounter]="Oversold but broke resistance";
                }
                else if(price[rCounter]>ema[rCounter]){
                    rcmds[rCounter]="Price moving above the 50-day EMA";
                }
            }
            if(price[rCounter]==maxPrice ){
                if((ub[rCounter]>maxPrice)&&(maxPrice>ema[rCounter])){
                    rcmds[rCounter]="Price Moving above the 50 Day EMA";
                }
                else if((eub[rCounter]>maxPrice)&&(maxPrice>ub[rCounter])){
                    rcmds[rCounter]="Overbought";
                }
                else if((maxPrice>eub[rCounter])){
                    rcmds[rCounter]="Overbought and due correction";
                }
                else if(maxPrice<ema[rCounter]){
                    rcmds[rCounter]="Price moving down the 50-day EMA";
                }
            }
            if(price[rCounter]== minPrice ){
                if((ema[rCounter]>minPrice)&&(minPrice>lb[rCounter])){
                    rcmds[rCounter]="Price Moving down the 50 Day EMA";
                }
                else if((lb[rCounter]>minPrice)&&(minPrice>elb[rCounter])){
                    rcmds[rCounter]="Oversold";
                }
                else if((elb[rCounter]>minPrice)){
                    rcmds[rCounter]="Oversold but broke resistance";
                }
                else if(minPrice>ema[rCounter]){
                    rcmds[rCounter]="Price moving above the 50-day EMA";
                }
            }
            
        }
    }
    return rcmds;
}
/**
 * This functions gives the chart recommendations summmary
 */
function chartRecommendationsSummary(ema,ub,lb,eub,elb,tdMA,price){
    var recSummary = "" ;
    var f52week ;
    if(price.length<250){
        f52week = new Array(price.length);
    }else{
        f52week = new Array(250);
    }
    var curr = price[0];//current price--rec1
    for(var i=0;i<f52week.length;i++){
        f52week[i] = price[i];
    }
    var max52Week = Math.max.apply(null, f52week);
    var min52Week = Math.min.apply(null,f52week);
    if(((0.98*min52Week)<curr)&&(curr<=(1.05*min52Week)))
    {
        recSummary+="- At 52 week low.<br>";//rec 2
    }
    else if(curr<=(0.98*min52Week))
    {
        recSummary+="- Below 52 week low.<br>";//rec 2
    }
    
    if(((max52Week)<=curr)&&(curr<(1.02*max52Week)))
    {
        recSummary+="- At 52 week high.<br>";//rec 3
    }
    else if(curr>=(0.98*min52Week))
    {
    // recSummary+="- New 1 year high.<br>";//rec 3
    }
    //    if(((ub[0]>curr)&&(curr>ema[0]))&&(tdMA[0]<curr))
    if(((ub[0]>curr)&&(curr>ema[0])))
    {
        recSummary+= "- <b style='color:orange;'>&nbsp; HOLD</b><br>- Price moving above 50 day moving average.<br>- Expect the market to move higher if no significant negative events happen.<br>";//rec 4
    }
    else if(curr>eub[0])
    {
        recSummary+= "-<b style='color:red;'>&nbsp; SELL</b><br>-Price is above the extreme upper band <br>- Expect price to move higher if fundamentals stay strong and no significant negative economic/political events happen.<br>"//rec 4
    }
    if((eub[0]>curr)&&(curr>ub[0]))
    {
        recSummary+= "-<b style='color:red;'>&nbsp; SELL</b><br>- Price near the Extreme upper Bollinger band.<br>- Testing resistence at upper bollinger band. <br>- Expect price to move higher if fundamentals stay strong and no significant negative economic/political events happen.<br>";//rec5
    }
    if((ema[0]>curr)&&(curr>lb[0])){
        recSummary+= "-<b style='color:orange;'>&nbsp; HOLD</b><br>- Price Moving below the 50day EMA.<br> - Near to lower bollinger band<br>- Add positions if fundamentals stay strong.";
    }
    if((lb[0]>curr)&&(curr>elb[0]))
    {
        recSummary+= "-<b style='color:green;'>&nbsp; BUY</b><br>- Price is below  the Lower Bollinger band.<br>-Oversold.<br>- Add positions if fundamentals stay strong.<br>";
    }
    if(curr<elb[0])
    {
        recSummary+= "-<b style='color:green;'>&nbsp; BUY</b><br>- Price is below the 50 day moving average and near the Lower Bollinger band.<br>- Extremely Oversold.<br>- Monitor to add positions if fundamentals stay strong."
    }
    //recSummary=" - The price action is above upper band.<br> -Expect stock to move higher to Extreme upper band levels.<br> -Expect the market to move higher if significant negative events happen"
    return recSummary;  
} 

$(function(){
    //TO download CPR button event. and this can be given by structure of div and table . 
    $('#cprReport').click(function(){
        try
        {
            var noOfTickers = $('div[name=chartL]').length;
            var rc = $('.strippyTable');
            var cImg = [];
            var cCurr = [];
            var cTickers = [];
            var cRcmds = new Array(noOfTickers);
            var div = $('div[name=chartL]');
            var cPS = $('#comparePortfolioSummary')[0];
            var addComChartData="";
            addComChartData = getImgDataForCompPortfolio();
            addComChartData = addComChartData.replace('data:image/png;base64,', '');
            addComChartData = encodeURIComponent(addComChartData);
            for(var i=0;i<noOfTickers;i++){
                cImg[i]= GooleCharting.getImgData($(div)[i]);
                cImg[i] = cImg[i].replace('data:image/png;base64,', '');
                cImg[i]= encodeURIComponent(cImg[i]);
                cTickers[i] = rc.find('td:eq(1)')[i].textContent.toString();
                cCurr[i]= rc.find('td:eq(3)')[i].textContent.toString();
                cRcmds[i]=rc.find('td:last')[i].textContent.toString();
            }
            cPS = cPS.textContent.toString();
            var cS = cPS.split("•");
            var cSummary = "";
            for(var m=0;m< cS.length;m++)
                cSummary += "• "+cS[m]+"\n";
            alert(cSummary);
            var xml = new XMLHttpRequest();
            xml.open("POST", "CWRDesign.do", true);
            xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xml.onreadystatechange = function()
            {
                if(xml.readyState==4 && xml.status==200)
                {
            }
            }
            xml.send("size="+noOfTickers+"&images="+cImg+"&cP="+cCurr+"&cR="+cRcmds+"&cN="+cTickers+"&cPImgD="+addComChartData+"&cs="+cSummary);
        //                        $.get("CWRDesign.do",null,function(data){
        //alert("result is "+data);
        //                        });
        }
        catch(e)
        {
            alert(e);
        }
    });
});

function getImgDataForCompPortfolio(){
    benchMarkComparsion();
    return GooleCharting.getImgData($('#comparisonLineChartDiv')[0]);
}

function benchMarkComparsion(){
    
    var sd = new Date();
    sd.setDate(sd.getDate()-60);
    
    fundNames.push("AceEngineer_SPY");
    quantity.push(1);
    $('.portfolioTable>tbody>tr>td:nth-child(1)').each( function(){
        //add item to array
        fundNames.push( $(this).text());       
    });
    $('.portfolioTable>tbody>tr>td:nth-child(3)').each( function(){
        //add item to array
        quantity.push( $(this).text());       
    });
    for(var i=0;i<fundNames.length;i++)
    {
        gettingDataforTicker(fundNames[i],sd,new Date(),quantity[i]);
    }
                                
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
        $.ajaxSetup({
            async:false
        });
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
        for(var j=0;j<=marketCompareCount;j++)
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
        portfolioCompareArray[i] = Math.ceil(totalPortfolioValue*100)/100+cashinhold;
        marketCompareArray[i] = Math.ceil(totalMarketValue*100)/100;
    }
    for(var i=0;
        i<portfolioCompareArray.length-1;
        i++)

        {
        chartMarketCompare[i] = Math.ceil(((100*(marketCompareArray[i+1]-marketCompareArray[i]))/marketCompareArray[i])*100)/100;
        chartPortfolioCompare[i] = Math.ceil(((100*(portfolioCompareArray[i+1]-portfolioCompareArray[i]))/portfolioCompareArray[i])*100)/100;
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
            colors:['blue','green'],
            pointSize:3
        };
        var lineChartOptions = {
            title:'Portfolio Performance',
            hAxis: {
                slantedText:true,
                viewWindow:'pretty'
                    
            },
                
            width:800,
            height:450,
            pointSize:3
        }
        var chart =  new google.visualization.AnnotatedTimeLine(document.getElementById('comparisonChartDiv'));
        var pCompChart =  new google.visualization.LineChart(document.getElementById('comparisonLineChartDiv'));
        chart.draw(data, options);//0 for annotated time line chart
        pCompChart.draw(data, lineChartOptions);//for line chart
        var portRec = (chartPortfolioCompare[marketCompareDates[0].length-2]-chartPortfolioCompare[marketCompareDates[0].length-9]);
        var marketRec = (chartMarketCompare[marketCompareDates[0].length-2]-chartMarketCompare[marketCompareDates[0].length-9]);
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
        var cnt = "<h4 style='color:white;background:#0b4980;padding: 10px;text-align:center'>Comparison Returns of Portfolio and SPY</h4>";
        cnt +=" • The Portfolio ";
        cnt += portRec<0?"<span style='color:red;'><b>Loss</b></span>":"<span style='color:green;'><b>Gain</b></span>";
        cnt +=" is  "+portRec.toFixed(2)+"%  While the market ";
        cnt += marketRec<0?"<span style='color:red;'><b>Loss</b></span>":"<span style='color:green;'><b>Gain</b></span>";
        cnt += " is "+marketRec.toFixed(2)+" for the week. "
        cnt += "&nbsp; <br/>  • The portfolio returns is ";
        cnt += temp;
        cnt += (marketRec-portRec)>0?" <span style='color:red;'><b> Lower </b></span>":"<span style='color:green;'><b> Higher </b></span> ";
        cnt += "(by "+(Math.abs(marketRec)-Math.abs(portRec)).toFixed(2)+ ") than the Market Returns.";
        $("#comparePortfolioSummary").html(cnt);

    }catch(e)
    {
       
    }
}