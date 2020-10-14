<%-- 
    Document   : Home
    Created on : Dec 20, 2011, 11:06:46 AM
    Author     : Undi
--%>
<%@page import="java.util.*" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <title>Project Management System</title>
        <%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
        <%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
        <%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

        <!--
        Time Sheet Module Imports
        -->
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/rgbcolor.js"></script> 
        <script type="text/javascript" src="http://canvg.googlecode.com/svn/trunk/canvg.js"></script>
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/Calendar.js"></script>
        <script type="text/javascript" src="res/js/Core.js"></script>
        <script type="text/javascript" src="res/js/ModalDialog.js"></script>
        <script type="text/javascript" src="res/js/PMS.js"></script>
        <script type="text/javascript" src="res/js/PMSReports.js"></script>
        <script type="text/javascript" src="res/js/TimeSheet.js"></script>
        <script type="text/javascript" src="res/js/date.js"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.animate-shadow-min.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript" src="res/js/jquery.jscrollpane.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.mousewheel.js"></script>
        <script type="text/javascript" src="res/js/ReportMaker.js"></script>
        <script type="text/javascript" src="res/js/AutoFill.js"></script>        
        <script type="text/javascript" src="res/js/AceCharting.js"></script>        

        <link rel="stylesheet" type="text/css" href="res/css/timesheet.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/salarySheet.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/calendar.css"/>
        <!--
        Time Sheet Imports Ends Here
        -->                

        <style type="text/css">
            #centerPanel
            {
                border: 0px solid lightblue;
            }
            .scroll-pane
            {
            }

            .projectDiv{
                border: 1px solid grey;
            }      
            .homepage{
                cursor: pointer;
                text-decoration: underline;
                color: #0000ff;
            }
        </style>


        <script type="text/javascript">
            $.get("employeeHandler.do?mode=3",null,function(data){
                if(data == "INVALID")
                {                    
                    window.location = "Login.jsp";
                }
            });
                        
            //loading the Goole Chart Library for Charts
            google.load("visualization", "1", {packages:["corechart"]});
            
            
            // Global Scripting Code for Persisting the Data For The Entire State
            /** THis Object holds the Selecfted Employee Id */
            var selEmpId;
            // This Object holds the Administrator Id
            var adminId;
            /** This Object holds the Selected Project Id */
            var selProjId;
            var projListElement;
            
            var adminProjsLoaded = false;
            
            var timeSheet;
            var toolTip = new ToolTip(null, {divCSS:'toolTipCSS'});            
            
            // This Division holds the Charts Html Content loaded through AJAX
            var chartsDiv = null;
            
            /**
             * This Method Used to Initialize the Requred Components
             */
            function initialize()
            {
                adminId = $('#selEmpId').html();                
                loadAdminProjList();
                //generateNoise(1.5); // default opacity is .2 
                
                registerAccordationDivs();
                // Registering MyList Hover Effects
                registerMyListHoverEffect();
                registerReportsList();
                registerScrollPane();
                registerToolTips();
                registerAdminReports()
                
                timeSheet = new TimeSheet($('.timeSheetDiv'),{sheetTableCSS:'timeSheet',
                    dataRetriveURL:'timeSheetHandler.do',
                    dataStoreURL:'timeSheetHandler.do'});
                
                projListElement = document.getElementById('projList');
                
                loadCenterPanel();
            }
            
            
            /**
             * This Method Load teh Cewnter Panel
             */
            function loadCenterPanel()
            {
                var page = $('#outputPage')[0];
                if(page)
                {
                    page = page.innerHTML;
                    //                    alert(page);
                    $.get("empRegistration.jsp",null,function(data){
                        //                        alert(data);
                        $('#centerPanel').append(data);
                    });
                }
            }
            
            
            /**
             * This Method Register the Tool tips
             */
            function registerToolTips(eles)
            {
                eles = !eles?$('.toolTip'):eles;                
                toolTip.registerField(eles);
            }
            
            
            /**
             * This Method Loads the Admin Project List
             */
            function loadAdminProjList()
            {
                var xml = NCore.makeXMLObject();
                xml.open("GET","projectHandler.do?mode=1&empId="+adminId,true);
                xml.onreadystatechange = function()
                {
                    if(xml.readyState==4 && xml.status==200)
                    {
                        var empObj = eval("("+xml.responseText+")");
                        //alert($.toJSON(empObj));
                        var projs = empObj.projs;
                        var cnt = "";
                        for(var i=0;i<projs.length;i++)
                        {
                            cnt += "<li title='"+projs[i].pid+"'>"+projs[i].pidName+"(<span style='color:black;font-size:9px;font-weight:bold'>"+projs[i].pid+"</span>)"+"</li>";
                        }
                        $('#adminProjList').html(cnt);
                        registerMyListHoverEffect($('#adminProjList'));
                        
                        var currLi;
                        var prevLi;
                        $('#adminProjList').find('li').click(function()
                        {
                            prevLi = currLi;
                            currLi = this;
                            $(prevLi).removeClass('selected');
                            $(this).addClass('selected');
                            
                            var pid = $(this).attr('title');
                            $.get("projectHandler.do?mode=0&pid="+pid, null, function(data)
                            {
                                var phasesObj = eval("("+data+")");
                                var phases = [];
                                for(var i=0;i<phasesObj.length;i++)
                                {
                                    phases.push(phasesObj[i].pName);
                                }                                
                                $('#centerPanel').html("").append(timeSheet.makeTimeSheetDiv());
                                timeSheet = new TimeSheet($('.timeSheetDiv',$('#centerPanel')), {
                                    sheetTableCSS:'timeSheet',
                                    dataRetriveURL:'timeSheetHandler.do',
                                    dataStoreURL:'timeSheetHandler.do'
                                });
                                timeSheet.generateTimeSheet("",{
                                    empId:adminId,
                                    projectId:pid,
                                    taskCategories:phases
                                });                                
                            });
                        });
                        //alert(projs);
                        adminProjsLoaded = true;
                        
                        registerSearchBoxes($('#adminProjList'));
                    }
                    
                    
                }
                xml.send(null);
            }
            
            
            /**
             * THis Method Loads the All available Employees from the Data Base
             */
            function loadEmployeeList()
            {
                $.get("employeeHandler.do",{"mode":"0"},function(data)
                {
                    data = eval("("+data+")");
                    var list = $('#empList');
                    $(list).html("");
                    for(var i=0;i<data.length;i++)
                    {
                        var empObj = data[i];
                        $(list).append("<li key='"+empObj.empId+"'>"+empObj.firstName+"("+empObj.initial+")"+"</li>");
                    }
                    registerMyListHoverEffect($('#empList'));
                    var lis = $("#empList").find('li');
                
                    // Registering the Click Events
                    var prevEmp;
                    var currEmp;
                    $(lis).click(function()
                    {
                        prevEmp = currEmp;
                        currEmp = this;
                    
                        $(prevEmp).removeClass('selected');
                        $(this).addClass('selected');
                    
                        selEmpId = $(this).attr('key');
                        //alert(selEmpId);
                        var xml = NCore.makeXMLObject();
                        $.get("projectHandler.do?mode=1&empId="+selEmpId,null,function(data){
                            var empObj = eval("("+data+")");
                            handleEmployeeResponse(empObj);
                        });
                        
                        Mask.showMask($('.bodyLayout'), {});
                        $.get("Registration.do",{'VWempId':selEmpId,'viewMode':1},function(data){
                            $('#centerPanel').html("").append(data);
                            Mask.hideMask($('.bodyLayout'));
                        });
                    });
                    
                    // Registering for the Search box
                    registerSearchBoxes($('#empList'));
                });
                
            }
            
            /**
             * This MEthod Register the Admin Reports
             */
            function registerAdminReports()
            {
                var currLi;
                var prevLi;
                
                $('#adminReportsList').find('li').click(function(){
                    prevLi = currLi;
                    currLi = this;                    
                    $(prevLi).removeClass('selected');
                    $(currLi).addClass('selected');
                    var key = $(this).attr('key');
                    switch(key){
                        case 'MY_STATUS':                            
                            var report = new  ReportMaker(timeSheet);
                            $('#centerPanel').html("").append(report.makeEmpStatusDiv(timeSheet,adminId));
                            break;
                        case 'WTL':
                            $('#centerPanel').html('').append("<img src='res/images/working.jpg' alt='Under Development' />");
                            break;
                    }
                })
            }
            
            
            /**
             * This Method Register the Scroll Panes that are Currently Available in the Document
             */
            function registerScrollPane(div)
            {
                $('.scroll-pane').jScrollPane();                
            }
            
            /**
             * This Method Register the Hover effect to the All My List Elements
             * in this document
             */
            function registerMyListHoverEffect(element)
            {
                element = !element?$('.myList'):element;
                $(element).each(function(){
                    var prevLi;
                    var currLi;
                    
                    $(this).find('li').hover(function(){
                        $(this).stop().animate({'padding-left':'20px'}, 300, "linear", null);
                        $(this).addClass('hover');
                    },function(){
                        $(this).stop().animate({'padding-left':'10px'}, 100, "linear", null);
                        $(this).removeClass('hover');
                    });                    
                });
            }
            
            
            /**
             * THis Method Register the Search box for the given list element
             */
            function registerSearchBoxes(element){
                var searchBox = $(element).siblings('.searchBox');
                var searchEle = $(searchBox).find('input')[0];                
                $(searchEle).keyup(function(){
                    var key = $(this).val();
                    key = key.toLowerCase();
                    $(element).find('li').show();
                    $(element).find('li').each(function(ind){
                        var val = $(this).html();
                        val = val.toLowerCase();
                        if(val.indexOf(key)<0)
                        {
                            $(this).hide();                            
                        }
                    });
                });
            }
            
            
            /**
             * This Method Register the Foldable Divs
             */
            function registerAccordationDivs()
            {                
                var selInd = -1;
                $('.accordationContainer').each(function(ind)
                {
                    selInd = ind;
                    var prevDiv;
                    var currDiv;
                    $(this).find('.accordationDiv').find('.accordationContent').slideUp(0, null);
                    $(this).find('.accordationDiv').find('.accordationContent').eq(0).slideDown(0, null);
                    currDiv = $(this).find('.accordationDiv').find('.accordationContent').eq(0);
                    
                    $(this).find('.accordationDiv').find('.accordationHead').click(function()
                    {
                        
                        prevDiv = currDiv;
                        var cntDiv = $(this).siblings('.accordationContent');
                        currDiv = cntDiv;
                        
                        if($(prevDiv).html() == $(currDiv).html())
                            return;
                        
                        // First Clearing the Center Panel
                        $('#centerPanel').html('');
                        
                        if(this.innerHTML != "Employees")
                        {
                            $('#rightPanel').hide().css({"width":'0px'});
                            // hack for Table Resizing
                            $('#centerPanel').css({'width':'780px'});
                        }
                        else                        
                        {
                            $('#rightPanel').show().css({"width":"200px"});
                            // hack for Table Resizing
                            $('#centerPanel').css({'width':'580px'});
                        }                        
                        
                        
                        
                        
                        $(currDiv).find('*').show();
                        //alert(currDiv[0].innerHTML);
                        
                        $(prevDiv).slideUp(1000, null);
                        $(prevDiv).siblings('.accordationHead').addClass('bottom_border');
                        $(cntDiv).slideDown(1000, null);
                        $(this).removeClass('bottom_border');                    
                    });
                    
                    $(this).find('.accordationDiv').find('.accordationHead').hover(function(){
                        $(this).addClass('hover');
                    },function(){
                        $(this).removeClass('hover');
                    });
                });
                
                /**
                 * This MEthod Handles the Accordation Selections
                 */
                function handleAccordationSelection(ind)
                {
                    alert("Current Showindex is : "+ind);
                }

            }
            
            
            /**
             * This Method Register the Project List for the Selected Employee
             */
            function registerProjectList()
            {
                var lis = $(projListElement).find('li');
                var prevLi;
                var currLi;
                $(lis).click(function() 
                {
                    prevLi = currLi;
                    currLi = this;
                    // First Removing the Selection from the LIst
                    $(prevLi).removeClass('selected');
                    $(this).addClass('selected');
                    selProjId = $(this).attr('title');
                    var xml = NCore.makeXMLObject();
                    xml.open("GET","projectHandler.do?mode=0&pid="+selProjId,true);
                    xml.onreadystatechange = function()
                    {
                        if(xml.readyState==4&&xml.status==200)
                        {
                            $('#centerPanel').html("").append(timeSheet.makeTimeSheetDiv());
                            timeSheet = new TimeSheet($('.timeSheetDiv',$('#centerPanel')), {
                                sheetTableCSS:'timeSheet',
                                dataRetriveURL:'timeSheetHandler.do',
                                dataStoreURL:'timeSheetHandler.do'
                            });
                            
                            var phasesObj = eval("("+xml.responseText+")");
                            var phases = [];
                            for(var i=0;i<phasesObj.length;i++)
                            {
                                phases.push(phasesObj[i].pName);
                            }                                
                            timeSheet.generateTimeSheet("",{
                                empId:selEmpId,
                                projectId:selProjId,
                                taskCategories:phases
                            });                                
                        }                                
                    }
                    xml.send(null);
                });                
                registerMyListHoverEffect(projListElement);                
            }            
            
            /**
             * This Method Used to register the Reports list
             */
            function registerReportsList()
            {
                var currLi;
                var prevLi;
                
                $('#reportList').find('li').click(function()
                {
                    var ME = this;
                    prevLi = currLi;
                    currLi = this;
                    $(prevLi).removeClass("selected");
                    $(currLi).addClass("selected");
                    
                    
                    Mask.showMask($('#reportList')[0], {});                                        
                    //Mask.showMask($('#centerPanel')[0], {});
                    
                    $('#centerPanel').html("");
                    var val = $(this).attr('key');
                    switch(val)
                    {
                        case 'MAN_HOUR_SURVEY':                                                        
                            $.get("pages/charts/manHourSurvey.html", null, function(data){
                                $('#centerPanel').append(data);
                                Mask.hideMask($('#reportList')[0]);
                            });                            
                            break;
                        case 'SAL_SHEET':                            
                            $.get("pages/charts/salarySheet.html", null, function(data){
                                $('#centerPanel').append(data);
                                Mask.hideMask($('#reportList')[0]);
                            });
                            break;
                        case 'EMP_STATUS':                            
                            $.get("pages/charts/old.html", null, function(data){                                
                                $('#centerPanel').append(data);
                                Mask.hideMask($('#reportList')[0]);
                            });
                            break;
                        case 'PROJ_STATUS':                            
                            $.get("pages/charts/projectStatus.html", null, function(data){
                                $('#centerPanel').append(data);
                                Mask.hideMask($('#reportList')[0]);
                            });
                            break;                        
                    }                    
                });
            }
            
            
            
            /**
             * This Method Handles the MEployee Response Whne the Admin Choose
             * the Purticular Employee From the List
             */
            function handleEmployeeResponse(empObj)
            {
                var infoDiv = $('#selEmpInfoDiv');                
                var ref = "Registration.do?UDempId="+encodeURI(empObj.empInfo.empId);
                $(infoDiv).html("").
                    append("Name : "+empObj.empInfo.empName).
                    append("<br/><a href='#' class='empEditLink link'><img src='images/edit.png'/></a>&nbsp;<a href='#' class='empDeleteLink link'><img src='images/delete.png'/></a>");
                var projs = empObj.projs;
                // First Clear The Previous Project List
                $(projListElement).html("");
                for(var i=0;i<projs.length;i++)
                {
                    $(projListElement).append("<li title='"+projs[i].pid+"'>"+projs[i].pidName+"</li>");
                }                
                // now Register the Projects List
                registerProjectList();
                $('#rightPanel').show();
                
                $('.empEditLink',infoDiv).click(function(){
                    $.get(ref,null,function(data){
                        $('#centerPanel').html("").append(data);
                    });
                    return null;
                });
                var link = "employeeHandler.do?DempId="+encodeURI(empObj.empInfo.empId)+"&mode=5"; 
                //var ref = "Registration.do?UDempId="+encodeURI(empObj.empInfo.empId);
                $('.empDeleteLink',infoDiv).click(function(){
                    //alert("ref")
                    var confrm = confirm("Are you sure you want to delete this Employee?");
                    if(confrm)
                    {
                        $.get(link,null,function(data)
                        {
                            alert(data);
                            $('#centerPanel').html("").append(data);
                            loadEmployeeList();
                        });
                        //alert("Testing: "+confrm)
                        return null;
                    }
                });
            }
            
            /**
             * This Method Register the Menu Handlings
             */
            function registerMenu()
            {
                var menuEles = $('.menu').find('li a');
                var currLi;
                var prevLi;
                
                $(menuEles).click(function(){
                    prevLi = currLi;
                    currLi = this;
                    
                    $(prevLi).removeClass('selected');
                    $(currLi).addClass('selected');
                    
                    var key = $(this).attr('key');                    
                    
                    // Applying the Mask by Default
                    Mask.showMask($('.bodyLayout'), {});
                    
                    switch(key)
                    {                        
                        case 'HOME':                        
                            $('#adminProjList').find('li').eq(0).trigger('click', null);
                            Mask.hideMask($('.bodyLayout'));
                            break;
                        case 'REGISTRATION':
                            Mask.showMask($('.bodyLayout'), {});
                            $.get("empRegistration.jsp",null,function(data){
                                $('#centerPanel').html("").append(data);
                                Mask.hideMask($('.bodyLayout'));
                            });                            
                            break;                        
                        case 'PROJECTS':
                            var newurl="OverallProjectListAction.do";
                            //Mask.showMask($('#centerPanel')[0],{});
                            $.get(newurl,null,function(data){                                
                                data = eval("("+data+")");
                                $('#centerPanel').html("");
                                $('#centerPanel').html("<div align='right'><img id='addProject' alt='Add new Project' src='res/images/addProject.png' style='cursor:pointer' title='Add New Project'></img></div>");
                                for(var i=0;i<data.length;i++)
                                {
                                    $('#centerPanel').append(makeProjectDiv(data[i]));
                                }
                                $('#addProject').click(function(){
                                    
                                    
                                    $.get("ProjectManageEmployees.jsp",null,function(data){
                                        $('#centerPanel').html("").append(data);
                                    }); 
                                    
                                });
                                Mask.hideMask($('.bodyLayout'));
                                
                            });                            
                            
                            /**
                             *  This Method Makes the Project Div
                             */
                            function makeProjectDiv(projObj)
                            {
                                var div = document.createElement('div');
                                $(div).attr({'class':'foldableDiv'});
                                var cnt = "<h4 class='foldHeader top_border'>"+projObj.projName+"</h4>";
                                cnt += "<div class='foldableContent bottom_border'>";
                                cnt+="<table width='100%'>";
                                cnt +="<tr><td><p class='prjName' style='color:#555555; font-size:18px;'>Project Title  : "+projObj.projName+"</p><img class='edit'  align='right'  src='images/edit.png' title='Edit project' height='16' width='16'/><img class='delete' align='right' class='view' src='images/delete.png' title='Remove Project' height='16' width='16'/>";
                                cnt+="<p style='color:black; font-variant:bold;'>Team Leader  : "+projObj.TL+"</p>";
                                cnt+="<p>Start Date (yyyy-mm-dd)  :<font style='color:green;'> "+projObj.sDate+"</font>&nbsp&nbsp&nbsp&nbsp";
                                cnt+=" End Date (yyyy-mm-dd)      :<font style='color:red;'> "+projObj.eDate+"</font></p>";
                                cnt+="<p style=''>State(Open/Close)      :<font style='color:black;'> "+projObj.state+"</font>&nbsp&nbsp&nbsp&nbsp";
                                cnt+="Percent done      :<font style='color:black;'>  "+projObj.percent+"</font>%&nbsp&nbsp&nbsp&nbsp";
                                cnt+="Version      :<font style='color:black;'>  "+projObj.version+"</font></p>";
                                cnt+="Project Id     :<font style='color:blue;'>  "+projObj.projId+"</font></p>";
                                cnt+="</td></tr>";
                                cnt += "</table>";
                                cnt += "</div>";
                                
                                $(div).append(cnt);
                                
                                $(div).find('.edit').click(function()
                                {
                                    
                                    Mask.showMask($('.bodyLayout'), {});                                    
                                    $.get("projectAction.do?UDprojId="+projObj.projId,null,function(data){
                                        $('#centerPanel').html("").append(data);
                                        $("#businessDiv",$('#centerPanel')).hide();
                                        Mask.hideMask($('.bodyLayout'));
                                    });                             
                                });
                                
                                $(div).find('.delete').click(function()
                                {
                                    if(window.confirm("Are you sure to Delete this Project?\nThis will delete the Project from the Active Projects List"))
                                    {
                                        $.get("projectHandler.do",{'mode':'5','pid':projObj.projId},function(data){
                                            $(div).remove();
                                            alert("Project Deleted Successfully");                                        
                                            //$('#centerPanel').html("").append(data);
                                            //Mask.hideMask($('.bodyLayout'));
                                        });
                                    }
                                    
                                    
                                    
                                });
                                
                                
                                $(div).find('.foldableContent').hide();
                                $(div).find('.foldHeader').addClass('bottom_border');
                                
                                // Registering the Foldable Division                                
                                $(div).find('.foldHeader').click(function(){
                                    var head = this;
                                    $(head).toggleClass('bottom_border');
                                    $(div).find('.foldableContent').slideToggle(500, function(){
                                        
                                    });
                                });
                             
                                return div;
                            }                
                            
                            break;
                        case 'BUSINESS_APPROVAL':
                            
                            $.get("businessApprovalHandler.do?mode=2",null,function(data){
                                //$('#centerPanel').html("").append(data);
                                data = eval("("+data+")");
                                //alert(data);
                                $('#centerPanel').html("");
                                $('#centerPanel').html("<div align='right'><img id='newApproval' alt='Add new Approval' src='res/images/addProject.png' style='cursor:pointer' title='Add New Approval'></img></div>");
                                for(var i=0;i<data.length;i++)
                                {
                                    $('#centerPanel').append(makeBisinessApprovalDiv(data[i]));
                                }
                                
                                $('#newApproval').click(function(){
                                    $.get("BussinessApprovalForm.jsp",null,function(data){
                                        $('#centerPanel').html("").append(data);
                                    });
                                });
                                Mask.hideMask($('.bodyLayout'));
                            });
                            //$.get("BussinessApprovalForm.jsp",null,function(data){
                            //$('#centerPanel').html("").append(data);
                            //Mask.hideMask($('.bodyLayout'));
                            //});
                             
                            //$('#centerPanel').html("<img src='res/images/working.jpg' alt='Under Development' />");
                            //Mask.hideMask($('.bodyLayout'));
                            
                            
                            function makeBisinessApprovalDiv(appObj)
                            {
                                var div = document.createElement('div');
                                $(div).attr({'class':'foldableDiv'});
                                var cnt = "<h4 class='foldHeader top_border'>"+appObj.projName+"</h4>";
                                cnt += "<div class='foldableContent bottom_border'>";
                                cnt+="<table width='100%'>";
                                cnt +="<tr><td><p class='prjName' style='color:#555555; font-size:18px;'>Project Title  : "+appObj.projName+"</p><img class='edit'  align='right'  src='images/edit.png' title='Edit Approval Details' height='16' width='16'/><img class='delete' align='right' class='view' src='images/delete.png' title='Remove Approval Details' height='16' width='16'/>";
                                cnt+="<p style='color:black; font-variant:bold;'>Approval Id  : "+appObj.approvalId+"</p>";
                                cnt+="<p>Custemer Name  :<font style='color:green;'> "+appObj.custemerName+"</font>&nbsp&nbsp&nbsp&nbsp";
                                cnt+=" Start Date (yyyy-mm-dd)      :<font style='color:red;'> "+appObj.startDate+"</font></p>";
                                cnt+="<p style=''>End Date (yyyy-mm-dd)      :<font style='color:black;'> "+appObj.endDate+"</font>&nbsp&nbsp&nbsp&nbsp";
                                cnt+="Project Cost      :<font style='color:black;'>  "+appObj.projCost+"</font>&nbsp&nbsp&nbsp&nbsp";
                                //                                cnt+="Version      :<font style='color:black;'>  "+appObj.version+"</font></p>";
                                //                                cnt+="Project Id     :<font style='color:blue;'>  "+appObj.projId+"</font></p>";
                                cnt+="</td></tr>";
                                cnt += "</table>";
                                cnt += "</div>";
                                
                                $(div).append(cnt);
                                
                                $(div).find('.edit').click(function()
                                {
                                    Mask.showMask($('.bodyLayout'), {});                                    
                                    $.get("BusinessApproval.do?UDapprovalId="+appObj.approvalId,null,function(data){
                                        $('#centerPanel').html("").append(data);
                                        Mask.hideMask($('.bodyLayout'));
                                    });                             
                                });
                                
                                $(div).find('.delete').click(function()
                                {
                                    if(window.confirm("Are you sure to Delete this Approval Info?"))
                                    {
                                        $.get("businessApprovalHandler.do",{'mode':'3','approvalid':appObj.approvalId},function(data){
                                            $(div).remove();
                                            alert("Approval Deleted Successfully");                                        
                                            //$('#centerPanel').html("").append(data);
                                            //Mask.hideMask($('.bodyLayout'));
                                        });
                                    }                                   
                                });
                               
                                
                                $(div).find('.foldableContent').hide();
                                $(div).find('.foldHeader').addClass('bottom_border');
                                
                                // Registering the Foldable Division                                
                                $(div).find('.foldHeader').click(function(){
                                    var head = this;
                                    $(head).toggleClass('bottom_border');
                                    $(div).find('.foldableContent').slideToggle(500, function(){
                                        
                                    });
                                });
                             
                                return div;
                            }
                            
                            break;                        
                    }
                    return null;
                }).hover(function(){
                    $(this).addClass('hover');
                },function(){
                    $(this).removeClass('hover');
                });
            }            
            
            $(function()
            {
                initialize();
                // Registering the Employee List
                loadEmployeeList();                
                registerMenu();
                 
            });
        </script>
    </head>
    <body>
        <table class="bodyLayout"  border="0">
            <!-- Header Block Starts Here -->
            <tr>
                <td colspan="3">
                    <jsp:include page="header.jsp"></jsp:include>
                </td>
            </tr>            
            <!-- Header Block Ends Here -->

            <tr>
                <td colspan="3">
                    <ul class="menu">
                        <li class="outer left_border">&nbsp;</li>
                        <li><a href="#" key="HOME">Home</a></li>
                        <li><a href="#" key="REGISTRATION">Registration</a></li>
                        <li><a href="#" key="PROJECTS">Projects</a></li>
                        <li><a href="#" key="BUSINESS_APPROVAL">Business Approval</a></li>                        
                        <li class="outer right_border">&nbsp;</li>
                    </ul>                    
                </td>
            </tr>
            <!-- Menu Block Ends Here -->

            <tr>
                <td colspan="3">
                    <div id="empInfoDiv" class="empInfoDiv" style="display:none">
                        <label style="display:none" id="selEmpId"><bean:write name="LoginActionFormBean" property="empId" /></label>
                        <label class="label">Login User </label><label class="data">: <bean:write name="LoginActionFormBean" property="empnameinfo" /></label>
                        <label class="label">Email-id </label><label class="data">: <bean:write name="LoginActionFormBean" property="emailidinfo" /></label><br/>
                        <label class="label">Contact Number </label><label class="data">: <bean:write name="LoginActionFormBean" property="contactnumberinfo" /></label>
                        <label class="label">Employee Type </label><label class="data">: <bean:write name="LoginActionFormBean" property="emptypeinfo" /></label>
                    </div>
                </td>
            </tr>

            <!-- Body of the Container Starts Here -->
            <tr>

                <!-- Employee List Cell -->
                <td valign="top" align="left" width="200px">
                    <div id="leftPanel" class="accordationContainer bottom_border">

                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border toolTip" title="Lets you book your hours">My Time Sheet</h4>
                            <div class="accordationContent bottom_border">
                                <div class="searchBox">
                                    <input type="text" name="searchText" /><img src="res/images/icons/search_icon.png" align="middle"/>
                                </div>
                                <ul id="adminProjList" class="myList">
                                </ul>
                            </div>
                        </div>

                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border toolTip" title="Lets you show your working Status">My Reports</h4>
                            <div class="accordationContent bottom_border">
                                <ul id="adminReportsList" class="myList">
                                    <li key="MY_STATUS">My Status</li>
                                    <li key="WTL">Weekly Task List</li>
                                </ul>
                            </div>
                        </div>

                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border toolTip" title="Lets analyze Company Status">Reports</h4>
                            <div class="accordationContent bottom_border">
                                <ul id="reportList" class="myList">
                                    <li key="EMP_STATUS">Employee Status</li>
                                    <li key="MAN_HOUR_SURVEY">Man Hours Survey</li>
                                    <li key="PROJ_STATUS">Project Status</li>
                                    <li key="SAL_SHEET">Salary Sheet</li>
                                </ul>
                            </div>
                        </div>

                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border toolTip" title="Lets show what Employees done">Employees</h4>
                            <div class="accordationContent bottom_border">
                                <div class="searchBox">
                                    <input type="text" name="searchText" /><img src="res/images/icons/search_icon.png" align="middle"/>
                                </div>
                                <ul id="empList" class="myList">
                                </ul>
                            </div>
                        </div>
                    </div>
                </td>



                <!-- Output Window Cell -->


                <%
                    String register = request.getParameter("register");
                    if (register != null) {
                        if (register.equalsIgnoreCase("reg")) {
                %>
                <td valign="top"><h4>Successfully registered. <a href="/PMS/Home.jsp" class="homepage" name="homepage">click here</a> goto home page.</h4></td>            
                <%                }
                    if (register.equalsIgnoreCase("updatereg")) {
                %>
                <td valign="top"><h4>Successfully Updated. <a href="/PMS/Home.jsp" class="homepage" name="homepage">click here</a> goto home page.</h4></td>
                <%}
                } else {
                %>


                <td  style="vertical-align: top;display: run-in" id="centerCell">
                    <div id="centerPanel" style="max-width: 780px">

                        <logic:present name="LoginActionFormBean">
                            <script type="text/javascript">
                                var counter = window.setInterval(function()
                                {
                                    if(adminProjsLoaded){
                                        $('#adminProjList').find('li').eq(0).trigger('click', null);
                                        window.clearInterval(counter);
                                    }
                                    
                                }, 100);                                
                            </script>
                        </logic:present>

                        <!-- THis is for Project Registration Form -->
                        <logic:present name="ProjectForm">
                            <logic:equal name="ProjectForm" property="actionState" value="true">
                                <label id="PFBstatus"><bean:write name="ProjectForm" property="actionStatus"/></label>
                                <h4 class="successInfo border10">
                                    <script type="text/javascript">
                                        Mask.showMask($('.bodyLayout'), {});
                                        var text = $('#PFBstatus').html();
                                        window.location = "Home.jsp";
                                        $('#centerPanel').html(text);
                                    </script>
                                    <bean:write name="ProjectForm" property="actionStatus"/>                                
                                </h4>
                            </logic:equal>
                            <logic:notEqual name="ProjectForm" property="actionState" value="true">
                                <h4 calss="errorInfo border10">
                                    Please fill the Errors before submitting form
                                    <bean:write name="ProjectForm" property="actionStatus" />
                                </h4>
                                <jsp:include page="ProjectManageEmployees.jsp"></jsp:include>
                            </logic:notEqual>
                        </logic:present>
                        <!-- THis is for Project Registration Form Ends Here -->

                        <!-- THis is for Employee Registration Form -->
                        <logic:present name="RegistrationFormBean">                            
                            <logic:equal name="RegistrationFormBean" property="actionState" value="true"> 
                                <h4 class="successInfo border10">
                                    <label id="RFBstatus"><bean:write name="RegistrationFormBean" property="actionStatus"/></label>
                                    <script type="text/javascript">                               
                                        Mask.showMask($('.bodyLayout'), {});
                                        alert($('#RFBstatus').html());
                                        window.location = "Home.jsp";                                        
                                    </script> 
                                    <bean:write name="RegistrationFormBean" property="actionStatus"/>                                 
                                </h4> 
                            </logic:equal> 
                            <logic:notEqual name="RegistrationFormBean" property="actionState" value="true"> 
                                <h4 calss="errorInfo border10"> 
                                    Please fill the Errors before submitting form 
                                    <bean:write name="RegistrationFormBean" property="actionStatus" /> 
                                </h4> 
                                <jsp:include page="empRegistration.jsp"></jsp:include>
                            </logic:notEqual> 
                        </logic:present> 
                        <!-- THis is for Employee Registration Form Ends here --> 

                    </div>                     
                </td> 
                <%}%>

                <!-- Project List Cell --> 
                <td valign="top" align="right" style="max-width:200px">
                    <div id="rightPanel" style="display: none" class="accordationContainer"> 

                        <div class="accordationContainer"> 
                            <div class="foldableDiv"> 
                                <h4 class="foldHeader top_border">Employee Info</h4> 
                                <div id ="selEmpInfoDiv" class="foldableContent bottom_border"> 
                                </div>
                            </div>

                            <div class="foldableDiv"> 
                                <h4 class="foldHeader top_border">Projects Info</h4> 
                                <div class="foldableContent bottom_border"> 
                                    <ul id="projList" class="myList"> 
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </td>
            </tr>

            <!-- Footer of the Page -->
            <tfoot>
                <tr>
                    <td colspan="3">
                        <hr/>
                        <div style="text-align: center;padding: 10px;">
                            &COPY; By AceEngineer,<br/> 
                            Powered by Prarohana Enterprises Pvt LTD.
                        </div> 
                    </td> 
                </tr> 
            </tfoot> 
        </table>         
    </body> 
</html> 
