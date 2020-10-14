<?php

$name = $_POST["author"];
$mail = $_POST["email"];
$msg = $_POST["text"];
$to = "support@aceengineer.com";
$subject = $_POST["sub"];
$headers = "From:" . $mail;
if (mail($to, $subject, $msg, $headers)) {
//    echo "Mail Sent.";
    header("location:contact.html");
} else {
    echo "failed";
}
?>
