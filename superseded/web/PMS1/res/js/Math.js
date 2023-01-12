/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * Author           : Srinivas Kapusetti (SK)
 * Date Created     : 27-03-2012
 * Last Modified    : 27-03-2012
 * Last Modifie by  : SK  
 */

/**
 * Math Functions
 */
var MyMath = 
{
    /**
    * This Method Round the Given number to the Specified No of Digits
    */
    round: function(v,p)
    {
        var sign = v<0?-1:1;
        var val = sign * v;
        var ip = parseInt(""+val);
        var fp = val - ip;
        fp *= Math.pow(10, p);
        fp = parseInt(""+fp);
        return sign * parseFloat(ip+"."+fp);        
    }    
}

