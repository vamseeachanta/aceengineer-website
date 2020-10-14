<!DOCTYPE html>
<html lang="en">
<head>
    <title>portfolio</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="images/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/grid.css">
    <link rel="stylesheet" href="css/style1.css">
    <link rel="stylesheet" href="css/isotope.css"/>
    <script src="js/jquery.js"></script>
    <script src="js/jquery-migrate-1.2.1.js"></script>
    <script src="js/jquery.equalheights.js"></script>
    <script src='js/isotope.min.js'></script>

    
     <style>
         
         
            .portfolioTabs {
    border-bottom: 1px solid #e7e6e6;
       border-bottom: 1px solid #2E5C00;
    border-top: 1px solid #2E5C00;
    height: auto;
    line-height: 34px;
    list-style: outside none none;
    margin: 0 0 58px;
    overflow: hidden;
    padding: 0;
    width: 800px;
}
.portfolioTabs li {
    float: left;
    margin-right: 30px;
}
.portfolioTabs li.active {
    background: none repeat scroll 0 0 #555;
    background: none repeat scroll 0 0 #F0F0F0;
    color: white;
    line-height: 31px !important;
    padding: 0 10px;
}
.portfolioTabs li.active a {
   border-color: #F0F0F0 !important;
    border-top-style: solid;
    border-top-width: 3px;
    color: #0F4B55 !important;
}

        .post_header {
    /*background: none repeat scroll 0 0 #2964b6;*/
    background: none repeat scroll 0 0 #02918D;
}
.post_header a {
    text-decoration: none;
}

.post_header h2 {
/*    font-size: 30px;
    line-height: 30px;
    padding-left: 10px;*/

 color: white;
    font-size: 33px;
    line-height: 35px;
    padding-left: 10px;
}
    </style>
    
    <script>
        
        $(function (){
            $('.portfolioTabs #FirstItemShow').addClass('active').siblings().removeClass('active');
            $( ".portfolioTabs #FirstItemShow" ).trigger( "click" );
           $('.portfolioTabs li').click(function() {
//    alert(";");                
//                   var linktext=$(this).find("a").text();
//                     PortfiloDataShow(linktext);
                      $(this).addClass('active').siblings().removeClass('active');
//                      FirstItemShow
                }); 
        });
    
    </script>
</head>
<body>
<div class="page">
<!--========================================================
                          HEADER
=========================================================-->
<header id="header">
    <div id="stuck_container">
        <div class="container">
            <div class="row">
                <div class="grid_12">
                    <div class="brand put-left">
                        <h1>
                            <a href="index.html">
                                <img src="images/AceOrginal_new.JPG" style="width: 250px; padding-left:0px;" alt="Logo"/>
                            </a>
                        </h1>
                    </div>
<!--         <nav class="nav put-right">
              <h2 class="header_2 color_3">
                    Java  Portfolio Applications
                </h2>
             <ul class="sf-menu">
                            <li ><a href="index.php">Home</a></li>
                            <li>
                                <a href="Service.php">Services</a>
                            </li>
                            <li class="current"><a href="Portfolio.php">Portfolio</a></li>
                            <li><a href="AboutUs.php">About us</a></li>
                            <li><a href="About.php">About us</a></li>
                            <li><a href="Carrer_new.php">Careers</a></li>
                            <li><a href="http://aceengineer.com/blog.php">Blog</a></li>
                            <li><a href="contactUs.php">Contact Us</a></li>
                        </ul>

                    </nav>-->
<div style="padding-bottom: 2%;"></div>
<div style="text-align: center;">
 <h2 class="header_2 color_3">
                    Java  Portfolio Applications
                </h2>
                </div>
                </div>
            </div>
        </div>
    </div>
</header>
<!--========================================================
                          CONTENT
=========================================================-->
<section id="content">
    <!--<div class="ic">More Website Templates @ TemplateMonster.com - September08, 2014!</div>-->
<!--    <div class="container">

          <div class="row wrap_13">
            <div class="grid_12">
               
                <div class="text_7 color_2">
                    <div style="display : inline-block;margin-top :0.5%;">Categories:</div> 
                    <ul id="filters" class="portfolioTabs">
                        <li><a href="#" data-filter="">Categories:</a></li>
                        <li id="FirstItemShow"><a href="#" data-filter="*">Show All</a></li>
                        <li id="SecondItemShow"><a href="#"  data-filter="c1">Web Applications</a></li>
                        <li><a href="#" data-filter="c2">iOS Apps</a></li>
                        <li><a href="#" data-filter="c3">Andriod Apps</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>-->
 <hr/>
    <div class="container wrap_10">
        
          <div class="row">
                <div class="grid_12">    
<!--        <div  style="padding-top: 30px;">
                <h2 class="header_2 color_3">
                    Java Web Portfolio Applications
                </h2>
            </div>-->

        </div>
              
          </div>
    </div>

    <div class="bg_1" style="padding-bottom: 0px; padding-top: 22px;">
        <div class="container">
            <div class="row">
               
                <div class="grid_12">
                    
                    <div class="isotope row">

                                 <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    
                                    <a target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp"> <img alt="VM Stress Logo" src="JavaPortfolioImg/Mechanical.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp">VM Stress</a></h3>
                                    <p class="text_3">
                                    This application calculates stress in a specified pipe using tension, bending moment and pressure forces..
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp">read more</a></div>
                            </div>
                        </div>


                               <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                   
                                    <a target="_blank" href="http://aceengineer.com/StatisticalAnalysis/"> <img alt="Statistical Analysis Logo" src="JavaPortfolioImg/statistics.jpg"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/StatisticalAnalysis/"> Statistical Analysis</a></h3>
                                    <p class="text_3">
                                    Evaluate probability and cumulative probability based on measured data and expected distribution type...
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/StatisticalAnalysis/">read more</a></div>
                            </div>
                        </div>
                        
                               <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/scien.PNG" style="height: 40%;width: 40%" alt="Image 2"/>-->
                                    <!--<a target="_blank" href="http://www.imagesco.com/"> <img alt="Calendar" src="portfilo/scien_new.png" style="float: left;height:30%;width: 30%;"></a>-->
                                    <a target="_blank" href="http://aceengineer.com/StructuralAnalysis/"> <img alt="Structural Analysis Logo" src="JavaPortfolioImg/Structural.jpg"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a></h3>
                                    <p class="text_3">
                                      Beam calculations are given for popular building materials, typical engineering cross sections
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/StructuralAnalysis/">read more</a></div>
                            </div>
                        </div>
               
                              <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://aceengineer.com/FluidMechanics/"> <img alt="Fluid Mechanics Logo" src="JavaPortfolioImg/fluid.jpg"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/FluidMechanics/">Fluid Mechanics</a></h3>
                                    <p class="text_3" style="padding-bottom:  6%;">
AceEngineer has developed two applications using simple conservation of energy and ideal gas laws.
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/FluidMechanics/">read more</a></div>
                            </div>
                        </div>
                        
                              <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/hairby.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://aceengineer.com/DataManipulation/"> <img alt="Data Management  Logo" src="JavaPortfolioImg/Webinar.jpg"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/DataManipulation/">Data Management Applications</a></h3>
                                    <p class="text_3"  style="padding-bottom:  6%;">
The data management applications utilize database design and database interface. These applications are capable of adding...

                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/DataManipulation/">read more</a></div>
                            </div>
                        </div>
             
             
                                  <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://sixthwing.com/PMS/"> <img alt="PMS Logo" src="JavaPortfolioImg/PMS_new.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://sixthwing.com/PMS/">PMS</a></h3>
                                    <p class="text_3">
<!--Project management software is a term covering many types of software, including estimation and planning, scheduling, cost control and budget management, allocation, collaboration, communication, quality management--> 
<!--Project management  software is a term covering many types of software, including estimation and planning, scheduling, cost control and budget management.<br/>-->
link is: <a target="_blank" href="http://sixthwing.com/PMS">http://sixthwing.com/PMS</a> <br/>
username: AceEngineer@engineeringfirm.com
password: AceEngineer                                    
<!--and documentation or administration systems, which are used to deal with the complexity of large projects.testing link for pms in portfolio:-->

                                    </p>
                                    <a class="btn_2" target="_blank" href="http://sixthwing.com/PMS/">read more</a></div>
                            </div>
                        </div>


                               <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/Currency.jpg" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR"> <img alt="Foreign currency Logo" src="JavaPortfolioImg/Currency_new.jpg"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR">Foreign currency trends & recommendations</a></h3>
                                    <p class="text_3">
                                   Application helps to trade currency or time the transfer of funds from alien country to home country.
                                    </p>
                                    <br/>
                              
                                    
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR">read more</a></div>
                            </div>
                        </div>
                        
                        
                                 
                               <div class="element-item grid_4 c1">
                                   
                            <div class="box_7">
                                <div class="img-wrap">
                                    <a target="_blank" href="http://aceengineer.com/Finance"> <img alt="Fund trends Logo" src="JavaPortfolioImg/Globe1_new.jpg"></a>
                                    <!--<img src="portfilo/Currency1.jpg" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/Finance/">Fund trends & recommendations</a></h3>
                                    <p class="text_3">
                                    Stock market due to the financial crisis have been very volatile lately. Individual investors need not only to monitor their holdings..
                                    <!--but also may need to make decisions of ...-->
                                    <!--when to buy and sell their assets.-->
                                    <br/>
                                    
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/Finance/">read more</a></div>
                            </div>
                        </div>
            
                                            <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/data.PNG" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp"> <img alt="PMS Logo" src="JavaPortfolioImg/charts2.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">Charting Capabilities</a></h3>
                                    <p class="text_3">
AceEngineer can generate different charts such as Bar, column, timeline, scatter, pie, bubble charts, geolocation charts, 
<!--candlestick charts and heat maps.-->
<!--These charts can be used for customizing web reports or PDF reports as required. Sample charts are given belowSample charts are given below-->
link is: <a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">http://sixthwing.com/Visualization/VisualizationVer02.jsp</a>
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">read more</a></div>
                            </div>
                        </div>
                       
                                                                          <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="#"> <img alt="EZ CAD Logo" src="JavaPortfolioImg/Ez1.JPG"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="#">EZ CAD Desktop Application</a></h3>
                                    <p class="text_3">
EZ CAD is intended to be used for entry level training for 9-1-1 Call Taking. The Ability to talk and type while questioning and making decisions is a beginning step to understanding the work of 9-1-1 Call Taking. Learning basics is important to success.
                                    </p>
                                    <!--<a class="btn_2" target="_blank" href="#">read more</a></div>-->
                            </div>
                        </div>
                        </div>

                                                                          <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="#"> <img alt="Zone Logo" src="JavaPortfolioImg/ZONE logo.jpg"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="#">The Zone Desktop Application</a></h3>
                                    <!--<p class="text_3" style="padding-bottom:  6%;">-->
                                    <p class="text_3">
This zone allows the learner to do the very basic act of either listening to an actual 911 call for entry into a basic CAD, Selecing a response, A priority and actually voice dispatching the call. The Zone allows for the trainer or proctor to call the incident into the person on the phone.
                                    </p>
                                    <!--<a class="btn_2" target="_blank" href="#">read more</a></div>-->
                            </div>
                        </div>
                        </div>
                    
                    
                                                                    <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://sixthwing.com/YarnInventory/login.jsp"> <img alt="Yarn inventory Logo" src="JavaPortfolioImg/Merida.JPG"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://sixthwing.com/YarnInventory/login.jsp">Yarn Inventory </a></h3>
                                    <p class="text_3">
AceEngineer is preparing Yarn inventory control application to
manage yarn inventory information for  MeridaMeridian.
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://sixthwing.com/YarnInventory/login.jsp">read more</a></div>
                            </div>
                        </div>
                        </div>
                    
                    </div>
                    
                    
                </div>
            </div>
        </div>
    
    
<div class="container" style="padding-bottom: 20px;">
    <div class="row">
        <div class="grid_12"  style="padding-top : 5px;">
            <div class="header_1 wrap_3 color_3">
                Get in Touch
            </div>
                <div class="box_3">
                 <ul class="list_1">
                    <li><a target="_blank" class="fa fa-twitter" href="https://twitter.com/AceEngineer1"></a></li>
                    <li><a target="_blank" class="fa fa-facebook" href="https://www.facebook.com/AceEngineer?ref=hl"></a></li>
                    <li><a target="_blank" class="fa fa-google-plus" href="https://plus.google.com/u/0/b/107017400816259920540/107017400816259920540/posts"></a></li>
                    <!--<li><a class="fa fa-pinterest" href="#"></a></li>-->
                    
                </ul>
                </div>
            </div>
        </div>
    </div>
</section>
</div>
<!--========================================================
                          FOOTER
=========================================================-->
<footer id="footer" class="color_9">
    <div class="container">
        <div class="row">
            <div class="grid_12">
                <p class="info text_4 color_4">
<!--                    © <span id="copyright-year"></span> | <a href="#">Privacy Policy</a> <br/>
                    Website designed by <a href="http://www.templatemonster.com/" rel="nofollow">TemplateMonster.com</a>-->
                    
                      Copyright © 2015 <a style="text-decoration: none;color: black">AceEngineer </a> |
                        Designed by <a style="text-decoration: none;color: black">AceEngineer</a>
                </p>
            </div>
        </div>
    </div>
</footer>
<script src="js/script.js"></script>
</body>
</html>