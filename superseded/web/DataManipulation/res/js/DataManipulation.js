/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/********************************This class used to compute the differences *************************************************************/
var formValid;
var isValidrow=true;
var previousElement= "";
var moduleNumber;// this number used to capture the module click. 0 - Data rearrangenmt and 1 - Interpolation 
var chartXYArray;
var interpolationInputArray;
var resInd;
var interpolationRadios;
var deleteAllRows = false;


function NDD(x,y){
    this.x = x;
    this.y = y;
    this.differences = [];
    this.init();
//alert(this.x);
//compute();
//this.compute();
}

NDD.prototype.init = function(){
    this.compute();
}

NDD.prototype.compute = function(){
    //alert(this.x);
    for(var i=0;i<this.y.length;i++){
        if(i==0){
            this.differences.push(this.computeDifference(this.y));
        //alert("diff 0 : "+this.differences);
        }else{
            this.differences.push(this.computeDifference(this.differences[i-1]));
        //alert("diff 1 : "+this.differences);
        }        
    }
    return this.differences;    
}

/**
 * This Method Computes the Difference of the Given two
 */
NDD.prototype.computeDifference = function(z){
    var ME = this;
    var diff = [];
    var d;
    for(var i=0;i<z.length-1;i++){
        d = (z[i+1]-z[i])/(ME.x[i+1]-ME.x[0]);
        diff.push(d);
    }
    return diff;
}

/**
 * This MEthos get the Difference of the Specified Degree
 * @param diff the Degree of the Difference
 * @param ind the index of the Difference
 */
NDD.prototype.getDifference = function(diff,ind){
    //alert(diff);
    diff = !diff?1:diff;
    ind = !ind?0:ind;    
    diff -= 1;
    //alert(this.differences.length);
    //alert('diff index : '+diff +" : "+ind);
    var res = this.differences[diff][ind];
    res = (res == undefined) ? 0:res;
    //alert('get diff : '+res);
    return res;
}

//*********************************End of NDD***********************************/
var radios = [];
var appTab = [];
var cells = [];
var cdRadios = "";
var storecell;
var data;
var inputDiv;
var inputTable = document.createElement('table');
var dialog;
var dataDialog;
var index;
var chooseFlag = false;
var datalength;
var verify = true;
var shortName;
var flag;
var validFlag = false;
var i1 = 0;
var foldCheck = 0;
var temp;
var flodFlag = true;
var distFlag = true;
var copyFlag;
var store = [];
var checker = true;
var checkerFlag1 = true;



/**
 * This is the Object for Applying the Mask over a specified Element
 */
var Mask = {
    showMask : function(div,options)
    {
        var maskDiv = document.createElement('div');
        $(maskDiv).css({
            'position':'absolute',
            'left':$(div).position().left,
            'top':$(div).position().top,
            'width':$(div).outerWidth(),
            'height':$(div).outerHeight(),
            'text-align':'center',
            'background':'url("res/images/loading.gif") no-repeat center black',
            'color':'red'
        });

        $(maskDiv).attr({
            'class':'maskDiv'
        });

        $(maskDiv).html("Loading Please wait...........").fadeTo(0,0.5,null);
        var ele = $(div).parent()[0];
        $(ele).append(maskDiv);
    },
    hideMask : function(div)
    {
        var ele = $(div).parent()[0];
        $(ele).find('.maskDiv').remove();
    }
}
$(function()
{
   
    appTab = $(".AppMenuClass");
    $(appTab).each(function(ind)
    {
        $(this).click(function(){
            changeMenu(ind);
        });
    });
    
});

// This function is used to place the content according to selected case.
function changeMenu(ind)
{
    
    switch(ind)
    {
        case 0:
            $("#AppIntroduction").addClass("active");
            $("#Distributions").removeClass("active");
            $("#InputMode").removeClass("active");
            $("#introduction").show();
            $("#dataInputDiv").hide();
            $("#selectedModule").hide();
            $("#backBtn").hide();
            $("#sub").hide();
            $("#container").hide();
            $("#resultDiv").hide();
            $("#intInput").hide();
            $('#previewDiv').hide();
            $('#prvwLabel').hide();
            $('#inputsDiv').show();
            $('#methods').hide();
            $('#intInput').hide();
            $('#prcd').hide();
            $('#interpolDiv').hide();
            $('#inputArrayValDiv').hide();
            $('#backPrcd').hide();
            $('#chartDiv').hide();
            $('#inputVal').val("");
            clearCheckBoxes();
            break;
        //        case 1:
        //            $("#AppIntroduction").removeClass("active");
        //            $("#Distributions").addClass("active");
        //            $("#InputMode").removeClass("active");
        //            $("#OutputResults").removeClass("active");
        //            $("#introduction").hide();
        //            $("#distSelectDiv").show();
        //            $("#dataInputDiv").hide();
        //            $("#OutputResultsTab").hide();
        //            $("#sub").hide();
        //            $("#FirstImage").hide();
        //            $("#SecondImage").show();
        //            $("#ThirdImage").hide();
        //            $("#FourthImage").hide();
        //            break;
        case 1:
            $("#AppIntroduction").removeClass("active");
            $("#Distributions").removeClass("active");
            $("#InputMode").addClass("active");
            $("#introduction").hide();
            $("#methods").hide();
            //$("#dataInputDiv").hide();
            $("#dataInputDiv").show();
            $("#container").hide();
            // $("#container").show();
            $("#sub").show();
            $("#modules").show();
            $("#btnsDiv").show();
            $("#resultDiv").hide();
            $("#intInput").hide();
            goBack();
            clearRadios();
            break;
    //        case 2:
    //            $("#AppIntroduction").removeClass("active");
    //            $("#Distributions").removeClass("active");
    //            $("#InputMode").removeClass("active");
    //            $("#OutputResults").addClass("active");
    //            $("#introduction").hide();
    //            $("#container").show();
    //            $("#distSelectDiv").hide();
    //            $("#dataInputDiv").show();
    //            $("#sub").show();
    //            //$("#OutputResultsTab").show();
    //            $("#FirstImage").hide();
    //            $("#SecondImage").hide();
    //            $("#ThirdImage").hide();
    //            $("#FourthImage").show();
    //            $("#btnsDiv").hide();
    //            break;
    }
}


//-------------------------------------------------------
$(function()
{
    // loading the Initial Divisions
    radios = $(".inputMode");
    cdRadios = $("#calDiv");
    var indexVal = "";
    clearRadios();

    
    inputDiv = $('#inputDiv')[0];
    //adding The Listeners
    $(radios).each(function(ind)
    {
        $(this).click(function(){
            index = ind;
            //document.getElementById('mydiv').value = index;
            handleInputMode(this,ind);
        });
    });
    opt = $('select[name="distribution"]')[0];
    $(opt).change(function()
    {
        chooseFlag = true;
        var xml = makeXMLObject();
        var dist = "";
        dist = this.value;
        if(dist.length < 1)
        {
            chooseFlag = false;
            $('#dataInputDiv').hide();
            $('#propertiesDiv').hide();
            return;
        }
        //                    $('#dataInputDiv').show();
        $('#propertiesDiv').show();
        xml.open("GET", 'distDataAction.do?distribution='+"Normal", true);
        xml.onreadystatechange = function()
        {
            if(xml.readyState == 4 && xml.status == 200)
            {
                //                            $('.introduceContent').hide();
                var introImageContent = "<img alt='add' src='res/images/Add.png' class='introducation'/>";
                flodFlag = false;
                $('#changeImage').html(introImageContent);
                $('.Distributions').show();
                $('#changeDistImage').html("<img alt='' src='res/images/minus.png' class='dist'/>");
                $('#propertiesDiv').addClass('propertiesCSS');
                $('#propertiesDiv').html(xml.responseText);
                $('#propertiesDiv').append("<table align='center'><tr><td><table border='1' height='60px'><tr><td><table border='0'><tr><td>CDF  F<sub>x</sub>(k)  =  </td><td> <img src='res/images/CDF1.png' alt=''></td></tr></table></td></tr></table></td><td><table border='1' height='70px'><tr><td><table border='0'><tr><td>PDF f(x) =</td><td align='center'> <img src='res/images/PDF1.png' alt=''></td></tr></td></tr></table></td></tr></table></td></tr></table>"
                    +"<table ><tr><td style='Text-align:justify;font-size: 13px;font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif;'>Example for Normal Distribution curve :</td><td align='center'><img src='res/images/normal(pdf).gif' alt=''/></td></tr></table>");
            }
        }
        xml.send(null);
    });
});
//-----------------------------
function makeXMLObject()
{
    return new XMLHttpRequest();
}
//-----------------------------
function hiding()
{
    //                $('.Distributions').hide();
    //                var distImageContent = "<img alt='' src='res/images/dist/Add.png' class='dist'/>";
    distFlag = false;
    //                $('#changeDistImage').html(distImageContent);
    $('#inDiv').hide();
    $('#MYTAB').hide();
    $('#sub').show();
    $('#propertiesDiv').show();
    $('.tabContent').hide();
    $("#InputDescription").show();
    $("#imageDescription").show();
}


/*
*This function hides the show the no the columns section
**/
function hideNoOfColsSection(){
    var mode = $("#modeInterpolation")[0].checked;
    if(mode == true){
        $("#colInput").hide();
        $("#noc").val(2);
        $("#nocBtn").trigger("click");
    }
    else
        $("#colInput").show();
}

//-----------------------------
/**
* This Method handles the change of input Mode 
*/
function handleInputMode(obj,ind)
{
    var content = "";
    switch(ind)
    {
        case 0:
           
            $("#Rawdata").addClass("active");
            $("#Continuous").removeClass("active");
            $("#Copy").removeClass("active");
            $("#Csv").removeClass("active");
            $("#copyandCsv").hide();
            $("#resultDiv").hide();
            hiding();
            hideNoOfColsSection();
            $("#copyDiv").hide();
            //$("#inputDiv").hide();
            $("#InputDescription").html();
            $("#imageDescription").hide();
            $("#btnsDiv").show();
            foldCheck = 0;
            inputDiv.innerHTML = "";
            
            designManualTable(ind);
            hideNoOfColsSection();
            //                        $("#FFF").focus();
            if(moduleNumber == 1)
            {
                $('#noc')[0].value = 2;
                $('#nocBtn').trigger('click');
                $('#colInput').hide();
            }
            checker = true;
            break;
        case 1:
            
            $("#Rawdata").removeClass("active");
            $("#Continuous").removeClass("active");
            $("#Copy").addClass("active");
            $("#Csv").removeClass("active");
            $("#resultDiv").hide();
            hiding();
            $("#sub").show();
            $("#btnsDiv").hide();
            $(".subSelection").html("");
            try
            {
                $('.controlDiv').remove();
            }
            catch(e){
            }
            //                        flag = false;
            $("#InputDescription").html("<p>This mode let you simply copy and paste the data. But the data should be in some Specific Order like<br><br>"
                +"&bull;	The Data Should contain the Numeric Values Only<br>"
                +"&bull;	The data values should be delimited by a 'space' Ex : 1 2 3 4 5.......<br>"
                +"&bull;        If your data didn't meet the Above Requirements then you can't use this Input Mode"
                +"&bull;        <h4 style='color:red'>If you are computing interpolations please ensure that there should be two columns in the format of the data</h4></p>");
            //+"&nbsp;&nbsp;    The Available Data Input Modes are...."
            //                +"<br/>&bull; <span id='CopyPaste1'>Data and Frequency Mode of Data <img src='res/images/correct.png' alt='' id='DataandFrequency' style='display:none;'/></span>"
            //                +"<br/>&bull; <span id='CopyPaste2'>Grouped Frequency Mode of Data <img src='res/images/correct.png' alt='' id='GroupedData' style='display:none;'/></span>"
            //                +"<br/>&bull; <span id='CopyPaste3'>General data (RAW Data) <img src='res/images/correct.png' alt='' id='GeneralData' style='display:none;'/></span>");
            $("#imageDescription").hide();
            $("#copyandCsv").hide();
            content = "Please Enter your data below :<br/><textarea rows='12' cols='60' name='mydata' id='myData' class='required' onclick='PreviewSubmit()'  onkeydown='checkTextArea(event)' ></textarea><br/>";
            $(inputDiv).show();
            inputDiv.innerHTML = content;
            //                        verify = false;
            checker = false;
            foldCheck = 1;
            $('#myData').focus();
            break;
            
        case 2:
            $("#Rawdata").removeClass("active");
            $("#Continuous").removeClass("active");
            $("#Copy").removeClass("active");
            $("#Csv").addClass("active");
            $("#resultDiv").hide();
            hiding();
            $("#copyDiv").hide();
            $("#InputDescription").html("<p>This mode let you upload a large amount of file easily. But the file should be meet the following Requirements<br><br>"
                +"&bull;	The File Should Contain the Numeric Data Only<br>"
                +"&bull;	The file should be a CSV (Comma Separated Values). You can easily make a CSV file Using Microsoft Excel.<br><br></p><br>"
                +"Format of CSV File is... <br><table width='10%' border='1'><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr><tr><td>5</td><td>6</td></tr><tr><td>7</td><td>8</td></tr><tr><td>9</td><td>8</td></tr>\n\
<tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr><td>5</td><td>6</td></tr><td>7</td><td>8</td></tr><td>9</td><td>8</td></tr></table><br><br>");
            $("#imageDescription").hide();
            $("#btnsDiv").hide();
            $("#copyandCsv").show();
            $("#copyandCsv").html();
            $(".subSelection").html("");
            try
            {
                $('.controlDiv').remove();
            }
            catch(e){
            }
            flag = false;
            content = "<input type='file' id='csv' name='csvFile' class='required' onchange='getName(this.value)'/>";
            inputDiv.innerHTML = content;
            verify = false;
            checker = false;
            foldCheck = 2;
            break;
    }
}



//------------------------------------------------------
function checkTextArea(evt)
{
    var key = evt.keyCode;
    
    if( (key<48 || key>57) && (key<96 || key >105) && key!=13 && key!=32 && key!=110 && key!=190 && key!=8 && key!=37 && key!=39 && key!=109 && key!=189 && key!=107 && key!=187 && key!=46 && key!= 67 && key!= 86 && key!= 88)
    {
        evt.preventDefault();
    }
//    if(key==187 || key==189 || key==107 || key==109)
//    {
//        if($(ele).val().length>0)
//        {
//            evt.preventDefault();
//            return;
//        }
//        return;
//    }
}


//------------------------------------------------------
function getName(fname)
{
    flag = true;
    shortName = fname.match(/[^\/\\]+$/);
    var fileExt =  (/[.]/.exec(shortName)) ? /[^.]+$/.exec(shortName) : undefined;
    if(fileExt != "csv")
    {
        alert("Sorry! Please choose the correct file");
        flag = false;
    }
    validFlag = true;
}

//------------------------------------------------------
function preventRow(rowEle)
{
    var dec = new RegExp("^([-0-9]*|[0-9]*\\.\\d?\\d*)$");
    var ele = [];
    $(rowEle).find('input[type=text]').each(function(ind){
        ele[ind] = this.value;
    });
    
    for(var i=0;i<ele.length;i++)
    {
        //alert("element value : "+ele[i]);
        if(ele[i] == ""  || !(dec.test(ele[i]))){
            isValidrow = false;
            break;
        }
        else
            isValidrow =true;
    }
    //alert(isValidrow);
    return isValidrow;
}




/**
* This Method is used to design the Table in the specified mode
*/
//function addRow(val) {
//    if(!formValid.valid()){
//        return;
//    }
//    //    
//    var cell =[];
//    var element = [];
//    var checkBoxEle ;
//    var pe;
//    var ce;
//    
//    for(var i =0 ; i< val+1; i++){
//        try{
//            if(i!= val){
//                cell[i] = row.insertCell(i);
//                element[i]= document.createElement("input");
//                element[i].type = "text";
//                element[i].setAttribute('name','dataTableCell'+i);
//                element[i].setAttribute('class', 'required number');
//                element[i].style.width = table.width/val+'px';
//                
//                //element[i].event.onclick = checkEnter(evt, val, obj, val);
//                pe = ce;
//                ce = element[i];
//                //$(row).append(ce);
//                alert(ce);
//                cell[i].appendChild(element[i]);
//                if(i>0){
//                    nextFocus(pe,ce);
//                }
//                
//                //alert(element[i]);
//                Input.restrictToNumeric(element[i],"");
//                element[i].onclick = function(){
//                    $('#sub').show();
//                }
//            }
//            else{
//                cell[i] = row.insertCell(i);
//                checkBoxEle = document.createElement("input");
//                checkBoxEle.type = "checkbox";
//                checkBoxEle.setAttribute('name','chk');
//                cell[i].appendChild(checkBoxEle);
//            }
//            
//            
//        }catch(e){
//            alert(e);
//        }
//       
//    }
//    previousElement = element;
//    return element;
//}
    
//alert(element);
    
    
    

//    var cell2 = row.insertCell(1);
//    var element2 = document.createElement("input");
//    element2.setAttribute('name','SecondFocus');
//    cell2.appendChild(element2);
//    Input.restrictToNumeric(element2,"");
//    if(val == 2)
//    {
//        var cell3 = row.insertCell(2);
//        var element3 = document.createElement("input");
//        element3.type = "checkbox";
//        element3.setAttribute('name','chk');
//        cell3.appendChild(element3);
//    }
//    if(val ==3)
//    {
//        var cell3 = row.insertCell(2);
//        var element3 = document.createElement("input");
//        element3.setAttribute('name','ThirdFocus');
//        cell3.appendChild(element3);
//        Input.restrictToNumeric(element3,"");
//
//        var cell4 = row.insertCell(3);
//        var element4 = document.createElement("input");
//        element4.type = "checkbox";
//        element4.setAttribute('name','chk');
//        cell4.appendChild(element4);
//        Input.restrictToNumeric(element4,"");
//    }
//    $('input[name="FirstFocus"]').focus();
//    $(function(){
//        if(val == 2)
//        {
//            $(element1).bind('keydown',function(evt)
//            {
//                var key = evt.keyCode;
//                if(key == 13)
//                {
//                    if($(element1).val() >0)
//                    {
//                        $(element2).focus();
//                    }
//                }
//            });
//$(element).blur(function()
//{
//dataValidate(element,$(element).val());
//  });
//            $(element2).bind('keydown',function(evt)
//            {
//                var key = evt.keyCode;
//                if(key==109 || key == 189 || key == 110 || key == 190)
//                {
//                    evt.preventDefault();
//                }
//                if(evt.keyCode == 13)
//                {
//                    if($(element2).val() >0)
//                    {
//                        addRow(2);
//                    }
//                }
//            });
//            $(element2).blur(function()
//            {
//                dataValidate(element2,$(element2).val());
//            });
//        }
//        if(val == 3)
//        {
//            $(element1).bind('keydown',function(evt)
//            {
//                var key = evt.keyCode;
//                if(key == 13)
//                {
//                    if($(element1).val() >0)
//                    {
//                        $(element2).focus();
//                    }
//                }
//            });
//            $(element1).blur(function()
//            {
//                dataValidate1(element1,$(element1).val());
//
//            });
//            $(element2).bind('keydown',function(evt)
//            {
//
//                var key = evt.keyCode;
//                //                if((key<48 || key>57) && (key<96 || key>105) && key!=13 && key!=8 && key!=109 && key!=189 && key!=110 && key!=190)
//                //                {
//                //                    evt.preventDefault();
//                //                }
//                if(evt.keyCode == 13)
//                {
//                    if(parseFloat($(element2).val()) > parseFloat($(element1).val()))
//                    {
//                        $(element3).focus();
//                    }
//                }
//            });
//            $(element2).blur(function(){
//                dataValidate2(element2,$(element2).val(),element1);
//            });
//            $(element3).blur(function(){
//                dataValidate(element3,$(element3).val());
//            });
//            $(element3).bind('keydown',function(evt){
//                var key = evt.keyCode;
//                if(key==109 || key == 189 || key == 110 || key ==190)
//                {
//                    evt.preventDefault();
//                }
//                if(key == 13)
//                {
//                    if($(element3).val() >0)
//                    {
//                        addRow(3);
//                    }
//                }
//            });
//        }
//    });


//------------------------------------------------------end of addrow function-----------
function dataValidate(obj,val)
{
    var dec = new RegExp("^([-0-9]*|[0-9]*\\.\\d?\\d*)$");
    if(!dec.test(val) || val.length == 0)
    {
        alert("Please Enter Correct Values");
        $(obj).focus();
        return false;
    }
    if(val == 0)
    {
        alert("Value Should not be Zero");
        $(obj).focus();
        return false;
    }
    if(val.length >50)
    {
        alert("The Value is Out of Range");
        $(obj).focus();
        return false;
    }
    return true;
}

//------------------------------------------------------End of data validate function
function dataValidate1(obj,val)
{
    var dec = new RegExp("^([-0-9]*|[-0-9]*\\.\\d?\\d*)$");
    if(!dec.test(val) || val.length == 0)
    {
        alert("Please Enter Correct Values");
        $(obj).focus();
        return false;
    }
    if(val.length >50)
    {
        alert("The Value is Out of Range");
        $(obj).focus();
        return false;
    }
    return true;
}

//------------------------------------------------------End of Data validate1 function 
function dataValidate2(obj,val,obj2)
{
    var dec = new RegExp("^([-0-9]*|[0-9]*\\.\\d?\\d*)$");
    if(!dec.test(val) || val.length == 0)
    {
        alert("Please Enter Correct Values");
        $(obj).focus();
        return false;
    }
    if(val == 0)
    {
        alert("Value Should not be Zero");
        $(obj).focus();
        return false;
    }
    if(val.length >50)
    {
        alert("The Value is Out of Range");
        $(obj).focus();
        return false;
    }
    if(parseFloat($(obj2).val()) >= parseFloat($(obj).val()))
    {
        alert("Upper Limit should greater than the Lower limit");
        $(obj).focus();
        return false;
    }
    return true;
}
//------------------------------------------------------


//This function is used to delete the selected rows 
function delRow(val){
    try{
        var table = document.getElementById('dataTable');
        var rowcount = table.rows.length;
        //        alert(rowcount);
        for(var x=0;x<rowcount;x++){
            if(table.rows[x].cells[val].childNodes[0].checked == true){
                table.deleteRow(x);
                rowcount--;
                x--;
            }
        //alert(val);
        // table.rows[0].cells[val].childNodes[0].checked = false;
        }
    }
    catch(e){
        alert(e);
    }
}
//------------------------------------------------------
/**
*This function used to check all the check boxes.
*/
function checkAll(val){
    var allchek = document.getElementsByName('allChk')[0];
    var table = document.getElementById('dataTable');
    //    alert(table);
    //    alert("Checked value : "+allchek.checked);
    //    alert("table rows : "+table.rows.length);
    if(allchek.checked == true){
        for(var i=0;i<table.rows.length;i++)
        {
            //alert(table.rows[i].cells[10].childNodes[0].checked);
            table.rows[i].cells[val].childNodes[0].checked = true;    
        }
    }
    else if(allchek.checked ==false){
        for(var j=0;j<table.rows.length;j++)
        {
            //alert(table.rows[i].cells[10].childNodes[0].checked);
            table.rows[j].cells[val].childNodes[0].checked = false;    
        }
    }
}
//**********************************end of the function check all **********//
//This function used to delete all the rows in table input data mode
function delAllRows()
{
    try
    {
        var table = document.getElementById('dataTable');
        var rowCount = table.rows.length;
        for(var i =0;i<rowCount;i++)
        {
            table.deleteRow(i);
            rowCount--;
            i--;
        }
        deleteAllRows = true;
    }
    catch(e){
        alert("error while deleting : "+e);
    }
}


//------------------------------------------------------
function checkEnter(evt,value,obj,val)
{
    Input.restrictToNumeric(obj,"");
    alert(evt.keyCode);
    if(evt.keyCode ==109 || evt.keyCode == 189 || evt.keyCode == 110 || evt.keyCode == 190)
    {
        evt.preventDefault();
    }
    if(evt.keyCode == 13)
    {
        if(dataValidate(obj,val)==true)
        {
            addRow(value);
        }
    }
}

// This function is used to design the manual table
function designManualTable(ind)
{
    //ind = 1;
    var content = "";
    var cnt="";
    cnt+="<p id='colInput' style='font-weight: bold;'>Please enter the number of columns you want to enter:"+
    "<input type='text' style='width:50px' id='noc' class='required number'/>"+
    "<input type='button' id='nocBtn' value='Submit'/><br>"+
    "</p>";
    $('#InputDescription').html(cnt);
    if(ind == 0)
    {
        var noOfColBtn = document.getElementById('nocBtn');
        var addRowBtn = document.getElementById('addRow');
        var delRowBtn = document.getElementById('delRow');
        var delAllRowBtn = document.getElementById('delAllRow');
        //alert(document.getElementById('noc').value);
        //alert($(noOfColBtn).attr('value'));
        
        $("#noc").keydown(function(evt){
            if(evt.keyCode ==13){
                getTable(parseInt(document.getElementById('noc').value));
            }
        });
        
        /*
*Add row button click event.
**/
        addRowBtn.onclick = function(){
            //alert(previousElement);
            var count;
            var tbody = $('#dataTable').find('tbody');
            var prevEleCheck ;
            
            if(deleteAllRows == true){
                prevEleCheck = true;
                $('#dataTable').show();
            }
            else
                prevEleCheck = preventRow(previousElement);
            
            if(prevEleCheck)
            {
                count = parseInt(document.getElementById('noc').value);
                var row = createRow(count);
                tbody.append(row)
                registerRow(row,count); 
                previousElement = row;
            }
            else{
                alert("Please enter the correct values");
            }
           
        }
        
       
        
        // registering event to delete rows 
        delRowBtn.onclick = function(){
            delRow(parseInt(document.getElementById('noc').value));
        }
        // registering event to capture no of columns 
        noOfColBtn.onclick = function(){
            var rEx = new RegExp("-");
            var nocVal = $('#noc')[0].value;
            if(nocVal == 0 || nocVal == '0' || rEx.test(nocVal)) 
                return;
            getTable(parseInt(document.getElementById('noc').value));
        }
        //registering event to delete all the rows
        delAllRowBtn.onclick = function(){
            delAllRows();
            $('#dataTable').hide();
        }
                
    }
    //        "<input type='button' value='Delete Row' onclick='deleteRow(2)'/>";
    verify = true;
    validFlag = true;
}


function getTable(val){
    try{
        if(!$('form').valid())
            return
    }catch(e){
        alert(e)
    }
            
    var content="";
    content+=
    "<table id='dataTable'  border='1'>"+
    "<tbody>";
    //            for(var j=0;j<val+1;j++)
    //            {
    //                if(j!=val)
    //                    content+="<th>"+(j+1)+"</th>";
    //                else
    //                    content+="<td><input type='checkbox' name='allChk' onclick='checkAll("+val+");' /></td>";
    //            }
    
    content+="<tr>";
    for(var i=0; i<val;i++)
    {
        content+= "<td class='cell'><input type='text' name='dataTableCell"+i+"' onclick='PreviewSubmit()'/></td>";
    }
            
    content+="<td><input type='checkbox' name='chk' /></td>";
    content+="</tr>";
    content+="</tbody>";
    content+="</table>";
    var ele =[];
    $(inputDiv).html(content);
    
    $('#dataTable').find('input').each(function(ind){
        ele[ind]=this;
        Input.restrictToNumeric(ele[ind],"");
    });
    
    
    var row  = $('#dataTable').find('tr');
    var pEle,nEle;
    for(var x=0;x<ele.length-1;x++)
    {
        pEle = nEle;
        nEle = ele[x];
        if(x>0)
            nextFocus(pEle, nEle);
    }
   
    //alert(row);
    registerRow(row,val);
    previousElement = row[0];
    datalength = val;
    $(row).find('input[type=text]:first').focus();
}



/**
* This Metjhod Create a new Row with the  specified no fo Columns
*/
function createRow(cols){
    var row = document.createElement('tr');
    var pEle,cEle;    
    for(var i=0;i<cols;i++){
        pEle = cEle;
        cEle = createElement();
        var cell = document.createElement('td');
        $(cell).append(cEle);
        $(row).append(cell);
        if(i>0){
            nextFocus(pEle, cEle);
        }
    }
    cell = document.createElement('td');
    $(cell).append(createElement('checkbox','chk'));
    $(row).append(cell);
    
    return row;
}

function createElement(type,name){
    type = !type?"text":type;
    var ele = document.createElement('input');
    $(ele).attr({
        'type':type,
        'name':name
    });
    Input.restrictToNumeric(ele, "");
    return ele;
}

/*
*The function create table 
***/
function init()
{
    tbody = $('#inputTab').find('tbody');
    pRow = cRow;
    cRow = createRow(4);
    $(tbody).append(cRow);
    registerRow(cRow);
}


/**
*this function get the focus to the next text box
*/

function nextFocus(srcEle,destEle){
    $(srcEle).keydown(function(evt){
        if(evt.keyCode == 13)
            destEle.focus();
    });
}

/**
*This function register the key down event for enter key
*/
function registerRow(row,len){
    var tbody= $('#dataTable').find('tbody');
    //alert($(row).find('input[type="text"]:last').length);
    
    $(row).find('input[type="text"]:last').keydown(function(evt){
        //alert('hi');        
        //alert("Registering new "+tbody);
        if(evt.keyCode == 13)
        {
            // alert(previousElement);
            var preChk = preventRow(previousElement);
            if(preChk){
                //       alert(preChk)
                var newRow = createRow(len);
                $(tbody).append(newRow);
                registerRow(newRow,len);
                $(newRow).find('input["type=text"]:first').focus();  
                //alert("row element : "+previousElement);
                previousElement = newRow;
            }
            else{
                alert("Please enter the correct inputs");
            }
            
        //nextFocus($(pRow).find('input:last'), $(cRow).find('input:first'));
        }
    //previousElement = newRow;
    });
}



/*
*this function is call before submit a form
*which verifies the all kind of verifications.
*/

//------------------------------------------------------
function upperLower(obj,val)
{
    if(parseFloat($("#FFF").val())>= parseFloat(val))
    {
        alert("Upper value should be greater than Lower value");
        $(obj).focus();
        return ;
    }
}
//------------------------------------------------------End of upperLower function------------//

function addRowEnterEvent(evt,ele)
{
    var key = evt.keyCode;
    ele[datalength].onkeydown = function(){
        alert("hi");
    }    
}


function moveNext(evt,value,obj,val)
{
    Input.restrictToNumeric(obj,"");
    var key = evt.keyCode;
    if((key<48 || key>57) && (key<96 || key>105) && (key!=13) && key!=110 && key!=190 && key!=109 && key!=189 && key!=8 && key == 46 && key == 37 && key == 39)
    {
        evt.preventDefault();
    }
    // alert(datalength);

    if(evt.keyCode == 13)
    {
        if(value == 1)
        {
            if(dataValidate(obj,val)==true)
            {
                $('#DataValueSec').focus();
            }
        }
        else if(value == 2)
        {
            if(dataValidate1(obj,val)==true)
            {
                $('#GroupedSec').focus();
            }
        }
        else
        {
            if(parseFloat($("#FFF").val())>= parseFloat($('#GroupedSec').val()))
            {
                alert("Upper value should be greater of Lower value");
                $(obj).focus();
                return false;
            }
            $('#GroupedThr').focus();
        }
    }
}
//------------------------------------------------------End of move next function
function getSubmit()
{
    //alert("Testing Validation");
    try{
        if(!$('form').valid())
            return ;   
    }
    catch(e){
        alert(e);
    }
    // alert("input type of mode : "+foldCheck);
    //    if(chooseFlag == false)
    //    {
    //        alert("Please select any one distribution");
    //        return false;
    //    }
    //    if(flag == false)
    //    {
    //        alert("Sorry!!! Please give correct datapoints");
    //        return false;
    //    }
    //    else if(validFlag == false)
    //    {
    //        alert("Please provide inputs");
    //        return false;
    //    }
    //else{
        
    $('#MYTAB').show();
    //                    $('#propertiesDiv').hide();
    //        if(foldCheck == 0)
    //        {
    //            $('#row3').show();
    //            $('#rrow3').show();
    //            $('#rrr3').show();
    //            $('#row1').hide();
    //            $('#rrow1').hide();
    //            $('#rrr1').hide();
    //            $('#row2').show();
    //            $('#rrow2').show();
    //            $('#rrr2').show();
    //            $('#myInterval').show();
    //        }
    //        if(foldCheck == 1)
    //        {
    //            $('#row3').hide();
    //            $('#rrow3').hide();
    //            $('#rrr3').hide();
    //            $('#myInterval').hide();
    //            $('#row1').hide();
    //            $('#rrow1').hide();
    //            $('#rrr1').hide();
    //        }
    //        if(foldCheck == 2)
    //        {
    //            $('#row3').show();
    //            $('#rrow3').show();
    //            $('#rrr3').show();
    //            $('#row1').show();
    //            $('#rrow1').show();
    //            $('#rrr1').show();
    //            $('#myInterval').show();
    //        }
    //        if(foldCheck == 3)
    //        {
    //            $('#row3').show();
    //            $('#rrow3').show();
    //            $('#rrr3').show();
    //            $('#row1').show();
    //            $('#rrow1').show();
    //            $('#rrr1').show();
    //            $('#myInterval').show();
    //        }
        
    //alert($('#modules')[0]);
    $('#modules').show(1000);
    $('#sub').hide(1000);
    ///alert($('#modeDr')[0]);
    //alert($('#modeInterpolation')[0]);
        
    if(checker == true){
                
        var storeData=[] ;
        var table = document.getElementById('dataTable');
        var rowCount = table.rows.length;
            
        storeData = new Array();
        for(var x=0;x<=rowCount;x++){
            storeData[x]= new Array(datalength);
        }
            
        var i =0;
        //alert(rowCount);
        //alert("No of Columns: "+datalength);
        //            alert("store ["+rowCount+"]["+datalength+"]");
        //            
        for(var rc=0;rc<rowCount;rc++){
            for(var cc=0;cc<datalength;cc++){
                storeData[rc][cc]= table.rows[rc].cells[cc].childNodes[0].value;
            }
        }
                        
        //            $("#dataTable").find('tr').each(function(){
        //                $(this).find('td').each(function(){
        //                    if($(this).find('input').val()!= "on")
        //                    {        
        //                        storeData[i] = $(this).find('input').val();
        //                        i++;
        //                    }
        //                });
        //            });
        //            
            
            
            
        for(var j=0;j<i;j++)
        {
            if(storeData[j] == "")
            {
                alert("Please Provide Inputs");
                return false;
            }
        }
        if(storeData == "" && verify == true)
        {
            alert("Please Provide Inputs");
            return false;
        }
    }
    if(storeData!="")
    {
        temp = storeData;
    }
        
//renderOutPutTable(storeData,datalength,rowCount);
//transposeArray(rowCount, datalength, storeData);
//storeData = temp;
//$('#sub').hide();
//alert('in js ');
//alert("Data : "+storeData);
//alert("No of columns : "+datalength);
//alert("grouped Data: "+verify);
// alert(" "+copyFlag);
//changeMenu(3);
        
//document.forms[0].action="dataManipulation.do?storecell="+store+"&data="+datalength+"&verify="+verify+"&copyFlag="+copyFlag;
//document.forms[0].submit();
//flag = true;
// }
}//------------------------------------------------------End of Getsubmit function

// This method used to retrieve the data in the form of 2 arrays and one 2d array for the modes manual, copy & paste,file upload method

function retrieveData(method,handler)
{
    //alert(method);
    //alert("Type of mode selected : "+foldCheck);
    var data="";
    var regEx = new RegExp("[!@#$%^&*()]");
    if(method == 0)//Manually data entry mode.
    {
        var storeData=[] ;
        var table = document.getElementById('dataTable');
        var rowCount = table.rows.length;
        
        //alert("Row count : "+rowCount);
        // alert("DataLength count : "+datalength);
        validateDataFields();
        storeData = new Array();
        for(var x=0;x<rowCount;x++){
            storeData[x]= new Array(datalength);
        }
            
        for(var rc=0;rc<rowCount;rc++){
            for(var cc=0;cc<datalength;cc++){
                storeData[rc][cc]= table.rows[rc].cells[cc].childNodes[0].value;
                if(storeData[rc][cc] == "" || regEx.test(storeData[rc][cc]) || storeData[rc][cc] == undefined){
                    alert("Data is in invalid format");
                    return;
                }
            }
        }
        
        data = storeData;   
    }
    else if(method == 1)//Copy & Paste mode
    {
        var dataOfCopy = $("#myData").val();
        //alert("Data in the text box : "+dataOfCopy);
        validFlag = true;
        flag = true;
        var bfd = new RegExp("^[0-9]$");
        if(dataOfCopy[0] == " ")
        {
            alert("Is not a valid Data");
            flag = false;
            return;
        }
        for(var i=0;i<dataOfCopy.length;i++)
        {
            if(dataOfCopy[i] == ".")
            {
                if(!(bfd.test(dataOfCopy[i+1]) || bfd.test(dataOfCopy[i-i])))
                {
                    alert("Is not a valid data");
                    flag = false;
                    return;
                }
            }
            if(dataOfCopy[i] == "-" || dataOfCopy[i] == "+")
            {
                if(!bfd.test(dataOfCopy[i+1]))
                {
                    alert("Is not a valid data");
                    flag = false;
                    return;
                }
            }
        }
        var rCount = 0;
        var temp = false;
        var Tcount = 0;
        var storeCopyData = [];
        var splitData = dataOfCopy.split(/\n/);
        //alert("splited data : "+splitData);
        for(var ij in splitData)
        {
            if(splitData[ij] != "")
            {
                rCount++;
            }
        }
        //        alert("no. of rows : "+rCount);
        //alert("no. of columns : "+colCount);
   
        var store = [];
    
        for(var ar =0 ;ar<rCount;ar++)
        {
            store[ar] = new Array();
        }
    
        for(var k in splitData)
        {
            var count = 0;
            var spaceRemove = splitData[k].split(" ");
            //alert(spaceRemove);
            for(var j in spaceRemove)
            {
                if(spaceRemove[j] != "")
                {
                    storeCopyData[Tcount] = spaceRemove[j];
                    store[k][j]= spaceRemove[j];
                    count++;
                    Tcount++;
                }
            }
            if(count>3 || count==1)
            {
                temp = true;
            }
        }
        var colCount = Tcount/rCount;
        
        for(var xy = 0;xy<store.length;xy++){
            for(var yz = 0 ;yz<store[0].length;yz++){
                if(store[xy][yz] == undefined || regEx.test(store[xy][yz])){
                    alert("Data is in invalid format");
                    return;
                }
            }
        }
        data = store;
    }
    else if(method == 2)//Upload mode
    {
        //alert('in file upload mode');
        
        //alert(document.getElementById('csv').value);
        
        document.forms[0].action="dataManipulation.do?";  
        document.forms[0].submit();
        //$.get("dataManipulation.do", null, function(ajaxData){
        //     alert("ajax Data: "+ajaxData);
        // }, null);
        data = loadIframe(handler);
        //alert("csv data : "+data);
        for(var xyz = 0;xyz<store.length;xyz++){
            for(var yzx = 0 ;yzx<store[0].length;yzx++){
                if(data[xyz][yzx] == undefined || regEx.test(data[xyz][yzx])){
                    alert("Data is in invalid format");
                    return;
                }
            }
        }
       
    }
    return data;
}



function loadIframe(handler)
{
    var data ;
    $('#iframe2').load(function(){
        //alert('hi in iframe onload');
        var dataCsv = $(this).contents().text();
        //alert(dataCsv);
        dataCsv = eval("("+dataCsv+")");
        //alert("Length of  the data : "+data.length);
        try{
            // alert(dataCsv);
            //            data = transpose2DArray(dataCsv);
            data = dataCsv;
        //            alert("length of the array columns :"+data[0].length);
        }
        catch(e){
            alert(e);
        }
        handler(data);
    //alert("Data in csv in the forn of 2 d array is "+data);
    });
    alert(data);
    
    return data;
}

/**
*
*Registering the events for the methods
*/
$(function(){
    formValid = $('form').validate(
    {
        rules: {
            csvFile:{
                required:true  
            },
            mydata:{
                required:true
            }
        },
        messages: {
            csvFile: {
                required: "Field Required."
            },
            mydata:{
                required: "The field should not be blank"
            }
        },
        errorPlacement: function(error, element) 
        {
            //alert("Validation");
            var span = error;
            //alert("Element is : "+span);
            var pos = $(element).position();                                    
            $(span).css({
                'position':'absolute',
                'padding':'1px',
                'font-size':'11px',
                'background':'red',
                'color':'white',
                'border':'red',
                '-webkit-border-radius':'2px',
                '-webkit-box-shadow':'3px 3px 3px black',
                'display':'inline-block',
                'float':'left',
                'left':pos.left+$(element).outerWidth(),
                'top':pos.top
            });
            //alert("Testing: "+element[0]);
            $(span).appendTo(element.parent());
        //alert($(error).outerHeight(true));
        //error.appendTo( element.parent() );
        },
        success: function(label){
            $(label).remove();
        }
    });
  
    
    // when the user click on the interpolation radio button
    $('#modeDr').click(function(){
        //alert('hi');
        var cnt = "<h4>Please choose one of the method to Arrange data :</h4>"+
        "<input type='radio' class='drd' name='drd' id='dra' value='arrangement' class='required' />Tabular Manipulation"+
        "<input type='radio' class='drd' name='drd' id='trans' value='Transpose' class='required' />Transpose";
        moduleNumber = 0;
        foldCheck = 0;
        handleInputMode(null, foldCheck);
        $('#selectedModule').html("<h2>Data Re-Arrangement</h2>");
        $('#selectedModule').show();
        $('#container').show();
        $('#resultDiv').hide();
        $('#backBtn').show();
        $('#methods').html("").append(cnt);
        $('#methods').hide();
        $('#modules').hide();
        $('#colInput').show();
        $('#sub').show();
        $('#inputDiv').show();
        $('#inputsDiv').show();
        $('#dragOut').hide();
        $('#interpolDiv').hide();
        $('#modules').hide();
        $('#previewDiv').hide();
        $('#prvwLabel').hide();
        //        $("#inputDiv").html("");
        //alert($('#inputDiv')[0]);
        //alert($('#myData'));
        
        //        $('#inputDiv').show();
        
        $('#noc').val("");
        $('#dra').click(function(){
            $('#resultDiv').hide();
            $('#inputDiv').show();
        });
        $('#trans').click(function(){
            $('#resultDiv').hide();
            $('#inputDiv').show();
        });
    //alert($('#noc').val());
    });
    // when the user click on the interpolation radio button
    $('#modeInterpolation').click(function(){
        var cnt = "<h4>Please choose one of the method to interpolate data :</h4>"+
        "<table><tr><td><input type='checkbox' class='interpolation' name='interpolation' id='linear' value='Linear Interpolation' class='required' />Linear Interpolation</td></tr>"+
        "<tr><td><input type='checkbox' class='interpolation' name='interpolation' id='poly' value='Polynomial Interpolation' class='required' />Polynomial Interpolation "+
        "<div id='degreeDiv' style='display: none;'>"+
        "Please enter the degree of the polynomial:  <input type='text' id='deg' class='required number' style='width: 20px;'/>"+
        "</div></td></tr>"+
        "<tr><td><input type='checkbox' class='interpolation' name='interpolation' id='lagranges' value='Lagranges Interpolation' class='required' />Lagrange's Interpolation</td></tr>"+
        "<tr><td><input type='checkbox' class='interpolation' name='interpolation' id='NDD' value='Newtons DD Interpolation' class='required' />Newton Divide & Difference Interpolation</td></tr>"+
        "</table>";
        moduleNumber = 1;
        foldCheck = 0;
        handleInputMode(null, foldCheck);
        $('#selectedModule').html("<h2>Data Interpolation</h2>");
        $('#selectedModule').show();
        $('#container').show();
        $('#resultDiv').hide();
        $('#backBtn').show();
        //$('#resultDiv').html("");
        $('#methods').html("").append(cnt);
        $("#methods").hide();
        //$('#methods').hide(300).show(1000);
        $('#modules').hide();
        $('#sub').show();
        //$('#intInput').hide();
        $('#inputsDiv').show();
        $('#previewDiv').hide();
        $('#prvwLabel').hide();
        $('#interpolDiv').hide();
        $('#inputDiv').show();
        $('#noc').val(2);
        $('#nocBtn').trigger('click');
        $('#colInput').hide();
        
        
        $('#poly').click(function(){
            
            if(this.checked == true){
                $('#degreeDiv').show(500);
                $('#deg')[0].value = "";
            }
            else
                $('#degreeDiv').hide(500)
            $('#inputDiv').show();
            
        });
        $('#linear').click(function(){
           
            $('#inputDiv').show();
        });
        $('#lagranges').click(function(){
            
            $('#inputDiv').show();
        });
        $('#NDD').click(function(){
           
            $('#inputDiv').show();
        });
        
        
    //alert($('#noc').val());
    });
    
    //alert("i frame:  "+$('#iframe2')[0]);
   
    
    //alert("element : "+$('#intInput')[0]);
    //when the user clicks on one of the interpolation methods
    
   
    
    $('#calculate').click(function(){
        var myData;
        try{
            if(!$('form').valid())
                return
        }
        catch(e){
            alert("Error while validaing form : "+e)
        }
        try
        {
            if(foldCheck == 2)
            {
                retrieveData(foldCheck,function(da){
                    myData = da;
                    chooseMethod(myData);
                });
            }
            else
            {
                myData = retrieveData(foldCheck);
                chooseMethod(myData);
            }
        }
        catch(e){
        //alert("error while fold check "+e);
        }
    });
    
    
    
    
    
    /*
*Event Listenter for preview button to show the data preview
**/
    $('#sub').click(function(){
        var pData;
        
        if(foldCheck == 2)
        {
            retrieveData(foldCheck,function(da){
                pData = da;
                if(moduleNumber == 1)
                {
                    pData = sort2dArray(pData);
                    $('#previewDiv').html(makeTable(pData));
                }
                else
                    $('#previewDiv').html(makeTable(pData));
                
                
                $('#previewDiv').show();
                $('#prvwLabel').show();
                $('#prviewBtnsDiv').show();
                $('#prcd').show();
                $('#backPrcd').show();
                $('#sub').hide();
                $('#inputsDiv').hide();
                $('#resultDiv').hide();
            });
        }
        else 
        {
            pData = retrieveData(foldCheck);
            if(moduleNumber == 1)
            {
                pData = sort2dArray(pData);
                $('#previewDiv').html(makeTable(pData));    
            }
            else
                $('#previewDiv').html(makeTable(pData));
            
            DOMElement.makeAsStrippyTable($('#pTable'),{
                CSS:'strippyTable'
            });
            $('#previewDiv').show();
            $('#prvwLabel').show();
            $('#prviewBtnsDiv').show();
            $('#prcd').show();
            $('#backPrcd').show();
            $('#sub').hide();
            $('#inputsDiv').hide();
            $('#resultDiv').hide();
        }
    });
    
    /*
*Event listener for  array of values.
*/
    $('#inputArray').click(function(){
        if(this.checked == true)
        {
            $('#inputArrayValDiv').show(500);
            $('#inputValDiv').hide(500);
        }
        else{
            $('#inputArrayValDiv').hide(500);
            $('#inputValDiv').show(500);
        }
    });
    
    /*
*Event listener for the proceed button after the previewing the data 
*/
    $('#prcd').click(function(){
        $('#methods').show();
        $('#intInput').show();
        if(moduleNumber == 1){
            $('#interpolDiv').show();
            $('#inputValDiv').show();
            $('#inputVal').val("");
            $('#inputArray')[0].checked = false;
        }
    });
    
    $('#backPrcd').click(function(){
        $('#previewDiv').hide();
        $('#prvwLabel').hide();
        $('#sub').show();
        $('#inputsDiv').show();
        $('#resultDiv').hide();
        $('#methods').hide();
        $('#intInput').hide();
        $('#prcd').hide();
        $('#degreeDiv').hide();
        $('#interpolDiv').hide();
        $('#inputArrayVal')[0].value = "";
        $('#inputArrayValDiv').hide();
        $('#backPrcd').hide();
        $('#chartDiv').hide();
        $('#inputVal').val("");
       
        clearCheckBoxes();
        
        
    });
    /*
* Event listener for back to applications button
**/ 
    $('#backBtn').click(function(){
        $('#modules').show();
        $('#container').hide();
        $('#methods').hide();
        $('#resultDiv').hide();
        $('#interpolDiv').hide();
        $('#inputArrayValDiv').hide();
        $('#intInput').hide();
        $('#chartDiv').hide();
        $('#inputsDiv').hide();
        $('#prviewBtnsDiv').hide();
        $('#inputVal').val("");
        $('#selectedModule').hide();
        $(this).hide();
        clearCheckBoxes();
        $('#inputArray')[0].checked = false;
        
    });
    
    /*
*
**/
    try{
        //alert(document.getElementById('chartDiv'));
        $("#getChart").click(function(){
            var interpolationChart = new google.visualization.LineChart(document.getElementById('chartDiv'));
            //alert(interpolationChart);
            var googleLineChart = new GoogleChart(interpolationChart);
            //            var data1 = [[4,2,3,4,6],[6,6,3,4,7],[7,8,3,4,8]];
            var da = new google.visualization.DataTable();
            
            
            for(var x=0;x<resInd.length;x++)
            {
                for(var y=0;y<resInd[0].length;y++)
                {
                    if(resInd[x][y] == undefined )
                        resInd[x][y] = NaN;
                }
            }
            //alert(resInd);
            // var data  = []
            var dataD  = []
            //            for(var xy = 0;xy<resInd[0].length;xy++){
            //                data.push([parseFloat(interpolationInputArray[xy]),resInd[0][xy],resInd[1][xy],resInd[2][xy],resInd[3][xy]]);
            //            }
            
            
            var dataX = [];
            var dataY1 = [];
            var tmp;
            //            alert("X [0] : "+chartXYArray[0].length);
            //            alert("X :  "+chartXYArray.length);
            
            
            for(var chartX1=0;chartX1<interpolationInputArray.length;chartX1++){
                dataX.push(interpolationInputArray[chartX1]);
            }
            for(var chartY=0;chartY<interpolationInputArray.length;chartY++){
                dataY1.push(NaN);
            }
            
            for(var chartX =0 ;chartX<chartXYArray.length;chartX++)
            {
                dataX.push(chartXYArray[chartX][0]);
                dataY1.push(chartXYArray[chartX][1]);
                tmp++;
            }
            //alert(dataX);
            //alert(dataY1);
            
            //alert("y Array : "+dataY1);
            // var legndStrng ="[{name:'',type:'number'}" ;
            //            for(var legnd= 0;legnd<interpolationRadios.length;legnd++)
            //            {
            //                if(interpolationRadios[legnd].checked == true)
            //                {
            //                    //                    legndStrng += "{"+
            //                    //                    "name:"+"'"+interpolationRadios[legnd].value+"',"+
            //                    //                    "type:'number'},";
            //                    dataY1 = resInd[legnd];
            //                    tmp= legnd;
            //                    break;
            //                }
            //            }
            
            for(var sss = 0 ;sss<dataX.length;sss++)
            {
                dataD.push([parseFloat(dataX[sss]),parseFloat(dataY1[sss])]);
            }
            
            
            //alert("chart data : "+dataD);
            var Options = {
                title: 'Interpolation',
                vAxis : {
                    title:'Interpolated Values'
                },
                hAxis : {
                    title:'Inputs'
                },
                pointSize:5
            };
            //            var data2 = [1,2,3];
            //            alert(data1);
            //            alert(data2);
            //            alert(interpolationResultArray);
            //            alert(chartXYArray);
            googleLineChart.drawChart([{
                name:'Input',
                type:'number'
            },
            {
                name:'Input Data',
                type:'number'
            }
            //            ,{
            //                name:'Polynomial',
            //                type:'number'
            //            },{
            //                name:'Lagrangian',
            //                type:'number'
            //            },{
            //                name:'NDD',
            //                type:'number'
            //            },
            ],dataD,Options);  
            for(var legndX= 0;legndX<interpolationRadios.length;legndX++)
            {
                if(interpolationRadios[legndX].checked == true)
                {
                    googleLineChart.addNewColumn({
                        name:interpolationRadios[legndX].value,
                        type:'number'
                    }, resInd[legndX], false);
                   
                }
            }
        //            googleLineChart.addNewColumn({
        //                name:'',
        //                type:'number'
        //            },data2,true);   
        });  
    }catch(e){
        alert("Exception is"+e);
    }
});


/**
*Clear all check boxes
**/



/*
* this function is called when click on "back" button in iframe
*/
function goBack()
{
    //                $('#inputDiv').show();
    $('#sub').show();
    //                $('#propertiesDiv').show();
    $("#dataInputDiv").show();
    $("#OutputResultsTab").hide();
    $("#FirstImage").hide();
    $("#SecondImage").hide();
    $("#ThirdImage").show();
    $("#FourthImage").hide();
    $("#AppIntroduction").removeClass("active");
    $("#Distributions").removeClass("active");
    $("#InputMode").addClass("active");
    $("#OutputResults").removeClass("active");
    $('#MYTAB').hide();
    $('#iframe1').innerHtml = "";
    $('#iframe2').innerHtml = "";
    $('#iframe3').innerHtml = "";
    $('#iframe1').hide();
    $('#iframe2').hide();
    $('#iframe3').hide();
    $('#myButton1').hide();
    $('#myButton2').hide();
    $('#myButton3').hide();
    $('#myInterval').hide();
    $('#myProceed1').hide();
    $('#myProceed2').hide();
    $('#myProceed3').hide();
    $('#firstIframe').innerHtml = "";
    $('#secondIframe').innerHtml = "";
    $('#thirdIframe').innerHtml = "";
    $('#firstIframe').hide();
    $('#secondIframe').hide();
    $('#thirdIframe').hide();
    $('.tabContent').hide();
}//------------------------------------------------------End of Go back function

//*
// This fucntion used to check the data given in the copy paste blcock
//*/
function checkData()
{
    //alert("Type of mode selected is : "+foldCheck);
    $("#preview").hide();
    var dataOfCopy = $("#myData").val();
    //alert("Data in the text box : "+dataOfCopy);
    validFlag = true;
    flag = true;
    var bfd = new RegExp("^[0-9]$");
    if(dataOfCopy[0] == " ")
    {
        alert("Is not a valid Data");
        flag = false;
        return;
    }
    for(var i=0;i<dataOfCopy.length;i++)
    {
        if(dataOfCopy[i] == ".")
        {
            if(!(bfd.test(dataOfCopy[i+1]) || bfd.test(dataOfCopy[i-i])))
            {
                alert("Is not a valid data");
                flag = false;
                return;
            }
        }
        if(dataOfCopy[i] == "-" || dataOfCopy[i] == "+")
        {
            if(!bfd.test(dataOfCopy[i+1]))
            {
                alert("Is not a valid data");
                flag = false;
                return;
            }
        }
    }
    var rowCount = 0;
    var temp = false;
    var Tcount = 0;
    var storeCopyData = [];
    var splitData = dataOfCopy.split(/\n/);
    //alert("splited data : "+splitData);
    for(var i in splitData)
    {
        if(splitData[i] != "")
        {
            rowCount++;
        }
    }
    //alert("no. of rows : "+rowCount);
    //alert("no. of columns : "+colCount);
   
    var storeData = [];
    
    for(var ar =0 ;ar<rowCount;ar++)
    {
        storeData[ar] = new Array();
    }
    
    
    for(var i in splitData)
    {
        var count = 0;
        var spaceRemove = splitData[i].split(" ");
        //alert(spaceRemove);
        for(var j in spaceRemove)
        {
            if(spaceRemove[j] != "")
            {
                storeCopyData[Tcount] = spaceRemove[j];
                storeData[i][j]= spaceRemove[j];
                //alert("Array elements : "+storeData);
                count++;
                Tcount++;
            }
        }
        if(count>3 || count==1)
        {
            temp = true;
        }
    }
  
    //alert("Copy Data : "+storeCopyData);
    //alert("Column count : "+Tcount/rowCount);
    var colCount = Tcount/rowCount;
    
    transposeArray(rowCount, colCount, storeData);
    //alert("done");
  
    
    if(temp == false && count == 3)
    {
        if(storeCopyData == 0)
        {
            alert("Please provide Inputs");
            return false;
        }
        store = [];
        $("#GroupedData").show();
        $("#DataandFrequency").hide();
        $("#GeneralData").hide();
        $("#CopyPaste2").addClass('firstCopy');
        $("#CopyPaste1").removeClass('firstCopy');
        $("#CopyPaste3").removeClass('firstCopy');
        datalength = 3;
        verify = true;
        foldCheck = 1;
        var i = 0;
        for(var j=0;j<storeCopyData.length;j++)
        {
            store[i] = storeCopyData[j];
            i++;
        }
        $("#copyDiv").show();
        $("#copyDiv").html("Is it Grouped Frequency Mode of Data");
        $("#copyDiv").html("<table border='1'><tr style='background: #175C8F;'><td style='color: white'>Lower Limit</td><td style='color: white'>Upper Limit</td><td style='width:77px;color: white'>Frequency</td></tr>");
        var c =0;
        for(var j=0;j<rowCount;j++)
        {
            var cls = "tdbody1";
            if(j%2 ==0)
            {
                cls = "tbody2";
            }
            $("#copyDiv").append("<table border='1'><tr class='"+cls+"'><td style='width:90px'>"+storeCopyData[c]+"</td><td style='width:90px'>"+storeCopyData[++c]+"</td><td style='width:90px'>"+storeCopyData[++c]+"</td></tr>");
            c++;
        }
        $("#sub").show();
    }
    else if(temp==false && count == 2)
    {
        if(storeCopyData == 0)
        {
            alert("Please provide Inputs");
            return false;
        }
        store = [];
        $("#GroupedData").hide();
        $("#DataandFrequency").show();
        $("#GeneralData").hide();
        $("#CopyPaste1").addClass('firstCopy');
        $("#CopyPaste2").removeClass('firstCopy');
        $("#CopyPaste3").removeClass('firstCopy');
        datalength = 2;
        verify = true;
        foldCheck = 0;
        var i =0;
        for(var j=0;j<storeCopyData.length;j++)
        {
            store[i] = storeCopyData[j];
            i++;
        }
        $("#copyDiv").show();
        $("#copyDiv").html("Is it Frequency Mode of Data: <br/><table border='1'><tr style='background: #175C8F;'><td style='width:90px;color: white'>Data Value</td><td style='width:90px;color: white'>Frequency</td></tr>");
        var c =0;
        for(var j =0;j<rowCount;j++)
        {
            var cls = "tdbody1";
            if(j%2 ==0)
            {
                cls = "tbody2";
            }
            $("#copyDiv").append("<table border='1'><tr class='"+cls+"' ><td style='width:90px'>"+storeCopyData[c]+"</td><td style='width:90px'>"+storeCopyData[++c]+"</td></tr></table>");
            c++;
        }
        $("#sub").show();
    }
    else
    {
        if(storeCopyData == 0)
        {
            alert("Please provide Inputs");
            return false;
        }
        foldCheck = 1;
        verify = false;
        datalength = 0;
        $("#GroupedData").hide();
        $("#DataandFrequency").hide();
        $("#GeneralData").show();
        $("#CopyPaste3").addClass('firstCopy');
        $("#CopyPaste2").removeClass('firstCopy');
        $("#CopyPaste1").removeClass('firstCopy');
        $("#copyDiv").show();
        $("#copyDiv").html("Is it General Data(RAW Data) : <br/><table border='1'><tr style='background: #175C8F;'><td  style='width:90px;color:white;'>Data Value</td><td style='width:90px;color:white;'>Frequency</td></tr>");
        var c =0;
        for(var j =0;j<storeCopyData.length;j++)
        {
            var cls = "tdbody1";
            if(j%2 ==0)
            {
                cls = "tbody2";
            }
            $("#copyDiv").append("<table border='1'><tr class='"+cls+"'><td style='width:90px'>"+storeCopyData[c]+"</td><td style='width:90px'>"+1+"</td></tr></table>");
            c++;
        }
        $("#sub").show();
    }

}//------------------------------------------------------End of check Data function


function PreviewSubmit()
{
    //$("#preview").show();//
    $("#sub").show(500);
    var dec = new RegExp("^([-0-9]*|[0-9]*\\.\\d?\\d*)$");
    
    
}//------------------------------------------------------End of preview submit


$(function(){
    var ij=0;
    $('input[name="chk"]').each(function(){
        //        alert("the hover value is "+ij);
        ij++;
    });
});


function menu(){
    $('.hasSubMenu').hover(
        function(){
            $(this).find('ul').slideDown(500, null);
        },function(){
            $(this).find('ul').slideUp(300, null);
        });
}
/*
* this function is invoked when click on "proceed" button in iframe...
*/

function getInterval()
{
    var interval = prompt("please enter the number of intervals you want::");
    var reg = new RegExp("^[0-9]+$");
    document.getElementById('myInterval').checked = false;
    if(interval == null)
    {
        return;
    }
    if(!reg.test(interval))
    {
        alert("Please enter correct value");
        return;
    }
    $('#myProceed2').name = "submit";
    //                $('#sub').show();
    document.forms[5].action="second.do?interval="+interval;
    document.forms[5].submit();
}
//------------------------------------------------------End of getInterval function


function getJsp2()
{
    //                verify = false;
    //                $('#sub').show();
    $('#secondIframe').show();
    var intval =0;
    document.forms[6].action="second.do?interval="+intval;
    document.forms[6].submit();
} //------------------------------------------------------End of getJsp2

function getJsp1(val)
{
    //                verify = false;
    //                $('#sub').show();
    $('#firstIframe').show();
    var value = val;
    document.forms[3].action="first.do?value="+value;
    document.forms[3].submit();
}//------------------------------------------------------End of getJsp1

function getJsp3(val)
{
    //                verify = false;
    //                $('#sub').show();
    $('#thirdIframe').show();
    var value = val;
    document.forms[4].action="first.do?value="+value;
    document.forms[4].submit();
}//------------------------------------------------------End of getJsp3


function getData1()
{
    $('#MYTAB').show();
    $('#iframe1').show();
    $('#myButton1').show();
    $('#myProceed1').show();
    $('#firstIframe').hide();
    document.forms[1].action="FirstData.jsp";
    document.forms[1].submit();
}//------------------------------------------------------End of getData1


function getData2()
{
    $('#MYTAB').show();
    $('#iframe2').show();
    $('#myButton2').show();
    $('#myProceed2').show();
    //                $('#myInterval').show();
    $('#secondIframe').hide();
}//------------------------------------------------------End of getData2

function getData3()
{
    $('#MYTAB').show();
    $('#iframe3').show();
    $('#myButton3').show();
    $('#myProceed3').show();
    $('#thirdIframe').hide();
    document.forms[2].action="SecondData.jsp";
    document.forms[2].submit();
}//------------------------------------------------------End of getData3


$(function(){
    loadTabNavigation();
});


function loadTabNavigation()
{
    var tabs = $('.tabNavigator').find(".tabContent");
    $(tabs).hide();
    $('.tabNavigator').find('.navHead').each(function(ind){
        $(this).hover(function()
        {
            $(this).addClass('tabHover');
        },function(){
            $(this).removeClass('tabHover');
        });

        $(this).click(function(){
            $(tabs).eq(ind).slideToggle(1000, null);
        });
    });
}//------------------------------------------------------End of loadTabNavigation

$(function(){
    loadIntroduce();
});

function loadIntroduce()
{
    var into = $('.introducation');
    into.click(function(){
        if(flodFlag == true)
        {
            $('#changeImage').html("<img src='res/images/Add.png' alt='add' class='introducation'/>");
            flodFlag = false;
        }
        else{
            $('#changeImage').html("<img alt='minus' src='res/images/minus.png' class='introducation' onclick='alert('hai')';/>");
            flodFlag = true;
        }

        $('.introduceContent').slideToggle(500,null);
    });
}//------------------------------------------------------End of loadIntroduce

$(function(){
    loadDistributions();
});


function loadDistributions()
{
    $('.Distributions').show();
    $('.dist').click(function(){
        if(distFlag == true)
        {
            $('#changeDistImage').html("<img src='res/images/Add.png' class='dist'/>");
            distFlag = false;
        }
        else
        {
            $('#changeDistImage').html("<img alt='' src='res/images/minus.png'  class='dist'/>");
            distFlag = true;
        }
        $('.Distributions').slideToggle(500,null);
    });
}//------------------------------------------------------End of loadDistributions

$(function(){
    var tool = new ToolTip($('*'),{
        divCSS:''
    });
});


// Function used to generate the tool tips
function ToolTip(pFields,options)
{
    this.title = "";
    this.div = document.createElement('div');
    this.divCSS = null;
    this.continer = document.createElement('div');
    this.fields = this.filterElements(pFields);
    this.heading = "";
    this.initOptions(options);
    this.init();
    this.registerField(this.fields);
}

ToolTip.prototype.initOptions = function(options)
{
    if(!options)
        return;
    this.heading = !options.heading?"AceEngineer":options.heading;
    this.divCSS = !options.divCSS?null:options.divCSS;
}

/**
* This Method to Initialize the Objects
*/
ToolTip.prototype.init = function()
{
    // if there is no User defiend CSS then Apply the Default CSS
    if(this.divCSS == null)
    {
        $(this.div).css({
            'margin-top':'20px',
            'margin-left':'5px',
            left: 0,
            position:'absolute',
            '-webkit-border-radius':'10px',
            '-webkit-box-shadow':'2px 4px 4px black',
            display:'none',
            color: 'white',
            background: '#333399',
            padding:'10px'
        });
    }
    else
    {
        $(this.div).addClass(this.divCSS).css({
            position:'absolute'
        });
    }

    // Adding Continer
    $(this.div).append(this.continer);
//                $(this.div).append("<center>"+this.heading+"</center>").
//                    append('<hr />').
//                    append(this.continer);
}

/**
* This Method Register a new Field
*/
ToolTip.prototype.registerField = function(fields)
{
    var me = this;
    $(fields).hover(function(evt)
    {
        me.title = $(this).attr('title');
        $(this).removeAttr('title');
        $(me.continer).html(me.title);
        var pos = $(this).offset();

        $(document.body).append(me.div);
        $(me.div).css({
            left:evt.clientX,
            top:pos.top
        });
        $(me.div).stop().fadeTo(0,0,null).fadeTo(1000,1.0,null);
    },function(){
        $(this).attr('title',me.title);
        $(me.div).remove();
    });
}

/**
* This Method Filters all the elements given
* and returns only the Elements have title Attributes
*/
ToolTip.prototype.filterElements = function(elements)
{
    var newList = [];
    $(elements).each(function()
    {
        if($(this).attr('title') && $(this).attr('title').length>0)
            newList.push(this);
    });
    return newList;
}
function flodSpan()
{
    $("#moreonstat").hide();
    $("#hideInfo").show();
    $("#close").show();
}
function openSpan()
{
    $("#hideInfo").hide();
    $("#close").hide();
    $("#moreonstat").show();
}
function flodImage()
{
    $("#imageDescription").show();
    $("#readmore").hide();
    $("#closeImage").show();
}
function openImage()
{
    $("#imageDescription").hide();
    $("#readmore").show();
    $("#closeImage").hide();
}
$('fieldset').each(function(){
    $(this).hover(function(){
        $(this).stop().fadeTo(1000,1.0, null);
    },function(){
        $(this).stop().fadeTo(1000,1.0, null);
    });
});

//function resizeFrameToFitContent(iframe){
//    if(iframe.contentWindow.document.body.scrollHeight >= 400)
//    {
//        iframe.height = 400;
//    }
//    else{
//        iframe.height = iframe.contentWindow.document.body.scrollHeight;
//    }
//}
$(function(){
    $("#myProceed1").click(function(){
        Mask.showMask(document.getElementById('firstIframe'),"");
    });
    $("#firstIframe").load(function(){
        Mask.hideMask(document.getElementById('firstIframe'));
    });
    $("#myProceed3").click(function(){
        Mask.showMask(document.getElementById('thirdIframe'),"");
    });
    $("#thirdIframe").load(function(){
        Mask.hideMask(document.getElementById('thirdIframe'));
    });
    $("#myProceed2").click(function(){
        Mask.showMask(document.getElementById('secondIframe'),"");
    });
    $("#secondIframe").load(function(){
        Mask.hideMask(document.getElementById('secondIframe'));
    });
});

//             $("#row1").click(function(){
//                Mask.showMask(document.getElementById('iframe1'),"");
//            });
//            $("#iframe1").load(function(){
//                Mask.hideMask(document.getElementById('iframe1'));
//            });
//             $("#row2").click(function(){
//                Mask.showMask(document.getElementById('iframe2'),"");
//            });
//            $("#iframe2").load(function(){
//                Mask.hideMask(document.getElementById('iframe2'));
//            });
//             $("#row3").click(function(){
//                Mask.showMask(document.getElementById('iframe3'),"");
//            });
//            $("#iframe3").load(function(){
//                Mask.hideMask(document.getElementById('iframe3'));
//            });
//--------------------------------------------------------------------------------------------------------------------------------------
// JqGrid functions
function JQGrid(divId,pagerId,colModel)
{
    var ME = this;
    this.divId = divId
    this.pagerId = pagerId;
    this.colModel = colModel;
    //alert(this.div);
    this.grid = null;
    this.lastSel = -1;
    //alert("Pager Object "+this.pagerDiv);
    
    this.baseOptions = {        
        datatype: "local",
        //editurl:'jqGrid.html',
        //url:'jqGrid.html',
        colModel: ME.colModel,
        //pager: null,
        sortable:true,    
        //rownum:10,
        viewrecords: true,
        //rownumbers: true,
        rowList: [10,20,50,100,500,1000],
        //viewrecords: true,
        //autowidth: true,
        //shrinkToFit:true,
        multiselect: true,
        //multiselect:false,
        //sortorder: "desc",
        height:'100%',
        caption:"Data Table"
    //sortorder: 'desc',        
    //editurl: 'clientArray',
    //        onSelectRow: function(id) {
    //            if (id && id !== ME.lastSel) {
    //                ME.grid.jqGrid('restoreRow',ME.lastSel);
    //                ME.lastSel = id;
    //            }
    //        },        
    //        ondblClickRow: function(id, ri, ci) {            
    //            ME.grid.jqGrid('editGridRow',id,{
    //                });
    //        },
    //        afterInsertRow: function(rowid,rowdata,rowele){
    //        //alert(rowid);
    //        }
    }
    
    this.baseOptions.pager = '#'+this.pagerId;
    
    this.init();    
}

JQGrid.prototype.init = function(){    
    var ME = this;
    this.grid = $('#'+this.divId).jqGrid(this.baseOptions);
    this.grid.jqGrid('navGrid','#'+this.pagerId,{
        edit:true,
        add:true,
        del:true,
        search:true
    });
    return this.grid;
}


//----------------------End of JqGrid ----------------------------------

// function used to manipulate the data table
function renderOutPutTable(dataArray,colCount,rowCount){
    var gridTable;
    var gridDiv;
    var data;
    //alert("Length of the data Array : "+dataArray.length);
    //alert("Length of the Columns : "+dataArray[0].length);
    var model = "[";
    for(var i=0;i<colCount;i++){
        model+="{name: 'data"+i+"'},";    
    }
    model+="]";
    
    gridTable =document.getElementById("gridTable");
    gridDiv =document.getElementById("pagerDiv");
    model = eval("("+model+")");
    // alert(model);
    //var jqGrid = new JQGrid(gridTable, gridDiv, model);
    
    data = "[";
    //alert(data);
    for(var rc=0;rc<rowCount;rc++){
        data+="{";
        //alert(data);
        for(var cc=0;cc<colCount;cc++){
            data+="data"+cc+":'"+dataArray[rc][cc]+"',";
        //alert("Array  "+data);
        }
        data+="},";
    }
    data+="]";
    
    data = eval("("+data+")");
    //alert(data);
    var jq = new JQGrid(gridTable, gridDiv, model);
    
    jq.grid.jqGrid('setGridParam',{
        data: data
    });
    
    jq.grid.trigger("reloadGrid");
     
//    for(var l=0;l<=data.length;l++)
//        jqGrid.grid.jqGrid('addRowData',l+1,data[l]);
//    data = "[{";
//    for(var j=0;j<rowCount;j++)
//    {
//        for(var k=0;k<colCount;k++)
//            data+="data"+k+":'"+dataArray[0]+"',";
//    }
//    data+="}]";
       
}// end of the function  renderOutPutTable

/*
*the function takes the 2d array and gives the transposed array...
**/
function transpose2DArray(data)
{
    var tData = [];
    var rowCount = data.length;
    var colCount = data[0].length;
    
    for(var i=0;i<colCount;i++)
    {
        tData[i] = new Array(rowCount);
    }
    
    for(var rc=0;rc<rowCount;rc++)
    {
        for(var cc=0;cc<colCount;cc++)
        {
            tData[cc][rc] = data[rc][cc];
        }
    }
    return tData;
}




//****************************************************
// This function used to transpose the given array data
function transposeArray(dataArray){
    var tData = [];
    var rowCount = dataArray.length;
    var colCount = dataArray[0].length;
    
    // alert("length of the data array : "+rowCount);
    //alert("length of the column  array : "+colCount);
        
   
    //alert(resTrpseDiv);
    
    var tableString = "<table border='1' width='50%' style='text-align:center;' cellspacing='1' cellpadding='1' id='outTable'>";
    
    //alert("Input Array Data : "+dataArray);
    for(var i=0;i<colCount;i++)
    {
        tData[i] = new Array(rowCount);
    }
    
    for(var rc=0;rc<rowCount;rc++)
    {
        for(var cc=0;cc<colCount;cc++)
        {
            tData[cc][rc] = dataArray[rc][cc];
        }
    }
    
    for(var r=0;r<colCount;r++)
    {
        tableString+="<tr>";
        
        for(var c=0;c<rowCount;c++)
        {
            //alert(r+"  "+c);
            tableString+="<td>"+tData[r][c]+"</td>";
        }
        tableString+="</tr>";
    }
    tableString+="</table>";
    //alert(tData);
    //alert(tableString);
    return tableString;
}
//*****************************************************End of the function **************************************************/


//* This function returns the interpolated value for the given set of X values array and Y values array

function linearInterpolation(xyArray,inputVal)
{
    var xArray =[];
    var yArray =[];
    // alert(inputVal);
    var outputVal;
    
    
    for(var i =0;i<xyArray.length;i++)
    {
        for(var j =0;j<xyArray[0].length;j++)
        {
            xArray[i]= parseFloat(xyArray[i][0]);
            yArray[i]= parseFloat(xyArray[i][1]);
        }
    }
    //alert("x Array : "+xArray);
    // alert("y Array : "+yArray);
    for(var k  in xArray)
    {
        if(inputVal>xArray[k-1] && inputVal<xArray[k])
        {
            outputVal = yArray[k-1]+(yArray[k]-yArray[k-1])/(xArray[k]-xArray[k-1])*(inputVal-xArray[k-1]);
        }
    }
    /*
* Comparing the input value with x array..to give the output value. 
**/
    for(var sme = 0 ; sme<xArray.length;sme++)
    {
        if(inputVal == xArray[sme]){
            outputVal = yArray[sme];
            break;
        }
    }
    
    return outputVal;
}
//**************************End of the function linearInterpolation *******************************//

/*
*This function takes the x values,y values arrray and calculates the polynomial interpolation depends on the degree of the equation 
*/
function polynomialInterpolation(xyArray,inputVal,degree)
{
    var itrVal = Math.ceil((degree/2)); 
    
    // alert(itrVal);
    // alert(parseFloat(inputVal));
    var outputVal;
    
    var xArray =[];
    var yArray =[];
    
    
    
    for(var i =0;i<xyArray.length;i++)
    {
        for(var j =0;j<xyArray[0].length;j++)
        {
            xArray[i]= xyArray[i][0];
            yArray[i]= xyArray[i][1];
        }
    }
    //    alert(xArray);
    //alert(inputVal);
    //alert(xArray[0]);
    if(inputVal < xArray[0] || inputVal > xArray[xArray.length-1]){
        alert("The input '"+inputVal+"' should be with in between the range of "+xArray[0]+" and "+xArray[xArray.length-1]);
        return;
    }
    
        
    
    if(degree%2==0)
    {
        var arr1 =[];
        var arr2 =[];
        
        for(var ini=0;ini<=degree;ini++)
        {
            arr1[ini]=new Array(degree+1);
            arr2[ini]=new Array(degree+1);
        }
        
        var setXArray1=[];
        var setXArray2=[];
        var setYArray1=[];
        var setYArray2=[];
        
        //-------------------------------------------------------------
        for(var a in xArray)
        {
            //alert("Current Value : "+xArray[i]);
            //alert("Previous value : "+xArray[i-1]);
            //alert("Input value : "+inputVal);
            if(inputVal<xArray[a] && inputVal>xArray[a-1])
            {
                a=parseInt(a);
                for(var b=(a-itrVal);b<=(a+itrVal);b++)
                {
                    setXArray1.push(xArray[b]);
                    setYArray1.push(yArray[b]);
                }
            }
        }
        //alert("Set Array 1 : "+setXArray1);
        for(var n=0;n<=degree;n++)
        {
            // alert("setArray length : "+setXArray1.length);
            for(var p=0;p<setXArray1.length;p++)
            {
                arr1[p][n]= Math.pow(setXArray1[p],n);
            //alert(arr1);
            }
        }
        
        //-------------------------------------------------------------
        itrVal = itrVal+1;
        //alert("itr value : "+itrVal);
        for(var c in xArray)
        {
            //alert("Current Value : "+xArray[i]);
            //alert("Prevous value : "+xArray[i-1]);
            //alert("Input value : "+inputVal);
            if(inputVal<xArray[c] && inputVal>xArray[c-1])
            {
                c=parseInt(c);
                //alert(" c value : "+c)
                for(var d=(c-itrVal);d<(c+itrVal-1);d++)
                {
                    setXArray2.push(xArray[d]);
                    setYArray2.push(yArray[d]);
                }
            }
        }
        //alert("array length : "+arr1.length);
        // alert("array[0] length : "+arr1[0].length);
        for(var t=0;t<=degree;t++)
        {
            //alert("setArray length : "+setXArray.length);
            for(var u=0;u<setXArray2.length;u++)
            {
                arr2[u][t]= Math.pow(setXArray2[u],t);
            //alert(arr);
            }
        }
        
        //alert(arr1);
        //alert(arr2);
        var invMat1 = matrixInverse(arr1);
        var invMat2 = matrixInverse(arr2);
        //alert(invMat1);
        //alert(invMat2);
        //alert("Set 1 length : "+setXArray1.length);
        //alert("Set 2 length : "+setXArray2.length);
        var coeff1 = [];
        var coeff2 = [];
        var value1 = 0;
        var value2 = 0;
        for(var q=0;q<setXArray1.length;q++)
        {
            for(var r=0;r<setXArray1.length;r++)
            {
                //alert("val 1 : "+arr[q][r]);
                //alert("val 2 : "+setYArray[r]);
                value1 = value1 + invMat1[q][r]*setYArray1[r]; 
            }
            //alert(value);
            coeff1[q] = value1;
            value1 =0;
        }
        
        for(var pq=0;pq<setXArray2.length;pq++)
        {
            for(var rs=0;rs<setXArray2.length;rs++)
            {
                //alert("val 1 : "+arr[q][r]);
                //alert("val 2 : "+setYArray[r]);
                value2 = value2 + invMat2[pq][rs]*setYArray2[rs]; 
            }
            //alert(value);
            coeff2[pq] = value2;
            value2 =0;
        }
        
        var output1 = getPolyInterpolationOutput(coeff1, degree, inputVal);
        var output2 = getPolyInterpolationOutput(coeff2, degree, inputVal);
        
        outputVal = (output1+output2)/2;
        //alert("Average of 2 out puts : "+outputVal);
        /*
* Comparing the input value with x array..to give the output value. 
**/
        for(var sme = 0 ; sme<xArray.length;sme++)
        {
            if(inputVal == xArray[sme]){
                outputVal = yArray[sme];
                break;
            }
        }
        // alert('polynomial Interpolation even degree : '+outputVal)
        return outputVal;
        
    }
    else
    {
       
        var setXArray= [];
        var setYArray= [];
        for(var i in xArray)
        {
            //alert("Current Value : "+xArray[i]);
            //alert("Prevous value : "+xArray[i-1]);
            //alert("Input value : "+inputVal);
            if(inputVal<xArray[i] && inputVal>xArray[i-1])
            {
                for(var k=i-itrVal;k<i;k++)
                {
                    setXArray.push(xArray[k]);
                    setYArray.push(yArray[k]);
                }
            }
        }
        //alert("********* Next Iteration *************");
        //alert(inputVal);
        //alert(itrVal);
        for(var m in xArray)
        {
            if(inputVal<xArray[m] && inputVal>xArray[m-1])
            {
                m = parseInt(m);
                for(var l=m;l<m+itrVal;l++)
                {
                    setXArray.push(xArray[l]);
                    setYArray.push(yArray[l]);
                }
            }
        }
        //------------------------------------------------------------------------------------------------------------//
        //alert("X Set array : "+setXArray);
        //alert("Y Set array : "+setYArray);
                
        var arr =[];
        for(var jArray=0;jArray<setXArray.length;jArray++)
        {
            arr[jArray]= new Array(degree); 
        }
        
        for(var no=0;no<=degree;no++)
        {
            //alert("setArray length : "+setXArray.length);
            for(var pqr=0;pqr<setXArray.length;pqr++)
            {
                arr[pqr][no]= Math.pow(setXArray[pqr],no);
            //alert(arr);
            }
        }
        if(arr != ""){
            var invArr = arr;
            invArr = matrixInverse(arr);
            //alert("Inverse array : "+invArr);
            //--------------------------------------------------------------------------------------------------------------//
            var coeff = [];
            var value = 0;
            for(var qr=0;qr<setXArray.length;qr++)
            {
                for(var rst=0;rst<setXArray.length;rst++)
                {
                    //alert("val 1 : "+arr[q][r]);
                    //alert("val 2 : "+setYArray[r]);
                    value = value + invArr[qr][rst]*setYArray[rst]; 
                }
                //alert(value);
                coeff[qr] = value;
                value =0;
            }
            //--------------------------------------------------------------------------------------------------------------//
        
            // alert(coeff);
            outputVal = getPolyInterpolationOutput(coeff, degree,inputVal);
        }
        else{
            for(var same = 0 ; same<xArray.length;same++)
            {
                if(inputVal == xArray[same]){
                    outputVal = yArray[same];
                    break;
                }
            }
        }
            
        
        //alert('polynomial Interpolation even degree : '+outputVal)
        return outputVal;
            
    }
   
    
}

//**************************End of the function PolynomialInterpolation *******************************//

/*
*This function calcuates the output value of n the degree polynomial interpolated values
**/
function getPolyInterpolationOutput(coeffArray,deg,inputVal)
{
    var outputVal = 0;
    
    for(var i=0;i<=deg;i++)
    {
        outputVal = outputVal + Math.pow(inputVal,i)*coeffArray[i];
    }
    return outputVal;
}

/**
*This navigates to the preferred method for interpolation depends on the method type.
*/
function applyInterpolation(xArray,yArray,inputVal,methodType,degree)
{
    var output;
    switch(methodType)
    {
        case 0:
            output = linearInterpolation(xArray, yArray, inputVal);
            break;
        case 1:
            output = polynomialInterpolation(xArray, yArray, inputVal, degree);
            break;
        case 2:
            output = lagrangianMethodofInterpolation(xArray, yArray, inputVal);
            break;
        case 3:
            output = newtonDD(xArray, yArray, inputVal);
            break;
    }
    return output;
}


/*
*this function calculates the matrix inverse using guass jorddan method
*/

function matrixInverse(matrixArray)
{
    var st_vrs = matrixArray.length;
    //alert("matrix Array length : "+st_vrs);
    var st_stolp = matrixArray[0].length;
    //alert("matrix Array length at index 0 : "+st_stolp);
    var out = new Array(st_vrs);
    var old = new Array(st_vrs);
    var newM = new Array(st_vrs);
    //alert("Out matrix Length : "+out.length);
    for(var a=0;a<out.length;a++){
        out[a]= new Array(st_stolp);
    }
    for(var b=0;b<out.length;b++){
        old[b]= new Array(st_stolp*2);
    }
    for(var c=0;c<out.length;c++){
        newM[c]= new Array(st_stolp*2);
    }
    
    old = initilizeMatrix(old);
    newM = initilizeMatrix(newM);
     
    //double[][] out = new double[st_vrs][st_stolp];
    //double[][] old = new double[st_vrs][st_stolp * 2];
    //double[][] ne = new double[st_vrs][st_stolp * 2];
    
    
    for (var v = 0; v < st_vrs; v++) {//ones vector
        for (var s = 0; s < (st_stolp * 2); s++) {
            if (s - v == st_vrs) {
                old[v][s] = 1;
            }
            if (s < st_stolp) {
                old[v][s] = matrixArray[v][s];
            }
        }
    }
    
    function initilizeMatrix(mat){
        for(var i=0;i<mat.length;i++){
            for(var j=0;j<mat[i].length;j++){
                mat[i][j] = 0;
            }
        }
        return mat;
    }
    
    
    //zeros below the diagonal
    for (var d = 0; d < st_vrs; d++) {
        for (var v1 = 0; v1 < st_vrs; v1++) {
            for (var e = 0; e < (st_stolp * 2); e++) {
                if (d == v1) {
                    newM[d][e] = parseFloat(old[d][e]) / parseFloat(old[d][d]);
                }
                else {
                    newM[v1][e] = old[v1][e];
                }
            //alert("new array : "+newM);
            }
        }
        old = prepisi(newM);
        //alert("Array : "+old);
        for (var f = (d + 1); f < st_vrs; f++) {
            for (var g = 0; g < (st_stolp * 2); g++) {
                newM[f][g] = parseFloat(old[f][g]) - parseFloat(old[d][g]) * parseFloat(old[f][d]);
            }
        }
        old = prepisi(newM);
    }
    //zeros above the diagonal
    for (var h = (st_stolp - 1); h > 0; h--) {
        for (var i = (h - 1); i >= 0; i--) {
            for (var s1 = 0; s1 < (st_stolp * 2); s1++) {
                newM[i][s1] = parseFloat(old[i][s1]) - parseFloat(old[h][s1]) * parseFloat(old[i][h]);
            }
        }
        old = prepisi(newM);
    }

    for (var j = 0; j < st_vrs; j++) {//rigt part of matrix is invers
        for (var k = st_stolp; k < st_stolp * 2; k++) {
            out[j][k - st_stolp] = newM[j][k];
        }
    }
    return out;
}
/********end of  matrix inversion method*******************/

/*
*This function used in Matrix inversion method
**/
function prepisi(inn)
{
    var out = new Array(inn.length);
    for(var a =0;a<out.length;a++)
    {
        out[a]= new Array(inn[0].length);
    }
    //var out = new double[inn.length][inn[0].length];
    for (var v = 0; v < inn.length; v++) {
        for (var s = 0; s < inn[0].length; s++) {
            out[v][s] = inn[v][s];
        }
    }
    return out;
}
/*********************************end of function****************************/

function lagrangianMethodofInterpolation(xyArray,inputVal)
{
    var factor = 1;
   
    var x_X = [];
    var m =[];
    var xArray =[];
    var yArray =[];
    var outputVal;
    inputVal  = Number(inputVal);
    // Pasring 2d array to two different arrays.
    for(var i =0;i<xyArray.length;i++)
    {
        for(var j =0;j<xyArray[0].length;j++)
        {
            xArray[i]= xyArray[i][0];
            yArray[i]= xyArray[i][1];
        }
    }
    
    var p = new Array(xArray.length);
    //Step 1 calculating the factor
    for(var a=0;a<xArray.length;a++)
    {
        factor = factor * (inputVal - xArray[a]);
    }
    //alert("factor : "+factor);
    //Step 2 Calculating the p values
    //alert(factor);
    var value =1;
    for(var b=0;b<xArray.length;b++)
    {
        for(var c=0;c<xArray.length;c++)
        {
            if(b!=c)
            {
                value= value *(xArray[b]-xArray[c]);        
            }
        }
        p[b]= value;
        value =1;
    }
    
    //Step 3 Calculating the x-X values
    for(var d=0;d<xArray.length;d++)
    {
        x_X[d]= inputVal - xArray[d];
    }
    
    //step 4 calculating the m values
    
    for(var e=0;e<xArray.length;e++)
    {
        m[e]=p[e]*x_X[e];
    }
    
    //Step 5 calculating the output value
    var innerVal =0;
    for(var f=0;f<xArray.length;f++)
    {
        innerVal = innerVal + (yArray[f]/m[f]);
    }
   
    /*
* Comparing the input value with x array..to give the output value. 
**/
    for(var sme = 0 ; sme<xArray.length;sme++)
    {
        if(inputVal == xArray[sme]){
            outputVal = yArray[sme];
            break;
        }
        else{
            outputVal = factor*innerVal;        
        }
            
    }
    //alert('legranges Interpolation : '+outputVal)
    
    return outputVal;
}
/***************end of the function lagrangianMethodofInterpolation *********************/

/**
*This function calculates the interpolated value through Newtons divide and difference method 
**/
function newtonDD(xyArray,inputVal)
{
    var x_X = [];
    
    var p = [];
    var b =[];
    var val;
    var pos;
    var xArray =[];
    var yArray =[];
    var outputVal;
    inputVal = Number(inputVal);
    //alert("Newton dd method input value : "+inputVal);
    for(var i =0;i<xyArray.length;i++)
    {
        for(var j =0;j<xyArray[0].length;j++)
        {
            xArray[i]= parseFloat(xyArray[i][0]);
            yArray[i]= parseFloat(xyArray[i][1]);
        }
    }
    // alert(xArray);
    //alert(yArray);
    //Step 1 calculating the differences    
    try{
        var nd = new NDD(xArray, yArray);    
    
    }catch(e){
        alert(e);
    }
    
    
    //Step 2 Calculatind the x_X values

    for(var a=0;a<xArray.length;a++)
    {
        x_X[a]= inputVal - xArray[a];
    }
    //alert("x_X : "+x_X);


    //Step 3 calculating the P values i.e product of differences
    for(var c=0;c<xArray.length-1;c++)
    {
        if(c==0){
            val = 1 * x_X[c];
        }
        else{
            val= p[c-1] * x_X[c];
        }
            
        p[c]=val;
    }
    //Step 4 position of the input value where it resides  in the x array
    for(var ij=0;ij<xArray.length;ij++){
        if(xArray[ij]>inputVal)
            break;
        pos = ij;
    }
    var res = Number(yArray[pos]);//position  

    for(var ji=1;ji<p.length;ji++){
        res += (p[ji-1]*nd.getDifference(ji, pos));
    }
    /*
* Comparing the input value with x array..to give the output value. 
**/
    for(var sme = 0 ; sme<xArray.length;sme++)
    {
        if(inputVal == xArray[sme]){
            res = yArray[sme];
            break;
        }
    }
    
    return res;
}
//*************-----------------------------------------------------**///////////////////

/**
*This function choose the method depends on the user selected methods 
**/
function chooseMethod(myData){
    //myData = sort2dArray(myData);
    interpolationRadios = [];
    var drRadios = [];
    resInd = new Array(4);
    
    var resTrpseDiv = document.getElementById('resultTranposeDiv');
    chartXYArray = myData;
    drRadios = document.getElementsByName('drd');
    interpolationRadios = document.getElementsByName('interpolation');
    //validating the array
    for(var valCheck = 0;valCheck<myData.length;valCheck++)
    {
        for(var valInn = 0;valInn<myData[0].length;valInn++)
        {
            if(myData[valCheck][valInn] == "" || myData[valCheck][valInn] == undefined){
                alert('Please check the values');
                return; 
            }
               
        }
    }
    
    if($('#methods').find('input')[0].name == "interpolation" )
    {
        //alert('im in interpolation mode');
        var inputVal = document.getElementById('inputVal');
        var ipValArray = (document.getElementById('inputArrayVal').value).split(",");
        var checkSelCount = 0;
        var deg = document.getElementById('deg');
        var res;
        myData = sort2dArray(myData);
        //Converting the inputs array to float
        for(var num=0;num<ipValArray.length;num++)
        {
            ipValArray[num] = Number(ipValArray[num]);
        //alert(ipValArray[num]);
        }
        
        ipValArray.sort(function(a,b){
            return a-b;
        });
        //creating the 2d array for result array for multiple  inputs
        for(var xy =0;xy<resInd.length;xy++){
            resInd[xy] = new Array(ipValArray.length);
        }
        for(var yx=0;yx<interpolationRadios.length;yx++)
        {
            if(interpolationRadios[yx].checked == true)
                checkSelCount++;
        }
        if(checkSelCount == 0){
            alert("Please select any one method");
            return;
        }
            
        var resTable = "<table align='center' border='1'>"
        inputVal = parseFloat(inputVal.value);
        deg = parseFloat(deg.value);
        //alert("Array column count : "+myData[0].length);
        
        if(myData[0].length != 2)
        {
            alert("Sorry! this can not be processed, The input is not in correct format");
        }else
        {
            $(resTrpseDiv).html("");
            for(var i=0;i<interpolationRadios.length;i++)
            {
                if(interpolationRadios[i].checked == true)
                {
                    $('#dragOut').hide();
                    if($('#inputArray')[0].checked == true){
                        interpolationInputArray = ipValArray;
                        
                        for(var y=0;y<ipValArray.length;y++){
                            if(ipValArray[y] == "" || ipValArray[y] == undefined){
                                alert("inputs are not in a valid format");
                                return;
                            }
                            if(i==0)
                            {
                                
                                $("#resultDiv").show();
                                $('#outLabel').show();
                                res = linearInterpolation(myData, ipValArray[y]);
                                resInd[i][y]=res;
                                resTable+="<tr><td align='right'><h3>Linear Interpolation for value <span style='color:green;'>"+ipValArray[y]+"</span>:</h3></td>"+resultCheck(res) +"</tr>";
                            }
                            else if(i==1)
                            {
                                if($('#deg')[0].value == "" || $('#deg')[0].value == 0 ){
                                    alert("Please enter the degree of the polynomial");
                                    return;
                                }
                                $("#resultDiv").show();
                                $('#outLabel').show();
                               
                                res = polynomialInterpolation(myData, ipValArray[y], deg);
                                resInd[i][y]=res;
                                resTable+="<tr><td align='right'><h3>Polyomial Interpolation for value <span style='color:green;'> "+ipValArray[y]+"<span>:</h3></td> "+resultCheck(res) +"</tr>";
                            }
                            else if(i==2)
                            {
                                $("#resultDiv").show();
                                $('#outLabel').show();
                                res = lagrangianMethodofInterpolation(myData, ipValArray[y]);
                                resInd[i][y]=res;
                                resTable+="<tr><td align='right'><h3>Lagrangian method of Interpolation for value <span style='color:green;'>"+ipValArray[y]+"</span> :</h3></td> "+resultCheck(res) +"</tr>";
                            }
                            else if(i==3)
                            {
                                $("#resultDiv").show();
                                $('#outLabel').show();
                                res = newtonDD(myData, ipValArray[y]);
                                resInd[i][y]=res;
                                resTable+="<tr><td align='right'><h3>Newtons Divided  & Difference Interpolation for value <span style='color:green;'>"+ipValArray[y]+"</span>:</h3></td> "+resultCheck(res) +"</tr>";
                            }
                        }
                        
                    }
                    else{
                        
                        if(inputVal == "" || inputVal == undefined || isNaN(inputVal))
                        {
                            alert("Please enter the input value");
                            $("#inputVal").focus();
                            return;
                        }
                            
                        interpolationInputArray = [inputVal];
                        if(i==0)
                        {
                            $("#resultDiv").show();
                            $('#outLabel').show();
                            res = linearInterpolation(myData, inputVal);
                            resInd[0][0]=res;
                            resTable+="<tr><td align='right'><h3>Linear Interpolation :</h3></td>"+resultCheck(res) +"</tr>";
                        }
                        else if(i==1)
                        {
                            if($('#deg')[0].value == "" || $('#deg')[0].value == 0 ){
                                alert("Please enter the degree of the polynomial");
                                return;
                            }
                            $("#resultDiv").show();
                            $('#outLabel').show();
                            res = polynomialInterpolation(myData, inputVal, deg);
                            resInd[1][0]=res;
                            resTable+="<tr><td align='right'><h3>Polyomial Interpolation :</h3></td> "+resultCheck(res) +"</tr>";
                        }
                        else if(i==2)
                        {
                            $("#resultDiv").show();
                            $('#outLabel').show();
                            res = lagrangianMethodofInterpolation(myData, inputVal);
                            resInd[2][0]=res;
                            resTable+="<tr><td align='right'><h3>Lagrangian method of Interpolation :</h3></td> "+resultCheck(res) +"</tr>";
                        }
                        else if(i==3)
                        {
                            $("#resultDiv").show();
                            $('#outLabel').show();
                            res = newtonDD(myData, inputVal);
                            resInd[3][0]=res;
                            resTable+="<tr><td align='right'><h3>Newtons Divided  & Difference Interpolation :</h3></td> "+resultCheck(res) +"</tr>";
                        }
                    }
                }
                
                
                
            }
            
            //alert("input  : "+interpolationInputArray);
            resTable+="</table>"
            $(resTrpseDiv).append(resTable);
            $(resTrpseDiv).show();
            $('#getChart').trigger("click");
            $('#chartDiv').show();
            
        }
    }
    else
    {
        //alert('im in data rearranement mode');
        for(var j=0;j<drRadios.length;j++)
        {
            if(drRadios[j].checked == true)
            {
                if(j==0)
                {
                    $("#resultDiv").show();
                    //                    $('#outLabel').show();
                    //                    var columnNames =[];
                    //                    var length = myData[0].length;
                    //                    var table = createTableStruct(length);
                    //                    $('#dragOut').html("").append(table);
                    //                    var tableObj = $('#dragTable')[0];
                    //                    try{
                    //                        dragtable.makeDraggable(tableObj);
                    //                    }catch(e){}
                    //                    
                    ////                    $(tableObj).find('th').each(function(ind){
                    //                        //                        //alert("in table object");
                    //                        //                        columnNames[ind] = this.getAttribute('name');  
                    //                        //                        alert(columnNames);
                    //                        //                    });
                    //                    
                    //                    $('#dragOut').show();
                    //                    resTrpseDiv.innerHTML = "<h4 align='left'>&rArr; Click on the table heading to view the data<br> \n\
                    //&rArr; Click on heading row to reverse the all columns data<br>\n\
                    //&rArr; Drag the heading columns to reorder the columns </h4>//";
                    //                    getDragTable(columnNames, myData);
                    $('#outLabel').show();
                    //var columnNames =[];
                    var length = myData[0].length;
                    var table = createTableStruct(length);
                    $('#dragOut').html("").append(table[0]);
                    var tableObj = $('#dragTable')[0];
                    try{
                        dragtable.makeDraggable(tableObj);
                    }catch(e){}
                    //alert("Arun Testing: "+e);
                    $('#dragOut').show();
                    resTrpseDiv.innerHTML = "&rArr; Click on heading row to reverse the all columns data<br>\n\
                                             &rArr; Drag the heading columns to reorder the columns";
                    getDragTable(table[1], myData);
                
                }
                else if(j == 1)
                {
                    $("#resultDiv").show();
                    $('#outLabel').show();
                    $('#dragOut').hide();
                    resTrpseDiv.innerHTML = transposeArray(myData);
                }
            }
                    
        }
    }
}


/**
*
****/
function resultCheck(res){
    var resultHtml = isNaN(res)?"<td><h3 style='color:red;'>Sorry the given value are out of range.</h3></td>":"<td align='left'><h3>"+(parseFloat(res)).toFixed(4)+"</h3></td>";
    return resultHtml;
}

/**
*Load the data into the data table
**/

function loadDataTable(data)
{
    var rowCount  = data.length;
    var colCount = data[0].length;
    var table = "<table id='dataTable' class='draggable' border='1' style='cursor:pointer' >";
    table+="<tr>";
    for(var j =0 ; j<colCount;j++)
    {
        table+="<th>Column "+(j+1)+"</th>";
    }
    table+="</tr>"
    table+="</table>"
}

/**
*This function returns the object of table and column names 
**/
function createTableStruct(len){
    //    var columnNames = [];
    //    var tbl     = document.createElement("table");
    //    var tblHead     = document.createElement("thead");
    //    var tblBody = document.createElement("tbody");    
    //    var row = document.createElement("tr");
    //    //alert('hi');
    //    for (var i = 0; i < len; i++) {
    //        var cell = document.createElement("th");
    //        //var td = document.createElement("td");
    //                    
    //        cell.setAttribute('name', 'one'+i);
    //        columnNames[i]='one'+i;
    //        var cellText = document.createTextNode("Column "+i+"");
    //        cell.appendChild(cellText);
    //        row.appendChild(cell);
    //    }
    //    tbl.setAttribute("border", "1"); 
    //    tbl.setAttribute("id", "dragTable");
    //    tblHead.appendChild(row);
    //    tbl.appendChild(tblHead);
    //    tbl.appendChild(tblBody);
    //    return tbl;
   
    var columnNames = [];
    var tbl     = document.createElement("table");
    var tblHead     = document.createElement("thead");
    var tblBody = document.createElement("tbody");    
    var row = document.createElement("tr");
    //alert('hi');
    for (var i = 0; i < len; i++) {
        var cell = document.createElement("th");
        cell.setAttribute('name', 'one'+i);
        columnNames.push('one'+i);
        var cellText = document.createTextNode("Column");
        //        var cellText = document.createTextNode("Column "+(i+1)+"");
        cell.appendChild(cellText);
        row.appendChild(cell);
    }
    row.setAttribute("id", "tblHead");
    tbl.setAttribute("border", "1"); 
    //tbl.setAttribute("class", "draggable");
    tbl.setAttribute("id", "dragTable");
    tblHead.appendChild(row);
    //$("tblHead").addClass("tableHeadOne");
    tbl.appendChild(tblHead);
    tbl.appendChild(tblBody);
    
    
    return [tbl,columnNames];
}
//alert(columnNames);
function getDragTable(cols,data){
    var dataTable = new DynamicTable(document.getElementById("dragTable"));
    dataTable.loadData(cols, data);    
}
/*
*This function clears all the check boxes
**/

function clearCheckBoxes(){
    $('#methods').find('input[type=checkbox]').each(function(ind){
        if(this.checked == true)
            this.checked = false;
    });
}


/**
*This function clears the radios off in the cal div section
**/
function clearRadios(){
    $(cdRadios).find('input[type=radio]').each(function(ind){
        if(this.checked == true)
            this.checked = false;
    });
}//end of the clear radios function.
/*
*This function validate the manual data entry fields 
**/
function validateDataFields(){
    var cells = $('.valid');
    var val = "";
    $(cells).each(function(ind){
        val = this.value;
        if(val == "")
        {
    //alert("The fields should not be blank at position "+ind);
    }
    });
}



/*
*The table takes the 2d array object and returns a table object
**/

function makeTable(arrayObj){
    var arraylen = arrayObj.length;
    var innerArrayLen = arrayObj[0].length;
    
    var table = "<table align='center' border='1' id='pTable' class='class='strippyRows'  width='50%' style='text-align: center;'>";
    
    for(var i =0;i<arraylen;i++)
    {
        table+="<tr>"
        for(var j = 0; j<innerArrayLen ; j++)
        {
           
            table+="<td>"+arrayObj[i][j]+"</td>";
        }
        table+="<tr>"
    }
    table+="</table>";
    // alert(table);
    //var d = new DOMElement();
    //d.makeAsStrippyTable(table, {
    //    CSS:'strippyTable'
    //});
    return table;
}

/*
*Thjis function used to sort 2d array
**/
function sort2dArray(dArray)
{
    for(var x=0;x<dArray.length;x++)
    {
        for(var y=0;y<dArray[0].length;y++)
            dArray[x][y] = Number(dArray[x][y]);
    }
    dArray.sort(function(a,b){
        return ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0));
    });
    return dArray
}


