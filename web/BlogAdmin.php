<?php

session_start();
 
 if( isset($_SESSION['UserName']) && !empty($_SESSION['UserName']) ) {
     
 
 }
 
 else {
     header("location:Login.php");
}



?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>AceEngineer Services </title>
        
        <link href="templatemo_style.css" rel="stylesheet" type="text/css" />
        <link rel="Shortcut Icon" href="logoIcon.ico " type="image/x-icon" />
        <script type="text/javascript" src="scripts/swfobject/swfobject.js"></script>

           <script src="js/jquery-1.10.2.js" type="text/javascript"></script>
        <script src="js/bootstrap.js" type="text/javascript"></script>
        <link href="css/bootstrap.css" rel="stylesheet" type="text/css"/>
        <script src="js/AdminBlog1.js" type="text/javascript"></script>
         <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet"></link>
            <link href="css/HtmlEditor.css" rel="stylesheet" type="text/css"/>
        <script src="js/HtmlEditor.js"></script>
        <link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />
     <link href="css/BlogFont.css" rel="stylesheet" type="text/css"/>
     
        <style>
            #templatemo_main
  {
  margin-left: -1%;
  }

.note-editor {
     font-size: 18px;
     /*font-family: sans-serif;*/
     font-family: 'Open Sans';
     font-weight: 300;
}


        </style>

    </head>
    <body>

        <div id="templatemo_wrapper">

            <div id="templatemo_header">

                <div ><a href="home.php" ><img src="AceEngineer.JPG" style="float: left;width: 250px;"></a></div>

                <div id="templatemo_menu" class="ddsmoothmenu" >
                    <ul>
                        <li><a href="home.php" ><span id="menu">Home</span></a></li>
                        <li><a href="services.html" ><span id="menu">Services</span></a></li>
                        <li><a href="portfolio.html"><span id="menu">Portfolio</span></a></li>
                        <li><a href="about.html"><span id="menu">About us</span></a></li>
                        <li><a href="blog.php" class="selected"><span id="menu">Blog</span></a></li>
                        <li><a href="contact.html"><span id="menu">Contact Us</span></a></li>
                    </ul>
                    <br style="clear: left" />
                </div> <!-- end of templatemo_menu -->

                <div id="templatemo_main">
                    <!--                    <div id="templatemo_content1">-->

                    <div class="post_box">
                        <div class="post_header" >
                            <h2 style="padding-left: 50px">Blog Admin</h2>
                        </div><br/>
                        <div class="post_inner1" style="padding-left: 50px">

                      <div id='DivBlogArea'>
                
           
                           <div style="height: 80px;">
            <table style="margin-left: auto; margin-right: auto;">
                <tr>
                    <td>
                        <b> Date of blog created: </b>
                    </td>
                    <td>
                        <select id="DropdownBlogDate">
                            <option>Choose</option>
                        </select>
                    </td>
                    
                </tr>
            </table>
                            
                            
        </div>  
            
                      
                <div>
                       <table>
                                   <tr>
                                       <td>Side menu Heading</td>
                                       
                                   </tr>
                                   <tr>
                                       <td><textarea rows="2" cols="100" id="txtHeading"></textarea> </td>

                                   </tr>
                                     <tr>
                                       <td>Url Heading</td>
                                       
                                   </tr>
                                   <tr>
                                       <td><textarea rows="2" cols="100" id="txtUrlHeading"></textarea> </td>

                                   </tr>
                               </table>
                </div>
                <br>
                        <div id="summernote">
                        
                            <!--COntent-->
                           
                        </div>

                        <br>
        <div>
            
<button id="save" class="btn btn-primary" onclick="save()" type="button">Save Blog Content</button>
<button id="btnUpdate" class="btn btn-primary" onclick="Update()" type="button">Update Blog Content</button>
<button id="btnDelete" class="btn btn-primary" onclick="Delete()" type="button">Delete Blog Content</button>

        </div>
        <br>
             </div>

                        </div>
                    </div>


                    <div class="post_box">

                    </div>
                </div> <!-- end of content -->

                <div id="templatemo_sidebar1">
                    <div class="sb_box">
                    </div>
                </div> 

                <hr style="width: 100%"></hr>

            </div>

            <div class="cleaner h20"></div>
            <div id="templatemo_footer_wrapper">
                <div id="templatemo_footer">
                    Copyright © 2011 <a style="text-decoration: none;color: black">AceEngineer </a> |
                    Designed by <a style="text-decoration: none;color: black">AceEngineer</a>

                </div>
            </div>

        </div>
        </div>



    </body>
</html>