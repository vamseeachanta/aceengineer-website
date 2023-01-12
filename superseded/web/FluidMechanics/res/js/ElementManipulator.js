/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var ElementManipulator ={
    
    /**
     * This Method makes the Given element as Closeble
     */
    makeAsCloseble:function(ele,options,handler)
    {
        $(ele).each(function(ind)
        {
            var ME = this;
            var closeEle = document.createElement('span');
            $(closeEle)
            .css({
                'display':'none',
                'font-size':'10px',
                'position':'absolute',
                'padding':'2px',
                'background':'white',
                'color':'red',
                'right':'-8px',
                'cursor':'pointer',
                'top':'-8px',
                'z-index':'1000'
            })
            .addClass(options.CSS)
            .html('X')
            .click(function(evt)
            {
                evt.stopPropagation();
                
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
    }
}