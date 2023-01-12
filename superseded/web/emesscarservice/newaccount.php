<!DOCTYPE html >
<html>
    <head>
        <title>New Account</title>
        <link href="style.css" rel="stylesheet" type="text/css" />

        <script>
            var previousCheckId;

            function toggle(chkBox) {
                if (chkBox.checked) {
                    if (previousCheckId) {
                        document.getElementById(previousCheckId).checked = false;
                    }
                    previousCheckId = chkBox.getAttribute('id');
                }
            }
        </script>
        <meta http-equiv="X-UA-Compatible" content="IE=8" />
        <meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />
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
                        <li><a href="account.php" class="active">ACCOUNTS</a>
                            <!--<ul><li><a href="NewAccounts.php">New Account</a></li>
                            <li><a href="ExistingAccount.php">Existing Account</a></li>
                            
                            </ul>--></li>

                        <li><a href="aboutus.php">ABOUT US</a></li>
                        <li><a href="contactus.php">CONTACT US</a></li>
                        <li><a href="driveforus.php">DRIVE FOR US</a></li>
                    </ul>

                </header>

                <main>
                    <section >
                        <div class="existing1">
                            <div class="drive_in">


                                <div class="title5">
                                    Account <span class="title6" style="padding-left:12px">Information</span>
                                </div>

                                <div class="exiscont">Fill out our form below and a member of our <br/>
                                    Admin Team will contact you shortly 
                                </div>     
                                <br/><br/>


                                <form  action="newacc.php" method="POST" enctype="multipart/form-data">              
                                    <div class="form_width">
                                        <div class="title5">
                                            Existing <span class="title6" style="padding-left:12px">Information</span>
                                        </div>


                                        <div class="form_name">Company Name:</div>
                                        <div><input type="text" name="cname" value=""  class=" input_form"/></div>

                                        <div>
                                            <div class="inline">
                                                <div class="form_name">First Name:<span  style="color:Red">*</span></div>
                                                <div><input type="text" name="fname" value=""  class=" input_form"/></div>
                                            </div>
                                            <div class="inline">
                                                <div class="form_name">Surname:<span  style="color:Red">*</span></div>
                                                <div><input type="text" name="sname" value=""  class=" input_form"/></div>
                                            </div>
                                        </div>  

                                        <div class="form_name">Address:<span  style="color:Red">*</span></div>
                                        <div><input type="text" name="address" value=""  class="input_form"  style="width:100%;"/></div>


                                        <div>
                                            <div class="inline left">

                                                <div>
                                                    <input type="text" name="address1" value=""  class="input_form"/>
                                                </div>
                                            </div>
                                            <div style="width: 100%;">
                                                <div class="inline form_name" >Postcode:<span  style="color:Red">*</span></div>
                                                <div class="inline" style=" width: 38%;">
                                                    <input type="text" value="" name="pincode" style="width: 100%;"  class="input_form" />
                                                </div>
                                            </div>
                                        </div>
                                        <br/>
                                        <div class="form_name">Daytime Contact Number:<span  style="color:Red">*</span></div>
                                        <div><input type="text" value="" name="contact"  class=" input_form"  /></div>


                                        <div class="form_name">Mobile Number:<span  style="color:Red">*</span></div>
                                        <div><input type="text" value="" name="mobile"  class=" input_form"  /></div>


                                        <div class="form_name">Email:<span  style="color:Red">*</span></div>
                                        <div><input type="text" value="" name="email"  class=" input_form"  style="width:100%;"/></div>

                                    </div>

                                    <div>
                                        <div class="inline" >
                                            <div class="form_name">Payment Method:<span  style="color:Red">*</span></div>  
                                            <div>
                                                <input type="text" value="" name="postcode"  class=" input_form" placeholder="Credit/Debit Card" readonly="readonly" />
                                                <input type="checkbox" id="chkBox100" name="payment" value="Credit/Debit Card" onClick="toggle(this);" class="chk_form" />
                                            </div>
                                            <div>
                                                <!--<input type="checkbox" id="chkBox100" name="payment" value="Credit/Debit Card" onClick="toggle(this);" class="input_form" style="margin: 10% 0 0 10%;"/>-->
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div><input type="text" value=""   class=" input_form" placeholder="Invoice-BACS/cheque" readonly="readonly"/>

                                            <input type="checkbox" name="payment" value="Invoice-BACS/cheque" id="chkBox121" onClick="toggle(this);"  class="chk_form" /></div>
                                    </div>






                                    <div style="height:30px;"></div>
                                    <div ><input id="sub" type="submit" class="title4" style="text-decoration:none;background:none; width:15%; border-top:none; border-left:none; border-right:none;
                                                 border-bottom:solid 1px #ff7e01;" name="action" value="Submit" /></span></div>
                                </form>
                                <div style="height:40px;"></div>
                                <div class="mandatory"><span style="color:red;">*</span>Manadtory Feild</div>

                            </div>

                        </div>

                    </section>
                </main>
            </div> 
        </div>

    </div>
    <footer>
        <div>
            <div class="footin" >
                <div class=" block">
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

                <div class=" block" align="center">
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
        </div>
        <div style="text-align: center">&copy;COPYRIGHT EMESS ALL RIGHTS RESERVED DESIGNED BY CHAVA ADLER</div>
    </footer>
</body>
</html>
