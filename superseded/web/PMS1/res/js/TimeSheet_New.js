/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function TimeSheet(pDivs,options)
{
    var ME = this;
    
    /** This Mode tells in which mode the Sheet Should be Shown
     * 0 for User mode with Restrictions
     * 1 for Admin mode with No Restrictions
     * 2 for View Mode
     **/
    this.mode = 0;
    this.sheetEditable = true;
    
    /** ThisObject for Generating The Reports */
    this.reports = new PMSReports(this);
    
    this.modalDialog = new ModalDialog();
    /** This Object holds the Content to be showed in the Modal Dialog */
    this.modalContent = null;
    
    this.xmlObj = NCore.makeXMLObject();
    this.divs = pDivs;
    // This Holds the Current Data Object
    this.toDay = new Date();
    // moving to first Day of the Week
    this.startDate = new Date();
    this.startDate.moveBy(-3);
    // Moving to the End day of the Week
    this.endDate = new Date();
    this.endDate.moveBy(3);
    this.today = new Date();
    this.sheetDiv = null;
    /** This Object Holds the Hours Summary */
    this.summaryDiv = document.createElement('div');
    this.colorLegendDiv = document.createElement('div');
    this.heading = document.createElement('h4');
    this.controlsDiv = null;
    this.sheetHeader = null;
    this.sheetTable = document.createElement('table');
    this.infoDiv = document.createElement('div');
    /** This Element is used to Show the Close Button for the Content Div */
    this.closeSpan = document.createElement('span');
    /** This bejct holds the Data Retrive URL for this time Sheet*/
    this.dataRetriveURL = null;
    /** This object holds the path of the Data Store URL */
    this.dataStoreURL = null;
    /** This Label Button for submitting data this will be active in only Weekly Mode */
    this.submitButton = document.createElement('button');
    this.sheetStatus = document.createElement('label');
    // False means sheet is not submitted Yet */
    this.submitStatus = false;
    /** this Array holds the list of categories to be displayed for the project
     *like Philosphy, TNE, GUI Programming and Testing
     */
    this.taskCategories = ["Philosphy","TNE","GUI","Programming","Testing","General","Vacation","Sick","Holiday","Business Plans"];
    
    /** This Holds the Current Cell Index */
    this.currentCellInd = -1;
    this.currentRowInd = -1;
    
    this.toolTip = new ToolTip($('*'), {
        timeOut:-1
    });
    
    /** This Holds the sheetTable CSS Class name*/
    this.sheetTableCSS = "";
    this.sheetWidth = 200;
    
    /** This Object holds the Employee ID */
    this.empId = null;
    this.empName = null;
    /** This Object holds the Project ID */
    this.projectId = null;
    /** This object holds the Current Sheet Data in the Specified View Mode*/
    this.sheetData = [];
    /** This Array holds the Indexs of the Currently Modified Array Data
     * So this will let us to store the Modified Data to the Data Base
     */
    this.unSavedData = [];
    
    this.inputTextElement = document.createElement('input');
    
    /** This Object holds the Current Active Cell Data Object */
    this.activeCellData = null;
    /** This Object Holds the Curretn Active Table Cell */
    this.activeCell = null;
    
    /** This Object Holds the Recentl;y Retrived Data From the Data Base */
    this.retrivedData = null;
    
    /** This objects holds the bounds that restrict the Editing of the Time Sheet */
    this.editBounds ={
        from:new Date().addDays(-13).moveToDayOfWeek(0),
        to:new Date()
    }
    
    /** This Object Holds the Save Handler Function */
    this.saveHandler = null;
    
    /** This Object Holds the base Sheet Object if you want to change this
     *Object You Should Create a New Instance of timeSheet */
    this.baseSheetObj = null;
    
    /** This Object holds the Mode of the View
     *it can be MONTH, WEEK or etc....
     */
    this.viewMode = "WEEK";
    this.noOfDays = 7;
    
    /** This Object Holds the Data Used to  Generate the Time Sheet */
    this.sheetObj = null;
    
    this.init(options);    
    
    this.modalDialog.onSubmit = function()
    {
        if(!ME.modalDialog.validate())
        {
            alert("Please Enter Hours in numeric format");
            return;
        }
        
        var inputs = ME.modalDialog.getInputs();
        var filedNames = inputs[0];
        // Fields data
        var fd = inputs[1];        
        ME.submitData(fd);
    }    
}


/**
 * THis MEthod Should be called when the entered data to be Suibmitted
 */
TimeSheet.prototype.submitData = function(fd)
{
    fd[0] = parseFloat(fd[0]);
    fd[0] = this.round(fd[0]);
    
    var ME = this;
    //$('#myDiv').html(ME.retrivedData);
    var cellInd = ME.activeCellData.index;
    var prevHours = 0;
    
    // If current data was not already Modified Then Add it to the Unsaved Array
    if(ME.unSavedData.indexOf(ME.activeCellData.date)<0)
        ME.unSavedData.push(ME.activeCellData.date);
    
    //alert("Un Saved Data is :"+ME.unSavedData);
    
    this.projectId = ME.activeCellData.projId;
    var phaseInd = -1;
    
    var dayObj = ME.getDateObjectOn(ME.activeCellData.date);
    //alert($.toJSON(dayObj));
    var projObj = {};
    // If There is No Data on the Selected Data
    if(dayObj == null)
    {
        dayObj = [];
        //alert("New Day Object Created");
        var infoObj = ME.makeInfoObj();
        infoObj.EID = ME.empId;
        infoObj.date = ME.activeCellData.date;
        
        dayObj.push(infoObj);
        
        ME.retrivedData.push(dayObj);        
    }
    
    var ind = ME.reports.getProjectIndex(dayObj, ME.projectId);
    // if the Project not Found TheN Create a New Project
    if(ind == -1)
    {
        //alert("New Project Created");
        projObj = ME.makeEmptyProjectObject();
        projObj.PID = ME.activeCellData.projId;
        projObj.WO.push(ME.activeCellData.phase);
        projObj.WH.push(fd[0]);
        //by default th Previous Hours are '0'
        prevHours = 0;
        phaseInd = 0;
        //alert($.toJSON(projObj));
        // Adding the Project Object to THe Day Object
        dayObj.push(projObj);        
    }
    //  if Project Fouind then Continue with the Updating
    else
    {
        projObj = dayObj[ind];
        // Now scan the Project Object for the Phase
        var phases = projObj.WO;
        
        //alert("Phases : "+phases);
        for(var i=0;i<phases.length;i++){
            if(phases[i] == ME.activeCellData.phase){
                phaseInd = i;
                break;
            }
        }
        // if Phase Fopund then Update else push the New Phase
        if(phaseInd<0){
            projObj.WO.push(ME.activeCellData.phase);
            prevHours = 0;
            projObj.WH.push(fd[0]);
            phaseInd = projObj.WH.length-1;            
        }
        else{
            projObj.WO[phaseInd] = ME.activeCellData.phase;
            prevHours = projObj.WH[phaseInd];
            projObj.WH[phaseInd] = fd[0];
        }
    }
    //alert($.toJSON(ME.retrivedData));
    //alert($.toJSON(dayObj));
    try{
    //var cnt = ME.makeCellDiv(dayObj, ME.activeCellData.phase);
    //var cnt = ME.getSpendedHoursOn(dayObj, ME.activeCellData.projId, ME.activeCellData.phase);
    //$(ME.activeCell).html(cnt);
    //$('#myDiv').html($.toJSON(ME.retrivedData));
    //alert(cnt);
    }catch(e){
        alert(e);
    }    
    var bookedHours = ME.sumAllHours(dayObj);
    //$('#myDiv').html($.toJSON(dayObj));
    //alert("Booked Hours are :"+bookedHours+"\nPrevious hours Are :"+prevHours);
    
    if(bookedHours>24)
    {
        projObj.WH[phaseInd] = prevHours;
        alert("You Can't Book More than 24 Hours per Day");
    }
    
    //$('#myDiv').append("<br/>"+$.toJSON(dayObj));
    var foot = $(ME.sheetTable).find('tfoot');
    bookedHours = ME.sumAllHours(dayObj);
    //alert(projObj.WH[phaseInd]);
    $(ME.activeCell).html(projObj.WH[phaseInd]);
    $(foot).find('td').eq(cellInd).html(bookedHours);
    $(ME.activeCell).siblings('.rowSum').html(ME.sumRow(ME.activeCell));
    $(ME.sheetTable).find('tfoot .totalSum').html(ME.sumSheet());
    //ME.sumSheet();
    
    ME.saveSheetData(function(){
        $('#sheetStatus').html("Sheet Saved on :"+new Date().toString('dd-MMM-yyyy - hh:mm:ss tt'));
        Notification.show("TimeSheet Successfully Saved.......", 4000, function(){});
        ME.unSavedData = [];
        //$('#myDiv').html("Retrived Data Is : <br/>"+$.toJSON(ME.sheetObj));
        // TimeSheet Save Handler Present Then Calll it
        if(ME.saveHandler != null){
            ME.saveHandler(ME.activeCellData);
        }
    });
    
    
    return;
    //alert($.toJSON(dayObj));
    
    //$('#myDiv').html($.toJSON(ME.retrivedData));
    
    
    var cloneObj = eval("("+$.toJSON(ME.sheetData[cellInd])+")");    
    
    ME.pushDataToObject(cloneObj , [ME.activeCellData.phase,fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    
    if(ME.sumAllHours(cloneObj) > 24)
    {
        alert("Sorry You can't book more that 24 hours per day");
        ME.generateTimeSheet("", null);
        return;
    }
    //ME.pushDataToObject(ME.sheetData[cellInd] , [ME.getSelectedCategori(),fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    ME.pushDataToObject(ME.sheetData[cellInd] , [ME.activeCellData.phase,fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    alert("Booking Done");
    //$('#myDiv').html($.ME.sheetData);
    
    return;
    
    //var cellInd = ME.currentCellInd-1;
    
    
    //$('#myDiv').html($.toJSON(ME.sheetData));
        
    if(ME.sheetData[cellInd] == null)
    {    
        var infoObj = ME.makeInfoObj();
        infoObj.EID = ME.empId;
        //infoObj.date = ME.getSelectedDate();
        infoObj.date = ME.activeCellData.date;
        //alert($.toJSON(infoObj));
            
        ME.sheetData[cellInd] = [infoObj];
        
        ME.projectId = ME.activeCellData.projId;
        
        ME.sheetData[cellInd].push(ME.makeEmptyProjectObject());
    //alert($.toJSON(ME.sheetData[cellInd]));
    //alert("Empty Object Created");
    }
    
    var bookedHours = ME.sumAllHours(ME.sheetData[cellInd]);
    var cloneObj = eval("("+$.toJSON(ME.sheetData[cellInd])+")");
    
    //cloneObj.push("1");
    //alert($.toJSON(ME.sheetData[cellInd]));
    
    //alert($.toJSON(cloneObj));
    //ME.pushDataToObject(cloneObj , [ME.getSelectedCategori(),fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    ME.pushDataToObject(cloneObj , [ME.activeCellData.phase,fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    
    if(ME.sumAllHours(cloneObj) > 24)
    {
        alert("Sorry You can't book more that 24 hours per day");
        ME.generateTimeSheet("", null);
        return;
    }
    //ME.pushDataToObject(ME.sheetData[cellInd] , [ME.getSelectedCategori(),fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    ME.pushDataToObject(ME.sheetData[cellInd] , [ME.activeCellData.phase,fd[0],fd[1].split("\n"),fd[2].split("\n")]);
    
    var rows = $(ME.sheetTable).find('tbody tr');
    var cat;
    var cell;
    var cnt;
    $(rows).each(function()
    {
        //cat = ME.getSelectedCategori(this.rowIndex);
        cat = ME.activeCellData.index;
        cell = $(this).find('td').eq(cellInd);
        cnt = ME.makeCellDiv(ME.sheetData[cellInd], cat);
        // for now Disabling the Title
        $(cell).html(cnt);//.attr('title',cnt);

    });
        
    // Registering Close Button
    ME.registerCloseBtn();
    //$(cell).html(ME.makeCellDiv(ME.sheetData[cellInd]));
    try{
        ME.modalDialog.hide();
    }catch(e){
        alert(e);
    }
        
    // Forcing to Save the Time Sheet
    ME.generateTimeSheet("", null);
}

/**
 * This Method sums the Values in the Given row Index
 */
TimeSheet.prototype.sumRow = function(cell){
    var row = $(cell).parent('tr');
    var sum = 0;
    $(row).find('td').each(function(){
        //alert($(this).html());
        if(!$(this).hasClass('rowSum') && $(this).html().length>0){
            sum += parseFloat($(this).html());
        }
    });
    return sum;    
}

/**
 * THis Method Sum all the Sheet Hours
 */
TimeSheet.prototype.sumSheet = function(){
    var tot = 0;
    var ME = this;
    $(ME.sheetTable).find('tbody').find('tr').each(function(){
        tot += ME.sumRow($(this).find('td')[0]);
    });
    
    return tot;
}

/**
 * This Method Makes the Info Object and Returns tyeh Info Object
 */
TimeSheet.prototype.makeInfoObj = function()
{
    var infoObj =
    {
        "date":"",
        "EID":"",
        "I":8.3,
        "O":5.3,
        "S":0
    }
    return infoObj;    
}



/**
 * This Method Is Used to Make the Project Object
 * based on the given array Data
 * the data is an array of containing
 * ["Project Id","Worked On","Worked Hours","Tasks Done","Tasks Planned"]
 */
TimeSheet.prototype.makeEmptyProjectObject = function(data)
{
    var obj = {};
    obj.PID = this.projectId;
    obj.WO = [];
    obj.WH = [];
    obj.TD = [];
    obj.TP = [];
    //alert($.toJSON(obj));
    return obj;
}

/**
 * This Method Fills the Data To The Existing
 * Data Objects
 */
TimeSheet.prototype.pushDataToObject = function(pObj,data)
{
    //alert($.toJSON(pObj));
    //alert(data);
    //pObj = this.sheetData[this.currentCellInd-1];
    //alert("No of Projects are : "+pObj.length);
    var projectFound = false;
    
    for(var n=0;n<pObj.length;n++)
    {
        if(pObj[n].PID != this.projectId)
            continue;
        
        projectFound = true;
        //alert("Object Found");
        var ind = pObj[n].WO.length;
        for(var i=0;i<ind;i++)
        {
            if(data[0] == pObj[n].WO[i])
                ind = i;
        }
        
        pObj[n].WO[ind] = data[0];
        pObj[n].WH[ind] = data[1];
        pObj[n].TD[ind] = data[2].removeEmptyStrings();
        pObj[n].TP[ind] = data[3].removeEmptyStrings();
    }
    
    // if the Project not Found then Create a New Empty Project Object and push 
    // it to the Current SheetData Object
    if(!projectFound)
    {
        pObj.push(this.makeEmptyProjectObject(null));        
        // Then Push the Data to the Current Project Object by Calling Itself
        this.pushDataToObject(pObj, data);
    }    
    return pObj;
//alert("Index is : "+ind);
}


/**
 * This Method Initialies the Time Sheet Objects
 */
TimeSheet.prototype.init = function(options)
{    
    var ME = this;
    
    // Registering the Events for the Iput text element        
    
    // first :Loading The Options
    this.loadOptions(options);
    
    $(this.infoDiv).addClass('TSinfoDiv');
    
    this.sheetDiv = $('#timeSheetBody',this.divs)[0];
    this.controlsDiv = $('#timeSheetControls',this.divs)[0];
    this.sheetHeader = $('#timeSheetHeader',this.divs)[0];
    
    $(this.heading).addClass('sheetHeading top_border').html("Time Sheet Heading");
    $(this.heading).insertAfter(this.controlsDiv);
    $(this.sheetDiv).append(this.sheetTable);
    //alert('div Appended');
    $(this.submitButton).attr({
        //'class':'labelButton',
        'value':'sdsds'
    }).html("Submit Sheet");
    
    $(this.sheetStatus).css({
        'padding':'5px',
        'display':'inline-block',
        'color':'black',        
        'font-weight':'bold'
    }).html("Sheet Approval Status : ");
    
    this.registerSubmitButton();
    
    $(this.controlsDiv).append(this.submitButton);
    $(this.controlsDiv).prepend(this.sheetStatus);
    
    // Adding the Hours Summary Division
    $(this.divs).append(this.summaryDiv);    
    
    //appending the colorLegendDiv
    $(this.divs).append(this.colorLegendDiv);
    
    $(this.colorLegendDiv).html("").css({
        
        }).append("<label class='saved' id='sheetStatus'></label>");
    
    var colorDiv = document.createElement('div');
    
    $(colorDiv)    
    .addClass('TSlegend bottom_border')
    .append("Color Legend : <span class='toDay'>Today</span><span class='satuarday'>Saturday</span><span class='sunday'>Sunday</span>");    
    
    $(this.colorLegendDiv).append(colorDiv);
    
    $(this.sheetTable).addClass(this.sheetTableCSS);
    
    $(this.sheetTable).attr({
        'cellspacing':'0px',
        'cellpadding':'0px'
    });
    
    
    // initializing the modalDivi Contnet
    var cnt = "<table>"
    +"<tr><td>Enter Hours :</td><td><input type='text' class='MDInput' name='hours' /></td></tr>"
    +"<tr><td colspan='2'>Tasks Accomplished :<textarea rows='6' cols='30' class='MDInput' name='tasksDone'></textarea></td></tr>"
    +"<tr><td colspan='2'>Tasks Pending/Planned:<textarea rows='6' cols='30' class='MDInput' name='tasksPlanned'></textarea></td></tr>"
    +"";

    this.modalContent = cnt;
    
    this.modalDialog.validate = function()
    {        
        var inputs = ME.modalDialog.getInputs();
        var values = inputs[1];
        if(isNaN(parseFloat(values[0])))
        {
            //alert("Please Enter Numbers only");
            return false;
        }
        return true;
    }
    
    this.addControlListeners();
}

/**
 * This Method Returns the Un Submitted Data From the Givens Array of Day Objects Data
 */
TimeSheet.prototype.getUnSubmittedDates = function(daysData){
    var dates = [];
    //alert(daysData);
    var infoObj;
    for(var i=0;i<daysData.length;i++){
        if(!daysData[i])
            continue;
        infoObj = daysData[i][0];
        if(infoObj.S == 0){
            dates.push(infoObj.date);
        }
    }
    return dates;
}

/**
 * THis MEthod Register the Submit Button
 */
TimeSheet.prototype.registerSubmitButton = function(){
    var ME = this;
    $(ME.submitButton).click(function()
    {
        //        alert(ME.toDay>=ME.startDate);
        //        alert(ME.toDay<=ME.endDate);
        /*
        if(ME.toDay>=ME.startDate && ME.toDay<=ME.endDate){
            alert("You Can submit this Week Data At the End of Week");
            return;
        }
         */
        //return;
        // First Clear the un Saved Data
        ME.unSavedData = [];
        
        var data = ME.retrivedData;        
        var isSubmitted = true;
        var unSubmittedDates = ME.getUnSubmittedDates(data);
        //alert("Un Submitted Dates : "+unSubmittedDates);
        if(unSubmittedDates.length>0)
        {
            var totalHours = 0;
            var dayObj;
            for(var i=0;i<unSubmittedDates.length;i++)
            {
                dayObj = ME.getDateObjectOn(unSubmittedDates[i]);
                totalHours += ME.sumAllHours(dayObj);
            //alert(totalHours);
            }
            var confirmed = false;
            if(totalHours < 44)
            {
                confirmed = window.confirm("It seems that you didn't book full week (44 hours)\nStill You want submit sheet for approval?");
                if(!confirmed){
                    return;
                }
            }
            
            confirmed = window.confirm("Are you Sure to Submit this Week Data?\nOnce Submitted Cann't Edit Further");
            if(confirmed)
            {
                isSubmitted = false;                
                for(i=0;i<unSubmittedDates.length;i++)
                {
                    dayObj = ME.getDateObjectOn(unSubmittedDates[i]);
                    // Changin to Approval State
                    dayObj[0].S = 1;
                    ME.unSavedData.push(unSubmittedDates[i]);
                }
                //alert("Un Submitted Dates are :"+ME.unSavedData);
                //$('#myDiv').html($.toJSON(ME.retrivedData));
                if(!isSubmitted)
                {                    
                    ME.saveSheetData(function(){
                        ME.unSavedData = [];
                        $(ME.submitButton).attr({
                            'disabled':true
                        });
                        //$('#sheetStatus').html("Sheet Successfully Send for Approval");
                        Notification.show("Sheet Successfully Send for Approval", 5000, function(){});
                        
                        // Updating the Submit Status to True
                        ME.submitStatus = true;
                    //alert("Your Sheet Submitted Successfully");
                    });
                }
                else{
                    alert("Your Sheet Submitted Alredy");
                }
            }
        }
        else{
            alert("Your Sheet Submitted Alredy");
        }        
    });
}

/**
 * This MEthod Register the Close Button Actions 
 */
TimeSheet.prototype.registerCloseBtn = function(){
    
    // First Deregisrter the Click Event
    $(this.closeSpan ).remove();    
    this.closeSpan = document.createElement('span');
    
    var ME = this;
    $(this.closeSpan).html('')
    .addClass('closeBtn')
    .hover(function(){
        $(this).addClass('closeBtnHover');
    },function(){
        $(this).removeClass('closeBtnHover');
    })
    .click(function(evt)
    {
        // Forcing to Stop the Event Propogation
        evt.stopPropagation();
        
        if(! window.confirm("Are you Sure to delete this Info?"))
        {
            return;
        }            
        
        try
        {
            var td = $(this).parent()[0];
            var row = $(td).parent()[0];
            var rowInd = row.rowIndex;
            var phase = ME.getSelectedCategori(rowInd);
            //alert("Roew Index is : "+phase);
            var dayObj = ME.sheetData[td.cellIndex-1];
            var projInd = ME.reports.getProjectIndex(ME.sheetData[td.cellIndex-1], ME.projectId);
            // Removing the Purticular Project
            var projObj = ME.sheetData[td.cellIndex-1][projInd];
            // if there is only one Category then Make the Project Object as Null
            if(!projObj || !projObj.WO)
                return;
            
            if(projObj.WO.length<2)
            {
                dayObj.splice(projInd, 1);
            }
            // Elser DO search for Purticular Phase and Remove that Phase
            else        
            {
                var selInd = -1;
                for(var i=0;i<projObj.WO.length;i++)
                {
                    if(projObj.WO[i] == phase)
                    {
                        selInd = i;
                        break;
                    }
                }
                projObj.WO.splice(selInd,1);
                projObj.WH.splice(selInd,1);
                projObj.TD.splice(selInd,1);
                projObj.TP.splice(selInd,1);
            //alert("Pbject Found At : "+selInd);
            }
        
            $(td).removeAttr('onmouseover');
            // Removing the hover Effects
            $(td).removeClass('hover');
            $(td).stop().animate({
                boxShadow: '0px 0px 0px #44f'
            });
        
            $(td).html(ME.makeCellDiv(dayObj, phase));
            // Registering the Close Button
            ME.registerCloseBtn();
        
            //Markig the Data as UnSaved
            ME.unSavedData.push(td.cellIndex-1);
            ME.generateTimeSheet("", null);
        }
        catch(e){
            alert(e);
        }
    //alert(ME.unSavedData);
    //alert(td.innerHTML);
    //alert("After Removing : "+$.toJSON(ME.sheetData[td.cellIndex-1]));
        
    //alert($.toJSON(ME.sheetData[cell.cellIndex-1]));
    });
}

/**
 * This Method Adds the Listeners to the Controls for Time Sheet
 */
TimeSheet.prototype.addControlListeners = function()
{
    var ME = this;
    
    // adding Scrool Listenerto The Time Sheet
    $(ME.sheetDiv).scroll(function(evt){
        
        });
    
    // Control Listeners
    var controls = $('.controller',this.controlsDiv);
    $(controls).each(function(ind)
    {
        $(this).click(function(evt)
        {
            $(controls).removeClass('active');
            $(this).addClass('active');            
            
            switch(ind)
            {
                case 0:
                    // moving date to Starting of Current Week
                    ME.startDate = new Date();
                    ME.startDate.moveBy(-3);
                    ME.endDate = new Date();
                    ME.endDate.moveBy(3);
                    ME.moveTimeSheetBy(ME.viewMode, 0);
                    break;
                case 1:
                    ME.viewMode = "WEEK";
                    ME.startDate = new Date().addDays(-(new Date().getDay()-1));
                    ME.endDate = new Date().moveToDayOfWeek(7);
                    ME.moveTimeSheetBy(ME.viewMode, 0);
                    break;
                case 2:
                    ME.viewMode = "15-DAY";
                    ME.moveTimeSheetBy(ME.viewMode, 0);
                    break;
                case 3:
                    ME.viewMode = "MONTH";
                    ME.moveTimeSheetBy(ME.viewMode, 0);
                    break;
                case 4:
                    ME.moveTimeSheetBy(ME.viewMode,-1);
                    break;
                case 5:
                    //alert(me.viewMode);                    
                    ME.moveTimeSheetBy(ME.viewMode,1);
                    break;
            }            
        });
    });    
//alert("Control Listeners Added");
}

/**
 * This Method Loads the Opetions that the user send to this object
 * this mehod loads the default values when the
 * user dosen't specify the values
 */
TimeSheet.prototype.loadOptions = function(options)
{
    
    if(!options)
        options = {};
    //alert(options.mode);
    this.mode = !options.mode?this.mode:options.mode;    
    this.empId = !options.empId?this.empId:options.empId;
    this.empName = !options.empName?this.empName:options.empName;
    this.projectId = !options.projectId?this.projectId:options.projectId;
    this.startDate = !options.startDate?this.startDate:options.startDate;
    this.endDate = !options.endDate?this.endDate:options.endDate;
    this.sheetTableCSS = !options.sheetTableCSS?this.sheetTableCSS:options.sheetTableCSS;
    this.sheetWidth = !options.sheetWidth?this.sheetWidth:options.sheetWidth;
    this.viewMode = !options.viewMode?this.viewMode:options.viewMode;
    this.dataRetriveURL = !options.dataRetriveURL?this.dataRetriveURL:options.dataRetriveURL;
    this.dataStoreURL = !options.dataStoreURL?this.dataStoreURL:options.dataStoreURL;
    this.taskCategories = !options.taskCategories?this.taskCategories:options.taskCategories;    
    this.divs = !options.divs?this.divs:options.divs;    
    
    // New Time Sheet Options
    //alert("Previous Sheet Object is :"+ (!options.sheetObj));
    this.sheetObj = !options.sheetObj?this.sheetObj:options.sheetObj;
    this.saveHandler = !options.saveHandler?this.saveHandler:options.saveHandler;
    //alert("Base Sheet Object is :"+ (this.baseSheetObj));
    
    $(this.heading).html(!options.heading?"Time Sheet":options.heading);
}

/**
 * This Method moves the Time Sheet to the Sppecified Number of Days
 * for +1 the Sheet Moves to Forward
 * for -1 he sheet moves to Backward
 */
TimeSheet.prototype.moveTimeSheetBy = function(mode,direction)
{    
    var opt = {
        startDate:null,
        endDate:null,
        noOfDays:0
    };
    
    var date = this.startDate.clone();
    
    if(mode == "MONTH")
    {
        // First moving forward to one month
        if(direction == 1)
        {
            date.moveToNextMonth();
        }
        else if(direction == -1)
        {
            date.moveToPrevMonth();
        }            
            
        //alert("Month Mode : "+date);
        opt.startDate = date.moveToFirstDayOfMonth().clone();
        opt.endDate = date.moveToLastDayOfMonth().clone();
    }
    else if(mode == "15-DAY")
    {
        if(direction == 1)
        {            
            opt.startDate = date.addDays(14).clone();
        //opt.startDate = date;
        //opt.startDate.moveBy(-7);
        //opt.endDate = date;
        //opt.startDate.moveBy(7);
        }            
        else if(direction == -1)
        {
            opt.startDate = date.addDays(-14).clone();
        }
        
        opt.noOfDays = 14;
    }
    else if(mode == "WEEK")
    {
        if(direction == 1)
        {
            opt.startDate = date.addDays(7);            
        //opt.endDate = date.moveToDayOfWeek(7);
        }            
        else if(direction == -1)
        {
            opt.startDate = date.addDays(-7);
        //opt.endDate = date.addDays(7);
        }        
        opt.noOfDays = 7;
    }
    //alert($.toJSON(opt));
    this.generateTimeSheet("", opt);
}

/**
 * This Method Saves the Data available on the Unsaved Data of the Sheet
 */
TimeSheet.prototype.saveSheetData = function(handler,opt)
{       
    var ME = this;
    var dates = [];
    var data;
    if(opt){
        //alert("Options Provided");
        data = opt.data;        
        for(var i=0;i<data.length;i++){
            dates.push(Date.parse(data[i][0].date).toString('yyyy-MM-dd'));
        }
        ME.storeTimeData(dates, data,handler,{
            empId:opt.empId
        });
    //alert("Un Submitted Dates Are :"+dates);
    }
    else{
        //alert("Un Saved Sheet Data : "+ME.unSavedData.length);
        //alert("Options Not Provided");
        if(ME.unSavedData.length > 0)
        {            
            data = [];
            //alert($.toJSON(ME.sheetData));        
        
            for(i=0;i<ME.unSavedData.length;i++)
            {
                //alert($.toJSON(ME.unSavedData[i]));
                try{
                    // The Date format for Comparing Dates with DB
                    dates.push(Date.parse(ME.unSavedData[i]).toString('yyyy-MM-dd'));
                    data.push(ME.trimDayObj(ME.getDateObjectOn(ME.unSavedData[i])));
                }catch(e){
                    alert(e);
                }
            }
            //alert("There is Unsaved Data on : "+dates);
            ME.storeTimeData(dates, data,handler);
        }
    }    
}


/**
 * This ethod trims the Given Day Object
 * means it remove the Phases with Booked Hours '0' for Memory Purpose
 */
TimeSheet.prototype.trimDayObj = function(dayObj){
    for(var i=1;i<dayObj.length;i++){
        trim(dayObj[i]);
    }
    
    /**
     * THis MethoD Trims the Project
     */
    function trim(pObj)
    {
        for(var i=0;i<pObj.WH.length;i++)
        {
            if(pObj.WH[i] == "0")
            {                
                pObj.WH.splice(i,1);                
                pObj.WO.splice(i,1);
            }
        }
    }
    
    return dayObj;
}

/**
 * This Method is used to generate the time sheet
 * @param sheetName  the name to be displayed for this sheet
 * @param options  the time sheet configuration Options
 */
TimeSheet.prototype.generateTimeSheet = function(sheetName,options)
{   
    var ME = this;
    var tempSheetObj = null;    
    
    Mask.showMask(ME.sheetDiv,{});
    
    // First Check Any Previous data to be stored to Data Base
    // if there is then Store the Data First
    if(ME.unSavedData.length > 0)
    {
        function handler()
        {
            //alert("Data Stored Successfully");
            // Clearing The UnSaved Data            
            ME.unSavedData = [];
            ME.generateTimeSheet(sheetName,options);
        }            
        ME.saveSheetData(handler);        
        // Sending the Data to Be Stored in the Data Base
        return;
    }
    
    $(ME.submitButton).css({
        'display':'none'
    });
    
    ME.sheetEditable = true;
    ME.submitStatus = false;
    
    if(ME.viewMode == 'WEEK')
    {
        $(ME.submitButton).css({
            'display':'inline'
        });
    }
    
    $(ME.sheetStatus).html("");
    
    // first loading The Options
    this.loadOptions(options);
    
    
    // if the Admin Views the Sheet then removes the Controls
    if(ME.mode == 1){
        $(ME.controlsDiv).html("<label style='font-size:1.4em;padding: 2px 10px;font-weight:bold'>Employee Name : "+ME.empName+"</label>");
    }    
    
    if(!options.noOfDays)
    {
        this.noOfDays = parseFloat(""+( (this.endDate-this.startDate)/(1000*24*60*60)+1 ));
    }
    else
    {
        this.noOfDays = options.noOfDays;
    }
    
    this.endDate = this.startDate.clone().addDays(this.noOfDays-1);
    
    $(this.heading).html("Time Sheet ("+this.startDate.toString('dd-MMM-yyyy')+" to "+this.endDate.toString('dd-MMM-yyyy')+")");
    
    
    //alert("Date Range :"+this.startDate.toString('yyyy-MM-dd')+"  :   "+this.endDate.toString('yyyy-MM-dd'));
    //alert("Sheet for :"+options.startDate+"    "+options.endDate);
    //alert('No of days in this Month are : '+this.noOfDays);

    //alert("Sheet Object Is Info is :"+ME.sheetObj.length);
    
    // Handler Function for Handling the AJAX call
    ajaxHandler = function(data)
    {
        ME.retrivedData = [];
        //ME.retrivedData = $.extend({},data,true);
        //data = data.removeNulls();
        for(var i=0;i<data.length;i++)
        {
            if(data[i] != null)
            {
                ME.retrivedData.push(data[i]);
                if(!ME.submitStatus){
                    ME.submitStatus = parseInt(""+data[i][0].S)>0;
                }                
            //alert(data[i][0].S);
            }                
        }
        //alert(ME.submitStatus);
        //ME.retrivedData = data;
        //alert("hi");
        // Now Enabling or Dissablin the Submit Button based on the
        try
        {
            //alert('hi');
            //alert("Un Submitted Data is :"+ME.getUnSubmittedDates(data));
            if(ME.getUnSubmittedDates(data).length<1)
            {
                $(ME.submitButton).attr({
                    'disabled':'true'
                });
                ME.sheetEditable = false;
                var dayObj = ME.retrivedData[0];
                if(dayObj != null){
                    if(dayObj[0].S == 2)
                    {
                        $(ME.sheetStatus).html("Approval Status: <label style='color:green'>Approved</label>");
                    }
                    else{
                        $(ME.sheetStatus).html("Approval Status: <label style='color:red'>Not Approved</label>");
                    }
                //alert("Sheet Status is :"+dayObj[0].S);
                }
            }
            else{
                $(ME.submitButton).removeAttr('disabled');
                ME.sheetEditable = true;
            }
        
        }catch(e){
            alert(e);
        }
        //$('#myDiv').html($.toJSON(ME.retrivedData));        
        
        categorizeDataByProject(data,function(projData)
        {
            var obj = projData;
            //var sObj = ME.sheetObj;
            var sObj = [];
            for(var i=0;i<ME.sheetObj.length;i++){
                sObj.push($.extend(true,{},ME.sheetObj[i]));
            }
            /** This Holds a Copy of actual Sheet Object */
            //sObj = sObj[1];
            //$('#myDiv').html($.toJSON(sObj));
            var found = false;
            
            
            for(i=0;i<obj.length;i++)
            {
                found = false;
                for(var j=0;j<sObj.length;j++)
                {
                    if(obj[i].projId == sObj[j].projId){
                        found = true;
                        break;
                    }
                }
                if(found)
                {
                    sObj[j].phases.pushAll(obj[i].phases);
                    sObj[j].phases = sObj[j].phases.removeDuplicates();
                }
                else{
                    // If there Phases Then only Add this Project
                    if(obj[i].phases.length>0)
                        sObj.push(obj[i]);
                }
            }
            
            var d= new Date();
            d.addDays(-d.getDay());
            d.moveToDayOfWeek(1, -1);
            //alert(d);
            var daysDiff = parseInt(""+(d - ME.startDate)/(24*60*60*1000));
            //alert("Difference Dates Are :"+daysDiff);
            if(daysDiff < 16){
                tempSheetObj = sObj;
            }
            else{
                tempSheetObj = obj;
            }
            
            //ME.sheetObj = tempSheetObj;
            //$('#myDiv').html($.toJSON(ME.sheetObj));
            
            // Now Calling the Render Sheet
            renderSheet();
        });
        
        
        function categorizeDataByProject(data,handler)
        {
            var projs = [];
            var phases = [];
            var projInd;
            var phaseInd;
            
            for(var i=0;i<data.length;i++)
            {
                var dayObj = data[i];
                if(dayObj == null)
                    continue
                for(var j=1;j<dayObj.length;j++)
                {
                    var projObj = dayObj[j];
                    projInd =projs.indexOf(projObj.PID);
                    if( projInd< 0)
                    {                    
                        projInd = (projs.push(projObj.PID)-1);                     
                    }
                    if(!phases[projInd])
                        phases[projInd] = [];
                    
                    for(var k=0;k<projObj.WO.length;k++)
                    {
                        if(phases[projInd].indexOf(projObj.WO[k])<0)
                        {
                            phases[projInd].push(projObj.WO[k]);
                        }
                    }
                }                
            }
            var q = "";
            for(i=0;i<projs.length;i++){
                q += projs[i]+",";
            }
            
            //alert("Found New Phases Are :"+phases);

            $.get("projectHandler.do",{
                mode:9,
                projIds:q
            },function(data){
                data = eval("("+data+")");
                //alert("Projects Length : "+projs.length);
                var obj = [];
                
                for(var i=0;i<projs.length;i++)
                {
                    for(var j=0;j<data.length;j++)
                    {
                        if(projs[i] == data[j].projId)
                        {
                            obj.push({
                                projId:projs[i],
                                title:data[j].title,
                                phases:phases[i]
                            });
                            break;
                        }
                    }                
                }
                handler(obj);                
            });
            
            
            var obj = [];
            for(i=0;i<projs.length;i++)
            {
                obj.push({
                    projId:projs[i],
                    phases:phases[i]
                });
            //alert("Project :"+projs[i]+"\nPhases are :"+phases[i]);
            }
            
            return obj;
        }
        
        
        /**
         * THis Sub Method used to Render the Sheet
         */
        function renderSheet(){
            
            //ME.generateHoursSummary(data);
            var currDay = ME.startDate.clone();
        
            var header = "<thead><tr>";        
            //header += "<th>Project<br/>"+currDay.getFullYear()+"</th>";
            header += "<th rowspan='2'>Project</th><th rowspan='2'>Sub CTR</th>";
            try
            {
                //alert(ME.noOfDays);
                for(var i=0;i<ME.noOfDays;i++)
                {
                    header += "<th key='"+currDay.toString("dd-MMM-yyyy")+"'>"+currDay.toString("MMM dd")+"</th>";
                    currDay.setDate(currDay.getDate()+1);
                }
                header += "<td rowspan='2' class='headCell'>Total Hours</td>"
                header += "</tr><tr>";            
                
                // rendering the Day Names
                currDay = ME.startDate.clone();
                for(i=0;i<ME.noOfDays;i++)
                {                
                    header += "<td>"+currDay.getDayName('DD')+"</td>";
                    currDay.setDate(currDay.getDate()+1);
                }
                header +="</tr></thead>";
            
            }
            catch(e){
                alert(e);
            }

            // Creating The Body Content
            var start = ME.startDate.clone();
            var end = ME.endDate.clone();        
        
            
            
            var sObj = tempSheetObj;
            var body = "<tbody>";
            
            if(sObj.length>0)
            {                
                var cellContent = "";
        
                var val = "";
                var dayObj = null;
                var hours = null;
                var totalSum = 0;
                
                for(i=0;i<sObj.length;i++)
                {
                    //alert($.toJSON(projObj));
                    var projObj = sObj[i];
                    var phases = projObj.phases;
                    body += "<tr>";
                    body += "<th rowspan='"+phases.length+"' class='projectTitle'>"+projObj.title+"</th>";
                    //body += "<tr><th class='projectTitle'>"+projObj.title+"</th>";            
            
                    for(var j=0;j<phases.length;j++)
                    {
                        body += "<th>"+phases[j]+"</th>";
                        currDay = ME.startDate.clone();
                        cellContent = "";
                        var rowSum = 0;
                        for(var k=0;k<ME.noOfDays;k++)
                        {
                            hours = null;
                            // This is holding Info of date,projectId,phase Name., index
                            val = currDay.getDateAsPlainText()+","+projObj.projId+","+phases[j]+","+k;
                            dayObj = ME.getDateObjectOn(currDay.getDateAsPlainText());
                            if(dayObj != null)
                            {
                                hours = ME.getSpendedHoursOn(dayObj, projObj.projId, phases[j]);
                            //cellContent = ME.makeCellDiv(dayObj,phases[j],projObj.projId);
                            //cellContent = ME.makeCellDiv(dayObj,phases[j],projObj.projId);
                            }
                            rowSum += hours;
                            body += "<td key='"+val+"'>"+ (hours==null?"":hours) +"</td>";                            
                            //body += "<td key='"+val+"'>"+ cellContent +"</td>";
                            currDay.addDays(1);
                        }
                        body += "<td class='rowSum headCell total'>"+rowSum+"</td>";
                        body += "</tr>";
                        totalSum += rowSum;
                    }
                }        
                
            }else{
                var msg = "It Seems that you don't have any Active Project Right Now<br/>";
                msg += "You Can Add Projects By Clicking on \"<b>Manage My Time Sheet</b>\" Button";
                body += "<tr>"
                
                +"<th colspan='"+(ME.noOfDays+2)+"' style='color:#00aff0;font-size:16px' >"+msg+"</th>";
                body += "</tr>"
            }            
            body += "</tbody>";
        
            // Table Foot Content
            var foot = "<tfoot><tr><th colspan=2>Total Hours</th>";
            currDay = ME.startDate.clone();
            for(i=0;i<ME.noOfDays;i++)
            {
                val = currDay.getDateAsPlainText();            
                dayObj = ME.getDateObjectOn(currDay.getDateAsPlainText());
                foot += "<td key='"+val+"' class='total'>"+ME.sumAllHours(dayObj)+"</td>";
                currDay.addDays(1);        
            }
            foot += "<td class='totalSum headCell .timeSheet mainTotal'>"+totalSum+"</td>";
            foot += "</tr></tfoot>";        
    
            $(ME.sheetTable).css({
                'width':'100%'
            });
            $(ME.sheetTable).html("");
            $(ME.sheetTable).append(header);
            $(ME.sheetTable).append(body);
            $(ME.sheetTable).append(foot);
        
            ME.sheetLoaded();
        
        
            //$(ME.sheetTable).fadeTo(0, 0, null).fadeTo(1000,1.0,null);
            //alert($(ME.sheetTable).html());
            /*
        $(ME.sheetTable).animate({
            'margin-left':'-'+$(ME.sheetTable).width()+'px',
            opacity:0.0
        },10,function(){
            $(ME.sheetTable).animate({
                'margin-left':'0px',
                opacity:1.0
            },500,ME.sheetLoaded());
        });
             */
    
            ME.hilightWeekDays();
            ME.hilightTimeSheetOn(new Date());
            //ME.showDaysOnHead();
            ME.registerTimeSheet(ME.sheetTable);
        
        //$(ME.colorLegendDiv).html("sdajkfhjkasdhlfkjasfdas");
        }
    //*******************************************************
    //******************************* Sheet Rendering Done Here
    //******************************* Sheet Rendering Done Here
        
    }
    
    this.retriveTimeData(this.empId,"%%",this.startDate, this.endDate, ajaxHandler);
}

/**
 * This Method Retrives the Hours Specded on a project with the Specified Phase
 * @param dayObj the Day Object to Be scanned
 * @param projId the The Project to Be Scan
 * @param phase the Phase to retrive data
 * @returns the Hours spent on the Purticular phse of a Project if there other wise return 'null'
 */
TimeSheet.prototype.getSpendedHoursOn = function(dayObj,projId,phase)
{
    var ind = this.reports.getProjectIndex(dayObj, projId);
    if(ind <0){
        return null;
    }
    var projObj = dayObj[ind];
    var phaseInd = projObj.WO.indexOf(phase);
    if(phaseInd < 0){
        return null;
    }
    return parseFloat(projObj.WH[phaseInd]);
}

/**
 * This Method Generates the Hours Sumary of the Selected Time Sheet
 */
TimeSheet.prototype.generateHoursSummary = function(data)
{
    var len = data.length;
    data = data.slice(len-7, len);
    
    var ME = this;
    
    
    var cnt = "<h4 style='text-align:center;background: lightblue;margin:0px;padding:5px'>Hours Summary</h4>";
    cnt += "<table align='center' class='stripyTable' border=1>";
    var projs = [];
    
    cnt += "<thead><tr><th>Date</th>";
    for(var i=0;i<data.length;i++)
    {
        var dayObj = data[i];
        for(var j=1;j<dayObj.length;j++)
        {
            if(projs.indexOf(dayObj[j].PID)<0){
                projs.push(dayObj[j].PID);
            }
        }        
    }
    
    for(i=0;i<projs.length;i++){
        cnt += "<th>"+projs[i]+"</th>";
    }
    cnt += "</tr></thead>";
    
    cnt += "<tbody>";
    for(i=0;i<data.length;i++)
    {
        cnt += "<tr>";
        dayObj = data[i];        
        cnt += "<td>"+dayObj[0].date+"</td>";
        for(j=0;j<projs.length;j++)
        {
            var projObj = dayObj[j];
            if(!projObj || !projObj.PID){
                cnt += "<td></td>";
            }
            else if(projs.indexOf(projObj.PID)<0)
            {
                cnt += "<td></td>";
            }
            else
                cnt += "<td>"+this.reports.sumAllWorkingHours(projObj)+"</td>";
        }        
        cnt += "</tr>";
    }
    cnt += "</tbody>";
    cnt += "</table>";    
    $('#myDiv').html(cnt);
    //$(this.summaryDiv).html(cnt);
    
    StripyTable.makeAsStrippyTable($('table',this.summaryDiv)[0], {
        CSS:'stripyTable'
    });
}

/**
 * This Method is used to show the day names on the Heads of the Time Sheet Table
 */
TimeSheet.prototype.showDaysOnHead = function()
{
    $('.dayName').remove();
    var ME = this;
    $(ME.sheetTable).find('thead th:gt(0)').each(function()
    {
        var d = document.createElement('span');
        $(d).addClass('dayName');
        $(d).html(Date.parse(this.innerHTML).getDayName()).css({
            'position':'absolute',
            'text-align':'center',
            'background':'gray',
            '-webkit-border-radius':'5px',
            'max-width':$(this).outerWidth(),
            'left':$(this).position().left,
            'top':$(this).position().top-10
        });
        $(ME.sheetTable).append(d);
    });
}

/**
 * This MEthod Will be called when the Sheet loaded
 */
TimeSheet.prototype.sheetLoaded = function()
{
    Mask.hideMask(this.sheetDiv);
/*
    FixedHeader.fix($('#timeSheetBody'), {
        cols:2
    });    
     */    
}


/**
 * THis Method Returns teh Data Object on the Specified Day
 * Note: if no object found on the Given Date then It Makes a New Empty Day Object And Return it
 */
TimeSheet.prototype.getDateObjectOn = function(date){
    var dayObj = null;
    var dObj = null;
    //alert("Size of Retrived Data Is :"+this.retrivedData.length);
    for(var i=0;i<this.retrivedData.length;i++)
    {
        dObj =  this.retrivedData[i];
        if(dObj == null)
            continue;
        if(Date.parse(dObj[0].date).equalsIgnoreTime(Date.parse(date))){
            dayObj = dObj;
            //alert("Object Found At :"+dayObj[0].date);
            break;
        }        
    }
    return dayObj;
}
/**
 * This MEthod Spreads the Given data to the entire month array
 * or Week array
 * this assign the unfilled days to null autometically
 */
TimeSheet.prototype.mapDataToArray = function(pStart,pData,len)
{
    var l = pData.length;
    //alert("No of Objects are :"+l);
    this.sheetData = [];
    var j = 0;
    var start = pStart.clone();
    for(var i=0;i<len;i++)
    {
        //alert(start+"     "+pData[j].date);
        //alert(j);
        //alert((pData[j]));
        if(j<l && start.equalsIgnoreTime(Date.parse(pData[j][0].date) ))
        {
            //alert('Equal at '+start);
            this.sheetData.push(pData[j]);
            j++;
        }        
        else
        {
            this.sheetData.push(null);
        }
        start.moveBy(1);
    }
    //alert("Everything is done : "+this.sheetData.length);
    return this.sheetData;
}

/**
 * This MEthod Retrives the TimeSheet Data for the Specified Data Range
 */
TimeSheet.prototype.retriveTimeData = function(pEmpId,pProjectId,sDate,eDate,handler)
{
    var ME = this;
    //pProjectId = 'PROJ_0006';
    //alert(pProjectId);    
    //alert(pEmpId+"   "+pProjectId+"   "+sDate+"   "+eDate);
    var query = this.dataRetriveURL+"?mode=0&empId="+pEmpId+"&projectId="+pProjectId+"&startDate="+sDate.getDateAsPlainText()+"&endDate="+eDate.getDateAsPlainText();
    //alert(query);
    this.xmlObj.open('GET',this.dataRetriveURL+"?mode=0&empId="+pEmpId+"&projectId="+pProjectId+"&startDate="+sDate.getDateAsPlainText()+"&endDate="+eDate.getDateAsPlainText(),true);    
    
    $.get(this.dataRetriveURL,{
        mode:0,
        empId:pEmpId,
        projectId:pProjectId,
        startDate:sDate.getDateAsPlainText(),
        endDate:eDate.getDateAsPlainText()
    },function(data){
        if(data==null || data.length<2)
        {
            handler(eval("([])"));
            return;
        }
        data = eval("(" + data + ")");
        // Calling the Handler Function with the data a parameter
        handler(data);
    });
}


/**
 * This Method Retrives the Time Sheet data for the group of Employees
 * and Group of Projects
 */
TimeSheet.prototype.retriveTimeDataFor = function(options,handler)
{
    var ME = this;
    //alert(this.dataRetriveURL);
    //alert(this.xmlObj);
    //alert(pEmpId+"   "+pProjectId+"   "+sDate+"   "+eDate);
    var query = this.dataRetriveURL+"?mode=2";
    
    var pEmpids = !options.emps?null:options.emps;
    var pProjectIds = !options.projs?null:options.projs;
    
    if(pEmpids != null)
    {
        query += "&nOfEmps="+pEmpids.length;
       
        for(var i=0;i<pEmpids.length;i++)
        {
            query += ("&emp"+i+"="+pEmpids[i]);
        }
    }        
    if(pProjectIds != null)
    {        
        query += "&nOfProjs="+pProjectIds.length;    
        for(i=0;i<pProjectIds.length;i++)
        {
            query += ("&proj"+i+"="+pProjectIds[i]);
        }
    }
    
    if(options.sDate)
    {
        query +=("&sDate="+options.sDate.getDateAsPlainText());
    }
    if(options.eDate)
    {
        query +=("&eDate="+options.eDate.getDateAsPlainText());
    }
        
    // alert(query);
    this.xmlObj.open('GET',query,true);

    $.get(query,null,function(text)
    {
        if(text == null || text.length<2)
        {
            handler(eval("([])"));
            return;
        }
        //alert(text);
        var data = eval("(" + text + ")");
        // Calling the Handler Function with the data a parameter
        handler(data);        
    });    
}

TimeSheet.prototype.retriveTimeDataForProject = function(options,handler)
{
    
    //alert("The Sceond Function");
    try
    {
        
    
        var ME = this;
        var query = this.dataRetriveURL+"?mode=2";
        var pEmpids = !options.emps?null:options.emps;
        var pProjectIds = !options.projs?null:options.projs;
        if(pEmpids != null)
        {
            query += "&nOfEmps="+pEmpids.length;
            for(var i=0;i<pEmpids.length;i++)
            {
                query += ("&emp"+i+"="+pEmpids[i]);
            }
        }        
        if(pProjectIds != null)
        {        
            query += "&nOfProjs="+pProjectIds.length;    
            for(i=0;i<pProjectIds.length;i++)
            {
                query += ("&proj"+i+"="+pProjectIds[i]);
            }
        }
    
        if(options.sDate)
        {
            query +=("&sDate="+options.sDate);
        }
        if(options.eDate)
        {
            query +=("&eDate="+options.eDate);
        }
        this.xmlObj.open('GET',query,true);
        
        $.get(query,null,function(text)
        {
            if(text == null || text.length<2)
            {
                handler(eval("([])"));
                return;
            }
            var data = eval("(" + text + ")");
            
            // Calling the Handler Function with the data a parameter
            handler(data);
                
        });  
    }catch(e)
    {
        alert("Exception is Raised "+e);
    }
}

/**
 * This MEthod used to store the Time sheet data to the Data Base
 */
TimeSheet.prototype.storeTimeData = function(dates,data,handler,opt)
{
    var ME = this;
    var empId = ME.empId;    
    if(opt){
        //alert("Stroring Data For :"+opt.empId);        
        empId = opt.empId;        
    }
    //alert("Saving Data for Employee: "+this.empId);
    //$('#myDiv').html($.toJSON(data));
    this.xmlObj.open("POST", this.dataStoreURL,true);
    ME.xmlObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    this.xmlObj.onreadystatechange = function()
    {
        //alert("Status is : "+ME.xmlObj.status);
        if(ME.xmlObj.readyState==4 && ME.xmlObj.status==200)
        {            
            //alert("Data Store Data is : "+ME.xmlObj.responseText);
            handler();
        }            
    }
    var content = "empId="+empId+"&mode=1&noOf="+dates.length;    
    for(var i=0;i<dates.length;i++)
    {
        content += ("&empId"+(i+1)+"="+escape(empId));
        content += ("&date"+(i+1)+"="+escape(dates[i]));
        content += ("&data"+(i+1)+"="+escape($.toJSON(data[i])));
    }    
    //alert("Employee Id is :"+empId);
    //alert(content);
    ME.xmlObj.send(content);
}

/**
 * This Method used to update the View by the Controls
 */
TimeSheet.prototype.updateView = function(vMode)
{
    var me = this;
    var sDate = this.startDate;
    var nDate = this.startDate;
    var opt = {
        startDate:this.startDate,
        endDate:this.endDate,
        noOfDays:null
    };
    vMode = vMode.toUpperCase();
    
    this.viewMode = vMode;
    if(vMode == "MONTH")        
    {
        this.startDate.moveToFirstDayOfMonth();
        this.endDate.moveToLastDayOfMonth();
        //nDate.setDate(sDate.getDate()+30);        
        opt.noOfDays = parseFloat( ""+ ( (this.endDate-this.startDate)/(1000*24*60*60)+1 ) );
    }
    else if(vMode == "15-DAY")
    {
        opt.noOfDays = 14;
    }
    else
    {
        opt.startDate.moveToDayOfWeek(1);
        opt.noOfDays = 7;
    }    
    me.generateTimeSheet("", opt);
}

/**
 * This Method Makes the Divisino in perticular structure
 * for displaying in a cell
 * @param dayObj the Data Data Object fot the Date
 * @param pCategory the Category thet the Div indicates (like TNE,GUI, etc..)
 * @param projId the Project Id
 */
TimeSheet.prototype.makeCellDiv = function(dayObj,pCategory,projId)
{
    var obj = null;
    var ind = -1;
    // Searching for current Project ID in the Entire Day Data Object
    for(var i=1;i<dayObj.length;i++)
    {
        if(dayObj[i].PID == projId)
            obj = dayObj[i];
    }
    
    // When The Specified Project Data Not found then Return 
    if(obj == null)
        return "";
    
    for(i=0;i<obj.WO.length;i++)
    {
        if(obj.WO[i] == pCategory)
            ind = i;
    }
    
    //alert("Project Found At : "+ind);
    if(ind < 0)
        return "";
        
    //var div = document.createElement('div');    
    var content = "";    
    content = "<div style='font-size:13px'>";
    content += ("<span>"+obj.WH[ind]+"</span>");    
    
    if(obj.TD[ind])
    {
        content += ("<div style='display:none'>");
        content += "Tasks Done";
        content += "<ol>";
        for(i=0;i<obj.TD[ind].length;i++)
        {
            content += ("<li>"+obj.TD[ind][i]+"</li>");
        }
        content += "</ol>";
        content += "</div>";
        
    }
    
    if(obj.TP[ind])
    {
        content += "<div style='display:none'>";
        content += "Tasks Planned";
        content += "<ol>";
        for(i=0;i<obj.TP[ind].length;i++)
        {
            content += ("<li>"+obj.TP[ind][i]+"</li>");
        }
        content += "</ol>";
        content += "</div>";
    }
    content += "</div>";
    return content;
}


/**
 * This Method Makes the Data Object from the Given HTML Div Element
 * this method does the Anti work of TimeSheet.makeCellDiv(obj);
 */
TimeSheet.prototype.makeObj = function(pDiv)
{
    var ME = this;
    //alert(pDiv);
    
    var obj = {
        date : null,
        hoursWorked:0,
        workedOn : [],        
        tasksDone:[],
        tasksPlanned:[]
    };    
    
    var selDate = ME.getSelectedDate();
    //alert(selDate);
    obj.workedOn = ME.getSelectedCategori();        
    
    //alert(pDiv);
    
    //selDate = Date.parse(selDate.innerHTML);
    //selDate = selDate.getDateAsPlainText();
    
    obj.date = selDate;
    
    obj.hoursWorked = parseFloat($(pDiv).find('span')[0].innerHTML);
    
    //alert(selDate);
    var divs = $(pDiv).find('div');
    var tasks = [];
    var tD = "";
    var tP = "";
    
    $(divs[0]).find('li').each(function()
    {
        obj.tasksDone.push(this.innerHTML);
        tD += (this.innerHTML+"\n");
    });
    $(divs[1]).find('li').each(function(){
        obj.tasksPlanned.push(this.innerHTML);
        tP += (this.innerHTML+"\n");
    });    
    
    //ME.modalDialog.setDefaultData([obj.hoursWorked,tD,tP]);
    
    return obj;
}

/**
 * This MEthod Used to make the Day Info div of the
 * Given Day Object
 * this Method Computes the Hours Spended on Every Project
 */
TimeSheet.prototype.makeDayInfoDiv = function(dayObj)
{
    if(dayObj.length<2)
    {
        return "Not booked yet!";
    }
        
    var cnt = "<table class='TSinfoTab'>";
    var hours;
    var projObj;
    cnt += "<tr><th>Projects</th><th>Hours</th></tr>";
    for(var i=1;i<dayObj.length;i++)
    {
        hours = 0;
        projObj = dayObj[i];
        for(var j=0;j<projObj.WH.length;j++)
        {
            hours += parseFloat(''+projObj.WH[j]);
        }
        cnt += "<tr><td>"+projObj.PID+"</td><td>"+hours+"</td></tr>";
    }
    cnt += "</table>";
    return cnt;
}


/**
 * This Method Used to hilight the Time Sheet cells on the
 * Specified Date
 */
TimeSheet.prototype.hilightTimeSheetOn = function(pDate)
{
    var ME = this;
    pDate = !pDate?new Date():pDate;
    //alert("Highlighting On : "+pDate);
    var d;
    var ind = -1;
    $(ME.sheetTable).find('thead th').each(function(index)
    {
        d = Date.parse($(this).attr('key'));
        if(d != null && d.equalsIgnoreTime(pDate))
        {
            //alert(d+"   "+pDate);
            ind = index-2;
        }
    });    
    //ind =- 1;
    //alert("Index is :"+ind);
    
    if(ind<0)
        return;    
    
    var cell;
    $(ME.sheetTable).find('tbody tr').each(function(){
        cell = $(this).find('td')[ind];
        $(cell).removeClass('satuarday');
        $(cell).removeClass('sunday');
        $(cell).addClass('toDay');        
    });
    $(ME.sheetTable).find('thead tr').each(function(){
        cell = $(this).find('td')[ind];
        $(cell).removeClass('satuarday');
        $(cell).removeClass('sunday');
        $(cell).addClass('toDay');        
    });
//alert('Time Sheet Will be Hilight on : '+pDate);
}


/**
 * This Method Hilights on the Week Days of satuarday and sunday
 */
TimeSheet.prototype.hilightWeekDays = function()
{
    var ME = this;
    var d;
    $(ME.sheetTable).find('thead th:gt(1)').each(function(index)
    {
        //alert(this.innerHTML);
        d = Date.parse($(this).attr('key'));
        switch(d.getDay())
        {
            case 6:
                var cell;
                $(ME.sheetTable).find('tbody tr').each(function(){
                    cell = $(this).find('td')[index];
                    $(cell).addClass('satuarday');
                });
                $(ME.sheetTable).find('thead tr').each(function(){
                    cell = $(this).find('td')[index];
                    $(cell).addClass('satuarday');
                });
                break;
            case 0:
                $(ME.sheetTable).find('tbody tr').each(function(){
                    cell = $(this).find('td')[index];
                    $(cell).addClass('sunday');
                });
                $(ME.sheetTable).find('thead tr').each(function(){
                    cell = $(this).find('td')[index];
                    $(cell).addClass('sunday');
                });
                break;
        }
    //alert(d.getDay());        
    });    
}

/**
 * This Method Register the Current Time Sheet Object for
 * all the Listeners
 * Note: this method should be called every time the sheet is generated
 */
TimeSheet.prototype.registerTimeSheet = function(pTable)
{    
    var ME = this;
    
    // Registering the CLose Button Events
    //this.registerCloseBtn();
    
    var header = $(pTable).find('thead')[0];
    var body = $(pTable).find('tbody')[0];
    var foot = $(pTable).find('tfoot')[0];
    
    $(body).find('td').hover(function()
    {
        //$(this).addClass('hover');
        $(this).parent('tr').find('th:last').addClass('hover');
    },function()
    {    
        //$(this).removeClass('hover');
        $(this).parent('tr').find('th:last').removeClass('hover');
    });
    
    //if sheet Editable then only add Click Events       
    // Adding THe Click event
    $(body).find('td').click(function(evt)
    {        
        //alert($(this).css('height'));
        ME.activeCell = this;
        var obj = null;
        var key = $(this).attr('key');
        var keys = key.split(",");
        
        ME.activeCellData = {
            date:keys[0],
            projId:keys[1],
            phase:keys[2],
            index:keys[3]
        };        
        var dayObj = ME.getDateObjectOn(ME.activeCellData.date);
        // if the Day Object not Empty Then Only Check
        if(dayObj != null)
        {
            var status = dayObj[0].S;
            
            // Don't Restrict when Admin Mode == 1
            if(ME.mode!=1)
            {
                if(ME.submitStatus || status >= 1){                
                    alert("Your Time Sheet Submitted.\nYou Can not Edit Any More");
                    return;
                }
            }
        }
        // if the Day Object is Null then
        else{
            if(ME.mode!=1)
            {
                if(ME.submitStatus){                
                    alert("Your Time Sheet Submitted.\nYou Can not Edit Any More");
                    return;
                }
            }
        }
        
        $(ME.submitButton).removeAttr('disabled');
        //alert(ME.currentRowInd +" X "+ME.currentCellInd);
        // Getting Previous info
        if($(this).html().length>0)
        {            
            obj = {
                hoursWorked:this.innerHTML
            }
        }
        
        // Removing Before Adding To Body        
        $(ME.inputTextElement).remove();
        
        try{
            ME.registerInputElement(ME.inputTextElement);
            //$(this).html("").append(ME.inputTextElement);
            $(ME.sheetDiv).append(ME.inputTextElement);            
            $(ME.inputTextElement).css({
                'position':'absolute',
                'text-align':'center',
                width:$(this).outerWidth()-3,
                height:$(this).outerHeight()-3,
                padding:'0px'
            });
            $(ME.inputTextElement).offset($(this).offset());
            $(ME.inputTextElement).show().focus();
            $(ME.inputTextElement).val("");
        }catch(e){            
        }
        
        if(obj != null)
            $(ME.inputTextElement).val(obj.hoursWorked);
        
    }).dblclick(function(){
        return;
        //alert(this.cellIndex);        
        ME.currentCellInd = this.cellIndex;
        ME.currentRowInd = $(this).parent("tr")[0].rowIndex;        
        //alert(ME.getSelectedCategori());        
        //alert(ME.modalContent);
        ME.modalDialog.setContent(ME.modalContent);
        if($(this).html().length>2)
        {
            var obj = ME.makeObj($(this).find('div')[0]);
            //alert($.toJSON(obj));
            ME.modalDialog.setDefaultData([obj.hoursWorked,obj.tasksDone,obj.tasksPlanned]);
        }        
        ME.modalDialog.show();
    });    
    
    // Adding The Foot Table Cell Evetns
    $(foot).find('td').hover(function(evt)
    {
        var key = $(this).attr('key');
        var dayObj = ME.getDateObjectOn(key);
        if(dayObj != null)
        {
            $(ME.infoDiv).html(ME.makeDayInfoDiv(dayObj));
            $(ME.sheetDiv).append(ME.infoDiv);
            var pos = $(this).position();
            
            $(ME.infoDiv).css({
                //"left":pos.left,
                "top":pos.top-$(ME.infoDiv).outerHeight()
            });
            
            $(ME.infoDiv).animate({
                'margin-top':'-10px',
                "left":pos.left            
            }, 200, "linear", null);
        }
    },function(){
        $(ME.infoDiv).remove();
    });
}

/**
 * This emthod register the Events for the Input Element
 */
TimeSheet.prototype.registerInputElement = function(ele){
    var ME = this;    
    $(ele).attr({
        'type':'text'
    }).keydown(function(evt){
        var key = evt.keyCode;
        var newCell;
        switch(key){
            case 37:
                newCell = $(ME.activeCell).prev('td')[0];
                break;
            case 38:
                newCell = $(ME.activeCell).parent('tr').prev('tr').find('td')[ME.activeCellData.index];
                break;
            case 39:
                newCell = $(ME.activeCell).next('td')[0];
                break;
            case 40:
                newCell = $(ME.activeCell).parent('tr').next('tr').find('td')[ME.activeCellData.index];
                break;
        }
        
        // if New Cell Exited then Move
        if(newCell)
        {
            $(newCell).click();
            evt.preventDefault();
        }
        
        
        // preventing for Non Numeric Data
        if(key!=8 && key!=13 && key!=190 && key!=110 && (key<48 || key>57) && (key<96 || key>105))
            evt.preventDefault();
        
    }).change(function()
    {
        var h = $(this).val();
        $(this).remove();
        h = h.length<1?0:h;
        
        if(parseFloat(h)>24){
            alert("It's Impossible to Book more than 24 Hours");
            h = 0;
        }
        if(h.length < 1)
            return;        
        ME.modalDialog.setContent(ME.modalContent);
        ME.modalDialog.setDefaultData([h,"",""]);
        ME.modalDialog.onSubmit();         
    }).blur(function()
    {
        var h = $(this).val();
        $(this).remove();
        
        if(h.length < 1)
            return;
        ME.modalDialog.setContent(ME.modalContent);
        ME.modalDialog.setDefaultData([h,"",""]);
        ME.modalDialog.onSubmit();            
    }).click(function(evt){
        evt.stopPropagation();
    }).css({
        'width':'25px',
        'padding':'2'        
    });
}


/**
 * This Method Returns teh Current Selected date based on the Selected
 * cell
 */
TimeSheet.prototype.getSelectedDate = function(ind)
{
    if(!ind)
        ind = this.currentCellInd;        
    var cell = $(this.sheetTable).find('thead th')[ind];
    return $(cell).attr('key');
}

/**
 * This Method Returns the currented selected Tasl categorie
 * based on the selected cell
 */
TimeSheet.prototype.getSelectedCategori = function(ind)
{
    if(!ind)
        ind = this.currentRowInd;
    return $( $(this.sheetTable).find('tr')[ind] ).find('th')[0].innerHTML;
}

/**
 * This Merthod Used to generate the Report for the Specified
 * Employee to the for Purticular Project
 * with in the Specified Date Range
 * @param pDiv the Employee id
 * @param options the options oject is an Set of Properties Object
 */
TimeSheet.prototype.generateReport = function(pDiv,options)
{
    //alert('hi');
    var ME = this;
    // This Holds the Actual Data
    var actualData;
    var stackData = [];
    var chart = new google.visualization.ColumnChart(pDiv);
    var chartData = new google.visualization.DataTable();
    var chartOptions = {
        //width: 800, 
        height: 400,
        title: 'Employee Manhours Survey of '+pEmpId,
        animation: {
            duration: 1000,
            easing: 'in'
        }
    }
    
    // Handling The Chart Selection Events
    google.visualization.events.addListener(chart, 'select', function(){
        var selection = chart.getSelection();
        var row = selection[0].row;
        var col = selection[0].column;
        // alert(stackData.length);
        var cData = stackData[stackData.length-1];
        var pData = ME.reports.groupDataBy(cData[row], "project");
    // alert($.toJSON(pData));
    });
    
    var pEmpId = !options.empId?"%%":options.empId;
    var pProjectId = !options.projectId?"%%":options.projectId;
    var sDate = !options.startDate?null:options.startDate;
    var eDate = !options.endDate?null:options.endDate;
    
    //alert(pProjectId+"   "+pEmpId);
    function handler(jsonData)
    {
        var date,hours;
        actualData = jsonData;
        
        // Grouping The Data by Date Wise
        var projects = ME.reports.groupDataBy(jsonData, "project");
        
        stackData.push(projects);
        //alert("No of Objects are : "+jsonData.length);
        var projs = [];
        var proj = [];
        var tableData = [];
        for(var i=0;i<projects.length;i++)
        {
            hours = 0;
            var projGroupObj = projects[i];
            for(var j=0;j<projGroupObj.length;j++)
            {
                var projObj = projGroupObj[j];
                hours += ME.reports.sumAllWorkingHours(projObj);
            }                
            tableData[i] = [projGroupObj[0].PID,hours];
        }
        
        chartData = new google.visualization.DataTable();
        chartData.addColumn('string','Project');
        chartData.addColumn('number','Hours');
        chartData.addRows(tableData);
        drawChart(chartData, chartOptions);
    }    
    /**
     * This method is Used to Draw the Chaert with the Specified Data And Optioins
     */
    function drawChart(chartData,chartOpt)
    {        
        chart.draw(chartData,chartOpt);
    }
    
    options.sDate = !options.sDate?new Date().moveToFirstDayOfMonth():options.sDate;
    options.eDate = !options.eDate?new Date().moveToLastDayOfMonth():options.eDate;
    
    //alert($.toJSON(options));
    
    this.retriveTimeDataFor(options, handler);
}

/**
 * This Method Computes the All Working Hours in a Particular
 * Day object
 */
TimeSheet.prototype.sumAllHours = function(dayObj)
{
    var hours = 0;
    if(dayObj == null)
        return 0;
    for(var i=1;i<dayObj.length;i++)
    {
        var projObj = dayObj[i];
        hours += this.reports.sumAllWorkingHours(projObj);
    }
   
    return hours;
}

/**
 * This Method used to round the Given Number
 */
TimeSheet.prototype.round = function(v,p)
{
    p = !p?1:p;
    var sign = v<0?-1:1;
    var val = sign * v;
    var ip = parseInt(""+val);
    var fp = val - ip;
    fp *= Math.pow(10, p);
    fp = parseInt(""+fp);
    return sign * parseFloat(ip+"."+fp);        
}


/**
 * This Method Returns the Weekly Status data for
 */
TimeSheet.prototype.getWeeklyStatusData = function(options,handler){    
    var ME = this;
    //alert($.toJSON(options));
    ME.retriveTimeDataFor(options,function(data){
        //$('#myDiv').html($.toJSON(data));
        if(data.length<1){
            handler(null);
            return;
        }
        
        try{
            var employees = ME.reports.groupByEmployee(data);
        //alert('Employees : '+employees[0][0][0].EID);
        }catch(e){
            alert(e);
        }
        
        var emps = [];
        var dayObj;
        var hours;
        var gData = [];
        var obj;
        for(var i=0;i<employees.length;i++)
        {
            obj =  {};
            hours = 0;
            obj.empId = employees[i][0][0].EID;
            emps.push(obj.empId);
            obj.status = employees[i][0][0].S;
            obj.approveStatus = employees[i][0][0].S;
            for(var j=0;j<employees[i].length;j++){
                dayObj = employees[i][j];
                hours += ME.sumAllHours(dayObj);
            }
            obj.hours = hours;
            gData.push(obj);                             
        }
        new EmpList(emps, function(data){
            for(var i=0;i<gData.length;i++){
                //alert(gData[i].empId+ "  "+data[i].empName );
                gData[i].empName = data[i].empName;
            }            
            handler({
                info:options,
                data:gData
            });
        });
        
        
    //alert($.toJSON(gData));
    });
}


TimeSheet.prototype.getMonthlyStatusData = function(options,handler){
    //alert("in getMonthlyStatusData");
    var sD = options.sDate.toString("yyyy-MM-dd");
    var eD = options.eDate.toString("yyyy-MM-dd");
    
    // alert(sD);
    // alert(eD);
    
    var query = "salaryHandler.do?subMode=1&sDate="+sD+"&eDate="+eD;
    
    $.get(query, null, function(data){
        handler(data);
    });
    
}


/**
 * This Method Generates the weekly Status of at the Given Division Element
 */
TimeSheet.prototype.generateWeeklyStatus = function(div,options){    
    var ME = this;
    var sd = new Date();
    var ed = new Date();
    sd.moveToFirstDayOfWeek();
    ed.moveToLastDayOfWeek();
    
    options = !options?{
        sDate:sd,
        eDate:ed
    }:options;
    var controlDiv = $('.controlDiv',div);
    var statusDiv = $('.statusDiv',div);    
    
    $(controlDiv).find('.control').each(function(ind)
    {
        $(this).click(function()
        {       
            Mask.showMask(statusDiv, {});
            switch(ind)
            {
                case 0:
                    //alert('hi');
                    options.sDate.addDays(-7);
                    options.eDate.addDays(-7);
                    //alert($.toJSON(options));  
                    
                    break;
                case 1:
                    options.sDate.addDays(7);
                    options.eDate.addDays(7);
                    break;
            }
            ME.getWeeklyStatusData(options,
                function(data){                    
                    makeStatusTable(data);
                    Mask.hideMask(statusDiv);
                });            
        });
    });
    
    ME.getWeeklyStatusData(options,
        function(data)
        {            
            makeStatusTable(data);
            Mask.hideMask(statusDiv);
        });
    
    
    function makeStatusTable(data){
        if(data == null){
            $(statusDiv).html("<h4 style='color:red'>No one submitted time sheet for this Week</h4>");
            return;
        }
        
        var d = data.data;  
        //alert("data in status table : "+d[0].empId);
        var info = data.info;
        $(statusDiv).html("");        
        var contentDiv = document.createElement('div');
        var table = document.createElement('table');
        $(contentDiv).css({
            'max-height':'400px',
            'overflow':'auto'
        });
        $(table).attr({
            width:'100%',            
            border:'1px',
            'class':'dataTable'
        });
        
        
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        var tfoot = document.createElement('tfoot');
        
        $(thead).html("<tr class='border10'><th colspan=5>Time Sheet Status From<br/>("+info.sDate.toString('dd-MMM-yyyy')+" to "+info.eDate.toString('dd-MMM-yyyy')+" )</th></tr>");
        $(thead).append("<tr><td colspan='5' style='padding:0px;text-align:right;'>Search Employees : <input type='text' name='inputName' /><img src='res/images/icons/search_icon.png' style='position:relative;top:6px'/></td></tr>");
        $(thead).append("<tr><th>Employee Name</th><th>Total Hours</th><th>Submission Status</th><th>Approval Status</th><th>Time Sheet</th></tr>");                
        
        var row;
        var approve;
        var viewSheet;
        for(var i=0;i<d.length;i++)
        {
            approve = "";
            viewSheet = "";
            if(d[i].status >= 1)
            {
                if(d[i].approveStatus != 2){
                    approve = "<label class='labelButton approveBtn' style='display:block'>Approve It</label>";
                }
                else{
                    approve = "<span style='color:green;font-weight:bold'>Approved</span>";
                }
                viewSheet = "<label class='labelButton viewBtn' style='display:block'>View Sheet</label>";
            }
            row = document.createElement('tr');
            $(row).html("<td key='"+d[i].empId+"'>"+d[i].empName+"</td><td>"+d[i].hours+"</td>"+
                "<td>"+(d[i].status==0?"<span style='color:red'>Not Submitted<span>":"<span style='color:green'>Submitted<span>")+"</td>"+                
                "<td style='text-align:center;padding:0px;margin:0px'>"+approve+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+viewSheet+"</td>");
            $(tbody).append(row);
        }        

        $(table).append(thead).append(tbody);
        
        
        $(contentDiv).append(table);
        $(statusDiv).append(contentDiv)
        .append("<label class='labelButton approveAllBtn' style='display:inline-block;text-align:center'>Approve All</label>");
               
        $(table).find('.approveBtn').click(function()
        {
            //alert("Approving");
            //return;
            var td = $(this).parent('td')[0];
            //alert(td);
            var r = $(this).parents('tr')[0];
            var empId = $(r).find('td:first').attr('key');
            $(this).remove();
            $(td).html("<img src='res/images/loading1.gif' width=24/>");            
            ME.approveSheetFor([empId], info,function(){
                //alert('Sheet Successfully Approved');
                $(td).html("<span style='color:green;font-weight:bold'>Approved</span>");
            });
        });
        
        $(table).find('.viewBtn').click(function()
        {
            //return;
            //alert("Approving");
            //return;
            var td = $(this).parent('td')[0];
            //alert(td);
            var r = $(this).parents('tr')[0];
            var empId = $(r).find('td:first').attr('key');
            var empName = $(r).find('td:first').html();

            var overlayDiv = document.createElement('div');
            var div = document.createElement('div');            
            
            $(overlayDiv).css({
                'position':'absolute',
                'left':'0',
                'top':'0',
                'width':'100%',
                'height':'100%',
                'background':'grey'
            }).attr({
                'tabindex':'0' // for Key board Interaction
            });
            
            $(div).css({
                'position':'fixed',
                'width':'800px',
                'height':'400px',
                'left':'0px',
                'top':'0px'
            }).attr({
                'tabindex':'1'
            }).keydown(function(evt){
                if(evt.keyCode == 27)
                    $(overlayDiv).click();
            });
            
            $('body').append(overlayDiv);
            
            $(overlayDiv).fadeTo(200,0.8,null).click(function(){
                $(overlayDiv).fadeOut(200,function(){
                    $(overlayDiv).remove();
                });
                $(div).slideUp(500,'',function(){
                    $(div).remove()
                });
            }).keydown(function(evt){
                if(evt.keyCode == 27)
                    $(overlayDiv).click();
            });
            
            $.get("TimeSheet.jsp",{
                empId:empId,
                empName:empName,
                mode:1,
                sDate:sd.toString('yyyy-MM-dd'),
                eDate:ed.toString('yyyy-MM-dd')
            },function(data)
            {
                $('body').append(div);
                $(div).append(data).slideDown(500,null);                
                $(div).css({
                    'left':($(window).width()-$(div).outerWidth())/2
                });
                // Getting focus for Key Board Events
                $(overlayDiv).focus();
            });            
        });
        
        
        $(statusDiv).find('.approveAllBtn').click(function()
        {
            var count = $(table).find('.approveBtn').length;
            if(count == 0)
                return;
            var confirmed = window.confirm("Are you sure to approve all Employee Time Sheets?");
            if(confirmed){
                $(table).find('.approveBtn').click();
            }            
        });
        
        $(table).find('input[name="inputName"]').keyup(function(){
            var val = $(this).val().toLowerCase();
            tbody = $('tbody',table);
            $(tbody).find('tr').show();
            $(tbody).find('tr').each(function(ind){
                var cellCnt = $(this).find('td')[0];
                cellCnt = $(cellCnt).html().toLowerCase();
                if(cellCnt.indexOf(val)<0)
                {
                    $(this).hide();
                }
            });
        });
        
    //$(statusDiv).append(statusDiv);
    }
}

/**
 * This Method Generates the monthly Status of at the Given Division Element
 */
TimeSheet.prototype.generateMonthlySalaryStatus = function(div,options){    
    var ME = this;
    
    var sd = new Date();
    var ed = new Date();
    
    sd.moveToFirstDayOfMonth();
    ed.moveToLastDayOfMonth();
    
    /*
     * moving to last month date ranges
     */
    sd.moveToPrevMonth();
    sd.moveToLastDayOfMonth();
    sd.moveToFirstDayOfWeek();
    // alert(sd);
    
    
    
    ed.moveToLastDayOfMonth();
    ed.moveToFirstDayOfWeek();
    ed.moveBy(-1);
    //alert(ed);
   
    options = !options?{
        sDate:sd,
        eDate:ed
    }:options;
    //alert(options.sDate);
    //alert(options.eDate);
    var controlDiv = $('.controlDiv',div);
    var statusDiv = $('.statusDiv',div);    
    
    $(controlDiv).find('.control').each(function(ind)
    {
        $(this).click(function()
        {        
            Mask.showMask(statusDiv, {});
            switch(ind)
            {
                case 0:
                    //alert('hi');
                    //options.sDate.addDays(-7);
                    //options.eDate.addDays(-7);
                    sd.moveToPrevMonth();
                    sd.addDays(-1);
                    sd.moveToLastDayOfMonth();
                    sd.moveToFirstDayOfWeek();
                    
                    ed.moveToPrevMonth();
                    ed.moveToLastDayOfMonth();
                    ed.moveToFirstDayOfWeek();
                    ed.moveBy(-1);
                    //alert(sd+" "+ed);
                    //alert($.toJSON(options)); 
                   
                    break;
                case 1:
                    //options.sDate.addDays(7);
                    //options.eDate.addDays(7);
                    sd.moveToNextMonth();
                    sd.moveToLastDayOfMonth();
                    sd.moveToFirstDayOfWeek();
                    
                    ed.moveToNextMonth();
                    ed.moveToLastDayOfMonth();
                    ed.moveToFirstDayOfWeek();
                    ed.moveBy(-1);
                    options.sDate = sd;
                    options.eDate = ed;
                    //alert(sd+" "+ed);
                    break;
            }
            ME.getMonthlyStatusData(options,
                function(data){ 
                   
                    makeStatusTable(data);
                    Mask.hideMask(statusDiv);
                });            
        });
    });
    
    ME.getMonthlyStatusData(options,
        function(data)
        {        
            makeStatusTable(data);
            Mask.hideMask(statusDiv);
        });
    
    
    function makeStatusTable(data){
        
        data = eval("("+data+")");
        
        if(data == null || data == ""){
            $(statusDiv).html("<h4 style='color:red'>Administrator not submitted Salary sheets for this month</h4>");
            return;
        }
        
        // alert(data);
        
        var d= data;        
        //alert(d.length);
        // alert(d[0].S);
        //var info = data.info;
        $(statusDiv).html("");        
        var contentDiv = document.createElement('div');
        var table = document.createElement('table');
        $(contentDiv).css({
            'max-height':'400px',
            'overflow':'auto'
        });
        $(table).attr({
            width:'100%',            
            border:'1px',
            'class':'dataTable'
        });
        
        
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        var tfoot = document.createElement('tfoot');
        
        var s = options.sDate.toString("dd-MMM-yyyy");
        var e = options.eDate.toString("dd-MMM-yyyy");
        
        //        $(thead).html("<tr class='border10'><th colspan=7>Pay Slips <br> ( "+(d[0].sD).toString('dd-MMM-yyyy')+" to "+(d[0].eD).toString('dd-MMM-yyyy')+" ) </th></tr>From ");
        $(thead).html("<tr class='border10'><th colspan=8>Pay Slips <br> ( "+s+" to "+e+" ) </th></tr>From ");
        $(thead).append("<tr><td colspan='8' style='padding:0px;text-align:right;'>Search Employees : <input type='text' name='inputName' /><img src='res/images/icons/search_icon.png' style='position:relative;top:6px'/></td></tr>");
        $(thead).append("<tr><th>Employee\n Name</th><th>Designation</th><th>Gross Salary</th><th>Net Salary</th><th>Professional\n Tax</th><th>Income\n Tax</th><th>Approval Status</th><th>View Pay Slip</th></tr>");                
                
        var row;
        var approve;
        var viewSheet;
        for(var i=0;i<d.length;i++)
        {
            approve = "";
            viewSheet = "";
            if(d[i].S >= 1)
            {
                if(d[i].S != 2){
                    approve = "<label class='labelButton approveBtn' style='display:block'>Approve</label>";
                }
                else{
                    approve = "<span style='color:green;font-weight:bold'>Approved</span>";
                }
                viewSheet = "<label class='labelButton viewBtn' style='display:block'>View Slip</label>";
            }
            row = document.createElement('tr');
            $(row).html("<td key='"+d[i].empId+"'>"+d[i].empName+"</td><td>"+d[i].des+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+d[i].gSal+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+d[i].nSal+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+d[i].pT+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+d[i].iT+"</td>"+
                //                "<td>"+(d[i].S==0?"<span style='color:red'>Not Submitted<span>":"<span style='color:green'>Submitted<span>")+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+approve+"</td>"+
                "<td style='text-align:center;padding:0px;margin:0px'>"+viewSheet+"</td>");
            $(tbody).append(row);
        }        

        $(table).append(thead).append(tbody);
        $(contentDiv).append(table);
        $(statusDiv).append(contentDiv)
        .append("<label class='labelButton approveAllBtn' style='display:inline-block;text-align:center'>Approve All</label>");
        $(table).find('.approveBtn').click(function()
        {
            //return;
            var td = $(this).parent('td')[0];
            //alert(td);
            var r = $(this).parents('tr')[0];
            var empId = $(r).find('td:first').attr('key');
            $(this).remove();
            $(td).html("<img src='res/images/loading1.gif' width=24/>");            
            $.get('salaryHandler.do?subMode=2&sStatus=2&empId='+empId+"&sD="+sd.toString('yyyy-MM-dd'), null, function(da){
                if(da == 'true'){
                    $(td).html("<span style='color:green;font-weight:bold'>Approved</span>");
                }
                    
            });
            
            
            
        //ME.approveSheetFor([empId], info,function(){
        //alert('Sheet Successfully Approved');
        //   $(td).html("<span style='color:green;font-weight:bold'>Approved</span>");
        // });
        });
        
        $(table).find('.viewBtn').click(function()
        {
            //return;
            //alert("Approving");
            //return;
            var td = $(this).parent('td')[0];
            //alert(td);
            var r = $(this).parents('tr')[0];
            var empId = $(r).find('td:first').attr('key');
            var empName = $(r).find('td:first').html();

            var overlayDiv = document.createElement('div');
            var div = document.createElement('div');
            
            
            $(overlayDiv).css({
                'position':'absolute',
                'left':'0',
                'top':'0',
                'width':'100%',
                'height':'100%',
                'background':'grey'
            }).attr({
                'tabindex':'0' // for Key board Interaction
            });
            
            $(div).css({
                'position':'fixed',
                'width':'800px',
                'height':'400px',
                'left':'0px',
                'top':'0px'
            }).attr({
                'tabindex':'1'
            }).keydown(function(evt){
                if(evt.keyCode == 27)
                    $(overlayDiv).click();
            });
            
            $('body').append(overlayDiv);
            
            $(overlayDiv).fadeTo(200,0.8,null).click(function(){
                $(overlayDiv).fadeOut(200,function(){
                    $(overlayDiv).remove();
                });
                $(div).slideUp(500,'',function(){
                    $(div).remove()
                });
            }).keydown(function(evt){
                if(evt.keyCode == 27)
                    $(overlayDiv).click();
            });
            //alert(data[0].sD);
            //alert(data[0].eD);
            $.get("salaryHandler.do?subMode=1",{
                empId:empId,
                empName:empName,
                //                sDate:data[0].sD,
                //                eDate:data[0].eD
                sDate:sd.toString('yyyy-MM-dd'),
                eDate:ed.toString('yyyy-MM-dd')
            },function(data)
            {
                //alert(data);
                //$(div).html(ViewPaySlip(data));
                $('body').append(div);
                $(div).append(ViewPaySlip(data)).slideDown(1000,null);                
                $(div).css({
                    'left':($(window).width()-$(div).outerWidth())/2,
                    'width':700
                });
                // Getting focus for Key Board Events
                $(overlayDiv).focus();
            });            
        });
        
        
        $(statusDiv).find('.approveAllBtn').click(function()
        {
            var count = $(table).find('.approveBtn').length;
            if(count == 0)
                return;
            var confirmed = window.confirm("Are you sure to approve all Employee Time Sheets?");
            if(confirmed){
                $(table).find('.approveBtn').click();
            }            
        });
        
        $(table).find('input[name="inputName"]').keyup(function(){
            var val = $(this).val().toLowerCase();
            tbody = $('tbody',table);
            $(tbody).find('tr').show();
            $(tbody).find('tr').each(function(ind){
                var cellCnt = $(this).find('td')[0];
                cellCnt = $(cellCnt).html().toLowerCase();
                if(cellCnt.indexOf(val)<0)
                {
                    $(this).hide();
                }
            });
        });
        
    //$(statusDiv).append(statusDiv);
    }
}

function ViewPaySlip(data){
    //    alert(data);
    data = eval("("+data+")");
    // alert(data[0].empName);
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
    +"<tr><td style='width: 150px;' valign='top'><a href='#'><img src='res/images/logo.png' width='150'></a></td><td colspan='3' align='left' style='text-align:center;'><b>Prarohana Enterprises Pvt. Ltd</b></br>401 Namitha's Fort,  Panchavati Colony, </br>Manikonda, Hyderabad - 500 089</br>ANDHRA PRADESH</br></td></tr>"
    +"<tr><td colspan='4' align='center'><hr></td></tr>"
    +"<tr><td colspan='4' align='center'><b>PAY SLIP</b></td></tr>"
    +"<tr><td colspan='4'><hr></td></tr>"
    +"<tr><td colspan='2'>Name of The Employee</td><td colspan='2'>"+data[0].empName+"</td></tr>"
    +"<tr><td colspan='2'>Designation</td><td colspan='2'>"+data[0].des+"</td></tr>"
    +"<tr><td colspan='2'>Pay Slip for the period of</td><td colspan=2>&nbsp;<span style='color:#50A23A;'><b>"+data[0].sD+"</b></span>&nbsp;To&nbsp;<span style='color:#50A23A;'><b>"+data[0].eD+"</b></span></td></tr>"
    +"<tr><th colspan='2'>Earnings</th><th colspan='2'>Deductions</th></tr>"
    +"<tr><td>Basic & DA</td><td style='width:180px;'>"+data[0].basic+"</td><td style='width:150px;'>Provident Fund</td><td>-</td></tr>"
    +"<tr><td>HRA</td><td>"+data[0].hra+"</td>"
    +"<td>Professional Tax</td><td>"+data[0].pT+"</td>"
    +"</tr>"
    +"<tr><td>Conveyance</td><td>"+data[0].con+"</td>"
    +"<td>Income Tax</td><td>-</td>"
    +"</tr>"
    +"<tr><td>Special Allowance</td><td>"+data[0].sa+"</td>"
    +"<td>Loss of pay for not working</td><td>"+data[0].LOP+"</td></tr>"
    +"<tr><td>Other Suppl. Allowance</td><td>"+data[0].oa+"</td></tr>"
    +"<tr><td>Total Earnings</td><td><b>"+data[0].tEarn+"</b></td><td>Total Deduction</td><td><b>"+data[0].ded+"</b></td></tr>"

    +"<tr><th colspan='2'>Hours & Leaves</th><td></td><td></td></tr>"
    +"<tr><td>Total Hours</td><td>"+data[0].totH+"</td><td></td><td></td></tr>"
    //    +"<tr><td>Avg Working Hours Per Month</td><td>234.77</td><td></td><td></td></tr>"
    +"<tr><td>Total Hours Worked</td><td>"+data[0].wH+"</td><td>Net Salary</td><td class='total'><b>"+data[0].nSal+"</b></td></tr>"
    +"<tr><td>Vacations Used</td><td>"+data[0].tuV +"/"+data[0].tV+"</td>"
    +"<tr></tr>"
    +"<tr><td>Sick Leaves Used</td><td>"+data[0].tS + "/5</td>"//here the vacations are fixed to 6
    +"<tr><td colspan='5' align='right'></td></tr>"
    +"<tr><td colspan='5' align='center' style='color:green;'><b>Computer generated report, Signature not required</b></td></tr>"
    
    +"</tbody>"
    // Body Block Ends Here
    +"<tfoot>"
    +"<tr><td colspan='4' style='text-align:right;color:red'><hr/>Currency Paid in (INR)</td></tr>"
    +"</tfoot>"
    +"</table>";   
    //alert(c);
    return c;
}



/**
 * This Method Approves the Time Sheet fot the Given Set of Users
 * on the Specvified Data Range
 */
TimeSheet.prototype.approveSheetFor = function(empIds,options,handler){
    //alert("Hello Approving Sheeet : "+empIds[0]);
    //return;
    var ME = this;
    var sheetData = [];
    ME.retriveTimeDataFor({
        emps:empIds,
        sDate:options.sDate,
        eDate:options.eDate
    }, function(data){
        var dayObj;
        ME.unSavedData = [];
        //alert("retrived Data Is :"+data);
        for(var i=0;i<data.length;i++)
        {
            dayObj = data[i];
            //ME.unSavedData.push(dayObj[0].date);
            // Updating The Status            
            dayObj[0].S = 2;            
            sheetData.push(dayObj);
        }
        //alert("Un Saved Data On : "+ME.unSavedData);
        
        ME.saveSheetData(function(){
            ME.unSavedData = [];
            handler(true);
        },{
            empId:empIds[0],
            data: sheetData
        });        
    });
}

/**
 * This Method Makews the Time Sheet Div As per the Required for The Time Sheet
 * and Returns the Created Div
 */
TimeSheet.prototype.makeTimeSheetDiv = function()
{
    var div = document.createElement('div');
    $(div).attr({
        'class':'timeSheetDiv'
    });
    
    var c = '<div id="timeSheetControls">'+    
    '<span class="control notch left_border">&nbsp;</span>'+
    '<span class="button1 control controller" title="Goto Today" style="display:none">Today</span>'+
    '<span class="button1 control controller">Current Week</span>'+
    '<span class="button1 control controller">Two Weeks</span>'+
    '<span class="button1 control controller">Monthly</span>'+
    '<span class="button1 control controller" title="Previous"><</span>'+
    '<span class="button1 control controller" title="Next">></span>'+
    '<span class="control notch right_border">&nbsp;</span>'+
    '</div>'+
    '<div id="timeSheetHeader"></div>'+
    '<div id="timeSheetBody" style="overflow: auto"></div>';
    div.innerHTML = c;
    return div;
}