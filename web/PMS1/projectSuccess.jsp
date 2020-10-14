<%-- 
    Document   : projectSuccess
    Created on : Jan 29, 2012, 12:51:51 AM
    Author     : Dell
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
        <title>Success</title>

        <script type="text/javascript">
            setTimeout("self.close()",5000);
            function get(){
                $('#close').click(function(){
                    window.get();
                });
            }
        </script>
        <style type="text/css">
            body{
                background:  #B4D1F8;
                font-family: sans-serif;
            }

            .row{
                background: gray;

                /*                display: table-row;*/
            }
            #leftCell{
                position: relative;
                display: table-cell;
                padding: 10px;
            }

            #rightCell{
                position: relative;
                display: table-cell;
                padding: 10px;
            }
            h1{
                color: white;
            }

            label{
                text-decoration: underline;
                color:red;
                cursor: pointer;
                font-size: 18px;
            }
        </style>


    </head>
    <body onload="get();">
        <div class="row">
            <div id="leftCell"><img src="res/images/thumbs-up.png" height="50" width="50"/></div>
            <div id="rightCell"><h1>Submitted successfully</h1></div>
        </div>
        <p>Note:Click <label id="close" >Close</label> or  The window will automatically closed in 5 seconds</p>
    </body>
</html>
