/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function options(){
    for(var i=0;i<document.forms[0].elements.length;i++){
        if(document.forms[0].elements[i].name=="selectOpt"){
            if(document.forms[0].elements[i].value=="thickness"){
                if(document.forms[0].elements[i].checked==true){
                    document.forms[0].elements[i+1].disabled=false;
                }
                else{
                    document.forms[0].elements[i+1].disabled=true;
                }
            }
            else if(document.forms[0].elements[i].value=="innerDia"){
                if(document.forms[0].elements[i].checked==true){
                    document.forms[0].elements[i+1].disabled=false;
                }
                else{
                    document.forms[0].elements[i+1].disabled=true;
                }
            }
        }
    }
}

function showFea(){
    

    for(var i=0;i<document.forms[0].elements.length;i++){
        if(document.forms[0].elements[i].name=="selectOpt"){
            //                            alert("this is test");
            if(document.forms[0].elements[i].value=="thickness"){
                if(document.forms[0].elements[i].checked==true){
                    //                    alert("this is test thickness");
                    document.forms[0].innerDiameter.disabled=true;
                    document.forms[0].innerDiameter.value=null;
                    document.forms[0].pipeThickness.disabled=false;
                }else{
                    //                    alert("this is test inner diameter");
                    document.forms[0].pipeThickness.disabled=true;
                    document.forms[0].pipeThickness.value=null;
                    document.forms[0].innerDiameter.disabled=false;
                }
            }
        }
    }
}

/*
 * this for applet code by kd
 */
function loadPipeApplet()
{

    var outer = parseFloat(document.forms[0].pipeOuterDia.value);
    var thickness = parseFloat(document.forms[0].pipeThickness.value);
    var inner = parseFloat(document.forms[0].innerDiameter.value);
    if(!isNaN(thickness))
    {
        inner =outer-2* thickness;
    }
    var coat2 = loadParamValue(document.forms[0].coat1Thickness);
    var coat1 = loadParamValue(document.forms[0].coat2Thickness);    
    d = document.getElementById("pipeDiv");

    // if The Ouiter Diameter is Greater Than THe Inner Then Go Forward
    if(outer > inner)
    {
        d.innerHTML = "<applet code='com/naga/PipeApplet.class' archive='PipeApplet.jar' codebase='interactiveapplets' width='200' height='200'>"
        +"<param name='coat2' value='"+coat2+"'/>"
        +"<param name='coat1' value='"+coat1+"'/>"
        +"<param name='outer' value='"+outer+"'/>"
        +"<param name='inner' value='"+inner+"'/>"
        +"</applet>";
    //d.innerHTML += "<br/>Outer : "+outer+": Inner: "+inner;
    }
    else
    {
        d.innerHTML = "<p style='color:red'>Please make Sure The Parameters are Valid</p>";
    }
}

/**
 * This Method Is Used o load the Parametrs Value
 */
function loadParamValue(paramName)
{
    v = parseFloat(paramName.value);
    return isNaN(v)?0:v;
}


            


function check(){
    if(document.forms[0].checkbox1.value == null){
        alert("Please select atleast one output properties");
    }
}