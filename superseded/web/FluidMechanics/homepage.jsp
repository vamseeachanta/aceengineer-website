<%-- 
    Document   : homepage
    Created on : Sep 25, 2012, 12:41:11 PM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
        <%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
        <%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
        <title>Fluid Mechanics</title>
        <script type="text/javascript" src="res/js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <link rel="stylesheet" type="text/css" href="res/css/StyleSheet.css"/>

        <link rel="stylesheet" type="text/css" href="res/css/sa.css"/>

        <!--Newly Added JS & CSS -->
        <link rel="stylesheet" href="res/css/ace.css"  type="text/css" media="screen"/>
        <link rel="stylesheet" href="res/css/core.css" type="text/css" media="screen"/>
        <script type="text/javascript" src="res/js/core.js"></script>
        <script type="text/javascript" src="res/js/InputValidation.js"></script>
        <script type="text/javascript" src="res/js/raphael-min.js"></script>
        <script type="text/javascript" src="res/js/raphael.js"></script>

        <script type="text/javascript" src="res/js/animation.js"></script>
        <!-- Ending Of Newly Added JS & CSS -->
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript">
            google.load("visualization", "1", {packages:["corechart"]});
            baseChartOpt = {
                width: 700,
                height: 500,
                fontName : 'Times New Roman',
                //backgroundColor: '#f3f3f3',
                backgroundColor: '#ffffff',
                is3D: true,
                 
                animation:{
                    duration:20000,
                    easing:'linear'
                },
                titleTextStyle:{            
                },
                hAxis : {
                    //                    gridlines:{
                    //                        color:'red',
                    //                        count: 10
                    //                    },
                    
                    titleTextStyle:{
                        color:'blue',
                        fontSize:20
                    },            
                    maxAlternation: 1
                },
                vAxis : {
                    //                    gridlines:{
                    //                        color:'blue',
                    //                        count:10
                    //                                      },
                  
                    titleTextStyle:{
                        color:'blue',
                        fontSize:20
                    }
                },
                interpolateNulls:true,
               
                chartArea : {
                    //                    left:50,
                    //                    top:50,
                    width:"70%"
                    //height:"75%"
                },
                legend :{
                    position:'top'
                }
            }
       
            var defaultCPTTT = [];
            var defaultCPExit = [];
            var defaultCPFree = [];
            var defaultVPTTT = [];
            var defaultVPExit = [];
            var defaultVPFree = [];
            
            //            var materialValid;
            $(document).ready(function(){
                $("ul.topnav li a.homepage").click(function(){
                    window.location = "homepage.jsp";
                });
                
                $("#addImgConstant").click(function(){
                    $("#addImgConstant").hide();
                    $("#minusImgConstant").show();
                    $("#Constant_Sens_Form").show();
                    $("#Constant_Sens_Output").show();
                });
                $("#minusImgConstant").click(function(){
                    $("#addImgConstant").show();
                    $("#minusImgConstant").hide();
                    $("#Constant_Sens_Form").hide();
                    $("#Constant_Sens_Output").hide();
                });
                
                $("#addImgVariable").click(function(){
                    $("#addImgVariable").hide();
                    $("#minusImgVariable").show();
                    $("#Variable_Sens_Form").show();
                    $("#Variable_Sens_Output").show();
                });
                $("#minusImgVariable").click(function(){
                    $("#addImgVariable").show();
                    $("#minusImgVariable").hide();
                    $("#Variable_Sens_Form").hide();
                    $("#Variable_Sens_Output").hide();
                });
                
                $("#addImgLOB").click(function(){
                    $("#addImgLOB").hide();
                    $("#minusImgLOB").show();
                    $("#LOB_Sens_Form").show();
                    $("#LOB_Sens_Output").show();
                });
                $("#minusImgLOB").click(function(){
                    $("#addImgLOB").show();
                    $("#minusImgLOB").hide();
                    $("#LOB_Sens_Form").hide();
                    $("#LOB_Sens_Output").hide();
                });
                
                

                /*
                 * Change Menu in Main Application
                 **/
                appTab = $(".AppMenuClass");
                $(appTab).each(function(ind)
                {
                    $(this).click(function(){
                        changeMenu(ind);
                    });
                });
                function changeMenu(ind)
                {
                    switch(ind)
                    {
                        case 0:
                            $("#Constant_Pre").addClass("active");
                            $("#Variable_Pre").removeClass("active");
                            $("#Constant_Pre_Content").show();
                            $("#Variable_Pre_Content").hide();
                            $("#Output_Constant").hide();
                            $("#Output_Variable").hide();
                            $("#Output_LOB").hide();
                            $("#typeOfContainer")[0].selectedIndex = 0;
                            line.show();
                            break;
                        case 1:
                            $("#Constant_Pre").removeClass("active");
                            $("#Variable_Pre").addClass("active");
                            $("#Constant_Pre_Content").hide();
                            $("#Variable_Pre_Content").show();
                            $("#Output_Constant").hide();
                            $("#Output_Variable").hide();
                            $("#Output_LOB").hide();
                            $("#typeOfContainer")[0].selectedIndex = 1;
                            line.hide();
                            break;
                    }
                }
                var prevLi;
                var curLi;
                $("#names").find('li').click(function()
                {
                    prevLi = curLi;
                    curLi = this;
                    $(prevLi).css({
                        backgroundColor:"#EEEEEE"
                    });
                    $(curLi).css({
                        backgroundColor:"#96B7D9"
                    });
                    var listValue = $(this).val();
                    
                    if(listValue == "0"){
                        $("#introduction").show();
                        $("#LossOfBuoyancy").hide();
                        $("#EmptyFluid").hide();
                    }else if(listValue == "1"){
                        $(this).addClass("activeMenu");
                        $("#introduction").hide();
                        $("#EmptyFluid").show();
                        $("#LossOfBuoyancy").hide();
                        $("#typeOfContainer")[0].selectedIndex = 0;
                    }else if(listValue == "2"){
                        $(this).addClass("activeMenu");
                        $("#introduction").hide();
                        $("#LossOfBuoyancy").show();
                        $("#EmptyFluid").hide();
                        $("#typeOfContainer")[0].selectedIndex = 2;
                    }
                });
                
                $('input[name="constant_p1"]').blur(function(){
                    $('input[name="constant_p2"]').val( $('input[name="constant_p1"]').val());
                });
                
                
                
                /*
                 * This function is used for Calculate Constant Pressure
                 */
                $("#CP_Calculate").click(function(){
                    if( $("#ConstantForm").validate().form() == true)
                    {
                        var g = $('input[name="constant_g"]').val();
                        var h_m = $('input[name="constant_hm"]').val();
                        var Dv = $('input[name="constant_Dv"]').val();
                        var Do = $('input[name="constant_Do"]').val();
                        var P1 = $('input[name="constant_P1"]').val();
                        var p1 = $('input[name="constant_p1"]').val();
                        var P2 = $('input[name="constant_P2"]').val();
                        var p2 = $('input[name="constant_p2"]').val();
                        var Cd = $('input[name="constant_Cd"]').val();
                        $("#Output_Constant").show();
                        Mask.showMask(document.getElementById('Output_Constant'),"");
                        $.get("FluidMechanics.do?mode="+0+"&constant_g="+(+g)+"&constant_hm="+(+h_m)+"&constant_Dv="+(+Dv)+"&constant_Do="+(+Do)+"&constant_P1="+(+P1)+"&constant_p1="+(+p1)+"&constant_P2="+(+P2)+"&constant_p2="+(+p2)+"&constant_Cd="+(+Cd),null,function(data){
                            try{
                                data = eval("("+data+")");
                                $("#C_Area1").text(data[0].Area1+" m2");
                                $("#C_Area2").text(data[0].Area2+" m2");
                                $("#C_EV").text(data[0].V2+" m/s");
                                $("#C_FV").text(data[0].V1+" m/s");
                                $("#C_TTT").text(data[0].time[data[0].Height.length-1]+" m/s");
                                Mask.hideMask(document.getElementById('Output_Constant'));
                                animateDrawing(0); 
                                $("#Output_Variable").hide();
                                $("#Output_LOB").hide();
                                var Chartdata = new google.visualization.DataTable();
                                var Chartdata2 = new google.visualization.DataTable();
                                var Chartdata3 = new google.visualization.DataTable();
                                Chartdata.addColumn('number', 'Time (Ts)');
                                Chartdata.addColumn('number', 'Exit Velocity (m/s)');
                                Chartdata2.addColumn('number', 'Time (Ts)');
                                Chartdata2.addColumn('number', 'Free Surface Velocity (m/s)');
                                Chartdata3.addColumn('number', 'Time (Ts)');
                                Chartdata3.addColumn('number', 'Fluid Level (h)');
                                Chartdata.addRows(data[0].Height.length);
                                Chartdata2.addRows(data[0].Height.length);
                                Chartdata3.addRows(data[0].Height.length);
                                var opt = $.extend(true,{},baseChartOpt);
                                defaultCPTTT.length = 0;
                                defaultCPExit.length = 0;
                                defaultCPFree.length = 0;
                                
                                for(var i=0;i<data[0].Height.length;i++)
                                {
                                    Chartdata.setValue(i,0,data[0].time[i]);
                                    Chartdata2.setValue(i,0,parseFloat(data[0].time[i]));
                                    Chartdata3.setValue(i,0,parseFloat(data[0].time[i]));
                                    Chartdata.setValue(i,1,parseFloat(data[0].exit_Velocity[i]));
                                    Chartdata2.setValue(i,1,parseFloat(data[0].freeSurface_Velocity[i]));
                                    Chartdata3.setValue(i,1,parseFloat(data[0].Height[i]));
                                    defaultCPTTT[i] = parseFloat(data[0].time[i]);
                                    defaultCPExit[i] = parseFloat(data[0].exit_Velocity[i]);
                                    defaultCPFree[i] = parseFloat(data[0].freeSurface_Velocity[i]);
                                }
                               
                                var chart = new google.visualization.LineChart(document.getElementById('C_Chart1'));
                                var chart2 = new google.visualization.LineChart(document.getElementById('C_Chart2'));
                                var chart3 = new google.visualization.LineChart(document.getElementById('C_Chart3'));
                                //                                opt.pointSize = 2;
                                opt.hAxis.title ='Time';        
                                opt.vAxis.title ='Velocity';
                                opt.title = "Exit Velocity with Time";
                                chart.draw(Chartdata,opt);
                                opt.title = "Free Surface Velocity with Time";
                                chart2.draw(Chartdata2,opt);
                                opt.title = "Fluid Level with Time";
                                opt.vAxis.title ='Fluid Level';
                                chart3.draw(Chartdata3,opt);
                            }
                            catch(e)
                            {
                                alert("Sorry! Cann't Calculate the Constant Pressure at this Values....");
                                $("#Output_Constant").hide();
                                Mask.hideMask(document.getElementById('Output_Constant'));
                            }
                        }); 
                    }
                });
                
                $("#VP_Calculate").click(function(){
                    if($("#VariableForm").validate().form() == true)
                    {
                        var g = $('input[name="variable_g"]').val();
                        var H_m = $('input[name="variable_Hm"]').val();
                        var h_m = $('input[name="variable_hm"]').val();
                        var Dv = $('input[name="variable_Dv"]').val();
                        var Do = $('input[name="variable_Do"]').val();
                        var P1 = $('input[name="variable_P1"]').val();
                        var p1 = $('input[name="variable_p1"]').val();
                        var P2 = $('input[name="variable_P2"]').val();
                        var p2 = $('input[name="variable_p2"]').val();
                        var Cd = $('input[name="variable_Cd"]').val();
                        var Y = $('input[name="variable_Y"]').val();
                        
                        var frst = parseInt($('input[name="variable_Hm"]').val());
                        var sec =  parseInt($('input[name="variable_hm"]').val());
                        if((frst>sec))
                        {
                        }
                        else
                        {
                            alert("Water Level should be less than or equal to Vessel Height");
                            return false;
                        }
                        $("#Output_Variable").show();
                        $("#Output_Constant").hide();
                        $("#Output_LOB").hide();
                        Mask.showMask(document.getElementById('Output_Variable'),"");
                        $.get("FluidMechanics.do?mode="+1+"&variable_g="+(+g)+"&variable_Hm="+(+H_m)+"&variable_hm="+(+h_m)+"&variable_Dv="+(+Dv)+"&variable_Do="+(+Do)+"&variable_P1="+(+P1)+"&variable_p1="+(+p1)+"&variable_P2="+(+P2)+"&variable_p2="+(+p2)+"&variable_Cd="+(+Cd)+"&variable_Y="+(+Y),null,function(data){
                            try{
                                data = eval("("+data+")");
                                $("#V_Area1").text(data[0].Area1+" m2");
                                $("#V_Area2").text(data[0].Area2+" m2");
                                $("#V_EV").text(data[0].V2+" m/s");
                                $("#V_FV").text(data[0].V1+" m/s");
                                $("#VP_TTT").text(data[0].T_s[Number(data[0].T_s.length)-1]+" m/s");
                                animateDrawing(1); 
                                Mask.hideMask(document.getElementById('Output_Variable'));
                                var Chartdata = new google.visualization.DataTable();
                                var Chartdata2 = new google.visualization.DataTable();
                                var Chartdata3 = new google.visualization.DataTable();
                                Chartdata.addColumn('number', 'Time(s)');
                                Chartdata.addColumn('number', 'Exit Velocity(m/s)');
                                Chartdata2.addColumn('number', 'Time(s)');
                                Chartdata2.addColumn('number', 'Free Surface Velocity(m/s)');
                                Chartdata3.addColumn('number', 'Time(s)');
                                Chartdata3.addColumn('number', 'Fluid Level (h)');
                                var rows = data[0].T_s.length;
                                Chartdata.addRows(rows);
                                Chartdata2.addRows(rows);
                                Chartdata3.addRows(rows);
                                for(var i=0;i<data[0].T_s.length;i++)
                                {
                                    Chartdata.setValue(i,0,parseFloat(data[0].T_s[i]));
                                    Chartdata2.setValue(i,0,parseFloat(data[0].T_s[i]));
                                    Chartdata3.setValue(i,0,parseFloat(data[0].T_s[i]));
                                    Chartdata.setValue(i,1,parseFloat(data[0].Pa[i]));
                                    Chartdata2.setValue(i,1,parseFloat(data[0].freeSurface_Velocity[i]));
                                    Chartdata3.setValue(i,1,parseFloat(data[0].ht_m[i]));
                                    defaultVPTTT[i] = parseFloat(data[0].T_s[i]);
                                    defaultVPExit[i] = parseFloat(data[0].Pa[i]);
                                    defaultVPFree[i] = parseFloat(data[0].freeSurface_Velocity[i]);
                                }
                                var chart = new google.visualization.LineChart(document.getElementById('V_Chart1'));
                                var chart2 = new google.visualization.LineChart(document.getElementById('V_Chart2'));
                                var chart3 = new google.visualization.LineChart(document.getElementById('V_Chart3'));
                                var opt = $.extend(true,{},baseChartOpt);
                                opt.hAxis.title ='Time';        
                                opt.vAxis.title ='Velocity';
                                opt.title = "Pressure P1 with Time";
                                chart.draw(Chartdata,opt);
                                opt.title = "Free Surface Velocity with Time";
                                chart2.draw(Chartdata2,opt);
                                opt.vAxis.title ='Fluid Level(h)';
                                opt.title = "Fluid Level with Time";
                                chart3.draw(Chartdata3,opt);
                            }
                            catch(e)
                            {
                                alert("Sorry! Cann't Calculate the Variable Pressure at this Values...."+e);
                                $("#Output_Variable").hide();
                                Mask.hideMask(document.getElementById('Output_Variable'));
                            }
                        }); 
                    }
                });
                
                $("#LOB_Calculate").click(function(){
                    
                    if($("#LOBForm").validate().form() == true)
                    {
                        var g = $('input[name="LOB_g"]').val();
                        var D = $('input[name="LOB_D"]').val();
                        var Dv = $('input[name="LOB_Dv"]').val();
                        var L1 = $('input[name="LOB_L1"]').val();
                        var Do = $('input[name="LOB_Do"]').val();
                        var L2 = $('input[name="LOB_L2"]').val();
                        var d = $('input[name="LOB_d"]').val();
                        var pseawater = $('input[name="LOB_pseawater"]').val();
                        var ga = $('input[name="LOB_GA"]').val();
                        $("#Output_LOB").show();
                        Mask.showMask(document.getElementById('Output_LOB'),"");
                        $.get("FluidMechanics.do?mode="+2+"&LOB_g="+(+g)+"&LOB_D="+(+D)+"&LOB_Dv="+(+Dv)+"&LOB_L1="+(+L1)+"&LOB_Do="+(+Do)+"&LOB_L2="+(+L2)+"&LOB_d="+(+d)+"&LOB_pseawater="+(+pseawater)+"&LOB_GA="+(+ga),null,function(data){
                            try{
                                data = eval("("+data+")"); 
                                Mask.hideMask(document.getElementById('Output_LOB'));
                                $("#Output_Variable").hide();
                                $("#Output_Constant").hide();
                                $("#LOB_Area1").text(data[0].Area1+" m2");
                                $("#LOB_Area2").text(data[0].Area2+" m2");
                                $("#LOB_Ideal_P1").text(data[0].P1+" Pa");
                                $("#LOB_Ideal_P2").text(data[0].P2+" Pa ");
                                $("#LOB_Ideal_V1").text(data[0].V1+" m3");
                                $("#LOB_Ideal_V2").text(data[0].V2+" m3");
                                $("#LOB_Ideal_CV").text(data[0].CV_Ideal+" m3");
                                $("#LOB_Ideal_LOB").text(data[0].LOB_Ideal+" kg ");
                                $("#LOB_Ideal_Newtons").text(data[0].Newtons_Ideal+" N");
                                $("#LOB_Isentropic_V1").text(data[0].V2_Value+" m3");
                                $("#LOB_Isentropic_CV").text(data[0].CV_Isentropic+" m3");
                                $("#LOB_Isentropic_LOB").text(data[0].LOB_Isentropic+" kg ");
                                $("#LOB_Isentropic_Newtons").text(data[0].Newtons_Isentropic+" N ");
                            }catch(e)
                            {
                                alert("Sorry! Cann't Calculate the LOB Pressure at this Values...."+e);
                                $("#Output_LOB").hide();
                                Mask.hideMask(document.getElementById('Output_LOB'));
                            }
                            animateDrawing(2); 
                        }); 
                    }
                });
                
                
                
                
                /* Code for Sensitivity Analysis....
                 */
                $("#Constant_Sens_Apply").click(function()
                {
                    if( $("#Constant_Sens_Form").validate().form() == true)
                    {
                        var Sens_g = $('input[name="constant_g"]').val();
                        var Sens_h_m = $('input[name="constant_hm"]').val();
                        var Sens_Dv = $('input[name="constant_Dv"]').val();
                        var Sens_Do = $('input[name="constant_Do"]').val();
                        var Sens_P1 = $('input[name="constant_P1"]').val();
                        var Sens_p1 = $('input[name="constant_p1"]').val();
                        var Sens_P2 = $('input[name="constant_P2"]').val();
                        var Sens_p2 = $('input[name="constant_p2"]').val();
                        var Sens_Cd = $('input[name="constant_Cd"]').val();
                        if($('input[name="Constant_Sens1"]').val()!= "")
                        {
                            Sens_P1 = $('input[name="Constant_Sens1"]').val();
                        }
                        if($('input[name="Constant_Sens2"]').val()!= "")
                        {
                            Sens_h_m = $('input[name="Constant_Sens2"]').val();
                        }
                        if($('input[name="Constant_Sens3"]').val()!= "")
                        {
                            Sens_Dv = $('input[name="Constant_Sens3"]').val();    
                        }
                        if($('input[name="Constant_Sens4"]').val()!= "")
                        {
                            Sens_Do = $('input[name="Constant_Sens4"]').val();
                        }
                        $("#Constant_Sens_Output").show();
                        Mask.showMask(document.getElementById('Constant_Sens_Output'), "");
                        $.get("FluidMechanics.do?mode="+0+"&constant_g="+(+Sens_g)+"&constant_hm="+(+Sens_h_m)+"&constant_Dv="+(+Sens_Dv)+"&constant_Do="+(+Sens_Do)+"&constant_P1="+(+Sens_P1)+"&constant_p1="+(+Sens_p1)+"&constant_P2="+(+Sens_P2)+"&constant_p2="+(+Sens_p2)+"&constant_Cd="+(+Sens_Cd),null,function(data){
                            data = eval("("+data+")");
                            try{
                                Mask.hideMask(document.getElementById('Constant_Sens_Output'));
                                var Chartdata = new google.visualization.DataTable();
                                var Chartdata2 = new google.visualization.DataTable();
                                Chartdata.addColumn('number', 'Time (Ts)');
                                Chartdata.addColumn('number', 'Exit Velocity (m/s)');
                                Chartdata.addColumn('number', 'Sensitivity Exit Velocity (m/s)');
                                Chartdata2.addColumn('number', 'Time (Ts)');
                                Chartdata2.addColumn('number', 'Free Surface Velocity (m/s)');
                                Chartdata2.addColumn('number', 'Sensitivity Free Surface Velocity (m/s)');
                                //                            var rows = data[0].Height.length;
                                var SensCPChart = new Array();
                                var SensCPChartExitOriginal = [];
                                var SensCPChartExitSensitivity = [];
                                var SensCPChartFreeOriginal = [];
                                var SensCPChartFreeSensitivity = [];
                                
                                for(var i=0;i<defaultCPTTT.length;i++)
                                {
                                    SensCPChart[i] = parseFloat(defaultCPTTT[i]);
                                }
                                var temp = defaultCPTTT.length;
                                for(var j=0;j<data[0].time.length;j++)
                                {
                                    SensCPChart[temp] = parseFloat(data[0].time[j]);
                                    temp++;
                                }
                                SensCPChart.sort(function(a,b){return a-b});
                                for(var i =1;i<SensCPChart.length;i++)
                                {
                                    if(SensCPChart[i-1] == SensCPChart[i])
                                    {
                                        SensCPChart.splice(i,1);
                                    }
                                    else
                                    {
                                        i++;
                                    }
                                }
                                var flag;
                                var flag1;
                                var flag2;
                                for(var i=0;i<SensCPChart.length;i++)
                                {
                                    flag = false;
                                    flag1 = false;
                                    flag2 = false;
                                    for(var j=0;j<defaultCPTTT.length;j++)
                                    {
                                        if(SensCPChart[i] == defaultCPTTT[j])
                                        {
                                            SensCPChartExitOriginal[i] = defaultCPExit[j];
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if(!flag)
                                    {
                                        SensCPChartExitOriginal[i] = NaN;
                                    }
                                    for(var k = 0;k<data[0].time.length;k++)
                                    {
                                        if(SensCPChart[i] == data[0].time[k])
                                        {
                                            SensCPChartExitSensitivity[i] = data[0].exit_Velocity[k];
                                            SensCPChartFreeSensitivity[i] = data[0].freeSurface_Velocity[k];
                                            flag1 = true;
                                            break;
                                        }      
                                    }
                                    if(!flag1)
                                    {
                                        SensCPChartExitSensitivity[i] = NaN;
                                        SensCPChartFreeSensitivity[i] = NaN;
                                    }
                                    
                                    for(var j=0;j<defaultCPTTT.length;j++)
                                    {
                                        if(SensCPChart[i] == defaultCPTTT[j])
                                        {
                                            SensCPChartFreeOriginal[i] = defaultCPFree[j];
                                            flag2 = true;
                                            break;
                                        }
                                    }
                                    if(!flag2)
                                    {
                                        SensCPChartFreeOriginal[i] = NaN;
                                    }
                                }
                           
                        
                                Chartdata.addRows(SensCPChart.length);
                                Chartdata2.addRows(SensCPChart.length);
                                
                                for(var i=0;i<SensCPChart.length;i++)
                                {
                                    Chartdata.setValue(i,0,parseFloat(SensCPChart[i]));
                                    Chartdata.setValue(i,1,parseFloat(SensCPChartExitOriginal[i]));
                                    Chartdata.setValue(i,2,parseFloat(SensCPChartExitSensitivity[i]));
                                    Chartdata2.setValue(i,0,parseFloat(SensCPChart[i]));
                                    Chartdata2.setValue(i,1,parseFloat(SensCPChartFreeOriginal[i]));
                                    Chartdata2.setValue(i,2,parseFloat(SensCPChartFreeSensitivity[i]));
                                }
                                
                              
                                //                                for(var i=0;i<data[0].Height.length;i++)
                                //                                {
                                //                                    Chartdata.setValue(i,0,data[0].time[i]);
                                //                                    Chartdata.setValue(i,1,defaultCPExit[i]);
                                //                                    Chartdata.setValue(i,2,parseFloat(data[0].exit_Velocity[i]));
                                //                                    Chartdata2.setValue(i,0,parseFloat(data[0].time[i]));
                                //                                    Chartdata2.setValue(i,1,defaultCPFree[i]);
                                //                                    Chartdata2.setValue(i,2,parseFloat(data[0].freeSurface_Velocity[i]));
                                //                                }
                                var chart = new google.visualization.LineChart(document.getElementById('C_Chart4'));
                                var chart2 = new google.visualization.LineChart(document.getElementById('C_Chart5'));
                                var opt = $.extend(true,{},baseChartOpt);
                                opt.hAxis.title ='Time';        
                                opt.vAxis.title ='Velocity';
                                opt.title = "Sensitivity Exit Velocity with Time";
                                chart.draw(Chartdata,opt);
                                opt.title = "Sensitivity Free Surface Velocity with Time";
                                chart2.draw(Chartdata2,opt);
                                $("#Output_Constant").show();
                                $('input[name="Constant_Sens1"]').val("");
                                $('input[name="Constant_Sens2"]').val("");
                                $('input[name="Constant_Sens3"]').val("");
                                $('input[name="Constant_Sens4"]').val("");
                            }
                            catch(e)
                            {
                                alert("Sorry! Cann't Calculate the Constant Pressure at this Values....");
                                $("#Constant_Sens_Output").hide();
                                Mask.hideMask(document.getElementById('Constant_Sens_Output'));
                            }
                        }); 
                    }
                });
                
                
                $("#Variable_Sens_Apply").click(function()
                {
                    if($("#Variable_Sens_Form").validate().form() == true)
                    {
                    
                        var g = $('input[name="variable_g"]').val();
                        var H_m = $('input[name="variable_Hm"]').val();
                        var h_m = $('input[name="variable_hm"]').val();
                        var Dv = $('input[name="variable_Dv"]').val();
                        var Do = $('input[name="variable_Do"]').val();
                        var P1 = $('input[name="variable_P1"]').val();
                        var p1 = $('input[name="variable_p1"]').val();
                        var P2 = $('input[name="variable_P2"]').val();
                        var p2 = $('input[name="variable_p2"]').val();
                        var Cd = $('input[name="variable_Cd"]').val();
                        var Y = $('input[name="variable_Y"]').val();
                    
                        if($('input[name="Variable_Sens1"]').val()!= "")
                        {
                            P1 = $('input[name="Variable_Sens1"]').val();
                        }
                        if($('input[name="Variable_Sens2"]').val()!= "")
                        {
                            h_m = $('input[name="Variable_Sens2"]').val();
                        }
                        if($('input[name="Variable_Sens3"]').val()!= "")
                        {
                            Dv = $('input[name="Variable_Sens3"]').val();
                        }
                        if($('input[name="Variable_Sens4"]').val()!= "")
                        {
                            Do = $('input[name="Variable_Sens4"]').val();
                        }
                        $("#Variable_Sens_Output").show();
                        Mask.showMask(document.getElementById('Variable_Sens_Output'), "");
                        $.get("FluidMechanics.do?mode="+1+"&variable_g="+(+g)+"&variable_Hm="+(+H_m)+"&variable_hm="+(+h_m)+"&variable_Dv="+(+Dv)+"&variable_Do="+(+Do)+"&variable_P1="+(+P1)+"&variable_p1="+(+p1)+"&variable_P2="+(+P2)+"&variable_p2="+(+p2)+"&variable_Cd="+(+Cd)+"&variable_Y="+(+Y),null,function(data){
                            data = eval("("+data+")");
                            try{
                                Mask.hideMask(document.getElementById('Variable_Sens_Output'));
                                var Chartdata = new google.visualization.DataTable();
                                var Chartdata2 = new google.visualization.DataTable();
                                Chartdata.addColumn('number', 'Time(s)');
                                Chartdata.addColumn('number', 'Exit Velocity(m/s)');
                                Chartdata.addColumn('number', 'Sensitivity Exit Velocity(m/s)');
                                Chartdata2.addColumn('number', 'Time(s)');
                                Chartdata2.addColumn('number', 'Free Surface Velocity(m/s)');
                                Chartdata2.addColumn('number', 'Sensitivity Free Surface Velocity(m/s)');
                                var SensVPChart = new Array();
                                var SensVPChartExitOriginal = [];
                                var SensVPChartExitSensitivity = [];
                                var SensVPChartFreeOriginal = [];
                                var SensVPChartFreeSensitivity = [];
                                
                                
                                for(var i=0;i<defaultVPTTT.length;i++)
                                {
                                    SensVPChart[i] = parseFloat(defaultVPTTT[i]);
                                }
                                var temp = defaultVPTTT.length;
                                for(var j=0;j<data[0].T_s.length;j++)
                                {
                                    SensVPChart[temp] = parseFloat(data[0].T_s[j]);
                                    temp++;
                                }
                                SensVPChart.sort(function(a,b){return a-b});
                                for(var i =1;i<SensVPChart.length;i++)
                                {
                                    if(SensVPChart[i-1] == SensVPChart[i])
                                    {
                                        SensVPChart.splice(i,1);
                                    }
                                    else
                                    {
                                        i++;
                                    }
                                }
                                
                                //                                
                                //                                alert(" Results......");
                                //                                alert(" Original X- Axis "+defaultVPTTT);
                                //                                alert(" Sens Original X- Axis "+data[0].T_s);
                                //                                alert(" Common X- Axis "+SensVPChart);
                                var flag;
                                var flag1;
                                var flag2;
                                for(var i=0;i<SensVPChart.length;i++)
                                {
                                    flag = false;
                                    flag1 = false;
                                    flag2 = false;
                                    for(var j=0;j<defaultVPTTT.length;j++)
                                    {
                                        if(SensVPChart[i] == defaultVPTTT[j])
                                        {
                                            SensVPChartExitOriginal[i] = defaultVPExit[j];
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if(!flag)
                                    {
                                        SensVPChartExitOriginal[i] = NaN;
                                    }
                                    for(var k = 0;k<data[0].T_s.length;k++)
                                    {
                                        if(SensVPChart[i] == data[0].T_s[k])
                                        {
                                           
                                            SensVPChartExitSensitivity[i] = data[0].Pa[k];
                                            SensVPChartFreeSensitivity[i] = data[0].freeSurface_Velocity[k];
                                            flag1 = true;
                                            break;
                                        }      
                                    }
                                    if(!flag1)
                                    {
                                        SensVPChartExitSensitivity[i] = NaN;
                                        SensVPChartFreeSensitivity[i] = NaN;
                                    }
                                    
                                    for(var j=0;j<defaultVPTTT.length;j++)
                                    {
                                        if(SensVPChart[i] == defaultVPTTT[j])
                                        {
                                            SensVPChartFreeOriginal[i] = defaultVPFree[j];
                                            flag2 = true;
                                            break;
                                        }
                                    }
                                    if(!flag2)
                                    {
                                        SensVPChartFreeOriginal[i] = NaN;
                                    }
                                }
                                Chartdata.addRows(SensVPChart.length);
                                Chartdata2.addRows(SensVPChart.length);
                                
                                for(var i=0;i<SensVPChart.length;i++)
                                {
                                    Chartdata.setValue(i,0,parseFloat(SensVPChart[i]));
                                    Chartdata.setValue(i,1,parseFloat(SensVPChartExitOriginal[i]));
                                    Chartdata.setValue(i,2,parseFloat(SensVPChartExitSensitivity[i]));
                                    Chartdata2.setValue(i,0,parseFloat(SensVPChart[i]));
                                    Chartdata2.setValue(i,1,parseFloat(SensVPChartFreeOriginal[i]));
                                    Chartdata2.setValue(i,2,parseFloat(SensVPChartFreeSensitivity[i]));
                                }
                                
                                
                                
                                
                                
                                
                                
                                
                                //                                for(var i=0;i<data[0].T_s.length;i++)
                                //                                {
                                //                                    Chartdata.setValue(i,0,parseFloat(data[0].T_s[i]));
                                //                                    Chartdata2.setValue(i,0,parseFloat(data[0].T_s[i]));
                                //                                    Chartdata.setValue(i,1,defaultVPExit[i]);
                                //                                    Chartdata.setValue(i,2,parseFloat(data[0].Pa[i]));
                                //                                    Chartdata2.setValue(i,1,defaultVPFree[i]);
                                //                                    Chartdata2.setValue(i,2,parseFloat(data[0].freeSurface_Velocity[i]));
                                //                                }
                                var chart = new google.visualization.LineChart(document.getElementById('V_Chart4'));
                                var chart2 = new google.visualization.LineChart(document.getElementById('V_Chart5'));
                                var opt = $.extend(true,{},baseChartOpt);
                                opt.hAxis.title ='Time';        
                                opt.vAxis.title ='Velocity';
                                opt.title = "Pressure P1 with Time";
                                chart.draw(Chartdata,opt);
                                opt.title = "Free Surface Velocity with Time";
                                chart2.draw(Chartdata2,opt);
                                $("#Output_Variable").show();
                            }
                            catch(e)
                            {
                                alert("Sorry! Cann't Calculate the Variable Pressure at this Values....");
                                $("#Variable_Sens_Output").hide();
                                Mask.hideMask(document.getElementById('Variable_Sens_Output'));
                            }
                        });
                    }
                });
               
                
                $("#LOB_Sens_Apply").click(function()
                {
                    if($("#LOB_Sens_Form").validate().form() == true)
                    {
                        
                        var g = $('input[name="LOB_g"]').val();
                        var D = $('input[name="LOB_D"]').val();
                        var Dv = $('input[name="LOB_Dv"]').val();
                        var L1 = $('input[name="LOB_L1"]').val();
                        var Do = $('input[name="LOB_Do"]').val();
                        var L2 = $('input[name="LOB_L2"]').val();
                        var d = $('input[name="LOB_d"]').val();
                        var pseawater = $('input[name="LOB_pseawater"]').val();
                        var ga = $('input[name="LOB_GA"]').val();
                   
                        if($('input[name="LOB_Sens1"]').val()!= "")
                        {
                            Dv = $('input[name="LOB_Sens1"]').val();
                        }
                        if($('input[name="LOB_Sens2"]').val()!= "")
                        {
                            d = $('input[name="LOB_Sens2"]').val();
                        }
                        $("#LOB_Sens_Output").show();
                        Mask.showMask(document.getElementById('LOB_Sens_Output'), "");
                        $.get("FluidMechanics.do?mode="+2+"&LOB_g="+(+g)+"&LOB_D="+(+D)+"&LOB_Dv="+(+Dv)+"&LOB_L1="+(+L1)+"&LOB_Do="+(+Do)+"&LOB_L2="+(+L2)+"&LOB_d="+(+d)+"&LOB_pseawater="+(+pseawater)+"&LOB_GA="+(+ga),null,function(data){
                            try{
                                data = eval("("+data+")"); 
                                Mask.hideMask(document.getElementById('LOB_Sens_Output'));
                                $("#LOB_Sens_Area1").text(data[0].Area1+" m2");
                                $("#LOB_Sens_Area2").text(data[0].Area2+" m2");
                                $("#LOB_Sens_Ideal_P1").text(data[0].P1+" Pa");
                                $("#LOB_Sens_Ideal_P2").text(data[0].P2+" Pa ");
                                $("#LOB_Sens_Ideal_V1").text(data[0].V1+" m3");
                                $("#LOB_Sens_Ideal_V2").text(data[0].V2+" m3");
                                $("#LOB_Sens_Ideal_CV").text(data[0].CV_Ideal+" m3");
                                $("#LOB_Sens_Ideal_LOB").text(data[0].LOB_Ideal+" kg ");
                                $("#LOB_Sens_Ideal_Newtons").text(data[0].Newtons_Ideal+" N");
                                $("#LOB_Sens_Isentropic_V1").text(data[0].V2_Value+" m3");
                                $("#LOB_Sens_Isentropic_CV").text(data[0].CV_Isentropic+" m3");
                                $("#LOB_Sens_Isentropic_LOB").text(data[0].LOB_Isentropic+" kg ");
                                $("#LOB_Sens_Isentropic_Newtons").text(data[0].Newtons_Isentropic+" N ");
                                $("#Output_LOB").show();
                                 
                            }catch(e)
                            {
                                alert("Sorry! Cann't Calculate the Variable Pressure at this Values....");
                                $("#LOB_Sens_Output").hide();
                                Mask.hideMask(document.getElementById('LOB_Sens_Output'));
                            }
                        }); 
                    }
                });
                
                
                /*
                 * This Code is Used for Expansion in Variable Pressure Method....
                 **/
                
                choice = $('input[name="choice"]');
                $(choice).each(function(ind)
                {
                    $(this).click(function(){
                        if(ind == 0)
                        {
                            $('input[name="variable_Y"]').val("1");
                        }
                        else
                        {
                            $('input[name="variable_Y"]').val("");
                        }
                    });
                });
                
                
                /* 
                 * This Code is used for 
                 */
                $("#Constant_Add_Sens").click(function(){
                    $("#Constant_Sens_Input").show();
                });
                
                $("#Variable_Add_Sens").click(function(){
                    $("#Variable_Sens_Input").show();
                });
                
                $("#LOB_Add_Sens").click(function(){
                    $("#LOB_Sens_Input").show();
                });
                /*
                 * This code is used for Apply Sensitivity on Constant Pressure
                 **/
                constantSensTab = $('input[name="Sens_Const"]');
                var countIndex;
                $(constantSensTab).each(function(ind)
                {
                    $(this).click(function(){
                        changeSensMenu(ind);
                        countIndex = ind;
                    });
                });
                function changeSensMenu(ind)
                {
                    switch(ind)
                    {
                        case 0: 
                            var val = $('input[name="constant_P1"]').val();
                            //                            $('input[name="Constant_Sens1"]').val(val);
                            $('input[name="Constant_Sens1"]').show();
                            $('input[name="Constant_Sens1"]').addClass("required");
                            $('input[name="Constant_Sens1"]').attr("disabled",false);
                            $('input[name="Constant_Sens1"]').next().show();
                            $('input[name="Constant_Sens2"]').hide();
                            $('input[name="Constant_Sens3"]').hide();
                            $('input[name="Constant_Sens4"]').hide();
                            $('input[name="Constant_Sens2"]').removeClass("required");
                            $('input[name="Constant_Sens2"]').attr("disabled",true);
                            $('input[name="Constant_Sens2"]').next().hide();
                            $('input[name="Constant_Sens3"]').removeClass("required");
                            $('input[name="Constant_Sens3"]').attr("disabled",true);
                            $('input[name="Constant_Sens3"]').next().hide();
                            $('input[name="Constant_Sens4"]').removeClass("required");
                            $('input[name="Constant_Sens4"]').attr("disabled",true);
                            $('input[name="Constant_Sens4"]').next().hide();
                            break;
                        case 1:
                            var val = $('input[name="constant_hm"]').val();
                            //                            $('input[name="Constant_Sens2"]').val(val);
                            $('input[name="Constant_Sens2"]').show();
                            $('input[name="Constant_Sens2"]').addClass("required");
                            $('input[name="Constant_Sens2"]').attr("disabled",false);
                            $('input[name="Constant_Sens2"]').next().show();
                            $('input[name="Constant_Sens1"]').hide();
                            $('input[name="Constant_Sens3"]').hide();
                            $('input[name="Constant_Sens4"]').hide();
                            $('input[name="Constant_Sens1"]').removeClass("required");
                            $('input[name="Constant_Sens1"]').attr("disabled",true);
                            $('input[name="Constant_Sens1"]').next().hide();
                            $('input[name="Constant_Sens3"]').removeClass("required");
                            $('input[name="Constant_Sens3"]').attr("disabled",true);
                            $('input[name="Constant_Sens3"]').next().hide();
                            $('input[name="Constant_Sens4"]').removeClass("required");
                            $('input[name="Constant_Sens4"]').attr("disabled",true);
                            $('input[name="Constant_Sens4"]').next().hide();
                            break;
                        case 2: 
                            var val = $('input[name="constant_Dv"]').val();
                            //                            $('input[name="Constant_Sens3"]').val(val);
                            $('input[name="Constant_Sens3"]').show();
                            $('input[name="Constant_Sens3"]').addClass("required");
                            $('input[name="Constant_Sens3"]').attr("disabled",false);
                            $('input[name="Constant_Sens3"]').next().show();
                            $('input[name="Constant_Sens1"]').hide();
                            $('input[name="Constant_Sens2"]').hide();
                            $('input[name="Constant_Sens4"]').hide();
                            $('input[name="Constant_Sens1"]').removeClass("required");
                            $('input[name="Constant_Sens1"]').attr("disabled",true);
                            $('input[name="Constant_Sens1"]').next().hide();
                            $('input[name="Constant_Sens2"]').removeClass("required");
                            $('input[name="Constant_Sens2"]').attr("disabled",true);
                            $('input[name="Constant_Sens2"]').next().hide();
                            $('input[name="Constant_Sens4"]').removeClass("required");
                            $('input[name="Constant_Sens4"]').attr("disabled",true);
                            $('input[name="Constant_Sens4"]').next().hide();
                            break;
                        case 3: 
                            var val = $('input[name="constant_Do"]').val();
                            //                            $('input[name="Constant_Sens4"]').val(val);
                            $('input[name="Constant_Sens4"]').show();
                            $('input[name="Constant_Sens4"]').addClass("required");
                            $('input[name="Constant_Sens4"]').attr("disabled",false);
                            $('input[name="Constant_Sens4"]').next().show();
                            $('input[name="Constant_Sens1"]').hide();
                            $('input[name="Constant_Sens2"]').hide();
                            $('input[name="Constant_Sens3"]').hide();
                            $('input[name="Constant_Sens1"]').removeClass("required");
                            $('input[name="Constant_Sens1"]').attr("disabled",true);
                            $('input[name="Constant_Sens1"]').next().hide();
                            $('input[name="Constant_Sens3"]').removeClass("required");
                            $('input[name="Constant_Sens3"]').attr("disabled",true);
                            $('input[name="Constant_Sens3"]').next().hide();
                            $('input[name="Constant_Sens2"]').removeClass("required");
                            $('input[name="Constant_Sens2"]').attr("disabled",true);
                            $('input[name="Constant_Sens2"]').next().hide();
                            break;
                        case 4: 
                            var val = $('input[name="variable_P1"]').val();
                            //                            $('input[name="Variable_Sens1"]').val(val);
                            $('input[name="Variable_Sens1"]').show();
                            $('input[name="Variable_Sens1"]').addClass("required");
                            $('input[name="Variable_Sens1"]').attr("disabled",false);
                            $('input[name="Variable_Sens1"]').next().show();
                            $('input[name="Variable_Sens2"]').hide();
                            $('input[name="Variable_Sens3"]').hide();
                            $('input[name="Variable_Sens4"]').hide();
                            $('input[name="Variable_Sens2"]').removeClass("required");
                            $('input[name="Variable_Sens2"]').attr("disabled",true);
                            $('input[name="Variable_Sens2"]').next().hide();
                            $('input[name="Variable_Sens3"]').removeClass("required");
                            $('input[name="Variable_Sens3"]').attr("disabled",true);
                            $('input[name="Variable_Sens3"]').next().hide();
                            $('input[name="Variable_Sens4"]').removeClass("required");
                            $('input[name="Variable_Sens4"]').attr("disabled",true);
                            $('input[name="Variable_Sens4"]').next().hide();
                            break;
                        case 5: 
                            var val = $('input[name="variable_hm"]').val();
                            //                            $('input[name="Variable_Sens2"]').val(val);
                            $('input[name="Variable_Sens2"]').show();
                            $('input[name="Variable_Sens2"]').addClass("required");
                            $('input[name="Variable_Sens2"]').attr("disabled",false);
                            $('input[name="Variable_Sens2"]').next().show();
                            $('input[name="Variable_Sens1"]').hide();
                            $('input[name="Variable_Sens3"]').hide();
                            $('input[name="Variable_Sens4"]').hide();
                            $('input[name="Variable_Sens1"]').removeClass("required");
                            $('input[name="Variable_Sens1"]').attr("disabled",true);
                            $('input[name="Variable_Sens1"]').next().hide();
                            $('input[name="Variable_Sens3"]').removeClass("required");
                            $('input[name="Variable_Sens3"]').attr("disabled",true);
                            $('input[name="Variable_Sens3"]').next().hide();
                            $('input[name="Variable_Sens4"]').removeClass("required");
                            $('input[name="Variable_Sens4"]').attr("disabled",true);
                            $('input[name="Variable_Sens4"]').next().hide();
                            break;
                        case 6: 
                            var val = $('input[name="variable_Dv"]').val();
                            //                            $('input[name="Variable_Sens3"]').val(val);
                            $('input[name="Variable_Sens3"]').show();
                            $('input[name="Variable_Sens3"]').addClass("required");
                            $('input[name="Variable_Sens3"]').attr("disabled",false);
                            $('input[name="Variable_Sens3"]').next().show();
                            $('input[name="Variable_Sens1"]').hide();
                            $('input[name="Variable_Sens2"]').hide();
                            $('input[name="Variable_Sens4"]').hide();
                            $('input[name="Variable_Sens1"]').removeClass("required");
                            $('input[name="Variable_Sens1"]').attr("disabled",true);
                            $('input[name="Variable_Sens1"]').next().hide();
                            $('input[name="Variable_Sens2"]').removeClass("required");
                            $('input[name="Variable_Sens2"]').attr("disabled",true);
                            $('input[name="Variable_Sens2"]').next().hide();
                            $('input[name="Variable_Sens4"]').removeClass("required");
                            $('input[name="Variable_Sens4"]').attr("disabled",true);
                            $('input[name="Variable_Sens4"]').next().hide();
                            break;
                        case 7: 
                            var val = $('input[name="variable_Do"]').val();
                            //                            $('input[name="Variable_Sens4"]').val(val);
                            $('input[name="Variable_Sens4"]').show();
                            $('input[name="Variable_Sens4"]').addClass("required");
                            $('input[name="Variable_Sens4"]').attr("disabled",false);
                            $('input[name="Variable_Sens4"]').next().show();
                            $('input[name="Variable_Sens1"]').hide();
                            $('input[name="Variable_Sens2"]').hide();
                            $('input[name="Variable_Sens3"]').hide();
                            $('input[name="Variable_Sens1"]').removeClass("required");
                            $('input[name="Variable_Sens1"]').attr("disabled",true);
                            $('input[name="Variable_Sens1"]').next().hide();
                            $('input[name="Variable_Sens2"]').removeClass("required");
                            $('input[name="Variable_Sens2"]').attr("disabled",true);
                            $('input[name="Variable_Sens2"]').next().hide();
                            $('input[name="Variable_Sens3"]').removeClass("required");
                            $('input[name="Variable_Sens3"]').attr("disabled",true);
                            $('input[name="Variable_Sens3"]').next().hide();
                            break;
                        case 8:
                            var val = $('input[name="LOB_Do"]').val();
                            //                            $('input[name="LOB_Sens1"]').val(val);
                            $('input[name="LOB_Sens1"]').show();
                            $('input[name="LOB_Sens1"]').addClass("required");
                            $('input[name="LOB_Sens1"]').attr("disabled",false);
                            $('input[name="LOB_Sens1"]').next().show();
                            $('input[name="LOB_Sens2"]').hide();
                            $('input[name="LOB_Sens2"]').removeClass("required");
                            $('input[name="LOB_Sens2"]').attr("disabled",true);
                            $('input[name="LOB_Sens2"]').next().hide();
                            
                            break;
                        case 9: 
                            var val = $('input[name="LOB_d"]').val();
                            //                            $('input[name="LOB_Sens2"]').val(val);
                            $('input[name="LOB_Sens2"]').show();
                            $('input[name="LOB_Sens2"]').addClass("required");
                            $('input[name="LOB_Sens2"]').attr("disabled",false);
                            $('input[name="LOB_Sens2"]').next().show();
                            $('input[name="LOB_Sens1"]').hide();
                            $('input[name="LOB_Sens1"]').removeClass("required");
                            $('input[name="LOB_Sens1"]').attr("disabled",true);
                            $('input[name="LOB_Sens1"]').next().hide();
                            break;
                    }
                }
                
                
                /*
                 * Application Menu Slider Bar DropDownnn
                 */
                $('.hasSubMenu').hover(
                function(){
                    $(this).find('ul').show(1000).stop(true,true);
                },function(){
                    $(this).find('ul').hide(100).stop(true,true);
                });
                /*slider*/
                $(window).load(function() {
                    $('#slider').nivoSlider();
                });
                /*End of slider call*/
                var div = $('.feedback')[0];
               
                $(window).scroll(function(){
                    var v = ($(window).height()-$(div).height())/2;
                    v += $(window).scrollTop();
                    $(div).css({ 
                        //                left:'-'+($(div).width()-20)+'px',
                        top:v-100
                    });
                });
                
                /*
                 *  Mask Code Here.....
                 */
                var Mask = {
                    showMask : function(div,options)
                    {
                        var maskDiv = document.createElement('div');
                        $(maskDiv).css({
                            'position':'absolute',
                            'left':$(div).position().left,
                            'top':$(div).position().top,
                            'width':$(div).outerWidth(),
                            'height':$(div).outerHeight(),
                            'text-align':'center',
                            'background':'url("res/images/loading.gif") no-repeat center black',
                            'color':'red'
                        });

                        $(maskDiv).attr({
                            'class':'maskDiv'
                        });

                        $(maskDiv).html("Loading Please wait...........").fadeTo(0,0.5,null);
                        var ele = $(div).parent()[0];
                        $(ele).append(maskDiv);
                    },
                    hideMask : function(div)
                    {
                        var ele = $(div).parent()[0];
                        $(ele).find('.maskDiv').remove();
                    }
                }
                
                
                
            });
        </script>
        <style type="text/css">
            a
            {
                color:#333;
                text-decoration:none;
            }
            a:hover
            {
                color:#ccc;
                text-decoration:none;
            }

            .close{
                cursor: pointer;
            }
            .bgColor{
                backgroundColor:"#FFDDAA";
            }
            #dialogImg{
                cursor: pointer;
            }
            #AppMenu ul.menu
            {
                /*    background-color: lightgrey;*/
                /*    background-color: whitesmoke;*/
                height: 36px;
                width: 730px;
                margin-bottom: 0px;
            }
            #AppMenu ul.menu li
            {

                float:left;
                margin-right: 5px;
                vertical-align: middle;
                font-weight:  400;
                display: block;
                padding: 10px 10px;
                background: #135171;
                /*                background: url('../images/button2.jpg') repeat-x;*/
                border-radius: 5px 5px 0 0;
                -o-border-radius: 5px 5px 0 0;
                -webkit-border-top-left-radius: 5px;
                -webkit-border-top-right-radius: 5px;
                margin-bottom: -1px;
                border: 1px solid #185F92;
                border-width: 1px 1px 1px 1px;
                position: relative;
                cursor: pointer;
                color: white;

            }
            #AppMenu ul.menu li:hover
            {
                /*    background: #F9FBFB;*/
                /*    -webkit-box-shadow: 1px 1px 1px 1px black;
                    -moz-box-shadow: 1px 1px 1px 1px black;*/
                /*    font-weight: bold;*/
                background: #76392; 
                color: white;
            }
            #AppMenu ul.menu li.active
            {
                background: #F9FBFB;
                top: 1px;
                border-bottom: 0px;
                color: black;
                font-weight: bold;
            }
            #AppMenu .tabBorder
            {
                width: 730px;
                height: 400px;
                border: 1px solid #2A76A4;
            }
        </style>
    </head>
    <body>
        <div align="center">
            <div class="feedback">
                <a id="feedback_button" class="a"><img src="res/images/feedback.png"/></a>
                <div class="form">
                    <h2>Feedback Please</h2>
                    <p><label>Name: </label><input type="text" /></p>
                    <p><label>Email: </label><input type="text" /></p>
                    <p><label>Subject: </label><input type="text" /></p>
                    <p><label>Message: </label><textarea></textarea></p>
                    <p><input type="button" value="Send" class="btn"/></p>
                </div>
            </div>
            <table width="990" class="content" border="0">
                <tr>
                    <td>
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tr valign="top">
                                <td width="200">
                                    <a href="Home.html"><img src="res/images/logo.png" ></a>
                                </td>
                                <td width="790">
                                    <img src="res/images/Fluid Mechnanics Logo.jpg" alt="Application Logo" style="border: 1px solid  #4A98E2" height="80px" align="right" class="AppLogo"/>
                                </td>
                            </tr>
                            <tr>
                                <td valign="bottom" class="menu1" colspan="2">
                                    <ul class="dropMenu">
                                        <li ><a class="active" href="http://aceengineer.com/AceEngineer/Home.html">Home</a></li>
                                        <li ><a href="http://aceengineer.com/AceEngineer/Services.html">Services</a></li>
                                        <li class="hasSubMenu"><a href="http://aceengineer.com/AceEngineer/applications.html">Applications</a>
                                            <ul class="subMenu ">
                                                <li><a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a></li>
                                                <li><a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a></li>
                                                <li><a href="http://aceengineer.com/StockAnalysis/">Stock Management</a></li>
                                                <li><a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a></li>
                                                <li><a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a></li>
                                                <li class="bottom_border"><a href="#">Fluid Mechanics</a></li>

                                            </ul>
                                        </li>
                                        <li class="hasSubMenu" ><a href="http://aceengineer.com/AceEngineer/aboutUs.html" >About Us</a>
                                        <li><a href="http://aceengineer.com/AceEngineer/Careers.html">Careers</a></li>
                                        <li><a href="http://aceengineer.com/AceEngineer/contactus.html">Contact Us</a></li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table boerder="0" width="100%">
                            <!--                            <tr>
                                                            <td>
                                                                <img src="res/images/img.png" width="990px"/>
                                                            </td>
                                                        </tr>-->
                            <tr>
                                <td>
                                    <table border="0" width="100%">
                                        <tr>
                                            <td style="width: 200px;display: block;" valign="top">
                                                <table border="0" width="100%">
                                                    <tr>
                                                        <td>
                                                            <h3 class="designhome">Mechanisms</h3>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <ul class="structuralList" id="names">
                                                                <li value="0" class="bgColor">Introduction</li>
                                                                <li value="1" class="bgColor">Emptying Fluid filled container</li>
                                                                <li value="2" class="bgColor">Loss of Buoyancy</li>
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td valign="top" align="left" id="introduction" style='width:790px;'>
                                                <table border="0" width="100%">
                                                    <tr>
                                                        <td colspan="2">
                                                            <h3>Fluid Mechanics</h3>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td valign="top" style='height:400px;'>
                                                            <p>
                                                                </br>
                                                                A fluid is a substance that deforms continuously when subjected to a tangential or shear stress, however small the shear stress may be. Such a continuous deformation under the stress constitutes a flow. </br>
                                                                </br>                                                                Fluid mechanics is the study of mechanics of such matter. As such, it pertains mostly to the study of liquids and gases, however the general theories may be applied to the study of amorphous solids, colloidal suspensions and gelatinous materials.</br>
                                                                </br>AceEngineer has developed two applications using simple conservation of energy and ideal gas laws.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table> 
                                            </td>
                                            <td style="display: none;width:790px;" valign="top" align="left" id="EmptyFluid">
                                                <table border="0">
                                                    <tr>
                                                        <td style="width: 790px">
                                                            <h3>Emptying Fluid Content</h3> 
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td valign="top">
                                                            <div id="AppMenu">
                                                                <ul class="menu">
                                                                    <div class="AppMenuClass"><li class="active" id="Constant_Pre">Constant Pressure</li></div>
                                                                    <div class="AppMenuClass"><li id="Variable_Pre">Variable Pressure</li></div>
                                                                </ul>
                                                                <table class="tabBorder">
                                                                    <tr>
                                                                        <td colspan="3">
                                                                            This application calculates the time taken, exit velocity for the fluid filled container with a small exit hole at the bottom. The container can be open (constant pressure) or closed (variable pressure) at the top.
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td valign="top" id="Constant_Pre_Content">
                                                                            <form id="ConstantForm" method="post">
                                                                                <table>
                                                                                    <tr><td></td></tr>
                                                                                    <tr><td> Gravity "g" (m/s2):</td><td><input type="text" name="constant_g" value="9.81"/></td></tr>
                                                                                    <tr><td>Pressure Head h(m):</td><td><input type="text" name="constant_hm"/></td></tr>
                                                                                    <tr><td>Diameter of Vessel (m):</td><td><input type="text" name="constant_Dv"/></td></tr>
                                                                                    <tr><td>Diameter of Outlet (m):</td><td><input type="text" name="constant_Do"/></td></tr>
                                                                                    <tr><td>Coefficient of discharge, Cd:</td><td><input type="text" name="constant_Cd"/></td></tr>
                                                                                    <tr><td colspan="2"><h2>Inlet Conditions</h2></td></tr>
                                                                                    <tr><td>Pressure at inlet P1 (pa): </td><td><input type="text" name="constant_P1"/></td></tr>
                                                                                    <tr><td>Density p1 (kg/m3):</td><td><input type="text" name="constant_p1"/></td></tr>
                                                                                    <tr><td colspan="2"><h2> Outlet Conditions</h2></td></tr>
                                                                                    <tr><td> Pressure at Outlet P2 (pa):</td><td><input type="text" name="constant_P2"/></td></tr>
                                                                                    <tr><td>Density p2 (kg/m3): </td><td><input type="text" name="constant_p2"/></td></tr>
                                                                                    <tr><td>Cross Section:</td><td><select><option>Circle</option></select></td></tr>
                                                                                    <tr><td colspan="2" align="right"><input type="button" id="CP_Calculate" value="Calculate"/></td></tr>
                                                                                </table>
                                                                            </form>
                                                                        </td>
                                                                        <td valign="top" style="display: none;" id="Variable_Pre_Content">
                                                                            <form id="VariableForm" method="post">
                                                                                <table>
                                                                                    <tr><td> Gravity "g" (m/s2):</td><td><input type="text" name="variable_g" value="9.81"/></td></tr>
                                                                                    <tr><td>Vessel Height H(m):</td><td><input type="text" name="variable_Hm"/></td></tr>
                                                                                    <tr><td>Water Level (m):</td><td><input type="text" name="variable_hm"/></td></tr>
                                                                                    <tr><td>Diameter of Vessel (m):</td><td><input type="text" name="variable_Dv"/></td></tr>
                                                                                    <tr><td>Diameter of outlet (m):</td><td><input type="text" name="variable_Do"/></td></tr>
                                                                                    <tr><td>Coefficient of discharge, Cd:</td><td><input type="text" name="variable_Cd"/></td></tr>
                                                                                    <tr><td colspan="2"><h2>Inlet Conditions</h2></td></tr>
                                                                                    <tr><td>Pressure at inlet P1 (pa): </td><td><input type="text" name="variable_P1"/></td></tr>
                                                                                    <tr><td colspan="2"><input type="radio" name="choice" checked="true">isothermal</input> <input type="radio" name="choice"> isentrophic</input></td></tr>
                                                                                    <tr><td>Gamma (Y):</td><td><input type="text" name="variable_Y" value="1"/></td></tr>
                                                                                    <tr><td>Density p1 (kg/m3):</td><td><input type="text" name="variable_p1"/></td></tr>
                                                                                    <tr><td colspan="2"><h2> Outlet Conditions</h2></td></tr>
                                                                                    <tr><td>Pressure at Outlet P2 (pa): </td><td><input type="text" name="variable_P2"/></td></tr>
                                                                                    <tr><td>Density p2 (kg/m3): </td><td><input type="text" name="variable_p2"/></td></tr>
                                                                                    <tr><td>Cross Section:</td><td><select><option>Circle</option></select></td></tr>
                                                                                    <tr><td colspan="2" align="right"><input type="button" id="VP_Calculate" value="Calculate"/></td></tr>
                                                                                </table>
                                                                            </form>
                                                                        </td>
                                                                        <td valign="top">
                                                                            <div>
                                                                                <select id="typeOfContainer" style="display: none;">
                                                                                    <option value="0">Closed container</option>
                                                                                    <option value="1">Open container</option>
                                                                                    <option value="2">Dipped container</option>
                                                                                </select>  
                                                                                <!--                                                                                <label id="label1">Vessel height: </label><input type="text" id="vessel" />-->
                                                                                <!--                                                                                <label id ="label2">Fluid level :</label><input type="text" id="fLevel" />-->
                                                                                <!--                                                                                <input type="button" value="draw" id="draw"/>-->
                                                                                <!--                                                                                <input type="button" value="release" id="animate"/>-->
                                                                            </div>
                                                                            <div id='goraphaelsource'>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td id="Output_Constant" style="display: none;" colspan="3">
                                                                            <h3>Output Results</h3>
                                                                            <table>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table  align="center">
                                                                                            <tr><td  class="outputResults1">Area1 </td><td id="C_Area1" class="outputResults1"></td></tr>
                                                                                            <tr><td  class="outputResults2">Area2 </td><td id="C_Area2" class="outputResults2"></td></tr>
                                                                                            <tr><td  class="outputResults1">Exit Velocity </td><td id="C_EV" class="outputResults1" ></td></tr>
                                                                                            <tr><td  class="outputResults2">Free Surface Velocity </td><td id="C_FV" class="outputResults2"></td></tr>
                                                                                            <tr><td  class="outputResults1">Total Time Taken </td><td id="C_TTT" class="outputResults1"></td></tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="C_Chart1" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="C_Chart2" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="C_Chart3" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4" align="right">
                                                                                        <input type="button" id="Constant_Add_Sens" value="Add Sensitivity"/>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr id="Constant_Sens_Input" style="display: none;">
                                                                                    <td colspan="4">
                                                                                        <h3>Sensitivity Analysis <img src="res/images/Add.png" align="right" style="cursor: pointer;display: none;" id="addImgConstant" /> <img src="res/images/minus.png" align="right" id="minusImgConstant"/></h3>
                                                                                        <form id="Constant_Sens_Form">
                                                                                            <table>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Pressure at Inlet P1 (pa)   </td><td> <input type="text" name="Constant_Sens1" style="display: none;" class="required FN NONZero"/></td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Pressure Head h(m) </td> <td> <input type="text" name="Constant_Sens2" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Diameter of Vessel </td><td> <input type="text" name="Constant_Sens3" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Diameter of Outlet</td><td> <input type="text" name="Constant_Sens4" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <input id="Constant_Sens_Apply" type="button" value="Apply Sensitivity"/>
                                                                                        </form>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr id="Constant_Sens_Output" style="display: none;">
                                                                                    <td colspan="4">
                                                                                        <div id="C_Chart4" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                        <div id="C_Chart5" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                        <td id="Output_Variable" style="display: none;" colspan="3">
                                                                            <h3>Output Results</h3>
                                                                            <table>
                                                                                <tr>
                                                                                    <td>
                                                                                        <table align="center">
                                                                                            <tr><td class="outputResults1">Area1 </td><td id="V_Area1" class="outputResults1"></td></tr>
                                                                                            <tr><td class="outputResults2">Area2 </td><td id="V_Area2" class="outputResults2"></td></tr>
                                                                                            <tr><td class="outputResults1">Exit Velocity </td><td id="V_EV" class="outputResults1"></td></tr>
                                                                                            <tr><td class="outputResults2">Free Surface Velocity </td><td id="V_FV" class="outputResults2"></td></tr>   
                                                                                            <tr><td  class="outputResults1">Total Time Taken </td><td id="VP_TTT" class="outputResults1"></td></tr>
                                                                                        </table>
                                                                                    </td>                                                                                    
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="V_Chart1" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="V_Chart2" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4">
                                                                                        <div id="V_Chart3" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="4" align="right">
                                                                                        <input type="button" id="Variable_Add_Sens" value="Add Sensitivity"/>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr id="Variable_Sens_Input" style="display: none;">
                                                                                    <td colspan="4">
                                                                                        <h3>Sensitivity Analysis <img src="res/images/Add.png" align="right" style="cursor: pointer;display: none;" id="addImgVariable" /> <img src="res/images/minus.png" align="right" id="minusImgVariable" /></h3>
                                                                                        <form id="Variable_Sens_Form">
                                                                                            <table>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Pressure at Inlet   </td><td> <input type="text" name="Variable_Sens1" style="display: none;" class="required FN NONZero"/></td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Pressure Head </td> <td> <input type="text" name="Variable_Sens2" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Diameter of Vessel </td><td> <input type="text" name="Variable_Sens3" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><input type="radio" name="Sens_Const" /> Diameter of Outlet</td><td> <input type="text" name="Variable_Sens4" style="display: none;" class="required FN NONZero"/> </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <input id="Variable_Sens_Apply" type="button" value="Apply Sensitivity"/>
                                                                                        </form>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr id="Variable_Sens_Output" style="display: none;">
                                                                                    <td colspan="4">
                                                                                        <div id="V_Chart4" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                        <div id="V_Chart5" style="width: 700px;height: 500px">
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table> 
                                            </td>
                                            <td style="display: none;width:790px;" id="LossOfBuoyancy" valign="top" align="left">
                                                <table border="0" width="100%">
                                                    <tr>
                                                        <td colspan="2">
                                                            <h3>Loss Of Buoyancy</h3>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="2">
                                                            This application calculates the decrease in pressure and loss of buoyancy due to set down of a typical air-can or buoyancy-can which is open to the outside pressure. This is typical of open air-can or buoyancy-can designs. An open design is chosen to help with collapse pressure design at lower water depths.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td valign="top">
                                                            <form id="LOBForm" method="post">
                                                                <table>
                                                                    <tr><td colspan="2"><h2>Universal Constants</h2></td></tr>
                                                                    <tr><td> Gravity "g" (m/s2):</td><td><input type="text" name="LOB_g" value="9.81"/></td></tr>
                                                                    <tr><td>Water Depth  D (m):</td><td><input type="text" name="LOB_D"/></td></tr>
                                                                    <tr><td colspan="2"><h2>Container</h2></td></tr>
                                                                    <tr><td>Diameter of Vessel (m):</td><td><input type="text" name="LOB_Dv"/></td></tr>
                                                                    <tr><td>Length L1 (m):</td><td><input type="text" name="LOB_L1"/></td></tr>
                                                                    <tr><td colspan="2"><h2>Vent Pipe</h2></td></tr>
                                                                    <tr><td>Diameter of vent pipe, Do (pa): </td><td><input type="text" name="LOB_Do"/></td></tr>
                                                                    <tr><td>Length L2 (m): </td><td><input type="text" name="LOB_L2"/></td></tr>
                                                                    <tr><td>Set down distance:</td><td><input type="text" name="LOB_d"/></td></tr>
                                                                    <tr><td>Density of sea water pseawater (kg/m3)" </td><td><input type="text" name="LOB_pseawater"/></td></tr>
                                                                    <tr><td>Cross Section:</td><td><select><option>Circle</option></select></td></tr>
                                                                    <tr><td colspan="2"><input type="radio" name="LOB">Ideal gas</input><input type="radio" name="LOB" checked="true">Isentropic gas</input></td></tr>
                                                                    <tr><td>Gamma of air:</td><td><input type="text" name="LOB_GA" value="1.4"/></td></tr>
                                                                    <tr><td colspan="2" align="right"><input type="button" id="LOB_Calculate" value="Calculate"/></td></tr>
                                                                </table>
                                                            </form>
                                                        </td>
                                                        <td style="width: 60%">
                                                            <div id='goraphaelsourceLOB'>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td id="Output_LOB" style="display: none;" colspan="2">
                                                            <h3>Output Results</h3>
                                                            <table  style="width: 100%">
                                                                <tr><td class="outputResults1" align="center" colspan="2">Area1 :</td><td id="LOB_Area1" colspan="2"  class="outputResults1" align="center"></td></tr>
                                                                <tr> <td class="outputResults2" align="center" colspan="2">Area2</td><td id="LOB_Area2" colspan="2" class="outputResults2" align="center"></td></tr>
                                                                <tr>
                                                                    <td colspan="2" align="center"><h2>Assume Ideal Gas</h2></td>
                                                                    <td colspan="2" align="center"><h2>Assume Isentropic Gas</h2></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults1" align="center">P1 :</td><td id="LOB_Ideal_P1" class="outputResults1" align="center"></td>
                                                                    <td class="outputResults1" align="center">V1 :</td><td id="LOB_Isentropic_V1" class="outputResults1" align="center"></td>

                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults2" align="center">P2</td><td id="LOB_Ideal_P2" class="outputResults2" align="center"></td>
                                                                    <td class="outputResults2" align="center">Change in Volume :</td><td id="LOB_Isentropic_CV" class="outputResults2" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults1" align="center" >V1 :</td><td id="LOB_Ideal_V1" class="outputResults1" align="center"></td>
                                                                    <td class="outputResults1" align="center">Loss of Buoyancy</td><td id="LOB_Isentropic_LOB" class="outputResults1" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults2" align="center">V2</td><td id="LOB_Ideal_V2" class="outputResults2" align="center"></td>
                                                                    <td class="outputResults2" align="center">Newtons Isentropic:</td><td id="LOB_Isentropic_Newtons" class="outputResults2" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults1" align="center">Change in Volume :</td><td id="LOB_Ideal_CV" class="outputResults1" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults2" align="center">Loss of Buoyancy</td><td id="LOB_Ideal_LOB" class="outputResults2" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="outputResults1" align="center">Newtons Ideal:</td><td id="LOB_Ideal_Newtons" class="outputResults1" align="center"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="4" align="right">
                                                                        <input type="button" id="LOB_Add_Sens" value="Add Sensitivity"/>
                                                                    </td>
                                                                </tr>
                                                                <tr id="LOB_Sens_Input" style="display: none;">
                                                                    <td colspan="4">
                                                                        <h3>Sensitivity Analysis <img src="res/images/Add.png" align="right" style="cursor: pointer;display: none;" id="addImgLOB" /> <img src="res/images/minus.png" align="right" id="minusImgLOB" /></h3>
                                                                        <form id="LOB_Sens_Form">
                                                                            <table style="width: 100%">
                                                                                <tr>
                                                                                    <td colspan="1"><input type="radio" name="Sens_Const" /> Vent Tube Area   </td><td colspan="3"> <input type="text" name="LOB_Sens1" style="display: none;" class="required FN NONZero"/></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colspan="1"><input type="radio" name="Sens_Const" /> Set down Distance </td> <td colspan="3"> <input type="text" name="LOB_Sens2" style="display: none;" class="required FN NONZero"/> </td>
                                                                                </tr>
                                                                            </table>
                                                                            <input type="button" id="LOB_Sens_Apply" value="Apply Sensitivity"/>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                                <tr style="display: none;" id="LOB_Sens_Output">
                                                                    <td colspan="4">
                                                                        <h3>Sensitivity Output Results</h3>
                                                                        <table style="width: 100%" >
                                                                            <tr><td class="outputResults1" align="center" colspan="2">Area1 :</td><td id="LOB_Sens_Area1" class="outputResults1" colspan="2" align="center"></td></tr>
                                                                            <tr><td class="outputResults2" align="center" colspan="2">Area2</td><td id="LOB_Sens_Area2" class="outputResults2" colspan="2" align="center"></td></tr>
                                                                            <tr>
                                                                                <td colspan="2"><h2>Assume Ideal Gas</h2></td>
                                                                                <td colspan="2"><h2>Assume Isentropic Gas</h2></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="outputResults1" align="center">P1 :</td><td id="LOB_Sens_Ideal_P1" class="outputResults1" align="center"></td>
                                                                                <td class="outputResults1" align="center">V1 :</td><td id="LOB_Sens_Isentropic_V1" class="outputResults1" align="center"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="outputResults2" align="center">P2</td><td id="LOB_Sens_Ideal_P2" class="outputResults2" align="center"></td>
                                                                                <td class="outputResults2" align="center">Change in Volume :</td><td id="LOB_Sens_Isentropic_CV" class="outputResults2" align="center"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="outputResults1" align="center">V1 :</td><td id="LOB_Sens_Ideal_V1" class="outputResults1" align="center"></td>
                                                                                <td class="outputResults1" align="center">Loss of Buoyancy</td><td id="LOB_Sens_Isentropic_LOB" class="outputResults1" align="center"></td>
                                                                            </tr>
                                                                            <tr> 
                                                                                <td class="outputResults2" align="center">V2</td><td id="LOB_Sens_Ideal_V2" class="outputResults2" align="center"></td>
                                                                                <td class="outputResults2" align="center">Newtons Isentropic:</td><td id="LOB_Sens_Isentropic_Newtons" class="outputResults2" align="center"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="outputResults1" align="center">Change in Volume :</td><td id="LOB_Sens_Ideal_CV" class="outputResults1" align="center"></td>
                                                                            </tr>
                                                                            <tr> 
                                                                                <td class="outputResults2" align="center">Loss of Buoyancy</td><td id="LOB_Sens_Ideal_LOB" class="outputResults2" align="center"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="outputResults1" align="center">Newtons Ideal:</td><td id="LOB_Sens_Ideal_Newtons" class="outputResults1" align="center"></td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table> 
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <!--            Starting of Site Map Content-->
            <div id="Footer" style="border: 1px solid #ffffff">
                <table id="siteMap" width="990" align="center">
                    <tr>
                        <td valign="top">
                            <ul type="none">
                                <li><a href="http://aceengineer.com/AceEngineer/Home.html"><strong>Home</strong></a></li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul type="none">
                                <li>
                                    <a href="http://aceengineer.com/AceEngineer/aboutUs.html"><strong>About Us</strong></a><br> 
                                    <a href="http://aceengineer.com/AceEngineer/Home.html">Mission and Values</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Home.html">History</a>
                                </li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul type="none">
                                <li> 
                                    <a href="http://aceengineer.com/AceEngineer/Services.html"><strong>Services</strong></a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Financial Engineering</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Mechanical Engineering</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Civil and Structural Engineering</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Project Management Tools</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Web Designing and Web Hosting</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Mobile Apps development</a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Services.html">Business improvement plans</a>
                                </li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul type="none">
                                <li>
                                    <a href="http://aceengineer.com/AceEngineer/applications.html"><strong>Applications</strong></a><br>
                                    <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas</a><br>
                                    <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis</a><br>
                                    <a href="http://aceengineer.com/StockAnalysis/">Stock Management</a><br>
                                    <a href="#">Heat Transfer</a><br>
                                    <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a><br>
                                    <a href="http://aceengineer.com/DataManipulation/">Data Manipulation</a><br>
                                    <a href="#">Fluid Mechanics</a><br>
                                </li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul type="none">
                                <li>
                                    <a href="http://aceengineer.com/AceEngineer/Careers.html"><strong>Careers</strong></a><br>
                                    <a href="http://aceengineer.com/AceEngineer/Careers.html">Current Openings</a>
                                </li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul type="none">
                                <li><a href="http://aceengineer.com/AceEngineer/contactus.html"><strong>Contact Us</strong></a></li>
                            </ul>
                        </td>
                    </tr>
                    <tr>

                        <td colspan="6" align="right" valign="baseline" style="border-bottom: 1px solid white;">
                            <label  style="color:white; vertical-align: top; font-size:16px; ">Follow us on :</label>
                            <a target="blank" href="http://www.facebook.com/AceEngineer?ref=hl"><img src="res/images/Facebook-Buttons-1-10-.png"/></a>
                            <a target="blank" href="https://twitter.com/AceEngineer1"><img src="res/images/twitter.png"/></a>
                            <a target="blank" href="https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"><img src="res/images/Googleplus.png"/></a>
                            <a target="blank" href="http://www.linkedin.com/company/aceengineer"><img src="res/images/linkin_icon.png"/></a>
                        </td>
                    </tr>
                    <tr align="center">
                        <td colspan="6">
                            <a href="http://aceengineer.com/AceTools/vmStressCheck.jsp">Oil & Gas &nbsp;&Vert;&nbsp;</a>
                            <a href="http://aceengineer.com/StatisticalAnalysis/">Statistical Analysis &nbsp;&Vert;&nbsp;</a>
                            <a href="http://aceengineer.com/StockAnalysis/HistoricalPrices.html">Stock Management&nbsp;&Vert;&nbsp;</a>
                            <a href="#">Heat Transfer&nbsp;&Vert;&nbsp;</a>
                            <a href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis&nbsp;&Vert;&nbsp;</a>
                            <a href="http://aceengineer.com/DataManipulation/">Data Manipulation&nbsp;&Vert;&nbsp;</a>
                            <a href="#">Fluid Mechanics</a><br>
                            <a href="Terms-conditions.html">Terms & Conditions&nbsp;&Vert;&nbsp;</a>
                            <a href="Terms-conditions.html">Privacy policy</a>
                        </td>
                    </tr>
                    <tr align="center">
                        <td colspan="6" style="color:#ffffff;">
                            AceEngineer &copy; 2011, powered by PEPL
                        </td>
                    </tr>
                </table>
            </div>
            <!--        Ending of the Site Map Content-->
    </body>
</html>
