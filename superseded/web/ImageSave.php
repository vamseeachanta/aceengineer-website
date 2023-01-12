<?php



try {
    if ($_FILES['file']['name']) {
        if (!$_FILES['file']['error']) {

            $name = $_FILES['file']['name'];
            $ext = explode('.', $_FILES['file']['name']);
            $filename = $name;

            $destination = '/home/aceeng/public_html/ImageUploadSave/' . $filename; //change this directory
            $location = $_FILES["file"]["tmp_name"];
            move_uploaded_file($location, $destination);
            echo 'ImageUploadSave/' . $filename; //change this URL
        } else {
            echo $message = 'Ooops!  Your upload triggered the following error:  ' . $_FILES['file']['error'];
        }
    }


} //try
catch (Exception $e) {
    echo 'Caught exception: ', $e->getMessage(), "\n";
}
        
        