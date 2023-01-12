<?php
//session_start();
//  unset($_SESSION['UserName']);
if (isset($_SESSION["UserName"]) && !empty($_SESSION["UserName"]))
    {
    header( 'Location: BlogAdmin.php' ) ;  
    }
    

 
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>


	<!-- General meta information -->
	<title>Login page for Admin</title>
	
	
        
     
        <script src="js/jquery-1.10.2.js" type="text/javascript"></script>
	
        <link type="text/css" rel="stylesheet" href="css/loginStyle.css" media="screen" />

	
<script>


	$(document).ready(function(){
 
	$("#submit1").hover(
	function() {
	$(this).animate({"opacity": "0"}, "slow");
	},
	function() {
	$(this).animate({"opacity": "1"}, "slow");
	});
        
        
         $("#submit2").click(function (){
           
          try
          {

              var UserName=$(".txtuserName").val();
              var Password=$(".txtpassword").val();
          
               $.ajax({
                    type: "POST", 		//GET or POST or PUT or DELETE verb
                    url: "Database.php", 		// Location of the service
                
                    data: "Mode="+"Login"+"&UserName="+UserName+"&Password="+Password, 		//Data sent to server

                    success: function (result) {//On Successful service call
                   
                        if(result === "True"){
                        
                           $(location).attr('href',"BlogAdmin.php");
                        }
                        else
                        {
                         alert("UserName or Password Invaild");
                        }
                       
                       
                    },
                    error: function (error) {
                   alert(error);
                        }// When Service call fails
                });
          }
          catch(e)
          {
           alert(e.message);
          }
      });
      
      
 	});


</script>
	
</head>
<body>

	<div id="wrapper">
		<div id="wrappertop"></div>

		<div id="wrappermiddle">

			<h2>Admin Login</h2>

			<div id="username_input">

				<div id="username_inputleft"></div>

				<div id="username_inputmiddle">
				
                                    <input type="text" name="link" class="txtuserName" id="url" />
                                            <img id="url_user" src="images/mailicon.png" alt="UesrName Icon"/>
				
				</div>

				<div id="username_inputright"></div>

			</div>

			<div id="password_input">

				<div id="password_inputleft"></div>

				<div id="password_inputmiddle">
				
					<input type="password" class="txtpassword" name="link" id="url" />
					<img id="url_password" src="images/passicon.png" alt="Password Icon"/>
				
				</div>

				<div id="password_inputright"></div>

			</div>

			<div id="submit">
				
				
				<input type="image" src="images/submit.png" id="submit2" value="Log In"/>
				
			</div>


			<div id="links_left">

                            <a href="BlogDiscussions.php">BlogDiscussions</a>

			</div>

			<!-- <div id="links_right"><a href="#">Forgot your Password?</a></div> -->

		</div>

		<div id="wrapperbottom"></div>
		
	</div>

</body>
</html>