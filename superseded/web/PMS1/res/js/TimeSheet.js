///* 
// * To change this template, choose Tools | Templates
// * and open the template in the editor.
// */
//
//function TimeSheet(pDivs,options)
//{
//    var ME = this;
//    
//    /** ThisObject for Generating The Reports */
//    this.reports = new PMSReports(this);
//    
//    this.modalDialog = new ModalDialog();
//    /** This Object holds the Content to be showed in the Modal Dialog */
//    this.modalContent = null;
//    
//    this.xmlObj = NCore.makeXMLObject();
//    this.divs = pDivs;
//    // This Holds the Current Data Object
//    this.toDay = new Date();
//    // moving to first Day of the Week
//    this.startDate = new Date();
//    this.startDate.moveBy(-3);
//    // Moving to the End day of the Week
//    this.endDate = new Date();
//    this.endDate.moveBy(3);
//    this.today = new Date();
//    this.sheetDiv = null;
//    /** This Object Holds the Hours Summary */
//    this.summaryDiv = document.createElement('div');
//    this.colorLegendDiv = document.createElement('div');
//    this.heading = document.createElement('h4');
//    this.controlsDiv = null;
//    this.sheetTable = document.createElement('table');
//    this.infoDiv = document.createElement('div');
//    /** This Element is used to Show the Close Button for the Content Div */
//    this.closeSpan = document.createElement('span');
//    /** This bejct holds the Data Retrive URL for this time Sheet*/
//    this.dataRetriveURL = null;
//    /** This object holds the path of the Data Store URL */
//    this.dataStoreURL = null;
//    /** this Array holds the list of categories to be displayed for the project
//     *like Philosphy, TNE, GUI Programming and Testing
//     */
//    this.taskCategories = ["Philosphy","TNE","GUI","Programming","Testing","General","Vacation","Sick","Holiday","Business Plans"];
//    
//    /** This Holds the Current Cell Index */
//    this.currentCellInd = -1;
//    this.currentRowInd = -1;
//    
//    this.toolTip = new ToolTip($('*'), {
//        timeOut:-1
//    });
//    
//    /** This Holds the sheetTable CSS Class name*/
//    this.sheetTableCSS = "";
//    this.sheetWidth = 200;
//    
//    /** This Object holds the Employee ID */
//    this.empId = null;
//    /** This Object holds the Project ID */
//    this.projectId = null;
//    /** This object holds the Current Sheet Data in the Specified View Mode*/
//    this.sheetData = [];
//    /** This Array holds the Indexs of the Currently Modified Array Data
//     * So this will let us to store the Modified Data to the Data Base
//     */
//    this.unSavedData = [];
//    
//    this.inputTextElement = document.createElement('input');
//    
//    /** This Object holds the Mode of the View
//     *it can be MONTH, WEEK or etc....
//     */
//    this.viewMode = "WEEK";
//    this.noOfDays = 7;
//    
//    this.init(options);    
//    
//    this.modalDialog.onSubmit = function()
//    {
//        //alert("Submiting Data");
//        if(!ME.modalDialog.validate())
//        {
//            alert("Please Enter Hours in numeric format");
//            return;
//        }
//        
//        var inputs = ME.modalDialog.getInputs();
//        var filedNames = inputs[0];
//        // Fields data
//        var fd = inputs[1];
//        ME.submitData(fd);
//    }
//    
//}
//
//
///**
// * THis MEthod Should be called when the entered data to be Suibmitted
// */
//TimeSheet.prototype.submitData = function(fd)
//{
//    var ME = this;
//    
//    var selDate = $(ME.sheetTable).find('thead th')[ME.currentCellInd];
//    selDate = Date.parse(selDate.innerHTML);
//    selDate = selDate.getDateAsPlainText();
//    
//    var cellInd = ME.currentCellInd-1;
//        
//    if(ME.sheetData[cellInd] == null)
//    {    
//        var infoObj = ME.makeInfoObj();
//        infoObj.EID = ME.empId;
//        infoObj.date = ME.getSelectedDate();
//        //alert(infoObj.date);
//            
//        ME.sheetData[cellInd] = [infoObj];
//        
//        ME.sheetData[cellInd].push(ME.makeEmptyProjectObject());
//    
//    //alert("Empty Object Created");
//    }
//    
//    var bookedHours = ME.sumAllHours(ME.sheetData[cellInd]);
//    var cloneObj = eval("("+$.toJSON(ME.sheetData[cellInd])+")");
//    
//    //cloneObj.push("1");
//    //alert($.toJSON(ME.sheetData[cellInd]));
//    
//    //alert($.toJSON(cloneObj));
//    ME.pushDataToObject(cloneObj , [ME.getSelectedCategori(),fd[0],fd[1].split("\n"),fd[2].split("\n")]);
//    
//    if(ME.sumAllHours(cloneObj) > 24)
//    {
//        alert("Sorry You can't book more that 24 hours per day");
//        ME.generateTimeSheet("", null);
//        return;
//    }
//    ME.pushDataToObject(ME.sheetData[cellInd] , [ME.getSelectedCategori(),fd[0],fd[1].split("\n"),fd[2].split("\n")]);
//    
//    var rows = $(ME.sheetTable).find('tbody tr');
//    var cat;
//    var cell;
//    var cnt;
//    $(rows).each(function()
//    {
//        cat = ME.getSelectedCategori(this.rowIndex);
//        cell = $(this).find('td').eq(cellInd);
//        cnt = ME.makeCellDiv(ME.sheetData[cellInd], cat);
//        // for now Disabling the Title
//        $(cell).html(cnt);//.attr('title',cnt);
//
//    });
//        
//    // Registering Close Button
//    ME.registerCloseBtn();
//    //$(cell).html(ME.makeCellDiv(ME.sheetData[cellInd]));
//    try{
//        ME.modalDialog.hide();
//    }catch(e){
//        alert(e);
//    }
//        
//    // Forcing to Save the Time Sheet
//    ME.generateTimeSheet("", null);
//}
//
//
///**
// * This Method Makes the Info Object and Returns tyeh Info Object
// */
//TimeSheet.prototype.makeInfoObj = function()
//{
//    var infoObj =
//    {
//        "date":"",
//        "EID":"",
//        "I":8.3,
//        "O":5.3,
//        "S":0
//    }
//    return infoObj;    
//}
//
//
//
///**
// * This Method Is Used to Make the Project Object
// * based on the given array Data
// * the data is an array of containing
// * ["Project Id","Worked On","Worked Hours","Tasks Done","Tasks Planned"]
// */
//TimeSheet.prototype.makeEmptyProjectObject = function(data)
//{
//    var obj = {};
//    obj.PID = this.projectId;
//    obj.WO = [];
//    obj.WH = [];
//    obj.TD = [];
//    obj.TP = [];
//    //alert($.toJSON(obj));
//    return obj;
//}
//
///**
// * This Method Fills the Data To The Existing
// * Data Objects
// */
//TimeSheet.prototype.pushDataToObject = function(pObj,data)
//{
//    //alert($.toJSON(pObj));
//    //alert(data);
//    //pObj = this.sheetData[this.currentCellInd-1];
//    //alert("No of Projects are : "+pObj.length);
//    var projectFound = false;
//    
//    for(var n=0;n<pObj.length;n++)
//    {
//        if(pObj[n].PID != this.projectId)
//            continue;
//        
//        projectFound = true;
//        //alert("Object Found");
//        var ind = pObj[n].WO.length;
//        for(var i=0;i<ind;i++)
//        {
//            if(data[0] == pObj[n].WO[i])
//                ind = i;
//        }
//        
//        pObj[n].WO[ind] = data[0];
//        pObj[n].WH[ind] = data[1];
//        pObj[n].TD[ind] = data[2].removeEmptyStrings();
//        pObj[n].TP[ind] = data[3].removeEmptyStrings();
//    }
//    
//    // Adding the Newely Added Data point to Unsaved Data Array
//    this.unSavedData.push(this.currentCellInd-1);
//    
//    // if the Project not Found then Create a New Empty Project Object and push 
//    // it to the Current SheetData Object
//    if(!projectFound)
//    {
//        pObj.push(this.makeEmptyProjectObject(null));        
//        // Then Push the Data to the Current Project Object by Calling Itself
//        this.pushDataToObject(pObj, data);
//    }    
//    return pObj;
////alert("Index is : "+ind);
//}
//
//
///**
// * This Method Initialies the Time Sheet Objects
// */
//TimeSheet.prototype.init = function(options)
//{    
//    var ME = this;
//    
//    // Registering the Events for the Iput text element
//    
//    
//    
//    // first :Loading The Options
//    this.loadOptions(options);    
//    
//    $(this.infoDiv).addClass('TSinfoDiv');
//    
//    this.sheetDiv = $('#timeSheetBody',this.divs)[0];
//    this.controlsDiv = $('#timeSheetControls',this.divs)[0];
//    
//    $(this.heading).addClass('sheetHeading').html("Time Sheet Heading");
//    //$(this.heading).insertAfter(this.controlsDiv);
//    $(this.sheetDiv).append(this.sheetTable);    
//    
//    // Adding the Hours Summary Division
//    $(this.divs).append(this.summaryDiv);    
//    
//    //appending the colorLegendDiv
//    $(this.divs).append(this.colorLegendDiv);
//    
//    $(this.colorLegendDiv)
//    .addClass('TSlegend bottom_border')
//    .html("Color Legend : <span class='toDay'>Today</span><span class='satuarday'>Saturday</span><span class='sunday'>Sunday</span>");
//    
//    $(this.sheetTable).addClass(this.sheetTableCSS);
//    
//    $(this.sheetTable).attr({
//        'cellspacing':'0px',
//        'cellpadding':'0px'
//    });
//    
//    
//    // initializing the modalDivi Contnet
//    var cnt = "<table>"
//    +"<tr><td>Enter Hours :</td><td><input type='text' class='MDInput' name='hours' /></td></tr>"
//    +"<tr><td colspan='2'>Tasks Accomplished :<textarea rows='6' cols='30' class='MDInput' name='tasksDone'></textarea></td></tr>"
//    +"<tr><td colspan='2'>Tasks Pending/Planned:<textarea rows='6' cols='30' class='MDInput' name='tasksPlanned'></textarea></td></tr>"
//    +"";
//
//    this.modalContent = cnt;
//    
//    this.modalDialog.validate = function()
//    {        
//        var inputs = ME.modalDialog.getInputs();
//        var values = inputs[1];
//        if(isNaN(parseFloat(values[0])))
//        {
//            //alert("Please Enter Numbers only");
//            return false;
//        }
//        return true;
//    }
//    
//    this.addControlListeners();
//}
//
///**
// * This MEthod Register the Close Button Actions 
// */
//TimeSheet.prototype.registerCloseBtn = function(){
//    
//    // First Deregisrter the Click Event
//    $(this.closeSpan ).remove();    
//    this.closeSpan = document.createElement('span');
//    
//    var ME = this;
//    $(this.closeSpan).html('')
//    .addClass('closeBtn')
//    .hover(function(){
//        $(this).addClass('closeBtnHover');
//    },function(){
//        $(this).removeClass('closeBtnHover');
//    })
//    .click(function(evt)
//    {
//        // Forcing to Stop the Event Propogation
//        evt.stopPropagation();
//        
//        if(! window.confirm("Are you Sure to delete this Info?"))
//        {
//            return;
//        }            
//        
//        try
//        {
//            var td = $(this).parent()[0];
//            var row = $(td).parent()[0];
//            var rowInd = row.rowIndex;
//            var phase = ME.getSelectedCategori(rowInd);
//            //alert("Roew Index is : "+phase);
//            var dayObj = ME.sheetData[td.cellIndex-1];
//            var projInd = ME.reports.getProjectIndex(ME.sheetData[td.cellIndex-1], ME.projectId);
//            // Removing the Purticular Project
//            var projObj = ME.sheetData[td.cellIndex-1][projInd];
//            // if there is only one Category then Make the Project Object as Null
//            if(!projObj || !projObj.WO)
//                return;
//            
//            if(projObj.WO.length<2)
//            {
//                dayObj.splice(projInd, 1);
//            }
//            // Elser DO search for Purticular Phase and Remove that Phase
//            else        
//            {
//                var selInd = -1;
//                for(var i=0;i<projObj.WO.length;i++)
//                {
//                    if(projObj.WO[i] == phase)
//                    {
//                        selInd = i;
//                        break;
//                    }
//                }
//                projObj.WO.splice(selInd,1);
//                projObj.WH.splice(selInd,1);
//                projObj.TD.splice(selInd,1);
//                projObj.TP.splice(selInd,1);
//            //alert("Pbject Found At : "+selInd);
//            }
//        
//            $(td).removeAttr('onmouseover');
//            // Removing the hover Effects
//            $(td).removeClass('hover');
//            $(td).stop().animate({
//                boxShadow: '0px 0px 0px #44f'
//            });
//        
//            $(td).html(ME.makeCellDiv(dayObj, phase));
//            // Registering the Close Button
//            ME.registerCloseBtn();
//        
//            //Markig the Data as UnSaved
//            ME.unSavedData.push(td.cellIndex-1);
//            ME.generateTimeSheet("", null);
//        }
//        catch(e){
//            alert(e);
//        }
//    //alert(ME.unSavedData);
//    //alert(td.innerHTML);
//    //alert("After Removing : "+$.toJSON(ME.sheetData[td.cellIndex-1]));
//        
//    //alert($.toJSON(ME.sheetData[cell.cellIndex-1]));
//    });
//}
//
///**
// * This Method Adds the Listeners to the Controls for Time Sheet
// */
//TimeSheet.prototype.addControlListeners = function()
//{
//    var ME = this;
//    
//    // adding Scrool Listenerto The Time Sheet
//    $(ME.sheetDiv).scroll(function(evt){
//        
//        });
//    
//    // Control Listeners
//    var controls = $('.control',this.controlsDiv);
//    $(controls).each(function(ind){
//        $(this).click(function(evt)
//        {
//            switch(ind)
//            {
//                case 0:
//                    // moving date to Starting of Current Week
//                    ME.startDate = new Date();
//                    ME.startDate.moveBy(-3);
//                    ME.endDate = new Date();
//                    ME.endDate.moveBy(3);
//                    ME.moveTimeSheetBy(ME.viewMode, 0);
//                    break;
//                case 1:
//                    ME.viewMode = "WEEK";
//                    ME.moveTimeSheetBy(ME.viewMode, 0);
//                    break;
//                case 2:
//                    ME.viewMode = "15-DAY";
//                    ME.moveTimeSheetBy(ME.viewMode, 0);
//                    break;
//                case 3:
//                    ME.viewMode = "MONTH";
//                    ME.moveTimeSheetBy(ME.viewMode, 0);
//                    break;
//                case 4:
//                    ME.moveTimeSheetBy(ME.viewMode,-1);
//                    break;
//                case 5:
//                    //alert(me.viewMode);
//                    ME.moveTimeSheetBy(ME.viewMode,1);
//                    break;
//            }            
//        });
//    });    
////alert("Control Listeners Added");
//}
//
///**
// * This Method Loads the Opetions that the user send to this object
// * this mehod loads the default values when the
// * user dosen't specify the values
// */
//TimeSheet.prototype.loadOptions = function(options)
//{
//    
//    if(!options)
//        options = {};
//    
//    this.empId = !options.empId?this.empId:options.empId;
//    this.projectId = !options.projectId?this.projectId:options.projectId;
//    this.startDate = !options.startDate?this.startDate:options.startDate;
//    this.endDate = !options.endDate?this.endDate:options.endDate;
//    this.sheetTableCSS = !options.sheetTableCSS?this.sheetTableCSS:options.sheetTableCSS;
//    this.sheetWidth = !options.sheetWidth?this.sheetWidth:options.sheetWidth;
//    this.viewMode = !options.viewMode?this.viewMode:options.viewMode;
//    this.dataRetriveURL = !options.dataRetriveURL?this.dataRetriveURL:options.dataRetriveURL;
//    this.dataStoreURL = !options.dataStoreURL?this.dataStoreURL:options.dataStoreURL;
//    this.taskCategories = !options.taskCategories?this.taskCategories:options.taskCategories;    
//    this.divs = !options.divs?this.divs:options.divs;
//    
//    $(this.heading).html(!options.heading?"Time Sheet":options.heading);
//}
//
///**
// * This Method moves the Time Sheet to the Sppecified Number of Days
// * for +1 the Sheet Moves to Forward
// * for -1 he sheet moves to Backward
// */
//TimeSheet.prototype.moveTimeSheetBy = function(mode,direction)
//{    
//    var opt = {
//        startDate:null,
//        endDate:null,
//        noOfDays:0
//    };
//    
//    var date = this.startDate.clone();
//    
//    if(mode == "MONTH")
//    {
//        // First moving forward to one month
//        if(direction == 1)
//        {
//            date.moveToNextMonth();
//        }
//        else if(direction == -1)
//        {
//            date.moveToPrevMonth();
//        }            
//            
//        //alert("Month Mode : "+date);
//        opt.startDate = date.moveToFirstDayOfMonth().clone();
//        opt.endDate = date.moveToLastDayOfMonth().clone();
//    }
//    else if(mode == "15-DAY")
//    {
//        if(direction == 1)
//        {
//            opt.startDate = date.addDays(15).clone();
//        //opt.startDate = date;
//        //opt.startDate.moveBy(-7);
//        //opt.endDate = date;
//        //opt.startDate.moveBy(7);
//        }            
//        else if(direction == -1)
//        {
//            opt.startDate = date.addDays(-15).clone();
//        }
//        
//        opt.noOfDays = 15;
//    }
//    else if(mode == "WEEK")
//    {
//        if(direction == 1)
//        {
//            opt.startDate = date.addDays(7).clone();
//            opt.endDate = date.addDays(7).clone();
//        }            
//        else if(direction == -1)
//        {
//            opt.startDate = date.addDays(-7).clone();
//            opt.endDate = date.addDays(7).clone();
//        }        
//        opt.noOfDays = 7;
//    }
//    //alert($.toJSON(opt));
//    this.generateTimeSheet("", opt);
//}
//
///**
// * This Method is used to generate the time sheet
// * @param sheetName  the name to be displayed for this sheet
// * @param options  the time sheet configuration Options
// */
//TimeSheet.prototype.generateTimeSheet = function(sheetName,options)
//{        
//    var ME = this;
//    
//    // First Check Any Previous data to be stored to Data Base
//    // if there is then Store the Data First
//    if(ME.unSavedData.length > 0)
//    {
//        // Removing the Copie Entries
//        ME.unSavedData = ME.unSavedData.removeDuplicates();        
//        var dates = [];
//        var data = [];
//        //alert($.toJSON(ME.sheetData));
//        //alert("Un Saved Data AT : "+ME.unSavedData);
//        
//        for(var i=0;i<ME.unSavedData.length;i++)
//        {
//            // adding 1 to the index because the First Header cell Leaving
//            var date = Date.parse(ME.getSelectedDate(ME.unSavedData[i]+1));
//            date = date.getDateAsPlainText();
//            dates.push(date);
//            data.push(ME.sheetData[ME.unSavedData[i]]);
//        //alert("There is Unsaved Data on : "+$.toJSON(ME.sheetData[ME.unSavedData[i]]));
//        }
//        
//        function handler()
//        {
//            alert("Local Handler");
//            //alert("Data Stored Successfully");
//            // Clearing the UnSaved Data
//            ME.unSavedData = [];
//            ME.generateTimeSheet(sheetName,options);
//        }            
//        // Sending the Data to Be Stored in the Data Base    
//        ME.storeTimeData(dates, data,handler);        
//        return;
//    }
//    
//    
//    // first loading The Options
//    this.loadOptions(options);    
//    
//    if(this.empId == null)
//    {
//        PMS.messageDialog.show("Please Select an Employee First");
//        return;
//    }
//    
//    if(this.projectId == null)
//    {
//        PMS.messageDialog.show("Choose A Project To Book Hours");
//        return;
//    }
//    
//    
//    //alert("Generating Time Sheet for EMP :"+this.empId+"   Project Id : "+this.projectId);
//    //alert("Generating Time Sheet :"+$.toJSON(options));
//    
//    
//    
//    //var sD = new Date();
//    //var eD = new Date().moveToDayOfWeek(6, 1);    
//    
//    //alert(this.startDate+"\n"+this.endDate);
//    //alert(sD+"\n"+eD);
//    //this.startDate = !options.startDate?sD:options.startDate;
//    //this.endDate = !options.endDate?eD:options.endDate;
//    
//    if(!options.noOfDays)
//    {
//        this.noOfDays = parseFloat(""+( (this.endDate-this.startDate)/(1000*24*60*60)+1 ));
//    }
//    else
//    {
//        this.noOfDays = options.noOfDays;
//    }
//    //alert('No of days in this Month are : '+this.noOfDays);
//        
//    // Handler Function for Handling the AJAX call
//    ajaxHandler = function(data)
//    {
//        //$('#myDiv').html($.toJSON(data));
//        //alert($.toJSON(data));
//        ME.generateHoursSummary(data);
//        var currDay = ME.startDate.clone();
//        
//        var header = "<thead><tr>";
//        header += "<th>Year<br/>"+currDay.getFullYear()+"</th>";
//        try
//        {
//            
//            for(var i=0;i<ME.noOfDays;i++)
//            {
//                header += "<th key='"+currDay.toString("dd-MMM-yyyy")+"'>"+currDay.toString("MMM dd")+"</th>";
//                currDay.setDate(currDay.getDate()+1);
//            }
//            header += "</tr><tr>";
//            // First Adding An Empty Cell
//            header += "<td></td>";
//            currDay = ME.startDate.clone();
//            for(i=0;i<ME.noOfDays;i++)
//            {                
//                header += "<td>"+currDay.getDayName('DD')+"</td>";
//                currDay.setDate(currDay.getDate()+1);
//            }
//            header +="</tr></thead>";
//            
//        }
//        catch(e){
//            alert(e);
//        }
//    
//        var body = "<tbody>";
//        var start = ME.startDate.clone();
//        var end = ME.endDate.clone();
//        
//        // first Map the retrived dat to the array of the data
//        // then spread to the sheet
//        var arrayData = ME.mapDataToArray(start, data, ME.noOfDays);
//        
//        $('#myDiv').html($.toJSON(arrayData));
//        
//        //alert("Mapped Data : "+$.toJSON(arrayData));
//        // now Spreding the data to the sheet
//        var cellContent = "";
//        for(i=0;i<ME.taskCategories.length;i++)
//        {
//            body += "<tr><th>"+ME.taskCategories[i]+"</th>";
//            for(var j=0;j<ME.noOfDays;j++)
//            {
//                if(arrayData[j]!=null && arrayData[j].length>1)
//                {
//                    cellContent = ME.makeCellDiv(arrayData[j],ME.taskCategories[i]);
//                    // Disabling the Tool tip Content for Cell
//                    //body += '<td title="'+cellContent+'">'+cellContent+'</td>';
//                    body += '<td>'+cellContent+'</td>';
//                }
//                else
//                    body += ("<td></td>");
//            }
//            body += "</tr>";
//        }
//        body += "</tbody>";
//        
//        // Table Foot Content
//        var foot = "<tfoot><tr><th>Total</th>";
//        for(i=0;i<ME.noOfDays;i++)
//        {
//            foot += "<th>"+ME.sumAllHours(ME.sheetData[i])+"</th>";
//        }
//        foot += "</tr></tfoot>";
//    
//    
//        $(ME.sheetTable).css({
//            'width':'100%'
//        });
//        $(ME.sheetTable).html("");
//        $(ME.sheetTable).append(header);
//        $(ME.sheetTable).append(body);
//        $(ME.sheetTable).append(foot);
//        
//        //$(ME.sheetTable).fadeTo(0, 0, null).fadeTo(1000,1.0,null);
//        $(ME.sheetTable).animate({
//            'margin-left':'-'+$(ME.sheetTable).width()+'px',
//            opacity:0.0
//        },10,function(){
//            $(ME.sheetTable).animate({
//                'margin-left':'0px',
//                opacity:1.0
//            },500,ME.sheetLoaded());
//        });
//    
//        ME.hilightWeekDays();
//        ME.hilightTimeSheetOn(new Date());
//        //ME.showDaysOnHead();
//        ME.registerTimeSheet(ME.sheetTable);
//        
//    //$(ME.colorLegendDiv).html("sdajkfhjkasdhlfkjasfdas");
//    }
//
//    //alert("Retriving Time data for :" + this.startDate+"  :  "+this.endDate);    
//    this.retriveTimeData(this.empId,"%%",this.startDate, this.endDate, ajaxHandler);
//}
//
//
///**
// * This Method Generates the Hours Sumary of the Selevted Time Sheet
// */
//TimeSheet.prototype.generateHoursSummary = function(data)
//{
//    var len = data.length;
//    data = data.slice(len-7, len);
//    
//    var ME = this;
//    
//    
//    var cnt = "<h4 style='text-align:center;background: lightblue;margin:0px;padding:5px'>Hours Summary</h4>";
//    cnt += "<table align='center' class='stripyTable'>";
//    var projs = [];
//    
//    cnt += "<thead><tr><th>Date</th>";
//    for(var i=0;i<data.length;i++)
//    {
//        var dayObj = data[i];
//        for(var j=1;j<dayObj.length;j++)
//        {
//            if(projs.indexOf(dayObj[j].PID)<0){
//                projs.push(dayObj[j].PID);
//            }
//        }        
//    }
//    
//    for(i=0;i<projs.length;i++){
//        cnt += "<th>"+projs[i]+"</th>";
//    }
//    cnt += "</tr></thead>";
//    
//    cnt += "<tbody>";
//    for(i=0;i<data.length;i++)
//    {
//        cnt += "<tr>";
//        dayObj = data[i];        
//        cnt += "<td>"+dayObj[0].date+"</td>";
//        for(j=0;j<projs.length;j++)
//        {
//            var projObj = dayObj[j];
//            if(!projObj || !projObj.PID){
//                cnt += "<td></td>";
//            }
//            else if(projs.indexOf(projObj.PID)<0)
//            {
//                cnt += "<td></td>";
//            }
//            else
//                cnt += "<td>"+this.reports.sumAllWorkingHours(projObj)+"</td>";
//        }        
//        cnt += "</tr>";
//    }
//    cnt += "</tbody>";
//    cnt += "</table>";    
//    //$(this.summaryDiv).html(cnt);
//    
//    StripyTable.makeAsStrippyTable($('table',this.summaryDiv)[0], {
//        CSS:'stripyTable'
//    });
//}
//
///**
// * This Method is used to show the day names on the Heads of the Time Sheet Table
// */
//TimeSheet.prototype.showDaysOnHead = function()
//{
//    $('.dayName').remove();
//    var ME = this;
//    $(ME.sheetTable).find('thead th:gt(0)').each(function()
//    {
//        var d = document.createElement('span');
//        $(d).addClass('dayName');
//        $(d).html(Date.parse(this.innerHTML).getDayName()).css({
//            'position':'absolute',
//            'text-align':'center',
//            'background':'gray',
//            '-webkit-border-radius':'5px',
//            'max-width':$(this).outerWidth(),
//            'left':$(this).position().left,
//            'top':$(this).position().top-10
//        });
//        $(ME.sheetTable).append(d);
//    });
//}
//
///**
// * This MEthod Will be called when the Sheet loaded
// */
//TimeSheet.prototype.sheetLoaded = function()
//{
//    //FixedHeader.fix($('#timeSheetBody'), {
//    //    cols:1
//    //});
//    }
//
///**
// * This MEthod Spreads the Given data to the entire month array
// * or Week array
// * this assign the unfilled days to null autometically
// */
//TimeSheet.prototype.mapDataToArray = function(pStart,pData,len)
//{
//    var l = pData.length;
//    //alert("No of Objects are :"+l);
//    this.sheetData = [];
//    var j = 0;
//    var start = pStart.clone();
//    for(var i=0;i<len;i++)
//    {
//        //alert(start+"     "+pData[j].date);
//        //alert(j);
//        //alert((pData[j]));
//        if(j<l && start.equalsIgnoreTime(Date.parse(pData[j][0].date) ))
//        {
//            //alert('Equal at '+start);
//            this.sheetData.push(pData[j]);
//            j++;
//        }        
//        else
//        {
//            this.sheetData.push(null);
//        }
//        start.moveBy(1);
//    }
//    //alert("Everything is done : "+this.sheetData.length);
//    return this.sheetData;
//}
//
///**
// * This MEthod Retrives the TimeSheet Data for the Specified Data Range
// */
//TimeSheet.prototype.retriveTimeData = function(pEmpId,pProjectId,sDate,eDate,handler)
//{
//    var ME = this;
//    //alert(this.xmlObj);
//    //alert(pEmpId+"   "+pProjectId+"   "+sDate+"   "+eDate);
//    var query = this.dataRetriveURL+"?mode=0&empId="+pEmpId+"&projectId="+pProjectId+"&startDate="+sDate.getDateAsPlainText()+"&endDate="+eDate.getDateAsPlainText();
//    //alert(query);
//    this.xmlObj.open('GET',this.dataRetriveURL+"?mode=0&empId="+pEmpId+"&projectId="+pProjectId+"&startDate="+sDate.getDateAsPlainText()+"&endDate="+eDate.getDateAsPlainText(),true);
//    
//    
//    this.xmlObj.onreadystatechange = function()
//    {
//        if(ME.xmlObj.readyState==4 && ME.xmlObj.status==200)
//        {
//            //alert("Retrived Data is :"+ME.xmlObj.responseText);
//            if(ME.xmlObj.responseText == null || ME.xmlObj.responseText.length<2)
//            {
//                // Passing tan Wmpty Array Object
//                handler(eval("([])"));
//                return;
//            }
//            
//            
//            try{
//                var data = eval("(" + ME.xmlObj.responseText + ")");
//                // Calling the Handler Function with the data a parameter
//                handler(data);
//            //alert(data);
//            }
//            catch(e){
//                alert(e);
//            }
//        }
//    }
//    this.xmlObj.send(null);
//}
//
//
///**
// * This Method Retrives the Time Sheet data for the group of Employees
// * and Group of Projects
// */
//TimeSheet.prototype.retriveTimeDataFor = function(options,handler)
//{
//    var ME = this;
//    //alert(this.xmlObj);
//    //alert(pEmpId+"   "+pProjectId+"   "+sDate+"   "+eDate);
//    var query = this.dataRetriveURL+"?mode=2";
//    
//    var pEmpids = !options.emps?null:options.emps;
//    var pProjectIds = !options.projs?null:options.projs;
//    
//    if(pEmpids != null)
//    {
//        query += "&nOfEmps="+pEmpids.length;
//        for(var i=0;i<pEmpids.length;i++)
//        {
//            query += ("&emp"+i+"="+pEmpids[i]);
//        }
//    }        
//    if(pProjectIds != null)
//    {        
//        query += "&nOfProjs="+pProjectIds.length;    
//        for(i=0;i<pProjectIds.length;i++)
//        {
//            query += ("&proj"+i+"="+pProjectIds[i]);
//        }
//    }
//    
//    if(options.sDate)
//    {
//        query +=("&sDate="+options.sDate.getDateAsPlainText());
//    }
//    if(options.eDate)
//    {
//        query +=("&eDate="+options.eDate.getDateAsPlainText());
//    }
//        
//    //alert(query);
//    this.xmlObj.open('GET',query,true);
//
//    $.get(query,null,function(text)
//    {
//        if(text == null || text.length<2)
//        {
//            ME.handler(eval("([])"));
//            return;
//        }
//        var data = eval("(" + text + ")");
//        // Calling the Handler Function with the data a parameter
//        try
//        {
//            ME.handler(data);    
//        }catch(e)
//        {
//            alert("Exception issssssssssss "+e);
//        }
//            
//    });    
//}
//
///**
// * This MEthod used to store the Time sheet data to the Data Base
// */
//TimeSheet.prototype.storeTimeData = function(dates,data,handler)
//{
//    var ME = this;    
//    //alert("Saving Data for Employee: "+this.empId);
//    this.xmlObj.open("POST", this.dataStoreURL,true);
//    ME.xmlObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//    this.xmlObj.onreadystatechange = function()
//    {
//        //alert("Status is : "+ME.xmlObj.status);
//        if(ME.xmlObj.readyState==4 && ME.xmlObj.status==200)
//        {            
//            //alert("Data Store Data is : "+ME.xmlObj.responseText);
//            handler();            
//        }            
//    }
//    var content = "empId="+ME.empId+"&mode=1&noOf="+dates.length;    
//    for(var i=0;i<dates.length;i++)
//    {
//        content += ("&empId"+(i+1)+"="+escape(ME.empId));
//        content += ("&date"+(i+1)+"="+escape(dates[i]));
//        content += ("&data"+(i+1)+"="+escape($.toJSON(data[i])));
//    }    
//    //alert(content);
//    ME.xmlObj.send(content);
//}
//
///**
// * This Method used to update the View by the Controls
// */
//TimeSheet.prototype.updateView = function(vMode)
//{
//    var me = this;
//    var sDate = this.startDate;
//    var nDate = this.startDate;
//    var opt = {
//        startDate:this.startDate,
//        endDate:this.endDate,
//        noOfDays:null
//    };
//    vMode = vMode.toUpperCase();
//    
//    this.viewMode = vMode;
//    if(vMode == "MONTH")        
//    {
//        this.startDate.moveToFirstDayOfMonth();
//        this.endDate.moveToLastDayOfMonth();
//        //nDate.setDate(sDate.getDate()+30);        
//        opt.noOfDays = parseFloat( ""+ ( (this.endDate-this.startDate)/(1000*24*60*60)+1 ) );
//    }
//    else if(vMode == "15-DAY")
//    {
//        opt.noOfDays = 15;
//    }
//    else
//    {
//        opt.noOfDays = 7;
//    }    
//    me.generateTimeSheet("", opt);
//}
//
///**
// * This Method Makes the Divisino in perticular structure
// * for displaying in a cell
// * @param dayObj the Data Data Object fot the Date
// * @param pCategory the Category thet the Div indicates (like TNE,GUI, etc..)
// */
//TimeSheet.prototype.makeCellDiv = function(dayObj,pCategory)
//{
//    var obj = null;
//    var ind = -1;
//    // Searching for current Project ID in the Entire Day Data Object
//    for(var i=1;i<dayObj.length;i++)
//    {
//        if(dayObj[i].PID == this.projectId)
//            obj = dayObj[i];
//    }
//    
//    // When The Specified Project Data Not found then Return 
//    if(obj == null)
//        return "";
//    
//    for(i=0;i<obj.WO.length;i++)
//    {
//        if(obj.WO[i] == pCategory)
//            ind = i;
//    }
//    
//    //alert("Object Found At : "+ind);
//    if(ind < 0)
//        return "";
//        
//    //var div = document.createElement('div');    
//    var content = "";    
//    content = "<div style='font-size:13px'>";
//    content += ("<span>"+obj.WH[ind]+"</span>");    
//    
//    if(obj.TD[ind])
//    {
//        content += ("<div style='display:none'>");
//        content += "Tasks Done";
//        content += "<ol>";
//        for(i=0;i<obj.TD[ind].length;i++)
//        {
//            content += ("<li>"+obj.TD[ind][i]+"</li>");
//        }
//        content += "</ol>";
//        content += "</div>";
//        
//    }
//    
//    if(obj.TP[ind])
//    {
//        content += "<div style='display:none'>";
//        content += "Tasks Planned";
//        content += "<ol>";
//        for(i=0;i<obj.TP[ind].length;i++)
//        {
//            content += ("<li>"+obj.TP[ind][i]+"</li>");
//        }
//        content += "</ol>";
//        content += "</div>";
//    }
//    content += "</div>";
//    return content;
//}
//
//
///**
// * This Method Makes the Data Object from the Given HTML Div Element
// * this method does the Anti work of TimeSheet.makeCellDiv(obj);
// */
//TimeSheet.prototype.makeObj = function(pDiv)
//{
//    var ME = this;
//    //alert(pDiv);
//    
//    var obj = {
//        date : null,
//        hoursWorked:0,
//        workedOn : [],        
//        tasksDone:[],
//        tasksPlanned:[]
//    };    
//    
//    var selDate = ME.getSelectedDate();
//    //alert(selDate);
//    obj.workedOn = ME.getSelectedCategori();        
//    
//    //alert(pDiv);
//    
//    //selDate = Date.parse(selDate.innerHTML);
//    //selDate = selDate.getDateAsPlainText();
//    
//    obj.date = selDate;
//    
//    obj.hoursWorked = parseFloat($(pDiv).find('span')[0].innerHTML);
//    
//    //alert(selDate);
//    var divs = $(pDiv).find('div');
//    var tasks = [];
//    var tD = "";
//    var tP = "";
//    
//    $(divs[0]).find('li').each(function()
//    {
//        obj.tasksDone.push(this.innerHTML);
//        tD += (this.innerHTML+"\n");
//    });
//    $(divs[1]).find('li').each(function(){
//        obj.tasksPlanned.push(this.innerHTML);
//        tP += (this.innerHTML+"\n");
//    });    
//    
//    //ME.modalDialog.setDefaultData([obj.hoursWorked,tD,tP]);
//    
//    return obj;
//}
//
///**
// * This MEthod Used to make the Day Info dif of the
// * Given Day Object
// * this Method Computes the Hours Spended on Every Project
// */
//TimeSheet.prototype.makeDayInfoDiv = function(dayObj)
//{
//    if(dayObj.length<2)
//    {
//        return "Not booked yet!";
//    }
//        
//    var cnt = "<table class='TSinfoTab'>";
//    var hours;
//    var projObj;
//    cnt += "<tr><th>Projects</th><th>Hours</th></tr>";
//    for(var i=1;i<dayObj.length;i++)
//    {
//        hours = 0;
//        projObj = dayObj[i];
//        for(var j=0;j<projObj.WH.length;j++)
//        {
//            hours += parseFloat(''+projObj.WH[j]);
//        }
//        cnt += "<tr><td>"+projObj.PID+"</td><td>"+hours+"</td></tr>";
//    }
//    cnt += "</table>";
//    return cnt;
//}
//
//
///**
// * This Method Used to hilight the Time Sheet cells on the
// * Specified Date
// */
//TimeSheet.prototype.hilightTimeSheetOn = function(pDate)
//{
//    var ME = this;
//    pDate = !pDate?new Date():pDate;
//    //alert("Highlighting On : "+pDate);
//    var d;
//    var ind = -1;
//    $(ME.sheetTable).find('thead th').each(function(index)
//    {
//        d = Date.parse($(this).attr('key'));
//        if(d != null && d.equalsIgnoreTime(pDate))
//        {
//            //alert(d+"   "+pDate);
//            ind = index-1;
//        }
//    });    
//    //ind =- 1;
//    
//    if(ind<0)
//        return;    
//    
//    var cell;
//    $(ME.sheetTable).find('tbody tr').each(function(){
//        cell = $(this).find('td')[ind];
//        $(cell).removeClass('satuarday');
//        $(cell).removeClass('sunday');
//        $(cell).addClass('toDay');        
//    });
//    $(ME.sheetTable).find('thead tr').each(function(){
//        cell = $(this).find('td')[ind+1];
//        $(cell).removeClass('satuarday');
//        $(cell).removeClass('sunday');
//        $(cell).addClass('toDay');        
//    });
////alert('Time Sheet Will be Hilight on : '+pDate);
//}
//
//
///**
// * This Method Hilights on the Week Days of satuarday and sunday
// */
//TimeSheet.prototype.hilightWeekDays = function()
//{
//    var ME = this;
//    var d;
//    $(ME.sheetTable).find('thead th:gt(0)').each(function(index)
//    {
//        //alert(this.innerHTML);
//        d = Date.parse($(this).attr('key'));
//        switch(d.getDay())
//        {
//            case 6:
//                var cell;
//                $(ME.sheetTable).find('tbody tr').each(function(){
//                    cell = $(this).find('td')[index];
//                    $(cell).addClass('satuarday');
//                });
//                $(ME.sheetTable).find('thead tr').each(function(){
//                    cell = $(this).find('td')[index+1];
//                    $(cell).addClass('satuarday');
//                });
//                break;
//            case 0:
//                $(ME.sheetTable).find('tbody tr').each(function(){
//                    cell = $(this).find('td')[index];
//                    $(cell).addClass('sunday');
//                });
//                $(ME.sheetTable).find('thead tr').each(function(){
//                    cell = $(this).find('td')[index+1];
//                    $(cell).addClass('sunday');
//                });
//                break;
//        }
//    //alert(d.getDay());        
//    });    
//}
//
///**
// * This Method Register the Current Time Sheet Object for
// * all the Listeners
// * Note: this method should be called every time the sheet is generated
// */
//TimeSheet.prototype.registerTimeSheet = function(pTable)
//{    
//    var ME = this;
//    
//    // Registering the CLose Button Events
//    this.registerCloseBtn();
//    
//    var header = $(pTable).find('thead')[0];
//    var body = $(pTable).find('tbody')[0];
//    
//    $(body).find('td').hover(function()
//    {
//        $(this).stop().animate({
//            boxShadow: '0px 0px 30px #44f'
//        });
//        // Calculating Booked Hours        
//        //var bh = ME.sumAllHours(ME.sheetData[this.cellIndex-1]);
//        $(ME.infoDiv).html(ME.makeDayInfoDiv(ME.sheetData[this.cellIndex-1]));
//        $(ME.sheetDiv).append(ME.infoDiv);
//        var pos = $(this).position();
//        $(ME.infoDiv).css({
//            "left":pos.left,
//            "top":pos.top-$(ME.infoDiv).outerHeight()
//        });        
//        $(this).addClass('hover');
//        
//        
//        if(this.innerHTML.length>1)
//        {
//            $(this).append(ME.closeSpan);
//            $(ME.closeSpan).css({
//                'left': ($(this).position().left+$(this).outerWidth()-$(ME.closeSpan).outerWidth()),
//                'top': ($(this).position().top)
//            });
//            //$(this).append("hidfasdf");
//            $(ME.closeSpan).show();
//        }    
//            
//    },function()
//    {
//        $(this).stop().animate({
//            boxShadow: '0px 0px 0px #44f'
//        });
//        
//        $(this).removeClass('hover');
//        if(this.innerHTML.length>1)
//        {
//            $(ME.closeSpan).hide();
//        }        
//        $(ME.infoDiv).remove();
//    });    
//    
//    $(body).find('th').click(function()
//    {
//        //var pRow = $(this).parent('tr')[0];        
//        //$(pRow).after("<tr><td colspan='"+(ME.noOfDays+1)+"'><div style='padding:10px;border:1px solid red'></div></td></tr>");
//        //alert('hi');
//        });
//    
//    // Adding THe Click event
//    $(body).find('td').click(function(evt)
//    {        
//        var obj = null;
//        ME.currentCellInd = this.cellIndex;
//        ME.currentRowInd = $(this).parent("tr")[0].rowIndex;
//        
//        
//        // Getting Previous info
//        if($(this).html().length>2)
//        {
//            //alert($(this).find('div')[0]);
//            try{
//                obj = ME.makeObj($(this).find('div')[0]);
//            //alert($.toJSON(obj));
//            }catch(e){
//            //alert(e);
//            }
//        }
//        
//        ME.registerInputElement(ME.inputTextElement);
//        $(this).html("").append(ME.inputTextElement);
//        
//        $(ME.inputTextElement).css({            
//            });
//        
//        $(ME.inputTextElement).show().focus();
//        $(ME.inputTextElement).val("");
//        if(obj != null)
//            $(ME.inputTextElement).val(obj.hoursWorked);
//        
//    }).dblclick(function(){
//        //alert(this.cellIndex);        
//        ME.currentCellInd = this.cellIndex;
//        ME.currentRowInd = $(this).parent("tr")[0].rowIndex;        
//        //alert(ME.getSelectedCategori());        
//        //alert(ME.modalContent);
//        ME.modalDialog.setContent(ME.modalContent);
//        if($(this).html().length>2)
//        {
//            var obj = ME.makeObj($(this).find('div')[0]);
//            //alert($.toJSON(obj));
//            ME.modalDialog.setDefaultData([obj.hoursWorked,obj.tasksDone,obj.tasksPlanned]);
//        }        
//        ME.modalDialog.show();
//    });
//    
//    
//    
//    
//    
//// Registering the cells for Tool tips
////alert($(body).find('td').length);
////ME.toolTip.registerField($(body).find('td'));    
//}
//
//
///**
// * This emthod register the Events for the Input Element
// */
//TimeSheet.prototype.registerInputElement = function(ele){
//    var ME = this;
//    $(ele).attr({
//        'type':'text'
//    }).keydown(function(evt){
//        var key = evt.keyCode;
//        // preventing for Non Numeric Data
//        if(key!=8 && key!=13 && key!=190 && key!=110 && (key<48 || key>57) && (key<96 || key>105))
//            evt.preventDefault();
//        
//    }).change(function(){        
//        var h = $(this).val();
//        $(this).remove();
//        
//        if(h.length < 1)
//            return;
//        ME.modalDialog.setContent(ME.modalContent);
//        ME.modalDialog.setDefaultData([h,"",""]);
//        ME.modalDialog.onSubmit();         
//    }).blur(function(){
//        var h = $(this).val();
//        $(this).remove();
//        
//        if(h.length < 1)
//            return;
//        ME.modalDialog.setContent(ME.modalContent);
//        ME.modalDialog.setDefaultData([h,"",""]);
//        ME.modalDialog.onSubmit();            
//    }).click(function(evt){
//        evt.stopPropagation();
//    }).css({
//        'width':'25px',
//        'padding':'2',
//        'outline':'none',
//        '-webkit-border-radius':'4px'
//    });
//}
//
//
///**
// * This Method Returns teh Current Selected date based on the Selected
// * cell
// */
//TimeSheet.prototype.getSelectedDate = function(ind)
//{
//    if(!ind)
//        ind = this.currentCellInd;        
//    var cell = $(this.sheetTable).find('thead th')[ind];
//    return $(cell).attr('key');
//}
//
///**
// * This Method Returns the currented selected Tasl categorie
// * based on the selected cell
// */
//TimeSheet.prototype.getSelectedCategori = function(ind)
//{
//    if(!ind)
//        ind = this.currentRowInd;
//    return $( $(this.sheetTable).find('tr')[ind] ).find('th')[0].innerHTML;
//}
//
///**
// * This Merthod Used to generate the Report for the Specified
// * Employee to the for Purticular Project
// * with in the Specified Date Range
// * @param pDiv the Employee id
// * @param options the options oject is an Set of Properties Object
// */
//TimeSheet.prototype.generateReport = function(pDiv,options)
//{
//    alert('hi');
//    var ME = this;
//    // This Holds the Actual Data
//    var actualData;
//    var stackData = [];
//    var chart = new google.visualization.ColumnChart(pDiv);
//    var chartData = new google.visualization.DataTable();
//    var chartOptions = {
//        //width: 800, 
//        height: 400,
//        title: 'Employee Manhours Survey of '+pEmpId,
//        animation: {
//            duration: 1000,
//            easing: 'in'
//        }
//    }
//    
//    // Handling The Chart Selection Events
//    google.visualization.events.addListener(chart, 'select', function(){
//        var selection = chart.getSelection();
//        var row = selection[0].row;
//        var col = selection[0].column;
//        alert(stackData.length);
//        var cData = stackData[stackData.length-1];
//        var pData = ME.reports.groupDataBy(cData[row], "project");
//        alert($.toJSON(pData));
//    });
//    
//    var pEmpId = !options.empId?"%%":options.empId;
//    var pProjectId = !options.projectId?"%%":options.projectId;
//    var sDate = !options.startDate?null:options.startDate;
//    var eDate = !options.endDate?null:options.endDate;
//    
//    //alert(pProjectId+"   "+pEmpId);
//    function handler(jsonData)
//    {
//        var date,hours;
//        actualData = jsonData;
//        
//        // Grouping The Data by Date Wise
//        var projects = ME.reports.groupDataBy(jsonData, "project");
//        
//        stackData.push(projects);
//        //alert("No of Objects are : "+jsonData.length);
//        var projs = [];
//        var proj = [];
//        var tableData = [];
//        for(var i=0;i<projects.length;i++)
//        {
//            hours = 0;
//            var projGroupObj = projects[i];
//            for(var j=0;j<projGroupObj.length;j++)
//            {
//                var projObj = projGroupObj[j];
//                hours += ME.reports.sumAllWorkingHours(projObj);
//            }                
//            tableData[i] = [projGroupObj[0].PID,hours];
//        }
//        
//        chartData = new google.visualization.DataTable();
//        chartData.addColumn('string','Project');
//        chartData.addColumn('number','Hours');
//        chartData.addRows(tableData);
//        drawChart(chartData, chartOptions);
//    }    
//    /**
//     * This method is Used to Draw the Chaert with the Specified Data And Optioins
//     */
//    function drawChart(chartData,chartOpt)
//    {        
//        chart.draw(chartData,chartOpt);
//    }
//    
//    options.sDate = !options.sDate?new Date().moveToFirstDayOfMonth():options.sDate;
//    options.eDate = !options.eDate?new Date().moveToLastDayOfMonth():options.eDate;
//    
//    //alert($.toJSON(options));
//    
//    this.retriveTimeDataFor(options, handler);
//}
//
///**
// * This Method Computes the All Working Hours in a Particular
// * Day object
// */
//TimeSheet.prototype.sumAllHours = function(dayObj)
//{
//    var hours = 0;
//    if(dayObj == null)
//        return 0;
//    for(var i=1;i<dayObj.length;i++)
//    {
//        var projObj = dayObj[i];
//        hours += this.reports.sumAllWorkingHours(projObj);
//    }
//    return hours;
//}
//
///**
// * This Method Makews the Time Sheet Div As per the Required for The Time Sheet
// * and Returns the Created Div
// */
//TimeSheet.prototype.makeTimeSheetDiv = function()
//{
//    var div = document.createElement('div');
//    $(div).attr({
//        'class':'timeSheetDiv'
//    });
//    
//    var c = '<div id="timeSheetControls">'+    
//    '<span class="notch left_border">&nbsp;</span>'+
//    '<span class="button control" title="Goto Today">Today</span>'+
//    '<span class="button control">Weekly</span>'+
//    '<span class="button control">15-Day</span>'+
//    '<span class="button control">Monthly</span>'+
//    '<span class="button control" title="Previous"><</span>'+
//    '<span class="button control" title="Next">></span>'+
//    '<span class="notch right_border">&nbsp;</span>'+
//    '</div>'+
//    '<div id="timeSheetBody" style="overflow: auto"></div>';
//    div.innerHTML = c;
//    return div;
//}