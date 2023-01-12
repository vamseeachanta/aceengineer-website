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
            .html('X')
            .click(function(evt)
            {
                evt.stopPropagation();
                evt.preventBubble();
                
                
                if(options.prompt){
                    if(!window.confirm(options.prompt))
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
        //alert(div);
        $(div).each(function()
        {
            var head = $(this).find('.foldableHead');
            var body = $(this).find('.foldableBody');
            
            $(head)
            .click(function(){
                alert(body[0]);
                $(body[0]).slideToggle(!opt.speed?100:opt.speed,!opt.easing?"linear":opt.easing,function(){                    
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
     * Note the Should be in the Standard Format like
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
     *  </tffot>
     * </table>
     */
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
    },
    
    /**
     * This is the Actual Method to make a Division As Side bar
     */
    setAsSideBar : function(div,options)
    {
        $(window).scroll(function(){
            var v = ($(window).height()-$(div).height())/2;
            v += $(window).scrollTop();
            $(div).css({
                //                left:'-'+($(div).width()-20)+'px',
                top:v
            });

        });
                    
        options = !options?{}:options;                    
        // Applying The Required CSS to the Side Bar
        $(div).css({
            'position':'absolute',
            //width :($(div).width())+'px',
            left :'-185px',
            'top':( 2 * ($(window).height()-$(div).height()))/3
        });
                    

        $(div).hover(function()
        {
            $("#InnerSlide").show();
            $("#OuterSlide").hide();
            $(div).stop().animate({

                left:'0px'
            }, 1000, options.easing, null);
        },function(){
            $("#InnerSlide").hide();
            $("#OuterSlide").show();
            $(div).stop().animate({
                left:'-'+($(div).width()-20)+'px'
            }, 500, options.easing, null);
        });
                    
        //alert($(sbDiv).css('height'));    
                
        /**
         * This MEthod is used to parse the  Options Object
         * and make the Options Object As required for SideBar
         * if the User Leave the Options
         */
        function parseOptions(o)
        {
            o.position = !o.position?{}:o.position;
            o.easing = !o.easing?"linear":o.easing;
        }
    
    }
}




/**
 * THis Class Used to Manipulate the Input Elements
 */
var Input = {

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