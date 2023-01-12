/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



function doAjax(url,msg,callBackFunction)
{
    //alert("Retriving Data For Ticker :"+url);
    //alert("url is  : "+encodeURIComponent(url));
    // if the URL starts with http
    if(url.match('^http'))
    {        
        //alert(encodeURIComponent(url));
        // assemble the YQL call
        //msg.html(' (loading...)');
        $.getJSON("http://query.yahooapis.com/v1/public/yql?"+
            "q=select%20*%20from%20html%20where%20url%3D%22"+
            encodeURIComponent(url)+
            "%22&format=xml'&callback=?",
            function(data)
            {
                if(data.results[0])
                {
                    var filteredData = filterData(data.results[0]);                    
                    //msg.html(' (ready.)');
                    //container = filteredData;
                    //$(container).html(filteredData);
                    callBackFunction(filteredData);
                }
                else 
                {
                    // triggering the Callback function with null to indicate an error
                    callBackFunction(null);
                    msg.html(' (error!)');
                    msg.addClass('error');
                    var errormsg = '<p>Error: could not load the page.</p>';
                    container.
                    html(errormsg).
                    focus().
                    effect('highlight',{
                        color:'#c00'
                    },1000);
                }
            });
    }
    else 
    {
        $.ajax({
            url: url,
            timeout:5000,
            async:false,
            success: function(data){
                msg.html(' (ready.)');
                container.
                html(data).
                focus().
                effect("highlight",{},1000);
            },
            error: function(req,error){
                msg.html(' (error!)');
                msg.addClass('error');
                if(error === 'error'){
                    error = req.statusText;
                }
                var errormsg = 'There was a communication error: '+error;
                container.
                html(errormsg).
                focus().
                effect('highlight',{
                    color:'#c00'
                },1000);
            },
            beforeSend: function(data){
                msg.removeClass('error');
                msg.html(' (loading...)');
            },
            async: false
        });
    }
}

function filterData(data){
    // filter all the nasties out
    // no body tags
    data = data.replace(/<?\/body[^>]*>/g,'');
    // no linebreaks
    data = data.replace(/[\r|\n]+/g,'');
    // no comments
    data = data.replace(/<--[\S\s]*?-->/g,'');
    // no noscript blocks
    data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
    // no script blocks
    data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
    // no self closing scripts
    data = data.replace(/<script.*\/>/,'');
    // [... add as needed ...]
    return data;
}