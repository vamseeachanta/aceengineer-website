<!DOCTYPE html >
<html>
    <head>
        <title>Contact Us</title>
        <link href="style.css" rel="stylesheet" type="text/css" />
        <meta http-equiv="X-UA-Compatible" content="IE=8" />
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=11; IE=10; IE=9; IE=8; IE=7; IE=EDGE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body>
        <div class="total">
            <div class="total_in">
                <header>
                    <ul>
                        <li><a href="index.php">HOME</a></li>
                        <li><a href="#">BOOK HERE</a>
                            <ul><li><a href="#">Account</a></li>
                                <li><a href="#">Credit Card</a></li>
                                <li><a href="#">Cash</a></li>
                            </ul></li>
                        <li><a href="account.php" >ACCOUNTS</a>
                            <!--<ul><li><a href="NewAccounts.php">New Account</a></li>
                            <li><a href="ExistingAccount.php">Existing Account</a></li>
                            
                            </ul>-->
                        </li>

                        <li><a href="aboutus.php">ABOUT US</a></li>
                        <li><a href="contactus.php" class="active">CONTACT US</a></li>
                        <li><a href="driveforus.php">DRIVE FOR US</a></li>
                    </ul>
                </header>

                <main>
                    <div class="contact">
                        <div class="cform">
                            <h2  style="font-family: DSMotion Demo Italic; font-size:30px;">
                                <span style="color:#f57e20;">Contact</span> 
                                <span style="color:#c7c6c6;">Us</span>
                            </h2>
                            <div class="cont1" >
                                We Here to answer any question you may have about our services 
                                Fill out our Form below and we will respond as soon as we can
                            </div>
                            <form  action="contact1.php" method="POST" enctype="multipart/form-data" > 
                                <table width="100%">
                                    <tr>
                                        <td width="50%">
                                            <p>Your Name<span style="color:red;">*</span></p> 
                                            <input  type="text" name="name"/>
                                        </td>
                                        <td>
                                            <p>
                                                Your Email<span  style="color:red;">*</span>
                                            </p>

                                            <input  type="text" name="email" />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <p>
                                                Your Number
                                                <span id="cus2" style="color:red;">*</span>
                                            </p> 
                                            <input type="text" name="number" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2">
                                            <p style="color:#c9c9c9;  font-family:Arial, Helvetica, sans-serif; font-size:16px;">Message<span style="color:red;">*</span></p>
                                            <textarea name="message" rows="5" cols="40" ></textarea> 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p style="color:white; font-family:Arial, Helvetica, sans-serif;  font-size:19px;">  
                                                <span>
                                                    <input id="sub" type="submit" style="text-decoration:none;background:none;  border-top:none; border-left:none; border-right:none;
                                                           border-bottom:solid 1px #ff7e01;" name="action"  class="title4" value="Submit" />
                                                </span>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </form>  
                        </div>

                        <div class="cInfo">
                            <h2 class="text" style="font-family: DSMotion Demo Italic; font-size:30px;">
                                <span style="color:#f57e20;">Contact</span> 
                                <span style="color:#c7c6c6;">Info</span>
                            </h2>
                            <p style="color:white; font-family:Arial, Helvetica, sans-serif; margin-left:10px; font-size:16px; margin-top:50px;">
                                <span style="color:#d86e08;">Address</span><br/><br/>
                                <span style="color:#919090;">26 Rostrever Avenue</span><br/>
                                <span style="color:#919090;">London</span><br/>
                                <span style="color:#919090;">N15 6Lp</span><br/><br/>
                                <span style="color:#d86e08;">Telephone</span><br/><br/>
                                <span style="color:#919090;">020 8211 7755</span><br/>
                                <span style="color:#919090;">020 8809 4444</span><br/><br/>
                                <span style="color:#d86e08;">Fax</span><br/><br/>
                                <span style="color:#919090;">0208 800 8272</span><br/><br/>
                                <span style="color:#d86e08;">Email</span><br/><br/>
                                <span style="text-decoration:underline;color:#919090;">admin@emesscarservice.com</span><br/><br/>
                                <span style="color:#d86e08;">Website</span><br/><br/>
                                <span id="c1" style="text-decoration:underline;color:#919090;"><a href="http://www.emesscarservice.com" style="text-decoration:underline;color:#919090;">www.emesscarservice.com</a></span>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
        <footer>
            <div class="footin">
                <div class="block">
                    <div class="title3">
                        EMESS
                    </div>
                    <div class="foot">
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

                <div class="block" align="center">
                    <div class="title3">
                        Download our App NOW!
                    </div>
                    <div>
                        <table>
                            <tr>
                                <td>
                                    <a href="https://play.google.com/store/apps/details?id=com.cordic.Emess"><img src="Images/google.png"  /></a>
                                </td>
                                <td>
                                    <a href=" https://itunes.apple.com/us/app/emess-car-service/id853115762?mt=8"><img src="Images/apple.png"  /></a>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" align="center">
                                    <span class="clickhere">Click here</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="block">
                    <div class="right">
                        <div class="title3">
                            Newsletter
                        </div>
                        <div class="news">
                            SUBMIT YOUR EMAIL ADDRESS<br/>
                            TO RECEIVE OUR NEWS LETTER
                        </div>
                        <form  action="new.php" method="POST" enctype="multipart/form-data" >
                            <div>
                                <input type="text" placeholder="E-MAIL" name="email" class="email"/>
                            </div>
                            <p style="color:white; font-family:Arial, Helvetica, sans-serif;  font-size:19px;"> 
                                <span>
                                    <input type="submit" style="text-decoration:none; background:none; border:none;" name="action"  class="title4" value="Submit" />
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            <div style="text-align: center">&copy;COPYRIGHT EMESS ALL RIGHTS RESERVED DESIGNED BY CHAVA ADLER</div>
        </footer>
    </body>
</html>
