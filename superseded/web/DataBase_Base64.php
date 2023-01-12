<?php
session_start();
$username = "aceeng_Ace";
$password = "Ace@123";
$hostname = "localhost"; 

//connection to the database 
$dbhandle = mysql_connect($hostname, $username, $password) 
  or die("Unable to connect to MySQL");
//echo "Connected to MySQL<br>";

$dbName="aceeng_AceEngineerNew";
$selected = mysql_select_db($dbName) 
  or die("Could not select OilAndGas");

//$Mode=  isset($_REQUEST['Mode']) ;
$Mode=  $_REQUEST['Mode'];

try {

    
    
        //Admin crenditals
    if ($Mode == "Login") {
       
        
$UserName = ($_REQUEST['UserName']);
//$UserName = isset($_REQUEST['UserName']);
$Password = ($_REQUEST['Password']);
//$Password = isset($_REQUEST['Password']);

    if ($UserName == "AceEngineer" && $Password == "AceEngineer@2020" ) {
      $_SESSION['UserName']="AceEngineer";
          echo 'True';
        
    }

       
    }

    //Delete Image from folder
    if ($Mode == "DeleteImage") {
        $ImageTag = $_REQUEST['ImageLink'];


        unlink("ImageUploadSave/" . $ImageTag);
    }
    
    
    //Save Blog content in to database table
    if ($Mode == "SaveContent") {
        $Content = mysql_real_escape_string($_REQUEST['Content']);
       $HeadingTitle= mysql_real_escape_string( $_REQUEST['HeadingTitle'] );
       $UrlHeadingTitle= mysql_real_escape_string( $_REQUEST['UrlHeadingTitle'] );  // $UrlHeadingTitle=>UrlHeading1 ====> htt:example.com/#UrlHeading1
       
       $result = mysql_query("INSERT INTO `ace_blog`(`BlogContent`,`BlogDate`,`Heading`,`UrlHeading`) VALUES ('$Content',NOW() ,'$HeadingTitle' ,'$UrlHeadingTitle' )");
       
       if($result==1){
       echo "Saved successfully";
    }//if
    
       }

           //Save Blog content in to database table
    if ($Mode == "UpdateMode") {
        $UpdateContent = mysql_real_escape_string($_REQUEST['UpdateContent']);
        $BlogDate = mysql_real_escape_string($_REQUEST['SelectedBolgDate']);
        $BlogHeading= mysql_real_escape_string( $_REQUEST['BlogHeading'] );
        $BlogUrlHeading= mysql_real_escape_string( $_REQUEST['BlogUrlHeading'] );
       $result = mysql_query("Update  `ace_blog` set `BlogContent` ='$UpdateContent' ,`Heading` ='$BlogHeading' ,`UrlHeading` ='$BlogUrlHeading' where  `BlogDate`='$BlogDate' ");
       
       if($result==1){
       echo "updated successfully";
    }//if
      else
    {
        echo "Update  `ace_blog` set `BlogContent` ='$UpdateContent', set  `Heading` ='$BlogHeading' where  `BlogDate`='$BlogDate' ";
    }
       }
       
       
               //Save Blog content in to database table
    if ($Mode == "DeleteMode") {
        
        $BlogDate = mysql_real_escape_string($_REQUEST['SelectedBolgDate']);
      
       $result = mysql_query("Delete  From `ace_blog` where  `BlogDate`='$BlogDate' ");
       
       if($result==1){
       echo "Deleted  successfully";
    }//if
    
       }
       
   
    
    //Get Blog dates from database
    if ($Mode == "GetBlogDates") {
        
    $result = mysql_query("SELECT `BlogDate` FROM `ace_blog`");
    $result_set=array();
    $arr = array();
    while ($row = mysql_fetch_array($result)) {

            $BlogDate= $row['BlogDate'];

    $arr[] = array('BlogDate' => $BlogDate);

}

echo json_encode($arr);
}

    //Retrieve content from database
if ($Mode == "GetSelectedContent") {
   $BlogDate = mysql_real_escape_string($_REQUEST['BlogDate']);
    $result = mysql_query("SELECT `BlogContent`,`Heading`,`UrlHeading` FROM `ace_blog` where `BlogDate`= '$BlogDate' ");
    $result_set=array();
    $arr = array();
    while ($row = mysql_fetch_array($result)) {

          
            $Content =stripslashes( $row['BlogContent'] );
            $BlogHeading = $row['Heading'];
            $UrlHeading = $row['UrlHeading'];
            
  

    $arr[] = array('Content' => $Content,'BlogHeading' => $BlogHeading ,'UrlHeading' => $UrlHeading);

}

echo json_encode($arr);
}




    //Retrieve content from database
if ($Mode == "ShowContent") {

    $result = mysql_query("SELECT `BlogContent`,`BlogDate`,`Heading`,`UrlHeading` FROM `ace_blog`");
    $result_set=array();
    $arr = array();
    while ($row = mysql_fetch_array($result)) {

          
            $Content = $row['BlogContent'];
            $BlogDate= $row['BlogDate'];
            $BlogHeading= $row['Heading'];
           $UrlHeading = $row['UrlHeading'];
            

    $arr[] = array('Content' => $Content, 'BlogDate' => $BlogDate, 'BlogHeading' => $BlogHeading , 'BlogUrlHeading' => $UrlHeading);

}

echo json_encode($arr);
}
    
            
            
} catch (Exception $e) {
    echo 'Caught exception: ', $e->getMessage(), "\n";
}
?>