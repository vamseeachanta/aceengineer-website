/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var DOMElement ={
    
        /**
     * This Method makes the Given element as Closeble
     */
    makeAsClosable:function(ele,options,handler)
    {
        $(ele).each(function(ind)
        {
            var ME = this;            
            var closeEle = document.createElement('span');
            $(closeEle)            
            .addClass(options.CSS)
            .html('X');
            
            $(closeEle).click(function(evt)
            {
                alert(ME);
                evt.stopPropagation();
                evt.preventBubble();
                alert(options.prompt);
                
                if(options.prompt){
                    if(!confirm(options.prompt))
                        //                    if(!window.confirm(options.prompt))
                        return;
                }
                $(ME).remove();
                // Calling the Handler
                if(handler)
                    handler(ME);
            });
            
            $(this).css({
                'position':'relative'
            });
            $(this).append(closeEle);
            
            $(this).hover(function(){
                $(closeEle).show();
            },function(){
                $(closeEle).hide();
            });
        });
    },
         /**
     * This Method Used to Make the Given Division is Foldable
     * and Triggers the handler when folding/open Completed
     * @param div the Div Element
     * @param opt the Options
     * @param handler handler function to be called when folding Done
     */
    makeAsFoldable: function(div,opt,handler){
        handler = $.isFunction(opt)?opt:handler;
        
        $(div).each(function()
        {
            var head = $(this).find('.foldableHead');
            var body = $(this).find('.foldableBody');
            $(head)
            .click(function(){
                $(body).slideToggle(!opt.speed?100:opt.speed,!opt.easing?"linear":opt.easing,function(){                    
                    if(handler)
                        handler($(body).is(':visible'));
                });
            })
            .hover(function(){
                $(this).addClass('hover');
            },function(){
                $(this).removeClass('hover');
            });
        });
    },
    /**
     * This Method is for Make the Given Table as Strippy Table
     * Note the table Should be in the Standard Format like
     * <table>
     *  <thead>
     *      .............
     *  </thead>
     *  <tbody>
     *      ...........
     *  </tbody>
     *  
     *  <!-- Optional -->
     *  <tfoot>
     *      ...........
     *  </tfoot>
     * </table>
     */
    makeAsStrippyTable : function(table,options){
        $(table).addClass(options.CSS);
        $(table).find('tbody tr').each(function(ind)
        {
            if(ind%2==0){
                $(this).find('td,th').addClass('even');
            }
            else
            {                    
                $(this).find('td,th').addClass('odd');
            }
        
        });
    },
    /**
     * This is the Actual Method to make a Division As Side bar
     */
    setAsSideBar : function(div,opt)
    {        
        var options ={
            easing:'linear',
            speed:1000
        }
        
        $(window).scroll(function(){
            var v = ($(window).height()-$(div).height())/2;
            v += $(window).scrollTop();            
            $(div).css({
                top:v
            });
        });
                   
        opt = $.extend({},options,opt);
        //alert($.toJSON(opt));
        
        // Applying The Required CSS to the Side Bar
        $(div).css({
            'position':'absolute',
            //width :($(div).width())+'px',
            //left :'-'+($(div).width())+'px',
            'top':( 2 * ($(window).height()-$(div).height()))/3
        });
        $(div).hover(function(){                       
            $(div).stop().animate({
                left:'10px'
            }, opt.speed, opt.easing, null);
        },function(){
            $(div).stop().animate({
                left:'-'+$(div).width()+'px'
            }, opt.speed, opt.easing, null);
        });
        
        $(div).stop().animate({
            left:'-'+$(div).width()+'px'
        }, 1000, opt.easing, null);                    
    },
    /**
     * This Method makes the given div as tabbed Pane
     */
    makeAsTabbedPane: function(tabDiv){
        // Initializing Tabs
        var tabs = $(tabDiv).find('.tabs').find('span');                    
        var blocks = $(tabDiv).find('.tabContent');                    
        // Hiding All The Tabs by Default
        $(blocks).hide();
        $(blocks).eq(0).show();
        $(tabs).eq(0).addClass('active');
                    
        $(tabs).each(function(ind){
            $(this).click(function()
            {
                $(tabs).removeClass('active');
                $(this).addClass('active');
                $(blocks).hide();
                $(blocks).eq(ind).show();
                            
                if(ind==1)
                {
                    // if there are no ticker by default then load the Default Chart in Moving Average
                    if(FundamentalIndicatorHandler.selectedTickers.length<1)
                        FundamentalIndicatorHandler.loadChart();
                }
            });
        });
    },
    makeAsTabbedPaneStockQuote: function(tabDiv){
        // Initializing Tabs
//        var tabs = $(tabDiv).find('.tabsStockQuote').find('span');                    
        var tabs = $(tabDiv).find('.tabsStockQuote').find('li');                    
        var blocks = $(tabDiv).find('.tabContentStockQuote');                    
        // Hiding All The Tabs by Default
        $(blocks).hide();
        $(blocks).eq(0).show();
        $(tabs).eq(0).addClass('active');
        $(tabs).each(function(ind){
            $(this).click(function()
            {
                $(tabs).removeClass('active');
                $(this).addClass('active');
                $(blocks).hide();
                $(blocks).eq(ind).show();
                            
                if(ind==1)
                {
                    // if there are no ticker by default then load the Default Chart in Moving Average
                    if(FundamentalIndicatorHandler.selectedTickers.length<1)
                        FundamentalIndicatorHandler.loadChart();
                }
            });
        });
    }
}
/**
 * THis Class Used to Manipulate the Input Elements
 */
var Input = {
    /**
     * This method used to set the Mask with the specified title Content
     */
    setTextMask: function(elements,opt){
        $(elements).each(function(){
            var title = $(this).attr('title');
            if(!title || title.length<1)
                return;
            
            // by default adding the Text Mask
            $(this).val(title).addClass(opt.CSS);
            
            $(this).focus(function(){
                if($(this).val() == title){
                    $(this).val("").removeClass(opt.CSS);
                }
            });
            $(this).blur(function(){
                if($(this).val()==""){
                    $(this).val(title).addClass(opt.CSS);
                }
            });
        });
    },
    /**
     * This Method don't allow to enter the chracters given by the User
     */
    excludeCharacters : function(ele,chars,errorHandler){
        var ch;
        $(ele).keypress(function(evt){            
            ch = String.fromCharCode(evt.keyCode);
            if(chars.indexOf(ch)>=0){
                errorHandler(ch);
                evt.preventDefault();
            }
        });
    },
    /**
     * THis MEthod Restrict to Enter the Numerics Only
     */
    restrictToNumeric: function(ele,errorHandler){
        var ME = this;        
        $(ele).keydown(function(evt){
            var key = evt.keyCode;
            
            // Checking for Signs they Should be First Character
            if(key==187 || key==189 || key==107 || key==109)
            {
                if($(ele).val().length>0)
                {
                    evt.preventDefault();
                    return;
                }
                return;
            }
            
            // Checking fot Decimel
            if(key==190 || key==110)
            {
                if($(ele).val().indexOf(".")>=0)
                {
                    evt.preventDefault();
                    return;
                }
                return;
            }
            
            if(ME.isNumeric(key) || key==8 || key==9)
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
/**
 * Notification Class
 */
var Notification = {
    div : document.createElement('div'),
                
    init: function(options){
        $(this.div).addClass(options.CSS);
                    
        $('body').append(this.div);
        $(this.div).hide();
    },
                
    show: function(msg,timeOut,handler){
        $(this.div).html(msg).show().animate({
            'opacity':'1'
        },1000,'linear',function(){                        
            });
                    
        $(this.div).css({
            left:($(window).width()-$(this.div).outerWidth())/2
        });
        var ME = this;
        window.setTimeout(function(){
            $(ME.div).animate({
                'opacity':'0'
            },1000,'linear',function(){
                $(ME.div).hide();
            });
        },timeOut);
    }
}