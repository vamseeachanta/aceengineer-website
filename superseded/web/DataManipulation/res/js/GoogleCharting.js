/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * This Object Used to do the Base Charting Operation on the Google Charting Library
 * 
 */
function GoogleChart(chartObj,div){
    this.chart = chartObj;
    this.chartDiv = chartObj;
    this.dataTable = null;
    this.chartData = div;
    this.dataView = null;
    this.baseChartOpt = {
        width: 950,
        height: 400,
        //fontName : 'Lucida Sans Unicode',
        backgroundColor: '#ffffff',
        gridlines:{
            count:5
        },
        is3D: true,
        pointSize : 5,
        animation:{
            duration:500,
            easing:'easeIn'
        },
        title : "Title of this Chart",
        titleTextStyle:{
            color:'#276A4B',
            fontSize:20
        },
        
        // Horizantal Asix Configuration
        hAxis : {
            title : "Horizontal Heading",            
            titleTextStyle:{
                color:'#276A4B',
                fontSize:16
            },
            textStyle:{                
                fontSize:12
            },
            maxAlternation: 0
        },
        
        // Vertical Asix Configuration
        vAxis : {
            title:"Vertical Heading",
            titleTextStyle:{
                color:'#276A4B',
                fontSize:16
            },
            gridlines:{
                count:5,
                color:'grey'
            },
            textStyle:{                
                fontSize:12
            }
        },
        
        chartArea : {
            left:50,
            //top:50,
            width:"95%"
        //height:"75%"
        },
        legend :{
            position:'bottom'
        }
    }    
    
    this.init();
}


/**
 * This Method Used to Initialize the Google Chart
 */
GoogleChart.prototype.init = function(){    
    }

/**
 * This MEthod used to change the Base Options with the Given Options
 */
GoogleChart.prototype.loadOptions = function(opt){
    opt = !opt?{}:opt;
    this.baseChartOpt = $.extend(true,{}, this.baseChartOpt, opt);    
}

/**
 * This Method Used to Draw the Chart
 * @param header Header holds the Chart Head Info
 * @param data the Data To Be drawn
 * @param opt the Chart Options  
 * should be used
 * if baseOpt is true then the current Options will 
 */
GoogleChart.prototype.drawChart = function(header,data,opt){
    // first Upddating the Base Chart Options
    if(opt){
        this.loadOptions(opt);
    }
    
    this.dataTable = new google.visualization.DataTable();    
    
    for(var i=0;i<header.length;i++){
        this.dataTable.addColumn(header[i].type,header[i].name);
    }    
    this.dataTable.addRows(data);    
    this.dataView = new google.visualization.DataView(this.dataTable);    
    this.draw();
}

/**
 * This Method Usaed to Add new Rows
 */
GoogleChart.prototype.addRows = function(rows){
    this.dataTable.addRows(rows);
    this.dataView = new google.visualization.DataView(this.dataTable);
    this.draw();
}


/**
 * This MEthod Used to Draw the Chart
 * @param opt options to 
 */
GoogleChart.prototype.draw = function(opt){
    opt = !opt?{}:opt;    
    this.chart.draw(this.dataView,this.baseChartOpt);
    if(opt.dataDiv){
        this.drawData(opt.dataDiv);
    }
}

/**
 * This Method adds a new column to the Existin Data View of the Chart Data
 * @param column the type of the Column
 * @param data the data to be drawn
 * @param replace if it true then it updates the data of prevous column with the same name
 */
GoogleChart.prototype.addNewColumn = function(column,data,replace){
    try{        
        
        replace = !replace?false:replace;
       
        var colInd = -1;
        var n = this.dataTable.getNumberOfColumns();
        // if the user want to replace the column then Try to find the index of the Column
        if(replace){
            colInd = this.getColumnIndex(this.dataTable,column.name);        
        }
        
        // if the Column still not Found then Adds it
        if(colInd == -1){
            this.dataTable.addColumn(column.type,column.name);
            colInd = n;
        }
    
    
        for(var i=0;i<data.length;i++){
            this.dataTable.setCell(i,colInd,parseFloat(data[i]));
        }        
        this.dataView = new google.visualization.DataView(this.dataTable);
        this.draw();
        
    }catch(e){
        alert(e);
    }
}


/**
 * THis Method Removes the Specified Column from the Chart if it exists
 * other it does nothing
 * @param col the index of the Column to be Removed
 */
GoogleChart.prototype.removeColumn = function(col){
    this.dataTable.removeColumn(col);
    this.dataView = new google.visualization.DataView(this.dataTable);
    this.draw();
}

/**
* This Method get the Index of the Column name from the specified Data Table
* if the column name Dosen't Exist then it returns -1
* @param dataTable that DataTable object of the Google Chart API
* @param columnName the Name of the Column to be seach
*/
GoogleChart.prototype.getColumnIndex = function(dataTable,columnName){
    var n = dataTable.getNumberOfColumns();
    var cName;
    var ind = -1;
    for(var i=0;i<n;i++)
    {
        cName = this.dataTable.getColumnLabel(i);
        if(cName == columnName){
            ind = i;      
        }        
    }
    return ind;
}

/**
* This MEthod Used to draw the Current Data in  Tabular Format
* in the Specified Div
*/
GoogleChart.prototype.drawData = function(div){        
    }

/**
* This Method Used to Set the Chart Options
* this Will Entirly Replace the Base Chart Options
*/
GoogleChart.prototype.setOptions = function(opt){    
    }