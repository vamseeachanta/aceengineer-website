<?php 

$from = "venkat.sana@aceengineer.com";


   $fr = "pw-no-reply@myfinancialapps.com"; // this is your Email address
   $to = $from; // this is the sender's Email address
   $subject = "Schedule C Request";
   $message = "Dear";
   $headers = "From:" . $fr;
    
  mail($to,$subject,$message,$headers);

  echo "success";



   
   
?>