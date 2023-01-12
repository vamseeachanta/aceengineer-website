/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(function(){
    var tool = new ToolTip($('*'),{
        divCSS:''
    });
});

function ToolTip(pFields,options)
{
    this.title = "";
    this.div = document.createElement('div');
    this.divCSS = null;
    this.continer = document.createElement('div');
    this.fields = this.filterElements(pFields);
    this.heading = "";

    this.initOptions(options);
    this.init();
    this.registerField(this.fields);
}

ToolTip.prototype.initOptions = function(options)
{
    if(!options)
        return;

    this.heading = !options.heading?"AceEngineer":options.heading;
    this.divCSS = !options.divCSS?null:options.divCSS;
}

/**
             * This Method to Initialize the Objects
             */
ToolTip.prototype.init = function()
{
    // if there is no User defiend CSS then Apply the Default CSS
    if(this.divCSS == null)
    {
        $(this.div).css({
            'margin-top':'20px',
            'margin-left':'5px',
            left: 0,
            position:'absolute',
            '-webkit-border-radius':'10px',
            '-webkit-box-shadow':'2px 4px 4px black',
            display:'none',
            color: 'white',
            background: 'lightgray',
            padding:'10px'
        });
    }
    else
    {
        $(this.div).addClass(this.divCSS).css({
            position:'absolute'
        });
    }

    // Adding Continer
    $(this.div).append("<center>"+this.heading+"</center>").
    append('<hr />').
    append(this.continer);
}

/**
             * This Method Register a new Field
             */
ToolTip.prototype.registerField = function(fields)
{
    var me = this;
    $(fields).hover(function(evt)
    {
        me.title = $(this).attr('title');
        $(this).removeAttr('title');
        $(me.continer).html(me.title);
        var pos = $(this).offset();

        $(document.body).append(me.div);
        $(me.div).css({
            left:evt.clientX,
            top:pos.top
        });
        $(me.div).stop().fadeTo(0,0,null).fadeTo(1000,1.0,null);
    },function(){
        $(this).attr('title',me.title);
        $(me.div).remove();
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
