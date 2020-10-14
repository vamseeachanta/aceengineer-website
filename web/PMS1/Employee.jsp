<%-- 
    Document   : Home
    Created on : Dec 20, 2011, 11:06:46 AM
    Author     : Undi
--%>
<%@page import="java.util.*" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<!DOCTYPE html>
<html>
    <head>
        <title>Project Management System</title>
        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
        <!--        <script type="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>-->
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>

        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/Calendar.js"></script>
        <script type="text/javascript" src="res/js/Core.js"></script>
        <script type="text/javascript" src="res/js/ModalDialog.js"></script>
        <script type="text/javascript" src="res/js/PMS.js"></script>
        <script type="text/javascript" src="res/js/PMSReports.js"></script>
        <script type="text/javascript" src="res/js/TimeSheet_New.js"></script>
        <!--        <script type="text/javascript" src="res/js/TimeSheet.js"></script>-->
        <script type="text/javascript" src="res/js/date.js"></script>
        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>-->
        <script type="text/javascript" src="res/js/jquery.animate-shadow-min.js"></script>
        <script type="text/javascript" src="res/js/jquery.easing.1.3.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript" src="res/js/CustomValidation.js"></script>
        <script type="text/javascript" src="res/js/jquery.jscrollpane.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.mousewheel.js"></script>
        <script type="text/javascript" src="res/js/ReportMaker.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>

        <link rel="stylesheet" type="text/css" href="res/css/timesheet.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/salarySheet.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/jquery.jscrollpane.css"/>
        <link rel="stylesheet" type="text/css" href="res/css/calendar.css"/>




        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>


        <script type="text/javascript">
            $.get("employeeHandler.do?mode=3",null,function(data){
                if(data == "INVALID")
                {                    
                    window.location = "Login.jsp";
                }
            });
            
            //loading the Goole Chart Library for Charts
            google.load("visualization", "1", {packages:["corechart"]});
            
            // This Holds the Selected Employee ID            
            var selEmpId;
            // This holds the choosed employe id of the 
            var choosedEmpId;
            var selProjId;
            var timeSheet;
            
            
            var projListElement;
            var outputPanel;
            
            /*
            var timeSheet = new TimeSheet($('.timeSheetDiv'),{sheetTableCSS:'timeSheet',
                dataRetriveURL:'timeSheetHandler.do',
                dataStoreURL:'timeSheetHandler.do'});
             */
            
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
             * This MEthod Initializes trhe Required Objects Info
             */
            function initialize()
            {
                selEmpId = $('#selEmpId').html();
                projListElement = $('#projList');
                outputPanel = $('#outputPanel');
                
                $(outputPanel).html("<h4 class='mainHeading border10'>Welcome To Project Management System</h4>");
                
                loadProjects();
                loadEmployeeList();
                registerReports();
                
                registerMyListHoverEffect();
                registerAccordationDivs();
                registerMenu();
                
                
                timeSheet = new TimeSheet($('.timeSheetDiv'),{sheetTableCSS:'timeSheet',
                    dataRetriveURL:'timeSheetHandler.do',
                    dataStoreURL:'timeSheetHandler.do'});
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
                    
                        choosedEmpId = $(this).attr('key');
                        //alert(selEmpId);
                        Mask.showMask($('.bodyLayout'), {});
                        $.get("Registration.do",{'VWempId':choosedEmpId,'viewMode':'0'},function(data){
                            $(outputPanel).html("").append(data);
                            Mask.hideMask($('.bodyLayout'));
                        });                        
                    });
                    
                    // Registering for the Search box
                    registerSearchBoxes($('#empList'));
                });
                
            }
            
            /**
             * This MEthod used to Register the Reports List
             */
            function registerReports(){
                var prevLi;
                var currLi;
                $('#reportList').find('li').click(function(){
                    prevLi = currLi;
                    currLi = this;
                    $(prevLi).removeClass("selected");
                    $(this).addClass("selected");
                    var key = $(this).attr('title');
                    $(outputPanel).html("");
                    switch(key)
                    {
                        case 'empStatus':
                            try
                            {
                                var report = new  ReportMaker(timeSheet);
                                $(outputPanel).html("").append(report.makeEmpStatusDiv(timeSheet,selEmpId));
                                $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:'yy-mm-dd'});
                            }catch(e)
                            {alert(e);}
                            break;
                        case 'WEEKLY_TASK_LIST':
                            $(outputPanel).html("<img src='res/images/working.jpg' alt='Under Development' />");
                    }
                });
            }
            
            /**
             * This Method Loads the Projects Related to this Employee
             */
            function loadProjects()
            {
                var xml = NCore.makeXMLObject();
                xml.open("GET", "projectHandler.do?mode=1&empId="+selEmpId,true);
                xml.onreadystatechange = function()
                {
                    if(xml.readyState == 4 && xml.status==200)
                    {
                        var empObj = eval("("+xml.responseText+")");
                        var projs = empObj.projs;
                        for(var i=0;i<projs.length;i++)
                        {
                            //cnt += "<li title='"+projs[i].pid+"'>"+projs[i].pidName+"(<span style='color:black;font-size:9px;font-weight:bold'>"+projs[i].pid+"</span>)"+"</li>";
                            $('#projList').append("<li title='"+projs[i].pid+"'>"+projs[i].pidName+"(<span style='color:black;font-size:9px;font-weight:bold'>"+projs[i].pid+"</span>)"+"</li>");
                        }
                        registerMyListHoverEffect($('#projList'));
                        //registerProjectList();
                    }                    
                    $('#projList').find('li').eq(0).trigger('click', null);
                }
                xml.send(null);
                
                registerSearchBoxes($('#projList'));
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
                            $(outputPanel).html("");
                            $(outputPanel).append(timeSheet.makeTimeSheetDiv());                            
                            $('.timeSheetDiv',outputPanel).show();
                            var phasesObj = eval("("+xml.responseText+")");
                            var phases = [];
                            for(var i=0;i<phasesObj.length;i++)
                            {
                                phases.push(phasesObj[i].pName);
                            }
                            
                            timeSheet = new TimeSheet($('.timeSheetDiv',outputPanel), {
                                sheetTableCSS:'timeSheet',
                                dataRetriveURL:'timeSheetHandler.do',
                                dataStoreURL:'timeSheetHandler.do'
                            });
                            timeSheet.generateTimeSheet("",{
                                empId:selEmpId,
                                projectId:selProjId,
                                taskCategories:phases
                            });                                
                        }                                
                    }
                    xml.send(null);
                });                
            }
            
            
            
            $(function()
            {
                
                initialize();
                // First Retrive the Hidden EmpLoyee Id
                selEmpId = $('#selEmpId').html();                 
            });            
            
            /**
             * This Method Register the Foldable Divs
             */
            function registerAccordationDivs()
            {                
                var selInd = -1;
                $('.accordationContainer').each(function(ind)
                {
                    if(ind > 0)
                        return;
                    
                    selInd = ind;
                    var prevDiv;
                    var currDiv;
                    $(this).find('.accordationDiv').find('.accordationContent').slideUp(0, null);
                    $(this).find('.accordationDiv').find('.accordationContent').eq(0).slideDown(0, null);
                    currDiv = $(this).find('.accordationDiv').find('.accordationContent').eq(0);
                    
                    $(this).find('.accordationDiv').find('.accordationHead').click(function()
                    {
                        if(this.innerHTML != "Employees")
                        {
                            $('#rightPanel').hide();
                        }
                        else
                        {
                            $('#rightPanel').show();
                        }                        
                        
                        prevDiv = currDiv;
                        var cntDiv = $(this).siblings('.accordationContent');
                        currDiv = cntDiv;
                        if(prevDiv === currDiv)
                            return;
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
            }            
            
            
            /**
             * This Method Register the Menu Handlings
             */
            function registerMenu()
            {
                var menuEles = $('.menu').find('li a');
                var currLi;
                var prevLi;
                
                $(menuEles).click(function()
                {
                    prevLi = currLi;
                    currLi = this;
                    
                    $(prevLi).removeClass('selected');
                    $(currLi).addClass('selected');
                    Mask.showMask($('.bodyLayout'), {});
                    var key = $(this).attr('key');
                    switch(key)
                    {                        
                        case 'HOME':
                            Mask.hideMask($('.bodyLayout'));
                            $(outputPanel).html("<h4 class='mainHeading border10'>Welcome To Project Management System</h4>");
                            break;
                        case 'TIME_SHEET':
                            //$('#projList').find('li').eq(0).trigger('click', null);                            
                            $.get("TimeSheet.jsp",{empId:selEmpId},function(data){
                                $(outputPanel).html("").append(data);
                                //$(outputPanel).css({'width':1000});
                                Mask.hideMask($('.bodyLayout'));
                            });                            
                            break;
                        case 'MY_PROFILE':                            
                            $.get("Registration.do",{'VWempId':selEmpId,'viewMode':1},function(data){
                                $(outputPanel).html("").append(data);
                                Mask.hideMask($('.bodyLayout'));
                            });
                            break;
                        case 'EMP_INFO':                            
                            break;
                        case 'MY_STATUS':
                            try{
                                var report = new  ReportMaker(timeSheet);
                                $(outputPanel).html("").append(report.makeEmpStatusDiv(timeSheet,selEmpId));
                                $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:'yy-mm-dd'});
                                
                                var report = new  ReportMaker(timeSheet);
                                
                                Mask.hideMask($('.bodyLayout'));
                            }catch(e){alert(e);}
                            break;
                    }
                    
                });
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
        <table class="bodyLayout" border="0" cellpadding="0px" cellspacing="0px">
            <tr>
                <td colspan="2">
                    <jsp:include page="header.jsp" />
                </td>
            </tr>

            <!-- Menu Container -->
            <tr>
                <td colspan="2">
                    <ul class="menu">
                        <li class="outer left_border">&nbsp;</li>
                        <li><a href="#" key="HOME">Home</a></li>
                        <li><a href="#" key="TIME_SHEET">Time Sheet</a></li>
                        <li><a href="#" key="MY_STATUS">Status</a></li>                        
                        <li><a href="#" key="MY_PROFILE">My Profile</a></li>
                        <li class="outer right_border">&nbsp;</li>
                    </ul>
                </td>
            </tr>

            <tr>
                <td colspan="2">
                    <div id="empInfoDiv" class="empInfoDiv" style="display: none">
                        <label id="selEmpId" style="display:none"><bean:write name="LoginActionFormBean" property="empId"/></label>
                        <label class="label">Login User </label><label class="data">: <bean:write name="LoginActionFormBean" property="empnameinfo" /></label>
                        <label class="label">Email-id </label><label class="data">: <bean:write name="LoginActionFormBean" property="emailidinfo" /></label><br/>
                        <label class="label">Contact Number </label><label class="data">: <bean:write name="LoginActionFormBean" property="contactnumberinfo" /></label>
                        <label class="label">Employee Role </label><label class="data">: <bean:write name="LoginActionFormBean" property="emptypeinfo" /></label>
                    </div>
                </td>
            </tr>

            <!-- Body Container -->
            <tr>

                <!-- Left Side Project list Cell -->
                <!--                <td valign="top" width="200px">-->
                <td valign="top" colspan="2">

                    <div id="leftPanel" class="accordationContainer bottom_border floatDiv" style="width:200px;display: inline-block">
                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border">Reports</h4>
                            <div class="accordationContent bottom_border">
                                <ul id="reportList" class="myList">
                                    <li title="empStatus">My Status</li>                                    
                                    <li title="WEEKLY_TASK_LIST">Weekly Task List</li>                                    
                                </ul>
                            </div>
                        </div>

                        <div class="accordationDiv" style="display:none">
                            <h4 class="accordationHead top_border">Projects</h4>
                            <div class="accordationContent bottom_border">
                                <div class="searchBox">
                                    <input type="text" name="searchText" /><img src="res/images/icons/search_icon.png" align="middle"/>
                                </div>
                                <ul id="projList" class="myList">
                                </ul>
                            </div>
                        </div>

                        <div class="accordationDiv">
                            <h4 class="accordationHead top_border">Employees Info</h4>
                            <div class="accordationContent bottom_border">
                                <div class="searchBox">
                                    <input type="text" name="searchText" /><img src="res/images/icons/search_icon.png" align="middle"/>
                                </div>
                                <ul id="empList" class="myList">
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!--                    <div id="outputPanel"  style="max-width: 780px">-->
                    <div id="outputPanel" class="floatDiv" style="width:780px;overflow: auto">
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
