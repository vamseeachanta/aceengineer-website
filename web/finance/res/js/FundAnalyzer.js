/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * This Class is used to analyze a spefific bunch of Funds
 */
function FundAnalyzer(baseTick,handler){
    this.baseTicker = baseTick;
    this.baseDateInfo = null;
    // This is an Arry which holds the Month Ends Data of the base Ticker Data from curent month to starting month
    this.baseMonthEndRates = null;
    this.noOfIntervels = 6;
    this.endDate = new Date();
    // Twenty Years Back
    this.startDate = new Date(this.endDate-20*365*24*60*60*1000);
    
    // initializing the
    this.init(handler);
}

/**
 * This Method To Initialize the FundAnalyisi Object
 */
FundAnalyzer.prototype.init = function(handler){
    var ME = this;
    //alert("Funda Analyzer initilized "+this.startDate +"    "+this.endDate);
    //alert(this.baseTicker);
    this.computeResilienceFactor(this.baseTicker,3,function(data){
        ME.baseDateInfo = data;
        //ME.getResilienceFactor("GOOG", null, function(data){
        //alert("Fund Basae Data : "+$.toJSON(data));
        //});
        //ME.baseDateInfo = data;
        // Indicating that the Object Was Initilized Successfully with Base Data
        handler(data);
    //alert(data[1][0].date);
    //alert("Minimum Dates are : "+data[0]);
    //alert("Maximum Dates are : "+data[1]);
    });
},


/**
 * This Method get The Resilience factor based on the Given intervel Data
 * if the intervel data is not specified then it uses the Baser Intervel Data
 */
FundAnalyzer.prototype.getResilienceFactor = function(ticker,fType,intervelData,handler){
    // Skipping Special Characters
    //ticker = escape(ticker);
    var ME = this;
    intervelData = (!intervelData||intervelData==null)?this.baseDateInfo:intervelData;
    //alert($.toJSON(intervelData));
    
    var mins = [];
    var maxs = [];
    
    try{
        //alert(mins);
        StockData.getHistoricalData(ticker, ME.startDate, ME.endDate, function(data){
            // Month End Rates
            var monthEndRates = ME.getMonthEndRates(data);
            //alert(monthEndRates);
            //$('body').append(monthEndRates);
            var dates = data[0];
            var rates = data[1];
            var years = (dates[0]-dates[dates.length-10])/(365*24*60*60*1000);
            //alert("Your Ticker "+ticker+" is "+years+" Old");
            var baseData;
            if(years<1){
                // Calling the Handler with null Objects
                handler(null);
            }else if(years>=1 && years<3){
                baseData = intervelData[0];
            }else if(years>=3 && years<5){
                baseData = intervelData[1];
            }else if(years>=5 && years<10){
                baseData = intervelData[2];
            }else if(years>=10 && years<20){
                baseData = intervelData[3];
            }else if(years>=20){
                baseData = intervelData[4];
            }        
        
            var h = baseData[0].length;
            for(var i=0;i<h;i++){
                mins.push(baseData[0][i].date);
                maxs.push(baseData[1][i].date);
            }
            //alert(years);
            var maxObjs = [];
            var minObjs = [];
            var obj = null;
            var ind;
            for(i=0;i<mins.length;i++){
                ind = ME.getNearestIndex(dates, mins[i]);
                obj = {
                    date:dates[ind],
                    rate:rates[ind]
                }
                minObjs.push(obj);
            //alert("Minimum s are : "+$.toJSON(obj));
            }
            for(i=0;i<maxs.length;i++){
                ind = ME.getNearestIndex(dates, maxs[i]);
                obj = {
                    date:dates[ind],
                    rate:rates[ind]
                }
                maxObjs.push(obj);
            //alert("Maximum Objects Are :"+$.toJSON(obj));
            }
            //minObjs.reverse();
            //maxObjs.reverse();
            //alert(ME.baseMonthEndRates);
            try{
                //var l = monthEndRates.length;
                //alert("Month End Rates are :"+);
                //monthEndRates.reverse();
                //ME.baseMonthEndRates.reverse();
                //monthEndRates = monthEndRates.slice(0, 61);
                //ME.baseMonthEndRates = ME.baseMonthEndRates.slice(0, 61);
                var baseReturns = [];
                var currReturns = [];
                try{
                    for(i=0;i<monthEndRates.length-1;i++){
                        currReturns.push((monthEndRates[i+1]-monthEndRates[i])/monthEndRates[i]);
                        baseReturns.push((ME.baseMonthEndRates[i+1]-ME.baseMonthEndRates[i])/ME.baseMonthEndRates[i]);
                    }
                }catch(e){
                    alert("error in Fund Analyzer :"+e);
                }
            
                //alert("Base Month End Rates :"+ME.baseMonthEndRates);
                //var beta = StockAnalysis.covariance(ME.baseMonthEndRates, monthEndRates)/StockAnalysis.variance(ME.baseMonthEndRates);
                var beta = StockAnalysis.covariance(baseReturns,currReturns)/StockAnalysis.variance(baseReturns);
            }catch(e){
                alert(e);
            }
            // Computing the Return Assessment Data
            var raData = ReturnAssessmentHandler.partionData(data, 1);
            var returnsObj = ReturnAssessmentHandler.doComputations(raData[0], raData[1]);
            var returns = ME.getReturns(returnsObj);
        
            var factorObjs = [baseData,[minObjs,maxObjs]];
            var rFactors = [];
            for(ind=0;ind<2;ind++)
            {
                var rf = ME.computeResilienceValue(factorObjs[ind]);
                var d = [];            
                for(i=0;i<rf.length;i++){
                    d.push(rf[i]);                
                }
                rFactors.push(d);
            }
                        
            var extreamBeta;
            var avgPullBack = 0;
            var avgBounceBack = 0;
            var pullBackCount = 0;
            var bounceBackCount = 0;
            for(i=0;i<rFactors[0].length;i++)
            {
                if(i%2 == 0){
                    avgPullBack += (rFactors[1][i]/rFactors[0][i]);
                    pullBackCount++;
                }
                else{
                    avgBounceBack += (rFactors[1][i]/rFactors[0][i]);
                    bounceBackCount++;
                }
            //alert(i+"   is ---> "+(rFactors[1][i]/rFactors[0][i]));
            }
            //alert("Bounce Back is :"+avgBounceBack);
            avgPullBack /= pullBackCount;
            avgBounceBack /= bounceBackCount;
            //alert("Pull Backs are :"+(pullBackCount+bounceBackCount));
        
            extreamBeta = (pullBackCount*avgPullBack+bounceBackCount*avgBounceBack)/(pullBackCount+bounceBackCount);
            //extreamBeta = (pullBackCount*avgPullBack+bounceBackCount*avgBounceBack)/5;
        
            //alert("Extream Beta is : "+extreamBeta);
            //alert(ticker);
            // Base Ticker data, current ticjer Data and beta value as object and fund Summary Object
            ME.getSummaryData(ticker, function(data){
                data.BETA = beta;
                data.TICKER = ticker;
                data.extreamBeta = extreamBeta;
                data.fType = fType;
                handler([baseData,[minObjs,maxObjs],{
                    beta:beta,
                    extreamBeta : extreamBeta,
                    avgPullBack : avgPullBack,
                    avgBounceBack: avgBounceBack,
                    ticker:ticker,
                    returns : returns,
                    summaryData : data
                }]);
            });        
        },function(){});
    }catch(e){
        alert("error While Getting The Data : "+e);
    }
}

/**
 * This Method Returns the Returns of the Given Data
 */
FundAnalyzer.prototype.getReturns = function(returns){
    var periods = [1,2,3,5,7,10];
    var AR = returns[1];
    // Reverse the Array from current to Start Date
    AR.reverse();
    var rts = [];
    for(var i=0;i<periods.length;i++){
        rts.push(AR[periods[i]]);
    }
    return rts;
}

/**
 * This Method used to compute the Resilience factor of the Given Fund
 * @param ticker the Ticker Name
 * @param intervels the Number of Intervels
 * @param handler the handler to handle the Data
 */
FundAnalyzer.prototype.computeResilienceFactor = function(ticker,intervels,handler){
    var ME = this;
    intervels = !intervels?3:intervels;
    var intSize = -1;
    //var totalDays = (this.endDate-this.startDate)/(1*24*60*60*1000);
    //alert(totalDays);
    //alert("Before Getting Historical Prices");
    StockData.getHistoricalData(ticker, this.startDate, this.endDate, function(data){
        //alert("Data Retrived");
        var oneYearData,threeYearsData,fiveYearsData,tenYearsData,twentyYearsData;
        // getting month end rates for Beta Caluculation
        ME.baseMonthEndRates = ME.getMonthEndRates(data);
        oneYearData = ME.getLastNoofYearsData(data, 1);
        threeYearsData = ME.getLastNoofYearsData(data, 3);
        fiveYearsData = ME.getLastNoofYearsData(data, 5);
        tenYearsData = ME.getLastNoofYearsData(data, 10);
        twentyYearsData = ME.getLastNoofYearsData(data, 20);
        //alert(oneYearData[0].length);
        //var groupedData = ME.partionIntoGroups(oneYearData, 2*intervels);
        handler([
            compute(ME.partionIntoGroups(oneYearData, 2*intervels)),
            compute(ME.partionIntoGroups(threeYearsData, 2*intervels)),
            compute(ME.partionIntoGroups(fiveYearsData, 2*intervels)),
            compute(ME.partionIntoGroups(tenYearsData, 2*intervels)),
            compute(ME.partionIntoGroups(twentyYearsData, 2*intervels))
            ]);
        //alert(dates[dates.length-2]);
        
        
        function compute(gData){        
            var minDates = [];
            var maxDates = [];
            var indexObj;
            for(var i=0;i<2*intervels;i++){
                try{
                    var dates = gData[i][0];
                    if(i%2 != 0)
                    {
                        //alert("Compute Max");
                        indexObj = ME.getMaxIndex(gData[i][1]);
                        //alert(indexObj);
                        //maxDates.push(dates[i*intSize+indexObj[1]]);
                        
                        maxDates.push({
                            date:ME.getNearestValidDate(dates, indexObj[1]),
                            rate:indexObj[0]
                        });
                        
                    //alert("Nearest Valid Date is : "+ME.getNearestValidDate(dates, indexObj[1]));
                    //alert("Maximum Data Is : "+gData[i][0].length+"   "+indexObj[1]+"   "+gData[i][0][i*intSize+indexObj[1]]);
                    }
                    
                    else
                    {
                        //alert("Compute Min");
                        indexObj = ME.getMinIndex(gData[i][1]);
                        //minDates.push(dates[i*intSize+indexObj[1]]);
                        minDates.push({
                            date:ME.getNearestValidDate(dates, indexObj[1]),
                            rate:indexObj[0]
                        });
                    //alert("Minimum Data Is : "+dates[i*intSize+indexObj[1]]);
                    }
                    
                }
                catch(e){
                    alert(e);
                }
            }
            // Reversing the Data   
            minDates.reverse();
            maxDates.reverse();
            return [minDates,maxDates];
        }// Inner Function Ends Here
        
        
    //alert("Intervel Size :"+intSize);
    }, function(){});
    
    
    /**
     * This MEthod Returns the No of Years Data to the Specified No fo Years
     */
    FundAnalyzer.prototype.getLastNoofYearsData = function(data,noOfYears){
        var ed = new Date();
        var sd = new Date(ed-noOfYears*365*24*60*60*1000);
        //alert("End Date is :"+ed);
        var dates = data[0];
        var rates = data[1];
        var nDates = [];
        var nRates = [];
        for(var i=0;;i++){
            nDates.push(dates[i]);
            nRates.push(rates[i]);
            //alert(dates[i]);
            //yearsData.push(data[i]);
            if(dates[i]<sd){
                break;
            }
        }
        //alert(nDates.length);
        return [nDates,nRates];
    //alert(sd);
    }
    
    /**
     * This Method used to patrion the given data in to the Groups based onthe Time Interval
     */
    FundAnalyzer.prototype.partionIntoGroups = function(data,partions){
        var dates = data[0];
        var rates = data[1];        
        var totalDays = dates.length;
        partions = !partions?6:partions;
        var groupedData = [];
        var size = Math.round(totalDays/partions);
        var dataObj = [];
        for(var i=0;i<partions;i++){
            dataObj = [];
            dataObj.push(dates.slice(i*size, (i+1)*size));
            dataObj.push(rates.slice(i*size, (i+1)*size));
            
            groupedData.push(dataObj);
        //alert(dataObj);
        //alert(ld+"\n"+ud);
        }
        return groupedData;
    }
    
    /**
     * This Method Returns the minimum values with index of the Minimum element of the Given Data
     */
    FundAnalyzer.prototype.getMinIndex = function(data){
        var min = data[0];
        var ind = 0;
        for(var i=0;i<data.length;i++){
            if(min>data[i]){
                min = data[i];
                ind = i;
            }
        }
        return [min,ind];
    }
    
    
    /**
     * This Method Returns the maximum value with index
     */
    FundAnalyzer.prototype.getMaxIndex = function(data){
        var max = data[0];
        var ind = 0;
        for(var i=0;i<data.length;i++){
            if(max<data[i]){
                max = data[i];
                ind = i;
            }
        }
        return [max,ind];
    }


    /**
     * This Method Gets the Nearest index to the Specified Value in the Given Array
     */
    FundAnalyzer.prototype.getNearestIndex = function(data,val){
        //alert("Searching for : "+val);
        for(var i=0;i<data.length;i++){            
            if(val>data[i]){
                //alert(val>data[i]);
                return i-1;
            }
        }
        return i;
    }
    
    /**
     * This Method Returns the Nearest Valid Date to the Given Index of the Given Dates
     */
    FundAnalyzer.prototype.getNearestValidDate = function(dates,ind){
        var len = dates.length;
        var inc = ind>=len?-1:1;
        var d = dates[ind];
        do{
            d = dates[ind];
            ind += inc;
        }while(d == undefined);
        return d;        
    }
    
    /**
     * This Method Returns the Month End Data for the Given Stock Data
     * this will be used for computing the Beta and alpha Values
     */
    FundAnalyzer.prototype.getMonthEndRates = function(data){
        var indexes = [];
        var dates = data[0];        
        var rates = data[1];
        var monthEndRates = [];
        
        // getting month End Indexes
        
        var n = dates.length;        
        for(var i=1;i<n;i++){
            try{
                if(dates[i].getMonth()!=dates[i-1].getMonth()){
                    indexes.push(i);
                    monthEndRates.push(rates[i]);
                //alert("Date is : "+dates[i]);
                }
            }catch(e){
            //alert(e);
            }
        }        
        return monthEndRates;        
    //alert(monthEndRates);
    }
    
    
    /**
     *THis Method Computes the Resilience Factor Values baSED ON THE gIVEN
     * down and peek values
     */
    FundAnalyzer.prototype.computeResilienceValue = function(data){
        var rf = [];
        var d = [];
        for(var i=0;i<data[0].length;i++){
            d.push(data[1][i].rate,data[0][i].rate);
        }                
        for(i=1;i<d.length;i++){
            rf.push( ((d[i]-d[i-1])/(d[i-1]))*100 );
        }
        //alert('Resilience Factor Values are : '+rf);
        return rf;
    }
    
    
    FundAnalyzer.prototype.getSummaryData = function(ticker,handler){        
        ticker = escape(ticker);
        // Skiping Special Characters        
        //alert("Getting Summary Data for Ticker : "+ticker);
        var NET_ASSET_KEY = "Net Assets:";
        var CATEGORY_KEY = "Category:";
        var FUND_FAMILY_KEY = "Fund Family:";
        var INCEPTION_DATE_KEY = "Inception Date:";
        var EXPENSE_RATIO_KEY = "Expense Ratio";
        
        var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Ffinance.yahoo.com%2Fq%2Fpr%3Fs%3D"+ticker+"%2BProfile%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Ftable%5B%40id%3D%22yfncsumtab%22%5D'&diagnostics=true"
        doAjax(url, "", function(data){
           
            var obj = {
                NET_ASSET:null,
                INCEPTION_DATE:null,
                EXPENSE_RATIO:null,
                CATEGORY:null,
                FUND_FAMILY : null
            };
            
            var div = document.createElement('div');            
            $(div).html(data);
            var tab = $('.yfnc_datamodoutline1',div);            
            $(tab).find('td').each(function(){                            
                if(obj.NET_ASSET==null && $(this).html().indexOf(NET_ASSET_KEY)>0){
                    var val = $(this).siblings("td").eq(0).text();
                    if(val!=null && val.length>0){
                        obj.NET_ASSET = $.trim(val);
                    }
                }
                var val;
                if(obj.INCEPTION_DATE==null && $(this).html().indexOf(INCEPTION_DATE_KEY)>0){
                    val = $(this).siblings("td").eq(0).text();
                    if(val!=null && val.length>0){
                        obj.INCEPTION_DATE = $.trim(val);
                    }
                }
                if(obj.EXPENSE_RATIO==null && $(this).html().indexOf(EXPENSE_RATIO_KEY)>0){
                    val = $(this).siblings("td").eq(0).text();
                    if(val!=null && val.length>0){
                        obj.EXPENSE_RATIO = $.trim(val);
                    }
                }
                if(obj.CATEGORY==null && $(this).html().indexOf(CATEGORY_KEY)>0){
                    val = $(this).siblings("td").eq(0).text();
                    if(val!=null && val.length>0){
                        obj.CATEGORY = $.trim(val);
                    }
                }
                if(obj.FUND_FAMILY==null && $(this).html().indexOf(FUND_FAMILY_KEY)>0){
                    val = $(this).siblings("td").eq(0).text();
                    if(val!=null && val.length>0){
                        obj.FUND_FAMILY = $.trim(val);
                    }
                }
            });            
            handler(obj);
        //alert("Net Assest Value is :"+$.toJSON(obj));
        });
    }
}