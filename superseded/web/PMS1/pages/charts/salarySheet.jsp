<%-- 
    Document   : salarySheet
    Created on : Apr 19, 2012, 2:18:33 PM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <title>Salary Sheet</title>
        <!--        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <!---->                
        <!--        <script type="text/javascript" src="jquery-1.6.2.min.js"></script>-->
        <!--        <script type="text/javascript" src="jquery-ui.min.js"></script>-->

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link href="res/css/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <script type="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <!--        <script src="res/js/jquery.min.js"></script>
                <script src="res/js/jquery-ui.min.js"></script>-->


        <script type="text/javascript">
            var nameAutoFill;
            var pdfPath;
            var salSetting;
            $(function()
            {
                $("#tabs").tabs();
                
                try{
                    //                    $('.testing').datepicker({
                    //                        changeMonth: true,
                    //                        changeYear: true,
                    //                        showButtonPanel: true,
                    //                        dateFormat: 'MM yy',
                    //                        onClose: function(dateText, inst) { 
                    //                            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
                    //                            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
                    //                            $(this).datepicker('setDate', new Date(year, month, 1));
                    //                        }
                    //                    });
                    
                    
                    $(".date").datepicker({
                        changeYear:true,
                        showButtonPanel:true,
                        yearRange:'2011:2200',
                        dateFormat:StandardNotations.jQueryDateFormat
                    });
                }catch(e){alert(e);}
                
                nameAutoFill = new AutoFill(null, "employeeHandler.do?mode=0", {
                    css:'autoFillDivCss'
                });
            
                nameAutoFill.onDataLoad = function(data)
                {
                    var cnt = "";
                    cnt += "<table style='max-width:300px; background:#53c1fd' cellspacing='0px' cellpadding='5px'>";
                    for(var i=0;i<data.length;i++)
                    {
                        cnt += "<tr><td style='display:none'>"+data[i].empId+"</td><td>"+data[i].firstName+"</td></tr>";
                    }
                    if(data.length<1)
                    {
                        cnt += "No Records Found";
                    }
                    cnt += "<table>";                   
                    nameAutoFill.show(cnt);
                }
                
                nameAutoFill.onDataSelect = function(field,row)
                {
                    if(row != null)
                    {
                        $(field).val($(row).find('td:eq(1)').html());
                        $(field).attr('empId',$(row).find('td:eq(0)').html()).trigger("change", null);
                    }                        
                }
                
                nameAutoFill.filterData = function(row){
                    return $(row).find('td:eq(0)').html();
                }
                
                registerSalaryReport();
                
                
                /*get salary setting */
                getSalarySettings();
                
                
                
                
                /* Setting button code*/
                $("#setSettingBtn").click(function(){
                    $("#uStatus").html("");
                    $("#uStatus").fadeIn(100);
                    Mask.showMask($("#fragment-3"), "");
                    
                    
                    var d = {
                        st_hours:$("#stripulatedHours").val(),
                        max_vac:$("#maxVacations").val(),
                        max_sicks:$("#maxSicks").val()
                    }
                    if(isNaN(d.st_hours)||isNaN(d.max_vac)||isNaN(d.max_sicks))
                    {
                        $("#uStatus").html("<h5 style='color:red'>Please provide the correct inputs</h5>");
                        Mask.hideMask($("#fragment-3"));
                    }
                    
                
                    $.post("salaryHandler.do?subMode=4", d, function(data){
                        if(data == "true")
                            $("#uStatus").html("<h5 style='color:green'>Updated succesfully</h5>")
                        else
                            $("#uStatus").html("Sorry ");
                        $("#uStatus").fadeOut(5000);
                        Mask.hideMask($("#fragment-3"));
                    });
                });
               
            });
            /*To fill in the settings details*/
            function getSalarySettings(){
                $.get("salaryHandler.do?subMode=5",function(data){
                    data = eval("("+data+")");
                    var st_hrs = data[0].settings[0].stHrs;
                    var maxVac = data[0].settings[0].maxVac;
                    var maxSicks = data[0].settings[0].maxSicks;
                    $("#stripulatedHours").val(st_hrs);
                    $("#maxVacations").val(maxVac);
                    $("#maxSicks").val(maxSicks);
                });
            }
            /**
             * This Handler Register the Salary Report Tab
             */
            function registerSalaryReport()
            {
                var salOpt = {};
                var empId;
                var sDate;
                var eDate;
               
                var maxVac = $('#maxVacations').val();
                var maxSicks =$('#maxSicks').val();
                nameAutoFill.registerFields($('#SSempId'));
                nameAutoFill.registerFields($('#SSempId_Man'));
               
               
                $('#generateSalBtn').click(function()
                {                   
                    empId = $('#SSempId').attr('empId').length<1?$('#SSempId').val():$('#SSempId').attr('empId');
                    sDate = Date.parse($('#SSsDate').val());
                    eDate = Date.parse($('#SSeDate').val());
                    var mV = $("#maxVacations").val();
                    var mS = $("#maxSicks").val();
                    
                    if(empId.length<1){
                        alert("Please Enter Employee Name");
                        return;
                    }
                    
                    if(sDate == null || eDate==null){
                        alert("Please choose start date and end dates");
                        return;
                    }
                    
                    if(eDate < sDate){
                        alert("Please make sure the date range is valid");
                        return;
                    }                    
                    if($("#stripulatedHours").val() == "")
                    {
                        alert("Please Enter the Stripulated Hours in Settings Tab");
                        return;
                    }
                    Mask.showMask($('#salaryReportDiv')[0],{});                    
                    var ids = [empId];
                    var query = "mode=4";
                    
                    for(var i=0;i<ids.length;i++)
                    {
                        query += "&empIds="+ids[i];
                    }                    
                    $.get("employeeHandler.do?"+encodeURI(query), null, function(data)
                    {
                        salOpt = eval("("+data+")");                        
                        for(i=0;i<salOpt.length;i++)
                            generateSalaryReport(salOpt[i],'AUTO');
                    });
                    $("#pdf").show(); 
                });
                
                $('#generateSalBtn_Man').click(function()
                {
                    empId = $('#SSempId_Man').attr('empId').length<1?$('#SSempId_Man').val():$('#SSempId_Man').attr('empId');
                    sDate = Date.parse($('#SSsDate_Man').val());
                    eDate = Date.parse($('#SSeDate_Man').val());
                    var st_hrs = $("#stripulate_Hours").val();
                    var tt_hrs = $("#total_Hours").val();
                    if(empId.length<1){
                        alert("Please Enter Employee Name");
                        return;
                    }
                    if(sDate == null || eDate==null){
                        alert("Please choose start date and end dates");
                        return;
                    }
                    if(eDate < sDate){
                        alert("Please make sure the date range is valid");
                        return;
                    }
                    if(st_hrs == "" || maxVac == "" || maxSicks == "")
                    {
                        alert("Please fill in settings fields");
                        return;
                    }
                    if(tt_hrs == "")
                    {
                        alert("Please Enter The Total Hours");
                        return;
                    }
                    if($("#stripulatedHours").val() == "")
                    {
                        alert("Please Enter the Stripulated Hours in Settings Tab");
                        return;
                    }
                    Mask.showMask($('#salaryReportDiv')[0],{});                    
                    var ids = [empId];
                    var query = "mode=4";
                    for(var i=0;i<ids.length;i++)
                    {
                        query += "&empIds="+ids[i];
                    }                    
                    $.get("employeeHandler.do?"+encodeURI(query), null, function(data)
                    {
                        salOpt = eval("("+data+")");                        
                        for(i=0;i<salOpt.length;i++)
                            generateSalaryReport(salOpt[i],'MANUAL');
                    });
                    $("#pdf").show(); 
                });
                
                function generateSalaryReport(options,type)
                {
                    options.sDate = sDate.toString('yyyy-MM-dd');
                    options.eDate = eDate.toString('yyyy-MM-dd');
                    options.type = type;
                    
                    try{
                        if(type == 'AUTO')
                        {
                            salSetting = {
                                st_hours:$("#stripulatedHours").val(),
                                max_vac:$("#maxVacations").val(),
                                max_sicks:$("#maxSicks").val()
                            }
                            timeSheet.reports.generateSalaryReport($('#SSchart')[0],options,function(){
                                //                                Mask.hideMask($('#salaryReportDiv')[0]);
                            },salSetting); 
                        }
                        else
                        {
                            timeSheet.reports.generateSalaryReport($('#SSchart_Man')[0], options,function(){
                                //                                Mask.hideMask($('#salaryReportDiv')[0]);
                            }); 
                        }
                    }catch(e){
                        alert(e);
                    }
                }
            }
            
            
        </script>


        <!-- This Script for Google Tracking -->
        <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-38040262-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
        <style>
            /*            .ui-datepicker-calendar {
                            display: none;
                        }*/
            #pdf{
                padding: 2px;
                background: #016CB0;
                color: white;
                border-radius: 5px ;
                -webkit-border-radius: 5px ;
            }
        </style>
    </head>
    <body>

        <div id="tabs">
            <ul>
                <li><a href="#fragment-1"><span>Auto Salary</span></a></li>
                <li><a href="#fragment-2"><span>Manual</span></a></li>
                <li><a href="#fragment-3"><span>Settings</span></a></li>
            </ul>
            <div id="fragment-1">
                <div id="salaryReportDiv">
                    <div class="chartBody bottom_border">
                        <fieldset class="myFieldset">
                            <legend>Pay Slip Generation</legend>
                            <table border="1" width="100%">
                                <tr>
                                    <td align="left">
                                        Employee Name:&nbsp;&nbsp;<input type="text" id="SSempId"/>
                                    </td>
                                    <td align="right">
                                        From&nbsp;&nbsp;<input type='text' id="SSsDate" class='date' size="10"/>&nbsp;&nbsp;&nbsp;
                                        To&nbsp;&nbsp;<input type='text' id="SSeDate" class='date' size="10"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" align="center"><label class='labelButton' id="generateSalBtn">Generate</label></td>
                                </tr>
                            </table>
                        </fieldset>
                        <div id="SSchart"></div>
                    </div>

                </div>
            </div>
            <div id="fragment-2">
                <div class="chartBody bottom_border">
                    <fieldset class="myFieldset">
                        <legend>Pay Slip Generation</legend>
                        <table border="1" width="100%">
                            <tr>
                                <td align="left">
                                    Employee Name:&nbsp;&nbsp;<input type="text" id="SSempId_Man"/>
                                </td>
                                <td align="right">
                                    From:&nbsp;&nbsp;<input type='text' id="SSsDate_Man" class='date' size="10"/>&nbsp;&nbsp;&nbsp;
                                    To:&nbsp;&nbsp;<input type='text' id="SSeDate_Man" class='date' size="10"/>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" align="center">
                                    Total Monthly Hours:&nbsp;&nbsp;<input type="text" id="total_Hours" size="8"/>&nbsp;&nbsp;
                                    <!--                                    Stipulated Daily Working Hours during the month: <input type="text" id="stripulate_Hours_Man" size="4"/>-->
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" align="center"><label class='labelButton' id="generateSalBtn_Man">Generate</label></td>
                            </tr>
                        </table>
                    </fieldset>
                    <div id="SSchart_Man"></div>
                </div>
            </div>
            <div id="fragment-3">
                <div class="chartBody bottom_border">
                    <fieldset class="myFieldset">
                        <legend>Pay Slip Settings</legend>
                        <table border="1" width="100%">
                            <tr>
                                <td>
                                    <table width="100%">
                                        <tr>
                                            <td>Stipulated Daily Hours Per Month: </td>
                                            <td><input type="text" id="stripulatedHours" value="8"/></td>
                                        </tr>
                                        <tr>
                                            <td>Maximum vacations per year:</td>
                                            <td><input type="text" id="maxVacations" value="8"/></td>
                                        </tr>
                                        <tr>
                                            <td>Maximum Sicks per year:</td>
                                            <td><input type="text" id="maxSicks" value="5"/></td>
                                        </tr>
                                        <tr>
                                            <td align="right" colspan="2">
                                                <label id="setSettingBtn" class="labelButton">Done</label>
                                            </td>
                                        </tr>
                                    </table>
                                    <label id="uStatus" align="right"></label>
                                </td>
                            </tr>
                        </table>
                    </fieldset>
                </div>
            </div>
            <div id="pdfDiv" >
                <a href="reports/paySlip.pdf"  id="pdf" style="display: none;" target="_blank" >Save as pdf</a>
            </div>
    </body>

</html>