<!--
To change this template, choose Tools | Templates
and open the template in the editor.
-->
<!DOCTYPE html>
<html>
    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <!--        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>-->

        <script type="text/javascript">
            var nameAutoFill;
            $(function()
            {
                //alert(StandardNotations.dateFormat);                
                nameAutoFill = new AutoFill(null, "employeeHandler.do?mode=0", {
                    css:'autoFillDivCss'
                });                
            
                nameAutoFill.onDataLoad = function(data)
                {
                    var cnt = "<table cellspacing='0px' cellpadding='5px'>";
                    for(var i=0;i<data.length;i++)
                    {
                        cnt += "<tr><td style='display:none'>"+data[i].empId+"</td><td key='"+data[i].empId+"' style='text-align:left'>"+data[i].firstName+"</td></tr>";
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
                        $(field).attr('empId',$(row).find('td:eq(0)').html());                        
                        //alert("Trigring Event");
                        $(field).trigger('dataSelected', null);
                    }                        
                }
                
                nameAutoFill.filterData = function(row){
                    return $(row).find('td:eq(0)').html();
                }
                
                
                registerEmployeeStatus();
            });
            
            /**
             * This Object Register the Employee Status Chart Elements
             */
            function registerEmployeeStatus()
            {
                $('.control').each(function(ind){
                    $(this).click(function(){
                        switch(ind){
                            case 0:
                                sd.addDays(-7);
                                ed.addDays(-7);                                
                                break;
                            case 1:
                                sd.addDays(7);
                                ed.addDays(7);
                                break;
                        } 
                        $('#ESstartDate').val(sd.toString(StandardNotations.dateFormat));
                        $('#ESendDate').val(ed.toString(StandardNotations.dateFormat));
                        draw();
                    });                    
                });
                
                //var calendar = new Calendar($('.date'), 1, 1, {});
                $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                
                var empId = "";
                var sd = new Date();
                var ed = new Date();
                sd.addDays(-(7+sd.getDay()-1));
                ed = sd.clone().moveToDayOfWeek(7);
                
                $('#ESstartDate').val(sd.toString(StandardNotations.dateFormat));
                $('#ESendDate').val(ed.toString(StandardNotations.dateFormat));
                
                var field = $('#empStatusDiv').find('#ESempId');                
                
                nameAutoFill.registerFields(field);
                
                $(field).bind('dataSelected',function(evt)
                {
                    empId = $(this).attr('empId').length<1?$(this).val():$(this).attr('empId');                    
                    draw();
                });                                
                
                $('#empStatusDiv').find('#ESstartDate').change(function(){
                    sd = Date.parse($(this).val());
                    draw();
                });
                $('#empStatusDiv').find('#ESendDate').change(function(){
                    ed = Date.parse($(this).val());
                    draw();
                });
                
                function draw()
                {
                    
                    var div = document.getElementById('ESempChart');
                    $(div).html("No data found in the Given Range");
                    if(sd > ed)
                    {
                        $(div).html("<h4 class='errorInfo'>Unable to Draw chart please select proper dates</h4>");
                        return;
                    }
                    //timeSheet.reports.
                    timeSheet.reports.generateProjectsEmployeeReport(div,
                    {
                        //                        emps: [empId],
                        //projs : [$('#PSprojId').val()],
                        sDate : sd,
                        eDate : ed
                    });
                }
            }            
        </script>



        <!-- This Script for Google Tracking -->
        <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-31241324-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
    </head>
    <body>
        <div id="empStatusDiv">
            <h4 class="chartHead top_border">Weekly Projects Status</h4>
            <div class="chartBody bottom_border">
                <fieldset class="myFieldset">
                    <legend>Weekly Projects Status</legend>    
                    <table class="formFields">
                        <tr>
                            <td class="label">From</td>
                            <td class="label"><input type="text" class="date" id="ESstartDate" /></td>
                            <td rowspan="2">
                                <label class="labelButton control">Previous Week</label>
                                <label class="labelButton control">Next Week</label>
                            </td>
                        </tr> 
                        <tr>
                            <td class="label">To</td>
                            <td class="label"><input type="text" class="date" id="ESendDate" /></td>
                        </tr>
                    </table>
                </fieldset>
                <div id="ESempChart"></div>
            </div>
            <!--            <a href="#">Download Report.....</a>-->
        </div>
    </body>
</html>