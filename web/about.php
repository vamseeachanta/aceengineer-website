<!DOCTYPE html>
<html lang="en">
<head>
    <title>About</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/grid.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <link rel="stylesheet" href="AceEngineercss/owl.carousel.css"/>
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>
    <script src="AceEngineerjs/owl.carousel.js"></script>

    <script>
        
        $(function (){
    $(".OffStaff").hide();        
    $(".StafDetailsHead").hide();        

           $('.StaffTabs').click(function() {

    var id = $(this).attr("href");
var Hrefclass = $(this).attr('class').split(" ")[1];
//scroll down to corresponding div
        $('html, body').animate({
            scrollTop: $("#"+Hrefclass).offset().top
        }, 2500);

       $(".OffStaff").hide(); 
       $(".StafDetailsHead").show();
   
        $(id+1).show();
//Highlight particular photo when link click
        $("img").removeClass("PhotoColorCss");
         $(id+"PHCss").addClass("PhotoColorCss");
        //border:5px solid red;

                }); 
                
                
                
                
                
                //Highlight particular photo when image click
             $('.img_2').click(function() {      
            var ImgId = $(this).attr('id');   
          
//              $(ImgId).show();
      
     $("img").removeClass("PhotoColorCss");
     $("#"+ImgId ).addClass("PhotoColorCss");
     
     //Photo details id show
       $(".OffStaff").hide(); 
       $(".StafDetailsHead").show();
     var id = ImgId.split("PHCss")[0];
       $("#"+id+1).show();
       
          var w = window, d = document, e = d.documentElement, g = d
                       .getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth
                       || g.clientWidth, y = w.innerHeight || e.clientHeight
                       || g.clientHeight;
//980 360
       if (x < 990) {
           
       
        
              //scroll down to corresponding div
        $('html, body').animate({
            scrollTop: $(".NavigateToTeamMobileView").offset().top
        }, 2500);
        
       }
       else {
                      //scroll down to corresponding div
        $('html, body').animate({
            scrollTop: $("#NavigateToTeam").offset().top
        }, 2500);
        
       }
       
      
       
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
                            <a href="index.php">
                                <!--<img src="images/AceEngineerLogo.png" alt="Logo"/>-->
                                <!--<img src="images/AceEngineer.JPG" style="width: 250px;" alt="Logo"/>-->
   <img src="AceEngineerimages/AceOrginal_new.JPG" style="width: 250px;" alt="Logo"/>
                            </a>
                        </h1>
                    </div>
         <nav class="nav put-right">
                                                        <ul class="sf-menu">
                            <li ><a href="index.php">Home</a></li>
                           <li>     <a href="service.php">Services</a> </li>
                           
                            <li><a href="portfolio.php">Portfolio</a></li>
                            <li class="current"><a href="about.php">About us</a></li>
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
      <div class="container">
       
        <div class="row wrap_13">
            <div class="grid_12">
  
  
      <h2 class="header_2 color_3" id="co">About the Company</h2>
     
                        
                    
                    </div>
                    </div>
                    </div>
<div class="container">
    <!--<div class="row" style="padding-bottom: 25px">-->
    <div class="row">
        
        <div class="grid_12" style="padding-bottom: 25px;">
         
            <div class="box_4">
                <!--<p class="text_5" style="text-align: justify;">-->
                <p class="text_3" style="text-align: justify; padding-bottom: 1%;padding-top: 1%;">
                   AceEngineer team is highly experienced, qualified and motivated to find solutions for real world problems. AceEngineer through research & development and with help of latest technologies provides customized solutions for various industries. AceEngineer have world class expertise with financial and engineering leads having undergraduate degrees from IITs in India and graduate (Masters) degrees from U.S.
              
                </p>
                   <p id="NavigateToTeam"></p>
<!--                  <p class="text_3" style="text-align: justify; padding-bottom: 1%;">
                AceEngineer is the registered as Achanta AceEngineer Inc in USA and Achanta AceEngineer India Pvt Ltd in India. Currently both the USA and India companies are doing business as (DBA) AceEngineer. 
                </p>-->
                  <p class="text_3" style="text-align: justify;">
A venture started by alumni of IIT Madras. AceEngineer have a young and dynamic team to perform high quality work in a cost effective manner. You will experience your requirements being met on time, within budget and with utmost satisfaction

                </p>
             
                <!--<a href="#" class="btn_2">read more</a>-->
            </div>
        </div>
<!--        <div class="grid_5">
            <div class="img-wrap">
                <img data-src="images/index-1_img01.jpg" class="img_1" src="images/preloader.gif" alt="Image 1"/>
                <img data-src="images/index-1_img02.jpg" class="img_1" src="images/preloader.gif" alt="Image 2"/>
            </div>
            <div class="clearfix"></div>
        </div>-->
    </div>
</div>
<!--<div class="bg_1 wrap_13 wrap_10">-->
<div class="bg_1 wrap_b28">
    <div class="container">
        <div class="row">
            <div class="grid_12" style="padding-top: 16px;">
                <h2 class="header_2">
                    Our Key Team
                </h2>
            </div>
        </div>
        <div class="row">

<div class="grid_12" style="padding-top: 16px;">
    

     
    
    <div class="grid_2">
            <div class="img-wrap">
                    <img id="PrashanthKakarapalliPHCss" class="img_2" src="AceEngineerimages/Photos/PS_new.jpg" style="height: 60%; width: 80%;" alt="Image 3"/>
                <!--<img class="img_2" style="width: 70%;height: 70%;" src="images/index-1_img03.jpg" alt="Image 3"/>-->
            </div>
        <div>
    <p  class="text_6">
        <a class="StaffTabs NavigateToTeam"  href="#PrashanthKakarapalli">Prashanth Kakarapalli</a>
    </p>
</div>
     </div>
    
    <div class="grid_2">
            <div class="img-wrap">
                    <img id="DineshJampaPHCss"  class="img_2"  src="AceEngineerimages/Photos/jd.jpg"  style="height: 60%; width: 80%;" alt="Image 3"/>
                <!--<img class="img_2" style="width: 70%;height: 70%;" src="images/index-1_img03.jpg" alt="Image 3"/>-->
            </div>
        <div>
    <p  class="text_6">
        <a class="StaffTabs NavigateToTeam"  href="#DineshJampa">Dinesh Jampa</a>
    </p>
</div>
     </div>
    
    <div class="grid_2">
            <div class="img-wrap">
                    <img id="VenkatSanaPHCss" class="img_2" src="AceEngineerimages/Photos/VS.jpg" style="height: 60%; width: 80%;" alt="Image 3"/>
                <!--<img class="img_2" style="width: 70%;height: 70%;" src="images/index-1_img03.jpg" alt="Image 3"/>-->
            </div>
        <div>
    <p  class="text_6">
        <a class="StaffTabs NavigateToTeam"  href="#VenkatSana">Venkat Sana</a>
    </p>
</div>
     </div>
  
</div>
        </div>
        
          <div class="row StafDetailsHead NavigateToTeamMobileView" style="padding-top: 5%;">
            <div class="grid_12">
                <h2 class="header_2" style="padding-bottom: 1%;">
                    Staff details
                </h2>
            </div>
        </div>
        <!--<h2 class="header_2 indent_1" id="wwu"></h2>-->
        <!--<div class="row OffStaff indent_3" id="RamaKrishna">-->
       
       
       
         <!--KVS-->
        <div class="row OffStaff indent_3" id="PrashanthKakarapalli1">
                
<div class="grid_12" >
                <div class="box_4">
                    <b class="text_2">Prashanth Kakarapalli</b>
                     <p class="text_89" style="padding-bottom: 1%;">HR - Administrator</p>
                    <p class="text_3" style="text-align: justify;">
                Prashanth Kakarapalli (PSK) is the Administrator for AceEngineer. He has Master of Business Administration (MBA) in HR & MKT from Andhra University (AU).

                    </p>
                </div>
            </div>
            
        </div>
         
           <!--JD -->
        <div class="row OffStaff indent_3" id="DineshJampa1">

                
<div class="grid_12" >
                <div class="box_4">
                    <b class="text_2">Dinesh Jampa</b>
                     <p class="text_89" style="padding-bottom: 1%;">Consultant</p>
                    <p class="text_3" style="text-align: justify;">
                

Dinesh chakravarthy (JD) is Senior Software developer for AceEngineer. He has over 5+ years of experience on java and successfully handles the couple of web applications and mobile apps. He has MCA from Andhra University. 


                    </p>
                </div>
            </div>
                      
        </div>
           
                    <!--VS -->
        <div class="row OffStaff indent_3" id="VenkatSana1">

<div class="grid_12" >
                <div class="box_4">
                    <b class="text_2">Venkat Sana</b>
                     <p class="text_89" style="padding-bottom: 1%;">Senior Software Developer</p>
                    <p class="text_3" style="text-align: justify;">
                

Venkat Sana (VS) is  software developer of AceEngineer applications. He has over 3+ Years of experience on java and successfully handles the couple of web applications and mobile apps. He has B.Tech from JNTUK.

                        <!--Dinesh chakravarthy (JD) is Senior Software engineer for AceEngineer. He has over 3+ years of experience on java and successfully handles the couple of web applications and mobile apps. He has MCA from Andhra University (AU). <br/>-->
                        <!--For More info: <a href="http://www.linkedin.com/pub/chakri-jd/32/a6a/129" target="_blank"><img style="height: 20px;width: 80px" src="images/img1/linkedin.png"/></a>-->


                    </p>
                </div>
                </div>
            </div>
       
    </div>
</div>

<div class="bg_1 wrap_b28">
    <div class="container">
        <div class="row">
          <div class="grid_12">
                <h2 class="header_1 indent_2 color_3">
                    Our Clients
                </h2>
                <div id="owl_2">
                    <div class="item">
                        <div class="row">
                            <div class="preffix_1 grid_10">
                                
                               
                                <ul class="list_3">
                                    
                                    <li><a target="_blank" href="http://chandanabroskakinada.com/"><img src="portfilo/ChandanaBros_new.png" style="height: 76px;width: 140px;" alt="Image 9"/></a></li>
                                    <li><a target="_blank" href="http://www.hairbylizbellaire.com/"><img src="portfilo/Hairy_new.png" style="height: 76px;width: 140px;" alt="Image 10"/></a></li>
                                    <li><a target="_blank" href="http://www.ronzinfotech.com/"><img src="portfilo/ronz_new.png" style="height: 76px;width: 140px;" alt="Image 12"/></a></li>
                                    <li><a target="_blank" href="http://www.frendsplus.com/"><img src="portfilo/fp.png" style="height: 76px;width: 140px;" alt="Image 12"/></a></li>
                                  

                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        <div class="row">
                            <div class="preffix_1 grid_10">
                                <ul class="list_3">
                                
                                    <li><a href="#"><img src="portfilo/GPS_Logo.png" style="height: 76px;width: 140px;" alt="Image 11"/></a></li>
                                    <li><a href="http://www.imagesco.com/"><img src="portfilo/ImgSceientifi_new.png" style="height: 76px;width: 140px;" alt="Image 12"/></a></li>
                                    <li><a href="http://www.metaplastics.com/"><img src="portfilo/meta_new.png" style="height: 76px;width: 140px;" alt="Image 12"/></a></li>
                                    <li><a href="#"><img src="portfilo/teck.png" style="height: 76px;width: 140px;" alt="Image 12"/></a></li>


                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
<div class="container" style="padding-bottom: 20px;">
    <div class="row">
        <div class="grid_12"  style="padding-top : 8px;">
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
