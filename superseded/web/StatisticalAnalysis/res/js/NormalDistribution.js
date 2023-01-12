/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var radios = [];
var appTab = [];
var cells = [];
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
var distributionType;
var store = [];
var checker = true;
var checkerFlag1 = true;
var notANumber = NaN;              

var Input = {
    restrictToNumeric: function(ele,errorHandler){
        var ME = this;
        $(ele).keydown(function(evt){
            var key = evt.keyCode;
            // Checking for Signs they Should be First Character

            if(key==187 || key==189 || key==107 || key==109)
            {
                if($(ele).val().length>0)
                {
                    evt.preventDefault();
                    return;
                }
                return;
            }

            // Checking fot Decimel
            if(key==190 || key==110)
            {
                if($(ele).val().indexOf(".")>=0)
                {
                    evt.preventDefault();
                    return;
                }
                return;
            }
            if(ME.isNumeric(key) || key ==8 || key ==9)
            {
                return;
            }
            if(key == 46 || key == 37 || key == 39)
            {
                return;
            }
            evt.preventDefault();
        });
    },

    /**
     * This Method Checks whether the Given Key COde is Numeric or Not
     */
    isNumeric: function(code){
        return ( (code>=48&&code<=57) || (code>=96&&code<=105) );
    }
}

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
function changeMenu(ind)
{
    switch(ind)
    {
        case 0:
            $("#AppIntroduction").addClass("active");
            $("#Distributions").removeClass("active");
            $("#InputMode").removeClass("active");
            $("#OutputResults").removeClass("active");
            $("#introduction").show();
            $("#distSelectDiv").hide();
            $("#dataInputDiv").hide();
            $("#OutputResultsTab").hide();
            $("#sub").hide();
            $("#FirstImage").show();
            $("#SecondImage").hide();
            $("#ThirdImage").hide();
            $("#FourthImage").hide();
            break;
        case 1:
            $("#AppIntroduction").removeClass("active");
            $("#Distributions").addClass("active");
            $("#InputMode").removeClass("active");
            $("#OutputResults").removeClass("active");
            $("#introduction").hide();
            $("#distSelectDiv").show();
            $("#dataInputDiv").hide();
            $("#OutputResultsTab").hide();
            $("#sub").hide();
            $("#FirstImage").hide();
            $("#SecondImage").show();
            $("#ThirdImage").hide();
            $("#FourthImage").hide();
            break;
        case 2:
            $("#AppIntroduction").removeClass("active");
            $("#Distributions").removeClass("active");
            $("#InputMode").addClass("active");
            $("#OutputResults").removeClass("active");
            $("#introduction").hide();
            $("#distSelectDiv").hide();
            $("#dataInputDiv").show();
            $("#OutputResultsTab").hide();
            $("#sub").show();
            goBack();
            $("#FirstImage").hide();
            $("#SecondImage").hide();
            $("#ThirdImage").show();
            $("#FourthImage").hide();
            break;
        case 3:
            $("#AppIntroduction").removeClass("active");
            $("#Distributions").removeClass("active");
            $("#InputMode").removeClass("active");
            $("#OutputResults").addClass("active");
            $("#introduction").hide();
            $("#distSelectDiv").hide();
            $("#dataInputDiv").hide();
            $("#sub").hide();
            $("#OutputResultsTab").show();
            $("#FirstImage").hide();
            $("#SecondImage").hide();
            $("#ThirdImage").hide();
            $("#FourthImage").show();
            break;
    }
}
$(function()
{
    // loading the Initial Divisions
    radios = $(".inputMode");
    inputDiv = $('#inputDiv')[0];
    //adding The Listeners
    $(radios).each(function(ind)
    {
        $(this).click(function(){
            index = ind;
            document.getElementById('mydiv').value = index;
            handleInputMode(this,ind);
        });
    });
    var textValue = paramValue();
    if(textValue!=null)
    {
        distributionType = textValue;
        selectDistribution(textValue);   
        document.getElementById('selectDistribution').value = textValue;
    }
    opt = $('select[name="distribution"]')[0];
    $(opt).change(function()
    {
        distributionType = $(opt).val();
        selectDistribution($(opt).val());
    //        switch($(opt).val())
    //        {
    //            case "0":
    //                chooseFlag = false;
    //                $('#propertiesDiv').hide();
    //                break;
    //            case "1":
    //                $('#propertiesDiv').show();
    //                var introImageContent = "<img alt='add' src='res/images/Add.png' class='introducation'/>";
    //                flodFlag = false;
    //                $('#changeImage').html(introImageContent);
    //                $('.Distributions').show();
    //                $('#changeDistImage').html("<img alt='' src='res/images/minus.png' class='dist'/>");
    //                $('#propertiesDiv').addClass('propertiesCSS');
    //                $('#propertiesDiv').html("<p align='left'> In probability theory, the normal (or Gaussian) distribution is a continuous probability distribution that is often used as a first approximation to describe real-valued random variables that tend to cluster around a single mean value. The graph of the associated probability density function is 'bell' -shaped, and is known as the Gaussian function or bell curve. </p>");
    //                $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Normal1.JPG' alt=''width='400px'/></td>"
    //                    +"<td valign='top'><img src='res/images/normal(pdf).gif' alt='' width='500px'/></td></tr></table>");
    //                //                $('#propertiesDiv').append("<table align='center'><tr><td><table border='1' height='60px'><tr><td><table border='0'><tr><td>CDF  F<sub>x</sub>(k)  =  </td><td> <img src='res/images/CDF1.png' alt=''></td></tr></table></td></tr></table></td><td><table border='1' height='70px'><tr><td><table border='0'><tr><td>PDF f(x) =</td><td align='center'> <img src='res/images/PDF1.png' alt=''></td></tr></td></tr></table></td></tr></table></td></tr></table>"
    //                //                    +"<table ><tr><td style='Text-align:justify;font-size: 13px;font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif;'>Example for Normal Distribution curve :</td><td align='center'><img src='res/images/normal(pdf).gif' alt=''/></td></tr></table>");
    //                break;
    //            case "2":
    //                $('#propertiesDiv').show();
    //                $('#propertiesDiv').addClass('propertiesCSS');
    //                $('#propertiesDiv').html(" The Cauchy distribution is often used in statistics as the canonical example of a <b>'pathological'</b> distribution. ");
    //                $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Cauchy2.JPG' alt=''/></td>"
    //                    +"<td valign='top'><img src='res/images/Phase_II/Cauchy1.JPG' alt='' width='500px'/></td></tr></table>");
    //                break;
    //            case "3":
    //                $('#propertiesDiv').show();
    //                $('#propertiesDiv').addClass('propertiesCSS');
    //                $('#propertiesDiv').html(" In probability theory and statistics, the gamma distribution is a two-parameter family of continuous probability distributions. "+
    //                    "There are two different parameterizations in common use: With a shape parameter k and a scale parameter θ. ");
    //                $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Gamma2.JPG' alt=''/></td>"
    //                    +"<td valign='top'><img src='res/images/Phase_II/Gamma1.JPG' alt='' width='500px'/></td></tr></table>");
    //                break;
    //            case "4":
    //                $('#propertiesDiv').show();
    //                $('#propertiesDiv').addClass('propertiesCSS');
    //                $('#propertiesDiv').html("A Rayleigh distribution is often observed when the overall magnitude of a vector is related to its directional components. One example where the Rayleigh distribution naturally arises is when wind speed is analyzed into its orthogonal 2-dimensional vector components. ");
    //                $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Rayleigh2.JPG' alt=''/></td>"
    //                    +"<td valign='top'><img src='res/images/Phase_II/Rayleigh1.JPG' alt='' width='500px'/></td></tr></table>");
    //                break;
    //            case "5":
    //                $('#propertiesDiv').show();
    //                $('#propertiesDiv').addClass('propertiesCSS');
    //                $('#propertiesDiv').html(" The Weibull distribution is one of the most widely used lifetime distributions in reliability engineering. It is a versatile distribution that can take on the characteristics of other types of distributions, based on the value of the shape parameter, 'β'. ");
    //                $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Weibull2.JPG' alt=''/></td>"
    //                    +"<td valign='top'><img src='res/images/Phase_II/Weibull1.JPG' alt='' width='500px' height='400px'/></td></tr></table>");
    //                break;
    //        }
    //        chooseFlag = true;
    //        $('#propertiesDiv').show();
    });
    
});

function selectDistribution(value)
{
    switch(value)
    {
        case "0":
            chooseFlag = false;
            $('#propertiesDiv').html("<table style='height:350px;'><tr><td valign='top'>Select Any One Distribution from the Drop Down List...</td></tr></table>");
            break;
        case "1":
            $('#propertiesDiv').show();
            var introImageContent = "<img alt='add' src='res/images/Add.png' class='introducation'/>";
            flodFlag = false;
            $('#changeImage').html(introImageContent);
            $('.Distributions').show();
            $('#changeDistImage').html("<img alt='' src='res/images/minus.png' class='dist'/>");
            $('#propertiesDiv').addClass('propertiesCSS');
            $('#propertiesDiv').html("<p align='left'> In probability theory, the normal (or Gaussian) distribution is a continuous probability distribution that is often used as a first approximation to describe real-valued random variables that tend to cluster around a single mean value. The graph of the associated probability density function is 'bell' -shaped, and is known as the Gaussian function or bell curve. </p>");
            $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/NormalDist.PNG' alt=''width='400px'/></td>"
                +"<td valign='top'><img src='res/images/normal(pdf).gif' alt='' width='500px'/></td></tr></table>");
            //                $('#propertiesDiv').append("<table align='center'><tr><td><table border='1' height='60px'><tr><td><table border='0'><tr><td>CDF  F<sub>x</sub>(k)  =  </td><td> <img src='res/images/CDF1.png' alt=''></td></tr></table></td></tr></table></td><td><table border='1' height='70px'><tr><td><table border='0'><tr><td>PDF f(x) =</td><td align='center'> <img src='res/images/PDF1.png' alt=''></td></tr></td></tr></table></td></tr></table></td></tr></table>"
            //                    +"<table ><tr><td style='Text-align:justify;font-size: 13px;font-family:'Lucida Sans Unicode', 'Lucida Grande', sans-serif;'>Example for Normal Distribution curve :</td><td align='center'><img src='res/images/normal(pdf).gif' alt=''/></td></tr></table>");
            break;
        case "2":
            $('#propertiesDiv').show();
            $('#propertiesDiv').addClass('propertiesCSS');
            $('#propertiesDiv').html(" The Cauchy distribution is often used in statistics as the canonical example of a <b>'pathological'</b> distribution. ");
            $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Cauchy.PNG' alt=''/></td>"
                +"<td valign='top'><img src='res/images/Phase_II/Cauchy1.JPG' alt='' width='500px'/></td></tr></table>");
            break;
        case "3":
            $('#propertiesDiv').show();
            $('#propertiesDiv').addClass('propertiesCSS');
            $('#propertiesDiv').html(" In probability theory and statistics, the gamma distribution is a two-parameter family of continuous probability distributions. "+
                "There are two different parameterizations in common use: With a shape parameter k and a scale parameter θ. ");
            $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Gamma2.JPG' alt=''/></td>"
                +"<td valign='top'><img src='res/images/Phase_II/Gamma1.JPG' alt='' width='500px'/></td></tr></table>");
            break;
        case "4":
            $('#propertiesDiv').show();
            $('#propertiesDiv').addClass('propertiesCSS');
            $('#propertiesDiv').html("A Rayleigh distribution is often observed when the overall magnitude of a vector is related to its directional components. One example where the Rayleigh distribution naturally arises is when wind speed is analyzed into its orthogonal 2-dimensional vector components. ");
            $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Rayleigh2.JPG' alt=''/></td>"
                +"<td valign='top'><img src='res/images/Phase_II/Rayleigh1.JPG' alt='' width='500px'/></td></tr></table>");
            break;
        case "5":
            $('#propertiesDiv').show();
            $('#propertiesDiv').addClass('propertiesCSS');
            $('#propertiesDiv').html(" The Weibull distribution is one of the most widely used lifetime distributions in reliability engineering. It is a versatile distribution that can take on the characteristics of other types of distributions, based on the value of the shape parameter, 'β'. ");
            $('#propertiesDiv').append("<table align='center'><tr><td><img src='res/images/Phase_II/Weibull2.JPG' alt=''/></td>"
                +"<td valign='top'><img src='res/images/Phase_II/Weibull1.JPG' alt='' width='500px' height='400px'/></td></tr></table>");
            break;
    }
    if(value!=0)
    chooseFlag = true;
    $('#propertiesDiv').show();
}

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
/**
     * This Method handles the input change Mode
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
            hiding();
            $("#copyDiv").hide();
            $("#InputDescription").html("<p>"+
                "&bull;	The Frequency data mode let you enter the data with their corresponding Frequency.<br>"
                +"&bull;	Here the word frequency represents the number of occurrences of particular data."
                +"</p><span id='readmore' class='extendSpan' onclick='flodImage();'>Example...</span>");
            $("#imageDescription").hide();
            $("#imageDescription").html("<table align='center'><tr><td>"
                +"Ex:<br><table border='1' ><tr align='center'><th>Salary(Data Value)</th><th>No Of Employees(Frequency)</th></tr><tr><td>8000</td><td>44</td></tr><tr><td>10000</td><td>56</td></tr><tr><td>12000</td><td>32</td></tr><tr><td>18000</td><td>26</td></tr></table>"
                +"</td><td>"
                +"&bull;	The Above table describes the Frequency Data Input Mode.<br>"
                +"&bull;	The First Column 'Salary' is the Data Value, <br>"
                +"&bull;	Second Column 'No of Employees' is frequency.<br>"
                +"</td>"
                +"</tr>"
                +"</table><table>"
                +"<tr>"
                +"<td>"
                +"<span id='closeImage' class='extendSpan' style='display: none' onclick='openImage()'>^close</span>"
                +"</td>"
                +"</tr>"
                +"</table>");
            foldCheck = 0;
            designManualTable(ind);
            //                        $("#FFF").focus();
            checker = true;
            break;
        case 1:
            $("#Rawdata").removeClass("active");
            $("#Continuous").addClass("active");
            $("#Copy").removeClass("active");
            $("#Csv").removeClass("active");
            hiding();
            $("#copyDiv").hide();
            $("#copyandCsv").hide();
            $("#imageDescription").hide();
            $("#InputDescription").html("&bull;	The Grouped Frequency Data Mode let you enter the Data in more robust and simpler Manner.<br>"
                +"&bull;	Here the grouping means we categorize the data in to the blocks (Range).<br><span id='readmore' class='extendSpan' onclick='flodImage();'>Example..</span>");
            $("#imageDescription").html("<br>Let's take a small example that describes what it is.<br>"

                +"<table>"
                +"<tr><td>"
                +"<table border='1'>"
                +"<tr>"
                +"<th>"
                +"Age Group"
                +"</th>"
                +"<th>"
                +"Lower Limit"
                +"</th>"
                +"<th>"
                +"Upper Limit"
                +"</th>"
                +"<th>"
                +"Frequency"
                +"</th>"
                +"</tr>"
                +"<tr>"
                +" <td>"
                +"     Child"
                +" </td>"
                +"<td>"
                +"  1"
                +"</td>"
                +"<td>"
                +"  12"
                +"</td>"
                +"<td>"
                +"  150"
                +"</td>"
                +"</tr>"
                +"<tr>"
                +" <td>"
                +"     Teenage"
                +" </td>"
                +"<td>"
                +"  13"
                +"</td>"
                +"<td>"
                +"  19"
                +"</td>"
                +"<td>"
                +"  250"
                +"</td>"
                +"</tr>"
                +"<tr>"
                +" <td>"
                +"     Young"
                +" </td>"
                +"<td>"
                +"  20"
                +"</td>"
                +"<td>"
                +"  30"
                +"</td>"
                +"<td>"
                +"  200"
                +"</td>"
                +"</tr>"
                +"<tr>"
                +" <td>"
                +"     Middle"
                +" </td>"
                +"<td>"
                +"  31"
                +"</td>"
                +"<td>"
                +"  50"
                +"</td>"
                +"<td>"
                +"  100"
                +"</td>"
                +"</tr>"
                +"<tr>"
                +" <td>"
                +"     Old"
                +" </td>"
                +"<td>"
                +"  51"
                +"</td>"
                +"<td>"
                +"  100"
                +"</td>"
                +"<td>"
                +"  50"
                +"</td>"
                +"</tr>"
                +"</table>"
                +"</td>"
                +"<td>"
                +"------->>>>"
                +"</td>"
                +"<td>"
                +"<table border='1'><th >Age Group</th><th>Years</th><th>Frequency</th><tr><td>Child</td><td>1-12</td><td>150</td></tr><tr><td>Teen</td><td>13-19</td><td>250</td></tr><tr><td>Young</td><td>20-30</td><td>200</td></tr><tr><td>Middle</td><td>31-50</td><td>100</td></tr><tr><td>Old</td><td>50+</td><td>50</td></tr></table></td>"
                +"</tr></table>"
                +"<p align='justify'>We have 1000 People Information at Location XYZ. Now we want to analysis on their Ages. <br/> If there are Maximum of 100 types of Data Values (1 2 3 4 ..) then the entire data can be represented in 100 Rows. But assume that the types of Data Values Increase Rapidly then the Size of the Rows Also Increases so this won't be much effective when we are dealing with large amount of data, in that case we can use the 'Grouped Frequency Data Mode'. This will categorize the data in to the Equal Blocks (Range) take a look below.</p>"
                +"<br>For the current Data (People Ages) we can categorize the data based on their Age group like 'Child' ,'Teen',  'Young', 'Middle', 'Old'.<br>The Data Ranges for these groups are : <br>"
                +"<table><tr><td>"
                +"<span id='closeImage' class='extendSpan' style='display: none' onclick='openImage()'>^close</span>"
                +"</td>"
                +"</tr>"
                +"</table>");
            designManualTable(ind);
            //                        $("#FFF").focus();
            checker = true;
            foldCheck = 1;
            break;
        case 2:
            $("#Rawdata").removeClass("active");
            $("#Continuous").removeClass("active");
            $("#Copy").addClass("active");
            $("#Csv").removeClass("active");
            hiding();
            $("#sub").hide();
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
                +"&bull;    If your data didn't meet the Above Requirements then you can't use this Input Mode</p>"
                +"&nbsp;&nbsp;    The Available Data Input Modes are...."
                +"<br/>&bull; <span id='CopyPaste1'>Data and Frequency Mode of Data <img src='res/images/correct.png' alt='' id='DataandFrequency' style='display:none;'/></span>"
                +"<br/>&bull; <span id='CopyPaste2'>Grouped Frequency Mode of Data <img src='res/images/correct.png' alt='' id='GroupedData' style='display:none;'/></span>"
                +"<br/>&bull; <span id='CopyPaste3'>General data (RAW Data) <img src='res/images/correct.png' alt='' id='GeneralData' style='display:none;'/></span>");
            $("#imageDescription").hide();
            $("#copyandCsv").hide();
            content = "Please Enter your data below :<br/><textarea rows='12' cols='60' name='mydata' id='myData' onclick='PreviewSubmit()' onkeydown='checkTextArea(event)' ></textarea><br/><input type='button' name='preview' id='preview' value='Preview' onclick='checkData()' class='Mybutton'/>";
            inputDiv.innerHTML = content;
            //                        verify = false;
            checker = false;
            foldCheck = 2;
            break;
        case 3:
            $("#Rawdata").removeClass("active");
            $("#Continuous").removeClass("active");
            $("#Copy").removeClass("active");
            $("#Csv").addClass("active");
            hiding();
            $("#copyDiv").hide();
            $("#InputDescription").html("<p>This mode let you upload a large amount of file easily. But the file should be meet the following Requirements<br><br>"
                +"&bull;	The File Should Contain the Numeric Data Only<br>"
                +"&bull;	The file should be a CSV (Comma Separated Values). You can easily make a CSV file Using Microsoft Excel.<br><br></p>");
            $("#imageDescription").hide();
            $("#copyandCsv").show();
            $("#copyandCsv").html("Format of CSV File is... <br><table border='1'><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr></table>");
            $(".subSelection").html("");
            try
            {
                $('.controlDiv').remove();
            }
            catch(e){
            }
            flag = false;
            content = "<input type='file' name='csvFile' onchange='getName(this.value)'/>";
            inputDiv.innerHTML = content;
            verify = false;
            checker = false;
            foldCheck = 3;
            break;
    }
}

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
/**
     * This Methodis used to designt he Table in the specified mode
     */
function addRow(val) 
{
    var table = document.getElementById('dataTable');
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    var cell1 = row.insertCell(0);
    var element1 = document.createElement("input");
    element1.type = "text";
    element1.setAttribute('name','FirstFocus');
    cell1.appendChild(element1);
    Input.restrictToNumeric(element1,"");

    var cell2 = row.insertCell(1);
    var element2 = document.createElement("input");
    element2.setAttribute('name','SecondFocus');
    cell2.appendChild(element2);
    Input.restrictToNumeric(element2,"");
    var cell3 = row.insertCell(2);
    var element3 = document.createElement("input");
    if(val == 2)
    {
        //        var cell3 = row.insertCell(2);
        //        var element3 = document.createElement("input");
        element3.type = "checkbox";
        element3.setAttribute('name','chk');
        cell3.appendChild(element3);
    }
    if(val ==3)
    {
        //        var cell3 = row.insertCell(2);
        //        var element3 = document.createElement("input");
        element3.setAttribute('name','ThirdFocus');
        cell3.appendChild(element3);
        Input.restrictToNumeric(element3,"");

        var cell4 = row.insertCell(3);
        var element4 = document.createElement("input");
        element4.type = "checkbox";
        element4.setAttribute('name','chk');
        cell4.appendChild(element4);
        Input.restrictToNumeric(element4,"");
    }
    $('input[name="FirstFocus"]').focus();
    $(function(){
        if(val == 2)
        {
            $(element1).bind('keydown',function(evt)
            {
                var key = evt.keyCode;
                if(key == 13)
                {
                    if($(element1).val() >0)
                    {
                        $(element2).focus();
                    }
                }
            });
            $(element1).blur(function()
            {
                dataValidate(element1,$(element1).val());
            });
            $(element2).bind('keydown',function(evt)
            {
                var key = evt.keyCode;
                if(key==109 || key == 189 || key == 110 || key == 190)
                {
                    evt.preventDefault();
                }
                if(evt.keyCode == 13)
                {
                    if($(element2).val() >0)
                    {
                        addRow(2);
                    }
                }
            });
            $(element2).blur(function()
            {
                dataValidate(element2,$(element2).val());
            });
        }
        if(val == 3)
        {
            $(element1).bind('keydown',function(evt)
            {
                var key = evt.keyCode;
                if(key == 13)
                {
                    if($(element1).val() >0)
                    {
                        $(element2).focus();
                    }
                }
            });
            $(element1).blur(function()
            {
                dataValidate1(element1,$(element1).val());

            });
            $(element2).bind('keydown',function(evt)
            {

                var key = evt.keyCode;
                //                if((key<48 || key>57) && (key<96 || key>105) && key!=13 && key!=8 && key!=109 && key!=189 && key!=110 && key!=190)
                //                {
                //                    evt.preventDefault();
                //                }
                if(evt.keyCode == 13)
                {
                    if(parseFloat($(element2).val()) > parseFloat($(element1).val()))
                    {
                        $(element3).focus();
                    }
                }
            });
            $(element2).blur(function(){
                dataValidate2(element2,$(element2).val(),element1);
            });
            $(element3).blur(function(){
                dataValidate(element3,$(element3).val());
            });
            $(element3).bind('keydown',function(evt){
                var key = evt.keyCode;
                if(key==109 || key == 189 || key == 110 || key ==190)
                {
                    evt.preventDefault();
                }
                if(key == 13)
                {
                    if($(element3).val() >0)
                    {
                        addRow(3);
                    }
                }
            });
        }
    });
}
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
        alert("Upper Limit should grater than the Lower limit");
        $(obj).focus();
        return false;
    }
    return true;
}
function deleteRow(val) {
    try {
        var chkbox;
        var table = document.getElementById('dataTable');
        var rowCount = table.rows.length;
        for(var i=0; i<rowCount; i++) {
            var row = table.rows[i];
            chkbox = row.cells[val].childNodes[0];
            if(null != chkbox && true == chkbox.checked) {
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }
    }catch(e) {
    }
}
function checkEnter(evt,value,obj,val)
{
    Input.restrictToNumeric(obj,"");
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
function designManualTable(ind)
{
    var content = "";
    if(ind == 0)
    {
        content =
        "<TABLE id='dataTable' width='350px' border='1'>"+
        "<tbody>"+
        "<th>"+
        "Data Value"+
        "</th>"+
        "<th>"+
        "Frequency"+
        "</th>"+
        "<th>"+
        "<img src='res/icons/delete.png' alt='' onclick='deleteRow(2)' title='To Delete a row'/>"+
        "</th>"+
        "</tbody>"+
        "<TR>"+
        "<TD> <INPUT type='text' id='FFF'  onblur='dataValidate(this,this.value)' onkeydown='moveNext(event,1,this,this.value)'/> </TD>"+
        "<td> <input type='text' name='SecondFocus' id='DataValueSec' onblur='dataValidate(this,this.value)' onkeydown='checkEnter(event,2,this,this.value)'/></td>"+
        "<TD><INPUT type='checkbox' name='chk' /></TD>"+
        "</TR>"+
        "</TABLE>"+
        "<INPUT type='button' value='Add Row' onclick='addRow(2)'/>"+
        "<INPUT type='button' value='Delete Row' onclick='deleteRow(2)'/>";
        verify = true;
        datalength = 2;
        validFlag = true;
    }
    else
    {
        content =
        "<TABLE id='dataTable' width='350px' border='1'>"+
        "<tbody>"+
        "<th>"+
        "Lower Limit"+
        "</th>"+
        "<th>"+
        "UpperLimit"+
        "</th>"+
        "<th>"+
        "Frequency"+
        "</th>"+
        "<th>"+
        "<img src='res/icons/delete.png' alt='' onclick='deleteRow(3)' title='To Delete a row'/>"+
        "</th>"+
        "</tbody>"+
        "<TR>"+
        "<TD> <INPUT type='text' id='FFF'  onblur='dataValidate1(this,this.value)' onkeydown='moveNext(event,2,this,this.value)'/> </TD>"+
        "<TD> <INPUT type='text' name='SecondFocus' id='GroupedSec' onblur='dataValidate(this,this.value);upperLower(this,this.value);' onkeydown='moveNext(event,3,this,this.value)'/> </TD>"+
        "<td> <input type='text' name='ThirdFocus' id='GroupedThr' onblur='dataValidate(this,this.value)' onkeydown='checkEnter(event,3,this,this.value)'/></td>"+
        "<TD><INPUT type='checkbox' name='chk'/></TD>"+
        "</TR>"+
        "</TABLE>"+
        "<INPUT type='button' value='Add Row' onclick='addRow(3)'/>"+
        "<INPUT type='button' value='Delete Row' onclick='deleteRow(3)'/>";
        verify = true;
        datalength = 3;
        validFlag = true;
    }
    $(inputDiv).html(content);
}

/*
     *this function is call before submit a form
     *which verifies the all kind of verifications.
     */

function upperLower(obj,val)
{
    if(parseFloat($("#FFF").val())>= parseFloat(val))
    {
        alert("Upper value should be grater of Lower value");
        $(obj).focus();
        return false;
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
                alert("Upper value should be grater of Lower value");
                $(obj).focus();
                return false;
            }
            $('#GroupedThr').focus();
        }
    }
}

function getSubmit()
{
    if(chooseFlag == false)
    {
        alert("Please select any one distribution");
        return false;
    }
    else if(flag == false)
    {
        alert("Sorry!!! Please give correct datapoints");
        return false;
    }
    else if(validFlag == false)
    {
        alert("Please provide inputs");
        return false;
    }
    else{
        $('#MYTAB').show();
        //                    $('#propertiesDiv').hide();
        if(foldCheck == 0)
        {
            $('#row3').show();
            $('#rrow3').show();
            $('#rrr3').show();
            $('#row1').hide();
            $('#rrow1').hide();
            $('#rrr1').hide();
            $('#row2').show();
            $('#rrow2').show();
            $('#rrr2').show();
            $('#myInterval').show();
        }
        if(foldCheck == 1)
        {
            $('#row3').hide();
            $('#rrow3').hide();
            $('#rrr3').hide();
            $('#myInterval').hide();
            $('#row1').hide();
            $('#rrow1').hide();
            $('#rrr1').hide();
        }
        if(foldCheck == 2)
        {
            $('#row3').show();
            $('#rrow3').show();
            $('#rrr3').show();
            $('#row1').show();
            $('#rrow1').show();
            $('#rrr1').show();
            $('#myInterval').show();
        }
        if(foldCheck == 3)
        {
            $('#row3').show();
            $('#rrow3').show();
            $('#rrr3').show();
            $('#row1').show();
            $('#rrow1').show();
            $('#rrr1').show();
            $('#myInterval').show();
        }
        if(checker == true){
            store = [];
            var i =0;
            $("#dataTable").find('tr').each(function(){
                $(this).find('td').each(function(){
                    if($(this).find('input').val()!= "on")
                    {
                        store[i] = $(this).find('input').val();
                        i++;
                    }
                });
            });
            for(var j=0;j<i;j++)
            {
                if(store[j] == "")
                {
                    alert("Please Provide Inputs");
                    return false;
                }
            }
            if(store == "" && verify == true)
            {
                alert("Please Provide Inputs");
                return false;
            }
        }
        if(store!="")
        {
            temp = store;
        }
        store = temp;
        $('#sub').hide();
        changeMenu(3);
        document.forms[0].action="dataFittingAction.do?storecell="+store+"&data="+datalength+"&verify="+verify+"&copyFlag="+copyFlag+"&distributionType="+distributionType+"&notANumber="+notANumber;
        document.forms[0].submit();
        flag = true;
    }
}
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
}
function checkData()
{
    $("#preview").hide();
    var dataOfCopy = $("#myData").val();
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
        var regEx = new RegExp("[!@#$%^&*()]");
        if(dataOfCopy[i] == undefined || regEx.test(dataOfCopy[i])){
            alert("Data is in invalid format");
            return;
        }
        if(dataOfCopy[i] == ".")
        {
            if(!(bfd.test(dataOfCopy[i+1]) || bfd.test(dataOfCopy[i-i])))
            {
                alert("Data is in invalid format");
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
    for(var i in splitData)
    {
        if(splitData[i] != "")
        {
            rowCount++;
        }
    }
    for(var i in splitData)
    {
        var count = 0;
        var spaceRemove = splitData[i].split(" ");
        for(var j in spaceRemove)
        {
            if(spaceRemove[j] != "")
            {
                storeCopyData[Tcount] = spaceRemove[j];
                count++;
                Tcount++;
            }
        }
        if(count>3 || count==1)
        {
            temp = true;
        }
    }
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
        foldCheck = 2;
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

}
function PreviewSubmit()
{
    $("#preview").show();
    $("#sub").hide();
}
$(function(){
    var ij=0;
    $('input[name="chk"]').each(function(){
        alert("the hover value is "+ij);
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
    document.forms[5].action="GroupedMode.do?interval="+interval;
    document.forms[5].submit();
}
function getJsp2()
{
    //                verify = false;
    //                $('#sub').show();
    $('#secondIframe').show();
    var intval =0;
    //    document.forms[6].action="second.do?interval="+intval;
    //    document.forms[6].submit();
    document.forms[6].action="GroupedMode.do?interval="+intval;
    document.forms[6].submit();
}
function getJsp1(val)
{
    //                verify = false;
    //                $('#sub').show();
    $('#firstIframe').show();
    var value = val;

    document.forms[3].action="RawMode.do";
    document.forms[3].submit();
}
function getJsp3(val)
{
    //                verify = false;
    //                $('#sub').show();
    $('#thirdIframe').show();
    var value = val;
    document.forms[4].action="FrequencyMode.do";
    document.forms[4].submit();
}
function getData1()
{
    $('#MYTAB').show();
    $('#iframe1').show();
    $('#myButton1').show();
    $('#myProceed1').show();
    $('#firstIframe').hide();
    document.forms[1].action="RawData.jsp";
    document.forms[1].submit();
}
function getData2()
{
    $('#MYTAB').show();
    $('#iframe2').show();
    $('#myButton2').show();
    $('#myProceed2').show();
    //                $('#myInterval').show();
    $('#secondIframe').hide();
}
function getData3()
{
    $('#MYTAB').show();
    $('#iframe3').show();
    $('#myButton3').show();
    $('#myProceed3').show();
    $('#thirdIframe').hide();
    document.forms[2].action="FrequencyData.jsp";
    document.forms[2].submit();
}
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
}
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
}
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
}
$(function(){
    var tool = new ToolTip($('*'),{
        divCSS:''
    });
});

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
            '-moz-border-radius':'10px',
            '-moz-box-shadow': '2px 4px 4px black',
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
