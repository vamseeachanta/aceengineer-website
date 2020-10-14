/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**used to parse the json object data to load and draw the chart*/
function chart(){
    var  jsonFirstData = $('input[name="jsonFirstChartData"]');
    var  jsonSecondData = $('input[name="jsonSecondChartData"]');
    jsonFirstData = jsonFirstData.val();
    jsonSecondData = jsonSecondData.val();
    //                alert(jsonFirstData);
    //                alert(jsonSecondData);
                
    try{
        jsonFirstData = parseJSONData(eval("("+jsonFirstData+")"));
        //                    alert("parsed data: "+jsonFirstData);
        jsonSecondData = parseJSONData(eval("("+jsonSecondData+")"));
        //                    alert("Parsed data: "+jsonSecondData);
        loadChart(jsonFirstData,"firstChart_div","TRUE AXIAL FORCE v/s INTERNAL PRESSURE","Internal Pressure (pa)","True Axial Force (N)");
        loadChart(jsonSecondData,"secondChart_div","TRUE AXIAL FORCE v/s EFFECTIVE TENSION","Internal Pressure (pa)","Effective Tension (N)");
    }catch(e){
        alert(e);
    }
                    
}
            
/**
             * This MEthod Parse the JSON Data and retuenrn the Numeric Array
             */
function parseJSONData(jsonObj){
    for(var i=0;i<jsonObj.length;i++){
        for(var j=0;j<jsonObj[i].length;j++)
        {
            try{
                jsonObj[i][j] = parseFloat(jsonObj[i][j]);
            //                            alert(jsonObj[i][j]);
            }catch(e){
                jsonObj[i][j] = NaN;
            }
        }
    }
    return jsonObj;
}
            
function loadChart(jsonData,div,chartTitle,xLabel,yLabel){
    //google.load("visualization", "1", {packages:["corechart"]});                
    //google.setOnLoadCallback(drawChart);
                
    drawChart(div);
                
    function drawChart(chartDiv) {                    
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Internal Pressure');
        data.addColumn('number', 'σallow = 0.67σy (psi)');
        data.addColumn('number', 'σallow = 0.80σy (psi)');
        data.addColumn('number', 'σallow = 0.90σy (psi)');
        data.addColumn('number', 'σallow = 1.0σy (psi)');
                    
        data.addRows(jsonData);

        var chart = new google.visualization.LineChart(document.getElementById(chartDiv));
        chart.draw(data, {
            width: 900, 
            height: 380, 
            title: chartTitle,
            lineWidth:3,
            hAxis: {
                title: xLabel, 
                titleTextStyle: {
                    color: '#276A4B'
                }
            },
            vAxis: {
                title: yLabel, 
                titleTextStyle: {
                    color: '#276A4B'
                }
            },
            chartArea : {
                left:50,
                top:50,
                width:"100%"
            //height:"75%"
            },
            legend :{
                position:'bottom'
            }
                        
        });
    }
}



/**this method used to enable and disable the text boxes*/
function showTextBox(){
    
    var radios = document.getElementsByName('selectOpt');
    var Innerdia  = document.getElementsByName('innerDia')[0];
    var thickness  = document.getElementsByName('pipeWallThickness')[0];
                
    radios[0].checked = true;
    Innerdia.disabled = true;
    thickness.disabled =false;
    // here radios[0] id the radio button for pipe wall thickness
    radios[0].onclick = function(){
        Innerdia.value= thickness.value  = "";
        Innerdia.disabled = true;
        thickness.disabled =false;
                    
    };
    // here radios[0] id the radio button for inner diameter
    radios[1].onclick = function(){
        Innerdia.value= thickness.value  = "";
        Innerdia.disabled = false;
        thickness.disabled = true;
    };
                
}
            
            
/* this method used to draw the pipe cross section according to the given inputs**/            
function registerSVGPipe(){
    var od = document.getElementsByName('outerDia')[0];
    var id = document.getElementsByName('innerDia')[0];
    var wt = document.getElementsByName('pipeWallThickness')[0];
    
    var innerDia;
    var outerDia;
    var div = document.getElementById('pipeDiv');
                
    div.style.border='1px solid grey';
                
    od.onchange = function(){
        outerDia = this.value;
        if(outerDia >0)
            drawPipe(innerDia,outerDia);
    }
                
    id.onchange= function(){
        innerDia = this.value;
        outerDia = od.value;
        if(outerDia>innerDia && innerDia >0 && outerDia >0)
            drawPipe(innerDia,outerDia);
        else
        {
            div.innerHTML = '<p style="color:red;">Sorry,Outer diameter should be greater than Inner diameter\n Please provide the correct inputs</p>';
            id.value = wt.value ="";
        }   
    }
              
    wt.onchange = function(){
        innerDia = this.value;
        outerDia = od.value;
        innerDia = outerDia - 2*wt.value;
        if(outerDia>innerDia && innerDia >0 && outerDia >0){
            drawPipe(innerDia,outerDia);
        }
        else{
            div.innerHTML = '<p style="color:red;">Sorry,Outer diameter should be greater than Inner diameter\n Please provide the correct inputs</p>';
            id.value = wt.value ="";
        }
    }
    
    /*this method used to draw the cross sectional pipe diagram,**/
    function drawPipe(iDia,oDia){
       
        div.innerHTML = "";
        var width = 200;
        var height=200;
        var margin = 10;
        try{
            var max = oDia;
            var hRatio = (width-margin)/max;
            var vRatio = (height-margin)/max;
            var ratio = hRatio>vRatio?hRatio:vRatio;
            var paper =  Raphael(div, width,height);
                        
            var iRadius = ratio*iDia/2;
            var oRadius = ratio*oDia/2;
            paper.circle((width-oRadius)/2+oRadius/2,(height-oRadius)/2+oRadius/2,oRadius).
            animate({
                'fill':'r#02234B-#0048A2-#02234B'
            },1000);
            paper.circle((width-iRadius)/2+iRadius/2,(height-iRadius)/2+iRadius/2,iRadius).
            animate({
                'fill':'white'
            },1000);
        //paper.circle(70+35,70+35,60).
        //    animate({'fill':'white'},1000);
                            
        //paper.circle(width/2-iDia,height/2-iDia,iDia*ratio/4).attr({'fill':'black'});
        }catch(e){
            alert(e);
        } 
    }
}

/*
 *function used to validate the fields in the form
 **/
function validateDiameter(){
    var od = $('input[name="outerDia"]');
    var wt = $('input[name="pipeWallThickness"]');
    var id = $('input[name="innerDia"]');
    var tol = $('input[name="tolerance"]');
    var tCor = $('input[name="tCorrosion"]');
    var yStr = $('input[name="yieldStrength"]')
    var bm = $('input[name="bendingMoment"]');
    var extP = $('input[name="exterPressure"]');
    /**Registering the event to validate the outer diameter field*/
    od.change(function(){
        if(od.val()>80||od.val()<0){
            alert("External diameter should be greater than 0 (zero) and less than 80");
            od.val("");
        }    
    });
    /**Registering the event to validate the wall thickness  field*/
    wt.change(function(){
        if(wt.val()>od.val()/2||wt.val()<0){
            alert("External diameter should be greater than 0 (zero) and less than 80");
            wt.val("");
            wt.focus();
        }    
    });
    /**Registering the event to validate the inner diameter field*/
    id.change(function(){
        if(id.val()>od.val()||id.val()<0){
            alert("External diameter should be greater than 0 (zero) and less than 80");
            id.val("");
            id.focus();
        }    
    });
    /**Registering the event to validate the tolerance field*/
    tol.change(function(){
      
        var tolerance = Number(tol.val());
           
        if(tolerance<0 || tolerance>100){           
            $(this).focus();
            alert("Tolerance should be greater than 0 (zero) and less than 100 ");
            tol.val("");
        }    
    });
    /**Registering the event to validate the corrosion field*/
    tCor.change(function(){
        
        if(tCor.val()<0){
            alert("Internal Corrosion should be greater than 0 (zero) ");
            tCor.val("");
            tCor.focus();
        }    
    });
    /**Registering the event to validate the Yield Strength field*/
    yStr.change(function(){
        if(yStr.val()<0){
            alert("Yield Strengthshould be greater than 0 (zero) ");
            yStr.val("");
            yStr.focus();
        }    
    });
    /**Registering the event to validate the bending moment  field*/
    bm.change(function(){
        if(bm.val()<0){
            alert("Internal Corrosion should be greater than 0 (zero) ");
            bm.val("");
            bm.focus();
        }    
    });
    /**Registering the event to validate the corrosion field*/
    extP.change(function(){
        if(extP.val()<0){
            alert("External Pressure should be greater than 0 (zero) ");
            extP.val("");
            extP.focus();
        }    
    });

   
}
                
               

