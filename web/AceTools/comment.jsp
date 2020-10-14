<%-- 
    Document   : comment
    Created on : 14 Jul, 2011, 10:30:06 PM
    Author     : PEPL
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/StyleSheet.css">
        <title>Comments</title>


        <script type="text/javascript">
            function validateThisForm()
            {
                form = document.forms["commentForm"];
                form.subject.value.length;
                
            }
        </script>
    </head>
    <body>
        <%--
                    String subject = request.getParameter("subject");
                    String msg = request.getParameter("message");
                    String name =request.getParameter("name");
                    if (subject != null && subject.length() > 1 && msg != null && msg.length() > 1) {
                        new com.acetools.common.EMailSender().sendMail(subject, msg);
                    }

        --%>


        <table >
            <br>
            <button onclick="window.close()">Close Comments box</button>
            <!-------------------------------------------------------------------------------->
            <div id="HCB_comment_box"><a href="http://www.htmlcommentbox.com">HTML Comment Box</a> is loading comments...</div>
            <link rel="stylesheet" type="text/css" href="http://www.htmlcommentbox.com/static/skins/shady/skin.css" />
            <script type="text/javascript" language="javascript" id="hcb"> /*<!--*/ if(!window.hcb_user){hcb_user={};} (function(){s=document.createElement("script");s.setAttribute("type","text/javascript");s.setAttribute("src", "http://www.htmlcommentbox.com/jread?page="+escape((window.hcb_user && hcb_user.PAGE)||(""+window.location)).replace("+","%2B")+"&mod=%241%24wq1rdBcg%24tMkbPj6qChRhgGEQiHp7W/"+"&opts=414&num=10");if (typeof s!="undefined") document.getElementsByTagName("head")[0].appendChild(s);})(); hcb_user.submit="";/*-->*/ </script>


        </table>
    </body>
</html>

