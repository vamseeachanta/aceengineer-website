<!DOCTYPE html>
<html lang="en">
<head>
    <title>portfolio</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/grid.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <link rel="stylesheet" href="AceEngineercss/isotope.css"/>
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>
    <script src='AceEngineerjs/isotope.min.js'></script>
   
    
     <style>
         
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
         /* Portrait tablet to landscape and desktop */
 @media (min-width: 768px) {
           
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
    width: 600px;
}

 }//desktop
       
 
  /* Landscape phone to portrait tablet */
            @media (max-width: 767px) 
            { 
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
    width: 300px;
}
                
            }//phone


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
            $('.portfolioTabs #ThirdItemShow').addClass('active').siblings().removeClass('active');
//            $( ".portfolioTabs #FirstItemShow" ).trigger( "click" );


//Showing default apps 
               var isotope = $('.isotope');
               isotope.isotope({ filter: '.'+"c2" });
        
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
                                <img src="AceEngineerimages/AceOrginal_new.JPG" style="width: 250px; padding-left:0px;" alt="Logo"/>
                            </a>
                        </h1>
                    </div>
         <nav class="nav put-right">
             
                                            <ul class="sf-menu">
                            <li ><a href="index.php">Home</a></li>
                           <li> <a href="service.php">Services</a> </li>
                           
                            <li class="current"><a href="portfolio.php">Portfolio</a></li>
                            <li><a href="about.php">About us</a></li>
                            <li><a href="career.php">Careers</a></li>
                            <li><a href="blog.php">Blog</a></li>
                            <li><a href="contact.php">Contact Us</a></li>
                        </ul>

                    </nav>
                </div>
            </div>
        </div>
    </div>
</header>
<!--========================================================
                          CONTENT
=========================================================-->
<hr class="HrMenu">
<section id="content">
    <!--<div class="ic">More Website Templates @ TemplateMonster.com - September08, 2014!</div>-->
         <div class="container">
       
        <div class="row wrap_13">
            <div class="grid_12" style="padding-bottom: 25px;">
  
  
      <h2 class="header_2 color_3" id="co">Portfolio</h2>
     
                        
                    
                    </div>
                    </div>
                    </div>
    <div class="container">

          <div class="row">
            <div class="grid_12">
               
                <div class="text_7 color_2">
                    <div style="display : inline-block;margin-top :0.5%;">Categories:</div> 
                    <ul id="filters" class="portfolioTabs">
                        <!--<li><a href="#" data-filter="">Categories:</a></li>-->
                        <li id="ThirdItemShow"><a class="MenuPortfolio" href="#" data-filter="c2">MobileApps</a></li>
                        
                        <li id="SecondItemShow"><a class="MenuPortfolio" href="#"  data-filter="c1">Web Applications</a></li>
                        <li id="SecondItemShow"><a class="MenuPortfolio" href="#"  data-filter="c3">Web Sites</a></li>
                        <li id="FirstItemShow"><a class="MenuPortfolio" href="#" data-filter="*">Show All</a></li>
                        <!--<li><a class="MenuPortfolio" href="#" data-filter="c3">Andriod Apps</a></li>-->
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="bg_1" style="margin-bottom: 5px;">
        <div class="container">
            <div class="row">
                
                <div class="grid_12" style="border-color: red; border-style: solid;">
                    
                    <div class="isotope row" style="padding-top: 2%;">


                        <div class="element-item grid_4 c1" style="margin-bottom:2%;">
                    <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/Currency.jpg" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR"> <img alt="Foreign currency Logo" src="portfilo/fcr.png"></a>
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
                        
<div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap" >
                                    <!--<img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=959060954&mt=8"> <img alt="Financial Logo" src="portfilo/fs.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=959060954&mt=8">Financial Statement iOS</a></h3>
                                    <p class="text_3">
The Financial Statement App contains Cash Flow and Net Worth (AKA Balance Sheet or Owners Equity) Modules.
There may be no more important thing...
<!--that you do than completing a Financial Statement yearly.-->
<!--How do you know if your financial situation is improving without one? Compare previous years Cash Flow or Net Worth to this years.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=959060954&mt=8">read more</a>
                                </div>
                            </div>
                        </div>

                                 <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                                     <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://aceengineer.com/FluidMechanics/"> <img alt="Fluid Mechanics Logo" src="portfilo/FluidMech.png"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/FluidMechanics/">Fluid Mechanics</a></h3>
                                    <p class="text_3" style="padding-bottom:  6%;">
AceEngineer has developed two applications using simple conservation of energy and ideal gas laws.
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/FluidMechanics/">read more</a></div>
                            </div>
                        </div>

                  <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/cdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    
                                    <a target="_blank" href="http://myfinancialapps.com/schedulec/HTML5/index.php"> <img alt="Schedule C Logo" src="portfilo/c.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://myfinancialapps.com/schedulec/HTML5/index.php">Schedule C</a></h3>
                                    <p class="text_3">

Schedule C App is for Small Businesses to accumulate the Income, Cost of Goods Sold (COGS), and Expenses into IRS Categories. 
The IRS has various categories...
<!--that they want Income, Cost of Goods Sold, and Expenses Items applied to.-->
<!-- Most business owners are great at managing their business, but are not a fan of doing the Accounting. This App allows the owner to do two things, have an accounting system and prepare for filing his Schedule C-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://myfinancialapps.com/schedulec/HTML5/index.php">read more</a></div>
                            </div>
                        </div>
                         <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/edesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://myfinancialapps.com/schedulee/HTML5/index.php"> <img alt="Schedule E Logo" src="portfilo/e.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://myfinancialapps.com/schedulee/HTML5/index.php">Schedule E</a></h3>
                                    <p class="text_3">
Schedule E App categorizes Income and Expenses, for Real Estate Rental or Royalties, into the Categories used by the Internal Revenue Service (IRS). 
<!--There is an included module for calculating Mileage. Summary, Detail and Mileage Reports can be viewed.-->
<!--or printed or e-mailed.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://myfinancialapps.com/schedulee/HTML5/index.php">read more</a></div>
                            </div>
                        </div>
                 <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/fdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://myfinancialapps.com/schedulef/HTML5/index.php"> <img alt="Schedule F Logo" src="portfilo/f.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://myfinancialapps.com/schedulef/HTML5/index.php">Schedule F</a></h3>
                                    <p class="text_3">
Schedule F App allows farmers to accumulate their Income & Expenses to the appropriate Internal Revenue Service (IRS) Categories. Summary Reports & Detail Reports..
<!--can be printed or viewed at any time.
The Summary Report provides the Income.-->
<!--and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
<!--The Summary Report provides the totals of the Income and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://myfinancialapps.com/schedulef/HTML5/index.php">read more</a></div>
                            </div>
                        </div>
                     <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7">
                                <div class="img-wrap">
                                    
                                    <a target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp"> <img alt="VM Stress Logo" src="portfilo/VMStress.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp">VM Stress</a></h3>
                                    <p class="text_3">
                                    This application calculates stress in a specified pipe using tension, bending moment and pressure forces..
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/AceTools/vmStressCheck.jsp">read more</a></div>
                            </div>
                        </div>


                               <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                   
                                    <a target="_blank" href="http://aceengineer.com/StatisticalAnalysis/"> <img alt="Statistical Analysis Logo" src="portfilo/Statistical.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/StatisticalAnalysis/"> Statistical Analysis</a></h3>
                                    <p class="text_3">
                                    Evaluate probability and cumulative probability based on measured data and expected distribution type...
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/StatisticalAnalysis/">read more</a></div>
                            </div>
                        </div>
                        
                               <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/scien.PNG" style="height: 40%;width: 40%" alt="Image 2"/>-->
                                    <!--<a target="_blank" href="http://www.imagesco.com/"> <img alt="Calendar" src="portfilo/scien_new.png" style="float: left;height:30%;width: 30%;"></a>-->
                                    <a target="_blank" href="http://aceengineer.com/StructuralAnalysis/"> <img alt="Structural Analysis Logo" src="portfilo/StAnalysis.png"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/StructuralAnalysis/">Structural Analysis</a></h3>
                                    <p class="text_3">
                                      Beam calculations are given for popular building materials, typical engineering cross sections
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/StructuralAnalysis/">read more</a></div>
                            </div>
                        </div>

                                <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://myfinancialapps.com/financialstatement/HTML5/index.php"> <img alt="PMS Logo" src="portfilo/fs.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://myfinancialapps.com/financialstatement/HTML5/index.php">Financial Statement</a></h3>
                                    <p class="text_3">
The Financial Statement App contains Cash Flow and Net Worth (AKA Balance Sheet or Owners Equity) Modules.
There may be no more important thing ...
<!--that you do than completing a Financial Statement yearly.-->
<!--How do you know if your financial situation is improving without one? Compare previous years Cash Flow or Net Worth to this years.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://myfinancialapps.com/financialstatement/HTML5/index.php">read more</a></div>
                            </div>
                        </div>

                 
                                 
                               <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                                   
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <a target="_blank" href="http://aceengineer.com/Finance"> <img alt="Fund trends Logo" src="portfilo/fund trend.png"></a>
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
                        

                                 
                   
                        
                        
      
<!--Ios Apps-->
                                          <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/cdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    
                                    <a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455652&mt=8"> <img alt="Schedule C Logo" src="portfilo/c.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455652&mt=8">Schedule C iOS</a></h3>
                                    <p class="text_3">

Schedule C App is for Small Businesses to accumulate the Income, Cost of Goods Sold (COGS), and Expenses into IRS Categories. 
The IRS has various categories...
<!--that they want Income, Cost of Goods Sold, and Expenses Items applied to.-->
<!-- Most business owners are great at managing their business, but are not a fan of doing the Accounting. This App allows the owner to do two things, have an accounting system and prepare for filing his Schedule C-->
                                  
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455652&mt=8">read more</a></div>
                            </div>
                        </div>

            <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://sixthwing.com/PMS/"> <img alt="PMS Logo" src="portfilo/PMS.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://sixthwing.com/PMS/">PMS</a></h3>
                                    <p class="text_3">
<!--Project management software is a term covering many types of software, including estimation and planning, scheduling, cost control and budget management, allocation, collaboration, communication, quality management--> 
<!--Project management  software is a term covering many types of software, including estimation and planning, scheduling, cost control and budget management.<br/>-->
link is:  <a target="_blank" href="http://sixthwing.com/PMS">http://sixthwing.com/PMS</a> <br/>
username: AceEngineer@engineeringfirm.com
password: AceEngineer                                    
<!--and documentation or administration systems, which are used to deal with the complexity of large projects.testing link for pms in portfolio:-->

                                    </p>
                                    <a class="btn_2" target="_blank" href="http://sixthwing.com/PMS/">read more</a></div>
                            </div>
                        </div>
                           <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/edesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455656&mt=8"> <img alt="Schedule E Logo" src="portfilo/e.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455656&mt=8">Schedule E iOS</a></h3>
                                    <p class="text_3">
Schedule E App categorizes Income and Expenses, for Real Estate Rental or Royalties, into the Categories used by the Internal Revenue Service (IRS). 
<!--There is an included module for calculating Mileage. Summary, Detail and Mileage Reports can be viewed.-->
<!--or printed or e-mailed.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455656&mt=8">read more</a>
                                </div>
                            </div>
                        </div>
                                          <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/fdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455661&mt=8"> <img alt="Schedule F Logo" src="portfilo/f.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455661&mt=8">Schedule F iOS</a></h3>
                                    <p class="text_3">
Schedule F App allows farmers to accumulate their Income & Expenses to the appropriate Internal Revenue Service (IRS) Categories. Summary Reports & Detail Reports ...
<!--can be printed or viewed at any time.
The Summary Report provides the Income.-->
<!--and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
<!--The Summary Report provides the totals of the Income and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=961455661&mt=8">read more</a></div>
                            </div>
                        </div>



                         

<!--
                         <div class="element-item grid_4 c1">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>
                                    <a target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR"> <img alt="PMS Logo" src="portfilo/api1.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR">API Programming</a></h3>
                                    <p class="text_3">
                                Yahoo finance API programming using yql<br/>

                                IB or TWS interface programming<br/>

                                Youtube API Programming<br/>

                                Ninja Trader interface codes ...
                                (.cs codes in #C language)<br/>

                                Script programming for Google drive spreadsheets (.gs code)<br/>

                                Database interfacing using Hybernate                             
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://aceengineer.com/Finance/Forex.do?CP=USDINR">read more</a></div>
                            </div>
                        </div>
      
-->



                  <!--Andriod Apps-->
                  <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/pms.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://play.google.com/store/apps/details?id=com.financialstatement"> <img alt="PMS Logo" src="portfilo/fs.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://play.google.com/store/apps/details?id=com.financialstatement">Financial Statement Andriod</a></h3>
                                    <p class="text_3">
The Financial Statement App contains Cash Flow and Net Worth (AKA Balance Sheet or Owners Equity) Modules.
There may be no more important thing ...
<!--that you do than completing a Financial Statement yearly.-->
<!--How do you know if your financial situation is improving without one? Compare previous years Cash Flow or Net Worth to this years.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://play.google.com/store/apps/details?id=com.financialstatement">read more</a></div>
                            </div>
                        </div>

                  
                                          <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/cdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    
                                    <a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulec"> <img alt="Schedule C Logo" src="portfilo/c.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulec">Schedule C Andriod</a></h3>
                                    <p class="text_3">

Schedule C App is for Small Businesses to accumulate the Income, Cost of Goods Sold (COGS), and Expenses into IRS Categories. 
The IRS has various categories...
<!--that they want Income, Cost of Goods Sold, and Expenses Items applied to.-->
<!-- Most business owners are great at managing their business, but are not a fan of doing the Accounting. This App allows the owner to do two things, have an accounting system and prepare for filing his Schedule C-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulec">read more</a></div>
                            </div>
                        </div>
                  
                  
                                            <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/data.PNG" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp"> <img alt="PMS Logo" src="portfilo/Charting.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">Charting Capabilities</a></h3>
                                    <p class="text_3">
AceEngineer can generate different charts such as Bar, column, timeline, scatter, pie, bubble charts, geolocation charts, 
<!--candlestick charts and heat maps.-->
<!--These charts can be used for customizing web reports or PDF reports as required. Sample charts are given belowSample charts are given below-->
link is:  <a target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">http://sixthwing.com/Visualization/VisualizationVer02.jsp</a>
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://sixthwing.com/Visualization/VisualizationVer02.jsp">read more</a></div>
                            </div>
                        </div>
                        
      
                                          <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/edesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulee"> <img alt="Schedule E Logo" src="portfilo/e.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulee">Schedule E Andriod</a></h3>
                                    <p class="text_3">
Schedule E App categorizes Income and Expenses, for Real Estate Rental or Royalties, into the Categories used by the Internal Revenue Service (IRS).
<!--There is an included module for calculating Mileage. Summary, Detail and Mileage Reports can be viewed.-->
<!--or printed or e-mailed.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulee">read more</a></div>
                            </div>
                        </div>
                                          <div class="element-item grid_4 c2" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/fdesktop.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulef"> <img alt="Schedule F Logo" src="portfilo/f.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulef">Schedule F Andriod</a></h3>
                                    <p class="text_3">
Schedule F App allows farmers to accumulate their Income & Expenses to the appropriate Internal Revenue Service (IRS) Categories. Summary Reports & Detail Reports...
<!--can be printed or viewed at any time.-->
<!--The Summary Report provides the Income.-->
<!--and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
<!--The Summary Report provides the totals of the Income and Expense categories so they can be entered directly onto the IRS Schedule F Form. . And there is a Mileage Module to track business Mileage.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="https://play.google.com/store/apps/details?id=com.schedulef">read more</a></div>
                            </div>
                        </div>
                    
                            <div class="element-item grid_4 c4" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/meta.PNG" style="height: 40%;width: 40%;" alt="Image 3"/>-->
                                    <a target="_blank" href="http://www.metaplastics.com/"> <img alt="Metaplastic Logo" src="portfilo/meta_new.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.metaplastics.com/">Metaplastic</a></h3>
                                    <p class="text_3">
                                       Metaplastics proudly announces the launch of its volatile corrosion inhibitor (VCI) products. 
                                       Based on our research and development experience of over a decade.
                                       <!--Metaplastics has extremely effective formulations of VCIs-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.metaplastics.com/">read more</a></div>
                            </div>
                        </div>


                               <div class="element-item grid_4 c3" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/ronz.PNG"  style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://www.ronzinfotech.com/"> <img alt="Ronz Infotech Logo" src="portfilo/Ronz.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.ronzinfotech.com/"> Ronz Infotech</a></h3>
                                    <p class="text_3">
                                    Ronz Infotech LLC is a full-service specialty staffing organization providing flexible and permanent staffing solutions 
                                    for time-strapped employers .
                                    <!--as well as the career management expertise for job seekers.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.ronzinfotech.com/">read more</a></div>
                            </div>
                        </div>
                  
                        <div class="element-item grid_4 c3" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/ronz.PNG"  style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://tek-solutions.com/"> <img alt="TEK-SOLUTIONS Logo" src="portfilo/Tekhub_portfolio.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://tek-solutions.com/">TEK-SOLUTIONS</a></h3>
                                    <p class="text_3">
                                    
                                    TEK-Solutions is a full service software development and systems integration company that is dedicated to providing 
                                    professional services in all areas..
                                    <!--as well as the career management expertise for job seekers.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://tek-solutions.com/">read more</a></div>
                            </div>
                        </div>
                  
                        <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/scien.PNG" style="height: 40%;width: 40%" alt="Image 2"/>-->
                                    <!--<a target="_blank" href="http://www.imagesco.com/"> <img alt="Calendar" src="portfilo/scien_new.png" style="float: left;height:30%;width: 30%;"></a>-->
                                    <a target="_blank" href="http://www.imagesco.com/"> <img alt="Calendar" src="portfilo/image001.png"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.imagesco.com/">Image Scientific</a></h3>
                                    <p class="text_3">
                                       Image Scientific is committed to bringing the best science equipment to students, educators, creative professionals 
                                       and consumers around the world.
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.imagesco.com/">read more</a></div>
                            </div>
                        </div>
               
                        
                        
                        
                        
                                                                      <div class="element-item grid_4 c3" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://chandanabroskakinada.com/"> <img alt="chandana Logo" src="portfilo/ChandanaBros_new.png"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://chandanabroskakinada.com/">Chandana Brothers</a></h3>
                                    <p class="text_3">
It is one of the mega showroom in Kakinada. Chandana Brothers is popular for all types of fabrics and readymade clothing for men, women and children.
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://chandanabroskakinada.com/">read more</a></div>
                            </div>
                        </div>
                        
                        
                                              <div class="element-item grid_4 c3" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/hairby.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://www.hairbylizbellaire.com/"> <img alt="Hair by liz Logo" src="portfilo/Hairy_new.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.hairbylizbellaire.com/">Hair by liz</a></h3>
                                    <p class="text_3">
Welcome to Elizabeth’s Hair Salon. We are all about hair and offer a full range of professional services and retail products to keep you looking your very best. 
<!--We use the same products and offer the same services as the larger salons but in a much more comfortable and personal atmosphere.-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.hairbylizbellaire.com/">read more</a></div>
                            </div>
                        </div>
                  
                           <div class="element-item grid_4 c3">
                            <div class="box_7">
                                <div class="img-wrap">
                                    <!--<img src="portfilo/meta.PNG" style="height: 40%;width: 40%;" alt="Image 3"/>-->
                                    <a target="_blank" href="http://www.metaplastics.com/"> <img alt="Metaplastic Logo" src="portfilo/meta_new.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.metaplastics.com/">Metaplastic</a></h3>
                                    <p class="text_3">
                                       Metaplastics proudly announces the launch of its volatile corrosion inhibitor (VCI) products. 
                                       Based on our research and development experience of over a decade.
                                       <!--Metaplastics has extremely effective formulations of VCIs-->
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.metaplastics.com/">read more</a></div>
                            </div>
                        </div>
                                            <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/fp.JPG" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="http://www.frendsplus.com/"> <img alt="Fp Logo" src="portfilo/fp.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="http://www.frendsplus.com/">Frendsplus</a></h3>
                                    <p class="text_3">
Creating a business allows you to recognize problems and opportunities within your business that may arise. You can avoid penalties, fines or other legal issues. 
<!--A business plan helps you adapt to changes in the marketplace and industry. It lets you develop or contract from a place of neutrality.-->                                 
                                    </p>
                                    <a class="btn_2" target="_blank" href="http://www.frendsplus.com/">read more</a></div>
                            </div>
                        </div>
                        
                        <div class="element-item grid_4 c1" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/fp.JPG" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="#"> <img alt="ApeCustomer Logo" src="portfilo/APE.png"></a>
                                </div>
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="#">American Pile driving Equipment</a></h3>
                                    <p class="text_3">

American Pile driving Equipment to manage price quotes for equipment, materials like piles for driving into the ground.
<!--A business plan helps you adapt to changes in the marketplace and industry. It lets you develop or contract from a place of neutrality.-->                                 
                                    </p>
                                    <a class="btn_2" target="_blank" href="#">read more</a></div>
                            </div>
                        </div>
                    
                                                   <div class="element-item grid_4 c4" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="#"> <img alt="Zone Logo" src="portfilo/The911.png"></a>
                                </div>
                                
                                <div class="caption">
                                    <h3 class="text_2 color_2"><a target="_blank" href="#">911 Zone Desktop Application</a></h3>
                                    <!--<p class="text_3" style="padding-bottom:  6%;">-->
                                    <p class="text_3">
This zone allows the learner to do the very basic act of either listening to an actual 911 call for entry into a basic CAD, Selecing a response, A priority and actually voice dispatching the call. The Zone allows for the trainer or proctor to call the incident into the person on the phone.
                                    </p>
                                    <!--<a class="btn_2" target="_blank" href="#">read more</a></div>-->
                            </div>
                        </div>
                        </div>

                                                      <div class="element-item grid_4 c4" style="margin-bottom: 2%;">
                            <div class="box_7" >
                                <div class="img-wrap">
                                    <!--<img src="portfilo/chandana.png" style="height: 40%;width: 40%" alt="Image 3"/>-->
                                    <a target="_blank" href="#"> <img alt="EZ CAD Logo" src="portfilo/EZCad.png"></a>
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
          

                       
                    
                    </div>
                    
                    
                </div>
            </div>
        </div>
    </div>
    
<div class="container"  style="margin-bottom: 20px;">
    <div class="row">
        <div class="grid_12" >
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
<script src="AceEngineerjs/script.js"></script>
</body>
</html>