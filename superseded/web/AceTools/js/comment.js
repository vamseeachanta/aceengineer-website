/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function handleClick()
{
    window.showModalDialog("comment.jsp","","dialogWidth:400px; dialogHeight:380px; resizable:no; center:yes; scroll:no;");
    return false;
}
var win=null;
function popup()
{
win=window.open("insert.do",'popup_insert','width=500,height=500,scrollbars=yes,resizable=yes');
if(window.focus)
    {
        new window.focus();
    }
    
    return false;
}

function popup_update()
{
window.open ("update.do",'name','width=200,height=200,scrollbars=yes,resizable=yes');
if(window.focus)
    {
        new window.focus();
    }
     
    return false;
}

function popup_delete()
{
window.open ("deletedata.do",'name','height=400,width=400');
if(window.focus)
    {
        new window.focus();
    }
     
    return false;
}
function popup_check()
{
    if(win!=null)
        {
            win.close();
            return true;
        }

        return true;
}

