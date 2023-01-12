<!--
To change this template, choose Tools | Templates
and open the template in the editor.
-->
<!DOCTYPE html>
<html>
    <head>
        <title>Time Sheet Module</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <!--        <script type="text/javascript" src="res/js/Calendar.js"></script>
                <script type="text/javascript" src="res/js/Core.js"></script>
                <script type="text/javascript" src="res/js/ModalDialog.js"></script>
                <script type="text/javascript" src="res/js/PMS.js"></script>
                <script type="text/javascript" src="res/js/PMSReports.js"></script>
                    
                <script type="text/javascript" src="res/js/date.js"></script>
                <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
                <script type="text/javascript" src="res/js/jquery.animate-shadow-min.js"></script>
                <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
                <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
                <script type="text/javascript" src="res/js/jquery.validate.js"></script>
                <script type="text/javascript" src="res/js/CustomValidation.js"></script>
                <script type="text/javascript" src="res/js/jquery.jscrollpane.min.js"></script>
                <script type="text/javascript" src="res/js/jquery.mousewheel.js"></script>
                <script type="text/javascript" src="res/js/ReportMaker.js"></script>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>-->


        <link rel="stylesheet" type="text/css" href="res/css/timesheet.css"/>
        <script type="text/javascript" src="res/js/TimeSheet_New.js"></script>

        <style type="text/css">

            body{
            }

            td
            {
                vertical-align: top;
            }            
        </style>

        <script type="text/javascript">
            var minDate = new Date();
            minDate.moveToFirstDayOfWeek();
            minDate.addDays(-14);            
            var timeSheet;
            var sheetObj = [];
            var viewMode = 0;
            var sDate,eDate;
            var employeeId = 'ACE_EMP_0009';
            var empName = null;
            var popUpDiv;
            
            /** This Object Holds teh Usaer Related Project Information */
            var userProjInfo;
            
            function getPhases(projObj,empId)
            {
                //$('#myDiv').append($.toJSON(projObj));
                var empPhases = [];
                var ph = projObj.phases;                
                //alert($.toJSON(ph));
                
                // If there are No Phases then Return 'null'
                if(ph.length<1){
                    return null;
                }
                
                for(var i=0;i<ph.length;i++)
                {
                    //alert($.toJSON(ph[i]));
                    //alert(ph[i].LM);
                    if(ph[i].S && Date.parse(ph[i].LM) >= minDate)
                        empPhases.push(ph[i].P);
                }
                
                // If There are No Phases then Return Null
                if(empPhases.length<1)
                    return null;
                return {projId:projObj.projId,title:projObj.title,phases:empPhases};
            }
            
            $(function()
            {   
                
                $('#empChooser').change(function(){
                    var val = $(this).val();
                    if(val.length>1)
                        generateSheet(val);
                
                });
                generateSheet($('#empId').html());
                viewMode = parseInt($('#viewMode').html());
                sDate = $('#startDate').html();
                eDate = $('#endDate').html();
                empName = $('#empName').html();
                
                
                if(sDate.length<1)
                {
                    sDate = new Date();
                    eDate = new Date();
                    sDate.moveToFirstDayOfWeek();
                    eDate.moveToLastDayOfWeek();
                    //alert(sDate+"  "+eDate);
                }
                else{
                    sDate = Date.parse(sDate);
                    eDate = Date.parse(eDate);
                }
                if(viewMode == 1){
                    $('#sheetBtn').hide();
                }
                
                $('#sheetBtn').click(function()
                {
                    var overlayDiv = $('.overlayDiv');
                    var frame = $('iframe[name="TSsettingsFrame"]');
                    $(overlayDiv).show().css({
                        height:$(window).height(),width:$(window).width(),
                        left:$(overlayDiv).width(),top:0
                    }).fadeTo(500,0.6,null);
                    
                    $(frame).attr({'src':'test.jsp?empId='+employeeId});
                    $(popUpDiv).css({
                        'left':($(window).width()-$(frame).width())/2,
                        'top':($(window).height()-$(frame).height())/2
                    }).show();                    
                });
                
                $('#sheetCloseBtn').click(function(){
                    $(popUpDiv).hide(500);
                    $('.overlayDiv').hide(500);
                    generateSheet($('#empId').html());                    
                });                
                                
            });
            
            
            function generateSheet(empId)
            {
                sheetObj = [];
                employeeId = empId;
                employeeId = employeeId.length<1?"ACE_EMP_0002":employeeId;                
                
                popUpDiv = $('#TSsettingsDiv');
                
                //alert(userProjInfo.length);
                
                $.get("manageTimeHandler.do",{mode:0,empId:employeeId},function(data)
                {
                    data = data.length<1?"{}":data;
                    userProjInfo = eval("("+data+")");
                    //alert(userProjInfo);
                    //$('#myDiv').html($.toJSON(userProjInfo));
                    //alert(userProjInfo.projInfo.empId);
                    var phases = [];
                    if(userProjInfo.length>0)
                    { 
                        var projects = userProjInfo;
                    
                        for(var i=0;i<projects.length;i++)
                        {
                            try
                            {
                                //alert($.toJSON(sheetObj));
                                phases = getPhases(projects[i], employeeId);
                                if(phases != null)
                                    sheetObj.push(phases);
                            
                            }catch(e){alert(e);}
                        }
                    }                    
                    
                    timeSheet = new TimeSheet($('#sheetDiv'), {sheetTableCSS:'timeSheet',
                        dataRetriveURL:'timeSheetHandler.do',
                        startDate:Date.parse('1-Mar-2012'),
                        endDate:Date.parse('31-Mar-2012'),
                        dataStoreURL:'timeSheetHandler.do'});
                
                    $('#sheetDiv').html("").append(timeSheet.makeTimeSheetDiv());
                    //alert($('#sheetDiv').html());
                    //$('.timeSheetDiv','#sheetDiv').show();
                
                    timeSheet = new TimeSheet($('.timeSheetDiv','#sheetDiv'), {
                        startDate:Date.parse('1-Mar-2012'),
                        endDate:Date.parse('31-Mar-2012'),
                        sheetTableCSS:'timeSheet'
                    });                    
                    //alert("View Mode is :"+viewMode);
                    
                    timeSheet.generateTimeSheet("",{
                        empId:employeeId,
                        empName : empName,
                        sheetObj: sheetObj,
                        heading:'Time Sheet',
                        mode:viewMode,
                        startDate:sDate,
                        endDate:eDate,
                        dataRetriveURL:'timeSheetHandler.do',
                        dataStoreURL:'timeSheetHandler.do',
                        saveHandler : function(data){
                            //$('#myDiv').html($.toJSON(userProjInfo));
                            updatePhaseState(data.projId, data.phase, "");
                            //alert($.toJSON(data));
                        }
                    });                    
                    
                    try{
                        //timeSheet.generateWeeklyStatus($('#statusDiv')[0]);
                    }catch(e){alert(e);}
                    
                    
                });
                
                
            }            
            
            /**
             * This Method Updates the UserProjInfo at the Specified phase of the Purticular 
             * Project
             */
            function updatePhaseState(projId,phase,date){
                var projs = userProjInfo;
                var project = null;
                for(var i=0;i<projs.length;i++){
                    if(projs[i].projId == projId){
                        project = projs[i];
                        break;
                    }
                }                
                if(project == null)
                    return;                
                
                var phaseObj = null;
                for(i=0;i<project.phases.length;i++){
                    if(project.phases[i].P == phase){
                        phaseObj = project.phases[i];
                        break;
                    }
                }
                
                phaseObj.LM = new Date().toString('yyyy-MM-dd');
                $.post("manageTimeHandler.do",{mode:1,empId:employeeId,data:$.toJSON(userProjInfo)},function(data){
                    //alert("Data Retrived Is :"+data);
                });
                //$('#myDiv').append("<hr>").append($.toJSON(userProjInfo));
                //alert($.toJSON(phaseObj));
            }
        </script>

        <style type="text/css">
            #TSsettingsDiv{
                position: absolute;
                display: none;
                padding: 10px;
                background: #badff0;                
            }

            .overlayDiv{
                position: fixed;
                background: black;
            }
        </style>



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

        <%
            String empId = request.getParameter("empId");
            String mode = request.getParameter("mode");
            String sDate = request.getParameter("sDate");
            String eDate = request.getParameter("eDate");
            String name = request.getParameter("empName");
            out.print("<label id='empId' style='display:none'>" + (empId == null ? "" : empId) + "</label>");
            out.print("<label id='empName' style='display:none'>" + (name == null ? "" : name) + "</label>");
            out.print("<label id='viewMode' style='display:none'>" + (mode == null ? "0" : mode) + "</label>");
            out.print("<label id='startDate' style='display:none'>" + (sDate == null ? "" : sDate) + "</label>");
            out.print("<label id='endDate' style='display:none'>" + (eDate == null ? "" : eDate) + "</label>");
        %>

        <select id="empChooser" style="display:none">
            <option value=""></option>
            <option value="ACE_EMP_0008">Samba</option>
            <option value="ACE_EMP_0009">Naga Srinu</option>
            <option value="ACE_EMP_0003">Prashanth</option>
            <option value="ACE_EMP_0002">Dinesh</option>
            <option value="ACE_INT_0002">Ramya</option>
            <option value="ACE_EMP_0010">Puchhu Beerakaya</option>
        </select>

        <div id="sheetDiv">
        </div>
        <button id="sheetBtn" class="button">Manage Time Sheet</button>

        <div id="myDiv"></div>

        <div class="overlayDiv">            
        </div>
        <div id="TSsettingsDiv" class="border10">
            <h4 style="text-align: center;margin: 0px;padding:0px">Manage Your Time Sheet</h4>            
            <iframe name="TSsettingsFrame" width="820" height="450"></iframe><br/>
            <label class="labelButton" id="sheetCloseBtn" style="padding: 5px 15px;float: right">Close</label>
        </div>        
    </body>
</html>
