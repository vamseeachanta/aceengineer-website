<%@taglib uri="http://struts.apache.org/tags-html" prefix="html" %>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<html>
    <head>
        <title></title>
        <style type="text/css">
            .sliderPanel{
                position: relative;
            }

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
            }

            .sliderPanel .selected{
                background: #83d3ff;
                color: black;
            }
            .sliderPanel .panel{
                display: none;                
            }
        </style>


        <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<!--        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>-->
        <script type="text/javascript" src="res/js/jquery.validate.js"></script>
        <script type="text/javascript" src="res/js/jquery.json-2.3.min.js"></script>

        <link rel="stylesheet" type="text/css" href="res/css/PMSStyle.css"/>

        <script type="text/javascript">            
            /**
             * This Method Register the Slider Panel
             */
            function registerSliderPanel()
            {
                $('.sliderPanel').each(function()                
                {
                    var controls = $(this).find('.navigator span');
                    var panels = $(this).find('.panel');
                    
                    var prevPanel;
                    var currPanel;
                    var prevNavig;
                    var currNavig;
                    
                    currPanel = $(panels).eq(0);
                    currNavig = $(controls).eq(0);
                    
                    $(currPanel).show();
                    $(currNavig).addClass("selected");
                    
                    $(controls).each(function(ind){
                        $(this).click(function()
                        {
                            if(!$('form').valid())
                                return;
                            
                            
                            prevNavig = currNavig;
                            currNavig = this;                            
                            
                            $(prevNavig).removeClass('selected');
                            $(currNavig).addClass('selected');                            
                            
                            prevPanel = currPanel;
                            currPanel = $(panels).eq(ind);                            
                            
                            
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
                function slideTo(ind)
                {}
            }
            
            
            /**
             * 
             */
            function validateForm(){
                $('form').validate(
                {
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
            
            $(function()
            {
                registerSliderPanel();
                validateForm();
                try
                {
                    loadDynamicContent();
                }catch(e){alert(e);}
                
            });
            function loadDynamicContent(){
                
                $.get("projectHandler.do?mode=6",null,function(data)
                {   
                    data = eval("("+data+")");
                    var empIdData = data;
                    //var empList = data[0].empIdInitials;
                    var projId = data[2].projSeqId;
                    //alert(projId)
                    if($('input[name="proId"]').val().length<1)
                    {
                        $('input[name="proId"]').val(projId);
                    }
                    
                });
                $.get("businessApprovalHandler.do?mode=1",null,function(data){
                    data =eval("("+data+")");
                    if($('input[name="approvalId"]').val().length<1)
                    {
                        $('input[name="approvalId"]').val(data.ID);
                        //$('input[name="proId"]').val(data.PROJID);
                    }
                    
                });
            }
        </script>


    </head>
    <body>
        <html:form action="BusinessApproval" method="post">

            <logic:equal name="BusinessApprovalFormBean" property="mode" value="1">
                <html:hidden property="mode" value="1"/>
            </logic:equal>

            <div class="sliderPanel">
                <div class="navigator">
                    <span>Approval Details</span>
                    <span>Project Details</span>
                    <span>Product</span>
                    <span>Service</span>                    
                    <span>Expenses</span>
                    <span>Support Services</span>                                        
                </div>


                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td class="label">Approval Id</td>
                            <td><html:text property="approvalId" readonly="true"/></td>
                        </tr>
                        <tr>
                            <td class="label">Project Title</td>
                            <td>
                                <html:text property="projectTitle"></html:text>                                
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Project Id </td>
                            <td>
                                <html:text property="proId" styleClass="required" readonly="true"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Document Owner </td>
                            <td>                                
                                <html:text property="docOwner" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Customer Name</td>
                            <td>
                                <html:text property="customerName" styleClass="required"/>
                            </td>								
                        </tr>

                        <tr>
                            <td class="label">Proposal Number </td>
                            <td>
                                <html:text property="proposalNumber" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Name Of Resource </td>
                            <td>
                                <html:text property="nameResource" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Estimated Days</td>
                            <td>
                                <html:text property="estimateDays" styleClass="required"/>
                            </td>								
                        </tr>
                    </table>
                    </fieldset>
                </div>

                <div class="panel">
                    <table class="formFields">

                        <tr>
                            <td class="label">Project Summery</td>
                            <td>
                                <html:textarea property="proSummery" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Proposal Submission Date</td>
                            <td>
                                <html:text property="proposalSubDate" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Estimated Start Date</td>
                            <td>
                                <html:text property="estimateStartDate" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Completion Date</td>
                            <td>
                                <html:text property="completionDate" styleClass="required"/>
                            </td>								
                        </tr>
                        <%--
                        <tr>
                            <td class="label">Value</td>
                            <td>
                                <html:text property="value" styleClass="required"/>
                            </td>
                        </tr>
                        --%>
                        <tr>
                            <td class="label">Project cost</td>
                            <td>                                
                                <html:text property="product" styleClass="required"/>
                            </td>
                        </tr>
                        <%--
                        <tr>
                            <td class="label">Service</td>
                            <td>
                                <html:text property="service" styleClass="required"/>
                            </td>
                        </tr>
                        --%>
                        <tr>
                            <td class="label">Other Requirements</td>
                            <td>
                                <html:textarea property="otherReq" styleClass="required"/>
                            </td>								
                        </tr>
                    </table>                    
                </div>


                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td class="label">Product Name</td>
                            <td>
                                <html:text property="productName" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">No.of License</td>
                            <td>
                                <html:text property="numOfLicense" styleClass="required"/>
                            </td>								
                        </tr>
                        <tr>
                            <td class="label">Unit Price</td>
                            <td>
                                <html:text property="unitPrice" styleClass="required"/>
                            </td>								
                        </tr>
                        <%-- 
                            <tr>
                                 <td class="label">Terms</td>
                                 <td>
                                     <html:text property="terms" styleClass="required"/>
                                 </td>								
                            </tr>    
                        --%>                    
                    </table>

                </div>

                <div class="panel">
                    <table class="formFields">                        
                        <tr>
                            <td class="label">Description</td>
                            <td>
                                <html:textarea property="desc" styleClass="required"></html:textarea>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">No.of Days</td>
                            <td>
                                <html:text property="numOfDays" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Unit Rate</td>
                            <td>
                                <html:text property="unitRate" styleClass="required"/>
                            </td>
                        </tr>
                        <%--
                        <tr>
                            <td class="label">Terms</td>
                            <td>
                                <html:text property="serTerms" styleClass="required"/>
                            </td>
                        </tr>
                        --%>
                    </table>
                </div>

                <div class="panel">
                    <table class="formFields">                        
                        <tr>
                            <td  class="label">Description</td>
                            <td>
                                <html:textarea property="expDesc" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Estimated No</td>
                            <td>
                                <html:text property="expNo" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Rate</td>
                            <td>
                                <html:text property="expRate" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Total Cost</td>
                            <td>
                                <html:text property="expTotCost" styleClass="required"/>
                            </td>
                        </tr>                        
                    </table>
                </div>


                <div class="panel">
                    <table class="formFields">
                        <tr>
                            <td  class="label">Description</td>
                            <td>
                                <html:textarea property="supSerDesc" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Support(%)</td>
                            <td>
                                <html:text property="support" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Annual Fee</td>
                            <td>
                                <html:text property="annualFee" styleClass="required"/>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <html:submit property="continueBtnSix" value="SUBMIT"/>
                            </td>
                        </tr>
                    </table>                    
                </div>

            </div>
        </html:form>
    </body>
</html>