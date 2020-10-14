<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>AceEngineer Home</title>
        <meta name="keywords" content="Chrome Web Design, CSS, HTML, free template, piecemaker" />
        <meta name="description" content="Chrome Web Design is a free website template integrated with PieceMaker 3D Flash Slider." />
        <link href="templatemo_style.css" rel="stylesheet" type="text/css" />
        <link rel="Shortcut Icon" href="logoIcon.ico " type="image/x-icon" />
        <script type="text/javascript" src="js/sliderman.1.3.7.js"></script>
        <link rel="stylesheet" type="text/css" href="css/sliderman.css" />
        <script type="text/javascript" src="scripts/swfobject/swfobject.js"></script>
        <script type="text/javascript">
            $(window).load(function(){
                $("#loading").hide();		
            })
        </script>
        <script type="text/javascript" src="swfobject.js"></script>
        <script type="text/javascript">
            var flashvars = {};
            flashvars.xml_file = "flashmo_264_photo_list.xml";
            var params = {};
            params.allowfullscreen = true;
            var attributes = {};
            attributes.id = "flashmo_template";
            attributes.name = "flashmo_template";
            swfobject.embedSWF("flashmo_264_bar_gallery.swf", "flashmo_template", "960", "360", "9.0.0", false, flashvars, params, attributes);
        </script>


        <link rel="Shortcut Icon" href="logoIcon.ico " type="image/x-icon" />
        <link rel="stylesheet" type="text/css" href="css/ddsmoothmenu.css" />

        <script type="text/javascript" src="scripts/jquery.min.js"></script>
        <script type="text/javascript" src="scripts/ddsmoothmenu.js">

            /***********************************************
             * Smooth Navigational Menu- (c) Dynamic Drive DHTML code library (www.dynamicdrive.com)
             * This notice MUST stay intact for legal use
             * Visit Dynamic Drive at http://www.dynamicdrive.com/ for full source code
             ***********************************************/

        </script>

        <script type="text/javascript">

            ddsmoothmenu.init({
                mainmenuid: "templatemo_menu", //menu DIV id
                orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
                classname: 'ddsmoothmenu', //class added to menu's outer DIV
                //customtheme: ["#1c5a80", "#18374a"],
                contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
            })

        </script>
        <script type="text/javascript">

            //            Sliderman.effect({name: 'fade', fade: true, duration: 1000});
            //            Sliderman.effect({name: 'move', left: true, move: true, duration: 1000});
            //            Sliderman.effect({name: 'stairs', cols: 7, rows: 5, delay: 30, order: 'straight_stairs', road: 'BL', fade: true});
            //            Sliderman.effect({name: 'blinds', cols: 10, delay: 100, duration: 1000, order: 'straight', right: true, zoom: true, fade: true});
            //            Sliderman.effect({name: 'rain', cols: 10, delay: 100, duration: 1000, order: 'straight', top: true, fade: true});
            // we created new effect and called it 'demo01'. We use this name later.
            //            Sliderman.effect({name: 'demo01', cols: 10, rows: 5, delay: 10, fade: false, order: 'rain'});
            Sliderman.effect({name: 'blinds', cols: 10, delay: 100, duration: 1000, order: 'straight', right: true, zoom: true, fade: true});

            var demoSlider = Sliderman.slider({container: 'SliderName', width: 960, height: 450, effects: 'blinds',
                display: {
                    pause: true, // slider pauses on mouseover
                    autoplay: 3000, // 3 seconds slideshow
                    always_show_loading: 200, // testing loading mode
                    description: {background: '#ffffff', opacity: 0.5, height: 50, position: 'bottom'}, // image description box settings
                    loading: {background: '#000000', opacity: 0.2, image: 'img/loading.gif'}, // loading box settings
                    buttons: {opacity: 1, prev: {className: 'SliderNamePrev', label: ''}, next: {className: 'SliderNameNext', label: ''}}, // Next/Prev buttons settings
                    navigation: {container: 'SliderNameNavigation', label: '&nbsp;'} // navigation (pages) settings
                }});

        </script>


    </head>
    <body oncontextmenu="return false">
        <div id="templatemo_wrapper" >
            <div id="templatemo_header">

                <div ><a href="home.php" ><img src="AceEngineer.JPG" style="float: left;width: 250px;height: 100px"></a></div>

                <div id="templatemo_menu" class="ddsmoothmenu" >
                    <ul>
                        <li><a href="home.php" class="selected">Home</a></li>
                        <li><a href="services.html" class="">Services</a></li>
                        <li><a href="portfolio.html">Portfolio</a></li>
                        <li><a href="about.html">About us</a></li>
                        <li><a href="career.html" class="">Careers</a></li>
 <li><a href="blog.php" ><span id="menu">Blog</span></a></li>
                        <li><a href="contact.html"><span id="menu">Contact Us</span></a></li>
                    </ul>
                    <br style="clear: left" />
                </div> <!-- end of templatemo_menu -->

            </div> <!-- end of header -->
            <!--            <div align="center" style="margin-top: 20px;">-->
<!--            <hr/>-->
            <div align="center">
                <!--                 flash gallery SWF -->
                <!--                                <div id="templatemo_main">
                                                    <div id="flashmo_template">
                                                        <br /><br />
                                                        <a href="http://www.flashmo.com" target="_blank">Free Flash Gallery</a>
                                                        <br /><br />
                                                        <a href="http://www.adobe.com/go/getflashplayer" target="_blank">
                                                            <img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" />
                                                        </a>
                                                    </div>
                                                </div>-->
                <div id="examples_outer" >
                    <!--			<h2>Sliderman.js &mdash; Demo 1</h2>-->

                    <div id="slider_container_1">

                        <div id="SliderName"> <!--  style="border: 1px solid lightgray;">-->

                            <!--                            <a href="#1">-->
                                                           <!-- <img src="img/1.jpg" title="Description from Image Title" />-->
                            <!--                            </a>-->
                            <!--                            <div class="SliderNameDescription">
                                                            <img src="" height="40" style="float:left;margin-right:5px;" />
                                                            <strong>Nulla luctus congue fermentum.</strong><br />Integer <a href="javascript:void(0);">elementum</a> convallis lorem eu volutpat. Suspendisse fermentum arcu in lorem fringilla ultricies. Nam vel diam nisi.
                                                        </div>-->

                            <img src="photos/slide.png" style="height: 390px;width: 960px;" />

<!--                            <img src="img/3.jpg" />-->
                            <!--                            <div class="SliderNameDescription"><a href="#3">Link</a></div>-->
<!--                            <img src="img/4.jpg" />-->
<!--                            <div class="SliderNameDescription"><strong>Nullam nec velit vel leo tristique commodo.</strong><br />Nulla facilisi. Fusce lacus massa, ullamcorper sed hendrerit quis, venenatis eget tortor.</div>-->

<!--                                <img src="img/5.jpg" />-->
<!--                            <img src="img/6.jpg" />-->
                        </div>
                        <!--                        <div class="c"></div>
                                                <div id="SliderNameNavigation"></div>
                                                <div class="c"></div>-->

<!--                        <script type="text/javascript">

                            // we created new effect and called it 'demo01'. We use this name later.
                            Sliderman.effect({name: 'demo01', cols: 10, rows: 5, delay: 10, fade: true, order: 'straight_stairs'});

                            var demoSlider = Sliderman.slider({container: 'SliderName', width: 960, height: 400, effects: 'demo01',
                                display: {
                                    pause: true, // slider pauses on mouseover
                                    autoplay: 3000, // 3 seconds slideshow
                                    always_show_loading: 200, // testing loading mode
                                    description: {background: '#ffffff', opacity: 0.5, height: 50, position: 'bottom'}, // image description box settings
                                    loading: {background: '#000000', opacity: 0.2, image: 'img/loading.gif'}, // loading box settings
                                    buttons: {opacity: 1, prev: {className: 'SliderNamePrev', label: ''}, next: {className: 'SliderNameNext', label: ''}}, // Next/Prev buttons settings
                                    navigation: {container: 'SliderNameNavigation', label: '&nbsp;'} // navigation (pages) settings
                                }});

                        </script>-->
                    </div>
                </div>

                <!--                <div class="c"></div>-->
            </div>
            <!--            <div class="c"></div>
                        <div id="SliderNameNavigation"></div>
                        <div class="c"></div>-->
            <!-- flash gallery SWF --> 

            <!--                <a href="http://www.flashmo.com/preview/flashmo_264_bar_gallery" target="_parent">Bar Gallery</a> with bar transition effects</div>-->

            <!--            <div id="templatemo_fw">
                            <div id="piecemaker">
                                <p>This is a placeholder of 3D Flash Slider. Feel free to put in any alternative content here.</p>
                            </div>
                        </div>-->
            <div>                
                <div id="templatemo_main">
                    <div class="col_fw" style="padding-left: 50px">
                        <div class="col_w460 float_l" >
                            <h5>Welcome to AceEngineer</h5>
                           <!-- <img src="images/imagetempl.jpg" alt="image 01" class="float_l" />
                            <img src="images/temp2.jpg" alt="image 02" class="float_r" />
                            <div class="cleaner h20"></div>-->



                            <p>AceEngineer is a programming services provider offering customized solutions to meet the needs of our

                                clients. AceEngineer employs a 3 step simple solution for serving the clients:<br/>


                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  •	Customized solution approach to suit client requirements<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  •	Knowledge and application of latest technologies<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  •	Innovative approach of our experienced and skilled programmers<br/>
                            </p>
                            <p>The company is based in US and India.</p>
                            <!--                        <ul class="tmo_list">
                                                        <li>Dictum eu pharetra quam semper</li>
                                                        <li>Fusce fermentum justo non libero</li>
                                                        <li>Placerat metus egestas sem dolor in lectus</li>
                                                        <li>Vivamus mollis, odio ut aliquam auctor</li>
                                                    </ul>-->


<!--                            <p>Our vision is to engineer the world by understanding requirements and tailoring customized innovative solutions.</p>-->

                            <!--                        <a href="#" class="more float_r"></a>-->
                           


<br/>
                            <h5><!--<a href="services.html" style="text-decoration: none">Our Services</a>-->Our Services</h5>
                            <p>AceEngineer develops web applications with standard features of security, authentication, content, user

                                management and analytics. Our web applications are hosted in the cloud and accessed by authorized users

                                on any computer or mobile device. Our web applications ensure controlled access to your business data

                                and functions on any device anywhere in the world.</p>
                            <p>Our capabilities include Dynamic Design, API Programming,Database Design,Database Interface,Hosting Services and many more. Our

                                programming is all device compatible. Visit our portfolio page to view work done till date.</p>
                            <p>AceEngineer team is highly experienced, qualified and motivated to find solutions for real world problems.

                                AceEngineer through research & development and with help of latest technologies shall provide cutting edge

                                engineering solutions for various industries.</p>

                        </div>
                        <!-- <div class="col_w460 float_r">
                                                        <h3>Our Vision</h3><p>To engineer the world by understanding requirements and tailoring customized innovative solutions.</p>

                         </div>-->

                        <!-- <div class="col_w460 float_r">-->
                        <h3><!--<a href="services.html" style="text-decoration: none">Our Services</a>--><!--Our Services</h3>
                        <p>Our services include Mobile Applications, HTML5, jQuery, Flash, Dynamic Web Design  and

                            many more. Our programming will ensure all device compatibility for all work. Please visit our portfolio

                            page to view our programming work done till date</p>
                        <p>AceEngineer team is highly experienced, qualified and motivated to find solutions for real

                            world problems. AceEngineer through research & development and latest technologies shall

                            provide cutting edge engineering solutions for various industries.</p>-->
                            <!-- <div class="col_w460">
                                 <div class="fp_service_box fp_c1">
                                     <table border="0"><tr><td>
                                                 <img src="images/financial.jpg" alt="Image 1" style="width: 80px;height: 80px" /></td>
                                             <td>
                                                 <a style="text-decoration: none" > Financial Engineering Applications</a> •  Data Analysis and Manipulation.<br/> •  Trend analysis.<br/>
                                                 •  Statistical Analysis.<br/>
                                                 •  Stochastic models.</td></tr></table>
                                 </div>
                             </div>
                             <div class="col_w460">
                                 <div class="fp_service_box fp_c2">
                                     <table><tr><td>
                                                 <img src="images/PMS_Image.jpg" alt="Image 1" style="width: 80px;height: 80px"/></td>
                                             <td>
                                                 <a style="text-decoration: none"> Project Management Applications</a>
                                                 •  Customized tools for lean manufacturing.<br/>
                                                 •  Optimization of resources.<br/>
                                                 •  Process improvement.<br/>
                                                 •  Increased efficiency.</td></tr></table>
                                 </div>
                             </div>
                             <div class="col_w460">
                                 <div class="fp_service_box fp_c3">
                                     <table><tr><td>
                                                 <img src="images/civilandStructural.jpg" alt="Image 3" style="width: 80px;height: 80px"/></td>
                                             <td>
                                                 <a style="text-decoration: none"> Civil and Structural Engineering <br/>Calculators</a>   •  Structural engineering.<br/>
                                                 •  Soil mechanics.<br/>
                                                 •  Hydrology and fluid mechanics.</td></tr></table></div>
                             </div>
                             <div class="col_w460">
                                 <div class="fp_service_box fp_c4">
                                     <table border="0">
                                         <tr>
                                             <td>
                                                 <img src="images/Mechanical.png" alt="Image 4" style="width: 80px;height: 80px"/>
                                             </td>
                                             <td>
                                                 <a style="text-decoration: none"> Mechanical Engineering Calculators</a>  •  Control system engineering.<br/>
                                                 •  Mass transfer, Heat transfer.<br/>
                                                 •  Fluid mechanics.<br/>
                                                 •  Strength of materials.<br/>
                                                 •  Fracture mechanics.</td>
                                         </tr></table></div>
                             </div>
                             <div class="col_w460">
                                 <div class="fp_service_box fp_c4">
                                     <table><tr><td>
                                                 <img src="images/Mobile_Apps1.png" alt="Image 4" id="siz"/></td>
                                             <td>
                                                 <a style="text-decoration: none"> Mobile Apps Development</a>  •  iPhone / iPad Application Development.<br/>
                                                 •  Android Application Development.<br/>
                                                 •  Blackberry Application Development.<br/>
                                                 •  Windows Phone Application.<br/>
                                                 •  Cross Platform Mobile Development.</td></tr></table> </div>
                             </div>
                        </div>-->
                            <div class="cleaner"></div>
                    </div>
                    <!--                <div class="col_fw_last">
                                        <h2>Coolest Projects</h2>
                                        <div class="col_allw300 fp_lp"> <a href="http://www.templatemo.com/page/1"><img src="images/templatemo_image_03.jpg" alt="image" /></a>
                                            Platform Design</div>
                                        <div class="col_allw300 fp_lp"> <a href="http://www.templatemo.com/page/2"><img src="images/templatemo_image_04.jpg" alt="image" /></a>
                                            Merry Christmas</div>
                                        <div class="col_allw300 fp_lp col_rm"> <a href="http://www.templatemo.com/page/3"><img src="images/templatemo_image_05.jpg" alt="image" /></a>
                                            Cool Blue Theme</div>
                                        <div class="cleaner h20"></div>
                                        <a href="#" class="more float_r"></a>
                                        <div class="cleaner"></div>
                                    </div>-->

                    <div id="templatemo_footer_wrapper">
                        <div id="templatemo_footer">
                            Copyright © 2011 <a href="home.php">AceEngineer </a> |
                            Designed by <a href="http://www.aceengineer.com" target="_blank">AceEnigineer</a>
                            <div class="cleaner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>



    </body>
</html>