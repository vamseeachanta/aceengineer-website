/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function ReportMaker(timeSheet)
{
    this.timeSheet = timeSheet;    
}


/**
 * This Method makes the Employee Status Div
 */
ReportMaker.prototype.makeEmpStatusDiv = function(timeSheet,empId)
{
    var sD = new Date();
    var eD = new Date();
    eD.moveToDayOfWeek(0,-1);
    // Moving to Fours Weeks Back
    sD = eD.clone().addDays(-27);
    //eD.moveToLastDayOfMonth();
    
    
    var div = document.createElement('div');
    var cnt = "<h4 class='chartHead top_border'>My Status Reports</h4>";
    cnt += "<div class='chartBody bottom_border'>"
    +"<table class='formFields'>"
    +"<tr><td class='label'>Start Date</td><td><input type='text' id='sDate' class='date' value='"+sD.toString('yyyy-MM-dd')+"'/></td>"
    +"<td rowspan=2><label><input type='checkbox' style='width:auto' class='approvalHrs' />Include Hours Pending Approval</label></td></tr>"
    +"<tr><td class='label'>End Date</td><td><input type='text' id='eDate' class='date' value='"+eD.toString('yyyy-MM-dd')+"'/></td></tr>"
    +"</table>"
    +"<div class='chartDiv'></div>"
    +"</div>";
    $(div).html(cnt);    
    
    var chartDiv = $('.chartDiv',div)[0];
    $('#sDate',div).change(function(){
        sD = Date.parse($(this).val());
        draw();
    });
    $('#eDate',div).change(function(){
        eD = Date.parse($(this).val());
        draw();
    });
    $('.approvalHrs',div).change(function(){
        //alert($(this).val());
        });
    
    function draw(){
        timeSheet.reports.generateEmployeeReport(chartDiv, {
            emps:[empId],
            sDate:sD,
            eDate:eD
        });
    }
    
    draw();    
    return div;
}