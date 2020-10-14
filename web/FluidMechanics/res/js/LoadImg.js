/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Load = {

    /**
     * This Method is used to Show the Mask on the Specified Element
     */
    loadImg : function(div,options)
    {
        var maskDiv = document.createElement('div');
        $(maskDiv).css({
            'position':'absolute',
            'left':$(div).position().left,
            'top':$(div).position().top,
            'width':$(div).outerWidth(),
            'height':$(div).outerHeight(),
            'text-align':'center',
            'background':'url("res/images/indicator.gif") no-repeat center black',
            'color':'white'
        });
        $(maskDiv).attr({
            'class':'maskDiv'
        });
        $(maskDiv).html("Loading...........").fadeTo(0,0.5,null);
        
        $(div).append(maskDiv);
    },
    
    /**
     * This Method is used to Hide the Mask on the Specified Element
     */
    hideLoadImg : function(div)    
    {
        //alert("testing");
        $(div).find('.maskDiv').remove();
    }
}