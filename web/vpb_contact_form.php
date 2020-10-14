<?php
/********************************************************************************************************************
* Contact Form with Captcha using Ajax, Jquery and PHP
* This script is brought to you by Vasplus Programming Blog by whom all copyrights are reserved.
* Website: www.vasplus.info
* Email: vasplusblog@gmail.com or info@vasplus.info
* Please, this script must not be sold and do not remove this information from the top of this page.
*********************************************************************************************************************/
session_start();
ob_start();


if(isset($_POST["submitted"]) && !empty($_POST["submitted"]) && $_POST["submitted"] == 1)
{
	//assigment
	$to_email          = "support@aceengineer.com"; // Replace this email field with your email address or your company email address
	$from_email        = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
	$email_subject     = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
	$email_message     = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
	$security_code     = isset($_POST['vpb_captcha_code']) ? trim(strip_tags($_POST['vpb_captcha_code'])) : '';
	
	
	$vpb_message_body = nl2br("Dear Admin,\n
	The user whose detail is shown below has sent this message from ".$_SERVER['HTTP_HOST']." dated ".date('d-m-Y').".\n
	

	Email Address: ".$from_email."\n

	Message: ".$email_message."\n
	
	
	Thank You!\n\n");
	
	//Set up the email headers
    $headers      = "From: <$from_email>\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
    $headers   .= "Content-type: text/html; charset=iso-8859-1\r\n";
    $headers   .= "Message-ID: <".time().rand(1,1000)."@".$_SERVER['SERVER_NAME'].">". "\r\n";   
	
	//More validation for the input fields
   
	if($from_email == "")
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Please enter your email address in the required email field to proceed. Thanks.</div>';
	}
	elseif(!preg_match("/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/", $from_email))
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Sorry, your email address is invalid. Please enter a valid email address to proceed. Thanks.</div>';
	}
//	elseif($phone_number == "")
//	{
//		echo '<br clear="all"><div class="vpb_info" align="left">Please enter your telephone number in the required field to proceed. Thanks.</div>';
//	}
	elseif($email_subject == "")
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Please enter the subject of your message in the required field to proceed. Thanks.</div>';
	}
	elseif($email_message == "")
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Please enter your message in the required message field to proceed. Thanks.</div>';
	}
	elseif($security_code == "")
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Please enter the security code in its field to send us your message. Thanks.</div>';
	}
	elseif(!isset($_SESSION['vpb_captcha_code']))
	{
		echo '<br clear="all"><div class="vpb_info" align="left">Sorry, no proper session was created for the security code to proceed. Please refresh this page and try again. Thanks.</div>';
	}
	else
	{
		if(empty($_SESSION['vpb_captcha_code']) || strcasecmp($_SESSION['vpb_captcha_code'], $_POST['vpb_captcha_code']) != 0)
		{
			//Note: the captcha code is compared case insensitively. If you want case sensitive match, update the check above to strcmp()
			echo '<br clear="all"><div class="vpb_info" align="left">Sorry, the security code you provided was incorrect, please try again. Thanks.</div>';
		}
		else
		{
			 if(@mail($to_email, $email_subject, $vpb_message_body, $headers))
			 {
				//Displays the success message when email message is sent
				  echo "<br clear='all'><div align='left' class='vpb_success'>Congrats  your email message has been sent successfully!<br>We will get back to you as soon as possible. Thanks.</div>";
			 } 
			 else 
			 {
				 //Displays an error message when email sending fails
				  echo "<br clear='all'><div align='left' class='vpb_info'>Sorry, your email could not be sent at the moment. <br>Please try again or contact this website admin to report this error message if the problem persist. Thanks.</div>";
			 }
		}
	}
}

?>