/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function AutoFill(eles,dataUrl,options){    
    this.fields = eles;
    this.url = dataUrl;
    this.div = document.createElement('div');
    /** This Object Holds the Current Selected Field */
    this.selectedField = null;
    this.selectedRow = null;
    this.cache = [];
                
    this.init(options);
    return this;    
}
            
AutoFill.prototype.init = function(options)
{             
    $(this.div).addClass(options.css).
    css({
        'position':'absolute',
        'display':'none',
        'max-height':'300px',
        'background':'#53c1fd',
        'overflow':'hidden'        
    });
//alert("Initialized");
//alert(this.fields.length);
//this.registerFields(this.fields);
}
            
AutoFill.prototype.registerFields = function(fields)
{
    if(!fields || fields==null)
        return;
    
    //alert("Registering Fields "+fields.length);    
    
    var ME = this;
    $(fields).each(function(){
        var prevKey;
        var currKey;
        var keyCode;
        $(this).keyup(function(evt)
        {
            ME.selectedField = this;
            keyCode = evt.keyCode;
                        
            switch(keyCode){
                case 38:
                case 40:
                    evt.preventDefault();
                    break;
            }
                        
            var key = encodeURI($(this).val());
            ME.selectedRow = null;
            $.get(ME.url+"&query="+key, null, function(data){
                ME.onDataLoad(eval("("+data+")"));
            });
        });
                    
        $(this).blur(function(evt){
            ME.hide();
            ME.onDataSelect(ME.selectedField,ME.selectedRow);
        });
    });                
}
            
            
AutoFill.prototype.onDataLoad = function(data)
{
    alert('Data Loaded\nThis Method Should be Override by The Programmer');
}
            
/**
             * This Method Shold Be hadnled by the Programmer
             * to Get The Selected Row element from the Sugget
             * Table
             */
AutoFill.prototype.onDataSelect = function(selectedRow)
{
    alert('Data Loaded\nThis Method Should be Override by The Programmer');
}
            
/**
             * This Method parse the Givn row and
             * filters the Data
             * This method should be implemented by The Programmer
             * this Method Should Retunrs the Filtered data in String Format
             */
AutoFill.prototype.filterData = function(row)
{}
            
            
AutoFill.prototype.show = function(content)
{
    var ME = this;
    if(content)
    {
        var contentDiv = document.createElement('div');
        $(contentDiv).html(content);
        $(contentDiv).css({
            'max-height':'300px',
            'overflow':'auto'
        });
        $(ME.div).html("").append(contentDiv);
        this.registerTable($(this.div).find('table'));
    }                
    var f = this.selectedField;                
                
    $(f).parent().append(ME.div);                
                
    var pos = $(f).position();
    $(this.div).css({
        'left':pos.left,
        'top':pos.top
    });
    $(this.div).show().animate({
        'margin-top':$(f).outerHeight()+5,
        'opacity':'1.0'
    },400,null);                
}
            
AutoFill.prototype.hide = function()
{
    var ME = this;
    $(this.div).show().animate({
        'margin-top':'-20px',
        'opacity':'0px'
    },10,function(){
        $(ME.div).remove();
    });
}            
            
AutoFill.prototype.registerTable = function(tableObj)
{                
    var ME = this;
    $(tableObj).find('tr').hover(function(){
        ME.selectedRow = this;
        //$(ME.selectedField).val(ME.filterData(ME.selectedRow));
        $(this).addClass('hover');
    },function(){
        $(this).removeClass('hover');
    });
                
    $(tableObj).find('tr').click(function(){
        ME.onDataSelect(this);
    });
}