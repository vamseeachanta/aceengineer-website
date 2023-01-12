<%@taglib uri="http://struts.apache.org/tags-html" prefix="html"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>

<html>
    <head>
        <title></title>
        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>

        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript">
            var experienceDiv;
            var qualificationDiv;
            
            $(function(){
                experienceDiv = $('#experienceDiv');
                qualificationDiv = $('#qualificationDiv');                
                initialize();
            });
            
            /**
             * This method initializes the Form
             **/
            function initialize(){
                $('#experienceBtn').click(function(){
                    $(experienceDiv).append(makeExperienceDiv());
                    return false;
                });
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
                
                //div.setAttribute('id',"divId");
                var cnt ="<table class='formFields'><tr>"
                    +"<td class='label'>Employer</td><td colspan='3'><input type='text' name='CompanyName' style='width:360px;' value='"+obj.EN+"' />&nbsp;<img src='images/delete.png' class='closeBtn' height='13' width='13'/></td></tr>"
                    +"<tr><td class='label'>Designation</td><td colspan='3'><input type='text' name='EmployerDesignation' value='"+obj.D+"' style='width:360px;' /></td></tr>"
                    +"<tr><td class='label'>Startdate: </td><td><input type='text' name='EmployerStartDate' value='"+obj.SD+"' style='width:142px'/>"
                    +"&nbsp;Enddate: <input type='text' name='EmployerEndDate' value='"+obj.ED+"' style='width:142px;' /></td></tr></table>";
                $(div).append(cnt);             
                
                var closeBtn = $('.closeBtn',div);
                
                $(closeBtn).click(function(){
                    $(div).remove(); 
                }).hide().hover(function(){
                    $(this).css({'border':'1px solid gray'});
                },function(){
                    $(this).css({'border':'0px solid gray'});
                });
                
                $(div).hover(function(){
                    $(closeBtn).show(); 
                },function(){
                    $(closeBtn).hide();
                });
                
                return div;
            }
        </script>

        <style type="text/css">
            .labelButton{
                font-size: 12px;
                color: white;
                background: #599efd;
                padding: 5px;
                -webkit-border-radius: 5px;
            }
        </style>


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
        <fieldset>
            <legend>
                REGISTER FOR NEW EMPLOYEE
            </legend>
            <html:form action="Registration">    
                <table class="formFields" border="0">
                    <tr>
                        <td class="label">
                            Employee First Name
                        </td>
                        <td>
                            <html:text property="firstName" styleId="empname" styleClass="temp"/>
                        </td> 
                    </tr>
                    <tr>
                        <td class="label">
                            Employee Last Name
                        </td>
                        <td>
                            <html:text property="lastName" styleId="emplastname" styleClass="temp"/>
                        </td> 
                    </tr>
                    <tr>
                        <td class="label">Employee Id</td>
                        <td>
                            <html:text property="empId" disabled="true"/>
                        </td>
                    </tr>

                    <tr>
                        <td class="label">
                            Employee Role
                        </td>
                        <td>
                            <html:select property="role"  styleId="emptype" style="width: 172px;" styleClass="temp">
                                <html:option value="select">Select Role</html:option>
                                <html:option value="Consultant">Consultant</html:option>
                                <html:option value="Employee">Employee</html:option>
                                <html:option value="Internship">Internship</html:option>
                            </html:select>
                        </td>
                    </tr>

                    <tr>
                        <td class="label">
                            Designation
                        </td>
                        <td>
                            <html:select property="designation"  styleId="empDesignation" style="width: 172px;" styleClass="temp">
                                <html:option value="SelectempDesignation">Select Designation</html:option>
                                <html:option value="SoftWareDeveloper">SoftWare Developer</html:option>
                                <html:option value="InterfaceEngineer">Interface Engineer</html:option>
                                <html:option value="WebDesigner">Web Designer</html:option>
                                <html:option value="TestingAnalyst">Testing Analyst</html:option>
                                <html:option value="ProjectManager">Project Manager</html:option>
                                <html:option value="Administrator">Administrator</html:option>
                                <html:option value="Others">Others</html:option>
                            </html:select>
                            <div id="OtherEmployees"></div>
                            <div id="UpdateOtherEmployees"></div>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="2">
                            <fieldset>
                                <legend>Experience</legend>
                                <div id="experienceDiv"></div>
                            </fieldset>
                            <label id="experienceBtn" class="labelButton">+ Add Experience</label>
                        </td>
                    </tr>

                    <tr>
                        <td class="label">
                            Date of Joining 
                        </td>
                        <td>
                            <html:text property="doj" style="width: 185px;" styleId="empjoining"/>
                            Date Of Birth:&nbsp;<html:text property="dob" style="width: 220px;"/>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="2">
                            <fieldset style="width: 585px;">
                                <legend>
                                    Qualification
                                </legend>
                                <table border="0" class="inptext1" width='100%'>
                                    <tr>
                                        <td style="width:230px;">Please select your Basic Education:</td>
                                        <td>
                                            <html:select property="basicQualification" styleId="basicQualification" style="width: 172px;" styleClass="temp">
                                                <html:option value="Select">Select</html:option>
                                                <html:option value="B.A">B.A</html:option>
                                                <html:option value="B.Com">B.Com</html:option>
                                                <html:option value="B.Sc">B.Sc</html:option>
                                                <html:option value="B.Tech/B.E">B.Tech/B.E</html:option>
                                                <html:option value="Others">Others</html:option>
                                            </html:select>
                                        </td>
                                        <td>
                                            <div id="OtherBasicQualification"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="width:230px;">Please select your Masters Education:</td>
                                        <td>
                                            <html:select property="masterQualification" styleId="masterQualification" style="width: 172px;" styleClass="temp">
                                                <html:option value="Select">Select</html:option>
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
                                        </td>
                                        <td>
                                            <div id="OtherMasterQualification">

                                            </div>
                                        </td>
                                    </tr>
                                    <tr>

                                        <td colspan="3" align="left">
                                            <div id="updateOtherQualification"></div>
                                            <div id="addCertificationData"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="3">
                                            <label class="labelButton">+ Add Certification</label>
                                        </td>
                                    </tr>
                                </table>
                            </fieldset>                         
                        </td>

                    </tr>


                    <tr>
                        <td class="label">
                            Employee-Salary
                        </td>
                        <td>    
                            <html:text property="salary"/>                            
                        </td>
                    </tr>

                    <tr>
                        <td align="right">
                            Email-id:
                        </td>
                        <td>
                            <html:text property="email"/>
                            <!--                   <input type="text" name="email" id="email" style="width: 170px;">-->
                            Contact Number: <html:text property="phNo" style="width: 165px;"/>
                            <!--                   <input type="text" name="phnnumber" id="phnnumber" style="width: 160px;">-->
                        </td>

                    </tr>

                    <tr>
                        <td align="right">
                            Skype-id: 
                        </td>
                        <td>
                            <html:text property="skypeId" style="width: 150px;"/>
                            <!--                    <input type="text" name="skypeid" id="skypeid" style="width: 150px;">-->
                            Team viwer-id: <html:text property="teamviewerId" style="width: 200px;"/>
                            <!--                    <input type="text" name="teamviwerid" id="teamviwerid" style="width: 195px;">-->
                        </td>
                    </tr>



                    <tr>
                        <td align="right">
                            Username:
                        </td>
                        <td>
                            <html:text property="userName"  style="width: 450px;"/>
                            <!--                    <input type="text" name="username" id="username"  style="width: 450px;">-->
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            Password:
                        </td>
                        <td>
                            <html:password property="userPassword"  style="width: 450px;"/>
                            <!--                    <input type="password" name="password" id="password"  style="width: 450px;">-->
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            Confirm Password:
                        </td>
                        <td>
                            <input type='password' name="confirmPassword" style="width: 450px;"/>
                            <!--                    <input type="password" name="conpassword" id="conpassword"  style="width: 450px;">-->
                        </td>
                    </tr>
                    <tr>
                        <td align="right" valign="top">
                            Address:
                        </td>
                        <td>
                            <html:textarea property="address" style="width:458px; height: 60px;"/>
                            <!--                    <textarea name="address" id="address"  style="width:452px; height: 60px;"></textarea>-->
                        </td>
                    </tr>

                    <tr>
                        <td></td>
                        <td align="left">
                            <table width="125px" border="0" align="left" cellspacing="0" cellpadding="2">
                                <tr>
                                    <td><html:checkbox property="admin" value="1"/></td>
                                    <td>Admin</td>
                                </tr>
                            </table>
                        </td>								
                    </tr>

                    <tr>
                        <td></td>
                        <td>
                            <html:submit value="Register" property="register"/>
                        </td>
                    </tr>
                </table>
            </html:form>
        </fieldset>
    </body>
</html>