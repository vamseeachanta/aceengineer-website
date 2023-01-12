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
            var projAutoFill;
            var tempArrayForEmployee = [];
            $(function()
            {                
                projAutoFill = new AutoFill(null, "projectHandler.do?mode=2", {
                    css:'autoFillDivCss'
                });
                projAutoFill.onDataLoad = function(data)
                {
                    var cnt = "<table cellspacing='0px' cellpadding='5px'>";
                    for(var i=0;i<data.length;i++)
                    {
                        cnt += "<tr><td style='display:none'>"+data[i].PID+"</td><td key='"+data[i].PID+"' style='text-align:left'>"+data[i].title+"</td></tr>";
                    }
                    cnt += "<table>";
                    projAutoFill.show(cnt);
                }
                
                projAutoFill.onDataSelect = function(field,row)
                {
                    if(row != null)
                    {
                        $(field).val($(row).find('td:eq(1)').html());
                        $(field).attr('projId',$(row).find('td:eq(0)').html()).trigger("change", null);
                    }                        
                }
                
                projAutoFill.filterData = function(row){
                    return $(row).find('td:eq(0)').html();
                }
                
                registerTabbedPane();
                registerProjectStatus(); 
            });
            

            /**
             * This MEthod Register the Tabbed Panes
             */
            function registerTabbedPane()
            {                
                // Initializing Tabs
                $('.TabsPanel').each(function()
                {
                    var tabs = $(this).find('.tabs').find('span');                    
                    var blocks = $(this).find('.tabContent');
                    // Hiding All The Tabs by Default
                    $(blocks).hide();
                    $(blocks).eq(0).show();
                    $(tabs).eq(0).addClass('active');
                    
                    $(tabs).each(function(ind){
                        $(this).click(function()
                        {
                            $(tabs).removeClass('active');
                            $(this).addClass('active');
                            $(blocks).hide(200);
                            $(blocks).eq(ind).show(200);
                        });
                    });                    
                });
            }
            
            
            /**
             * This Method Used to Register the Project Status Element Events
             */
            function registerProjectStatus()
            {
                //var calendar = new Calendar($('.date'), 1, 1, {});
                $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                
                var pid = null;
                var sd = new Date();
                var ed = new Date();
                
                sd.moveToFirstDayOfMonth();                
                //ed.moveToLastDayOfMonth();
                
                //alert(sd);
                
                $('#PSstartDate').val(sd.toString(StandardNotations.dateFormat));
                $('#PSendDate').val(ed.toString(StandardNotations.dateFormat));                                
                
                $('#PSprojId').change(function(){
                    pid = $(this).attr('projId').length<1?$(this).val():$(this).attr('projId');
                    draw();
                });
                
                projAutoFill.registerFields($('#PSprojId')[0]);
                
                $('#PSstartDate').change(function(){
                    sd = Date.parse($(this).val());
                    draw();
                });
                $('#PSendDate').change(function(){
                    ed = Date.parse($(this).val());
                    draw();
                });
                
                $('#PSreport').click(function(){
                    try
                    {
                        Charting.saveImages([
                            {
                                imageDiv:document.getElementById('PSBarChart'),
                                imageName:'image1.png'
                            },
                            {
                                imageDiv:document.getElementById('PSPieChart'),
                                imageName:'image2.png'
                            },
                            {
                                imageDiv:document.getElementById('PSLineChart'),
                                imageName:'image3.png'
                            },
                            {
                                imageDiv:document.getElementById('PSBudgetChart'),
                                imageName:'image4.png'
                            }
                        ],function(data){
                            // now preparing to make                            
                            $.get("pdfHandler.do",{'mode':'0'},function(data){                                
                                alert("<a href='"+data+"'>Download Report</a>");
                                $("<a href=\""+data+"\">Download Report</a>").insertAfter('#PSreport');
                            });
                        });
                    }catch(e){alert(e);}
                });
                
                
                function draw()
                {
                    var d1,d2,d3,d4,d5,d6;
                    d1 = document.getElementById('PSBarChart');
                    d2 = document.getElementById('PSPieChart');
                    d3 = document.getElementById('PSLineChart');
                    d4 = document.getElementById('PSBudgetChart');
                    d5 = document.getElementById('PSBurnChart');
                    d6 = document.getElementById('PSNewChart');
                    
                    $(d1).html("No data found with in the Selected Range");
                    $(d2).html("No data found with in the Selected Range");
                    $(d3).html("No data found with in the Selected Range");
                    $(d4).html("No data found with in the Selected Range");
                    $(d5).html("No data found with in the Selected Range");
                    $(d6).html("No data found with in the Selected Range");
                    
                    if(pid == null || pid.length<1)
                        return;
                    
                    if(ed < sd)
                    {
                        $(d1).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        $(d2).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        $(d3).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        $(d4).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        $(d5).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        $(d6).html("<h4 class='errorInfo'>Unable to Draw the Char please choose Proper Dates</h4>");
                        return;
                    }
                    //                    Mask.showMask($('#projStatusDiv')[0],{});  
                   
                    timeSheet.reports.generateProjectStatusByPhase(d1, {
                        projs : [pid],
                        sDate : sd,
                        eDate : ed
                    },'BAR');
                    //                    timeSheet.reports.generateProjectStatusByPhase(d2, {
                    //                        projs : [pid],
                    //                        sDate : sd,
                    //                        eDate : ed
                    //                    },'PIE');
                    timeSheet.reports.generateProjectStatus(d3, {
                        projs : [pid],
                        sDate : sd,
                        eDate : ed
                    });
                    timeSheet.reports.generateProjectBudgetChart(d4, {
                        projs : [pid],
                        sDate : sd,
                        eDate : ed
                    });
                    try{
                        timeSheet.reports.generateBurnRateChart(d5,pid);
                    }catch(e){alert("Error While Generating Burn Rate : "+e);}
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
    </head>
    <body>
        <div id="projStatusDiv">
            <h4 class="chartHead top_border">Project Status</h4>
            <div class="chartBody bottom_border">
                <fieldset class="myFieldset">
                    <legend>Project Status</legend>

                    <table class="formFields">
                        <tr>
                            <td class="label">Enter Project Name</td>
                            <td class="label"><input type="text" id="PSprojId" /></td>
                        </tr>
                        <tr class="">
                            <td class="label">Status From</td>
                            <td class="label"><input type="text" id="PSstartDate"  class="date"  /></td>
                        </tr>
                        <tr class="">
                            <td class="label">Status To</td>
                            <td class="label"><input type="text" id="PSendDate"  class="date" /></td>
                        </tr>
                    </table>
                    <label style='color: green'>
                        <!--                        Note: The Charts loaded from the Project Start Date and End dates Automatically  -->
                    </label>
                </fieldset>
                <div class="TabsPanel top_border">
                    <div class="tabs">
                        <span class="top_border">Spent Hours</span>
                        <span class="top_border">Spent Budget</span>
                        <span class="top_border">Spent Hours-Bar</span>  
                        <span class="top_border">Spent Hours-Pie</span>  
                        <span class="top_border">Man Hours-Summary</span>
                        <span class="top_border">Project Projection</span>
                    </div>
                    <div class="tabsContainer">
                        <div id="PSLineChart" class="tabContent"></div>
                        <div id="PSBudgetChart" class="tabContent"></div>                        
                        <div id="PSBarChart" class="tabContent"></div>
                        <div id="PSPieChart" class="tabContent"></div>
                        <div id="PSNewChart" class="tabContent"></div>
                        <div id="PSBurnChart" class="tabContent"></div>
                    </div>
                </div>
                <!--                <label class="labelButton" id="PSreport">Download PDF Report</label>-->
            </div>            
        </div>
    </body>
</html>