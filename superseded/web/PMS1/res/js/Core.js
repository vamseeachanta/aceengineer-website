/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * This Method Clones THe date objects of itself
 */
Date.prototype.clone = function()
{
    return new Date(this);
}

/**
 * This Method Moves the Curent Date Object to the next month of the sdame Date
 * Ex : current Date is 24-Jan-2011 then this method moves this to 24-Feb-2011
 */
Date.prototype.moveToNextMonth = function()
{
    //var newDate = this.clone();
    this.setMonth(this.getMonth()+1);   
//return newDate;
}
/**
 * This Method Moves the Curent Date Object to the next month of the sdame Date
 * Ex : current Date is 24-Jan-2011 then this method moves this to 24-Feb-2011
 */
Date.prototype.moveToPrevMonth = function()
{
    //var newDate = this.clone();
//    if(this.getMonth()==0){
//        this.setYear(this.getFullYear()-1);
//        this.setMonth(11);
//    }
//    else
        this.setMonth(this.getMonth()-1);   
//return newDate;
}

/**
 * This Method moves the current data to the specified no of days
 */
Date.prototype.moveBy = function(days)
{
    this.setDate(this.getDate()+days);
}

/**
 * This Method Moves the Date to First day of the Year
 */
Date.prototype.moveToFirstDayOfYear = function()
{
    var d = new Date();
    d.setYear(this.getFullYear());
    d.setMonth(0, 1);
    return d;
}

Date.prototype.moveToLastDayOfYear = function()
{
    var d = new Date();
    d.setYear(this.getFullYear());
    d.setMonth(11, 31);
    return d;
}

/**
 * This Method Compares the given date object with the curretn date object
 * Note THis Method Ignors the Time when comparing
 */
Date.prototype.equalsIgnoreTime = function(pDate)
{
    //alert(this.getDate()+"   "+pDate.getDate());
    //alert(this.getMonth()+"   "+pDate.getMonth());
    //alert(this.getYear()+"   "+pDate.getYear());
    //alert(this.getDate()==pDate.getDate() && this.getMonth()==pDate.getMonth() && this.getYear()==pDate.getYear());
    return (this.getDate()==pDate.getDate() && this.getMonth()==pDate.getMonth() && this.getFullYear()==pDate.getFullYear());
}

/**
 * This Method returns the Date as the plain text
 * ex: 2011-12-24
 */
Date.prototype.getDateAsPlainText = function()
{
    return ( this.getFullYear()+"-"+ (this.getMonth()+1) +"-"+this.getDate() );
}

/**
 * This Method Moves to the First Day of the Week
 */
Date.prototype.moveToFirstDayOfWeek = function(){
    var d = this.getDay();
    this.addDays(-(d==0?6:d-1));
}
/**
 * This Method Moves to the Last Day of the Week
 */
Date.prototype.moveToLastDayOfWeek = function(){
    this.moveToFirstDayOfWeek();
    this.addDays(6);
}



var NCore = 
{
    /**
     * This Method Creates a Crossbrowser XML Request Object
     */
    makeXMLObject : function()
    {
        return new XMLHttpRequest();
    },
    
    /**
     * This Method Makes the Given division as the Closeble Divi
     */
    makeDivAsClosable : function(div,handler)
    {
        var closeBtn = document.createElement('span');
        $(closeBtn).addClass('closeBtn').html("");
        $(div).append(closeBtn);
                
        $(closeBtn).hover(function(){
            $(this).addClass('hover');
        },function(){
            $(this).removeClass('hover');
        }).click(function()
        {
            $(div).remove();
            if(handler){
                handler();
            }
        });
                
        $(div).hover(function(){
            $(closeBtn).show();
        },function(){
            $(closeBtn).hide();
        });
    }
}


/*
 * This Class for Alerting the Messages
 */
function Alert(options)
{
    this.overlayDiv = document.createElement('div');
    this.alertDiv = document.createElement('div');
    this.titleElement = document.createElement('p');
    this.contentDiv = document.createElement('div');
    this.controlsDiv = document.createElement('div');
    
    // When User Approves the Button */
    this.approveButton = document.createElement('button');
    this.cancelButton = document.createElement('button');
    /** This Object used to automatically Close the Alert */
    this.timer = null;
    this.isMouseDown = false;
    
    
    // Option Objects
    this.CSS = null;
    /** This Object is used to show the Title */
    this.showTitle = false;
    this.title = "AceEngineer";
    /** This Variable used to close the Alert Automatically -1 for never Close*/
    this.timeOut = -1;
    this.mode = -1;
    this.approveText = "Ok";
    this.cancelText = "Cancle";
    
    
    this.loadOptions(options);
    this.init();
}

/**
 * Thi Method is used to load the optioins from the 
 * parameter Options Object
 */
Alert.prototype.loadOptions = function(options)
{
    this.CSS = !options.CSS?null:options.CSS;
    this.title = !options.title?null:options.title;
    this.timeOut = !options.timeOut?-1:options.timeOut;
    this.mode = !options.mode?this.mode:options.mode;
    this.approveText = !options.approveText?this.approveText:options.approveText;
    this.cancelText = !options.cancelText?this.cancelText:options.cancelText;
    
//alert(this.timeOut);
}

/**
 * This Method initializes the Alert Object
 */
Alert.prototype.init = function()
{
    var ALERT = this;
    
    if(this.CSS == null)
    {
        $(this.alertDiv).css({
            'background':'#a8d2f5',
            '-webkit-border-radius':'10px',
            '-moz-border-radius':'10px',
            'border-radius':'10px',
            '-webkit-box-shadow':'5px 5px 5px black',
            '-moz-box-shadow':'5px 5px 5px black'
        });
        
        $(this.titleElement).css({
            'text-align':'center',
            'background': '#1470bc',
            'margin':'0px',
            'color':'white',
            
            '-webkit-border-radius': '10px 10px 0px 0px',
            '-moz-border-radius': '10px 10px 0px 0px',
            'border-radius': '10px 10px 0px 0px'
        });
        
        $(this.contentDiv).css({
            'padding':'10px'
        });
    }    
    $(this.titleElement).attr('class','title').css({
        'padding':'5px 20px',
        'margin':'0px',
        'cursor':'move'
    }).html(this.title);
    
    $(this.alertDiv).addClass(this.CSS);
    $(this.alertDiv).css('position','absolute');    
    
    $(this.contentDiv).attr('class','content');
    if(this.title!=null)
        $(this.alertDiv).append(this.titleElement);
    $(this.alertDiv).append(this.contentDiv);
    
    if(this.mode == "ALERT")
    {
        this.controlsDiv = this.makeControlsDiv("ALERT");
        $(this.alertDiv).append(this.controlsDiv);
    }
    else if(this.mode == "MESSAGE")
    {
        this.controlsDiv = this.makeControlsDiv("MESSAGE");
        $(this.alertDiv).append(this.controlsDiv);
    }
    
    // Adding The Element to Document
    $(document.body).append(this.alertDiv);
    $(this.alertDiv).hide();    
}

Alert.prototype.onApprove = function()
{
    this.hide();
}

Alert.prototype.onCancel = function()
{
    this.hide();
}

/**
 * This method makes the Controls Division of the
 * Specified Mode
 */
Alert.prototype.makeControlsDiv = function(pMode)
{
    var ME = this;
    
    var div = document.createElement('div');    
    $(this.approveButton).html(this.approveText).addClass("button").click(function(){
        ME.onApprove();
    });
    $(this.cancelButton).html(this.cancelText).addClass("button").click(function(){
        ME.onCancel();
    });
    
    $(div).css({
        'text-align':'right',
        padding:'5px'
    });
    
    $(div).find('.button').css({
        padding:'5px 10px'
    });
    
    $(div).append(this.approveButton);
    if(pMode == "ALERT")        
        $(div).append(this.cancelButton);
    
    return div;
}


/**
 * This Method Show the Alert Window with the Specified
 * Content
 */
Alert.prototype.show = function(content)
{    
    var ALERT = this;
    
    // setting the time out to automatically Close the Tooltip
    if(this.timeOut != -1)
    {
        this.timer = window.setTimeout(function(){
            ALERT.hide();
        }, this.timeOut);
    //alert('time out setted');
    }
    
    this.setContent(content);
    
    $(this.alertDiv).css({
        'left' : $(window).scrollLeft()+($(window).width()-$(this.alertDiv).width())/2,
        'top': $(window).scrollTop()+($(window).height()-$(this.alertDiv).height())/2,
        'display':'block'
    });
    //alert('Showing');
    $(this.alertDiv).stop().animate({
        marginTop: "10px", 
        opacity:1.0
    }, 1200);    
}

/**
 * This Metohd set the content to be shown on the Alert Dialog
 */
Alert.prototype.setContent = function(content)
{
    $(this.contentDiv).html(content);
}

Alert.prototype.hide = function()
{
    var ME = this;
    $(this.alertDiv).stop().animate({
        marginTop: "-50px", 
        opacity: 0.0
    }, 1000,function(){
        $(ME.alertDiv).css({
            'display':'none'
        })
    });
    
    try{
        window.clearTimeout(this.timer);
    }catch(e){}
}

//###################################### Alert Class Ends Here #############






/**
 *Tooltip Class for applying the Tooltips for an Element
 *Usage:
 *var toolTip = new  ToolTip("setof Fields","{options}");
 *<table>
 *  <tr><th>variable</th><th>Values</th></tr>
 *</table>
 */            
function ToolTip(pFields,options)
{
    this.alertDialog = null;
    this.title = "";
    this.divCSS = null;
    this.fields = null;
    this.heading = "";
    this.isActive = false;
    
    // Options Objects
    this.timeOut = -1;
                
    this.initOptions(options);
    this.init();
    
    
    this.registerField(this.fields);
}
            
ToolTip.prototype.initOptions = function(options)
{
    if(!options)
        return;
                
    this.timeOut = !options.timeOut?this.timeOut:options.timeOut;
    this.heading = !options.heading?"AceEngineer":options.heading;
    this.divCSS = !options.divCSS?null:options.divCSS;    
}
            
/**
 * This Method to Initialize the Objects
 */
ToolTip.prototype.init = function()
{
    this.alertDialog = new Alert({
        CSS:this.divCSS,
        timeOut:this.timeOut
    });
}
            
/**
 * This Method Register a new Field
 */
ToolTip.prototype.registerField = function(fields)
{
    if(fields == null)
        return;
    // first Filering the Elements for Tooltips
    fields = this.filterElements(fields);
    
    var ME = this;
    var div = document.createElement('div');
    $(fields).hover(function(evt)
    {
        ME.title = $(this).attr('title');
        $(this).removeAttr('title');
        //alert(ME.title);
        var pos = $(this).offset();
        $(div).html(ME.title);
        //alert(div.innerHTML);
        $(div).css({
            'font-size':'12px'
        });
        //$(div).find('*').show();
        ME.alertDialog.show(div.innerHTML);
        
        $(ME.alertDialog.alertDiv).css({
            left:evt.clientX+10,
            top:pos.top+$(this).height()
        });
        ME.isActive = true;
    },function(){
        $(this).attr('title',ME.title);
        ME.alertDialog.hide();
        ME.isActive = false;
    });
    
    $(fields).mousemove(function(evt){                    
        if(ME.isActive)
        {
            $(ME.alertDialog.alertDiv).css({
                left:evt.clientX+10
            });
        }
    });
}
            
/**
 * This Method Filters all the elements given
 * and returns only the Elements have title Attributes
 */
ToolTip.prototype.filterElements = function(elements)
{
    var newList = [];
    $(elements).each(function()
    {
        if($(this).attr('title') && $(this).attr('title').length>0)
            newList.push(this);                    
    });
    return newList;
}

//###################################################
//ToolTip Class Ends Here
//###################################################


/**
 * This Method Removes the Duplicate Elements from the Array and returns
 * the New cutt off Array
 */
Array.prototype.removeDuplicates = function()
{
    var ary = [];
    var found = false;
    for(var i=0;i<this.length;i++)
    {
        found = false;
        for(var j=0;j<=i;j++)
        {
            if(i!=j && this[i] == this[j])
            {
                found = true;
                break;
            }                
        }
        if(!found)
            ary.push(this[i]);
    }
    return ary;
}

/**
 * This Method Removes the Empty Strings from the current Array
 */
Array.prototype.removeEmptyStrings = function()
{
    var newArray = [];
    for(var i=0;i<this.length;i++)
    {
        if(this[i]!=null && this[i].length>0)
            newArray.push(this[i]);
    }
    return newArray;
}

/**
 * Implementing the indexOf Method If The Broweser Dosen't Support Implectily
 * (IE)
 */
Array.prototype.indexOf = function(obj)
{
    for(var i=0; i<this.length; i++){
        if(this[i]==obj){
            return i;
        }
    }
    return -1;
}

/**
 * This Method Append all the Elements to the Current Array Object
 */
Array.prototype.pushAll = function(array)
{
    for(var i=0;i<array.length;i++)
        this.push(array[i]);    
}

/**
 * This Method Removes the Specified Element from the Given Array
 * and returns the modified Array
 */
Array.prototype.removeElement = function(element)
{
    var i;
    for(i=0; i<this.length ; i++)
    {
        if(this[i] == element)
        {
            this.splice(i, 1);
            break;
        }
    }  
    return this;    
}


/**
 *  This Class for fixing the Headers of the Table
 */

var FixedHeader = {
                
    loadOptions : function(opt)
    {
        opt.cols = !opt.cols?0:opt.cols;
    },
                
    /**
     * This Method Used to Fix teh Headers fo the Given Table Object
     */
    fix : function(divs,opt)
    {
        var ME = this;
        $(divs).each(function()
        {        
            ME.makeHeadFix($(this).find('table'), opt);
        });
    },
                
    /**
     * This Method Makes the Table as Fixed Head
     */
    makeHeadFix : function(table,options)
    {   
        var topDiv = document.createElement('div');
        var leftDiv = document.createElement('div');
                
        $(topDiv).css({
            'position':'absolute',
            'display':'none',
            'overflow':'hidden',
            'margin':'-2px'
        });
        $(leftDiv).css({
            'position':'absolute',
            'display':'none',
            'overflow':'hidden',
            'padding':'0px',
            'background':'red'
        });
                
        $(topDiv).append($(table).find('thead').clone());
                
        var cnt = "";
        $(table).find('tbody tr').each(function(){
            var col = $(this).find('th:lt('+options.cols+')');            
            cnt = document.createElement('tr');
            for(var i=0;i<col.length;i++)
            {
                $(cnt).append($(col[i]).clone());
            }
            //alert(cnt.innerHTML);
            $(leftDiv).append(cnt);
        });
        //alert(cnt);
        //alert($(leftDiv).html());
        
        // now removing the
                
        $(table).prepend(topDiv);
        $(table).prepend(leftDiv);
                
        $(table).parent('div').scroll(function()
        {                    
            if($(this).scrollTop()>50)
            {
                $(topDiv).show(400);
                //$(topDiv).scrollLeft($(this).scrollLeft());
                $(topDiv).css({
                    'top':$(this).scrollTop()
                });
            }
            else
            {
                $(topDiv).hide(200);
            }
                    
            if($(this).scrollLeft()>10)
            {
                $(leftDiv).show(400);
                $(leftDiv).scrollTop($(this).scrollTop());
                $(leftDiv).css({
                    //    'left':$(this).scrollLeft()
                    });
            }
            else
            {
                $(leftDiv).hide(200);
            }
        });
    }
}

/**
 * This is the Object for Applying the Mask over a specified Element
 */
var Mask = {

    /**
     * This Method is used to Show the Mask on the Specified Element
     */
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
            'color':'white'
        });
        $(maskDiv).attr({
            'class':'maskDiv'
        });
        $(maskDiv).html("Loading Please wait...........").fadeTo(0,0.5,null);
        
        $(div).append(maskDiv);
    },
    
    /**
     * This Method is used to Hide the Mask on the Specified Element
     */
    hideMask : function(div)    
    {
        $(div).find('.maskDiv').remove();
    }
}


/**
 * This Class is for Make the Strippy Table
 */
var StripyTable = {
    
    makeAsStrippyTable : function(table,options){
        $(table).addClass(options.CSS);
        $(table).find('tbody tr').each(function(ind)
        {
            if(ind%2==0){
                $(this).find('td').addClass('even');
            }
            else
            {                    
                $(this).find('td').addClass('odd');
            }
        
        });
    }
}