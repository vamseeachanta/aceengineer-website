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
            
            $(function()
            {                
                registerWPR(null);
            });
            
            function registerWPR(div)
            {
                //var calendar = new Calendar($('.date'), 1, 1, {});
                try{
                    $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                }catch(e){alert(e);}
                
                var sD = new Date();
                var eD = new Date();
                
                // Moving to The Previous Week
                sD.moveToDayOfWeek(0, -1).addDays(-1).moveToDayOfWeek(1, -1);
                eD.moveToDayOfWeek(0, -1);
                
                $('#wprSDate').val(sD.toString(StandardNotations.dateFormat));
                $('#wprEDate').val(eD.toString(StandardNotations.dateFormat));
                
                // Registering the Week Navigation Buttons
                $('#wprChartDiv').find('.weekNavigator').each(function(ind){
                    $(this).click(function(evt)
                    {
                        switch(ind)
                        {
                            case 0: // this is for Back Navigation
                                sD = sD.addDays(-7);
                                eD = sD.clone().addDays(6);
                                break;
                            case 1: // this is for Next Navigation
                                sD = sD.addDays(7);
                                eD = sD.clone().addDays(6);
                                break;
                        }
                        $('#wprSDate').val(sD.toString(StandardNotations.dateFormat));
                        $('#wprEDate').val(eD.toString(StandardNotations.dateFormat));
                        draw(sD,eD);
                    });
                   
                });
                
                $('#wprChartDiv').find('#wprSDate').change(function(){
                    sD = Date.parse($(this).val());
                    draw(sD,eD);
                });
                
                $('#wprChartDiv').find('#wprEDate').change(function(){
                    eD = Date.parse($(this).val());                
                    draw(sD,eD);
                });
                
                // Drawing The Default Chart
                draw(sD,eD);
                
                function draw(s,e)
                {
                    var div = document.getElementById('wprChart');
                    if(s > e)
                    {
                        $(div).html("<h4 class='errorInfo'>Unable to Draw chart please select proper dates</h4>");
                        return;
                    }
                    timeSheet.reports.generateWPR(div, {
                        //projs : [this.innerHTML],
                        //emps : ['EMP_0005','EMP_0006'],
                        sDate:s,
                        eDate:e
                    });
                }                
                //draw(sD,eD);
                // drawing with ther default Month
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
        <div id="wprChartDiv" class="">
            <h4 class="chartHead top_border">Man Hours Summary</h4>
            <div class="chartBody bottom_border">
                <fieldset class="myFieldset">
                    <legend>Man Hours Summary</legend>
                    <table class="formFields">
                        <tr>
                            <td class="label">Start Date</td>
                            <td><input type="text" id="wprSDate" value="2011-1-1" class="date"/></td>
                            <td rowspan="2">
                                <label class="labelButton weekNavigator">&lt;Previous Week</label>&nbsp;&nbsp;<label class='labelButton weekNavigator'>Next Week&gt;</label>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">End Date</td>
                            <td><input type="text" id="wprEDate" value="2012-1-31" class="date"/></td>
                        </tr>
                    </table>
                </fieldset>
                <div id="wprChart">
                </div>  
            </div>            
        </div>
    </body>
</html>