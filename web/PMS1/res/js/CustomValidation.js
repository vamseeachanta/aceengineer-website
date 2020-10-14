/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * This Method Used to Compare the Greater Than Value of the Given To 
 */
jQuery.validator.addMethod("greaterThan", 
    function(value, element, params) 
    {        
        if(!/Invalid|NaN/.test(new Date(value)))
        {
            return (new Date(value)> new Date($(params).val()));
        }
        return false;
    },'Must be greater than {0}.');