<!DOCTYPE html>
<html lang="en">
<head>
    <title>Career</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/grid.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <link rel="stylesheet" href="AceEngineercss/owl.carousel.css"/>
        <link rel="stylesheet" href="AceEngineercss/isotope.css"/>
      <script src='AceEngineerjs/isotope.min.js'></script>
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>
    <script src="AceEngineerjs/owl.carousel.js"></script>
  
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
    width: 820px;
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
    /*padding-bottom: 2px;*/
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
            $('.portfolioTabs #FirstItemShow').addClass('active').siblings().removeClass('active');
            $(".portfolioTabs #FirstItemShow" ).trigger( "click" );
              $(".divCarres").hide(); 
            $("#WebDEVELOPER").show();
//            $("#ENGINEER").hide(); 
//            $("#ENGINEER").hide(); 
//            $("#ENGINEER").hide(); 
           $('.portfolioTabs li').click(function(e) {
               e.preventDefault();
               $(".divCarres").hide(); 

                      $(this).addClass('active').siblings().removeClass('active');
                     var id = $(this).find("a").attr("href");
                      $(id).show();
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
                                <img src="AceEngineerimages/AceOrginal_new.JPG" style="width: 250px;" alt="Logo"/>
                                   
                            </a>
                        </h1>
                    </div>
         <nav class="nav put-right">
                        <ul class="sf-menu">
                            <li ><a href="index.php">Home</a></li>
                           <li>     <a href="service.php">Services</a> </li>
                            <li><a href="portfolio.php">Portfolio</a></li>
                            <li><a href="about.php">About us</a></li>
                            <li class="current"><a href="Carrer_new.php">Careers</a></li>
                            <li><a href="blog.php">Blog</a></li>
                            <!--<li ><a href="contactUs.php">Contact Us</a></li>-->
                            <li ><a href="contact.php">Contact Us</a></li>
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
            <div class="grid_12">
  
  
      <h2 class="header_2 color_3" id="co">Careers</h2>
     
                    </div>
                    </div>
                    </div>
    <div class="container">
    
        <div class="row">
              <div class="grid_12" style="padding-top: 20px;">
      <!--<h2 class="header_2 indent_1" id="co">Current openings</h2>-->
      
          <div class="text_7 color_2">
                    <div style="display : inline-block;margin-top :0.5%;">Categories:</div> 
                    <ul id="filters" class="portfolioTabs">
                        <li id="FirstItemShow"><a id="aa" href="#WebDEVELOPER">Web Developer</a></li>
                        <li id="SecondItemShow"><a href="#iOSDeveloper">iOS Developer</a></li>
                        <li><a href="#AndriodDeveloper">Andriod Developer</a></li>
                      
                    </ul>
                </div>
      </div>
        </div>
    </div>
        
    <!--<div class="container" style="border:5px solid blue;">-->
    <div class="container">

            <div class="row">
                <div class="grid_12">
                    <div class="CarrerOpnenings">
                        <h2 class="header_2 indent_1" id="co">Current openings</h2>
                    </div>   
                    <div class="bg_1" style="padding-bottom: 20px;">
                            <div id="WebDEVELOPER" class="divCarres">
<!--          <table border="0" style="padding-top: 10px;">
                                    <tbody><tr><td class="fp_c4" colspan="2"><span></span></td></tr>
                                        <tr><td width="20%" style="text-align: center;"><p class="text_89">Title :</p></td><td><p class="tblParagraph">JAVA DEVELOPER.</p></td></tr>
                                        <tr><td width="20%" style="text-align: center;"><p class="text_89">Title :</p></td><td><p class="text_6">JAVA DEVELOPER.</p></td></tr>
                                        <tr><td style="text-align: center;"><p class="text_89">Job Location:</p></td><td><p class="text_6">KAKINADA</p></td></tr>
                                        <tr><td valign="top"style="text-align: center;"><p class="text_89">Description:</p></td><td><p class="text_6" style="text-align: justify;">Have 3 years of work experience in java and web development technologies. Able to lead and work with fresh programmers of 1 year of experience or less. Have Bachelors in Computer science or equivalent. Advanced degree is a plus. Able to write and review software requirements and software design documentations. Working knowledge of frameworks such as Struts and Springs is required. Ensure latest and best java technologies are used. Able to lead/work the project independently when required. Willingness to work with a team, learn and be proactive. Full-time position based out of Kakinada office.</p></td></tr>
                                   
                                    
                                </tbody></table>-->
                                
                                 <table border="2" style="padding-top: 10px;">
                                    <tbody><tr><td class="fp_c4" colspan="2"><span></span></td></tr>
                                        <!--<tr><td width="20%" style="text-align: center;"><p class="text_89">Title :</p></td><td><p class="tblParagraph">JAVA DEVELOPER.</p></td></tr>-->
                                        <tr><td colspan="2" width="20%" style="text-align: left;"><p class="text_3">Currently we don't have openings for Web Developers</p></td></tr>
                                    
                                    
                                </tbody></table>
      </div>
 

                        
                                              <div id="iOSDeveloper" class="divCarres">
          <table border="0" style="padding-top: 10px;">
                                    <tbody><tr><td class="fp_c4" colspan="2"><span></span></td></tr>
                                        <!--<tr><td width="20%" style="text-align: center;"><p class="text_89">Title :</p></td><td><p class="tblParagraph">JAVA DEVELOPER.</p></td></tr>-->
                                        <tr><td colspan="2" width="20%" style="text-align: left;"><p class="text_3">Currently we don't have openings for iOS Developers</p></td></tr>
                                    
                                    
                                </tbody></table>
      </div>
                        
                                              <div id="AndriodDeveloper" class="divCarres">
           <table border="0" style="padding-top: 10px;">
                                    <tbody><tr><td class="fp_c4" colspan="2"><span></span></td></tr>
                                        <!--<tr><td width="20%" style="text-align: center;"><p class="text_89">Title :</p></td><td><p class="tblParagraph">JAVA DEVELOPER.</p></td></tr>-->
                                        <tr><td colspan="2" width="20%" style="text-align: left;"><p class="text_3">Currently we don't have openings for Andriod Developers</p></td></tr>
                                    
                                    
                                </tbody></table>
      </div>
                    </div>
    
                    <div class="wrap_b28" style="padding-top: 2%;">
      <div>                  
          <h2 class="header_2" style="padding-bottom: 15px;">Working With us</h2>
  
  <div>
      <ul class="text_3">
          <li>
              • A career with AceEngineer is more than just a routine job. </li>
 <li>• Your work will be recognized. </li>
 <li>• You'll have more responsibility.  </li>
 <li>• You'll be given more opportunities.  </li>
 <li>• You'll be able to do a lot of different things. </li>
 <li>• You'll learn from true innovators.  </li>
 <li>• You'll work in an awesome atmosphere. </li>
 <li>• You'll learn to be frugal.  </li>
 <li>• You'll be instilled with the value of hard work, ownership, and self-sustainability.  </li>
        
      </ul>
  </div>
</div>
</div>
                            
                   <div >
     
      <h2 class="header_2" style="padding-bottom: 15px;">HR Best Practices</h2>
                        
                     
                            <div  >
                              
<h2 class="header_3" style="font-weight: bold">TWO WAY COMMUNICATION</h2>
<b class="text_89">Employee engagement survey:</b> <br/>
<p class="text_3" style="text-align: justify;padding-bottom: 1%;">
Being People Focused Organization, the most important priority is to motivate and engage people in our organization. Employee engagement surveys are conducted every year the inputs thereof for improvement will become stepping stones towards making AceEngineer "a Great Place to Work".
<br/> 
</p>

<b class="text_89">Open House: </b> 
<p class="text_3" style="text-align: justify;">
In order to encourage employees to share their views and suggestions at a bigger forum, an Open House meeting is conducted every year. All the inputs are captured and addressed.
  </p>
  <p class="text_3" style="text-align: justify;">
<b>Suggestion Scheme:</b> <br/>
All employees are encouraged to give their suggestion. Across functional panel evaluates all the suggestions received and the best suggestions are implemented and employees are rewarded.
  </p>
  <br/>
  <h2 class="header_3" style="font-weight: bold" >ENGAGEMENT DRIVERS</h2>
<b class="text_89">Mentoring and Coaching:</b>
<p class="text_3" style="text-align: justify;padding-bottom: 1%;">
Mentoring features as one of the best-practices of globally competitive companies. Mentoring has been advocated as the most important method of shaping behavior and improving performance. Mentor provides professional support to the mentee thus enhancing his/her performance in alignment with the organization’s goal. Career development of the mentee, mentoring also helps in higher levels of motivation, improved retention levels and better succession planning.
  </p>
<b class="text_89">Buddy Concept:</b>
<p class="text_3" style="text-align: justify;">
Buddy concept is a worldwide-accepted practice wherein every new joinee is assigned a buddy (peer) for quick orientation. A buddy shall help the new joinees to settle down in the early days of his/her job, ensure that the new joinees gets assistance in finding a new accommodation/workspace and queries on organization culture, existing policies, employee welfare schemes etc.

                    </p>
                            </div>
               
                 </div>
                 </div>
<!--                <div class="grid_2">
                    <div class="wrap_10">
                        <h2 class="header_2 indent_1">
                            Categories
                        </h2>
                        <ul class="list_2 text_3 color_5">
                            <li><a href="#co">Current openings</a></li>
                            <li><a href="#wwu">Working With us</a></li>
                            <li><a href="#HR">HR Best Practices </a></li>
                            
                        </ul>
                    </div>
                </div>-->
        </div>
    </div>
       
<div class="container">
    <div class="row wrap_9 wrap_4 wrap_10">
        <div class="grid_12"  style="margin-top : -60px;">
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