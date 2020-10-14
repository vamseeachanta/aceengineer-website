/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var db = createDatabase();
createTables(db);
var img = document.createElement("img");
var imgList = [];
var imgSrc = [];
//            var imgsG = [];
var imageGroup = [];
var globalCount = 0;
var dumpArray = [];
var dumpImageName = [];
var dumpWidth = [];
var dumpHeight = [];
var dumpCount = 0;
var dataInfo;
var loadPrData= [];
var newImg = new Image();
var newImgG = [];
var stage;
var layer;
var deleteImage;
var imageName = [];
var anchor = [];
var deleteIcon = [];
           
           
function html5_storage_support() {
    try {
        return 'localStorage' in window && window['localStorage'] == null;
    } catch (e) {
        return false;
    }
}
function initStage(images,xV,yV,width,height) {
    var ImGrp = new Kinetic.Group({
        x: xV,
        y: yV,
        draggable: true
    });
    
    imageGroup[globalCount] = ImGrp;
    /*
     * go ahead and add the groups
     * to the layer and the layer to the
     * stage so that the groups have knowledge
     * of its layer and stage
     */
    layer.add(imageGroup[globalCount]);
    imageGroup[globalCount].add(images[globalCount]);
    dumpWidth[globalCount] = 200;
    dumpHeight[globalCount] = 200;
    addAnchor(imageGroup[globalCount], width, height,globalCount);
    imageGroup[globalCount].on("dragstart", function(evt) {
        this.moveToTop();
    });
    imageGroup[globalCount].on("load", function(evt) {
        this.moveToTop();
    });
                
    imageGroup[globalCount].on("click",function(evt)
    {
        this.moveToTop();
    });
    stage.add(layer);
    stage.draw();
}


function addAnchorsToGroup(ele)
{
    addAnchor(ele, 0, 0, "topLeft");
    addAnchor(ele, 200, 0, "topRight");
    addAnchor(ele, 200, 200, "bottomRight");
    addAnchor(ele,0, 200, "bottomLeft");
}
/*--------------------------window onload function----------------------------------------------------------*/
window.onload = function() {
    // var db = createDatabase();
    createTables(db);
                
    if (!html5_storage_support) {
        alert("This Might Be a Good Time to Upgrade Your Browser or Turn On Jeavascript");
    }
    var div = document.getElementById('container');
    var upload = document.getElementById('upload');
    var canv;
    createStage();
               
    /*---------------------------------upload button event listener---------------------------------------------------*/
    upload.addEventListener('change', function(evt){
        //        var files = $(this)[0].files; 
        
        var files = this.files;  
        
        if(files.length>0){
            for(var x = 0;x<files.length;x++){
                var file = files[x];
                imageName[x] = file.name;
                if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                    var reader = new FileReader();
                    reader.onload = function(evt){
                        tmpImage(evt.target.result);
                    }
                    reader.readAsDataURL(file);
                } 
            }
                        
        }
        
        $('#upload').val("");
    }, false);
    /*--------------------------------div drag and drop event listener----------------------------------------------------*/
    div.addEventListener('dragover', function(evt){
        evt.preventDefault();
    }, false);
    div.addEventListener('drop', function(evt){
        var files = evt.dataTransfer.files;
        if(files.length>0){
            for(var x = 0;x<files.length;x++){
                var file = files[x];
                imageName[x] = file.name;         
                if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                    var reader = new FileReader();
                    reader.onload = function(evt){
                        tmpImage(evt.target.result);
                    }
                    reader.readAsDataURL(file);
                } 
            }
        }
        evt.preventDefault();
    }, false);
                
    /*-----------------------------SAve canvas as image-------------------------------------------------------*/
    var saveImage = document.createElement("button");
    saveImage.innerHTML = "Save Canvas as Image";
    saveImage.setAttribute('class', 'button');
    saveImage.addEventListener("click", function (evt) {
        try{
            canv = document.getElementById('canvas');
            for(var i in imageGroup){
                removeAnchor(imageGroup[i],i)
            //                            imageGroup[i].remove(anchor);
            }
            stage.add(layer);
            stage.draw();
            if(canv != null)
            {
                window.open(canv.toDataURL("image/png"));
                for(var i in imageGroup)
                {
                    //   addAnchor(imageGroup[i], dumpWidth[i], dumpHeight[i],i);
                    showAnchor(imageGroup[i],i);
                }
                stage.add(layer);
                stage.draw();
            }
            else
                alert('Please do some operations');
        }catch(e ){
            alert(e);
        }            
        evt.preventDefault();
    }, false);
    document.getElementById('content').appendChild(saveImage);
    /*---------------------------------save project event listener ---------------------------------------------------*/
    var saveproject = document.getElementById('savePrj');
    saveproject.onclick = function(evt){
        //deleteProject();
        $("#prjName").val("");
        var div = document.getElementById('prjD');
        var pCnfrm = document.getElementById('prjCnfrm');
        $(div).show(500);
        pCnfrm.onclick = function(){
            saveProject();
            $(div).hide(500);
        //dumpWidth = [];
        //dumpHeight = [];
        //globalCount =0;
        //dumpCount = 0;
        //dumpImageName = [];
        // imageGroup = [];
            
        }
    }
    /* ----------------- Save Project As ---------------------- */
    var saveprojectAs = document.getElementById('savePrjAs');
    saveprojectAs.onclick = function(evt){
        //deleteProject();
        $("#prjName").val("");
        var div = document.getElementById('prjD');
        var pCnfrm = document.getElementById('prjCnfrm');
        $(div).show(500);
        pCnfrm.onclick = function(){
            if(saveProject()){
                alert('Project succesfully saved'); 
            }
            else{}
            $(div).hide(500);
            $("#prjName").val("");
        //window.location.reload();
        }
                    
    }
    /*---------------------------------clear project event listener ---------------------------------------------------*/
    var clearproject = document.getElementById('clrPrj');
    clearproject.onclick = function(evt){
        $('#comment')[0].value = ""
        dumpWidth = [];
        dumpHeight = [];
        dumpImageName = [];
        imageGroup = [];
        stage.remove(layer);
        globalCount =0;
        dumpCount = 0;
        layer = new Kinetic.Layer();
        stage.draw();
    }
    
    /*---------------------------------Sync data event listener ---------------------------------------------------*/
    var sync = document.getElementById('syncPrj');
    sync.onclick = function(){
        syncProjectsToServer();
    /*$.get('sync.php?data='+loadedProjects, null, function(data){
            alert(data);
        });*/
              
    }
    /*---------------------------------Load online project event listener ---------------------------------------------------*/
    var loadprojects = document.getElementById('lolPrj');
    loadprojects.onclick = function(){
        $("#showData")[0].innerHTML = "";
        $('#events')[0].innerHTML = 'Projects List ';
        //        $.get("createFloder.do?mode=2", null, function(data)
        //        {
        //            alert(data);
        //        });
        loadProjects();
    }
    var serverProjects = document.getElementById('serverPrj');
    serverProjects.onclick = function(){
        $("#showData")[0].innerHTML = "";
        $('#events')[0].innerHTML = 'Server Projects';
        loadServerProjects();
    }
    var downLoadFile = document.getElementById('downLoadFile');
    downLoadFile.onclick = function()
    {
        //        window.open($(this).attr('href'),'_blank');
        document.location = 'data:Application/octet-stream,' +encodeURIComponent($(this));
    //        window.open($(this).attr('href'));
    //        window.focus();
    //        window.location.href = $(this).attr('href');
    }
    
    var openProject = document.getElementById('openPrj');
    openProject.onclick = function(){
        $("#ChooseProject").click();
    }
    
    $("#ChooseProject").change(function(){
        var ext = $('#ChooseProject').val().split('.').pop().toLowerCase();
        if(ext != "cc")
        {
            alert("Please choose the Correct Project");
            return;
        }
        var openData = [];
        var openProjData;
        var files = this.files;  
        if(files.length>0){
            for(var x = 0;x<files.length;x++){
                var file = files[x];
                if (typeof FileReader !== "undefined") 
                {
                    var reader = new FileReader();
                    reader.onload = function(evt)
                    {
                        openProjData = evt.target.result;
                        var openProjResData = eval("("+openProjData+")");
                        openData[0]= 
                        {
                            pName:openProjResData[0].results[0].projName,
                            canvas:openProjResData[0].results[1].canvasImage,
                            ctxt:openProjResData[0].results[2].cmmnt
                        }
                        loadProjectToListFromServer(openData);
                    }
                    reader.readAsText(file);
                } 
            }
        }
    //         $('#ChooseProject').val("");
    });
};


// This function used to synchroinize the local database projects to server database 
function syncProjectsToServer(){
    var online = navigator.onLine;
    var localProjects = [];
    
    if(online){
        
        db.transaction(function(qry){
            qry.executeSql('SELECT * FROM CANVAS',[],function(transaction,results){
                if(results.rows.length == 0)
                    alert("Sorry! No records in local database");
                for(var iter=0;iter<results.rows.length;iter++)
                {
                    localProjects[iter]= {
                        uid:results.rows.item(iter)['uid'],
                        pName:results.rows.item(iter)['prjName'],
                        canvas:results.rows.item(iter)['canvas'],
                        img:results.rows.item(iter)['image'],
                        ctxt:results.rows.item(iter)['context']
                    }
                    var pro = localProjects[iter];
                    
                    $.ajax({
                        type: "POST",   //Default is GET
                        data:"&prjName="+localProjects[iter].pName+"&canvasImage="+localProjects[iter].canvas+"&cmt="+localProjects[iter].ctxt+"&mode=3",          //Data you need to send if in JSON format
                        url: "createFloder.do",          //URL you need to pass
                        success: function(value) 
                        {
                            value = eval("("+value+")");
                            var proName = value[0].pName;
                            var status =value[0].status;
                            if(status == "true"){
                                db.transaction(function(transaction){
                                    transaction.executeSql('DELETE FROM CANVAS WHERE prjName = ?',[proName],function(transaction,results){
                                        //                    transaction.executeSql('DELETE FROM CANVAS WHERE prjid = ?',[pId],function(transaction,results){
                                        });
                                });
                            }else{
                                alert("Sorry '"+proName+"' already exists");
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                        }
                    });
                }
            })
        });
    }
    else{
        alert("Sorry! You are still offline");
    }
}
 
// This function used to load the projects from server. 
function loadServerProjects()
{
    $.get("createFloder.do?mode=1", null, function(data)
    {
        var resdata = eval("("+data+")");
        var serverData = [];
        for(var i=0;i<resdata[0].results[0].projName.length;i++)
        {
            serverData[i]= 
            {
                pName:resdata[0].results[0].projName[i],
                canvas:resdata[0].results[1].canvasImage[i],
                ctxt:resdata[0].results[2].cmmnt[i]
            } 
        }
        loadProjectToListFromServer(serverData);
    });
}
     
//function to create a stage.            
function createStage(){
    layer = new Kinetic.Layer();
    stage = new Kinetic.Stage({
        container: "container",
        width: 700,
        height: 500
    });
}

//Function to save the prject
function saveProject()
{
    var canvasEle = document.getElementById('canvas');
    //                var pId = document.getElementById('prjId').value;
    var pName = document.getElementById('prjName').value;
    var tempInnerImage = [];
    var finaltempInnerImage = [];
    var innerImage = '[{"image":[';
    if(canvasEle != null){
        for(var j = 0;j<imageGroup.length;j++){
            innerImage+='{"name":"'+dumpImageName[j]+'","x":'+imageGroup[j].attrs.x+',"y":'+imageGroup[j].attrs.y+',"width":'+dumpWidth[j]+',"height":'+dumpHeight[j]+',"src":"'+dumpArray[j].src+'"}';
            tempInnerImage[j] ='{"name":"'+dumpImageName[j]+'","x":'+imageGroup[j].attrs.x+',"y":'+imageGroup[j].attrs.y+',"width":'+dumpWidth[j]+',"height":'+dumpHeight[j]+',"src":"'+dumpArray[j].src+'"}';
            if(j!=imageGroup.length-1)
                innerImage+=',';
        }
        innerImage+="]}]";
        var cmt = document.getElementById('comment').value;
        var image = canvasEle.toDataURL('image/png');
        cmt= cmt.toString();
        var data = {
            id:'1',
            //                        pid:pId,
            prjName:pName,
            canvasImg:image,
            cmtxt:cmt,
            img:innerImage
        };
        for(var i in tempInnerImage)
        {
            finaltempInnerImage[i] = tempInnerImage[i].replace('data:image/jpeg;base64,','');
        }
        //        var data1 = innerImage.replace('data:image/jpeg;base64,', '');
        var saveFinalImg;  
        var canv = document.getElementById('canvas');
        for(var i in imageGroup){
            removeAnchor(imageGroup[i],i)
        }
        stage.add(layer);
        stage.draw();
        if(canv != null)
        {
            saveFinalImg = canv.toDataURL("image/png");
            for(var i in imageGroup)
            {
                showAnchor(imageGroup[i],i);
            }
            stage.add(layer);
            stage.draw();
        }
       
        //        var data1 = innerImage.replace('data:image/jpeg;base64,', '');
        //        var data2 = image.replace('data:image/png;base64,', '');
        var mode=0;
        if(navigator.onLine == true)
        {
            try
            {
                $.ajax({
                    type: "POST",   //Default is GET
                    //                cache : false, 
                    //                data:  "data="+data+"&prjName="+pName+"&canvasImage="+image+"&cmt="+cmt+"&mode="+mode+"&innerImage="+innerImage,          //Data you need to send if in JSON format
                    data:  "data="+data+"&prjName="+pName+"&canvasImage="+saveFinalImg+"&cmt="+cmt+"&mode="+mode,          //Data you need to send if in JSON format
                    //                dataType: 'json',     //If json is required
                    //                contentType: 'application/x-www-form-urlencoded',
                    url: "createFloder.do",          //URL you need to pass
                    success: function(value) 
                    {
                        alert("Project is Saved on Server Database");
                        addData(data);
                        dumpWidth = [];
                        dumpHeight = [];
                        //                        $("#downLoadFile").trigger('click');
                        $("#clrPrj").click();
                        saveFinalImg = saveFinalImg.replace("image/png", "image/octet-stream")
                        document.location.href = saveFinalImg;
                        document.body.removeChild(canv);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                    }
                });
            }catch(e)
            {
                alert(e);
            }
        }
        else
        {
            alert("Your are in Offline mode!!So Project is save only in Local drive");
            addData(data);
            dumpWidth = [];
            dumpHeight = [];   
            $("#clrPrj").click();
            saveFinalImg = saveFinalImg.replace("image/png", "image/octet-stream")
            document.location.href = saveFinalImg;
            document.body.removeChild(canv);
        }
    }else{
        var data = {
            id:'1',
            //                        pid:pId,
            prjName:pName,
            canvasImg:image,
            cmtxt:cmt,
            img:innerImage
        };
        addData(data);
        return true;
    }
}   
//For future purpose
function updateTable(pName){
    db.transaction(
        function(query){
            query.executeSql("UPDATE CANVAS SET image=")
        });
}
            
//The function to create the database
function createDatabase() {
    //Vars for database
    var shortName = 'creativecanvas';
    var version = '1.0';
    var displayName = 'Creative Canvas Database';
    var maxSize = 2*1024*1024;
    // create the database
    var createCanvas = openDatabase(shortName, version, displayName, maxSize);
    return createCanvas;
}
            
//Lets make some tables
function createTables(db) {
    db.transaction(
        function(query) {
            //Query to create database
            query.executeSql('CREATE TABLE IF NOT EXISTS CANVAS(uid TEXT,  prjName TEXT NOT NULL UNIQUE, canvas BLOB, image BLOB, context TEXT);');
        });
}
            
//Add data function

function addData(data) {	
    //Open a transaction
    db.transaction(
        function(transaction) {
            //Execute a query against the database
            transaction.executeSql('INSERT INTO CANVAS(uid, prjName, canvas, image, context) VALUES (?,?,?,?,?)', [data.id,data.prjName,data.canvasImg, data.img, data.cmtxt],function(){
                //                    transaction.executeSql('INSERT INTO CANVAS(uid, prjName, canvas, image, context) VALUES (?, ?, ?, ?, ?)', [data.id, data.prjName, data.canvasImg, data.img, data.cmtxt],function(){
                //stage.remove(layer);
                //layer = new Kinetic.Layer();
                //                alert("Project is Saved");
                stage.remove(layer);
                layer = new Kinetic.Layer();
            },
            function(transaction,error){
                alert("Sorry! Project name exists");
                $("#prjD").show(500);
            });
        });
}
//delete data function
function deleteProject(pId){
    db.transaction(function(transaction){
        transaction.executeSql('DELETE FROM CANVAS WHERE prjName = ?',[pId],function(transaction,results){
            //                    transaction.executeSql('DELETE FROM CANVAS WHERE prjid = ?',[pId],function(transaction,results){
            stage.remove(layer);
            layer = new Kinetic.Layer();
            loadProjects();
        });
    });
}
            
function dropTable(){
    db.transaction(function(transaction){
        transaction.executeSql('DROP TABLE CANVAS;',[],function(transaction,results){});
    });
    alert("dropped");
}
//retrieve data function
            
function loadImage(xV,yV,width,height){
    newImgG[globalCount] = new Kinetic.Image({
        x: 0,
        y: 0,
        image: dumpArray[dumpCount],
        width: width,
        height: height,
        name: "image"
    //                    name: dumpImageName[dumpCount]
    });
    initStage(newImgG,Number(xV),Number(yV),width,height);
    globalCount++;
    dumpCount++;
}
//used to load all the projects from the local database

function loadProjects(){
    db.transaction(function(qry){
        qry.executeSql('SELECT * FROM CANVAS',[],function(transaction,results){
            for(var iter=0;iter<results.rows.length;iter++)
            {
                loadPrData[iter]= {
                    uid:results.rows.item(iter)['uid'],
                    pName:results.rows.item(iter)['prjName'],
                    canvas:results.rows.item(iter)['canvas'],
                    img:results.rows.item(iter)['image'],
                    ctxt:results.rows.item(iter)['context']
                }     
            }
            loadedProjects = loadPrData;
            loadProjectToList(loadPrData);
        })
    });
}

//function to load the project in the list
function loadProjectToList(projects){
    loadPrData= [];
    if(projects.length == 0){
        $("#showData")[0].innerHTML = "<div align='center' style='color:red; font-weight:bold;'>No projects!</div>";    
        return;
    }
    $("#showData")[0].innerHTML = "<span>loading</span>";
    var pEle = '<table width="100%">';
    for(var i=0;i<projects.length;i++){
        try
        {
            pEle+='<tr><td><img src="img/arrow-right1.png"/>&nbsp <label class="pList" value="'+projects[i].ctxt+'" key="'+projects[i].pName+'">'+projects[i].pName+'</label><img align="right" src="img/delete-icon.png" class="dIcon"/></td></tr>';
            var img = eval("("+projects[i].img+")");
            img = img[0].image;
            for(var j=0;j<img.length;j++)
            {
                pEle+='<tr><td>&nbsp&nbsp&nbsp&nbsp <label class="pListImage">'+img[j].name+'</label></td></tr>';                    
            }
        //                    pEle+='<tr><td><img src="img/arrow-right1.png"/>&nbsp <label class="pList" key="'+projects[i].pName+'">'+projects[i].pName+'</label><img align="right" src="img/delete-icon.png" class="dIcon"/></td></tr>';
        }catch(e)
        {
        //                        alert(e);
        }    
    }
    pEle += '</table>';
                
    $("#showData")[0].innerHTML = pEle;
    makeStrippyTable($("#showData"));
    var that = null ;
    $(".pList").click(function(){
        stage.remove(layer);
        layer = new Kinetic.Layer();
        $("#comment")[0].value = this.getAttribute('value');
        var pName = this.getAttribute('key');
        this.style.fontWeight = 'bold';
        if(that!=null)
            that.style.fontWeight = 'normal';
        retrData(pName);
        that = this;
    });
 
    var tempThat = null;
    $(".pListImage").each(function(ind){
        $(this).click(function(){
            //this.style.fontWeight = 'bold';
            //if(tempThat != null)
            //    tempThat.style.fontWeight = 'normal';
            //tempThat = this;
            // alert(ind);
            // alert("Image "+imageGroup[ind]);
            imageGroup[ind].moveToTop();
                        
        });
    });
 
    $(".dIcon").click(function(){
        var td = this.parentNode;
        //                    var pID = $(td).find('label').attr('key');
        var pN = $(td).find('label')[0].innerHTML;
        var retVal =confirm('Are you sure to delete "'+pN+'" project ?');
        if(retVal)
            deleteProject(pN);
    });
}
   
function loadProjectToListFromServer(projects){
    try
    {
        //    loadPrData= [];
        if(projects.length == 0){
            $("#showData")[0].innerHTML = "<div align='center' style='color:red; font-weight:bold;'>No projects!</div>";    
            return;
        }
    
        $("#showData")[0].innerHTML = "<span>loading</span>";
        var pEle = '<table width="100%">';
        for(var i=0;i<projects.length;i++){
            try
            {
                //            pEle+='<tr><td><img src="img/arrow-right1.png"/>&nbsp <label class="pList" value="'+projects[i].ctxt+'" key="'+projects[i].pName+'">'+projects[i].pName+'</label><img align="right" src="img/delete-icon.png" class="dIcon"/></td></tr>';
                pEle+='<tr><td><img src="img/arrow-right1.png"/>&nbsp <label class="pList" value="'+projects[i].ctxt+'" key="'+projects[i].pName+'">'+projects[i].pName+'</label></td></tr>';
            //            var img = eval("("+projects[i].img+")");
            //            img = img[0].image;
            //            alert(img);
            //            for(var j=0;j<img.length;j++)
            //            {
            //                pEle+='<tr><td>&nbsp&nbsp&nbsp&nbsp <label class="pListImage">'+img[j].name+'</label></td></tr>';                    
            //            }
            //                            pEle+='<tr><td><img src="img/arrow-right1.png"/>&nbsp <label class="pList" key="'+projects[i].pName+'">'+projects[i].pName+'</label><img align="right" src="img/delete-icon.png" class="dIcon"/></td></tr>';
            }catch(e)
            {
            //            alert("Exception in Load Projects from Server"+e);
            }    
        }
        pEle += '</table>';
        //    var dumpImage = document.createElement('img');
        //    dumpImage.src = projects[0].canvas;
        //        var dumpCanvas = document.getElementById('canvas');
        //        alert(dumpCanvas);
        //        var ctx =dumpCanvas.getContext("2d");
        //    dumpCanvas.appendChild(dumpImage);

        $("#showData")[0].innerHTML = pEle;
        makeStrippyTable($("#showData"));
        var that = null ;
        $(".pList").each(function(ind){
            $(this).click(function(){
                var dumpImage = document.createElement('img');
                dumpImage.src = projects[ind].canvas;
                stage.remove(layer);
                layer = new Kinetic.Layer();
                stage.add(layer);
                stage.draw();
                var canvasEle = document.getElementById('canvas');
                var ctx =canvasEle.getContext("2d"); 
                ctx.drawImage(dumpImage,0,0);
                $("#comment")[0].value = this.getAttribute('value');
                var pName = this.getAttribute('key');
                this.style.fontWeight = 'bold';
                if(that!=null)
                    that.style.fontWeight = 'normal';
                that = this;
            })
        });
 
        var tempThat = null;
        $(".pListImage").each(function(ind){
            $(this).click(function(){
                //this.style.fontWeight = 'bold';
                //if(tempThat != null)
                //    tempThat.style.fontWeight = 'normal';
                //tempThat = this;
                // alert(ind);
                // alert("Image "+imageGroup[ind]);
                imageGroup[ind].moveToTop();
                        
            });
        });
 
        $(".dIcon").click(function(){
            var td = this.parentNode;
            //                    var pID = $(td).find('label').attr('key');
            var pN = $(td).find('label')[0].innerHTML;
            var retVal =confirm('Are you sure to delete "'+pN+'" project ?');
            if(retVal)
                deleteProject(pN);
        });
    }catch(e)
    {
        alert(e);
    }
}   
   
   
   
   
   
   
//to retrieve the specific project data
function retrData(prjid){
    globalCount = 0;
    dumpCount = 0;
    dumpArray = [];
    dumpImageName = [];
    imageGroup = [];
    newImgG = [];
    stage.remove(layer);
    layer = new Kinetic.Layer();
    db.transaction(
        function(transaction){
            try
            {
                transaction.executeSql('SELECT * FROM CANVAS WHERE prjName = ?',[prjid],function(transaction,results){
                    var i =0;
                    dataInfo = {
                        uid:results.rows.item(i)['uid'],
                        //                                pid:results.rows.item(i)['prjid'],
                        pName:results.rows.item(i)['prjName'],
                        canvas:results.rows.item(i)['canvas'],
                        img:results.rows.item(i)['image'],
                        ctxt:results.rows.item(i)['context']
                    };
                    var data = eval("("+dataInfo.img+")");
                    data = data[0].image;
                    for(var k=0;k<data.length;k++){
                        tmpImage(data[k].src,Number(data[k].x),Number(data[k].y),Number(data[k].width),Number(data[k].height));
                    }
                    $('#comment').value = dataInfo.ctxt;
                });
            }catch(e)
            {
                alert("exception is raised in retrieve Data "+e);
            }
        }
        );
}

//used to ccreate temporary image            
function tmpImage(src,x,y,width,height)
{
    x = (x == (undefined || null))?0:x;
    y = (y == (undefined || null))?0:y;
    if(isNaN(width) || isNaN(height))
    {
        width = 200;
        height = 200;
    }
    else
    {
        width = (width == (null || undefined))?200:width;
        height = (height == (null || undefined))?200:height;
    }
    dumpArray[dumpCount] = new Image();
    dumpArray[dumpCount].src = src;
    dumpImageName[dumpCount] = imageName[dumpCount];
    loadImage(x,y,width,height);
}
            
function update(group, activeAnchor,ind) {
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomRight = group.get(".bottomRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    var del = group.get(".del")[0];
    var image = group.get(".image")[0];
                
    // update anchor positions
    switch (activeAnchor.getName()) {
        case "topLeft":
            topRight.attrs.y = activeAnchor.attrs.y;
            bottomLeft.attrs.x = activeAnchor.attrs.x;
            break;
        case "topRight":
            topLeft.attrs.y = activeAnchor.attrs.y;
            bottomRight.attrs.x = activeAnchor.attrs.x;
            
            break;
        case "bottomRight":
            bottomLeft.attrs.y = activeAnchor.attrs.y;
            topRight.attrs.x = activeAnchor.attrs.x;
            
            break;
        case "bottomLeft":
            bottomRight.attrs.y = activeAnchor.attrs.y;
            topLeft.attrs.x = activeAnchor.attrs.x;
            
            break;
   
    }
    
    image.setPosition(topLeft.attrs.x, topLeft.attrs.y);
    del.attrs.y = topRight.attrs.y;
    del.attrs.x = topRight.attrs.x-15;           

    var width = topRight.attrs.x - topLeft.attrs.x;
    var height = bottomLeft.attrs.y - topLeft.attrs.y;
    dumpWidth[ind] = width;
    dumpHeight[ind] = height;
    if(width && height) 
    {
        image.setSize(width, height);
    }
}

function addAnchor(group, x, y,ind) {
    
    var stage = group.getStage();
    var layer = group.getLayer();
    var wid;
    var hei;
    var pos;
    anchor[ind] = new Array(4);
    
    deleteIcon[ind] = new Kinetic.Text({
        x:x-15,
        y:0,
        cornerRadius:1,
        stroke:"red",
        textFill:'#fff',
        fill:'red',
        fontStyle: 'bold',
        name:"del",
        text:'X',
        draggable:true
    });
    deleteIcon[ind].on("mouseover",function(){
        document.body.style.cursor = "pointer";
    }); 
    deleteIcon[ind].on("mouseout",function(){
        document.body.style.cursor = "default";
    }); 
       
    deleteIcon[ind].on("click",function(){
        
        var ret = confirm('Are you sure ?');
        if(ret){
            layer.remove(group);
            // layer.remove(imageGroup[ind]);
            try{
                imageGroup.splice(ind,1);
                dumpImageName.splice(ind,1);
            }
            catch(e){
                alert(e)
            }
        }
    });
    
    for(var i=0;i<4;i++)
    {
        if(i==0)
        {
            wid = 0;
            hei = 0;
            pos = "topLeft";
        }
        else if(i==1)
        {
            wid = x;
            hei = 0;
            pos = "topRight";
        }
        else if(i==2)
        {
            wid = x;
            hei = y;
            pos = "bottomRight";
        }
        else
        {
            wid = 0;
            hei = y;
            pos = "bottomLeft";
        }
            
        var  anchorTemp = new Kinetic.Circle({
            x: wid,
            y: hei,
            stroke: "#666",
            fill: "#ddd",
            strokeWidth: 0,
            radius: 2,
            name: pos,
            draggable: true
        });
        anchorTemp.on("dragmove", function() {
            update(group, this,ind);
            layer.draw();
        });
        anchorTemp.on("mousedown touchstart", function() {
            group.setDraggable(false);
            this.moveToTop();
        });
        anchorTemp.on("dragend", function() {
            group.setDraggable(true);
            layer.draw();
        });
        // add hover styling
        anchorTemp.on("mouseover", function() {
            var layer = this.getLayer();
            document.body.style.cursor = "pointer";
            this.setStrokeWidth(4);
            layer.draw();
        });
        anchorTemp.on("mouseout", function() {
            var layer = this.getLayer();
            document.body.style.cursor = "default";
            this.setStrokeWidth(0);
            layer.draw();
        });
        anchor[ind][i] = anchorTemp;
        group.add(anchor[ind][i]);
        group.add(deleteIcon[ind]);
    }
}
     
// function used to remove anchor     
function removeAnchor(group,ind)
{
    deleteIcon[ind].hide();
    //group.remove(deleteIcon[ind]);
    for(var i=0;i<4;i++)
    {
        //group.remove(anchor[ind][i]);
        anchor[ind][i].hide();
    }
    
}

function showAnchor(group,ind){
    deleteIcon[ind].show();
    //group.remove(deleteIcon[ind]);
    for(var i=0;i<4;i++)
    {
        //group.remove(anchor[ind][i]);
        anchor[ind][i].show();
    }
}
//function used to make table as strippy table
function makeStrippyTable(obj){
    $(obj).find('td').each(function(ind){
        if(ind % 2 == 0 )
        {
            this.style.backgroundColor = '#F9F9F9';    
        }
        else
        {
            this.style.backgroundColor = '#FFFFFF';
        }
                    
    });
}
//ajax call function
function updateOnlineDB(data)
{
    var  xmlhttp;
    
    if (data.length==0)
    { 
        //document.getElementById("txtHint").innerHTML="";
        return;
    }
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            alert(xmlhttp.responseText);
        //document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET","sync.php?data="+data,true);
    xmlhttp.send();
}
