/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function valid()
{
    if(document.forms[0]["condition"].value == "condition")
    {
        alert("please select any one of condition");
        return false;
    }
    if(document.forms[0]["development"].value == "development")
    {
        alert("Please select any one of development");
        return false;
    }
    if(document.forms[0]["height"].value=="")
    {
        alert("Height should not be empty");
        return false;
    }
    if(isNaN(document.forms[0]["height"].value))
    {
        alert("Please enter correct significant-height");
        return false;
    }
    self.close();
    //return true;
 //       opener.document.forms["myform"].action="refresh";
 //       window.opener.location.reload(true);
//  window.close();
}

function valid1()
{
    if(document.forms[0]["condition"].value == "condition")
    {
        alert("please select any one of condition");
        return false;
    }
    if(document.forms[0]["development"].value == "development")
    {
        alert("Please select any one of development");
        return false;
    }
    this.close();
    window.opener.location.reload(true);

}