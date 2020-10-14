<%-- 
    Document   : manageTimeSheet
    Created on : Mar 29, 2012, 10:04:02 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link rel="stylesheet" type="text/css" href="res/css/ElementManipulator.css"/>        
        <!--        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>-->

        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/Core.js"></script>
        <script type="text/javascript" src="res/js/ElementManipulator.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
        <script type="text/javascript" src="res/js/date.js"></script>
        <script type="text/javascript">
            var projId;
            var phasesDiv;
            var userDBProjInfo;
            var actualProjInfo;
            var userProjInfo = [];
            var activePhases = [];
            var inActivePhases = [];
            var minDate = new Date();
            minDate.moveToDayOfWeek(1,-1);
            minDate.addDays(-7);
            
            // This Variable tells whether the add New phase is Already poped or NOt
            var phaseInputState = false;
            
            // This Object Holds teh Div Element for Adding The New Phase
            var addPhaseDiv;
            
            var newPhaseActive = false;
            
            $(function()
            {                
                phasesDiv = $('#phasesDiv');
                projId = $('[name="projId"]').val();
                
                $('form').submit(function()
                {
                    //alert($('[name="projStatus"]').val());
                    
                    //alert(userDBProjInfo.length);
                    //getActivePhases();
                    var ind = -1;
                    for(var i=0;i<userDBProjInfo.length;i++)
                    {
                        if(userDBProjInfo[i].projId == projId){
                            ind = i;
                            break;
                        }
                    }
                    try{
                        //alert($.toJSON(userDBProjInfo));
                        var projStatus = parseInt($('#projStatus').attr('key'));
                        var projTitle = $('[name="projTitle"]').val();
                        projStatus = projStatus==0?false:true;
                    
                        var obj = {projId:projId,title:projTitle,active:projStatus,phases:getActivePhases()};
                        if(ind != -1)
                            userDBProjInfo[i] = obj;
                        else
                            userDBProjInfo.push(obj);
                
                        $('#tempDiv').html($.toJSON(userDBProjInfo));
                        $('input[name="projDBData"]').val($.toJSON(userDBProjInfo));
                    }catch(e){alert(e);}
                    //alert($('input[name="projDBData"]').val());
                    //return false;
                });
                
                initForm();
                
                makeDynamicContent();
                registerAddPhase();                
            });
            
            
            function initForm()
            {
                registerStatusElement();                
            }
            
            
            /**
             * THis Method Register the Status Element
             */
            function registerStatusElement(ele,handler)
            {
                ele = !ele?$('.statusElement'):ele;
                
                $(ele).each(function()
                {
                    $(this).click(function()
                    {
                        var key = $(this).attr("key");
                        switch(key)
                        {
                            case '0':
                                $(this).html("Active");
                                $(this).attr("key",'1').addClass('active');
                                handler(true);
                                break;
                            case '1':
                                $(this).html("De Active");
                                $(this).attr("key","0").removeClass('active');
                                handler(false);
                                break;
                        }
                    });
                })
            }
            
            
            /**
             * This Method gets the Current Active Projects List
             */
            function getActivePhases(){
                var ps = [];
                var lm = [];
                var s = [];
                $('.phaseName').each(function(){                
                    ps.push($(this).html());
                });                
                $('.phaseLM').each(function(){
                    lm.push($(this).html());
                });
                //alert(lm);
                $('.phaseS').each(function(){
                    var key = 0;
                    try{
                        var key = parseInt($(this).attr('key'));
                    }catch(e){}
                    s.push(key==0?false:true);
                });
                
                var phases = [];
                for(var i=0;i<ps.length;i++){
                    var obj = {P:ps[i],LM:lm[i],S:s[i]};
                    phases.push(obj);
                }
                
                //alert($.toJSON(phases));
                return phases;
            }
            
            
            /**
             * THis Method Adds the Click Event to the Add Phase Button
             */
            function registerAddPhase(){
                $('#addPhaseBtn').click(function()
                {
                    if(phaseInputState == true){
                        $('#newPhasePopupDiv').
                            animate({opacity:0.2}, 50, 'linear', null).
                            animate({opacity:1.0}, 200, 'linear', null);
                        return;
                    }
                    
                    if(inActivePhases.length<1){
                        alert("Sorry! There are No more Phases");
                        return;
                    }
                    phaseInputState = true;
                    $(phasesDiv).append(addNewPhase());
                });
            }
            
            
            function makeDynamicContent()
            {                
                var data = $('#tsPJsonData').html();
                data = $.trim(data);
                //alert("'"+data+"'");
                userProjInfo = data==""?[]:eval("("+data+")");
                userDBProjInfo = userProjInfo;
                //alert(userProjInfo);
                var data = $('#actualProjData').html();
                actualProjInfo = data==""?[]:eval("("+data+")");
                
                for(var i=0;i<userProjInfo.length;i++)
                {
                    var projObj = userProjInfo[i];
                    if(projObj.projId == projId)
                    {
                        userProjInfo = projObj;
                        makeProjDiv(projObj);
                        break;
                    }
                }
                //alert("Project Scanning Done..."+inActivePhases);
                try{
                    if(userProjInfo.phases){
                        for(var i=0;i<userProjInfo.phases.length;i++){
                            activePhases.push(userProjInfo.phases[i].P);
                        }
                    }
                    //alert("done");
                    for(i=0;i<actualProjInfo.length;i++){                    
                        if(activePhases.indexOf(actualProjInfo[i].pName)<0)
                            inActivePhases.push(actualProjInfo[i].pName);
                    }
                }catch(e){alert(e);}
                //alert(inActivePhases);
            }
            
            
            /**
             *  This Method Makes the Project Div with the Given Project Object
             */
            function makeProjDiv(projObj){
                
                if(projObj.active){
                    $('#projStatus').html("Active").addClass('active').attr('key','1');
                }
                else{
                    $('#projStatus').html("De Active").attr('key','0');
                }
                var phases = projObj.phases;
                if(phases.length<1){
                    $(phasesDiv).html("<h4 class='myHeading'>There are no Phases Related to You<br/>You can Add Phases by Clicking On \"Add New Phase\"</h4>");
                }
                else{
                    for(var i=0;i<phases.length;i++){
                        //$(phasesDiv).prepend(makePhaseDiv(phases[i]));
                        addPhase(phases[i]);
                    }
                }
            }
            
            /**
             * This MEthod adds the New Phase with the Given Phase Object
             */
            function addPhase(phaseObj){
                $(phasesDiv).append(makePhaseDiv(phaseObj));
            }
            
            /**
             * This Method Adds ther New Phase with the Certain Input Elements
             */
            function addNewPhase()
            {                
                var combo = "<select name='phaseName' class='ipElement'>";
                for(var i=0;i<inActivePhases.length;i++){
                    combo += "<option value='"+inActivePhases[i]+"'>"+inActivePhases[i]+"</option>";
                }
                combo += "</select>";
                combo += "<label class='addPhase labelButton'>Add Phase</label>";
                combo += "<label class='cancelPhase labelButton'>Cancel</label>";
                
                var d = document.createElement('div');
                
                $(d).attr({'id':'newPhasePopupDiv'});
                $(d).append(combo);
                $(d).css({
                    'position':'absolute',
                    'padding':'20px',
                    'background':'grey',
                    left:($(window).width()-$(d).outerWidth())/2,
                    top:($(window).height()-$(d).outerHeight())/2
                }).addClass('border10');
                
                $('.addPhase',d).click(function()
                {
                    var phaseObj = {};
                    $('.ipElement',d).each(function(){                        
                        phaseObj.P = $(this).val();
                    });
                    activePhases.push(phaseObj.P);                    
                    inActivePhases.removeElement(phaseObj.P);
                    addPhase(phaseObj);
                    $('.myHeading',phasesDiv).html("");
                    $(d).remove();
                    // Enabling to add the phase Chooser Div
                    phaseInputState = false;
                });
                
                $('.cancelPhase',d).click(function(){                    
                    $(d).remove();
                    // Enabling to add the phase Chooser Div
                    phaseInputState = false;
                });
                
                $('body').append(d);
            }
            
            /**
             * This method Makes the Phases Div of the Given Projject Phases
             */
            function makePhaseDiv(phaseObj)
            {
                phaseObj = !phaseObj||phaseObj==null?{}:phaseObj;
                
                phaseObj.P = phaseObj.P==undefined?"":phaseObj.P;
                phaseObj.LM = phaseObj.LM==undefined?new Date().getDateAsPlainText():phaseObj.LM;
                phaseObj.S = phaseObj.S==undefined?true:phaseObj.S;
                
                if(Date.parse(phaseObj.LM) < minDate)
                    phaseObj.S = false;
                
                var div = document.createElement('span');
                //$(div).css({'float':'left',border:'1px solid grey',padding: '5px'});
                $(div).addClass('phaseDiv border10');
                
                var cnt = "<table>";
                cnt += "<thead>"                
                    +"</thead>";
                
                cnt += "<tbody>"
                    +"<tr><td>Phase</td><td><label class='phaseName'>"+phaseObj.P+"</label></td></tr>"
                    +"<tr><td>Last Use</td><td><label class='phaseLM'>"+phaseObj.LM+"</label></td></tr>";
                if(phaseObj.S){
                    cnt += "<tr><td>State</td><td><label class='phaseS statusElement toggleButton active border10' key='1'>Active</label></td></tr>";
                }
                else{
                    cnt += "<tr><td>Active State</td><td><label class='phaseS statusElement toggleButton border10' key='0'>De Active</label></td></tr>"
                }                
                    +"</tbody>";
                
                cnt += "</table>";
                
                
                $(div).append(cnt);
                
                // Registering The Status Element
                registerStatusElement($('.statusElement',div),function(status){
                    if(status){
                        $('.phaseLM',div).html(new Date().getDateAsPlainText());
                    }
                });
                
                DOMElement.makeAsClosable(div, {
                    CSS:'closeBtn',
                    before:function(){                        
                    },prompt:"Are You Sure to Remove This Phase"
                }, function(div){
                    $('.ipElement',div).each(function(){                        
                        phaseObj.P = $(this).val();
                    });
                    
                    
                    inActivePhases.push(phaseObj.P);                    
                    activePhases.removeElement(phaseObj.P);
                });
                return div;
            }
        </script>

        <style type="text/css">

            #phasesDiv{
                padding: 10px;
                background: #75b4c0;
                height: 240px;
                overflow: auto;
            }

            .phaseDiv{
                margin: 5px;
                display: inline-block;
                padding: 10px 5px;
                width: 170px;
                overflow: hidden;
                background: #535353;
                color: #d9dedf;                
            }

            .toggleButton{
                margin: 2px;
                padding: 5px 10px;
                background: #bd2323;
                display: inline-block;
                color: black;
                cursor: pointer;
            }

            .toggleButton:hover{
                color:white;
            }

            .toggleButton.active{
                color: white;
                background: #16b410;
            }

            .myHeading{
                margin: 0px;
                text-align: center;
            }
        </style>
        <title>JSP Page</title>

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
        <html:form action="manageTimeAction">

            <html:hidden property="projDBData" />
            <html:hidden property="empId" />

            <div id="tsPJsonData" class="hiddenField">
                <bean:write name="ManageTimeForm" property="projJson"/>
            </div>
            <div id="actualProjData" class="hiddenField">
                <bean:write name="ManageTimeForm" property="actualProjJson"/>
            </div>

            <table border="0" width="600px">
                <tr>
                    <td>
                        <table class="">
                            <tr>
                                <td>Project Id</td>
                                <td>
                                    : <bean:write name="ManageTimeForm" property="projId"/>
                                    <html:hidden property="projId"/>
                                </td>
                            </tr>
                            <tr>
                                <td>Project Title</td>
                                <td>
                                    : <bean:write name="ManageTimeForm" property="projTitle"/>
                                    <html:hidden property="projTitle" />
                                </td>
                            </tr>
                            <tr>
                                <td>Project Status</td>
                                <td><label key="1" id="projStatus" class="statusElement toggleButton border10">Active</label></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        Project Phases Related To You <br/>
                        <div id="phasesDiv" class="border10">
                        </div>

                    </td>
                </tr>
                <tr>
                    <td colspan="2" align="right">
                        <div>
                            <label href="#" class="labelButton" id="addPhaseBtn" style="float: left">Add New Phase</label>
                        </div>
                        <html:submit styleClass="button border10" value="Save Changes" />
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        Note : You Should save the Changes to take Effect.
                    </td>
                </tr>
            </table>

        </html:form>
        <div id="msgDiv" class="hiddenField">            
        </div>
        <div id="tempDiv" class="hiddenField">
        </div>
    </body>
</html>
