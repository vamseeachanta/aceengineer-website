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
        <title>JSP Page</title>
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>

        <style type="text/css">
            .profileTab
            {
                font-size: 15px;                
                border: 2px solid grey;                
                width: 100%;
                color: white;
                -webkit-border-radius: 10px;
            }
            .profileTab th.head
            {
                padding: 10px;
                text-align: center;
                background: #20b7ff;
                color: white;
            }
            .profileTab td.label
            {
                text-align: right;
                padding-right: 10px;                
            }
            .profileTab td{

            }


        </style>

        <script type="text/javascript">
            $(function(){
                StripyTable.makeAsStrippyTable($('.profileTab'),{CSS:'stripyTable'});
            });            
        </script>

    </head>
    <body>
        <html:form action="Registration">            
            <table class="profileTab">
                <tr>
                    <th colspan="2" class="head top_border">
                        Employee Profile Overview
                    </th>
                </tr>
                <tr>
                    <td class="label">Employee ID</td>
                    <td><bean:write name="RegistrationFormBean" property="empId" /></td>
                </tr>
                <tr>
                    <td class="label">First Name</td>
                    <td><bean:write name="RegistrationFormBean" property="firstName" /></td>
                </tr>
                <tr>
                    <td class="label">Last Name</td>
                    <td><bean:write name="RegistrationFormBean" property="lastName" /></td>
                </tr>
                <logic:equal name="RegistrationFormBean" property="viewMode" value="1">
                    <tr>
                        <td class="label">Date of birth</td>
                        <td><bean:write name="RegistrationFormBean" property="dob" /></td>
                    </tr>
                </logic:equal>
                <tr>
                    <td class="label">Phone Number</td>
                    <td><bean:write name="RegistrationFormBean" property="phNo" /></td>
                </tr>
                <logic:equal name="RegistrationFormBean" property="viewMode" value="1">
                    <tr>
                        <td class="label">Address</td>
                        <td><bean:write name="RegistrationFormBean" property="address" /></td>
                    </tr>
                </logic:equal>
                <tr>
                    <td class="label">E-Mail</td>
                    <td><bean:write name="RegistrationFormBean" property="email" /></td>
                </tr>
                <tr>
                    <td class="label">Skype ID</td>
                    <td><bean:write name="RegistrationFormBean" property="skypeId" /></td>
                </tr>
                <tr>
                    <td class="label">Teamviewer ID</td>
                    <td><bean:write name="RegistrationFormBean" property="teamviewerId" /></td>
                </tr>

                <logic:equal name="RegistrationFormBean" property="viewMode" value="1">
                    <tr>
                        <td class="label">Basic Qualification</td>
                        <td><bean:write name="RegistrationFormBean" property="basicQualification" /></td>
                    </tr>
                    <tr>
                        <td class="label">Master Qualification</td>
                        <td><bean:write name="RegistrationFormBean" property="masterQualification" /></td>
                    </tr>
                    <tr>
                        <td class="label">Role</td>
                        <td><bean:write name="RegistrationFormBean" property="role" /></td>
                    </tr>

                    <tr>
                        <td class="label">User Name</td>
                        <td><bean:write name="RegistrationFormBean" property="userName" /></td>
                    </tr>
                    <tr>
                        <td class="label">Initials</td>
                        <td><bean:write name="RegistrationFormBean" property="initials" /></td>
                    </tr>
                    <tr>
                        <td class="label">Designation</td>
                        <td><bean:write name="RegistrationFormBean" property="designation" /></td>
                    </tr>
                    <tr>
                        <td class="label">Date of Joining</td>
                        <td><bean:write name="RegistrationFormBean" property="doj" /></td>
                    </tr>
                    <tr>
                        <td class="label">Salary</td>
                        <td><bean:write name="RegistrationFormBean" property="salary" /></td>
                    </tr>                    
                </logic:equal>
            </table>
        </html:form>                    
    </body>
</html>
