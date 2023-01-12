<?php
if ($_GET['randomId'] != "vIXwVx2IhfjhxsfKkxX4dkgb9mdW8386EGfIhw8J1SIbl_lOQpxCM102Kx3nO6cZ") {
    echo "Access Denied";
    exit();
}

// display the HTML code:
echo stripslashes($_POST['wproPreviewHTML']);

?>  
