/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



function alternate(id){
// alert("this is test");
    document.forms[0].elements["selectOpt"][0].checked=true;
    document.forms[0].elements["innerDia"].value=null;


    if(document.getElementById){ //check that browser has capabilities
        if(document.getElementsByTagName){
            var table = document.getElementById(id);
            var rows = table.getElementsByTagName("tr");
            for(i = 0; i < rows.length; i++){ //manipulate rows
                if(i % 2 == 0){
                    rows[i].className = "evenrow";
                }else{
                    rows[i].className = "oddrow";
                }
            }
            }
}
}
