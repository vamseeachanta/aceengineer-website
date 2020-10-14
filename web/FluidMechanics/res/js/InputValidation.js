/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/*
 ** This Code is used for Validate the Input Fields.......
*/
                
$(function(){
    formValid = $("#ConstantForm").validate(
    {
        rules: {
            constant_g: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_hm:{
                required: true,
                FN:true,
                NONZero:true
            },
            constant_Dv: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_Do: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_P1: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_p1: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_P2: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_p2: {
                required: true,
                FN:true,
                NONZero:true
            },
            constant_Cd: {
                required: true,
                FN:true,
                NONZero:true
            }
          
        },
        messages: {
            constant_g: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_hm: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_Dv: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_Do: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_P1: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_p1: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_P2: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_p2: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            constant_Cd: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            }
           
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    }); 

    
    formValid = $("#VariableForm").validate(
    {
        rules: {
            variable_g: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_Hm:{
                required: true,
                FN:true,
                NONZero:true
            },
            variable_hm: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_Dv: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_Do: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_P1: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_p1: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_P2: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_p2: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_Cd: {
                required: true,
                FN:true,
                NONZero:true
            },
            variable_Y: {
                required: true,
                FN:true,
                NONZero:true
            },
            choice:
            {
                required: true
            }
        },
        messages: {
            variable_g: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_Hm: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_hm: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_Dv: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_Do: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_P1: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_p1: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_P2: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_p2: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_Cd: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            variable_Y: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            choice:
            {
                required: "Required"
            }
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    }); 
    
    
    formValid = $("#LOBForm").validate(
    {
        rules: {
            LOB_g: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_D:{
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_Dv: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_L1: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_Do: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_L2: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_d: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_pseawater: {
                required: true,
                FN:true,
                NONZero:true
            },
            LOB_GA: {
                required: true,
                FN:true,
                NONZero:true
            }
        },
        messages: {
            LOB_g: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_D: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_Dv: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_L1: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_Do: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_L2: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_d: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_pseawater: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_GA: {
                required: "Required",
                FN: "Enter Decimal Only",
                NONZero:"Should not be less than or equals to ZERO"
            }
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    });
    
    formValid = $("#Constant_Sens_Form").validate(
    {
        rules: {
            Sens_Const: {
                required: true
            }
        },
        messages: {
            Sens_Const: {
                required: "Required"
            },
            Constant_Sens1:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Constant_Sens2:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Constant_Sens3:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Constant_Sens4:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            }
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth()+10,
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    });
    
    
    formValid = $("#Variable_Sens_Form").validate(
    {
        rules: {
            Sens_Const: {
                required: true
            }
        },
        messages: {
            Sens_Const: {
                required: "Required"
            },
            Variable_Sens1:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Variable_Sens2:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Variable_Sens3:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            Variable_Sens4:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            }
                
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth()+10,
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    });
    formValid = $("#LOB_Sens_Form").validate(
    {
        rules: {
            Sens_Const: {
                required: true
            }
        },
        messages: {
            Sens_Const: {
                required: "Required"
            },
            LOB_Sens1:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            },
            LOB_Sens2:
            {
                required: "Required",
                FN: "Enter only Decimal Values",
                NONZero:"Should not be less than or equals to ZERO"
            }
        },
        errorPlacement: function(error, element)
        {
            var span = error;
            var pos = $(element).position();
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'12px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'block',
                'z-index':1000,
                'left':pos.left+$(element).outerWidth()+10,
                'top':pos.top
            });
            $(span).appendTo(element.parent());
        },
        success: function(label){
            $(label).remove();
        }
    });
    $.validator.addMethod('FN', function (Decvalue) 
    {
        //        return(/^[0-9]+([\,\.][0-9]+)?$/g.test(Decvalue));
        //        return(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/.test(Decvalue));
        return(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(Decvalue));
    });
    $.validator.addMethod('NONZero', function (Decvalue) 
    {
        //        return(/^[0-9]+([\,\.][0-9]+)?$/g.test(Decvalue));
        //        return(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/.test(Decvalue));
        if(Decvalue <=0)
        {
            return false;
        }
        else
        {
            return true;
        }
    });
});                