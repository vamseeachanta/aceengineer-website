<?php
$name = $_POST["name"];
$mail = $_POST["email"];
$msg = $_POST["message"];
$to = "support@aceengineer.com";
$subject = $_POST["subject"];
$headers = "From:" . $mail;

try
{


if (mail($to, $subject, $msg, $headers)) {
    echo "Mail Sent.";
    // header("location:http://sixthwing.com/AceengineerDemo/contact.php");
 //header("location:contact.php");

} else {
    echo "failed";
}

}catch(Exception $e){
echo $e->getMessage() ."\n";
}
?>