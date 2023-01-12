
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Contacts</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/grid.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <link rel="stylesheet" href="AceEngineercss/contact-form.css"/>
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>
    <script src='AceEngineerjs/modal.js'></script>
    <script src='AceEngineerjs/TMForm.js'></script>
<script src="//www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>

<script
src="http://maps.googleapis.com/maps/api/js">
</script>

<script>
var myCenter=new google.maps.LatLng(17.012,82.241);

function initialize()
{
var mapProp = {
  center:myCenter,
  zoom:12,
  mapTypeId:google.maps.MapTypeId.ROADMAP
  };

var map=new google.maps.Map(document.getElementById("googleMapIndia"),mapProp);

var marker=new google.maps.Marker({
  position:myCenter,
  });

marker.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);


//US Map

var myCenterUS = new google.maps.LatLng(29.740691,-95.579299);

function initializeUSMap()
{
var mapProp = {
  center:myCenterUS,
  zoom:5,
  mapTypeId:google.maps.MapTypeId.ROADMAP
  };

var map=new google.maps.Map(document.getElementById("googleMapUs"),mapProp);

var marker=new google.maps.Marker({
  position:myCenterUS,
  });

marker.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initializeUSMap);

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
                           <li><a href="service.php">Services</a> </li>
                            <li><a href="portfolio.php">Portfolio</a></li>
                            <li><a href="about.php">About us</a></li>
                            <li><a href="career.php">Careers</a></li>
                            <li ><a href="blog.php">Blog</a></li>
                            <li class="current"><a href="contact.php">Contact Us</a></li>
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
            <div class="grid_12" style="padding-bottom: 25px;">
  
  
      <h2 class="header_2 color_3" id="co">Contact</h2>
     
                        
                    
                    </div>
                    </div>
                    </div>

        <div class="bg_1" style="padding-top: 20px;">
            <div class="container">
                <div class="row">
                
                          <div class="grid_6">
                        <p class="text_2">
                             AceEngineer
                            </p>

                         <h2 class="header_2 indent_2">United States:</h2>
<!--                        <iframe class="map" style="border:0" 
                                src="https://www.google.com/maps/embed/v1/place?q=11511%20Piping%20Rock%20Ln%2C%20Houston%2C%20TX%2C%20United%20States&key=AIzaSyDP5uAUUXwD78JotXjV1XN0V0-bHICaWhg">
                            
                        </iframe>-->
                         <!--<iframe class="map" style="border:0"  frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q=11511%20Piping%20Rock%20Ln%2C%20Houston%2C%20TX%2C%20United%20States&key=AIzaSyDUCl6xzpcb96V4g5Be7IazJxojZM9Y2ss"></iframe>-->
                         <div id="googleMapUs" class="map" style="border:0"></div>
                       
                     
                    </div>
                                        <div class="grid_6">
                        <p class="text_2">
                             AceEngineer
                            </p>

                         <h2 class="header_2 indent_2">India:</h2>
                         
<!--                         <iframe class="map" style="border:0" src="https://www.google.com/maps/embed/v1/search?q=Kakinada%2C%20Andhra%20Pradesh%2C%20India&key=AIzaSyDP5uAUUXwD78JotXjV1XN0V0-bHICaWhg"></iframe>-->
<div id="googleMapIndia" class="map" style="border:0"></div>
                         
                    </div>
                
                </div>
                <div class="row">
                    <div class="grid_6">
                        <div class="wrap_b28" style="padding-top: 3%;">
                            <h2 class="header_2 indent_5">
                                Contact Info
                            </h2>
                            <address>

                                <p class="text_8">

                                    AceEngineer <br/>
                                    United States:<br/>
                                   11511 Piping Rock Ln, <br/>
                                   Houston, TX, 77077.<br/>
                                   U.S Support: +1 713 306 9029.<br/>
                                    
                                    E-mail: <a href="#">support@aceengineer.com</a><br/><br/>
                                    

                                     AceEngineer <br/> 
                                     India: <br/> 
                                    New Building<br/>   
                                    Avanti Nagar<br/>
                                    Indira Gandhi statue road<br/>
                                    Opposite APSP-3<br/>
                                    Pin-533005<br/>
                                    E-mail: <a href="#">support@aceengineer.com</a>
                                </p>
                            </address>
                        </div>
                    </div>
                    <div class="grid_6">
                        <div class="wrap_b28" style="padding-top: 3%;">
                            <h2 class="header_2 indent_2">
                                Contact Form
                            </h2>
                            
                                <form id="contact-form" method="post" name="contact" action="MailContact.php">
                            
                                <div class="contact-form-loader"></div>
                                <fieldset>
                                    <div class="row">
                                        
                                        <div class="grid_2">
                                            <label class="name">
                                                <input type="text" name="name" placeholder="Name:" value=""
                                                       data-constraints="@Required @JustLetters"/>
                                                <span class="empty-message">*This field is required.</span>
                                                <span class="error-message">*This is not a valid name.</span>
                                            </label>
                                        </div>
                                        <div class="grid_2">
                                            <label class="email">
                                                <input type="text" name="email" placeholder="E-mail:" value=""
                                                       data-constraints="@Required @Email"/>
                                                <span class="empty-message">*This field is required.</span>
                                                <span class="error-message">*This is not a valid email.</span>
                                            </label>
                                        </div>
<!--                                        <div class="grid_2">
                                            <label class="phone">
                                                <input type="text" name="phone" placeholder="Phone:" value=""
                                                       data-constraints="@JustNumbers"/>
                                                <span class="empty-message">*This field is required.</span>
                                                <span class="error-message">*This is not a valid phone.</span>
                                            </label>
                                        </div>-->
   <div class="grid_2">
                                            <label class="subject">
                                                <input type="text" name="subject" placeholder="subject:" value="" data-constraints="@JustLetters"/>
<!--                                                       data-constraints="@"/>-->
                                                <span class="empty-message">*This field is required.</span>
                                                <span class="error-message">*This is not a subject.</span>
                                            </label>
                                        </div>
                                    </div>
                                    <label class="message">
                                        <textarea name="message" placeholder="Message:"
                                                  data-constraints='@Required @Length(min=20,max=999999)'></textarea>
                                        <span class="empty-message">*This field is required.</span>
                                        <span class="error-message">*The message is too short.</span>
                                    </label>
<label class="recaptcha"><span class="empty-message">*This field is required.</span></label>

                                    <div class="btn-wrap">
                                        <a class="btn_3" href="#" data-type="reset">clear</a>
                                        <a class="btn_3" href="#" data-type="submit">send</a>
                                          
                                    </div>
                                </fieldset>
                                <div class="modal fade response-message">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <button type="button" class="close" data-dismiss="modal"
                                                        aria-hidden="true">&times;</button>
                                                <h4 class="modal-title">Modal title</h4>
                                            </div>
                                            <div class="modal-body">
                                                You message has been sent! We will be in touch soon.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
   <div class="container" style="padding-bottom: 20px;">
    <!--<div class="row wrap_9 wrap_4 wrap_10">-->
    <div class="row">
        <!--<div class="grid_12"  style="margin-top : -60px;">-->
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