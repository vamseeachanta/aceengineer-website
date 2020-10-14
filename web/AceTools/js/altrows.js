/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function alternate(id,c1,c2){

    /*
     * this is test for applet by kd
     */
//    document.forms[0].elements["youngsModulus"].value=null;
    //      alert("this is test");
    txt=document.forms[0].elements["strakePresent"].value;
    //    alert(txt);
    if(!txt.match("strake")){
        document.forms[0].elements["strakeDensity"].value="0";
        document.forms[0].elements["strakeThickness"].value="0";
        document.forms[0].elements["strakeArea"].value="0";
        document.forms[0].elements["dragDia"].value=0;
        document.forms[0].pipeThickness.value=null;
        document.forms[0].innerDiameter.value=null;
 
    }

    
    
    //       alert(txt);
    if ( txt.match(id) ) {
        //              alert("this is test")
        document.getElementById(id).style.display = 'block';
    }


    txt=document.forms[0].elements["numOfCoats"].value;
    //    alert(txt);

    if(!txt.match(c2) && !txt.match(c1)){
        document.forms[0].coat1Thickness.value='0';
        document.forms[0].coat1Density.value='0';
        document.forms[0].coat2Thickness.value='0';
        document.forms[0].coat2Density.value='0';
    }
    if(txt.match(c1)){
        document.getElementById(c1).style.display = 'block';
    }
    if(txt.match(c2)){
        document.getElementById(c1).style.display = 'block';
        document.getElementById(c2).style.display = 'block';
    }
    document.forms[0].elements["selectOpt"][0].checked=true;
    document.forms[0].elements["innerDia"].value=null;
}

function display(form,c1,c2) {
    txt = form.options[form.selectedIndex].value;
    document.getElementById(c1).style.display = 'none';
    document.getElementById(c2).style.display = 'none';

    if ( txt.match(c1) ) {
        document.getElementById(c1).style.display = 'block';
        document.forms[0].coat1Thickness.value=null;
        document.forms[0].coat1Density.value=null;
        document.forms[0].coat2Thickness.value='0';
        document.forms[0].coat2Density.value='0';
    //        alert('value' + txt);
    }
    if ( txt.match(c2) ) {
        document.getElementById(c1).style.display = 'block';
        document.getElementById(c2).style.display = 'block';
        document.forms[0].coat1Thickness.value=null;
        document.forms[0].coat1Density.value=null;
        document.forms[0].coat2Thickness.value=null;
        document.forms[0].coat2Density.value=null;
    //        alert('default value' + txt);
    }
}

function displayStrake(obj,id1){
    for(var i=0;i<document.forms[0].elements.length;i++){
        if(document.forms[0].elements[i].name=="strakePresent"){
            if(document.forms[0].elements[i].value=="strake"){
                document.forms[0].strakeDensity.value=null;
                document.forms[0].strakeThickness.value=null;
                document.forms[0].strakeArea.value=null;
                document.forms[0].dragDia.value=null;
            }else{
                //              alert("this is test");
                document.forms[0].strakeDensity.value="0";
                document.forms[0].strakeThickness.value="0";
                document.forms[0].strakeArea.value="0";
                document.forms[0].dragDia.value=0;
            }
        }
    }
    txt = obj.options[obj.selectedIndex].value;
    document.getElementById(id1).style.display = 'none';
    //              alert("this is test");
    if ( txt.match(id1) ) {
        document.getElementById(id1).style.display = 'block';
    }

}


