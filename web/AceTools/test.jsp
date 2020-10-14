<%-- 
    Document   : test
    Created on : 15 Jul, 2011, 1:24:38 AM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
        <script src="stickynote.js"></script>
        <link rel="stylesheet" href="css/StyleSheet.css" type="text/css">


        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
        <script type="text/javascript">

            function handleClick()
            {
                window.showModalDialog("comment.jsp","","dialogWidth:400px; dialogHeight:350px; resizable:no; center:yes; scroll:no;");
                return false;
            }



        </script>


        <script>


            var unqiuevar=new stickynote({
                content:{divid:'test', source:'inline'},
                pos:['right', 'top'],
                showfrequency:'always'

            })

        </script>
        <title>JSP Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
        <table>
            <tr>
                <td>

                    <div id="test" class="stickynote">
                        <h3><a href="AboutUs.jsp">About Us</a> </h3>
                    </div>
                </td>
            </tr>
        </table>
    </body>
</html>

