/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function loadPipeApplet1()
{
    //            alert("entered");
    var outer = parseFloat(document.forms[0].outerDia.value);
    //                alert("tests1");
    var thickness = parseFloat(document.forms[0].pipeWallThickness.value);
    var inner = parseFloat(document.forms[0].innerDia.value);
                
    if(!isNaN(thickness))
    {
        inner =outer-2* thickness;
    }
    d = document.getElementById("pipeDiv");
    //                alert(inner);
    // if The Ouiter Diameter is Greater Than THe Inner Then Go Forward
    if(outer > inner)
    {
        d.innerHTML = "<applet code='com/naga/PipeApplet.class' archive='PipeApplet.jar' width='200' height='200'>"
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
/** the funtion used to enable the text boxes related to the radio sele**/
function show(){
    for(var i=0;i<document.forms[0].elements.length;i++){
        if(document.forms[0].elements[i].name=="selectOpt"){
            alert("this is test");
            

            if(document.forms[0].elements[i].value=="thickness"){
                if(document.forms[0].elements[i].checked==true){
                    //                                                      alert("this is test");
                    document.forms[0].innerDia.disabled=true;
                    document.forms[0].innerDia.value=null;
                    document.forms[0].pipeWallThickness.disabled=false;
                }else{
                    //              alert("this is test");
                    document.forms[0].pipeWallThickness.disabled=true;
                    document.forms[0].pipeWallThickness.value=null;
                    document.forms[0].innerDia.disabled=false;
                }

            }
        }
    }
}



function limit(){
     var txtouterdia=$('input[name="outerDia"]');
     alert(txtouterdia);
    if(txtouterdia>80||txtouterdia<0){
        alert("external diameter is very large.Results may not be meaningful.Do you want still continue?");
    }
}
function limit1(){
    txtouterdia=document.forms[0].outerDia.value;
    txtpipewallthikness=document.forms[0].pipeWallThickness.value;
    if(txtpipewallthikness>txtouterdia/2 || txtpipewallthikness<0){
        alert("wallthickness is very large.Results may not be meaningful.Do you want still continue?");
    }
}
function limit2(){
    txtouterdia=document.forms[0].outerDia.value;
    txtinnerdia=document.forms[0].innerDia.value;
    if(txtinnerdia>txtouterdia || txtinnerdia<0){
        alert("innerdaimeter is very large.Results may not be meaningful.Do you want still continue?");
    }
}
function limit3(){
    txtpipetolarance=document.forms[0].tolerance.value;
    if(txtpipetolarance<0){
        alert("tolerance is less than zero.Results may not be meaningful.Do you want still continue?");
    }
}
function limit4(){
    txttcooresion=document.forms[0].tCorrosion.value;
    if(txttcooresion<0){
        alert("innerdaimeter is less than zero.Results may not be meaningful.Do you want still continue?");
    }
}
function limit5(){
    txtyieldstrength=document.forms[0].yieldStrength.value;
    if(txtyieldstrength<0){
        alert("tCorrosion is less than zero.Results may not be meaningful.Do you want still continue?");
    }
}
function limit6(){
    txtbendingmoment=document.forms[0].bendingMoment.value;
    if(txtbendingmoment<0){
        alert("bendingMoment is less than zero.Results may not be meaningful.Do you want still continue?");
    }
}
function limit7(){
    txtexternalpresure=document.forms[0].exterPressure.value;
    if(txtexternalpresure<0){
        alert("exterPressure is less than zero.Results may not be meaningful.Do you want still continue?");
    }
}



