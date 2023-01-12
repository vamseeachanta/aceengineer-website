<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>New Account</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    <meta http-equiv="X-UA-Compatible" content="IE=8" />
<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />
<script type="text/javascript" src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>

<script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/IE9.js&quot;" type="text/javascript"></script>
<script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/ie7-squish.js&quot;" type="text/javascript"></script>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js&quot;" type="text/javascript"></script>


<!--[if lte IE 8]>
        <script>
          document.createElement('header');
           document.createElement('section');
           document.createElement('footer');
           document.createElement('article');
        </script>
      <![endif]-->

</head>
<body>
    <div class="total">
        <div class="total_in">
            <header>
               <ul>
<li><a href="index.php" >HOME</a></li>
<li><a href="http://www.emesscarservice.com">BOOK HERE</a>
<ul><li><a href="http://www.emesscarservice.com">Account</a></li>
<li><a href="http://www.emesscarservice.com">Credit Card</a></li>
<li><a href="http://www.emesscarservice.com">Cash</a></li>
</ul></li>
<li><a href="account.php">ACCOUNTS</a>
<!--<ul><li><a href="NewAccounts.php">New Account</a></li>
<li><a href="ExistingAccount.php">Existing Account</a></li>

</ul>--></li>

<li><a href="aboutus.php">ABOUT US</a></li>
<li><a href="contactus.php">CONTACT US</a></li>
<li><a href="driveforus.php">DRIVE FOR US</a></li>
</ul>
            </header>
            <div style="height:40px"></div>
           <div style="background-color:#2e2d2d; border-radius:7px; height:728px; margin-top:10px; margin-left:20px; margin-right:20px; width:100%; ">
<div style="height:10px;"></div>
           
         <div class="newssubmit1">
<?php 
$action=$_REQUEST['action']; 
if ($action=="")    /* display the contact form */ 
    { 
    ?> 
    
    <?php 
    }  
else                /* send the submitted data */ 
    { 
    
    $email=$_REQUEST['email']; 
	
    if (($email=="")) 
        { 
        echo '<h2 style=" color:#a5a5a5;  text-align:center; margin-top:10px; font-size:17px; font-family:arial; font-weight:normal;">All fields are required, please fill <a href=index.php  style=" color:#d76f1c;">the form</a> again.</h2>'; 
        } 
    else{         
        $from="Email_Id : $email"; 
        $subject="Message sent using your contact form"; 
        mail("chavaadler@yahoo.co.uk", $subject, $from); 
        echo '<h2><span class="text"  Style="color:#f57e20;  text-align:center;margin-left: 507px;margin-top:10px;font-size: 26px;  height:300px;font-family: Dsmotion Demo Italic; ">Thank</span><span style=" font-size: 26px; font-family: Dsmotion Demo Italic; font-weight: normal; color:#c7c6c6; "> You</span></h2>
<h2 style=" color:#a5a5a5;  text-align:center; margin-top:10px; font-size:17px; font-family:arial; font-weight:normal;">Your request has been received<br />and you will be added to our mailing list</h2> '; 
        } 
    }   
?> 

 </div>

        </div>
        
    </div>
   
</div>
<div style=" height:30px;"></div>
  <footer class="footer_height1">
            <div class="footin">
                <div class="car_img inline left">
                    <div  class="title3">
                        EMESS
                    </div>
                    <div class="foot ">
                        <ul>
                            <li><a href="index.php">HOME</a></li>
                             <li><a href="http://www.emesscarservice.com">ONLINE BOOKING</a></li>
                              <li><a href="account.php">ACCOUNTS</a></li>
                              <li><a href="aboutus.php">ABOUT US</a></li>
                              <li><a href="contactus.php">CONTACT US</a></li>
                              <li><a href="driveforus.php">DRIVE FOR US</a></li>
                        </ul>
                    </div>
                </div>
               
                  <div class="car_img1 inline ">
                    <div  class="title3">
                       Download our App NOW!
                    </div>
                   <div>
                   <div class="v_gap1"></div>
                    <div class=" left margin_left" >
                    	<div style="  vertical-align: top;" class="inline">
                        	 <a href="https://play.google.com/store/apps/details?id=com.cordic.Emess">  <img src="Images/google.png"   class="imgg_width" /> </a>
                        </div>
                        <div  style=" vertical-align: top;" class="inline">
                        	 <span style=""> <a href=" https://itunes.apple.com/us/app/emess-car-service/id853115762?mt=8">       <img src="Images/apple.png"   class="imgg_width" /> </a><span class="clickhere">Click here</span></span>
                        </div>
              
                    </div>
                </div></div>
                <div class="car_img inline right">
                    <div  class="title3">
                      Newsletter
                    </div>
                    <div class="news">
SUBMIT YOUR EMAIL ADDRESS<br />
TO RECEIVE OUR NEWS LETTER</div>
<form  action="new.php" method="POST" enctype="multipart/form-data">
                    <div><input type="text" placeholder="EMAIL" name="email" class="email"></div>
                     <p style="color:white; font-family:Arial, Helvetica, sans-serif;  font-size:19px;">    <span ><input type="submit" style="text-decoration:none; background:none; border:none;" name="action"  class="title4" value="Submit" ></span></p>
                     </form>
                </div>
                
            </div>
            <div class="center">COPYRIGHT EMESS ALL RIGHTS RESERVED DESIGNED BY CHAVA ADLER</div>
        </footer>
</body>
</html>
