/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */




function loadApplicationsTable()
{
    blocks = $('table.appBlocksTable td');
    blocks.each(function()
    {
        $(this).children('a.appHeading').hover(function()
        {
            $(this).fadeTo(500, 0.5, null);
            $(this).siblings('div').slideUp(100, 'swing',null).slideDown(600,'linear', null);
        }, function()
        {
            $(this).siblings('div').slideUp(400,'swing', null);
            $(this).fadeTo(500, 1.0, null);
        });
    });
}
/**This function used to show the hidden contact us link when hover on the about us link***/
function menu(){
    $('.hasSubMenu').hover(
        function(){
            //$(this).find('ul').slideDown(300, null);
            $(this).find('ul').show(1000).stop(true,true);
        //            $(this).find('ul').animate({
        //                opacity:1.0,
        //                display:'block'
        //            }, 1000, 'linear', null);
        },function(){
            //$(this).find('ul').slideUp(100, null);
            $(this).find('ul').hide(100).stop(true,true);
        //            $(this).find('ul').animate({
        //                opacity:0,
        //                display:'none'
        //            }, 1000, 'linear', null);
        });
}

/**This function used to show image rotation on home screen***/
function imageRotator(){
    obj=function(name){
        return document.getElementById(name)
    }
    var speed=30;
    obj("emptyDiv").innerHTML=obj("imagesDiv").innerHTML;


    function Marquee(){

        var length = obj("emptyDiv").offsetTop-obj("main").scrollTop;

        if(length<=0)

            obj("main").scrollTop-=obj("imagesDiv").offsetHeight;
        else
            obj("main").scrollTop++;
    }
    var Mar=setInterval(Marquee,speed)
}
        //                    obj("img").onmouseover=function() {clearInterval(MyMar)}
        //
        //                    obj("img").onmouseout=function(){MyMar=setInterval(Marquee,speed)}