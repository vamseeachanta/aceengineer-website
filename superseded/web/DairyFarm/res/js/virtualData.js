/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var showcontainer = false;
var globalCount = 0;
var defaultValues;
var text;
function ajaxCall(flagCheck)
{
    if(flagCheck == 1)
        {
            globalCount = 1;
        }
        else
        {
            globalCount = 0;
        }
    $("#defaultContent").val(" ");
    //    noOfMales = $("#Male").val();
    noOfMales = 0;
    noOfFemales = $("#Female").val();
    noOfYears = $("#Years").val();
    region = $("#region").val();
    startyear = $("#investYear").val();
    if(noOfFemales == "" || noOfFemales == 0)
    {
        alert("Please Provide Male and Female Values Before Submitting..");
        return;
    }
    if(region == "Select Region")
    {
        alert("Please Choose Region");
        return;
    }
    subSensFlag = true;
    showcontainer = true;
    applySens();
    $("#container1").show();
    changeSecMenu(0);
    Mask.showMask(document.getElementById('profitLossContent'),"");
    $.get("dairyFarm.do?males="+noOfMales+'&females='+noOfFemales+'&years='+noOfYears+'&region='+region+'&startyear='+startyear+'&sensFlag='+sensFlag+'&wgaesSens='+wagesSens+'&feedSens='+feedSens+'&milkSens='+milkpriceSens+'&LSSens='+LSSens+'&ratioMaleFemale='+ratioMaleFemale,null,function(data)
    {
        $("#profitLossTable").find('td').val(" ");
        $("#profitLossDiv").val(" ");
        $("#sensContent").hide();
        $("#sensitivity").show();
        $("#defaultValues").show();
        dataContent = splitData(data);
        var j = 1;
        defaultValue[0] = dataContent[j];
        Defaulttemp = splitData1(defaultValue,0);
        j= j+2;
        for(var i = 0;i<=noOfYears;i++)
        {
            profit_Loss[i] = dataContent[j];
            j++;
        }
        j++;
        for(var i = 0;i<=noOfYears;i++)
        {
            milk_Prodc[i] = dataContent[j];
            j++;
        }
        j++;
        for(var i=0;i<=noOfYears;i++)
        {
            investExpenses[i] = dataContent[j];
            j++;
        }
        j++;
        for(var i = 0;i<=noOfYears;i++)
        {
            totalLs[i] = dataContent[j];
            j++;
        }
        text = sensFlag == true?"Sensitivity":"Default";
        var ratio = ratioMaleFemale == undefined?1:ratioMaleFemale;
        if(ratioMaleFemale == 0)
            {
                ratio = 1;
            }
        if(text == "Default")
        {
            ratio = 1;
            $("#defButtonContent").html("The <b> Default</b> Values are </br> <b>1 Live Stock Value &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :</b>"+Defaulttemp[0]+"<br/> <b>Feed Value/1LS  &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[1]+"<br/> <b>Milk Price/1liter &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[2]+"<br/> <b>Worker Wage/1mon   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[3]+"<br/><b>Male & Female Ratio is &nbsp;&nbsp; 1:10");
        }
        Mask.hideMask(document.getElementById('profitLossContent'));
        $("#defaultContent").show();
        $("#defaultContent").html("The <b> "+text+" </b> Values for <br><b>Region</b>("+region+") and <b>Year</b>("+startyear+") is <br/> <b>1 Live Stock Value &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :</b>"+Defaulttemp[0]+"<br/> <b>Feed Value/1LS  &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[1]+"<br/> <b>Milk Price/1liter &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[2]+"<br/> <b>Worker Wage/1mon   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b> "+Defaulttemp[3]+"<br/><b>Male & Female Ratio is &nbsp;&nbsp;:</b> "+ratio+"::10");
        addProfit_Loss(profit_Loss,noOfYears);
        addMilk_Prod(milk_Prodc,noOfYears);
        addInvset_Expense(investExpenses,noOfYears);
        addTotalLS(totalLs,noOfYears);
        addSens(Defaulttemp);
        google.setOnLoadCallback(drawChart());
    });
}

function default_SensValues()
{
    //    $("#defButtonContent").slideToggle();
    ajaxCall();
}
function changeMenu(ind)
{
    switch(ind)
    {
        case 0:
            $("#intro").addClass('active');
            $("#production").removeClass('active');
            $("#analysis").removeClass('active');
            $("#contact").removeClass('active');
            $("#Introduction").show();
            $("#producionAnalysis").hide();
            $("#AnalysisApproach").hide();
            $("#ContactUs").hide();
            $("#container1").hide();
            break;
        case 2:
            $("#intro").removeClass('active');
            $("#production").addClass('active');
            $("#analysis").removeClass('active');
            $("#contact").removeClass('active');
            $("#Introduction").hide();
            $("#producionAnalysis").show();
            $("#AnalysisApproach").hide();
            $("#ContactUs").hide();
            if(showcontainer==true)
            {
                $("#container1").show();
            }
            else
            {
                $("#container1").hide();
            }
            
            break;
        case 1:
            $("#intro").removeClass('active');
            $("#production").removeClass('active');
            $("#analysis").addClass('active');
            $("#contact").removeClass('active');
            $("#Introduction").hide();
            $("#producionAnalysis").hide();
            $("#AnalysisApproach").show();
            $("#ContactUs").hide();
            $("#container1").hide();
            break;
        case 3:
            $("#intro").removeClass('active');
            $("#production").removeClass('active');
            $("#analysis").removeClass('active');
            $("#contact").addClass('active');
            $("#Introduction").hide();
            $("#producionAnalysis").hide();
            $("#AnalysisApproach").hide();
            $("#ContactUs").show();
            $("#container1").hide();
            break;
    }
}
function changeSecMenu(ind)
{
    switch(ind)
    {
        case 0:
            $("#profitLoss").addClass('active');
            $("#milkProd").removeClass('active');
            $("#invest").removeClass('active');
            $("#LSLife").removeClass('active');
            $("#sens").removeClass('active');
            $("#profitLossContent").show();
            $("#milkProdContent").hide();
            $("#investContent").hide();
            $("#LSLifeContent").hide();
            $("#comparisonChart").hide();
            break;
        case 1:
            $("#profitLoss").removeClass('active');
            $("#milkProd").addClass('active');
            $("#invest").removeClass('active');
            $("#LSLife").removeClass('active');
            $("#sens").removeClass('active');
            $("#profitLossContent").hide();
            $("#milkProdContent").show();
            $("#investContent").hide();
            $("#LSLifeContent").hide();
            $("#comparisonChart").hide();
            break;
        case 2:
            $("#profitLoss").removeClass('active');
            $("#milkProd").removeClass('active');
            $("#invest").addClass('active');
            $("#LSLife").removeClass('active');
            $("#sens").removeClass('active');
            $("#profitLossContent").hide();
            $("#milkProdContent").hide();
            $("#investContent").show();
            $("#LSLifeContent").hide();
            $("#comparisonChart").hide();
            break;
        case 3:
            $("#profitLoss").removeClass('active');
            $("#milkProd").removeClass('active');
            $("#invest").removeClass('active');
            $("#LSLife").addClass('active');
            $("#sens").removeClass('active');
            $("#profitLossContent").hide();
            $("#milkProdContent").hide();
            $("#investContent").hide();
            $("#LSLifeContent").show();
            $("#comparisonChart").hide();
            break;
        case 4:
            $("#profitLoss").removeClass('active');
            $("#milkProd").removeClass('active');
            $("#invest").removeClass('active');
            $("#LSLife").removeClass('active');
            $("#sens").addClass('active');
            $("#profitLossContent").hide();
            $("#milkProdContent").hide();
            $("#investContent").hide();
            $("#LSLifeContent").hide();
            $("#comparisonChart").show();
            break;
    }
}

function splitData(data)
{
    var spaceRemove;
    var splitdata = data.split(/\n/);
    var returnData = [];
    var count = 0;
    for(var i in splitdata)
    {
        spaceRemove = splitdata[i].split(" ");
        for(var j in spaceRemove)
        {
            if(spaceRemove[j]!="")
            {
                returnData[count] = spaceRemove[j];
                count++;
            }
        }
    }
    return returnData;
}

function splitData1(data,years)
{

    var spaceRemove;
    var returnData = [];
    var count = 0;
    for(var i=0;i<=years;i++)
    {
        spaceRemove = data[i].split(",");
        for(var j in spaceRemove)
        {
            if(spaceRemove[j]!="")
            {
                returnData[count] = spaceRemove[j];
                count++;
            }
        }
    }
    return returnData;
}

function applySens()
{
    if(sensFlag == true)
    {
        LSSens = $("#livestockSensInputValue").val();
        wagesSens = $("#wageSensInputValue").val();
        feedSens = $("#feedSensInputValue").val();
        milkpriceSens = $("#milkSensInputValue").val();
        ratioMaleFemale = $("#Male_FemaleValue").val();
        if($("#livestockSensInputValue").val() == "")
        {
            LSSens = 0;
        }
        if($("#wageSensInputValue").val() == "")
        {
            wagesSens = 0;
        }
        if($("#feedSensInputValue").val() == "")
        {
            feedSens = 0;
        }
        if($("#milkSensInputValue").val() == "")
        {
            milkpriceSens = 0;
        }
        if($("#Male_FemaleValue").val() == "")
        {
            ratioMaleFemale = 0;
        }
        $("#livestockSensInputValue").val("");
        $("#feedSensInputValue").val("");
        $("#milkSensInputValue").val("");
        $("#wageSensInputValue").val("");
        $("#Male_FemaleValue").val("");
        $('input[name="wageSens"]').attr("checked",false);
        $('input[name="FeedSens"]').attr("checked",false);
        $('input[name="milkSens"]').attr("checked",false);
        $('input[name="LivestockSens"]').attr("checked",false);
        $('input[name="ratioSens"]').attr("checked",false);
        $("#wageSensInput").hide();
        $("#feedSensInput").hide();
        $("#milkSensInput").hide();
        $("#livestockSensInput").hide();
        $("#Male_FemaleRatio").hide();
    }
}
function addProfit_Loss(profitLoss,years)
{
    var temp = splitData1(profitLoss,years);
    profit_LossData = temp;
    if(sensFlag == false)
    {
        defaultprofit_LossData = temp;
    }
    sensFlag = false;
    firstjq.grid.clearGridData();
    try{
        var count = 0;
        var mydata = [];
        for (var i = 0; i <=years; i++)
        {
            mydata.push({
                Year:temp[count],
                Revenue:temp[++count],
                Expenses:temp[++count],
                ProfitLoss:temp[++count],
                LSValue:temp[++count],
                Profit_Cost:temp[++count]
            });
            ++count;
        }
        firstjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        firstjq.grid.trigger("reloadGrid");
    }catch(e){
        alert(e);
    }
}
function addMilk_Prod(milkProdc,years)
{
    var temp = splitData1(milkProdc,years);
    var milkPerEachLS = [];
    milk_ProdData = temp;
    secondjq.grid.clearGridData();
    try{
        var count = 0;
        var mydata = [];
        for (var i = 0; i <=years; i++)
        {
            mydata.push({
                Year:temp[count],
                MPD:temp[++count],
                MCL:temp[++count],
                MC:temp[++count],
                MSD:temp[++count],
                MSY:temp[++count]
            });
            ++count;
        }
        secondjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        secondjq.grid.trigger("reloadGrid");
    }catch(e){
        alert(e);
    }
}
function addInvset_Expense(investExpenses,years)
{
    var temp = splitData1(investExpenses,years);
    investData = temp;

    thirdjq.grid.clearGridData();
    fourthjq.grid.clearGridData();
    fifthjq.grid.clearGridData();
    try{
        var count = 0;
        var mydata = [];
        var mydata2 = [];
        var mydata3 = [];
        for (var i = 0; i <=years; i++)
        {

            mydata.push({
                Year:temp[count],
                LAC:temp[++count],
                FI:temp[++count],
                VDL:temp[++count],
                MLS:temp[++count],
                FLS:temp[++count],
                ILS:temp[++count],
                WW:temp[++count],
                MSH:temp[++count],
                NOW:temp[++count],
                LSC:temp[++count],
                LR:temp[++count],
                CB:temp[++count],
                PowB:temp[++count],
                PumpB:temp[++count],
                VDB:temp[++count],
                MB:temp[++count],
                WWB:temp[++count],
                FB:temp[++count],
                MSB:temp[++count],
                IB:temp[++count],
                OEB:temp[++count],
                VC:temp[++count]
            });
            ++count;
        }
        for (var i = 0; i <=years; i++)
        {

            mydata2.push({
                Year:temp[count],
                LAC:temp[++count],
                FI:temp[++count],
                VDL:temp[++count],
                MLS:temp[++count],
                FLS:temp[++count],
                ILS:temp[++count],
                WW:temp[++count],
                MSH:temp[++count],
                NOW:temp[++count],
                LSC:temp[++count],
                LR:temp[++count],
                CB:temp[++count],
                PowB:temp[++count],
                PumpB:temp[++count],
                VDB:temp[++count],
                MB:temp[++count],
                WWB:temp[++count],
                FB:temp[++count],
                MSB:temp[++count],
                IB:temp[++count],
                OEB:temp[++count],
                VC:temp[++count]
            });
            ++count;
        }
        for (var i = 0; i <=years; i++)
        {

            mydata3.push({
                Year:temp[count],
                LAC:temp[++count],
                FI:temp[++count],
                VDL:temp[++count],
                MLS:temp[++count],
                FLS:temp[++count],
                ILS:temp[++count],
                WW:temp[++count],
                MSH:temp[++count],
                NOW:temp[++count],
                LSC:temp[++count],
                LR:temp[++count],
                CB:temp[++count],
                PowB:temp[++count],
                PumpB:temp[++count],
                VDB:temp[++count],
                MB:temp[++count],
                WWB:temp[++count],
                FB:temp[++count],
                MSB:temp[++count],
                IB:temp[++count],
                OEB:temp[++count],
                VC:temp[++count]
            });
            ++count;
        }
        thirdjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        fourthjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        fifthjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        thirdjq.grid.trigger("reloadGrid");
        fourthjq.grid.trigger("reloadGrid");
        fifthjq.grid.trigger("reloadGrid");
    }catch(e){
        alert(e);
    }
}
function addTotalLS(totalLS,years)
{
    var temp = splitData1(totalLS,years);
    totalLSData = temp;
    sixthjq.grid.clearGridData();
    try{
        var count = 0;
        var mydata = [];
        for (var i = 0; i <=years; i++)
        {
            mydata.push({
                Year:temp[count],
                NBLS:temp[++count],
                NBF:temp[++count],
                NBM:temp[++count],
                MLS:temp[++count],
                TFC:temp[++count],
                GLS:temp[++count],
                TF:temp[++count],
                TM:temp[++count],
                TLS:temp[++count]
            });
            ++count;
        }
        sixthjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        sixthjq.grid.trigger("reloadGrid");
    }catch(e){
        alert(e);
    }
}
function addSens(Defaulttemp)
{
    var mydata = [];
    if(globalCount == 0)
    {
        defaultValues = Defaulttemp;
        for (var i = 0; i <=3; i++)
        {
            if(i==0)
            {
                mydata.push({
                    Dummy:'Live Stock Value',
                    defaultVal:defaultValues[0],
                    sensitivity:'--'
                });
            }
            if(i==1)
            {
                mydata.push({
                    Dummy:'Feed Rate',
                    defaultVal:defaultValues[1],
                    sensitivity:'--'
                });
            }
            if(i==2)
            {
                mydata.push({
                    Dummy:'Milk Price',
                    defaultVal:defaultValues[2],
                    sensitivity:'--'
                });
            }
            if(i==3)
            {
                mydata.push({
                    Dummy:'Worker Wages',
                    defaultVal:defaultValues[3],
                    sensitivity:'--'
                });
            }
        }
    }
    else
    {
        for (var i = 0; i <=3; i++)
        {
            if(i==0)
            {
                mydata.push({
                    Dummy:'Live Stock Value',
                    defaultVal:defaultValues[0],
                    sensitivity:Defaulttemp[0]
                });
            }
            if(i==1)
            {
                mydata.push({
                    Dummy:'Feed Rate',
                    defaultVal:defaultValues[1],
                    sensitivity:Defaulttemp[1]
                });
            }
            if(i==2)
            {
                mydata.push({
                    Dummy:'Milk Price',
                    defaultVal:defaultValues[2],
                    sensitivity:Defaulttemp[2]
                });
            }
            if(i==3)
            {
                mydata.push({
                    Dummy:'Worker Wages',
                    defaultVal:defaultValues[3],
                    sensitivity:Defaulttemp[3]
                });
            }
        }
    }
    
    sevenjq.grid.jqGrid('setGridParam',{
        data: mydata
    });
    sevenjq.grid.trigger("reloadGrid");
}
function drawChart()
{
    try{
        var PLdata = new google.visualization.DataTable();
        var MPdata = new google.visualization.DataTable();
        var IEdata = new google.visualization.DataTable();
        var TLSdata = new google.visualization.DataTable();
        PLdata.addColumn('string', 'Year');
        PLdata.addColumn('number', 'Revenue');
        PLdata.addColumn('number', 'Total Expenses');
        PLdata.addColumn('number', 'Profit/Loss');
        MPdata.addColumn('string','Year');
        MPdata.addColumn('number','Total Milk Produced');
        MPdata.addColumn('number','Milk Consumption by Claves');
        MPdata.addColumn('number','Milk Sold');
        TLSdata.addColumn('string','Year');
        TLSdata.addColumn('number','Female Calves');
        TLSdata.addColumn('number','Gestating Females');
        TLSdata.addColumn('number','Males');
        PLdata.addRows(parseInt(noOfYears)+1);
        MPdata.addRows(parseInt(noOfYears)+1);
        TLSdata.addRows(parseInt(noOfYears)+1);
        var PLcount =0;
        var MPcount = 0;
        var IEcount = 0;
        var TLScount = 0;
        for(var i =0;i<=noOfYears;i++)
        {
            PLdata.setValue(parseInt(i),0,profit_LossData[PLcount]);
            PLdata.setValue(parseInt(i),1,parseFloat(profit_LossData[++PLcount]));
            PLdata.setValue(parseInt(i),2,parseFloat(profit_LossData[++PLcount]));
            PLdata.setValue(parseInt(i),3,parseFloat(profit_LossData[++PLcount]));
            MPdata.setValue(parseInt(i),0,milk_ProdData[MPcount]);
            MPdata.setValue(parseInt(i),1,parseFloat(milk_ProdData[++MPcount]));
            MPcount = MPcount+2;
            MPdata.setValue(parseInt(i),2,parseFloat(milk_ProdData[MPcount]));
            MPdata.setValue(parseInt(i),3,parseFloat(milk_ProdData[++MPcount]));
            TLSdata.setValue(parseInt(i),0,totalLSData[TLScount]);
            TLScount = TLScount+5;
            TLSdata.setValue(parseInt(i),1,parseFloat(totalLSData[TLScount]));
            TLSdata.setValue(parseInt(i),2,parseFloat(totalLSData[++TLScount]));
            TLScount = TLScount+2;
            TLSdata.setValue(parseInt(i),3,parseFloat(totalLSData[TLScount]));
            TLScount = TLScount+2;
            MPcount = MPcount+2;
            PLcount = PLcount+3;
        }
        var PLchart = new google.visualization.ColumnChart(document.getElementById('profitLossChart'));
        var MPchart = new google.visualization.ColumnChart(document.getElementById('milkProdChart'));
        var IEchart = new google.visualization.ColumnChart(document.getElementById('investChart'));
        var TLSchart = new google.visualization.ColumnChart(document.getElementById('LSLifeChart'));
        PLchart.draw(PLdata,
        {
            width:
            1010,
            height:
            500,
            title: 'Profit/Loss',
            vAxis: {
                title: 'Returns (INR)/Year',
                titleTextStyle: {
                    color: 'red'
                }
            },
            hAxis:{
                title: 'Year',
                titleTextStyle:{
                    color:'red'
                }
            },
            enableInteractivity: true
        }
        );
        MPchart.draw(MPdata,
        {
            width:
            1010,
            height:
            500,
            title: 'Milk Production',
            vAxis: {
                title: 'Liters(#)/Day',
                titleTextStyle: {
                    color: 'red'
                }
            },
            hAxis:{
                title: 'Year',
                titleTextStyle:{
                    color:'red'
                }
            },
            enableInteractivity: true
        }
        );
        TLSchart.draw(TLSdata,
        {
            width:
            1010,
            height:
            500,
            title: 'Total Live Stock',
            vAxis: {
                title: 'No of LiveStcoks (#)/Year',
                titleTextStyle: {
                    color: 'red'
                }
            },
            hAxis:{
                title: 'Year',
                titleTextStyle:{
                    color:'red'
                }
            },
            enableInteractivity: true
        }
        );

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'Default Values');
        if(globalCount != 0)
            {
                data.addColumn('number', 'Change Values');
            }
        data.addRows(parseInt(noOfYears)+1);
        var compareCnt = 0;
        var mydata = [];
        for(var i = 0;i<=noOfYears;i++)
        {
            data.setValue(i,0,defaultprofit_LossData[compareCnt]);
            compareCnt = compareCnt+5;
            data.setValue(i,1,parseFloat(defaultprofit_LossData[compareCnt]));
            //            data.setValue(i,2,parseFloat(profit_LossData[compareCnt]));
            if(globalCount == 0)
            {
//                data.setValue(i,2,parseFloat("--"));
                mydata.push({
                    Year:i,
                    AceEngineerDefault:defaultprofit_LossData[compareCnt],
                    ChangedValues:'--'
                });
            }
            else
            {
                data.setValue(i,2,parseFloat(profit_LossData[compareCnt]));
                mydata.push({
                    Year:i,
                    AceEngineerDefault:defaultprofit_LossData[compareCnt],
                    ChangedValues:profit_LossData[compareCnt]
                });
            }
            compareCnt++;
        }
        globalCount++;
        eightjq.grid.jqGrid('setGridParam',{
            data: mydata
        });
        eightjq.grid.trigger("reloadGrid");

        var chart = new google.visualization.LineChart(document.getElementById('comparisonChartDiv'));
        chart.draw(data,
        {
            width:
            700,
            height:
            500,
            title: 'Comparison of Default/Change Values of Profit/Loss',
            //            legend:{position:'bottom'},
            vAxis: {
                title: 'Profit/Loss(%) /Year',
                titleTextStyle: {
                    color: 'red'
                }
            },
            hAxis:{
                title: 'Year',
                titleTextStyle:{
                    color:'red'
                }
            },
            enableInteractivity: true
        });
    }catch(e)
    {
        alert("Excption is Raised "+e);
    }
}
var Input = {
    restrictToNumeric: function(ele,errorHandler,value){
        var ME = this;
        $(ele).keydown(function(evt){
            var key = evt.keyCode;
            // Checking for Signs they Should be First Character

            //                if(key==187 || key==189 || key==107 || key==109)
            //                {
            //                    if($(ele).val().length>0)
            //                    {
            //                        evt.preventDefault();
            //                        return;
            //                    }
            //                    return;
            //                }
            if(value == ".")
            {
                if(key==190 || key==110)
                {
                    if($(ele).val().indexOf(".")>=0)
                    {
                        evt.preventDefault();
                        return;
                    }
                    return;
                }
            }

            // Checking fot Decimel

            if(ME.isNumeric(key) || key ==8 || key ==9)
            {
                return;
            }
            if(key == 46 || key == 37 || key == 39)
            {
                return;
            }
            evt.preventDefault();
        });
    },

    /**
             * This Method Checks whether the Given Key COde is Numeric or Not
             */
    isNumeric: function(code){
        return ( (code>=48&&code<=57) || (code>=96&&code<=105) );
    }
}
var Mask = {
    showMask : function(div,options)
    {
        var maskDiv = document.createElement('div');
        $(maskDiv).css({
            'position':'absolute',
            'left':$(div).position().left,
            'top':$(div).position().top,
            'width':$(div).outerWidth(),
            'height':$(div).outerHeight(),
            'text-align':'center',
            'background':'url("res/images/loading.gif") no-repeat center black',
            'color':'red'
        });

        $(maskDiv).attr({
            'class':'maskDiv'
        });

        $(maskDiv).html("Loading Please wait...........").fadeTo(0,0.5,null);
        var ele = $(div).parent()[0];
        $(ele).append(maskDiv);
    },
    hideMask : function(div)
    {
        var ele = $(div).parent()[0];
        $(ele).find('.maskDiv').remove();
    }
}
function dataValidate(obj,val)
{
    var dec = new RegExp("^([-0-9]*|[0-9]*\\.\\d?\\d*)$");
    if(!dec.test(val))
    {
        alert("Please Enter Correct Values");
        $(obj).focus();
        return false;
    }
    //            if(val == 0)
    //            {
    //                alert("Value Should not be Zero");
    //                $(obj).focus();
    //                return false;
    //            }
    if(val.length >50)
    {
        alert("The Value is Out of Range");
        $(obj).focus();
        return false;
    }
    return true;
}
function tableGrid()
{
    firstmodel = [{
        name: 'Year',
        label: 'Year',
        width:170,
        sorttype: "float"
    },
    {
        name: 'Revenue',
        label:'Revenue(INR)',
        width:170,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'Expenses',
        label:'Total Expenses(INR)',
        width:170,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'ProfitLoss',
        label:'Profit_Loss(INR)',
        width:170,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'LSValue',
        label:'LiveStock Value(INR)',
        width:170,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'Profit_Cost',
        label:'Profit/Cost(%)',
        width:160,
        editable: true,
        sorttype: "float",
        align:"right"
    }
    ];
    secondmodel = [{
        name: 'Year',
        label: 'Year',
        width:130,
        editable: true,
        sorttype: "float"

    },
    {
        name: 'MPD',
        label:'Milk Liters/Day',
        width:170,
        editable: true,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'MC',
        label:'Consumption Liters/Day',
        width:200,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    
    {
        name: 'MSD',
        label:'Milk Sold Liters/Day',
        width:170,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'MSY',
        label:'Milk Sold Liters/Year',
        width:170,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'MCL',
        label:'Milk Cost/Liter(INR)',
        width:170,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    ];
    thirdmodel = [{
        name: 'Year',
        label: 'Year',
        width:80,
        editable: true,
        sorttype: "float"
    },
    {
        name: 'LAC',
        label:'Live Stock Cost*',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'FI',
        label:'FI*',
        width:150,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'FLS',
        label:'Feed /LS*',
        width:110,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'FB',
        label:'Feed Expenses*',
        width:130,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'WW',
        label:'Wage /1Worker*',
        width:150,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'NOW',
        label:'No Of Workers',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'WWB',
        label:'Worker Wages*',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"
    }
    ];
    fourthmodel = [{
        name: 'Year',
        label: 'Year',
        width:80,
        editable: true,
        sorttype: "float"
    },
    {
        name: 'VDL',
        label:'Doctor Fees/1LS*',
        width:140,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'VDB',
        label:'Doctor Ex*',
        width:90,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'MLS',
        label:'Medicine Fees/1LS*',
        width:110,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'MB',
        label:'Medicine Ex*',
        width:110,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'ILS',
        label:'Insurance/1LS*',
        width:110,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'IB',
        label:'Insurance Ex*',
        width:110,
        editable: true,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'MSH',
        label:'Manager Sal/1hr*',
        width:140,
        editable:true,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'MSB',
        label:'Manager Sal*',
        width:120,
        editable: true,
        sorttype: "float",
        align:"right"

    }
    ];
    fifthmodel = [
    {
        name: 'Year',
        label: 'Year',
        width:80,
        editable: true,
        sorttype: "float"
    },
    {
        name: 'LSC',
        label:'LS Cost*',
        width:120,
        editable: true,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'CB',
        label:'Cell Ex/Mnth*',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"

    },
    {
        name: 'PowB',
        label:'Power Ex/Mnth*',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'PumpB',
        label:'Pump Ex/Mnth*',
        width:130,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'OEB',
        label:'Maintenance for FI*',
        width:160,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'LR',
        label:'Land Rent/Mnth*',
        width:130,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'VC',
        label:'Variable Cost*',
        width:130,
        editable: true,
        sorttype: "float",
        align:"right"
    }
    ];
    sixthmodel  = [{
        name: 'Year',
        label: 'Year',
        width:70,
        editable: true,
        sorttype: "float"

    },
    {
        name: 'NBLS',
        label:'newly Born LS (#)',
        width: 130,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'NBF',
        label:'Born F (#)',
        width: 90,
        editable:true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'NBM',
        label:'Born M (#)',
        width: 90,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'MLS',
        label:'matured LS (#)',
        width: 110,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'TFC',
        label:'F Calves (#)',
        width: 100,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'GLS',
        label:'Gestating LS (#)',
        width : 130,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'TF',
        label:'Total F (#)',
        width : 90,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'TM',
        label:'Total M (#)',
        width: 90,
        editable: true,
        sorttype: "float",
        align:"right"
    },
    {
        name: 'TLS',
        label:'Total LS(#)',
        width: 100,
        editable: true,
        sorttype: "float",
        align:"right"
    }
    ];
    sevenmodel = [
    {
        name:'Dummy',
        label:' ',
        width:350
    },
    {
        name:'defaultVal',
        label:'Default Values (INR)',
        width:330,
        align:"right"
    },
    {
        name:'sensitivity',
        label:'Sensitivity Values (INR)',
        width:330,
        align:"right"
    }
    ];
    eightmodel = [
    {
        name:'Year',
        label:'Year',
        width:50
    },
    {
        name:'AceEngineerDefault',
        label:'DefaultValues%',
        width: 120,
        align:"right"
    },
    {
        name: 'ChangedValues',
        label:'ChangedValues%',
        width:132,
        align:"right"
    }
    ];
    firstjq = new JQGrid('profitLossTable','profitLossDiv',firstmodel,'Profit Loss');
    secondjq = new JQGrid('milkProdTable','milkProdDiv',secondmodel,'Milk Production(Note: Each LiveStock produce 6 Ltrs/Day, "#"-- Number)');
    thirdjq = new JQGrid('investTable1','investDiv1',thirdmodel,'Fixed Investment("*" -- INR, "FI" -- Fixed Investment(It includes Shed Cost, Transport, Cell Cost, Fans & Lights , Equipments and etc))');
    fourthjq = new JQGrid('investTable2','investDiv2',fourthmodel,'Variable Investment("*" -- INR, "Ex" -- Expenses)');
    fifthjq  = new JQGrid('investTable3','investDiv3',fifthmodel,'Variable Investment("*" -- INR, "Ex" -- Expenses, "FI" -- Fixed Investment)');
    sixthjq = new JQGrid('LSLifeTable','LSLifeDiv',sixthmodel,'LiveStock Life Cycle("LS"--LiveStcok, "M" -- Male , "F"-- Female, "#"-- Number)');
    sevenjq = new JQGrid('defaultValueTable','defaultValueDiv',sevenmodel,'Comparison Table');
    eightjq = new JQGrid('viewTable','viewData',eightmodel,'Chart Values');
}

