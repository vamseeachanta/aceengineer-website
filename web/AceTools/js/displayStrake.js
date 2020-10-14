/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function show(){
    for(var i=0;i<document.forms[0].elements.length;i++){
        if(document.forms[0].elements[i].name=="selectOpt"){
            //                                alert("this is test");


            if(document.forms[0].elements[i].value=="thickness"){
                //                alert("this is test");
                if(document.forms[0].elements[i].checked==true){
                    //                                                   alert("this is test");
                    document.forms[0].pipeThickness.disabled=true;
                    document.forms[0].pipeThickness.value=null;
                    document.forms[0].pipeOuterDia.disabled=false;
                }else{
                    //                    //              alert("this is test");
                    document.forms[0].pipeOuterDia.disabled=true;
                    document.forms[0].pipeOuterDia.value=null;
                    document.forms[0].pipeThickness.disabled=false;
                }

            }
        }


    }
}


function showData(id1,id2,id3){

    if(id1.match("test1")){
//        alert(id1);
        document.getElementById(id1).style.display = 'block';
    }
     if(id2.match("test2")){

        document.getElementById(id2).style.display = 'block';
//        alert(id2);
    }
     if(id3.match("test3")){

        document.getElementById(id3).style.display = 'block';
//        alert(id3);
    }
}
