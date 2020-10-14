<!DOCTYPE html>
<html lang="en">
<head>
    <title>Blog</title>
    <meta charset="utf-8">
    <meta name="format-detection" content="telephone=no"/>
  <link rel="icon" href="AceEngineerimages/logoIcon.ico" type="image/x-icon">
    <link rel="stylesheet" href="AceEngineercss/gridBlog.css">
    <link rel="stylesheet" href="AceEngineercss/style1.css">
    <script src="AceEngineerjs/jquery.js"></script>
    <script src="AceEngineerjs/jquery-migrate-1.2.1.js"></script>
    <script src="AceEngineerjs/jquery.equalheights.js"></script>
    <style>
        
/*        
        .btnReplyComment,.btnSubmitUserComments {
  background: #3498db;
  background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
  background-image: -moz-linear-gradient(top, #3498db, #2980b9);
  background-image: -ms-linear-gradient(top, #3498db, #2980b9);
  background-image: -o-linear-gradient(top, #3498db, #2980b9);
  background-image: linear-gradient(to bottom, #3498db, #2980b9);
  -webkit-border-radius: 5;
  -moz-border-radius: 5;
  border-radius: 5px;
  font-family: Arial;
  color: #ffffff;
  font-size: 12px;
  padding: 9px 23px 10px 20px;
  text-decoration: none;
}

.btnReplyComment:hover,.btnSubmitUserComments {
  background: #3cb0fd;
  background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
  background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
  text-decoration: none;
}
        */
        
        .btnReplyComment,.btnSubmitUserComments {
              background: #f1f045 none repeat scroll 0 0;
    color: #413d3d;
    display: inline-block;
    font: 400 24px/30px "Marvel",sans-serif;
    padding: 4px 20px 3px;
      -webkit-border-radius: 5;
  -moz-border-radius: 5;
  border-radius: 5px;
        }
        
        .btnReplyComment:hover,.btnSubmitUserComments:hover {
    background: #249f9c none repeat scroll 0 0;
    color: #ffffff;
    text-decoration: none;
}
.pageUl
            {
                /*float: right;*/
                margin-left: auto;
                margin-right: auto;
                /*margin: 0;*/
                padding: 0;
            }
            .pageUl li
            {
                list-style: none;
                display:inline-block;
            }
            .pageUl li a, .current
            {
                display: block;
                padding: 5px;
                text-decoration: none;
                color: #8A8A8A;
            }
            .current
            {
                font-weight:bold;
                color: #000;
            }
            .pagebutton
            {
                padding: 5px 15px;
                text-decoration: none;
                background: #999966;
                color: #F3F3F3;
                font-size: 13PX;
                border-radius: 5PX;
                margin: 0 40%;
                /*margin: 0 15%;*/
                display: block;
                /*float: right;*/
                
                
            }
     

   /* Landscape phone to portrait tablet */
            @media (max-width: 767px) 
            { 
.abcd
            {
                 width: 100%;
             overflow-x: auto; 
            }
            
             .box_6 .put-left img {
    width: 8%;
             }
  
            }//phone
            
.trComments{
    /*border: 3px solid #ACBAEF;*/
}
    </style>
     <script type="text/javascript">
    
         $(function (){
           $('.UlBlogMenu li').click(function() {
          
                var LinkId=$(this).find('a').attr('href');
  
//scroll down to corresponding div
        $('html, body').animate({
            scrollTop: $(LinkId).offset().top
        }, 3000);
                }); 
        
        
    
        
        //Give new commnet for blog
                            $(document).on("click", ".btnSubmitUserComments", function (event) {
                                
//                                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//  return regex.test(email);
                                
                                         var UserEmail = $(this).parents(".abcd").find('.txtEmail').val();
                                 var UserComments = $(this).parents(".abcd").find('.txtComment').val();
            //validation for email
                                      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//  return regex.test(email);
            
if(regex.test(UserEmail))
{   
            var d = new Date();
var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var date = d.getDate() + " " + month[d.getMonth()] + ", " + d.getFullYear();
//var date = d.getDay() + " " + month[d.getMonth()] + ", " + d.getFullYear();
var time = d.toLocaleTimeString().toLowerCase();
//alert(date+"  time"+time);
                        
                                   var tblNew = '<tr class="trComments"><td colspan="2">  <div style="padding-top: 2%;"><div style="width:5%;display: inline"><img alt="UserComment" src="AceEngineerimages/User.png"></div>';
                            tblNew += '<div style="position: relative;left: 6%;display: inline;font-family: Arial;font-size:25px;color:#3B5998;height:auto;width:60%;">'+UserEmail+'</div>';
                            tblNew += '<div style="width:5%;display: inline;position: relative;left: 8%;font-size:20px;color:#A349A4">'+date+' '+time+'</div>';
                                tblNew += '<div style="position: relative;left: 13%;width:90%;padding-top:1%">'+UserComments+'</div>';
//                              tblNew += '<div style="position: relative;left: 13%;"><input type="button" value="Reply" class="btnGenerateReplyTable"> &nbsp;&nbsp;</div> <hr/></div></td></tr>';
                              tblNew += '<div style="position: relative;left: 13%;"><a class="btnGenerateReplyTable" href="#btnGenerateReplyTable">Reply</a> &nbsp;&nbsp;</div> <hr/></div></td></tr>';

                       $(this).parents(".abcd").find('.tblGetComments').append(tblNew);
       
                        var tblId=$(this).parents(".abcd").find('.tblGetComments').attr("id");
                       var tblSave=encodeURIComponent('<div class="abcd"><table width="70%;" border="2" class="tblGetComments" id="' +tblId  +'"/>'+ $(this).parents(".abcd").find('.tblGetComments').html()+'</table></div>');
                       
//                       alert(tblSave);
                       
                       SaveBloGComment(tblSave,tblId);
                      }
                      else
                   {
                   alert("Please enter valid email");
                   }
                   });
                   
                   //reply button click generate reply comment box controls(Email. comment)
//                   $(document).on("click", ".btnGenerateReplyTable", function (event) { 
                   $(document).on("click", "a.btnGenerateReplyTable", function (event) { 
//                      $('a[href="#sign_up"]').
                       //Remove comment box controls(Email. comment) row
                       event.preventDefault();
                       $(this).parents(".abcd").find('.tblGetComments tr.trRmove').remove();
                    
                      
//                                  var tblNew = '<tr class="trRmove" style="outline: thin solid black;"><td> Email :</td><td> <input type="text"  class="txtReplyEmail" />  </td></tr>';
//                        tblNew += '<tr class="trRmove" style="outline: thin solid black;"><td>Comment :</td><td ><textarea cols="60" rows="8" class="txtReplyComment"></textarea> </td></tr>';
//                  tblNew  += '<tr class="trRmove" style="outline: thin solid black;text-align: center;"><td colspan="2"><input type="button" value="ReplyPost" class="btnReplyComment" /></td></tr>';
 var tblNew = '<tr class="trRmove" ><td> Email :</td><td> <input type="text"  class="txtReplyEmail" />  </td></tr>';
 tblNew += '<tr class="trRmove" ><td>Comment :</td><td ><textarea cols="60" rows="8" class="txtReplyComment"></textarea> </td></tr>';
 tblNew  += '<tr class="trRmove" style="text-align: center;"><td colspan="2"><input type="button" value="ReplyPost" class="btnReplyComment" /></td></tr>';
                            
                               
    $(this).parents(".abcd").find('.tblGetComments tr').eq( $(this).closest("tr").index()).after( tblNew);
    
                   });
                   
                     //replyPost button click post a comment for existing one user comment
                           $(document).on("click", ".btnReplyComment", function (event) { 
                       
                       
                                 var UserEmail = $(this).parents(".abcd").find('.txtReplyEmail').val();
                                 var UserComments = $(this).parents(".abcd").find('.txtReplyComment').val();
                           
                                            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//  return regex.test(email);
            
if(regex.test(UserEmail))
{ 
        var tblNew = '<tr class="trComments"><td colspan="2">  <div style="padding-top: 2%;"><div style="display: inline;width:5%;position: relative;left: 10%;"><img alt="UserComment" src="AceEngineerimages/User.png"></div>';
                            tblNew += '<div style="position: relative;left: 14%;display: inline;font-family: Arial;font-size:25px;color:#3B5998;height:auto;width:60%;">'+UserEmail+'</div>';
                                tblNew += '<div style="position: relative;left: 21%;width:90%;padding-top:1%">'+UserComments+'</div>';
//                              tblNew += '<div style="position: relative;left: 21%;"><input type="button" value="Reply" class="btnGenerateReplyTable"> &nbsp;&nbsp;</div> </div></td></tr>';
                              tblNew += '<div style="position: relative;left: 21%;"><a class="btnGenerateReplyTable" href="#btnGenerateReplyTable">Reply</a>&nbsp;&nbsp;</div> </div></td></tr>';

                    $(this).parents(".abcd").find('.tblGetComments tr').eq( $(this).closest("tr").index()).after( tblNew);
                    var tblId =$(this).parents(".abcd").find('.tblGetComments').attr("id");
                     $(this).parents(".abcd").find('.tblGetComments tr.trRmove').remove();
   
//     $('.btnGenerateReplyTable').show();
                   
    var tblSave=encodeURIComponent('<div class="abcd"><table width="70%;" border="2" class="tblGetComments" id="' +tblId  +'"/>'+ $("#"+tblId).html()+'</table></div>');
                       
                       
                       SaveBloGComment(tblSave,tblId);
  }
  
  else
  {
      alert("Please enter valid email");
  }
  });
         

     
            });
        function SaveBloGComment(tblbody,tblId)
        {
                $.ajax({
            url: "Database.php",
            type: "post",
            data: "Mode=" + "SaveComments" + "&tableData=" + tblbody + "&tableId=" + tblId,
            success: function(res) {
//                alert(res);
                
    },
    
//    error: function (jqXHR, textStatus, errorThrown) {
    error:  function(e) {
                        alert(e);
                    }
                    
                      });
        }
//        tblGetComments
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
                            <a href="index.html">     
                                <img src="AceEngineerimages/AceOrginal_new.JPG" style="width: 250px;" alt="Logo"/>
                            </a>
                        </h1>
                    </div>
                    
                       <nav class="nav put-right">
                           <ul class="sf-menu" style="list-style: none;">
                            <li ><a href="index.php">Home</a></li>
                            <li >
                                <a href="service.php">Services</a>
                            </li>
                            <li ><a href="portfolio.php">Portfolio</a></li>
                            <li><a href="about.php">About us</a></li>
                            <li><a href="career.php">Careers</a></li>
                            <li class="current"><a href="blog.php">Blog</a></li>
                            <li><a href="contact.php">Contact Us</a></li>
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
            <div class="grid_12" >
  
  
      <h2 class="header_2 color_3" id="co">Blog</h2>

                        
                    
                    </div>
                    </div>
                    </div>
<!--         <div class="container">
            <div class="row" style="  padding-top: 20px;">
              
                         <div class="grid_8">-->
               <!--         <?php
                    
            
              
                         
echo '<div class="container"><div class="row" style="  padding-top: 20px;"><div class="grid_8">';
               $username = "aceeng_Ace";
                    $password = "Ace@123";
                    $hostname = "localhost";
                    $dbhandle = mysql_connect($hostname, $username, $password)
                            or die("Unable to connect to MySQL");


                    $dbName = "aceeng_AceEngineerNew";
                    $selected = mysql_select_db($dbName)
                            or die("Could not select OilAndGas");



                    $start = 0;
                    $limit = 5;

                    if (isset($_GET['id'])) {
                        $id = $_GET['id'];

                        $start = ($id - 1) * $limit;
                    }
                    if (!isset($id)) {
                        $id = 1;
                    }
            
                    $query2 = mysql_query("SELECT * FROM `ace_blog` LIMIT $start, $limit");

                   $result1 = "";
                   $menu= "";
                   $CommentBox= "";
        while ($query3 = mysql_fetch_array($query2)) {
 
//                                            $result1=  $result1.' <div class="wrap_10"><h2 class="header_2 indent_5" id="' . $query3['UrlHeading'] . '"></h2><br/><h2 class="header_2 indent_1">' . $query3['Heading'] . '</h2>';
                                            $result1=  $result1.' <div class="wrap_10"  id="' . $query3['UrlHeading'] . '"><h2 class="header_3 indent_1 ' . $query3['UrlHeading'] . '">' . $query3['Heading'] . '</h2>';
     
                  //table comment box
//  $CommentBox =  '<br/><div class="abcd"><table class="tblNewComments Newtbl' . $query3['Id'] . '"><tr><td>Email </td><td><input type="text" value="bnd" class="txtEmail" /> </td></tr><tr><td colspan="2"><textarea cols="60" rows="8" class="txtComment"></textarea> </td></tr><tr><td colspan="2" style="text-align: center;"><input type="button" class="btnCommentPost"  value="Post" /> </td></tr></table>';
//  $CommentBox =  $CommentBox.'<br/><table class="tblGetComments Gettbl' . $query3['Id'] . '" border="2" width="80%;"></table></div>';
//      
//                              
                      
                                            if($query3['BlogComment'] !=""){
             $CommentBox =  '<br/>'.$query3['BlogComment'];                                   
                                            }
                                            else{
//             $CommentBox =  '<div class="abcd" style="margin-bottom:3%;"> <table style="width=70%;" class="tblGetComments" id="' . $query3['Id'] . '"><tbody><tr style="outline: thin solid black;"> <td> Email : </td>  <td><input type="text" class="txtEmail" /></td> </tr>';
// $CommentBox =  $CommentBox.'<tr style="outline: thin solid black;"> <td>Comment :</td>  <td ><textarea cols="60" rows="8" class="txtComment"></textarea> </td>  </tr>  <tr style="outline: thin solid black;text-align: center;"> <td colspan="2"> <input type="button" value="submit" class="btnSubmitUserComments" />  </td> </tr></tbody></table>  </div><hr/>' ;
 $CommentBox =  '<div class="abcd" style="margin-bottom:3%;"> <table style="width=70%;" class="tblGetComments" id="' . $query3['Id'] . '"><tbody><tr> <td> Email : </td>  <td><input type="text" class="txtEmail" /></td> </tr>';
 $CommentBox =  $CommentBox.'<tr> <td>Comment :</td>  <td ><textarea cols="60" rows="8" class="txtComment"></textarea> </td>  </tr>  <tr style="text-align: center;"> <td colspan="2"> <input type="button" value="submit" class="btnSubmitUserComments" />  </td> </tr></tbody></table>  </div><hr/>' ;
                                            }
                                            
  $result1=  $result1.'<div class="box_6"> <div class="put-left" ><p class="text_6" style="text-align: justify;padding-bottom: 2%;">' . stripslashes($query3['BlogContent']) . ' </p>' .$CommentBox.' </div></div></div>';       

  
  
                        $menu = $menu.'<li><a href="#' . $query3['UrlHeading'] . '">' . $query3['Heading'] . '</a></li>';            
                        }
                    echo $result1.' </div>';
     
         $menuRes= '<div class="grid_4"> <div class="wrap_10"><h2 class="header_3 indent_1"> Categories</h2> <ul class="list_2 text_3 color_5 UlBlogMenu" style="list-style: none;">' . $menu. '</ul></div> </div>';
            echo $menuRes;
            echo '</div></div>';            
            
                     

                    $rows = mysql_num_rows(mysql_query("select * from `ace_blog`"));
                    $total = ceil($rows / $limit);
echo '<div class="container" style="padding-top : 20px;"><div class="row"><div class="grid_6"><ul class="pageUl"  style="list-style: none;" >';
                 
 for ($i = 1; $i <= $total; $i++) {
                        if ($i == $id) {
                            echo "<li class='current'>" . $i . "</li>";
                        } else {
                            echo "<li><a href='?id=" . $i . "'>" . $i . "</a></li>";
                        }
                    }
                    echo '</div>';
             
                    echo "<div class='grid_6'>";
                   
                    
                    if ($id > 1) {
                        echo "<a href='?id=" . ($id - 1) . "' class='pagebutton'>PREVIOUS</a>";
                    }
                    if ($id != $total) {
                        echo "<a href='?id=" . ($id + 1) . "' class='pagebutton'>NEXT</a>";
                    }
                    echo "</ul></div></div></div>";
                    mysql_close();
                    ?>-->

             
             
             
     
    <div class="container" style="padding-bottom: 20px;">
    <div class="row">
         
        <div class="grid_12"  style="padding-top : 5px;">
            <div class="header_1 wrap_3 color_3">
                   <h1>This page is under construction</h1>
                Get in Touch
            </div>
                <div class="box_3">
                    <ul class="list_1" style="list-style: none;">
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
