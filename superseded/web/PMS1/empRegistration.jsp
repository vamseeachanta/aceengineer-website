<%-- 
    Document   : empRegistration
    Created on : Jan 31, 2012, 9:59:40 PM
    Author     : Vamsee Achanta
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></meta>

        <!--        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
                <script type="text/javascript" src="res/js/jquery-ui.min.js"></script>
                <script type="text/javascript" src="res/js/CustomValidation.js"></script>-->


        <title>Employee Registration</title>


        <style type="text/css">
            .navigator{
                padding: 5px;
                background: #599efd;
            }
            .navigator span{
                padding: 10px 20px;
                display: inline-block;
                cursor: pointer;
            }

            .navigator span:hover{
                background: #013c8d;
                color: white;

                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;
            }

            .sliderPanel{
                position: relative;
            }
            .sliderPanel .selected{
                background: #156dcb;
                color: white;
                font-weight: bold;

                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;
            }
            .sliderPanel .panel{
                display: none;                
            }

            .hiddenField{
                display: none;
            }
            .hideClass{
                cursor: pointer;
                text-decoration: underline;
            }
            .hideBtn{
                cursor: pointer;
                text-decoration: underline;
                display: none;
            }


        </style>

        <!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
                <script type="text/javascript" src="res/js/jquery.validate.js"></script>
                <script type="text/javascript" src="res/js/date.js"></script>
                <script type="text/javascript" src="res/js/Calendar.js"></script>
                            <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>
                <link rel="stylesheet" type="text/css" href="res/css/calendar.css"/>-->

        <script type="text/javascript">            
            var experienceDiv;
            var certificationDiv;
            var formValid;            
            
            /* this Variable tells whether the Recently added Experience Div is Valid or Not
             * by Default it is true
             */
            var experienceValid = true;
            
            
            $(function()
            {
                experienceDiv = $('#experienceDiv');
                certificationDiv = $('#certificationDiv');
                try{
                    initialize();
                    loadDynamicFields();                
                    registerSliderPanel();
                    //alert("Slide Panels Are Registered");
                }catch(e){alert(e);}
                
                try{
                    $(".date").datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                }catch(e){
                    alert(e);
                }
                //calender = new Calendar($('.date'),"","");                
            });
            
            /**
             * This Method Checks Whether the Last added
             * Experience valid or Not
             */
            function lastAddedExperienceValid(){
                var count = 0;
                experienceValid = true;
                var expTab = $(experienceDiv).find('.formFields:last')[0];
                
                // if there are no Experience Tabs then Return true
                if(!expTab)
                    return true;
                
                var inputs = $(expTab).find(':input');
                for(var i=0;i<inputs.length;i++){
                    if($(inputs[i]).val()<1)
                        return false;
                }
                    
                return true;
            }
            
            /**
             * This method initializes the Form
             **/
            function initialize(){
                
                $('#experienceBtn').click(function()
                {
                    if(!lastAddedExperienceValid()){
                        alert("Please Make sure Your Previous Experience is Valid")
                        return;
                    }
                    $(experienceDiv).append(makeExperienceDiv());
                    return false;
                });
                
                $('#certificationBtn').click(function(){
                    $(certificationDiv).append(makeCertificationDiv());
                });
                
                $('select[name="basicQualification"]').change(function(){
                    var val = $(this).val();                    
                    $('input[name="otherbasicQualification"]').hide();
                    if(val == "Others"){
                        $('input[name="otherbasicQualification"]').show();
                        val = $('input[name="otherbasicQualification"]').val(); 
                        
                    }
                });
                $('select[name="masterQualification"]').change(function(){
                    var val = $(this).val();                    
                    $('input[name="othermasterQualification"]').hide();
                    if(val == "Others"){
                        //alert(val)
                        $('input[name="othermasterQualification"]').show();
                        val = $('input[name="othermasterQualification"]').val();
                        //alert(val)
                    }
                });
                $('select[name="designation"]').change(function(){
                    var val = $(this).val();                    
                    $('input[name="otherempDesc"]').hide();
                    if(val == "Others"){
                        //alert(val)
                        $('input[name="otherempDesc"]').show();
                        val = $('input[name="otherempDesc"]').val();
                        //alert(val)
                    }
                });
                
                $("#updatePassword").click(function(){
                    $("#updatecpassword").show();
                    //                    $("#updatePassword").hide();
                    //                    $("#hideBtn").show();
                });
                //                $("#hideBtn").click(function(){
                //                    //alert("testin")
                //                    $("#updatecpassword").hide();
                //                    $("#updatePassword").show();
                //                    $("#hideBtn").hide();
                //                });

                $('select[name="role"]').change(function()
                {
                    var idField = $('input[name="empId"]');
                    $(idField).val("ID Generating.....");
                    var ind = this.selectedIndex;
                    var role = "";
                    switch(ind)
                    {
                        case 1:
                            role = "CON";
                            break;
                        case 2:
                            role = "EMP";
                            break;
                        case 3:
                            role = "INT";
                            break;                                         
                    }
                    
                    $.get("employeeHandler.do?mode=1&role="+role,null,function(data){
                        data = eval("("+data+")");
                        $(idField).val(data.ID);
                    });                  
                });
                
                
                //alert($('[name="EXPstartDate"]')[0]);
                
                formValid = $('form').validate(
                {
                    rules: {
                        firstName: {
                            required: true,
                            FN: true,
                            minlength: 2,
                            maxlength: 25
                        },
                        lastName: {
                            required: true,
                            LN: true,
                            minlength: 2,
                            maxlength: 25
                        },
                        dob:{
                            date:true                            
                        },
                        doj:{
                            required:true,
                            date:true
                        },
                        phNo: {
                            number: true,
                            phNo: true
                            //minlength: 10,
                            //maxlength: 10
                        },
                        email: {
                            required: true,
                            email: true,
                            minlength: 2
                        },
                        teamviewerId: {
                            number: true,
                            minlength: 8,
                            maxlength: 10
                        },
                        CERcourse: {
                            required: true,
                            CC: true,
                            minlength: 2
                        },
                        EXPemployeerName: {
                            required: true,
                            EE: true,
                            minlength: 2
                        },
                        EXPdesignation: {
                            required: true,
                            ED: true,
                            minlength: 2
                        },
                        EXPstartDate:{
                            required: true                            
                        },
                        EXPendDate:{
                            required: true                            
                        },
                        userName: {
                            required: true,
                            minlength: 8
                        },
                        userPassword: {
                            required: true,
                            minlength: 8
                        },
                        cpassword: {
                            required: true,
                            equalTo : "[name='userPassword']",
                            minlength: 8
                        },
                        initials: {
                            required: true,
                            minlength: 2,
                            maxlength: 5
                        },
                        salary: {
                            number: true,
                            minlength: 2,
                            maxlength: 8
                        },
                        role:{
                            required:true
                        },
                        authority:{
                            required:true
                        }
                    },
                    messages: {
                        firstName: {
                            required: "Please Enter Your First Name",
                            FN: "only charectors required!",
                            minlength: jQuery.format("At least {0} characters required!")

                        },
                        lastName: {
                            required: "Please Enter Your Last Name",
                            LN: "only charectors required!",
                            minlength: jQuery.format("At least {0} characters required!")

                        },
                        phNo: {
                            phNo: "please enter number",
                            minlength: jQuery.format("At least {0} numbers required!"),
                            maxlength: jQuery.format("At most {0} numbers required!")

                        },
                        email: {
                            required: "Enter Your Email ID",
                            email: "please enter correct email-id"
                            //minlength: jQuery.format("At least {0} characters required!")

                        },
                        teamviewerId: {
                            required: "required.",
                            number: "please enter number",
                            minlength: jQuery.format("At least {0} numbers required!"),
                            maxlength: jQuery.format("At most {0} numbers required!")
                        },
                        CERcourse: {
                            required: "required.",
                            CC: "enter only charectors.",
                            minlength: jQuery.format("At least {0} charectors required!")
                        },
                        EXPemployeerName: {
                            required: "required.",
                            EE: "enter only charectors.",
                            minlength: jQuery.format("At least {0} numbers required!")
                        },
                        EXPdesignation: {
                            required: "required.",
                            ED: "enter only charectors.",
                            minlength: jQuery.format("At least {0} numbers required!")
                        },                        
                        EXPendDate:{
                            required: "Enter End Date",
                            greaterThan:"Should be Greater Than Starting Date"
                        },
                        userName: {
                            required: "Enter Your user Id",
                            minlength: jQuery.format("At least {0} required!")
                        },
                        userPassword: {
                            required: "Please specify password for your Profile",
                            minlength: jQuery.format("At least {0} required!")
                        },
                        cpassword: {
                            required: "Confirm Password",
                            minlength: jQuery.format("At least {0} required!"),
                            equalTo:"Confirm password dosen't match"
                        },
                        initials: {
                            required: "Enter Employee Initials",
                            minlength: jQuery.format("At least {0} required!"),
                            maxlength: jQuery.format("At most {0} required!")
                        },
                        salary: {
                            required: "",
                            minlength: jQuery.format("At least {0} numbers required!"),
                            maxlength: jQuery.format("At most {0} numbers required!")
                        },
                        doj:{
                            required:"Please enter Date of Joining of Employee"
                        },
                        role:{
                            required:"Please Choose the Employee Role."
                        },
                        authority:{
                            required:"Please Choose the Employee Authority."
                        }

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
            }
            
            /**
             * THis Method Laods the Dynamic fields in the Form
             */
            function loadDynamicFields()
            {
                var data = $('#expJSONData')[0];
                if(data)
                {
                    try
                    {
                        data = data.innerHTML;                    
                        data = data==null?"[]":data;
                        var expGroup = eval("("+data+")");
                        for(var i=0;i<expGroup.length;i++){
                            $(experienceDiv).append(makeExperienceDiv(expGroup[i]));
                        }
                    }catch(e){}
                }                
                
                var data = $('#cerJSONData')[0];                
                if(data)
                {
                    try
                    {
                        data = data.innerHTML;
                        data = data==null?"[]":data;
                        var cerGroup = eval("("+data+")");
                        for(var i=0;i<cerGroup.length;i++){
                            $(certificationDiv).append(makeCertificationDiv(cerGroup[i]));
                        }
                    }catch(e){}
                }
            }
            
            
            /**
             * This Method make the Experiance Divison and reister al the Events
             */
            function makeExperienceDiv(obj)
            {             
                obj = !obj?{}:obj;
                obj.EN = !obj.EN?"":obj.EN; 
                obj.D = !obj.D?"":obj.D; 
                obj.SD = !obj.SD?"":obj.SD; 
                obj.ED = !obj.ED?"":obj.ED;
                
                //alert("Testing"+obj.EN)
                
                var div = document.createElement('div');
                $(div).css({'float':'left'});
                
                //div.setAttribute('id',"divId");
                var cnt ="<table class='formFields'>"
                    +"<tr><td class='label'>Employer</td><td><input type='text' name='EXPemployeerName' class='required' value='"+obj.EN+"' /></td></tr>"
                    +"<tr><td class='label'>Designation</td><td colspan='3'><input type='text' name='EXPdesignation' value='"+obj.D+"' class='required'/></td></tr>"
                    +"<tr><td class='label'>Startdate: </td><td><input type='text' name='EXPstartDate' class='date'  value='"+obj.SD+"' class='required'/></td></tr>"
                    +"<tr><td class='label'>Enddate: </td><td><input type='text' name='EXPendDate' class='date' value='"+obj.ED+"' class='required'/></td></tr></table>";                
                $(div).css({'position':'relative'}).append(cnt).append("<hr/>");
                
                try{
                    makeDivAsClosable(div);                
                    // Registering the Calendar Events
                    //new Calendar($('.date',div),1,1,{});
                    $(".date",div).datepicker({changeYear:true,showButtonPanel:true,yearRange:'1800:2200',dateFormat:StandardNotations.jQueryDateFormat});
                }catch(e){alert(e);}
                return div;
            }
            
            /**
             * This Method Makesd the Certification Div
             * with the Specified Object
             */
            function makeCertificationDiv(obj){
                obj = !obj?{}:obj
                obj.course =!obj.course?"":obj.course;
                
                var div = document.createElement('div');
                var cnt = "<table class='formFields'>"
                    +"<tr>"
                    +"<td class='label'>Certification</td>"
                    +"<td><input type='text' name='CERcourse' value='"+obj.course+"' class='required'/></td>"
                    +"</tr>"
                    +"</table>";
                $(div).append(cnt).css({'position':'relative'});
                
                makeDivAsClosable(div);                
                
                return div;
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
            
            
            $.validator.addMethod('FN', function (value) { 
                return /^[a-zA-Z]+$/.test(value); 
            });
            $.validator.addMethod('LN', function (value) { 
                return /^[a-zA-Z]+$/.test(value); 
            });
            $.validator.addMethod('CC', function (value) { 
                return /^[a-zA-Z]+$/.test(value); 
            });
            $.validator.addMethod('EE', function (value) { 
                return /^[a-zA-Z]+$/.test(value); 
            });
            $.validator.addMethod('ED', function (value) { 
                return /^[a-zA-Z]+$/.test(value); 
            });
            $.validator.addMethod('phNo', function (value) {
                return /^[0-9]+$/.test(value); 
            });
            
            /**
             * This Method Register the Slider Panel
             */
            function registerSliderPanel()
            {
                $('.sliderPanel').each(function()                
                {
                    var controls = $(this).find('.navigator span');                    
                    var buttons = $(this).find('.navigControls label');
                    var panels = $(this).find('.panel');                    
                    
                    var prevPanel;
                    var currPanel;
                    var prevNavig;
                    var currNavig;
                    // This Variable holds the Current Active Panel Index
                    var currInd = 0;
                    var noOfPanels = panels.length;
                    
                    currPanel = $(panels).eq(0);
                    currNavig = $(controls).eq(0);
                    
                    $(currPanel).show();
                    //alert("Showing : "+currPanel);
                    $(currNavig).addClass("selected");
                    
                    $(buttons).each(function(ind){
                        $(this).click(function(){                            
                            switch(ind){
                                case 0:
                                    if(!$('form').valid())
                                    {                                
                                        return;
                                    }
                                    currInd = --currInd<0?noOfPanels-1:currInd;
                                    $(controls).eq(currInd).trigger('click', null);
                                    break;
                                case 1:
                                    if(!$('form').valid())
                                    {                                
                                        return;
                                    }
                                    currInd = ++currInd>noOfPanels?0:currInd;
                                    $(controls).eq(currInd).trigger('click', null);                                    
                                    break;
                            } 
                        });
                    });
                    
                    $(controls).each(function(ind){
                        
                        $(this).click(function(evt)
                        {
                            //alert(evt);
                            if(!$('form').valid())
                            {                                
                                currInd = ind;
                                return;
                            }
                                
                            
                            prevNavig = currNavig;
                            currNavig = this;
                            
                            prevPanel = currPanel;
                            currPanel = $(panels).eq(ind);
                            
                            if($(prevPanel).html() == $(currPanel).html()){
                                return;
                            }
                            
                            
                            $(prevNavig).removeClass('selected');
                            $(currNavig).addClass('selected');
                            currInd = ind;                            
                            
                            $(currPanel).show().
                                css({'position':'absolute'}).
                                animate({'margin-left':'-400px','opacity':'0'}, 0,null).
                                animate({'margin-left':'0px','opacity':'1'}, 400,function(){
                                $(currPanel).css({'position':'relative'});
                            });
                            
                            $(prevPanel).
                                css({'position':'absolute'}).
                                animate({'margin-left':$(prevPanel).outerWidth(),'opacity':'0'}, 400,function(){
                                $(prevPanel).hide();
                            });
                        });
                    });
                });
                
                
                
                /**
                 * This Method Slide to the specified Panel
                 */
                //alert("Basic Data: "+$('input[name="otherbasicQua"]').val());
                var OBQ = $('input[name="otherbasicQualification"]');
                var BQ = $('select[name="basicQualification"]');
                
                var val = $(OBQ).val().toLowerCase();
                var foundBQ = false;                
                var OTHERS = false;                
                $(BQ).find('option').each(function(ind){                    
                    if(val == $(this).val().toLowerCase()){
                        foundBQ = true;
                    }
                });
                if(!foundBQ){
                    $("#basicQualification option[value='Others']").attr('selected', 'selected');
                    $(OBQ).show();
                }
                
                var foundMQ = false;
                var MQ = $('select[name="masterQualification"]');
                var OMQ = $('input[name="othermasterQualification"]');
                var val = $(OMQ).val().toLowerCase();                
                $(MQ).find('option').each(function(ind){
                    if(val == $(this).val().toLowerCase()){
                        foundMQ = true;
                    }
                });
                if(!foundMQ){
                    $("#masterQualification option[value='Others']").attr('selected', 'selected');
                    $(OMQ).show();
                }
                
                var foundDESG = false;
                var DESG = $('select[name="designation"]');
                var ODESG = $('input[name="otherempDesc"]');
                var val = $(ODESG).val().toLowerCase();
                //alert(val)
                $(DESG).find('option').each(function(ind){
                    if(val == $(this).val().toLowerCase()){
                        foundDESG = true;
                    }
                });
                if(!foundDESG){
                    $("#designation option[value='Others']").attr('selected', 'selected');
                    $(ODESG).show();
                }
            }
        </script>
    </head>
    <body>
        <html:form action="Registration">

            <html:hidden property="mode"></html:hidden>

            <div class="sliderPanel">
                <div class="navigator border10">
                    <span>Personal Info</span>
                    <span>Contact Info</span>
                    <span>Professional Info</span>
                    <span>Employment Info</span>                    
                </div>



                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td class="label">
                                First Name
                            </td>
                            <td>
                                <html:text property="firstName" styleClass="fn"/>
                            </td> 
                        </tr>
                        <tr>
                            <td class="label">Last Name</td>
                            <td>
                                <html:text property="lastName" styleClass="ln"/>
                            </td> 
                        </tr>
                        <tr>
                            <td class="label">Date of Birth</td>
                            <td>
                                <html:text property="dob" styleClass="date" />                                
                            </td> 
                        </tr>
                    </table>
                </div>

                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td class="label">Mobile Number</td>
                            <td><html:text property="phNo" styleClass="number"/></td>
                        </tr>
                        <tr>
                            <td class="label">Address</td>
                            <td><html:textarea property="address" rows="5" styleClass=""/></td>
                        </tr>
                        <tr>
                            <td class="label">E-Mail Id</td>
                            <td><html:text property="email" styleClass="email"/></td>
                        </tr>
                        <tr>
                            <td class="label">Skype Id</td>
                            <td><html:text property="skypeId" styleClass=""/></td>
                        </tr>
                        <tr>
                            <td class="label">Team Viewer Id</td>
                            <td><html:text property="teamviewerId" styleClass="number"/></td>
                        </tr>
                    </table>
                </div>


                <div class="panel">
                    <table class="formFields">

                        <tr>
                            <td style="width:230px;">Basic Education:</td>
                            <td>
                                <html:select property="basicQualification" styleId="basicQualification" style="width: 172px;">
                                    <html:option value="">Choose Degree.....</html:option>
                                    <html:option value="B.A">B.A</html:option>
                                    <html:option value="B.Com">B.Com</html:option>
                                    <html:option value="B.Sc">B.Sc</html:option>
                                    <html:option value="B.Tech/B.E">B.Tech/B.E</html:option>
                                    <html:option value="Others">Others</html:option>
                                </html:select>
                                <html:text property="otherbasicQualification" styleClass="hiddenField"/>                              
                            </td>
                        </tr>

                        <tr>
                            <td style="width:230px;">Masters Education:</td>
                            <td>
                                <html:select property="masterQualification" styleId="masterQualification" style="width: 172px;">
                                    <html:option value="">Choose Master Degree.....</html:option>
                                    <html:option value="IntegratedPG">Integrated PG</html:option>
                                    <html:option value="M.A">M.A</html:option>
                                    <html:option value="M.Com">M.Com</html:option>
                                    <html:option value="M.Sc">M.Sc</html:option>
                                    <html:option value="M.Tech">M.Tech</html:option>
                                    <html:option value="MBA/PGDM">MBA/PGDM</html:option>
                                    <html:option value="MCA">MCA</html:option>
                                    <html:option value="MS">MS</html:option>
                                    <html:option value="PGDiploma">PG Diploma</html:option>
                                    <html:option value="Others">Others</html:option>
                                </html:select>
                                <html:text property="othermasterQualification" styleClass="hiddenField"/>
                            </td>
                        </tr>

                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend>Certifications</legend>
                                    <div id="certificationDiv"></div>
                                    <label id="certificationBtn" class="labelButton">+ Add Certifications</label>
                                </fieldset>
                            </td>
                        </tr>

                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend>Work Experience</legend>
                                    <div id="experienceDiv"></div>
                                    <label id="experienceBtn" class="labelButton">+ Add Experience</label>                                
                                </fieldset>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td class="label">
                                Role
                            </td>
                            <logic:equal name="RegistrationFormBean" property="mode" value="0">
                                <td>
                                    <html:select property="role" styleClass="">
                                        <html:option value="">Choose Role.....</html:option>
                                        <html:option value="Consultant">Consultant</html:option>
                                        <html:option value="Employee">Employee</html:option>
                                        <html:option value="Internship">Internship</html:option>
                                    </html:select>
                                </td>
                            </logic:equal>

                            <logic:notEqual name="RegistrationFormBean" property="mode" value="0">
                                <td>
                                    <b><bean:write name="RegistrationFormBean" property="role"/></b>
                                    <html:hidden property="role"></html:hidden>
                                </td>   
                            </logic:notEqual>
                        </tr>
                        <tr>
                            <td class="label">Employee Id</td>
                            <td>
                                <html:text property="empId" readonly="true" styleId="empId"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">UserName</td>
                            <td>
                                <html:text property="userName" styleClass=""/>
                                @aceengineer.com
                            </td>
                        </tr>
                        <tr>

                            <logic:equal name="RegistrationFormBean" property="mode" value="0">
                                <td colspan="2">
                                    <table>
                                        <tr>
                                            <td class="label">Password</td>
                                            <td>
                                                <html:password property="userPassword" styleClass="equalTo"/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="label">Confirm Password</td>
                                            <td>
                                                <html:password property="cpassword" styleClass="equalTo"/>
                                            </td>
                                        </tr>
                                    </table>
                                </td> 
                            </logic:equal>


                            <logic:notEqual name="RegistrationFormBean" property="mode" value="0">

                                <td  style="display: none;" id="updatecpassword" colspan="2">
                                    <table border="0">
                                        <tr>
                                            <td class="label">Password</td>
                                            <td>
                                                <html:password property="userPassword" styleClass="equalTo"/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="label">Confirm Password</td>
                                            <td>
                                                <html:password property="cpassword" styleClass="equalTo"/>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td id="updatePassword" colspan="2" align="right" class="hideClass">Change Password</td>
                                <td id="hideBtn" colspan="2" align="right" class="hideBtn">Close</td>
                            </logic:notEqual>

                        </tr>

                        <tr>
                            <td class="label">
                                Employee Initial
                            </td>
                            <td>    
                                <html:text property="initials" styleClass="required"/>
                            </td>
                        </tr>

                        <tr>
                            <td class="label">
                                Designation
                            </td>
                            <td>
                                <html:select property="designation" styleClass="required" styleId="designation">
                                    <html:option value="">Choose Designation.....</html:option>
                                    <html:option value="SoftwareDeveloper">Software Developer</html:option>
                                    <html:option value="InterfaceEngineer">Interface Engineer</html:option>
                                    <html:option value="WebDesigner">Web Designer</html:option>
                                    <html:option value="TestingAnalyst">Testing Analyst</html:option>
                                    <html:option value="ProjectManager">Project Manager</html:option>
                                    <html:option value="Administrator">Administrator</html:option>
                                    <html:option value="Others">Others</html:option>
                                </html:select>
                                <html:text property="otherempDesc" styleClass="hiddenField"/>
                            </td>
                        </tr>

                        <tr>
                            <td class="label">Date of Joining</td>
                            <td><html:text property="doj" styleClass="date"/></td>
                        </tr>

                        <tr>
                            <td class="label">Employee-Salary</td>
                            <td><html:text property="salary" styleClass="number"/> <label style="color:green">(INR)</label></td>
                        </tr>

                        <tr>
                            <td class="label">Authority</td>
                            <td>
                                <html:select property="authority" styleClass="">
                                    <html:option value="">Choose Authority.....</html:option>
                                    <html:option value="0">Employee</html:option>
                                    <html:option value="1">Administrator</html:option>
                                    <html:option value="2">Super Administrator</html:option>
                                </html:select>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="label">
                                <html:submit value="Register" styleClass="button" />
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="navigControls">
                    <br/>
                    <table width="100%" border="0">
                        <tr>
                            <td><label class="labelButton" style="font-weight:bolder;font-size: large" title="Navigates to Previous Section">&lt;&lt;</label></td>
                            <td><label class="labelButton" style="font-weight:bolder;font-size: large" title="Navigates to Next Section">&gt;&gt;</label></td>
                        </tr>
                    </table>

                </div>

            </div>


            <!-- This Data For Dynamic Data -->
            <logic:present name="RegistrationFormBean" property="experience">
                <label id="expJSONData" class="hiddenField">
                    <bean:write name="RegistrationFormBean" property="experience"/>
                </label>
            </logic:present>
            <logic:present name="RegistrationFormBean" property="qualification">
                <label id="cerJSONData" class="hiddenField">
                    <bean:write name="RegistrationFormBean" property="qualification"/>
                </label>
            </logic:present>

        </html:form>        
    </body>
</html>