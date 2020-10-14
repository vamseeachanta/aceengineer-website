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
        width: 900,
        height: 380,
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
            top:50,
            width:"100%"
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
    if(opt.title)
        this.baseChartOpt.title = opt.title;
    if(opt.hTitle)
        this.baseChartOpt.hAxis.title = opt.hTitle;
    if(opt.vTitle)
        this.baseChartOpt.hAxis.title = opt.vTitle;
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
