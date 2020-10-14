
<%@page import="java.util.*" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>
        <!--        <link rel="stylesheet" type="text/css" href="res/css/calendar.css"/>-->

        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <script type="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
        <!--        <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>-->

        <script type="text/javascript" src="res/js/CustomValidation.js"></script>

        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
                <script type="text/javascript" src="res/js/jquery.validate.js"></script>
                <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>
                <script type="text/javascript" src="res/js/date.js"></script>
                <script type="text/javascript" src="res/js/Calendar.js"></script>-->


        <script type="text/javascript">
            var cal;
            var prId;
            var employeesInfo = null;
            
            $(function()
            {
                validateForm();
                $('form222').submit(function()
                {
                    alert("Before Submitting");
                    $('#phasesDiv').find('div').each(function(ind)
                    {
                        alert("Index Is : "+ind);
                        try{
                            var text = $('[name="phaseEmps"]',this);
                            var val = $(text).val();
                            alert("Text Is :"+val);
                            var initials = val.split(",");
                            val = "";
                            for(var i=0;i<initials.length;i++){
                                val += getEmpId(initials[i]);
                                if(i<initials.length-1)
                                    val+=",";
                            }
                            $(text).val(val);                            
                        }catch(e){alert(e);}
                    });                    
                });
                try
                {
                    loadDynamicContent();
                    $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                    //cal = new Calendar($('.date'),1,1);
                    
                }catch(e){alert(e);}
                
                var leftList = $('#employeename');
                var rightList = $('#selectemp');
        
                $('#addTo').click(function()
                {
                    return !$(leftList).find('option:selected').remove().appendTo(rightList);
                });
                $('#addFrom').click(function()
                {
                    return !$(rightList).find('option:selected').remove().appendTo(leftList);
                });   
                var temp=0;
                $('#approvalCheck').click(function(){
                    if(this.checked == false) {
                        //alert("false");
                        //$('input[name="projTitle"]').val('');
                        //alert($('[name="selectAppId"]')[0].value);
                        $('input[name="projTitle"]').val('');
                        $('[name="selectAppId"]')[0].value = "";
                        $.get("projectHandler.do?mode=6",null,function(data)
                        {   
                            data = eval("("+data+")");
                            //var empIdData = data;
                            var projectId = data[2].projSeqId;
                            //alert(projectId);
                            $('input[name="projId"]').val(projectId);
                            //alert($('input[name="projId"]').val());
                        });
                        $("#appTR").hide();
                    }else {
                        $('input[name="projId"]').val('');
                        $("#appTR").show();
                    }
                    
                    //alert($('#approvalCheck').attr("disabled", $(this).is(":checked")));
                });
                
            });
            
            
            function loadDynamicContent()
            {                
                var selectedEmps = [];
                var empIdData ='';
                
                selectedEmps = !selectedEmps?[]:selectedEmps;
                $.get("projectHandler.do?mode=6",null,function(data)
                {   
                    data = eval("("+data+")");
                    
                    empIdData = data;
                    var empList = data[0].empIdInitials;
                    employeesInfo = data[0].empIdInitials;
                    //alert($.toJSON(employeesInfo));
                    //var projId = data[1].projSeqId;
                    //alert(projId);
                    //                    alert(empList[0].empInitials);
                    //if($('input[name="projId"]').val().length<1)
                    //{
                    //    $('input[name="projId"]').val(projId);
                    //}
                    
                    fillDynData(empIdData);
                });
                
                function fillDynData(empData)
                {
                    var empDetails = empData[0].empIdInitials;                    
                    
                    var businessIds = empData[1].BusinessApprovalIds;
                    
                    //alert(businessIds[1].approvalId);
                    //alert(businessIds.length);
                    var cnt="";
                    cnt+="<option value=''>Select Approval Id</option>";
                    for(var i=0;i<businessIds.length;i++){
                        cnt+="<option value='"+businessIds[i].approvalId+"'>"+businessIds[i].approvalId+"</option>";
                        $('#selectAppId').append(cnt);
                    }
                    
                    $('select[name="selectAppId"]').change(function(){
                        var chosenoption=this.options[this.selectedIndex];
                        if(chosenoption.value == ""){
                            $('input[name="projTitle"]').val('');
                            $('input[name="projId"]').val('');
                        }
                        for(var i=0;i<businessIds.length;i++){
                            if(chosenoption.value == businessIds[i].approvalId){
                                $('input[name="projTitle"]').val(businessIds[i].proTitle);
                                $('input[name="projId"]').val(businessIds[i].proID);
                            }
                        }                        
                    });
                    
                    
                    //                    alert(empDetails[0].empIds);
                    var data = $('#phasesJSON')[0];                    
                    if(data)
                    {
                        try{
                            data = data.innerHTML;
                            data = eval("("+data+")");
                            for(var i=0;i<data.length;i++)
                            {
                                $('#phasesDiv').append(makePhaseDiv(data[i]));
                            }   
                        }catch(e){}
                    }
                    // if there are no phases then load the Default Phases
                    else{
                        var phasesObj = [
                            {pName:"TNE",pDesc:"Technical Note",pCost:"0",pHours:"0"},
                            {pName:"GUI",pDesc:"Graphical Note",pCost:"0",pHours:"0"},
                            {pName:"PROGRAMMING",pDesc:"Programming",pCost:"0",pHours:"0"},
                            {pName:"TESTING",pDesc:"Testing",pCost:"0",pHours:"0"},
                            {pName:"GENERAL",pDesc:"General Work",pCost:"0",pHours:"0"}                            
                        ];
                        for(var i=0;i<phasesObj.length;i++){
                            $('#phasesDiv').append(makePhaseDiv(phasesObj[i]));
                        }                        
                    }
                
                    data = $('#empsJSON')[0];                    
                    if(data)
                    {
                        try
                        {                        
                            data = data.innerHTML;                            
                            data = eval("("+data+")");
                            selectedEmps = data;
                            //                            alert(empDetails[0].empIds.length);
                            //                            alert("Emps Edit mode:"+selectedEmps);
                            //                            alert(empDetails[0].empIds.length);
                            var found = false;
                            for(var i=0;i<empDetails.length;i++){
                                found = false;
                                
                                for(var j =0 ;j<data.length;j++)
                                {
                                    if(data[j]==empDetails[i].empIds)
                                    {
                                        found =true;
                                        $('#selectemp').append("<option value='"+empDetails[i].empIds+"'>"+empDetails[i].empInitials+"</option>");
                                        
                                    }                                   
                                }
                                if(!found)
                                {
                                    $('#employeename').append("<option value='"+empDetails[i].empIds+"'>"+empDetails[i].empInitials+"</option>");
                                }
                               
                            }
                        }catch(e){                        
                        }
                    }
                    else
                    {
                        for(var i=0;i<empDetails.length;i++){
                            $('#employeename').append("<option value='"+empDetails[i].empIds+"'>"+empDetails[i].empInitials+"</option>");
                        }
                    }
                    
                    $('#addPhase').click(function(){
                        $('#phasesDiv').append(makePhaseDiv());
                    });
                }
               
            }
            
            
            function makePhaseDiv(obj){
                obj = !obj?{}:obj;
                obj.pName = !obj.pName?"":obj.pName;
                obj.pDesc = !obj.pDesc?"":obj.pDesc;
                obj.pCost = !obj.pCost?"":obj.pCost;
                obj.pHours = !obj.pHours?"":obj.pHours;
                obj.pEmps = !obj.pEmps?[]:obj.pEmps;
                
                var emps = [];
                for(var i=0;i<obj.pEmps.length;i++)
                {
                    emps.push(getEmpInitial(obj.pEmps[i].id));
                    //emps.push((obj.pEmps[i].id));
                }
                
                //alert(emps);
                
                var div = document.createElement('div');
                $(div).css({'border':'0px groove grey'});
                
                var content = "<table class='formFields'><tr><td class='label'>Phase</td><td><input type='text' name='phase' value='"+obj.pName+"' class='required' /></td><tr>"
                    +"<td class='label'>Description</td><td><input type='text' name='description' value='"+obj.pDesc+"'/></td></tr>"
                    +"<tr><td class='label'>Phase Cost</td><td><input type='text' name='phaseCost' value='"+obj.pCost+"' class='required number'/></td></tr>"
                    +"<tr><td class='label'>Estimated Hours</td><td><input type='text' name='phaseHours' value='"+obj.pHours+"' class='required number'/></td></tr>"
                    +"<tr style='display:none'><td class='label'>Employee Id's</td><td><input type='text' name='phaseEmps' value='"+emps+"' class='required'/></td></tr>"
                    +"</table>";
                $(div).append(content).css({'position':'relative',border:'1px solid grey'});
                makeDivAsClosable(div);                
                return div;
            }
            
            
            
            /**
             * THis Method Retruns the Employee Initials based on the Given Em,ployee
             * Id
             */
            function getEmpInitial(empId)
            {
                var ei = "";
                for(var i=0;i<employeesInfo.length;i++){
                    if(employeesInfo[i].empIds == empId){
                        ei = employeesInfo[i].empInitials;
                    }
                }
                return ei;
            }
            
            /**
             * THis Method Retruns the Employee Initials based on the Given Em,ployee
             * Id
             */
            function getEmpId(empInitial)
            {
                var ei = "";
                for(var i=0;i<employeesInfo.length;i++)
                {
                    if(employeesInfo[i].empInitials.toLowerCase() == empInitial.toLowerCase()){
                        ei = employeesInfo[i].empIds;
                    }
                }
                return ei;
            }
            
            
            /**
             * This Method Makes the Given division as the Closeble Divi
             */
            function makeDivAsClosable(div)
            {
                var closeBtn = document.createElement('span');
                $(closeBtn).addClass('closeBtn').html("");
                $(div).append(closeBtn);
                
                $(closeBtn).hover(function(){
                    $(this).addClass('hover');
                },function(){
                    $(this).removeClass('hover');
                }).click(function(){
                    $(div).remove(); 
                });
                
                $(div).hover(function(){
                    $(closeBtn).show();
                },function(){
                    $(closeBtn).hide();
                });
            }
            
    
            function selectAll(){
                var List = $('select[name="selectemp"]');
                $(List).find('option').each(function(){
                    $(this).attr({'selected':'true'});
                });                
            }
            
            
            /**
             * 
             */
            function validateForm()
            {                
                $('form').validate(
                {
                    rules:{
                        selectAppId:{required:true},
                        projTitle:{required:true},
                        //projLead:{required:true},
                        startDate:{required:true,date:true},
                        endDate:{required:true,date:true,greaterThan:$('[name="startDate"]')},
                        version:{required:true,number:true},
                        status:{required:true},
                        percentDone:{required:true,number:true,min:0,max:100},
                        phaseCost:{required:true,number:true,min:0}                        
                    },
                    messages:{
                        selectAppId:"Please Select Approval Id",
                        projTitle:"Please Enter Project Title",
                        //projLead:"Please Enter Project Leader for this Project",
                        startDate:"Please choose the starting date",
                        endDate:{
                            required:"Please choose expected end date",
                            greaterThan:"Should be greater than start date"
                        },
                        version:"Please enter the project version",
                        status:"Please choose the status Of the project",
                        percentDone:"Please enter the progress in numbers (0-100)",
                        phaseCost:{required:"Please enter phase cost",number:"Numerics only allowed",min:"Please Enter value > {0}"}
                    },
                    
                    errorPlacement: function(error, element) 
                    {
                        var span = error;                    
                        var pos = $(element).position();                                    
                        $(span).css({'position':'absolute','padding':'1px',
                            'font-size':'11px',
                            'background':'red','color':'white',
                            'border':'red',
                            '-webkit-border-radius':'2px',
                            '-webkit-box-shadow':'3px 3px 3px black',
                            'display':'block',
                            'left':pos.left+$(element).outerWidth(),
                            'top':pos.top});
                        //alert(element[0]);
                        $(span).appendTo(element.parent());
                        //alert($(error).outerHeight(true));
                        //error.appendTo( element.parent() );
                    },
                    success: function(label){
                        $(label).remove();
                    }
                });
                return null;
            }
        </script>
    </head>
    <body onload="events();">
        <div class="addprojectbody">
            <fieldset class="myFieldset">
                <legend>
                    ENTER PROJECT DETAILS
                </legend>
                <html:form action="projectAction" method="post" onsubmit="selectAll();" >
                    <table class="formFields" border="0" width="100%">
                        <tr>
                            <td colspan="2">
                                Has Business Approval: <input type="checkbox" id="approvalCheck" style="width: 50px;"/> 
                            </td>
                        </tr>
                        <tr id="appTR" style="display: none;">
                            <td id="businessDiv" style="text-align: right;">
                                <!--                                <div name="businessDiv">-->
                                Approval Id
                                <!--                                </div>-->
                            </td>
                            <td id="businessDiv" style="text-align: right;">
                                <!--                                <div name="businessDiv">-->
                                <table>
                                    <tr>
                                        <td>
                                            <select id="selectAppId" style="display: block;" name="selectAppId">
                                                <!--<option value="">Select Approval Id</option>-->
                                            </select>
                                        </td>
                                    </tr>
                                </table>
                                <!--                                </div>-->
                            </td>
                        </tr>

                        <tr>
                            <td class="label">Project Title</td>
                            <td>
                                <html:text property="projTitle"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project Id</td>
                            <td>
                                <html:text property="projId" styleId="projectRandId"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Employee Id</td>
                            <td>
                                <table border="0">
                                    <tr>
                                        <td id="empllistdata">
                                            <select id="employeename" multiple="multiple" size="5" style="width:100px">
                                            </select>
                                        </td>
                                        <td>
                                            <label class="labelButton" id="addTo">>></label>
                                            <label class="labelButton" id="addFrom"><<</label>
                                        </td>
                                        <td>
                                            <select name="selectemp" id="selectemp" multiple="multiple" size="5" styleClass="selectemp" style="width:100px;"></select>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project Leader</td>
                            <td>
                                <html:text property="projLead"  />
                            </td>
                        </tr>

                        <tr>
                            <td class="label">Start Date</td>
                            <td>
                                <table>
                                    <tr>                                        
                                        <td>
                                            <html:text property="startDate" styleClass="date" />
                                        </td>

                                        <td align="right">End Date:
                                        </td>
                                        <td>
                                            <html:text property="endDate" styleClass="date" />
                                        </td>                                        
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="label">Project phases</td>
                            <td>
                                <div id="phasesDiv"></div>
                                <label class="labelButton" id="addPhase">+ Add Phase</label>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Version</td>
                            <td>
                                <html:text property="version" />
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project State</td>
                            <td>
                                <html:select  property="status"  styleClass="required">
                                    <html:option value=""></html:option>
                                    <html:option value="Open">Open</html:option>
                                    <html:option value="Closed">Closed</html:option>
                                </html:select>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project done (%)</td>
                            <td>
                                <html:text property="percentDone"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label"></td>
                            <td>
                                <html:submit value="Submit" styleClass="button" />
                            </td>
                        </tr>
                    </table>
                    <logic:present name="ProjectForm" property="employeesInvolved">
                        <label id="empsJSON" style="display: none;">
                            <bean:write  name="ProjectForm" property="employeesInvolved"/>
                        </label>
                    </logic:present>
                    <logic:present name="ProjectForm" property="phasesJSON">
                        <label id="phasesJSON" style="display: none;">
                            <bean:write  name="ProjectForm" property="phasesJSON"/>
                        </label>
                    </logic:present>

                    <logic:present name="ProjectForm" property="mode">
                        <html:hidden property="mode"/>                            
                    </logic:present>
                </html:form>
            </fieldset>
        </div>
    </body>
</html>