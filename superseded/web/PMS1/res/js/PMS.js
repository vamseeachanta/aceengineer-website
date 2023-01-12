/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var StandardNotations = {
    dateFormat : 'MM-dd-yyyy',
    jQueryDateFormat : 'mm-dd-yy'
}


function PMS(){    
    this.messageDialog = new Alert({
        mode:'MESSAGE'
    });
    
    this.alertDialog = new Alert({
        mode:"ALERT"
    });
    
    this.reportMaker = new ReportMaker(null);
    
    
    this.registerMyListHoverEffect = function(element)
    {
        alement(element.length);
        element = !element?$('.myList'):element;
        $(element).each(function(){
            var prevLi;
            var currLi;
                    
            $(this).find('li').hover(function(){
                $(this).stop().animate({
                    'padding-left':'20px'
                }, 300, "linear", null);
                $(this).addClass('hover');
            },function(){
                $(this).stop().animate({
                    'padding-left':'10px'
                }, 100, "linear", null);
                $(this).removeClass('hover');
            });                    
        });
    };
    
    // This holds All the Employee list
    this.empList = new EmpList();    
}




// $$$$$$$$$$$$$$$ Emplist Class Starts here

/**
 * This Class for Maintaining all availabel Employee List
 */
function EmpList(emps,handler){
    var empNamesQuery ="";
    for(var i=0;i<emps.length;i++){
        empNamesQuery += "empIds="+emps[i]+"";
        if(i<emps.length-1)
            empNamesQuery+="&";
    }
    
    $.get("employeeHandler.do?mode=4&"+empNamesQuery,{},function(data){
        var empData = [];
        data = eval("("+data+")");
        var obj;
        for(var i=0;i<emps.length;i++)
        {
            obj = null;
            for(var j=0;j<data.length;j++)
            {
                if(emps[i] == data[j].empId){
                    obj = data[j];
                    break;
                }
            }
            empData.push(obj);
        }
        handler(empData);
    });
}

/**
 * This method Returns teh Employee information based on the Given Employee Id
 */
EmpList.prototype.getEmpInfo = function(empId){
    
    }
    
// $$$$$$$$$$$$$$$ Emplist Class Ends Here


function ProjList(projIds,handler){
    var query = "mode=9&projIds=";
    var projs = [];
    for(var i=0;i<projIds.length;i++){
        query += projIds[i];
        if(i<projIds.length-1)
            query += ",";
    }
    
    //alert(query);
    $.get("projectHandler.do?"+query,{},function(data)
    {
        //alert(data);
        data = eval("("+data+")");
        //alert(data);
        var obj;
        for(var i=0;i<projIds.length;i++)
        {
            //obj = null;            
            for(var j=0;j<data.length;j++)
            {
                if(projIds[i] == data[j].projId)
                {
                    obj = data[j];
                    break;
                }
            }
            projs.push(obj);
        }
        handler(projs);
    });
}