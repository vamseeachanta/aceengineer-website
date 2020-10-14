/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * This Array holda the Suggested Symbols Names By The Ace Engineer
 */ 

var StockCore = 
{
    months : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    suggestedSectors : ['','Energy','Metal','Utilities','Sci&Tech','Pharmacy'],
    suggestedSymbols : [
    [],
    ['XLE','VGENX'],
    ['XME','VGPMX','VAW'],
    ['BULIX','RYUIX','GASFX'],
    ['PPTIX','JAGIX','MATFX'],
    ['ASDS','APLI'],
    ],
    
    
    XMLHttpFactories : [
    function () {
        return new XMLHttpRequest()
    },
    function () {
        return new ActiveXObject("Msxml2.XMLHTTP")
    },
    function () {
        return new ActiveXObject("Msxml3.XMLHTTP")
    },
    function () {
        return new ActiveXObject("Microsoft.XMLHTTP")
    }
    ],
    
    splitDate : function(pDate)
    {  
        try
        {
            var d;
            if(pDate instanceof Date){
                d = pDate;
            }else{
                d = Date.parse(pDate);
            }
            //alert("Date Is : "+d.getDate());
            var tokens = [d.getMonth(),d.getDate(),d.getFullYear()];            
            return tokens;
        }
        catch(e)
        {            
        }
        return ["","",""];
    },
    
    
    /**
     * This Method Returns The Crossbrowser XMLHttpRequest Object
     * Programmers are recommended to make the XML Object throught this method
     */
    makeXMLRequestObj : function()
    {
        var xmlhttp = false;
        for (var i=0;i<this.XMLHttpFactories.length;i++) {
            try {
                xmlhttp = this.XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    },
    
    /**
     * This MEthod Prepares the List of the Given Array
     * @param tag - the tag to be appended to each element exapmle "option for <option>...</option> tag"
     * @param pArray the array of elements
     */
    prepareList : function(tag,pArray)
    {
        tag = tag==undefined?"<option>":tag;
        
        var openTag = "<"+tag+">";
        var endTag = "</"+tag+">";
        var content = "";
        for(var i=0;i<pArray.length;i++)
        {
            content += (openTag+pArray[i]+endTag);
        }
        
        return content;
    },
    
    /**
     * This MEthod Prepares a list of checkboxes and
     * @param chkboxName the name attribute of all the Check boxes
     * @param chkboxes the array of checkboxes labels
     */
    prepareCheckboxes: function(chkboxName,chkboxes)
    {
        var label = document.createElement('label');
        var content = "";
        for(var i=0;i<chkboxes.length;i++)
        {
            content += ("<input type='checkbox' name='"+chkboxName+"' value='"+chkboxes[i]+"'>"+chkboxes[i]+"</input>");
        }
        //alert(content);
        $(label).html(content);        
        return label;
    },
    
    /**
     * THis Method Creates a Ticker Checkbox 
     */
    createTickerCheckbox : function(attr,removeHandler){
        var newTicker = document.createElement('input');
        $(newTicker).attr(attr);
        
        var label = document.createElement('label');
        $(label).append(newTicker);        
        DOMElement.makeAsClosable([label],removeHandler);        
        return label;
    },
    
    goToByScroll : function(obj){
        $('html,body').animate({
            scrollTop: $(obj).offset().top
        },'slow');
    }
}



//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$Auto Complete Class$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

//var AutoComplete = function(pFields,options)
function AutoComplete(pFields,options)
{
    this.fields = pFields;
    this.listDiv = document.createElement('div');
    this.currInd = -1;
    this.selectedItem = null;
    this.prevItem = null;
    this.maxVisibleRows = 10;
    this.allFields = [];
    this.queryURL = null;
    this.xmlReq = StockCore.makeXMLRequestObj();
                
    // Initializing
    this.init(options);
                
    $(this.listDiv).css({        
        'padding':'5px',
        'background':'lightgray',
        'color':'#074867',
        'margin-top':'10px',
        'position':'absolute',
        'display':'none',
        '-webkit-border-radius':'5px',
        '-moz-border-radius':'5px',
        '-webkit-box-shadow':'5px 5px 5px #074867',
        '-moz-box-shadow':'5px 5px 5px #074867'
    });
    //.html("<table><tr><td>one</td></tr><tr><td>two</td></tr></table>");                
                
    $(document.body).append(this.listDiv);
                
    // Registering the All given Fields
    this.fields = pFields;
    if(this.fields != null)
        this.registerField(this.fields);
}
            
/**
 * This Method used to initialize the Given Fields
 */
AutoComplete.prototype.init = function(options)
{
    this.maxVisibleRows = !options.maxVisible?10:options.maxVisible;
    this.allFields = !options.allFields?[]:options.allFields;
    this.queryURL = !options.queryURL?"":options.queryURL;    
                
}
            
AutoComplete.prototype.registerField = function(items)
{
    // Holding The Current Object for Further Referrence
    var me = this;
                
    // Preventing the Arrow Keymovements
    $(items).keydown(function(evt)
    {
        var keyCode = evt.keyCode;
        //if(keyCode>=37 && keyCode <=40)                    
                        
        switch(keyCode)
        {
            case 13:
                var r = $(me.selectedItem);
                if(r.length > 0)                    
                    $(this).val($(r).find('td').html());
                me.hide();                            
                break;
            case 37:
                break;
            case 38:
                evt.preventDefault();
                me.stepBy(-1);                            
                break;
            case 39:
                break;
            case 40:
                evt.preventDefault();
                me.stepBy(1);                            
                break;
            default:
        }
    });
                
    $(items).keyup(function(evt)
    {
        var keyCode = evt.keyCode;
      
        var textObj = this;
        // if the key code is in the arrow and enter then won't do any
        // Un necessary Work
        switch(keyCode)
        {
            case 13:
            case 37:
            case 38:
            case 39:                        
            case 40:
                return;
        }
        me.loadAjaxContent($(this).val(),textObj);                    
    });
                
    $(items).blur(function(evt)
    {
        //alert(evt.relatedTarget);
        me.hide();
    });
}
            
/**
 * This Method Loads the Ajax Content
 */
AutoComplete.prototype.loadAjaxContent = function(val,textObj)
{
    var me = this;                
    try
    {
    //this.xmlReq.abort();
    }
    catch(e){
        alert(e);
    }
                
    this.xmlReq.open('GET','stockSymbolSuggester.do?s='+val,true);
    this.xmlReq.onreadystatechange = function()
    {
        if(me.xmlReq.readyState==4 && me.xmlReq.status == 200)
        {                        
            var res = me.xmlReq.responseText;
            res = res.substring(res.indexOf("["),res.lastIndexOf("]")+1);
                        
            try
            {
                me.allFields = [];
                me.allFields = eval("("+res+")");
                            
                var content = "<table>";
                var field;
                for(var i=0;i<me.allFields.length;i++)
                {         
                    field = me.allFields[i];
                    content += "<tr><td style='border-right:1px solid white'>"+field.symbol+"</td><td>&reg;"+field.name+"</td></tr>";                                                                    
                }
                content += "</table>";
                //alert(content);
                $(me.listDiv).html(content);                
                    
                $(me.listDiv).find('tr').hover(function()
                {
                    me.selectedItem = this;
                    $(this).css({
                        color:'white',
                        cursor:'pointer',
                        background:'#074867'
                    });
                    $(textObj).val($(this).find('td').html());
                },function(){
                    $(this).css({
                        color:'#074867',
                        background:'lightgray'
                    });
                });
                $(me.listdiv).click(function(){
                    alert('hi');
                });
                    
                var pos = $(textObj).offset();
                //alert("Position Is : "+pos);
                //alert(that.listDiv);
                $(me.listDiv).
                css({
                    'left':pos.left,
                    'top':pos.top+$(textObj).height()
                }).show();
                
                $(me.listDiv).show();
            }catch(e){
                alert("Stock Core : "+e);
            }
        }
    }
                
    this.xmlReq.send(null);
}
            
AutoComplete.prototype.hide = function()
{
    var me = this;
    // Reseting the Previous Selections
    this.currInd = -1;
    this.selectedItem = null;
    //    $(this.listDiv).animate({
    //        marginLeft:'-50px',
    //        opacity: 0.0
    //    }, 100, "linear",function(){
    //        $(me.listDiv).hide()
    //    });
    $(this.listDiv).hide();
}
            
/**
 * This Method used to move the selection when the user presses the arrow keys
 */
AutoComplete.prototype.stepBy = function(step)
{
    var max = $(this.listDiv).find('tr').length;
    //alert(max);
    this.currInd += step;
    this.currInd = this.currInd<0?0:(this.currInd>=max?max-1:this.currInd);
    this.prevItem = this.selectedItem;
    this.selectedItem = $(this.listDiv).find('tr')[this.currInd];
                
    $(this.prevItem).find('td').css({
        color:'#074867',
        background:'lightgray'
    });
    $(this.selectedItem).find('td').css({
        color:'white',
        background:'#074867'
    });
//alert(tr.innerHTML);
}

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$ Symbol Look Class Ends Here   $$$$$$$$$$$$$$$$$$$
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



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
    
    
    this.registerField(pFields);
}
            
ToolTip.prototype.initOptions = function(options)
{
    if(!options)
        return;
                
    this.heading = !options.heading?null:options.heading;
    this.divCSS = !options.divCSS?null:options.divCSS;                
}
            
/**
 * This Method to Initialize the Objects
 */
ToolTip.prototype.init = function()
{
    this.alertDialog = new Alert({        
        heading:this.heading,
        CSS:this.divCSS,
        timeOut:-1
    });
}
            
/**
 * This Method Register a new Field
 */
ToolTip.prototype.registerField = function(fields)
{
    // first Filering the Elements for Tooltips    
    fields = this.filterElements(fields);
    var ME = this;
    $(fields).hover(function(evt)
    {
        ME.title = $(this).attr('title');
        $(this).removeAttr('title');
        //alert(ME.title);
        var pos = $(this).offset();
        ME.alertDialog.show(ME.title);
        
        $(ME.alertDialog.alertDiv).css({
            left:evt.clientX+20,
            top:pos.top+$(this).height()+10
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
 * This Method Removes the Nulls from the Given Array And returns teh Neqw Array
 */
Array.prototype.removeNulls = function(){
    var val = [];
    for(var i=0;i<this.length;i++){
        if(this[i] != null)
            val.push(this[i]);
    }
    return val;
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
    
//alert(this.CSS);
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
    }    
    
    $(this.alertDiv).addClass(this.CSS);
    $(this.alertDiv).css('position','absolute');
    
    $(this.titleElement).attr('class','title').html(this.title);
    
    $(this.contentDiv).attr('class','content');
    
    if(this.title!=null)
        $(this.alertDiv).append(this.titleElement);
    $(this.alertDiv).append(this.contentDiv);
    
    if(this.mode == "ALERT")
    {
        this.controlsDiv = this.makeControlsDiv("ALERT");
        $(this.alertDiv).append(this.controlsDiv);
    }        
}

Alert.prototype.onApprove = function()
{
    alert('You Approved');
}

Alert.prototype.onCancel = function()
{
    alert('You Canceled');
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
    
    $(div).append(this.approveButton).append(this.cancelButton);
    $(div).css({
        'text-align':'right',
        padding:'5px'
    });
    
    $(div).find('.button').css({
        padding:'5px 10px'
    });
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
    $(document.body).append(this.alertDiv);
    $(this.alertDiv).css({
        'left' : $(window).scrollLeft()+($(window).width()-$(this.alertDiv).width())/2,
        'top': $(window).scrollTop()+($(window).height()-$(this.alertDiv).height())/2
    });
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
        $(ME.alertDiv).remove();
    });
    
    try{
        window.clearTimeout(this.timer);
    }catch(e){}
}

//###################################### Alert Class Ends Here #############


function Mask()
{
    
}

/**
 * this method designed for IE fix for indexof 
 */
Array.prototype.getIndex = function(obj)
{
    for(var i=0;i<this.length;i++)
    {
        if(this[i] == obj)
            return i;
    }
    return -1;
}


/**
 * Math Functions
 */
var MyMath = 
{
    round: function(v,p){        
        var sign = v<0?-1:1;
        var val = sign * v;
        var ip = parseInt(""+val);
        var fp = ""+(val - ip);        
        fp = fp.substr(2, p);        
        //fp *= Math.pow(10, p);
        //fp = parseInt(""+fp);
        //fp /= Math.pow(10,p);        
        //ip *= sign;
        //alert('hi');
        return sign * (parseFloat(ip+"."+fp));
    }
}