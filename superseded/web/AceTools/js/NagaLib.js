/* 
 * This Library holds the Setof method to perform the cliend side validation
 */

function FormValidator(formObj)
{
    // Properties
    // This Holds The Form Object to Validate
    this.formObj = formObj;
    // This boolean variable tells whether the formis valid or not
    this.validForm = false;
    // this variable holds the No of Invalid fields in the Current form
    this.noOfInvalidFields = 0;

    // methods Block

    /**
     * This Method performs the all the Validations
     * fieldType the type of the input field all should be in CAPITAL Letters
     * fieldName the id of the Field or Propert in the sense of Struts
     * errorMsg the Error message to be display
     * successMsg the Success Message to be Display
     */
    this.validateField = function(fieldType,fieldName,errorMsg,successMsg)
    {
        switch(fieldType)
        {
            case 'TEXT':
                this.noOfInvalidFields += this.validateTextField(fieldName, errorMsg, successMsg);
                break;
            case 'SELECT':
                this.noOfInvalidFields += this.validateComboList(fieldName, errorMsg, successMsg);
                break;
            case 'CHECKBOX':
                this.noOfInvalidFields += this.validateCheckField(fieldName, errorMsg, successMsg);
                break;
            case 'RADIO':
                this.noOfInvalidFields += this.validateRadioField(fieldName, errorMsg, successMsg);
                break;
        }
    };
    

    /**
     * This Method Performs The Validation on The TextField and return 0 or 1
     * 0 for That the field is Valid
     * 1 for That the Field is Invalid
     * This method Autometically Calls to set Error Message if it necessary
     */
    this.validateTextField = function (fieldName,errorMsg,successMsg)
    {
        successMsg = "<img src='../AceTools/images/right.gif' style='margin:0px;padding:0px;'/>";
        formObj.elements[fieldName].onchange = function()
        {
            document.getElementById(fieldName+"Error").innerHTML = successMsg;
        }

        var val = formObj.elements[fieldName].value;
        if(val.length < 1)
        {            
            this.setError(fieldName+"Error", errorMsg);
            return 1;
        }
        else
        {
            this.setError(fieldName+"Error", successMsg);
        }
        return 0;
    };

    /**
     * This Method Validates a Given ComboList
     */
    this.validateComboList = function (fieldName,errorMsg,successMsg)
    {
        formObj.elements[fieldName].onchange = function()
        {
            document.getElementById(fieldName+"Error").innerHTML = "";
        }

        var val = formObj.elements[fieldName].selectedIndex;        
        if(val == 0)
        {            
            this.setError(fieldName+"Error", errorMsg);
            return 1;
        }
        else
        {
            this.setError(fieldName+"Error", successMsg);
        }
        return 0;
    
    };

    /**
     * This Method Checks The Check Box Whether it is Selected or Not
     */
    this.validateCheckField = function(fieldName,errorMsg,successMsg)
    {
        formObj.elements[fieldName].onchange = function()
        {
            document.getElementById(fieldName+"Error").innerHTML = "";
        }

        var val = formObj.elements[fieldName].checked;        
        if(val == false)
        {            
            this.setError(fieldName+"Error", errorMsg);
            return 1;
        }
        else
        {
            this.setError(fieldName+"Error", successMsg);
        }
        return 0;
    };

    /**
     * This Method Validates a Radio Field
     */
    this.validateRadioField = function(fieldName,errorMsg,successMsg)
    {        
        var val = document.getElementsByName(fieldName);        
        v = false;
        for(var i=0;i<val.length;i++)
        {
            if(val[i].checked == true)
            {
                v = true;
                break;                
            }                
        }        
        if(v == false)
        {
            this.setError(fieldName+"Error", errorMsg);
            return 1;
        }
        else
        {
            this.setError(fieldName+"Error", successMsg);
        }
        return 0;
    }


    /**
     * This Method Is Used To Set THe Error Messge to The Specified Object
     * errorFieldName the Error to be displayed on this field
     * msg the message to be displayed
     */
    this.setError = function (errorFieldName,msg)
    {
        //alert("Checking......");
        var errorP = document.getElementById(errorFieldName)
        //alert(errorP.nodeName);
        errorP.innerHTML = msg;
    };

    /**
     * This Method tells Whether the Current form is Valid or Not
     * return true if it valid
     * otherwise returns false
     */
    this.isValidForm = function()
    {
        return this.noOfInvalidFields == 0;
    };
}