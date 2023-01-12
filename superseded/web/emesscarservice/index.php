<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Welcome to Emess Car Service</title>
        <link href="style.css" rel="stylesheet" type="text/css" />

        <meta http-equiv="X-UA-Compatible" content="IE=8" />
        <meta http-equiv="X-UA-Compatible" content="IE=11; IE=10; IE=9; IE=8; IE=7; IE=EDGE" />
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

        <script type="text/javascript" >
            window.onload = function() {
//                alert(window.innerWidth);
            }
        </script>

    </head>
    <body>
        <div style=" position:absolute; top:6px;right:10px;"><img src="Images/letter.png" /></div>
        <div class="total">
            <div class="total_in">
                <header>
                    <ul>
                        <li><a href="index.php" class="active">HOME</a></li>
                        <li><a href="#">BOOK HERE</a>
                            <ul>
                                <li><a href="#">Account</a></li>
                                <li><a href="#">Credit Card</a></li>
                                <li><a href="#">Cash</a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="account.php">ACCOUNTS</a>
<!--                            <ul>
                                <li><a href="NewAccounts.php">New Account</a></li>
                                <li><a href="ExistingAccount.php">Existing Account</a></li>
                            </ul>-->
                        </li>
                        <li><a href="aboutus.php">ABOUT US</a></li>
                        <li><a href="contactus.php">CONTACT US</a></li>
                        <li><a href="driveforus.php">DRIVE FOR US</a></li>
                    </ul>
                </header>


                <!--<article id="idx" >-->
                <!--<main>-->
                <section>
                    <div id="company-name">
                        <div class="left" valign="bottom">
                            <div class="title1" >
                                Emess Car Service
                            </div>
                            <div class="title2">
                                Online Booking System
                            </div>
                        </div>
                        <div class="right" valign="top">
                            <img src="Images/logo1.png"  class="carimage"/>
                        </div>
                    </div>
                </section>  
                <div  class="inline home_images" align="center"> 
                    <div>
                        <img src="Images/example1.jpg" class="example"/>
                        <img src="Images/example2.jpg" class="example"/>
                        <img src="Images/example3.jpg" class="example"/>
                    </div>

                </div> 
                <!--</main>-->

                <!--</article>-->
            </div>
        </div>
        <footer>
            <div class="footin" >
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
                    <div class="right" >
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
