/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var animObject;
var paper;
var back;
var rect;
var innerRect;
var ventTube;
var waterLevel;//LOB
var contWLevel;//LOB
var conatiner;
var ellipseD;//
var vUpperNoz;//LOB
var vLowerNoz ;//LOB

var typeIndex ;
var wFlow;
var line;
window.onload = function () 
{
    var butt = document.getElementById("goraphaelsource");
    var selectContainer = document.getElementById("typeOfContainer");
    var vesselH ;
    var fLevel ;
    var drawBtn = $("#draw");
    
    paper1 = Raphael(document.getElementById("goraphaelsource"),400,400);       
    paper2 = Raphael(document.getElementById("goraphaelsourceLOB"),400,400);       
    $(drawBtn).click(function(){
        var type = selectContainer.options.selectedIndex;
        if(type == 0)
        {
            fLevel = $('input[name="constant_hm"]').val();
            vesselH = parseFloat(fLevel)+parseFloat((fLevel*50)/100); 
            drawSet(vesselH,fLevel,type,paper1);
        }
        else if(type == 1)
        {
            vesselH = $('input[name="variable_Hm"]').val(); 
            fLevel = $('input[name="variable_hm"]').val();
            drawSet(vesselH,fLevel,type,paper1);
        }
        else
        {
            
            vesselH = $('input[name="LOB_d"]').val();
            fLevel = $('input[name="LOB_D"]').val();
            drawSet(vesselH,fLevel,type,paper2);
        }
    });
      
    $('input[name="constant_hm"]').blur(function(){
     
        applyAnimate();
    }); 
      
    $('input[name="variable_hm"]').blur(function(){
        var frst = parseInt($('input[name="variable_Hm"]').val());
        var sec =  parseInt($('input[name="variable_hm"]').val());
        //        alert(frst);
        //        alert(sec);
        //        alert();
        //        if($('input[name="variable_hm"]').val() > $('input[name="variable_Hm"]').val())
        //        alert((frst>sec));
        if((frst>sec))
        {
            applyAnimate(); 
           
        }
        else
        {
            alert("Water Level should be less than or equal to Vessel Height");
            return false;
        }
    });
    $('input[name="variable_Hm"]').blur(function(){
        applyAnimate();
        
    });
    $('input[name="LOB_D"]').blur(function(){
        
        applyAnimate();
    });  
    $('input[name="LOB_d"]').blur(function(){
        
        
        
        applyAnimate();
    }); 
      
      
      
      
      
      
      
    function applyAnimate()
    {
        var type = selectContainer.options.selectedIndex;
        if(type == 0)
        {
            fLevel = $('input[name="constant_hm"]').val();
            vesselH = parseFloat(fLevel)+parseFloat((fLevel*50)/100); 
            drawSet(vesselH,fLevel,type,paper1);      
        }
        else if(type == 1)
        {
            vesselH = $('input[name="variable_Hm"]').val(); 
            fLevel = $('input[name="variable_hm"]').val();
            drawSet(vesselH,fLevel,type,paper1);
        }
        else
        {
            vesselH = $('input[name="LOB_d"]').val();
            fLevel = $('input[name="LOB_D"]').val();
            drawSet(vesselH,fLevel,type,paper2);
        }
    }
      
      
      
      
      
    //    $(selectContainer).change(function(){
    //        typeIndex = this.options.selectedIndex ;
    //        if(this.options.selectedIndex == 2)
    //        {
    //            paper = Raphael(document.getElementById("goraphaelsourceLOB"),400,400);  
    //        }
    //        else{
    //            paper = Raphael(document.getElementById("goraphaelsource"),400,400);  
    //        }
    //    });
    //                $(butt).find("input[id=fLevel]").blur(function(){
    //                    vesselH = $(butt).find("input[id=vessel]").val();
    //                    waterLevel = $(butt).find("input[id=fLevel]").val();
    //                    drawSet(vesselH,waterLevel);
    //                });
    $("#animate").click(function(){
        animateDrawing(typeIndex); 
    });
                
                
}
            
function animateDrawing (ind){
    if(ind == 2 )
    {
        var outRect;        
        var wLevel=Raphael.animation({
            y: 130,
            height:270
        }, 5000, 'linear');
        var dip=Raphael.animation({
            y: 300
        }, 5000, 'linear');
        var dipE1=Raphael.animation({
            cy: 300
        }, 5000, 'linear');
        var dipE2=Raphael.animation({
            cy: 400
        }, 5000, 'linear');
        //animObject=Raphael.animation({y: 380,height:0}, 5000, 'linear',function(){ closeAnimate(this);});
        //alert(dipE1);
                    
        conatiner.animate({
            y:200
        },5000,"linear");
        contWLevel.animate({
            y:200,
            height:150
        },5000,'linear');
        ventTube.animate({
            fill:"0-#62A0FF-#ffffff:50-#62A0FF"
        });
        ventTube.animate(dip);
        vUpperNoz.animate(dipE1);
        vLowerNoz.animate(dipE2);
        outRect.animate(wLevel);
                   
    //outRect.animate({y:150,h:250},5000,'linear');
    }
    else{
        animObject=Raphael.animation({
            y: 380,
            height:0
        }, 5000, 'linear',function(){
            closeAnimate(this);
        });
        wFlow.show();
        innerRect.animate(animObject);
    }
}
            
           
function closeAnimate(target)
{
    //target.translate(100, 100);
    target.animate({
        r:0,
        "stroke-opacity":0,
        "fill-opacity":0
    },0);	
    wFlow.hide();
                
}
            
function drawSet(vH,fH,type,paperType) {
                
    //                var animObject=Raphael.animation({ fill: "#FFFFFF" }, 1000, '<>',function(){ closeAnimate(this);});
    
    paper = paperType;
    
    back=paper.rect(0,0,400,400);
    back.attr({
        "stroke-width":1,
        fill:"#FFFFFF"
    });
    var h = Number(340);
    var y = Number(40);
    var x = Number(50);
    var w = Number(300);
    var difference = h/vH;
    var levelDiff = vH-fH;
    wFlow = paper.path("M 350,370 C 380,370 380,400 380,400").attr({
        stroke:'#62A0FF',
        'stroke-width':15
    });
    wFlow.hide();
    //var ellipse1 = paper.ellipse(300,260,60,20);
    //ellipse1 .attr("fill","0-#3F38FF-#eee:50-#3F38FF");
    //ellipse1.attr("stroke","0-#3F38FF-#eee:50-#3F38FF");
    if(type == 0)
    {
        rect = paper.rect(x,y,w,h);
        line = paper.path ("M20 40 L380 40").attr({
            stroke:'#0000FF',
            "stroke-width":5
        });
        innerRect = paper.rect(x, y+levelDiff*difference, w, fH*difference);
        ellipseD = paper.ellipse(350, 370, 4, 10); 
        rect.attr("fill","0-#eeeeee-#ffffff:50-#eeeeee");
        innerRect.attr("fill","0-#62A0FF-#ffffff:50-#62A0FF");
        ellipseD.attr({
            stroke:"#000000",
            "stroke-width":2
        });
        ellipseD.show();
        rect.attr({
            stroke:30
        });
    }
    else if (type == 1)
    {
        rect = paper.rect(x,y,w,h);
        innerRect = paper.rect(x, y+levelDiff*difference, w, fH*difference);
        ellipseD = paper.ellipse(350, 370, 4, 10); 
        rect.attr("fill","0-#eeeeee-#ffffff:50-#eeeeee");
        innerRect.attr("fill","0-#62A0FF-#ffffff:50-#62A0FF");
        ellipseD.attr({
            stroke:"#000000",
            "stroke-width":2
        });
        ellipseD.show();
        rect.attr({
            stroke:30
        });
    }
    else
    {
                    
        var setDd = vH;
        var wD = Number(fH);
        //alert("Set down distance : "+setDd);
        //alert("Water Depth : "+wD);
        h = 100;
        y = 20;
        var contX=Number(100);//container 
        var contY=Number(50); //container
        var contW=Number(200);//container 
        var contH=Number(150);//container 
                    
        setDd = Number(setDd);
        var cPartitions = (setDd*contH)/wD;
        //alert(cPartitions);
        //var partitions = rectH/setDd;
        var diff = contH - cPartitions;
        //alert(diff);
        var ctY = cPartitions +contY;
        //contY = contY + 50;
        //alert(ctY);
        //alert(SetDd);
        //alert(partitions);
        waterLevel = paper.rect(0,200,400,200).attr({
            fill:"0-#62A0FF-#ffffff:50-#62A0FF"
        });//fluid
        conatiner = paper.rect(100,ctY,contW,contH).attr({
            fill:"0-#eeeeee-#ffffff:50-#eeeeee"
        });//conatainer
        contWLevel = paper.rect(100,ctY+diff,200,contH-diff).attr({
            fill:"0-#62A0FF-#ffffff:50-#62A0FF"
        });//inner water level
        ventTube = paper.rect(175,ctY+100,50,100).attr({
            fill:"0-#62A0FF-#ffffff:50-#62A0FF"
        });//vent tube
        vUpperNoz = paper.ellipse(200, ctY+100, 25, 5).attr({
            fill:"0-#eeeeee-#ffffff:50-#eeeeee"
        });//vent tube upper nozzle
        vLowerNoz = paper.ellipse(200, ctY+200, 25, 5).attr({
            fill:"0-#000000-#ffffff:50-#000000"
        });// vent tube lower nozzle
    }
            
               
           
    g_components[setIdx] = newSet;

}

function initComponentObject(obj) {
    var startAll = function () {
        // storing original coordinates
        var compSet = g_components[this.setIdx];
        for (var i in compSet.items) {
            try {
                compSet.items[i].attr({
                    opacity: 0.5
                });
            } catch (ex) {
            ;
            }
            if (compSet.items[i].type == "path") {
                compSet.items[i].ox = compSet.items[i].getBBox().x;
                compSet.items[i].oy = compSet.items[i].getBBox().y;
            }
            else {
                compSet.items[i].ox = compSet.items[i].attrs.cx || compSet.items[i].attrs.x;
                compSet.items[i].oy = compSet.items[i].attrs.cy || compSet.items[i].attrs.y;
            }
        }
    },

    moveAll = function (dx, dy) {
        var compSet = g_components[this.setIdx];
        for (var i in compSet.items) {
            if (compSet.items[i].attrs.cx)             // ellipse
                compSet.items[i].attr({
                    cx: compSet.items[i].ox + dx, 
                    cy: compSet.items[i].oy + dy
                });
            else if (compSet.items[i].attrs.x)
                compSet.items[i].attr({
                    x: compSet.items[i].ox + dx, 
                    y: compSet.items[i].oy + dy
                });
            else            // path
                compSet.items[i].translate(compSet.items[i].ox - compSet.items[i].getBBox().x + dx,compSet.items[i].oy - compSet.items[i].getBBox().y + dy);
        }

    },

    upAll = function () {
        var compSet = g_components[this.setIdx];
        for (var i in compSet.items)
            compSet.items[i].attr({
                opacity: 1
            });
    };

//obj.drag(moveAll,startAll,upAll);
}            
         
