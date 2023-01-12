<!DOCTYPE html>
<html lang="en">
<head>
    <title>Blog</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
  <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/grid.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>

   <style>
ul li span{
  position: relative;
  padding-left: 31px;
}
ul li span:before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
   width: 5px;
  height: 5px;
  background: black;
  border-radius: 5px;
}
    </style>
    <script>
    
         $(function (){
           $('.UlBlogMenu li').click(function() {
          
         
                var LinkId=$(this).find('a').attr('href');
  
//    
//    var linktext=$(this).find("a").text();
//    alert(linktext);

//scroll down to corresponding div
        $('html, body').animate({
            scrollTop: $(LinkId).offset().top
        }, 3000);
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
                                <!--<img src="images/AceEngineerLogo.png" alt="Logo"/>-->
                                 <!--<img src="images/AceEngineer.JPG" style="width: 250px;" alt="Logo"/>-->
                                <img src="AceEngineerimages/AceOrginal_new.JPG" style="width: 250px;" alt="Logo"/>
                            </a>
                        </h1>
                    </div>
                    
                       <nav class="nav put-right">
                        <ul class="sf-menu">
                            <li ><a href="index.php">Home</a></li>
                            <li >
                                <a href="service.php">Services</a>
                            </li>
                            <li ><a href="portfolio.php">Portfolio</a></li>
                            <li><a href="about.php">About us</a></li>
                            <li><a href="career.php">Careers</a></li>
                            <li class="current"><a href="blog.php">Blog</a></li>
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
            <div class="grid_12" >
  
  
      <h2 class="header_2 color_3" id="co">Blog</h2>

                        
                    
                    </div>
                    </div>
                    </div>
        <div class="container">
            <div class="row" style="  padding-top: 20px;">
              
                         <div class="grid_8">
                        <?php
                    

                    $username = "aceeng_Ace";
                    $password = "Ace@123";
                    $hostname = "localhost";
                    $dbhandle = mysql_connect($hostname, $username, $password)
                            or die("Unable to connect to MySQL");


                    $dbName = "aceeng_AceEngineerNew";
                    $selected = mysql_select_db($dbName)
                            or die("Could not select OilAndGas");


                    $start = 0;
                    $limit = 5;

                    if (isset($_GET['id'])) {
                        $id = $_GET['id'];

                        $start = ($id - 1) * $limit;
                    }
                    if (!isset($id)) {
                        $id = 1;
                    }
            
                    $query2 = mysql_query("SELECT `BlogContent`,`BlogDate`, `Heading`,`UrlHeading` FROM `ace_blog` LIMIT $start, $limit");

                   $result1 = "";
                   $menu= "";
        while ($query3 = mysql_fetch_array($query2)) {
 
//                                            $result1=  $result1.' <div class="wrap_10"><h2 class="header_2 indent_5" id="' . $query3['UrlHeading'] . '"></h2><br/><h2 class="header_2 indent_1">' . $query3['Heading'] . '</h2>';
                                            $result1=  $result1.' <div class="wrap_10"  id="' . $query3['UrlHeading'] . '"><h2 class="header_2 indent_1 ' . $query3['UrlHeading'] . '">' . $query3['Heading'] . '</h2>';
     
  $result1=  $result1.'<div class="box_6"> <div class="put-left" ><p class="text_6" style="text-align: justify;padding-bottom: 2%;">' . stripslashes($query3['BlogContent']) . ' </p><br/> </div></div>   </div>';       

                        $menu = $menu.'<li><a href="#' . $query3['UrlHeading'] . '">' . $query3['Heading'] . '</a></li>';            
                        }
                    echo $result1.' </div>';
     
         $menuRes= '<div class="grid_4"> <div class="wrap_10"><h2 class="header_2 indent_1"> Categories</h2> <ul class="list_2 text_3 color_5 UlBlogMenu">' . $menu. '</ul></div> </div>';
            echo $menuRes;
                    mysql_close();
                    ?>

                  <!--Blog grid close-->
                         <!--</div>-->
                
<!--                <div class="grid_4">
                    <div class="wrap_10">
                        <h2 class="header_2 indent_3">
                            Categories
                        </h2>
                        <ul class="list_2 text_3 color_5">
                            <li><a href="#">Gorem ipsum dolor sit </a></li>
                            <li><a href="#">Amettetur ing elit</a></li>
                            <li><a href="#">In mollis erat mattis neque </a></li>
                            <li><a href="#">Cilisis, sit amet wertolio </a></li>
                            <li><a href="#">Dasererat rutrumeerat </a></li>
                            <li><a href="#">Meque cilisis, sit amet </a></li>
                            <li><a href="#">Wertolio dasererat </a></li>
                            <li><a href="#">Jpsum dolor situr </a></li>
                            <li><a href="#">In mollis erat mattis neque </a></li>
                            <li><a href="#">Asit amet wertolio </a></li>
                            <li><a href="#">Kasererat rutrumeerat </a></li>
                            <li><a href="#">Neque cilisis, sit amet </a></li>
                            <li><a href="#">Bertolio dasererate </a></li>
                            <li><a href="#">Wertolio dasererat </a></li>
                            <li><a href="#">Jpsum dolor situr </a></li>
                            <li><a href="#">In mollis erat sererate </a></li>
                        </ul>
                    </div>
                </div>-->
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
<script src="AceEngineerjs/script.js"></script>
</body>
</html>