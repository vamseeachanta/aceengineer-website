/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Charting ={
    
    /**
     * This Method used to draw the Chart with the specified chart Object
     * and the chart Options     
     */
    drawChart:function(chartObj,chartData,chartOpt,options){
        var view = new google.visualization.DataView(chartData);
        //view.setRows(0,4);
        var rows = chartData.getNumberOfRows();
        for(var i=0;i<rows;i++)
        {
            view.setRows(0,i);
            chartObj.draw(view,chartOpt);
        }        
    },
    
    /**
     * This Method get the image data of the given chart container
     */
    getImgData: function(chartContainer)
    {
        var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
        var svg = chartArea.innerHTML;
        var doc = chartContainer.ownerDocument;
        var canvas = doc.createElement('canvas');
        canvas.setAttribute('width', chartArea.offsetWidth);
        canvas.setAttribute('height', chartArea.offsetHeight);
        
        canvas.setAttribute(
            'style',
            'position: absolute; ' +
            'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
            'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
        doc.body.appendChild(canvas);
        canvg(canvas, svg);
        var imgData = canvas.toDataURL("image/png");
        canvas.parentNode.removeChild(canvas);
        return imgData;
    },
    
    
    /**
     * This method saves the image in the given container
     */
    saveImages: function(data,handler)
    {
        var data1;
        for(var i=0;i<data.length;i++)
        {
            data1= Charting.getImgData(data[i].imageDiv);
            data1 = data1.replace('data:image/png;base64,', '');
            data[i].imageData = data1;
        }
        
        //alert(data1);
        var xml = NCore.makeXMLObject();
        //        $.post("imageWriter.do", {
        //            'size':'1',
        //            'imgData1':encodeURIComponent(data1),
        //            'imgName1':'image.png'
        //        }, function(response){
        //            alert(response);
        //        },"application/x-www-form-urlencoded");
        xml.open("POST", "imageWriter.do", true);
        //Send the proper header information along with the request
        xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    
        xml.onreadystatechange = function()
        {
            if(xml.readyState==4 && xml.status==200)
            {
                if(handler){
                    handler(xml.responseText);
                    
                }                
            }
        }
        var query = "size="+data.length;
        for(var i=0;i<data.length;i++){
            query += "&imgData"+(i+1)+"="+encodeURIComponent(data[i].imageData)+"&imgName"+(i+1)+"="+data[i].imageName;
        }
        xml.send(query);
    }
}