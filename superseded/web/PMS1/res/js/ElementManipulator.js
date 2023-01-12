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
            //.html('X')
            .click(function(evt)
            {
                evt.stopPropagation();                
                
                if(options.prompt){
                    if(!window.confirm(options.prompt))
                        return;
                }
                if(options.before)
                {
                    options.before(ME);
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
                left:'0px'
            }, opt.speed, opt.easing, null);
            $('.img',div).attr({
                'src':"res/images/SlideBar.png"
            });
        },function(){
            $(div).stop().animate({
                left:'-'+($(div).width()-20)+'px'
            }, opt.speed, opt.easing, null);
            $('.img',div).attr({
                'src':"res/images/SlideBarOuter.png"
            });
        });
        
        $(div).stop().animate({
            left:'-'+$(div).width()+'px'
        }, 1000, opt.easing, null);                    
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



// $$$$$$$$$$$$$$$$$$$ SearchableElement Starts Here
/**
 * This Class for Making the Given Container as Searchable Container
 */
function SearchableElement(container,options){
    this.baseOpt ={
        msg:'There are no elemnts Matching given Criteria'
    };
    this.elements = null;
    this.keys = [];
    this.container = container;                
    this.inputElement = null;
    this.init();                
                
    this.opt = $.extend({}, this.baseOpt, options);                              
}
            
SearchableElement.prototype.init = function()
{
    var ME = this;
    this.inputElement = $(this.container).find('[name="inputElement"]');
    this.rescan();
}
            
/**
             * This MEthod Rescans the Container for Dynamically added/removed Search Elements
             * Note : You should call this Method when the container changed dynamically
             */
SearchableElement.prototype.rescan = function(){
    this.keys = [];                
    this.elements = $(this.container).find('.searchElement');                
    for(var i=0;i<this.elements.length;i++){
        this.keys.push($(this.elements[i]).attr('key').toLowerCase());
    }                
    this.register();
}
            
SearchableElement.prototype.register = function(){
    var ME = this;
    $(ME.inputElement).keyup(function()
    {
        var val = $(this).val().toLowerCase();
        var found = false;
        $(ME.elements).show();
        for(var i=0;i<ME.keys.length;i++)
        {
            if(ME.keys[i].indexOf(val)<0)
            {
                $(ME.elements).eq(i).hide();
                found = true;
            }
        }                    
    });
}

// $$$$$$$$$$$$$$$$$$$ SearchableElement Class Ends Here



/**
 * Notification Class
 */
var Notification = {
    div : document.createElement('div'),
    initilized : false,
                
    init: function(options){
        $(this.div).addClass(options.CSS);
                    
        $('body').append(this.div);
        $(this.div).hide();
    },
                
    show: function(msg,timeOut,handler){
        if(!this.initilized){
            this.init({
                CSS:'notification'
            });
        }
        
        $(this.div).html(msg).show().animate({
            'opacity':'1'
        },200,'linear',function(){                        
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