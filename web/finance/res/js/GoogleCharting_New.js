/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var GooleCharting = 
{
    getImgData: function(chartContainer) 
    {
        try
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
            var imgData = canvas.toDataURL('image/png');
            canvas.parentNode.removeChild(canvas);
        }catch(e)
        {
            alert("Exception in Google Chart JS: \n "+e);
        }
        return imgData;
    }
}

