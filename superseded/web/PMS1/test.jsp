<%-- 
    Document   : test
    Created on : Mar 29, 2012, 10:52:56 AM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="/WEB-INF/struts-logic.tld" prefix="logic" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>

        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>
        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>-->
        <script type="text/javascript" src="res/js/PMS.js"></script>


        <script type="text/javascript">
            var projData;
            var empId = 'ACE_EMP_0009';
            
            
            $(function()
            {
                empId = $('#empId').html();
                empId = empId.length<1?'ACE_CON_0001':empId;
                //$('#contentFrame').attr({'src':'Login.jsp'});
                $.get("projectHandler.do",{mode:1,empId:empId},function(data){
                    //$('#myDiv').append(data);
                    $('#contentFrame').html(data);
                    projData = eval("("+data+")");
                    projData = projData.projs;
                    makeProjectList(projData);
                });
            });
            
            function makeProjectList(projList){
                var list = $('#tsPList');
                for(var i=0;i<projList.length;i++)
                {
                    var proj = projList[i];
                    $(list).append("<li key='"+proj.pid+"'>"+proj.pidName+"</li>");
                }
                
                registerMyListHoverEffect(list);
                
                var prevLi,currLi;
                $(list).find('li').click(function()
                {
                    prevLi = currLi;
                    currLi = this;
                    // First Removing the Selection from the LIst
                    $(prevLi).removeClass('selected');
                    $(this).addClass('selected');
                    var projId = $(this).attr('key');
                    $('#contentDiv').html('<h4>Loading Please Wait......</h4>');                    
                    $.get("manageTimeAction.do",{mode:0,projId:projId,empId:empId},function(data){
                        $('#contentDiv').html('').append(data);
                    });
                });
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
                        $(this).stop().animate({'padding-left':'30px'}, 300, "linear", null);
                        $(this).addClass('hover');
                    },function(){
                        $(this).stop().animate({'padding-left':'10px'}, 100, "linear", null);
                        $(this).removeClass('hover');
                    });                    
                });
            }
        </script>
    </head>
    <body>

        <%
            String empId = request.getParameter("empId");
            empId = empId == null ? "" : empId;
            out.print("<label id='empId' style='display:none'>" + empId + "</label>");
        %>

        <table border="0" width="800px">
            <tr>
                <td style="vertical-align: top" width="200px">
                    <div class="foldableDiv" style="width:200px;float: left">
                        <h4 class="foldHeader top_border">Projects</h4>
                        <div class="foldableContent bottom_border">
                            <ul id="tsPList" class="myList" style="height:320px">
                            </ul>
                        </div>
                    </div>
                </td>

                <td style="vertical-align: top">                    
                    <div id="contentDiv">
                        <logic:present name="ManageTimeForm">
                            <h4 class="mainHeading">
                                Successfully Updated.......<br/>
                                Your Changes were Done
                            </h4>
                        </logic:present>
                    </div>
                </td>
            </tr>            
        </table>
    </body>
</html>
