/* 
 * This Class is Responsible for Generating Reports
 */
var usedVacations = 0;
var usedSick = 0;
function PMSReports(tsObj)
{
    /** This Object used to Holds the TimeSheeeet Object Referrence */
    this.timeSheet = tsObj;
    this.salDetails = null;
    
    
    this.baseChartOpt = {
        width: 760,
        height: 300,
        fontName : 'Times New Roman',
        //backgroundColor: '#f3f3f3',
        backgroundColor: '#ffffff',
        is3D: true,
        animation:{
            duration:20000,
            easing:'linear'
        },
        titleTextStyle:{            
        },
        hAxis : {
            titleTextStyle:{
                color:'blue',
                fontSize:20
            },            
            maxAlternation: 1
        },
        vAxis : {
            titleTextStyle:{
                color:'blue',
                fontSize:20
            }
        },
        chartArea : {
            left:50,
            top:50,
            width:"100%"
        //height:"75%"
        },
        legend :{
            position:'bottom'
        }
    }
    
    // Chart Objects
    this.wprChartDiv = null;
    this.wprActualData = null;
    this.wprChartnavigImg = document.createElement('img');
    $(this.wprChartnavigImg).attr({
        'src':'res/images/back.png',
        'width':'32px',
        'height':'32px'
    });
    
    this.wprNavig = [];
    this.wprChartDataStack = [];
    this.wprDataStack = [];    
    this.wprChart = null;
    this.wprChartData = null;
    this.wprChartOptions = {
        width:'780',
        height:'400',
        isStacked:true,
        animation :{
            duration:1000,
            easing:'linear'
        },
        chartArea : {
            left:100,
            top:50,            
            width:"80%",
            height:"60%"
        },
        hAxis:{
            title:'Employees'
        },
        legend:{
            position:'bottom'
        }
    };    
    
    
    // Project Status Chart Objects
    this.psChart = null;
    this.psChartData = null;
    /** This Object Holds the Cumulative Mode Data of the Project */
    this.psChartDataCM = null;
    this.psChartOptions = {
        width: '780',
        height:'400',
        animation:{
            duration: 1000,
            easing: 'out'
        },
        chartArea : {
            left:50,
            top:50,            
            width:"100%",
            height:"60%"
        },
        hAxis:{
            title:'Days'
        },
        vAxis:{
            title:'Hours'
        }
    }
    
    
    // Salary Sheet OBjects
    //    this.salaryOptions = {
    //        cal : {
    //            basic : 0.33,
    //            hra : 0.3,
    //            conveyance : 800,
    //            specialAllowance : 0.4,
    //            MAX_SICKS : 5,
    //            MAX_VACATIONS : 9,
    //            HOURS_PER_DAY : 8
    //        }
    //    }
    
    
    var ME = this;
    // Registering the WPR Chart Navigation Controls
    $(this.wprChartnavigImg).click(function()
    {
        //alert("Stack SIze : "+ME.wprChartDataStack.length);
        if(ME.wprChartDataStack.length > 0)
        {
            //alert("Before Deleting Size : "+ME.wprChartDataStack.length);
            var chartData = ME.wprChartDataStack[0];
            // Leavbing Atleast One ELement by default
            if(ME.wprChartDataStack.length>1)
            {
                ME.wprDataStack.pop();
                ME.wprChartDataStack.pop();
                chartData = ME.wprChartDataStack[ME.wprChartDataStack.length-1];
            }            
            //alert("After Deleting Size : "+ME.wprChartDataStack.length);
            $('#myDiv').html(($.toJSON(chartData)));
            ME.drawChart(ME.wprChart,chartData, ME.wprChartOptions);            
        }
            
    });
}


/**
 * This Method is suedt o Initialize The PMSReport Object
 */
PMSReports.prototype.registerWPRChart = function()
{
    var ME = this;    
    
    google.visualization.events.addListener(this.wprChart, 'select', function()
    {
        var len = ME.wprChartDataStack.length;        
        //alert("Stack Length is : "+len+"\nData Length : "+ME.wprDataStack.length);
        var sel = ME.wprChart.getSelection()[0];
        if(!sel)
            return;
        
        var r = sel.row;
        var c = sel.column;
        var colHead = ME.wprChartData.getColumnLabel(c);
        var rowHead = ME.wprChartData.getValue(r,0);
        //alert(colHead+" : "+rowHead);
        //ME.wprNavig.push(rowHead);
        //alert(ME.wprNavig);
        try
        {
            ME.changeWPRChartMode(len, rowHead);    
        }catch(e){
            alert("Error While Draing Chart : "+e);
        };
    });
}

/**
 * This Method Changes the WPR Chart to The Desired Mode
 */
PMSReports.prototype.changeWPRChartMode = function(ind,rowHead)
{
    var ME = this;    
    var data;
    //alert('hello : '+ind);
    switch(ind)
    {
        case 1:
            data = ME.wprDataStack[0];            
            var selInd = -1;
            for(var i=0;i<data.length;i++)
            {
                var empObj = data[i];
                if(empObj[0][0].EID == rowHead)
                {
                    selInd = i;
                    break;
                }
            }
            //alert(selInd);
            ME.changeWPRChartToEmpDayMode(data[selInd]);                
            break;
                
        case 2:
            //alert('hello');
            data = ME.wprDataStack[1];
            //alert(data);
            selInd = -1;
            for(i=0;i<data.length;i++)
            {
                var projGroupObj = data[i];
                for(var j=0;j<projGroupObj.length;j++)
                {
                    var projObj = projGroupObj[j];
                    if(projObj.PID == rowHead)
                    {
                        selInd = i;
                        break;
                    }
                }                    
            }
            var projects = data[selInd];
            var phases = [];
            var hours = [];
            for(i=0;i<projects.length;i++)
            {
                var phasesArray = projects[i].WO;
                for(j=0;j<phasesArray.length;j++)
                {
                    phases.push(phasesArray[j]);
                }                        
            }
            // Removing Dulicate Entries
            phases = phases.removeDuplicates();                
            for(i=0;i<phases.length;i++)
            {
                hours[i] = 0;
            }
                
            for(i=0;i<projects.length;i++)
            {
                phasesArray = projects[i].WO;
                var phasesHours = projects[i].WH;
                for(j=0;j<phases.length;j++)
                {
                    hours[phases.indexOf(phasesArray[j])] += parseFloat(phasesHours[j]);
                }
            }
            
            
            ME.wprChartData = new google.visualization.DataTable();
            ME.wprChartData.addColumn('string','Phase');
            ME.wprChartData.addColumn('number','Worked Hours');
            var tabData = [];
            for(i=0;i<phases.length;i++)
            {
                tabData[i] = [phases[i],hours[i]];
            }
            ME.wprChartData.addRows(tabData);
            ME.drawChart(ME.wprChart, ME.wprChartData,ME.wprChartOptions);
            
            // adding to Stack
            ME.wprChartDataStack.push(ME.wprChartData);
            ME.wprDataStack.push(data);
            
            //$('#myDiv').html($.toJSON(data[selInd]));
            break;                
        default:
            alert("You Can't Go Beyond this");
    }
}

/**
 * This MEthod Changes the Chart Mode from
 * Day/Day view to Day by Project Mode
 */
PMSReports.prototype.changeWPRChartToEmpDayMode = function(empObj)
{
    var ME = this;    
    var tabData = [];
    var projs = [];
    var hours = [];
    
    // Holding the Project Wise data in this Object
    var groupData = ME.groupDataBy(empObj, 'project');
    //$('#myDiv').html($.toJSON(groupData));
    //alert(groupData.length);
    for(var i=0;i<groupData.length;i++)
    {
        var projGroupObj = groupData[i];
        for(var j=0;j<projGroupObj.length;j++)
        {
            var projObj = projGroupObj[j];
            if(projs.indexOf(projObj.PID)<0)
                projs.push(projObj.PID);
        }
    }    
    // Removing Duplicate Entries
    projs = projs.removeDuplicates();
    projs.sort();
    for(i=0;i<projs.length;i++)
    {
        hours[i] = 0;
    }
    for(i=0;i<groupData.length;i++)
    {
        projGroupObj = groupData[i];
        for(j=0;j<projGroupObj.length;j++)
        {
            projObj = projGroupObj[j];
            hours[projs.indexOf(projObj.PID)] += ME.sumAllWorkingHours(projObj);
        }
    }
    // Now filling the Data in to the Table
    for(i=0;i<projs.length;i++)
    {
        tabData[i] = [projs[i],hours[i]];
    }
    
    ME.wprChartData = new google.visualization.DataTable();
    ME.wprChartData.addColumn('string','Project');
    ME.wprChartData.addColumn('number','Worked Hours');
    ME.wprChartData.addRows(tabData);
    // Adding the Data Table Object to Stack
    ME.wprDataStack.push(groupData);
    ME.wprChartDataStack.push(ME.wprChartData);
    
    ME.wprChartOptions.title = "Working Hours of "+ME.wprNavig[0];
    
    ME.drawChart(ME.wprChart, ME.wprChartData, ME.wprChartOptions);
}


/**
 * This Method Is Used to Generate the Weekly Progress Report
 */
PMSReports.prototype.generateWPR = function(div,options)
{
    Mask.showMask($(div).parent('div'), {});
    var ME = this;
    this.wprChartDiv = div;
    ME.wprChart = new google.visualization.ColumnChart(div);
    ME.wprChartData = new google.visualization.DataTable();
    
    // Adding the Navigator Div to Chart Div
    //$(ME.wprChartDiv).before(ME.wprChartnavigImg);    
    
    var chartArray = [];
    var emps;
    var empNames = [];
    var dates;
    var hours;
    var groupData;
    function handler(data)
    {
        ME.wprActualData = groupData;
        Mask.hideMask($(div).parent('div'));
        
        emps = ME.getPropertyAsArray(data, 0, 'EID');
        emps = emps.removeDuplicates();
        emps.sort();
        
        var empNamesQuery ="";
        for(var i=0;i<emps.length;i++){
            empNamesQuery += "empIds="+emps[i]+"";
            if(i<emps.length-1)
                empNamesQuery+="&";
        }
        
        //alert(emps);
        $(div).html("");
        $.get("employeeHandler.do?mode=4&"+empNamesQuery,{},function(data)
        {
            data = eval("("+data+")");
            for(var i=0;i<emps.length;i++)
            {
                for(var j=0;j<data.length;j++){
                    if(data[j].empId == emps[i])
                    {
                        empNames.push(data[j].initials);
                        break;
                    }
                }
            }
            //alert(empNames);
            drawWPR();
        });
        
        //alert(empNamesQuery);
        
        function drawWPR()
        {
        
            dates = ME.getPropertyAsArray(data, 0, 'date');
            dates = dates.removeDuplicates();
        
            groupData = ME.groupDataBy(data, 'employee');
        
            //$('#myDiv').html($.toJSON(groupData));
            // Storing the Date wise data in to the Actual WPR Data
        
            var hours = 0;
            var empInd = 0;
            for(var i=0;i<groupData.length;i++)
            {
                var empObj = groupData[i];
                hours = 0;
                // Getting Employee Index
                empInd = emps.indexOf(empObj[0][0].EID);
                for(var j=0;j<empObj.length;j++)
                {
                
                    var dayObj = empObj[j];
                    for(var k=1;k<dayObj.length;k++)
                    {
                        var projObj = dayObj[k];
                        //alert($.toJSON(projObj));
                        try
                        {
                            hours += ME.sumAllWorkingHours(projObj);
                        }
                        catch(e){
                            alert("Eror While Adding Working Hours :"+e);
                        }
                    }
                }
                //alert(hours);
                chartArray[empInd] = [empNames[empInd],hours];
            }
        
            ME.wprChartData.addColumn('string','Employee');
            ME.wprChartData.addColumn('number','Working Hours');
        
            ME.wprChartData.addRows(chartArray);
        
            // First Pushing the Current Data Table to The Stack
            //ME.wprNavig = [];
            ME.wprNavig.push("Working Hours of All Employees");
            ME.wprChartDataStack = [];
            ME.wprChartDataStack.push(ME.wprChartData);
            ME.wprDataStack = [];
            ME.wprDataStack.push(groupData);
        
            var opt = $.extend(true,{},ME.baseChartOpt);
        
            //opt.width = 760;
            opt.hAxis.title = 'Employees';        
            opt.vAxis.title = 'Working Hours';
            opt.vAxis.minValue = 0;
        
            //alert($.toJSON(opt));
        
            ME.drawChart(div,ME.wprChart, ME.wprChartData,opt);        
        
        // Now Register the Chart
        
        // for Now blocking the Chart Navigations
        //ME.registerWPRChart();
        
        //alert(chartArray.lengtrh);
        //$('#myDiv').html($.toJSON(groupData));
        //alert('charting done');
        }
    }    
    
    ME.timeSheet.retriveTimeDataFor(options, handler);    
}

/**
 * This MEthod Used to Generates the Project Status Report
 * of the Given Projects
 * @param div the Chart to Be Placed
 * @param options the Options Object
 */

PMSReports.prototype.generateProjectStatus = function(div,options)
{
    var ME = this;
    ME.psChart = new google.visualization.LineChart(div);
    ME.psChartData = new google.visualization.DataTable();
    ME.psChartDataCM = new google.visualization.DataTable();
    var projId = options.projs[0];
    //alert($.toJSON(options));    
    
    var tabArray = [];
    var tabArrayCM = [];
    var pId = options.projs[0];
    //alert(pId);
   
    function handler(data)
    {    
        //alert("No of Objects Are : "+data.length);
        var dateWise = ME.groupByDate(data);
        var date;
        var hours = 0;
        var hoursCM = 0;
        //alert('hi! Data Retrived');
        //$('#myDiv').html($.toJSON(dateWise));
        //alert("Retrived Data is : "+data);
        for(var i=0;i<dateWise.length;i++)
        {
            try
            {
                hours = 0;
                var dateGroupObj = dateWise[i];
                date = dateGroupObj[0][0].date;
                for(var j=0;j<dateGroupObj.length;j++)
                {
                    var dayObj = dateGroupObj[j];
                    hours += ME.sumAllWorkingHours(dayObj[ME.getProjectIndex(dayObj,pId)]);                
                //alert("Index on"+dayObj[0].date);
                }
                hoursCM += hours;
                tabArray[i] = [date,hours];
                tabArrayCM[i] = [date,hoursCM];
            }catch(e){
                alert("Error Occured At : "+i);
            }
        }
        ME.psChartData.addColumn('string', 'Date');
        ME.psChartData.addColumn('number', 'Hours');
        
        ME.psChartDataCM.addColumn('string', 'Date');
        ME.psChartDataCM.addColumn('number', 'Hours');
        //ME.psChartDataCM.addColumn('number', 'cost');
        
        ME.psChartData.addRows(tabArray);
        ME.psChartDataCM.addRows(tabArrayCM);
        
        var opt1 = $.extend(true,{}, ME.baseChartOpt);
        opt1.hAxis.title = 'Dates';    
        opt1.vAxis.title = 'Hours Worked';
        opt1.pointSize = 5;
        opt1.hAxis = {
            title : "Dates",            
            titleTextStyle:{
                color:'#276A4B',
                fontSize:16
            },
            textStyle:{                
                fontSize:12
            },
            maxAlternation: 0
        }
        // Vertical Asix Configuration
        opt1.vAxis = {
            title:"Hours Worked",
            titleTextStyle:{
                color:'#276A4B',
                fontSize:16
            },
            gridlines:{
                count:5,
                color:'grey'
            },
            textStyle:{                
                fontSize:12
            }
        }
        opt1.chartArea = {
            left:50,
            top:15,
            width:"95%"
        //height:"75%"
        }
        ME.drawChart(div,ME.psChart, ME.psChartDataCM, opt1);
        var empWise = ME.groupByEmployee(data);
        var divison =  document.getElementById('PSNewChart');
        var sd = options.sDate.getDateAsPlainText();
        var ed = options.eDate.getDateAsPlainText();
        try
        {
            ME.generateEmployeeReportByProject(divison,
            {
                emps: tempArrayForEmployee,
                projs : [projId],
                sDate : sd,
                eDate : ed
            });
        //            });
        }
        catch(e)
        {
            alert("Exception is Raised "+e);
        }
    }
    $.get("projectHandler.do?mode=7&pid="+projId, null, function(data)
    {
        data = eval("("+data+")");
        var projStartDate = data[0].startDate;
        var projEndDate = data[0].endDate;
        ME.timeSheet.retriveTimeDataFor(options, handler);
    });
}


/**
 * This Function Handles the Generating of the  Project
 * by Phase Wise
 */ 

PMSReports.prototype.generateProjectStatusByPhase = function(div,options,chartType)
{    
    var ME = this;   
    var projId = options.projs[0];
    var projStartDate = options.sDate.getDateAsPlainText();
    var projEndDate = options.eDate.getDateAsPlainText();
    //alert($.toJSON(options));    
    
    function handler(data)
    { 
        //alert("No of Objects Are : "+data.length);
        //var projGroup = ME.groupByProject(data);
        var phases = [];
        var hours = [];
        var employees = [];
        for(var i=0;i<data.length;i++)
        {
            var dayObj = data[i];
            //            alert($.toJSON(dayObj));
            var ind = ME.getProjectIndex(dayObj, options.projs[0]);
            //            alert("Fouund At :"+ind);
            var projObj = dayObj[ind];
            //            alert($.toJSON(projObj));
            for(var j=0;j<projObj.WO.length;j++)
            {                
                try
                {                
                    if(phases.indexOf(projObj.WO[j]) < 0)
                    {
                        phases.push(projObj.WO[j]);
                        hours.push(0);
                    }
                    
                    hours[phases.indexOf(projObj.WO[j])] += parseFloat(projObj.WH[j]);
                }catch(e){
                //alert(e);
                }
                
            //alert(phases.indexOf(projObj.WO[j]));
            }            
        }
        
        
        /*
         * For Bar Chart 
         */
        var chart;    
        var opt = $.extend(true,{},ME.baseChartOpt);
        opt.hAxis.title ='Project Phases';        
        opt.vAxis.title ='Total Spended Hours';   
        chart = new google.visualization.ColumnChart(div);
        var chartData = new google.visualization.DataTable();
        chartData.addColumn('string','Phases');
        chartData.addColumn('number','Worked Hours');
        var tabData = [];
        for(i=0;i<phases.length;i++)
        {        
            tabData[i] = [phases[i],hours[i]];
        }
        chartData.addRows(tabData);
        ME.drawChart(div,chart, chartData, opt);
        
        
        /*
         * For PIE Chart
         */
        var chart1;    
        var opt1 = $.extend(true,{},ME.baseChartOpt);
        opt1.hAxis.title ='Project Phases';        
        opt1.vAxis.title ='Total Spended Hours';   
        chart1 = new google.visualization.PieChart(document.getElementById('PSPieChart'));
        var chartData1 = new google.visualization.DataTable();
        chartData1.addColumn('string','Phases');
        chartData1.addColumn('number','Worked Hours');
        var tabData1 = [];
        for(i=0;i<phases.length;i++)
        {        
            tabData1[i] = [phases[i],hours[i]];
        }
        chartData1.addRows(tabData1);
        ME.drawChart(document.getElementById('PSPieChart'),chart1, chartData1, opt1);
      
       
        
        
    //        if(chartType == "PIE")
    //        {
    //            alert("Pie Chart");
    //            chart = new google.visualization.PieChart(div);
    //            opt.is3D = true;
    //            opt.chartArea.top = 0;
    //            opt.fontSize = 9;
    //            opt.sliceVisibilityThreshold = 0;
    //        }            
    //        else
    //            chart = new google.visualization.ColumnChart(div);
    //    
    //        var chartData = new google.visualization.DataTable();
    //        
    //        chartData.addColumn('string','Phases');
    //        chartData.addColumn('number','Worked Hours');
    //        
    //        var tabData = [];
    //        for(i=0;i<phases.length;i++)
    //        {        
    //            tabData[i] = [phases[i],hours[i]];
    //        }
    //        chartData.addRows(tabData);
    //        
    //        
    //        
    //        ME.drawChart(div,chart, chartData, opt);
        
    }    
    
    $.get("projectHandler.do?mode=7&pid="+projId, null, function(data)
    {
        data = eval("("+data+")");
        //        projStartDate = data[0].startDate;
        //        projEndDate = data[0].endDate;
        //        projStartDate = data[0].startDate;
        //        projEndDate = data[0].endDate;
        //alert($.toJSON(options));
        //        options.sDate = Date.parse(projStartDate);
        //        options.eDate = Date.parse(projEndDate);    
        ME.timeSheet.retriveTimeDataFor(options, handler);
    });
    
//alert($.toJSON(options));
}


/**
 * This Method Changes the Status Chart mode as Specified
 * 0 for Normal Mode
 * 1 for Cumulative Mode
 */
PMSReports.prototype.changeProjectStatus = function(mode)
{
    var ME = this;
    
    switch(mode)
    {
        case 0:
            this.drawChart(ME.psChart, ME.psChartData, ME.psChartOptions);
            break;
        case 1:
            this.drawChart(ME.psChart, ME.psChartDataCM, ME.psChartOptions);
            break;
        default:
            this.drawChart(ME.psChart, ME.psChartDataCM, ME.psChartOptions);
    }
}


/**
 * This Method Computes the Sum of all the Working Hours in a
 * purticular Projects
 */
PMSReports.prototype.sumAllWorkingHours = function(projObj)
{
    var sum = 0;
    for(var i=0;i<projObj.WH.length;i++)
        sum += parseFloat(projObj.WH[i]);
    return sum;    
}

/**
 * This MEthod Returns teh Array of all the Existins Employee Id's
 * in the Data Object
 * this meay contains the Copy values
 * @param data the Data Array
 * @param ind the Sub index to search for Property
 * @param prop the Property to Search
 */
PMSReports.prototype.getPropertyAsArray = function(data,ind,prop)
{
    var array = [];
    for(var i=0;i<data.length;i++)
    {
        array.push(data[i][ind][prop]);
    }
    return array;
}

/**
 * This Method Used to Group the Given
 * data to the Specified Group like "date" "project" "employee"
 */
PMSReports.prototype.groupDataBy = function(data,group)
{
    var groupedData = [];    
    if(data.length<1)
        return groupedData;    
    if(group == "date")
    {
        groupedData = this.groupByDate(data);
    }
    else if(group == "employee")
    {        
        groupedData = this.groupByEmployee(data);        
    }
    else if(group == "project")
    {
        groupedData = this.groupByProject(data);
    }
    return groupedData;
}


/**
 * This Method Used TO Group the Data by Employee
 */
PMSReports.prototype.groupByEmployee = function(data)
{
    //alert(data.length);
    var groupedData = [];
    var empIds = [];
    for(var i=0;i<data.length;i++)
    {
        if(data[i] == null)
            continue;
        //alert(data[i][0].EID);
        empIds.push(data[i][0].EID);
        tempArrayForEmployee.push(data[i][0].EID);
    }
    // Removing The Duplicate Entries
    empIds = empIds.removeDuplicates();
    tempArrayForEmployee = tempArrayForEmployee.removeDuplicates();
    //alert(empIds);
    //now make the Array Objects for Each Employee
    for(i=0;i<empIds.length;i++)
    {
        groupedData[i] = [];
    }
    
    // now Scanning the Data for The Empid's
    var ind = 0;
    for(i=0;i<data.length;i++)
    {
        if(data[i] == null){            
            continue;
        }
            
        ind = empIds.indexOf(data[i][0].EID);
        groupedData[ind].push(data[i]);
    }
   
    return groupedData;
}

/**
 * This Method Group the Given data by Date Wise
 */
PMSReports.prototype.groupByDate = function(data)
{
    var count = 0;
    var groupedData = [];
    var pD= Date.parse(data[0][0].date);
    var cD;        
    groupedData[0] = [];
    for(var i=0;i<data.length;i++)
    {
        cD = Date.parse(data[i][0].date);
        if(!cD.equalsIgnoreTime(pD))
        {
            pD = cD;
            count++;
            groupedData[count] = [];
        }
        groupedData[count].push(data[i]);
    }    
    return groupedData;
}

/**
 * This Method Group the Data by Project Wise
 */
PMSReports.prototype.groupByProject = function(data)
{
    var groupedData = [];
    var pids = [];
    for(var i=0;i<data.length;i++)
    {
        var dateObj = data[i];
        for(var j=1;j<dateObj.length;j++)
        {
            pids.push(dateObj[j].PID);
        }
    }
    pids = pids.removeDuplicates();
    pids.sort();
    // making An Empty Arry Object
    for(i=0;i<pids.length;i++)
    {
        groupedData[i] = [];
    }
    
    for(i=0;i<data.length;i++)
    {
        var dayObj = data[i];
        for(j=1;j<dayObj.length;j++)
        {
            var projObj = dayObj[j];
            groupedData[pids.indexOf(projObj.PID)].push(projObj);
        }
    }    
    //$('#myDiv').html($.toJSON(groupedData));
    return groupedData;
}

PMSReports.prototype.groupByEmployeeProject = function(data)
{
    var groupedData = [];
    var empID = [];
    var pids = [];
    for(var i=0;i<data.length;i++)
    {
        var dateObj = data[i];
        for(var j=1;j<dateObj.length;j++)
        {
            pids.push(dateObj[j].PID);
        }
    }
    pids = pids.removeDuplicates();
    pids.sort();
    
    for(var i=0;i<data.length;i++)
    {
        empID.push(data[i][0].EID);
    }
    
    // making An Empty Arry Object
    for(i=0;i<pids.length;i++)
    {
        groupedData[i] = [];
    }
    
    for(i=0;i<data.length;i++)
    {
        var dayObj = data[i];
        for(j=1;j<dayObj.length;j++)
        {
            var projObj = dayObj[j];
            projObj.EID = [];
            projObj.EID.push(empID[i]);
            groupedData[pids.indexOf(projObj.PID)].push(projObj);
        }
    }    
    //$('#myDiv').html($.toJSON(groupedData));
    return groupedData;
}

/**
 * This Method Filters the Given Data by Employee id's
 */
PMSReports.prototype.filterDataByEmployee = function(data,empid)
{
    var filterData = [];
    for(var i=0;i<data.length;i++)
    {
        var dayObj = data[i];
    //alert(dayObj[0].EID);
    }
}

/**
 * This MEthod Checks whether the Given Peroject Exist or Not in the Given Day
 * Object
 * 
 * return the Index of the Project Id in that Day if it exists
 * -1 otherwise
 */
PMSReports.prototype.getProjectIndex = function(dayObj,projId)
{
    // Starting from 1 index because the First Object Containt The Info of the Day
    // so we are Skipping That
    for(var i=1;i<dayObj.length;i++)
    {
        var projObj = dayObj[i];
        if(projObj.PID == projId)
        {
            //alert("Found At : "+i);
            return i;
        }
            
    }        
    return -1;
}

/**
 * This Method Generates the Salary Sheet of the Specified Employee id
 */
PMSReports.prototype.generateSalaryReport = function(div,options,onComplete,salarySettings)
{
    var ME = this;    
    var currMonthDate = new Date().moveToFirstDayOfMonth();    
    var empId = options.empId;
    var sD = Date.parse(options.sDate);
    var dataBasesD = Date.parse(options.sDate);
    var eD = Date.parse(options.eDate);
    var dataBaseeD = Date.parse(options.eDate);
    var syD = sD.moveToFirstDayOfYear();
    var eyD = eD;
    var type = options.type;
    var doj = Date.parse(options.doj);
    doj = doj.moveToFirstDayOfMonth();
    if(sD<doj)
    {
        $(div).html("<h4>Salary Sheet cann't be generated before the Joining date of the Employee</h4>");
        return;
    }
    if(sD>currMonthDate){
        $(div).html("<h4>Salary Sheet cann't be generated Beyond the current Month</h4>")
        .append("Note: If you are unable to generate the Salary Reports please check your System time Once");
        return;
    }
    
    
    /*
     * Trying to store Vacations in DataBase and getting the results from the dataBase....
     **/
    
    
    dataBasesD.moveToPrevMonth();
    dataBasesD.addDays(-1);
    dataBasesD.moveToLastDayOfMonth();
    dataBasesD.moveToFirstDayOfWeek();
    dataBaseeD.moveToPrevMonth();
    dataBaseeD.moveToLastDayOfMonth();
    dataBaseeD.moveToFirstDayOfWeek();
    dataBaseeD.moveBy(-1);
          
    var sDate = dataBasesD.toString("yyyy-MM-dd");
    var eDate = dataBaseeD.toString("yyyy-MM-dd");
    var maxVacTemp = salarySettings.max_vac;
    //    alert(sDate);
    //    alert(eDate);
    $.get("salaryHandler.do?subMode=3&sDate="+sDate+"&eDate="+eDate+"&empId="+empId,null,function(data)
    {
        //alert(data);
        
        data = eval('('+data+')');
        
        if(data != ""){
            
            maxVacTemp = data[0].tV;
            // alert(Date.parse(eDate).getMonth());
            //            if(Date.parse(eDate).getMonth() == 11){
            //                usedVacations =0;
            //            
            //            }
            //               
            //            else
            usedVacations = data[0].tuV;
            usedSick = data[0].tS;
            
        }
            
        //alert(data[0].tV);
        //alert(data[0].tuV);
        salaryOptions = {
            cal : {
                basic : 0.33,
                hra : 0.3,
                conveyance : 800,
                specialAllowance : 0.4,
                MAX_SICKS : salarySettings.max_sicks,
                MAX_VACATIONS : salarySettings.max_vac,
                HOURS_PER_DAY : salarySettings.st_hours
            }
        }
        retriveVacationsInfo();
        
    });
   
    
    //alert("Employee ID : "+empId);
    //alert($.toJSON(options));
    //alert(sD.getDateAsPlainText()+"   :   "+eD.getDateAsPlainText());
    //alert(syD.getDateAsPlainText()+"   :   "+eyD.getDateAsPlainText());
    
    function handler(data)
    {
        var projs = [];
        var tV = 0;
        var tS = 0;
        var cV = 0;
        var cS = 0;
        var tempTV =0;
        var tempTS =0;
        
        //alert('Data Retrived '+$.toJSON(data));
        for(var i=0;i<data.length;i++)
        {
            var dayObj = data[i];
            var dayDate = Date.parse(dayObj[0].date);
            //alert("Date : "+dayDate);
            // this block for Current Day info
            if( dayDate >= sD && dayDate <= eD)
            {
                for(j=1;j<dayObj.length;j++)
                {
                    projObj = dayObj[j];
                    if(projObj.PID.toLowerCase() == "general")
                    {
                        WO = projObj.WO;
                        WH = projObj.WH;
                        ind = WO.indexOf('Vacation');
                        cV += parseFloat('' + ind<0?0:WH[ind]);
                        ind = WO.indexOf('Sick Leave');
                        cS += parseFloat('' + ind<0?0:WH[ind]);
                    }
                //projs.push(projObj);
                }                
            }
            
            for(var j=1;j<dayObj.length;j++)
            {
                var projObj = dayObj[j];
                if(projObj.PID.toLowerCase() == "general")
                {
                    var WO = projObj.WO;
                    var WH = projObj.WH;
                    var ind = WO.indexOf('Vacation');
                    tempTV = parseFloat('' + ind<0?0:WH[ind]);
                    if(tempTV != 0) {
                        if(tempTV < 6)

                        {
                            //tV += parseFloat('' + ind<0?0:WH[ind])/8;
                            tV+=parseFloat(0.5);
                        }
                        else
                        {
                            tV += parseFloat('' + ind<0?0:WH[ind])/tempTV;
                        }
                    }
                    ind = WO.indexOf('Sick');
                    tempTS = parseFloat('' + ind<0?0:WH[ind]);
                    if(tempTS != 0)
                    {
                        if(tempTS < 6)

                        {
                            //tS += parseFloat('' + ind<0?0:WH[ind])/8;
                            tS+= parseFloat(0.5);
                        }
                        else 
                        {
                            tS += parseFloat('' + ind<0?0:WH[ind])/tempTS;
                        }
                    }
                }
            //projs.push(projObj);
            }                
        }
        //alert(usedVacations);
        //alert("No of Vacations Are : "+tV+"\n No of Sicks Used are : "+tS);
        if(Date.parse(eDate).getMonth() == 11){
            if( usedVacations!= tV){
                tV = tV- usedVacations;
                salaryOptions.cal.MAX_VACATIONS = salarySettings.max_vac;
            }
            else{
                tV =0;
                salaryOptions.cal.MAX_VACATIONS = salarySettings.max_vac;
            }
                
            
        }
        if(Date.parse(eDate).getMonth() == 11){
            tS = tS- usedSick;
        }
        options.salaryCal = 
        {
            //            tV:Math.ceil((Math.ceil(tV*100)/100)/parseFloat(salaryOptions.cal.HOURS_PER_DAY)*100)/100.0,
            //            tS:Math.ceil(tS/parseFloat(salaryOptions.cal.HOURS_PER_DAY)*100)/100.0,
            tV:tV,
            tS:tS,
            cV:Math.ceil(cV/parseFloat(salaryOptions.cal.HOURS_PER_DAY)*100)/100.0,
            cS:Math.ceil(cS/parseFloat(salaryOptions.cal.HOURS_PER_DAY)*100)/100.0
        };
        //        options.salaryCal = {
        //            tV:tV/ME.salaryOptions.cal.HOURS_PER_DAY,
        //            tS:tS/ME.salaryOptions.cal.HOURS_PER_DAY,
        //            cV:cV/ME.salaryOptions.cal.HOURS_PER_DAY,
        //            cS:cS/ME.salaryOptions.cal.HOURS_PER_DAY
        //        };
        
        //alert("Salary Calculatioin : "+$.toJSON(options.salaryCal));
        // Retriving Working Hours of Month
        retriveWorkingHoursInMonth(); 
        
    }
    
    /**
     * This MEthod Retrives the Vacation Info the Current Employee up to the Current date of the Year
     */
    function retriveVacationsInfo()
    {
        // Requesting for Data
        var query = '?mode=3&query= where emp_id = \''+empId+'\' and ( data like \'%"Vacation"%\' or data like \'%"Sick"%\' ) and date BETWEEN \''+syD.getDateAsPlainText()+'\' AND \''+eyD.getDateAsPlainText()+'\' ORDER BY date';  
        //alert(this.timeSheet.dataRetriveURL+encodeURI(query));
        $.get(this.timeSheet.dataRetriveURL+encodeURI(query),null,function(data)
        {
            //alert("Vacations Info is : "+data);
            handler(eval("("+data+")"));
        });    
    }
    
    /**
     * This Method Retrives the Working hours of the Current Month
     */
    function retriveWorkingHoursInMonth()
    {
        var query = '?mode=3&query= where emp_id = \''+empId+'\' and date BETWEEN \''+sD.getDateAsPlainText()+'\' AND \''+eD.getDateAsPlainText()+'\' ORDER BY date';
        //alert(query);
        $.get(this.timeSheet.dataRetriveURL+encodeURI(query),null,function(data)
        {
            var val = parseFloat(salaryOptions.cal.HOURS_PER_DAY);
            var weekHours = [0,val,val,val,val,val,4];
            //            var weekHours = [0,9,9,9,9,9,4];
            //            var weekHours = [0,10,10,10,10,10,4];
            //            var weekHours = [0,8,8,8,8,8,4];
            var totalWorkedHours = 0;
            var totalHours = 0;
            var deductMonthlyHours = 0;
            var professionTax = 0;
            data = eval("("+data+")");
            //alert(data.length);
            for(var i=0;i<data.length;i++)
            {
                var dayObj = data[i];                
                totalWorkedHours += ME.timeSheet.sumAllHours(dayObj);                
            }            
            
            for(var d=sD.clone();d<=eD;d.addDays(1))
            {
                totalHours += weekHours[d.getDay()];
            //alert(d.getDay());
            }
            //professionTax
            if(options.salary <= 5000){
                professionTax = 0;
            }else if(options.salary >= 5001 && options.salary <= 6000){
                professionTax = 60;
            }else if(options.salary >= 6001 && options.salary <= 10000){
                professionTax = 80;
            }else if(options.salary >= 10001 && options.salary <= 15000){
                professionTax = 100;
            }else if(options.salary >= 15001 && options.salary <= 20000){
                professionTax = 150;
            }else if(20000 <= options.salary){
                professionTax = 200;
            }
            
            if(type != 'AUTO')
            {
                totalHours = parseFloat($("#total_Hours").val());
            }
            //alert("profession Tax is: "+professionTax);
            if(totalHours < totalWorkedHours || totalHours == totalWorkedHours){
                deductMonthlyHours = 0;
                if(totalHours < totalWorkedHours)
                {
                    if(totalWorkedHours-totalHours<val/2)
                    {
                        salaryOptions.cal.MAX_VACATIONS += 0.5;
                    //                        options.salaryCal.tV -= 0.5;   
                    }
                    else
                    {
                        
                        salaryOptions.cal.MAX_VACATIONS += Math.round((totalWorkedHours-totalHours)/val);
                    //                        options.salaryCal.tV -= Math.round((totalWorkedHours-totalHours)/val);       
                    }
                }
                options.salaryCal.totalWorkingHours = totalHours;
                options.salaryCal.totalWorkedHours = options.salaryCal.totalWorkingHours;
                options.salaryCal.deductMonthlyHours = deductMonthlyHours;
                options.salaryCal.proTax = professionTax;
            }
            else
            {
                deductMonthlyHours = totalHours-totalWorkedHours;
                options.salaryCal.totalWorkingHours = totalHours;
                options.salaryCal.totalWorkedHours = totalWorkedHours;
                options.salaryCal.deductMonthlyHours = deductMonthlyHours;
                options.salaryCal.proTax = professionTax;
            }
            //alert("Decduct Hours: "+deductMonthlyHours);
            //alert(options.sDate);
            // alert("Total hours : "+options.salaryCal.totalWorkingHours);
            // alert("Worked hours : "+options.salaryCal.totalWorkedHours);
            $(div).html(ME.makeSalaryReportContent(options));
            
            $('#approveSal').click(function(){
                $.get("salaryHandler.do?subMode=0&salInfo="+PMSReports.salDetails+"&sStatus=1", null, function(data){
                    if(data == 'true')
                        alert("Sheet submitted successfully");
                    else
                        alert("Sorry already submitted");
                });
            });
            // Calling the oncomplete Handler
            onComplete();
        });
       
    }
    
//ME.timeSheet.retriveTimeDataFor(options, handler);
}

/**
 * This Method Load the Salary Sheet Options
 */
PMSReports.prototype.loadSalaryOptions = function(o)
{
    
    }

/**
 * This Method Makes the Salary Report Content based on the Given
 * options Data
 * the Options Should Contain
 * 
 */
PMSReports.prototype.makeSalaryReportContent = function(options)
{ 
    var ME = this;
    //alert("ORG SAL: "+options.salary);
    var gSal = options.salary;
    
    options.salary = options.salary-options.salaryCal.proTax;
    var salaryDiv = $('#salaryReportDiv')[0];
    
    Mask.hideMask(salaryDiv);
    // alert(salaryDiv);
    //alert("Profession Tax: "+options.salaryCal.proTax);
    //alert("Deduct Hours: "+options.salaryCal.deductMonthlyHours);
    //alert("basic cal: "+this.salaryOptions.cal.basic);
    //alert("hra cal: "+this.salaryOptions.cal.hra);
    //alert("conveyance cal: "+this.salaryOptions.cal.conveyance);
    //alert("Deduct Professional Original Salary: "+options.salary);
    
    // Computin the basic Calculations for Salary
    //    var basic = options.salary * this.salaryOptions.cal.basic;
    //    var hourSal = !options.hourSal?options.salary/213.15:options.hoursSal;
    //    var hra = basic * this.salaryOptions.cal.hra;
    //    var conveyance = this.salaryOptions.cal.conveyance;
    //    var sa = basic * this.salaryOptions.cal.specialAllowance;
    //    var oa = options.salary - (basic+hra+conveyance+sa);
    //    var total = options.salary;
    //    var totalDed = 0;
    var basic = gSal * salaryOptions.cal.basic;
    var hourSal = !options.hourSal?gSal/191.3:options.hoursSal;
    var hra = basic * salaryOptions.cal.hra;
    var conveyance = salaryOptions.cal.conveyance;
    var sa = basic * salaryOptions.cal.specialAllowance;
    var oa = gSal - (basic+hra+conveyance+sa);
    var total = gSal;
    var lossOfpay = 0;
    var salaryCal = options.salaryCal;
    var totalDeductions = 0; 
    
    
    // Deducting for Not Worked Hours
    //    totalDed = (salaryCal.totalWorkingHours - salaryCal.totalWorkedHours) * hourSal;
    lossOfpay = options.salaryCal.deductMonthlyHours * hourSal;
    
    // Now Computing the Leaves and Seaks
    //alert(usedVacations);
    // alert(salaryCal.tV);
    //    if(usedVacations != salaryCal.tV){
    if(usedVacations != salaryCal.tV){
        if(salaryCal.tV > parseFloat(salaryOptions.cal.MAX_VACATIONS))
            lossOfpay += ((salaryCal.tV-parseFloat(salaryOptions.cal.MAX_VACATIONS))*salaryOptions.cal.HOURS_PER_DAY) * hourSal;
    
        if(salaryCal.tS > parseFloat(salaryOptions.cal.MAX_SICKS))
            lossOfpay += ((salaryCal.tS-parseFloat(salaryOptions.cal.MAX_SICKS))*salaryOptions.cal.HOURS_PER_DAY) * hourSal;
    }
        
    // now deduct the Leave Salary from the Employee Salary
    // First Deducting from Other Special Allowaence
    var ded = lossOfpay;
    if(ded > oa)
    {
        ded -= oa;
        oa = 0;
        if(ded > sa)
        {
            ded -= sa;
            sa = 0;
            if(ded>conveyance)
            {
                ded -= conveyance;
                conveyance = 0;
                if(ded > hra)
                {
                    ded -= hra;
                    hra = 0;
                    if(ded > basic)
                    {
                        ded -= basic;
                        basic = 0;
                    }
                    else
                    {
                        basic -= ded;
                    }
                }
                else
                {
                    hra -= ded;
                }
            }
            else
            {
                conveyance -= ded;
            }
        }
        else
        {
            sa -= ded;
        }            
    }
    else
    {
        oa -= ded;
    }        
        
    //alert(oa);
    //alert(options.eDate.toString("MMMM, yyyy (HH:ss)"));
    
    var deduction  = options.salaryCal.proTax ; // need to add income tax and  provident fund in future.
    total = basic + hra + conveyance + sa + oa;
    totalDeductions = lossOfpay+options.salaryCal.proTax;
    
    //    var c = "";
    //    c+=""
    //    c+=""
    //    c+=""
    //    c+=""
    //    c+=""
    //    c+="";
    //    
    
    
    
    //alert(options.empName);
    //  alert(salsheetDetails);
    var dateS = new Date(options.sDate);
    var dateE = new Date(options.eDate);
   
    //    alert(date.getDate());
    //    alert(date.getMonthName());
    //    alert(date.getYear());
    
    var startDate = dateS.getDate()+"-"+dateS.getMonthName("MMM")+"-"+dateS.getFullYear();
    var endDate = dateE.getDate()+"-"+dateE.getMonthName("MMM")+"-"+dateE.getFullYear();
    
    var salsheetDetails = [options.empName,
    options.designation,
    startDate,
    endDate,
    //    options.sDate.toString("MMMM, yyyy (HH:ss)"),
    //    options.eDate.toString("MMMM, yyyy (HH:ss)"),
    Math.round(basic),
    Math.round(hra),
    Math.round(conveyance),
    Math.round(sa),
    Math.round(oa),
    Math.round(total),
    "0",
    options.salaryCal.proTax,
    "0",
    Math.round(lossOfpay),
    Math.round(totalDeductions),
    salaryCal.totalWorkingHours,
    salaryCal.totalWorkedHours,
    salaryCal.tV,
    parseFloat(salaryOptions.cal.MAX_VACATIONS),
    salaryCal.tS,
    (Math.round(gSal)-Math.round(totalDeductions)),
    gSal
    ];
    PMSReports.salDetails = salsheetDetails;
    
    
    /*ajax call to generate and create pdf report for salary sheet*/
    $.get("reports.do?typeOfRep=0&salDetails="+salsheetDetails,null,function(data){
        //alert("Ajax result : "+data);        
        });
    
    
    var c = "";
    c += "<table border='0' class='salarySheet' width='100%'>"
    // Head Started
    //    +"<thead>"
    //    +"<tr><th colspan='4'>PRAROHANA ENTERPRISES PVT. LTD</th><tr>"
    //    +"<tr><th colspan='4'>401 NAMITA FORT, PANCHAVATI COLONY</th><tr>"
    //    +"<tr><th colspan='4'>MANIKONDA, HYDERABAD - 500 089</th><tr>"
    //    +"<tr><th colspan='4'>ANDHRA PRADESH</th><tr>"
    //    +"<tr><th colspan='4'>Salary Slip</th><tr>"
    //    +"<thead>"
    // Head Block Completed

    // Body Block Started
    
    +"<tbody>"
    +"<tr><td style='width: 150px;' valign='top'><a href='#'><img src='res/images/logo.png' width='150'></a></td><td colspan='3' align='left' style='text-align:center;'><b>Prarohana Enterprises Pvt. Ltd</br>401 Namitha's Fort,  Panchavati Colony, </br>Manikonda, Hyderabad - 500 089.</br>ANDHRA PRADESH</b></br></td></tr>"
    +"<tr><td colspan='4' align='center'><hr></td></tr>"
    +"<tr><td colspan='4' align='center'><b>PAY SLIP</b></td></tr>"
    +"<tr><td colspan='4'><hr></td></tr>"
    +"<tr><td colspan='2'>Name of The Employee</td><td colspan='2'>"+options.empName+"</td></tr>"
    +"<tr><td colspan='2'>Designation</td><td colspan='2'>"+options.designation+"</td></tr>"
    //    +"<tr><td colspan='2'>Pay Slip for the period of&nbsp;</td><td><span style='color:#50A23A;'><b>"+options.sDate.toString("MMMM, yyyy (HH:ss)")+"</b></span>&nbsp;To&nbsp;<span style='color:#50A23A;'><b>"+options.eDate.toString("MMMM, yyyy (HH:ss)")+"</b></span></td></tr>"
    +"<tr><td colspan='2'>Pay Slip for the period of&nbsp;</td><td colspan=2><span style='color:#50A23A;'><b>"+startDate+"</b></span>&nbsp;To&nbsp;<span style='color:#50A23A;'><b>"+endDate+"</b></span></td></tr>"

    +"<tr><th colspan='2'>Earnings</th><th colspan='2'>Deductions</th></tr>"
    +"<tr><td>Basic & DA</td><td style='width:180px;'>"+Math.round(basic)+"</td><td style='width:150px;'>Provident Fund</td><td>-</td></tr>"
    +"<tr><td>HRA</td><td>"+Math.round(hra)+"</td>"
    +"<td>Professional Tax</td><td>"+options.salaryCal.proTax+"</td>"
    +"</tr>"
    +"<tr><td>Conveyance</td><td>"+Math.round(conveyance)+"</td>"
    +"<td>Income Tax</td><td>-</td>"
    +"</tr>"
    +"<tr><td>Special Allowance</td><td>"+Math.round(sa)+"</td>"
    +"<td>Loss of Pay for not working</td><td>"+Math.round(lossOfpay)+"</td></tr>"
    +"<tr><td>Other Suppl. Allowance</td><td>"+Math.round(oa)+"</td></tr>"
    +"<tr><td>Total Earnings</td><td><b>"+Math.round(total)+"</b></td><td>Total Deduction</td><td><b>"+Math.round(totalDeductions)+"</b></td></tr>"

    +"<tr><th colspan='2'>Hours & Leaves</th><td></td><td></td></tr>"
    +"<tr><td>Total Hours</td><td>"+salaryCal.totalWorkingHours+"</td><td></td><td></td></tr>"
    +"<tr><td>Total Hours Worked</td><td>"+salaryCal.totalWorkedHours+"</td><td>Net Salary</td><td class='total'><b>"+(Math.round(gSal)-Math.round(totalDeductions))+"</b></td></tr>"
    +"<tr><td>Vacations Used</td><td>"+Math.ceil(salaryCal.tV*100)/100.0 +' / '+ parseFloat(salaryOptions.cal.MAX_VACATIONS)+"</td>"
    +"<tr></tr>"
    +"<tr><td>Sick Leaves Used</td><td>"+salaryCal.tS + ' / '+ parseFloat(salaryOptions.cal.MAX_SICKS)+"</td>"
    +"<tr><td colspan='5' align='right'><input type='button' id='approveSal' value='Submit Sheet'/></td></tr>"
    +"<tr><td colspan='5' align='center' style='color:green;'><b>Computer generated report, Signature not required</b></td></tr>"
    
    +"</tbody>"
    // Body Bolck Ends Here
    +"<tfoot>"
    +"<tr><td colspan='4' style='text-align:right;color:red'><hr/>Currency Paid in (INR)</td></tr>"
    +"</tfoot>"
    
    +"</table>";   
    
    return c;
}

/**
 * This Method Gets all the Phases from the Group of the Project Object
 */
PMSReports.prototype.getAllPhases = function(projGroup){
    var phases = [];
    for(var i=0;i<projGroup.length;i++)
    {
        var projObj = projGroup[i];
        for(var j=0;j<projObj.WO.length;j++)
        {
            phases.push(projObj.WO[j]);
        }
    }    
    phases = phases.removeDuplicates();
    return phases;
}

/**
 * This Method used to Generate the Employee Report
 * of the Specified EMployee
 */
PMSReports.prototype.generateEmployeeReport = function(div,options)
{
    var ME = this;
    var chart = new google.visualization.ColumnChart(div);
    var chartData = new google.visualization.DataTable();    
    //alert($.toJSON(options));
    var tabArray = [];
    var array = [];
    var empId = options.emps[0];
    var projIds = [];
    
    // Applyinfg the Mask
    Mask.showMask($(div).parent('div'), {});
    //alert(empId);
    function handler(data)
    {        
        projIds = [];
        Mask.hideMask($(div).parent('div'));
        //alert("No of Objects Are : "+data.length);
        if(data.length < 1)
        {
            div.innerHtml = "<h3>No data found </h2>";
            return;
        }
        var projWise = ME.groupByProject(data);
        if(projWise.length < 1)
        {
            div.innerHtml = "<h3>No data found </h2>";
            return;
        }
        var phases = [];
        var cols = [];
        var rows = [];
        // First Retriving the Phases by Project Wise
        for(var i=0;i<projWise.length;i++){
            var projGroup = projWise[i];
            phases[i] = ME.getAllPhases(projGroup);
        }
        
        // Now get the Table heading from all the Project Phases
        for(i=0;i<phases.length;i++)
        {
            cols.pushAll(phases[i]);
        }
        cols = cols.removeDuplicates();
        // now Making the Data Rows
        var row;
        for(i=0;i<projWise.length;i++)
        {
            projGroup = projWise[i];
            row = [];
            for(var j=0;j<cols.length;j++)
                row[j] = 0;
            for(j=0;j<projGroup.length;j++)            
            {
                var projObj = projGroup[j];
                for(var k=0;k<projObj.WO.length;k++)
                {
                    var phase = projObj.WO[k];
                    row[cols.indexOf(phase)] += parseFloat(projObj.WH[k]);
                }
            }
            //alert(row);
            projIds.push(projGroup[0].PID);
            var t = [projGroup[0].PID];
            t.pushAll(row);
            rows.push(t);
        }
        var p = new ProjList(projIds, function(projsInfo)
        {
            for(var i=0;i<rows.length;i++){
                rows[i][0] = projsInfo[i].title;
            }
                
            // Now making the Chart Data Objects
            chartData.addColumn("string","Projects");
            for(i=0;i<cols.length;i++)
            {
                chartData.addColumn("number",cols[i]);
            }
        
            chartData.addRows(rows);
            var opt = $.extend(true,{}, ME.baseChartOpt);
            opt.width = 760;
            opt.isStacked = true;
            opt.hAxis.title = "Projects";
            opt.vAxis.title = "Hours";        
            ME.drawChart(div,chart, chartData, opt);                
        });        
    }
    ME.timeSheet.retriveTimeDataFor(options, handler);
}

PMSReports.prototype.getAllPhasesByEmployees = function(projGroup){
    var phases = [];
    for(var i=0;i<projGroup.length;i++)
    {
        var projObj = projGroup[i];
        for(var j=0;j<projObj.EID.length;j++)
        {
            phases.push(projObj.EID[j]);
        }
    }    
    phases = phases.removeDuplicates();
    return phases;
}

PMSReports.prototype.generateEmployeeReportByProject = function(div,options)
{
    //alert("inside of the function");
    var ME = this;
    var chart = new google.visualization.ColumnChart(div);
    var chartData = new google.visualization.DataTable();    
    var projIds = [];
   
    // Applying the Mask
    Mask.showMask($(div).parent('div'), {});
    var employee = [];
    var phases1 = [];
    var hrs = [];
    try
    {
        function handler(data)
        {  
            //alert($.toJSON(data));
            try
            {
                for(var i=0;i<data.length;i++)
                {
                    var dateObj = data[i];
                    for(var j=1;j<dateObj.length;j++)
                    {
                        if(dateObj[j].PID == options.projs)
                        {
                            phases1.push(dateObj[j].WO);
                            hrs.push(dateObj[j].WH);
                        }
                    }
                    if(data[i] == null)
                        continue;
                    employee.push(data[i][0].EID);
                }
            //alert(hrs);
                
            }
            
            catch(e)
            {
                alert("Exception Raised "+e);
            }
            Mask.hideMask($(div).parent('div'));
            if(data.length < 1)
            {
                div.innerHtml = "<h3>No data found </h2>";
                return;
            }
            var projWise = ME.groupByProject(data);
            if(projWise.length < 1)
            {
                div.innerHtml = "<h3>No data found </h2>";
                return;
            }
            var cols = [];
            var rows = [];
            var emps = [];
            
            for(var i=0;i<employee.length;i++)
            {
                emps.push(employee[i]);
            }
            emps = emps.removeDuplicates();
            // First Retriving the Phases by Project Wise
           
           
           
            /*
             *Testing Purpose Of the Code
             **/
           
           
            var empNames = [];
            var empNamesQuery ="";
            for(var i=0;i<emps.length;i++){
                empNamesQuery += "empIds="+emps[i]+"";
                if(i<emps.length-1)
                    empNamesQuery+="&";
            }
            $.get("employeeHandler.do?mode=4&"+empNamesQuery,{},function(data)
            {
                //alert(data);
                data = eval("("+data+")");
                for(var i=0;i<emps.length;i++)
                {
                    for(var j=0;j<data.length;j++){
                        if(data[j].empId == emps[i])
                        {
                            empNames.push(data[j].initials);
                            break;
                        }
                    }
                }
                /*
                 * Testing Code is Completed.
                 */
                for(var i=0;i<phases1.length;i++)
                {
                    cols.pushAll(phases1[i]);
                //alert(cols);
                }
                cols = cols.removeDuplicates();
                //alert(cols.length);
                var tempCal = new Array(emps.length);
                for(var i=0;i<emps.length;i++)
                {
                    tempCal[i] = new Array(cols.length);
                
                }
                for(var i=0;i<emps.length;i++)
                {
                    for(var j=0;j<cols.length;j++)
                    {
                        tempCal[i][j]=0;
                    }
                }
                //alert(tempCal.length);
                //alert(tempCal[0].length);
                // now Making the Data Rows
                var row = [];
                for(var j=0;j<emps.length;j++)
                    row[j] = 0;
            
                for(var i=0;i<emps.length;i++)
                {
                    for(var j=0;j<employee.length;j++)            
                    {
                        if(emps[i] == employee[j])
                        {
                            for(var k =0;k<cols.length;k++)
                            {
                                for(var x=0;x<phases1[j].length;x++){
                                    if(cols[k]==phases1[j][x])
                                    {
                                        tempCal[i][k] += parseFloat(hrs[j][x]);
                                    }
                                }
                            }
                        } 
                    }
                    //                    var t = [emps[i]];
                    var t = [empNames[i]];
                    t.pushAll(tempCal[i]);
                    rows.push(t);
                }
                var p = new ProjList(projIds, function(projsInfo)
                {
                    try
                    {
                        chartData.addColumn("string","Employee ID");
                        for(i=0;i<cols.length;i++)
                        {
                            chartData.addColumn("number",cols[i]);
                        }
                        chartData.addRows(rows);
                        var opt = $.extend(true,{}, ME.baseChartOpt);
                        opt.width = 760;
                        opt.isStacked = true;
                        opt.hAxis.title = "Projects";
                        opt.vAxis.title = "Hours";   
                        opt.chartArea = {
                            left:50,
                            top:15,
                            width:"95%"
                        //height:"75%"
                        }
                        ME.drawChart(div,chart, chartData, opt); 
                    }
                    catch(e)
                    {
                        alert("Exception is Raised "+e);
                    }
                });   
            });
        }
    }catch(e)
    {
        alert("Exception is Raised "+e);
    }
    ME.timeSheet.retriveTimeDataForProject(options, handler);
}


PMSReports.prototype.generateProjectsEmployeeReport = function(div,options)
{
    var ME = this;
    var chart = new google.visualization.ColumnChart(div);
    var chartData = new google.visualization.DataTable();    
    //alert($.toJSON(options));
    var tabArray = [];
    var array = [];
    //    var empId = options.emps[0];
    var projIds = [];
    
    // Applyinfg the Mask
    Mask.showMask($(div).parent('div'), {});
    //alert(empId);
    function handler(data)
    {   
        projIds = [];
        Mask.hideMask($(div).parent('div'));
        //alert("No of Objects Are : "+data.length);
        if(data.length < 1)
        {
            div.innerHtml = "<h3>No data found </h2>";
            return;
        }
        
        //               var emps = ME.getPropertyAsArray(data,0,"EID");
        //        var projWise = ME.groupByProject(data);
        var projWise = ME.groupByEmployeeProject(data);
        if(projWise.length < 1)
        {
            div.innerHtml = "<h3>No data found </h2>";
            return;
        }
        //        var phases = [];
        var empPhases = [];
        var empCols = [];
        //        var cols = [];
        var rows = [];
        
        // First Retriving the Phases by Project Wise
        for(var i=0;i<projWise.length;i++){
            var projGroup = projWise[i];
            //            phases[i] = ME.getAllPhases(projGroup);
            empPhases[i] = ME.getAllPhasesByEmployees(projGroup);
        }
        
        
        
        
        
        // Now get the Table heading from all the Project Phases
        for(i=0;i<empPhases.length;i++)
        {
            //            cols.pushAll(phases[i]);
            empCols.pushAll(empPhases[i]);
        }
        //        cols = cols.removeDuplicates();
        empCols = empCols.removeDuplicates();
        
        // now Making the Data Rows
        //        var row;
        var empRow;
        for(i=0;i<projWise.length;i++)
        {
            projGroup = projWise[i];
            empRow = [];
            for(var j=0;j<empCols.length;j++)
                empRow[j] = 0;
            for(var j=0;j<projGroup.length;j++)            
            {
                var projObj = projGroup[j];
                for(var k=0;k<projObj.WO.length;k++)
                {
                    //                    var phase = projObj.WO[k];
                    // We fix that projObj.EID[0] is fixed, if it is looped then it returns undefined value... 
                    // Because this case occurs only if same emp booked more then one phase of same project on same day.....
                    var tempPhase = projObj.EID[0];
                    empRow[empCols.indexOf(tempPhase)] += parseFloat(projObj.WH[k]);
                }
            }
            projIds.push(projGroup[0].PID);
            var t = [projGroup[0].PID];
            t.pushAll(empRow);
            rows.push(t);
        }
        var p = ProjList(projIds, function(projsInfo)
        {
            for(var i=0;i<rows.length;i++){
                rows[i][0] = projsInfo[i].title;
            }
            var empNames = [];
            var e = EmpList(empCols,function(empInfo){
                for(var i=0;i<empCols.length;i++)
                {
                    empNames[i] = empInfo[i].initials;
                }
                // Now making the Chart Data Objects
                chartData.addColumn("string","Projects");
                //            for(i=0;i<cols.length;i++)
                //            {
                //                chartData.addColumn("number",cols[i]);
                //            }
                for(i=0;i<empNames.length;i++)
                {
                    chartData.addColumn("number",empNames[i]);
                }
                chartData.addRows(rows);
                var opt = $.extend(true,{}, ME.baseChartOpt);
                opt.width = 760;
                opt.isStacked = true;
                opt.hAxis.title = "Projects";
                opt.hAxis.slantedTextAngle = 10;
                opt.vAxis.title = "Hours";   
                
                ME.drawChart(div,chart, chartData, opt);                
            });  
        });
    }
    ME.timeSheet.retriveTimeDataFor(options, handler);
}

/**
 * ThisMethod Makes the Required div to place the Project Status Div
 */
PMSReports.prototype.makeProjectStatusDiv = function()
{
    var div = document.createElement('div');    
    return div;
}


/**
 * This Method Is Used to Draw the Given Chart
 */
PMSReports.prototype.drawChart = function(div,pChart,pData,pOptions)
{    
    //    alert(div);
    pChart.draw(pData,pOptions);
    Mask.hideMask(div);
    try{
        var dataDiv = document.createElement('div');
        var rows = pData.getNumberOfRows();
        var cols = pData.getNumberOfColumns();
        var cnt = "<div class='data'  style='display:none;overflow:auto'><table border='0' class='dataTable'>";    
        cnt += "<thead class='top_border'><tr>";
        for(var i=0;i<cols;i++)
        {
            cnt += "<th>"+pData.getColumnLabel(i)+"</th>";
        }
        cnt += "</tr></thead>";
        cnt += "<tbody>";
        for(i=0;i<rows;i++)
        {
            cnt += "<tr>";
            for(var j=0;j<cols;j++)
            {
                cnt += "<td>"+pData.getValue(i,j)+"</td>";            
            }
            cnt += "</tr>";
        }
        cnt += "</tbody>";
        cnt += "</table></div>";
        
        $(dataDiv).append("<span class='dataLink' style='padding: 5px;background:lightblue;cursor:pointer;display:block;color:blue'>View Data</span>");
        $(dataDiv).append("<a href='#' class='saveLink' align=right><img title='Save as Image' src='res/images/save.png' /></a>");
        $(dataDiv).append(cnt);
        
        StripyTable.makeAsStrippyTable($('table',dataDiv)[0], {
            CSS:'stripyTable'
        });
        
        $(dataDiv).find('.dataLink').click(function(){
            $(dataDiv).find('.data').slideToggle(200, null);
        });
        
        $(dataDiv).find('.saveLink').click(function(){
            try{
               
                Charting.saveImages([{
                    imageDiv:div,
                    imageName:'report.png'
                }], function(data){
                    //  alert(data);
                    $(dataDiv).append("<a href='report.png' style='display:none' target='_blank' class='link' type='image/png'>Download</a>");
                    window.open($('.link',dataDiv).attr('href'));
                });
            }catch(e){
                alert(e);
            }
            return false;
        })
        
        $(div).append(dataDiv);
    }catch(e){
        alert(e);
    }
    
}


/**
 * THis method generates the Project budget rate Chart
 */
PMSReports.prototype.generateProjectBudgetChart = function(div,options)
{
    var ME = this;
    var chart = new google.visualization.LineChart(div);
    var chartData = new google.visualization.DataTable();
    
    var phasesCost = [];
    var phases = [];
    
    //alert($.toJSON(options));    
    
    var tabArray = [];
    var tabArrayCM = [];
    var pid = options.projs[0];
    
    $.get("projectHandler.do?mode=7&pid="+pid, null, function(data)
    {
        //alert(data);
        data = eval("("+data+")");
        var projStartDate = data[0].startDate;
        var projEndDate = data[0].endDate;
        //alert($.toJSON(options));
        //        options.sDate = Date.parse(projStartDate);
        //        options.eDate = Date.parse(projEndDate);
        
        var phasesObj = data[0].phases;
        for(var i=0;i<phasesObj.length;i++)
        {
            var phase = phasesObj[i];
            phases.push(phase.pName);
            phasesCost.push(phase.pCost);
        }
        
        ME.timeSheet.retriveTimeDataFor(options, handler);
    });
    
    $.get("projectHandler.do?mode=0&pid="+pid, null, function(data)
    {
        //alert(data);        
        
        
        
        //alert(phases);
        //alert(phasesCost);
        //ME.timeSheet.retriveTimeDataFor(options, handler);
        });    
    
    //alert(pId);
    function handler(data)
    {        
        //alert("No of Objects Are : "+data.length);
        var dateWise = ME.groupByDate(data);
        var date;
        var hours = 0;
        var hoursCM = 0;
        //alert('hi! Data Retrived');
        //$('#myDiv').html($.toJSON(dateWise));
        //alert("Retrived Data is : "+data);
        for(var i=0;i<dateWise.length;i++)
        {
            try
            {
                hours = 0;
                var dateGroupObj = dateWise[i];
                date = dateGroupObj[0][0].date;
                for(var j=0;j<dateGroupObj.length;j++)
                {
                    var dayObj = dateGroupObj[j];
                    var projObj = dayObj[ME.getProjectIndex(dayObj,pid)];
                    //hours += ME.sumAllWorkingHours(dayObj[ME.getProjectIndex(dayObj,pId)]);
                    for(var k=0;k<projObj.WO.length;k++)
                    {
                        //alert(projObj.WO[k]);
                        hours += phasesCost[phases.indexOf(projObj.WO[k])]*parseFloat(projObj.WH[k]);
                    }                    
                //alert($.toJSON(projObj));
                //alert("Index on"+dayObj[0].date);
                }
                //alert(hours);
                hoursCM += hours;                
                tabArray[i] = [date,hoursCM];
            }catch(e){
                alert("Error Occured At : "+i);
            }
        }
        
        chartData.addColumn('string', 'Date');
        chartData.addColumn('number', 'Burn Rate');
        
        chartData.addRows(tabArray);
        
        var opt2 = $.extend(true,{}, ME.baseChartOpt);
        opt2.hAxis.title = 'Dates';    
        opt2.vAxis.title = 'Cost';
        opt2.pointSize = 5;
        opt2.hAxis = {
            title : "Dates",            
            titleTextStyle:{
                color:'blue',
                fontSize:16
            },
            textStyle:{                
                fontSize:12
            },
            maxAlternation: 0
        }
        // Vertical Asix Configuration
        opt2.vAxis = {
            title:"Cost",
            titleTextStyle:{
                color:'blue',
                fontSize:16
            },
            gridlines:{
                count:5,
                color:'grey'
            },
            textStyle:{                
                fontSize:12
            }
        }
        opt2.chartArea = {
            left:50,
            top:15,
            width:"95%"
        //height:"75%"
        },
        
        ME.drawChart(div,chart, chartData, opt2);
    }    
}


/**
 * This Method Generates the Project Burn Rate Status of the Given Project
 */
PMSReports.prototype.generateBurnRateChart = function(div,projId){
    var ME = this;
    //alert("Generating burn Rate Chart");
    $.get("projectHandler.do?mode=7&pid="+projId, null, function(data)
    {
        var ms_Per_day = 24*60*60*1000;
        var noOfDays = 0;
        var hours_per_day = 0;
        var totalExpBudget = 0;
        var projInfo = eval("("+data+")");
        projInfo = projInfo[0];
        var sD = Date.parse(projInfo.startDate);
        var eD = Date.parse(projInfo.endDate);
        //alert("Project Dates :"+sD+"\n"+eD);
        var phases = projInfo.phases;
        // Compution all the Phases Hours
        var totalHours = 0;
        for(var i=0;i<phases.length;i++){
            totalHours += parseFloat(phases[i].pHours);
            totalExpBudget += (parseFloat(phases[i].pHours) * parseFloat(phases[i].pCost));
        }
        noOfDays = (eD-sD)/ms_Per_day;
        //alert(noOfDays);
        //alert("Expected Budget is " +totalExpBudget);
        
        var budgetChart = new google.visualization.BarChart(div);
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn("string","phase");
        dataTable.addColumn("number","Expected Spendings");
        dataTable.addColumn("number","Actual Spendings");        
        
        function handler(data)
        {
            //alert($.toJSON(data));
            var phasesSpend = [];
            var phaseNames = [];
            for(var i=0;i<phases.length;i++){
                //alert($.toJSON(phases[i]));
                phasesSpend.push(0);
                phaseNames.push(phases[i].pName);
            }
            
            //alert(phaseNames);
            for(i=0;i<data.length;i++)
            {
                var dayObj = data[i];
                //alert("fadsfdafa"+dayObj[0].EID);
                for(var j=1;j<dayObj.length;j++){
                    var projObj = dayObj[j];
                    if(projObj.PID == projId)
                    {
                        var ps = projObj.WO;
                        
                        for(var k=0;k<ps.length;k++)
                        {
                            try{
                                phasesSpend[phaseNames.indexOf(ps[k])] += parseInt(projObj.WH[k]);
                            // alert("phases spend:"+phasesSpend[phaseNames.indexOf(ps[k])]);
                            // alert(ps[k]+"   "+projObj.WH[k]+"  "+dayObj[0].EID+" date: "+dayObj[0].date);
                            }catch(e){}
                        }
                    }
                }
            }            
            
            var totalActBudget = 0;
            for(i=0;i<phases.length;i++){
                
                totalActBudget += phasesSpend[i]*parseFloat(phases[i].pCost);
            }
            dataTable.addRows([["Total",totalExpBudget,totalActBudget]]);
            for(i=0;i<phases.length;i++){
                dataTable.addRow([phases[i].pName,parseFloat(phases[i].pCost*parseFloat(phases[i].pHours)),phasesSpend[i]*parseFloat(phases[i].pCost)]);
            }
            ME.drawChart(div, budgetChart, dataTable,ME.baseChartOpt);
        //             Mask.hideMask($('#projStatusDiv')[0]);
        }
        
        try{
            //alert(phases);
            //alert(phasesCost);
            var options = {
                sDate:sD,
                eDate:eD,
                projs:[projId]
            };            
            //alert($.toJSON(options));            
            
            ME.timeSheet.retriveTimeDataFor(options, handler);        
        }catch(e){
            alert(e);
        }
    });
}

/**
 * This Method Computes the Salaries for the given Employee Id's
 */
PMSReports.prototype.computeSalaryInfo = function(){
    
    }


/**
 * Temporary Method For Checking the Ploting
 */
PMSReports.prototype.drawMyChart = function(div,mode)
{
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('number', 'Salary');
    var d = [];
    for(var i=0;i<10;i++)
    {
        d[i] = [''+i,i];
    }
                
    data.addRows(d);
    var chart;
    if(mode == "LINE")                    
        chart = new google.visualization.ColumnChart(div);
    else if(mode == "BAR")
        chart = new google.visualization.BarChart(div);
    else            
        chart = new google.visualization.PieChart(div);
    
    chart.draw(data);
}

