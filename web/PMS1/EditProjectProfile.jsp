<%-- 
    Document   : EditProjectProfile
    Created on : Jan 29, 2012, 2:56:33 PM
    Author     : Dell
--%>


<%@page import="java.util.*" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>-->
        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
        <style type="text/css">

        </style>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>

        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>

        <script type="text/javascript">
            
            $(function(){
                getDynPhases();
            });
            
            function loadEvents()
            {
                var projName = window.dialogArguments;
        
                $('input[name="next"]','.addprojectbody').click(function(){                    
                    return !$('#employeename option:selected').remove().appendTo('.selectemp');
                });
                $('input[name="prev"]','.addprojectbody').click(function(){
                    return !$('.selectemp option:selected').remove().appendTo('#employeename');
                });
                /**Ajax request to  to fill in the info like emplyee initials */
                $.get("projectHandler.do?mode=3&projName="+projName, null, function(data)
                {
                    //alert(data);
                    var projContents = eval('('+data+')');                    
                    //alert(projContents[2].empInvolved[0]);
                    //            alert(projContents[1].projPhases.length);
                    var cont="";
                    for(var i=0;i<projContents[0].id.length;i++){
                        cont+='<option>'+projContents[0].id[i]+'</option>';
                    }
            
                    for(var j=0 ;j<projContents[1].projPhases.length;j++){
                        //                alert(projContents[1].projPhases[j]);
                        $("#content").append(getPhDiv(projContents[1].projPhases[j]));
                    }
                    // document.getElementById('projectId').value = projContents[1].pSeqId;
                    document.getElementById('employeename').innerHTML = cont;
                    getDynPhases();
                }, "text");
            }
        
    
            function getPhDiv(phObj){
                if(phObj.pName!=""&&phObj.pDesc!=""&&phObj.pCost!=""){
                    phObj.pName = phObj.pName;
                    phObj.pDesc = phObj.pDesc;
                    phObj.pCost = phObj.pCost;
                }else{
                    phObj.pName = "";
                    phObj.pDesc = "";
                    phObj.pCost = "";
                }
                //alert("Testing"+obj.EN)
                //obj = obj?{}:obj;
                //obj.EN = !obj.EN?"":obj.EN; 
                //obj.D = !obj.D?"":obj.D; 
                //obj.pDesc = !obj.SD?"":obj.SD; 
                //obj.pCost = !obj.ED?"":obj.ED;
                
                var div = document.createElement('div');
                var cnt ="<table border='0' width='72%' bgcolor='#dfdfdfd'><tr><td style='width: 20px;'>Phase</td><td><input type='text' name='phase' value='"+phObj.pName+"'/><img src='images/delete.png' id='deletePhase' height='13' width='13' /></td><tr>"
                    +"<td style='width: 20px;'>Description</td><td><input type='text' name='description' value='"+phObj.pDesc+"'/></td></tr>"
                    +"<tr><td style='width: 20px;'>Phase Cost</td><td><input type='text' name='phaseCost' value='"+phObj.pCost+"'/></td></tr>"
                    +"</table>";
                $(div).append(cnt);
                return div;
            }


            /**function used load the dynamic fields like employee initials and   */
            function getDynPhases(){
                var countphase=0;
                var totalcount=0;
                var countdescription=0;
                var counter=0;
                var i = 0;
                $("#addtextfield").click(function()
                {                    
                    var newTextBoxDiv = $(document.createElement('div')).attr("id", 'phasesDiv' + counter);
                    var content="";
                    var div=document.createElement("div");
                    content += "<table border='0' width='72%' bgcolor='#dfdfdfd'><tr><td style='width: 20px;'>Phase</td><td><input type='text' name='phase' value=''/><img src='images/delete.png' id='deletePhase' height='13' width='13' /></td><tr>"
                        +"<td style='width: 20px;'>Description</td><td><input type='text' name='description' value=''/></td></tr>"
                        +"<tr><td style='width: 20px;'>Phase Cost</td><td><input type='text' name='phaseCost' value=''/></td></tr>"
                        +"</table>";
                    $(newTextBoxDiv).append(content);
                    $('#content').append(newTextBoxDiv);
                                
                    $('#deletePhase',newTextBoxDiv).click(function(){
                        $(newTextBoxDiv).remove();
                        counter--;
                    });
                    countphase++;
                    countdescription++;
                    totalcount++;
                    counter++;
                });
            }
        </script>
    </head>
    <body onload="loadEvents();">
        <div class="addprojectbody">

            <fieldset>
                <legend>
                    EDIT PROJECT DETAILS
                </legend>


                <html:form action="NewProject"  method="get"  >
                    <table class="formFields">
                        <tr>
                            <td align="right"  class="rowstyle">
                                Project Title:
                            </td>
                            <td>
                                <html:text property="projecttile" styleId="temp" style="width:400px;" />
                            </td>
                        </tr>
                        <tr>
                            <td align="right" class="rowstyle">
                                Project Id: 
                            </td>
                            <td>
                                <html:text property="projectId" styleId="projectId" disabled="false"/>
                            </td>
                        </tr>

                        <tr>
                            <td align="right">
                                Employee Id:
                            </td>
                            <td>
                                <table border="0">
                                    <tr>
                                        <td id="empllistdata">
                                            <select id="employeename" multiple="multiple" size="5">

                                            </select>
                                        </td>
                                        <td>
                                            <html:button property="next" value=">"/><br><html:button property="prev" value="<"/>&nbsp;
                                        </td>
                                        <td>
                                            <html:select property="selectemp" multiple="multiple" size="5" styleClass="selectemp"></html:select>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    Project Leader:
                                </td>
                                <td>
                                <html:text property="projectleader" styleId="temp" style="width: 453px;"/>
                            </td>
                        </tr>

                        <tr>
                            <td align="right">Start Date:</td>
                            <td>
                                <table>
                                    <tr>
                                        <td><html:text property="projectstartdate" styleId="temp"/></td>
                                        <td align="right">End Date:</td>
                                        <td><html:text property="endingestimatedate" styleId="temp"/></td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td align="right" valign="top">
                                Project phases:
                            </td>
                            <td>
                                <div id="content"></div>
                                <label class="labelButton" id="addtextfield">+ Add Phase</label>
                                <html:button property="addtextfield" value="Add Phases"></html:button>
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
                                <html:select  property="projectStatus"  styleClass="required">
                                    <html:option value=""></html:option>
                                    <html:option value="Open">Open</html:option>
                                    <html:option value="Closed">Closed</html:option>
                                </html:select>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project done (%)</td>
                            <td>
                                <html:text property="percentageDone"/>
                            </td>
                        </tr>
                        <tr>
                            <td align="right"></td>
                            <td>
                                <html:submit value="Update" property="acentAction"  />
                            </td>
                        </tr>
                    </table>
                </html:form>
            </fieldset>
        </div>
    </body>
</html>