<%-- 
    Document   : public_CurrencyConversion
    Created on : Dec 27, 2012, 3:23:37 PM
    Author     : PEPL
--%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://struts.apache.org/tags-bean" prefix="bean" %>
<%@taglib uri="http://struts.apache.org/tags-logic" prefix="logic" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <title>AceEngineer: Finance/public/Forex</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--        Start of SEO Stuff Goes Here-->
        <meta name="description" content="Forex watch is a tool to help identify Forex trends and signals of one currency to another currency in middle term to long term time horizons.">
        <meta name="keywords" content="Forex Trends, Forex, Currency, Foreign currency, when to transfer money to another country, when to exchange money, money exchange for travel trip, money exchange guidance">
        <!--        End of the SEO Stuff-->
<!--        <script type="text/javascript" src="http://www.google.com/jsapi"></script>
        <script type="text/javascript" src="res/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="res/js/chosen.jquery.js"></script>
        <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">
        <link rel="stylesheet" type="text/css" href="res/css/chosen.css">-->
        <script type="text/javascript">
            google.load('visualization', '1', {'packages':['annotatedtimeline']});
            $(function()
            {
                try
                {
//                    $(".tochoosePublicForex").chosen();
//                    $(".fromchoosePublicForex").chosen();
                    var dates = [];
                    var rates = [];
                    var tempDates = [];
                    var tempRates = [];
                    $("#Click").click(function()
                    {
                        var toCur = $("#ToCur").val();
                        var fromCur = $("#FromCur").val();
                        var symbol;
                        var mode = true;
                        if(toCur==fromCur)
                        {
                            alert("Both are Same country names! Please chnage any one ");
                            return false;
                        }
                        if(toCur == "USD")
                        {
                            symbol = toCur+fromCur;
                        }
                        if(fromCur == "USD")
                        {
                            symbol = fromCur+toCur;
                            mode = false;
                        }
                        if(toCur != "USD" && fromCur!= "USD")
                        {
                        
                            window.location.href = "Forex.do?CP="+toCur+fromCur;
                        
                            //                        $.get('stockUtilHandler.do',{
                            //                            mode:4,
                            //                            currencyPair:"USD"+toCur
                            //                        },function(data)
                            //                        {
                            //                            var indirectDates = [];
                            //                            var intermediateRates = [];
                            //                            var indirectRates = [];
                            //                            try
                            //                            {
                            //                                data = eval("("+data+")");
                            //                                for(var i=0;i<data[0].results.length;i++)
                            //                                {
                            //                                    indirectDates[i] = new Date(data[0].results[i].dates); 
                            //                                    intermediateRates[i] = 1/(data[0].results[i].rates);
                            //                                }
                            //                                $.get('stockUtilHandler.do',{
                            //                                    mode:4,
                            //                                    currencyPair:"USD"+fromCur
                            //                                },function(data)
                            //                                {
                            //                                    data = eval("("+data+")");
                            //                                    for(var i=0;i<data[0].results.length;i++)
                            //                                    {
                            //                                        indirectRates[i] = (data[0].results[i].rates)*(intermediateRates[i]);
                            //                                    }
                            //                                    tempDates = reverseArray(indirectDates);
                            //                                    tempRates = reverseArray(indirectRates);
                            //                                    forexWatchChart.initializeForEx(tempDates, tempRates,toCur+fromCur);
                            //                                    //                                $.get('forexrates.do',{
                            //                                    //                                    symbol:toCur+fromCur
                            //                                    //                                },function(data)
                            //                                    //                                {
                            //                                    //                                    try
                            //                                    //                                    {
                            //                                    //                                        var res = [];
                            //                                    //                                        res = data.split(",");
                            //                                    //                                        indirectDates[indirectDates.length] = new Date(res[0]);
                            //                                    //                                        indirectRates[indirectRates.length] = parseFloat(res[1]);
                            //                                    //                                        tempDates = reverseArray(indirectDates);
                            //                                    //                                        tempRates = reverseArray(indirectRates);
                            //                                    //                                        forexWatchChart.initializeForEx(tempDates, tempRates,toCur+fromCur);
                            //                                    //                                    }catch(e)
                            //                                    //                                    {
                            //                                    //                                        alert("Exception is Raised "+e);
                            //                                    //                                    }
                            //                                    //                                });
                            //                                
                            //                                });
                            //                            }catch(e)
                            //                            {
                            //                                alert("Exception is Raised "+e);
                            //                            }
                            //                        });
                        }
                        else
                        {
                            window.location.href = "Forex.do?CP="+toCur+fromCur;
                            //                        $.post('stockUtilHandler.do',{
                            //                            mode:4,
                            //                            currencyPair:symbol
                            //                        },function(data)
                            //                        {
                            //                            try
                            //                            {
                            //                                data = eval("("+data+")");
                            //                                for(var i=0;i<data[0].results.length;i++)
                            //                                {
                            //                                    dates[i] = new Date(data[0].results[i].dates);
                            //                                    if(mode==false)
                            //                                    {
                            //                                        rates[i] = 1/(data[0].results[i].rates); 
                            //                                
                            //                                    }
                            //                                    else
                            //                                    {
                            //                                        rates[i] = data[0].results[i].rates;
                            //                                    }
                            //                                }
                            //                                tempDates = reverseArray(dates);
                            //                                tempRates = reverseArray(rates);
                            //                                forexWatchChart.initializeForEx(tempDates, tempRates,toCur+fromCur);
                            //                            $.get('forexrates.do',{
                            //                                symbol:symbol
                            //                            },function(data)
                            //                            {
                            //                                try
                            //                                {
                            //                                    var res = [];
                            //                                    res = data.split(",");
                            //                                    dates[dates.length] = new Date(res[0]);
                            //                                    rates[rates.length] = parseFloat(res[1]);
                            //                                    alert(rates);
                            //                                    tempDates = reverseArray(dates);
                            //                                    tempRates = reverseArray(rates);
                            //                                    forexWatchChart.initializeForEx(tempDates, tempRates,toCur+fromCur);
                            //                                }catch(e)
                            //                                {
                            //                                    alert("Exception is Raised "+e);
                            //                                }
                            //                            });
                            //                            }catch(e)
                            //                            {
                            //                                alert("Exception is Raised "+e);
                            //                            }
                            //                        });
                        }
                        //                    addCurrencyCompare(toCur+fromCur);
                    });
            
                    $("#reverseForex").click(function()
                    {
                        if($("#reverseForex").is(':checked'))
                        {
                            var toCur = $("#ToCur").val();
                            var fromCur = $("#FromCur").val();
                            try
                            { 
                                var rates = [];
                                for(var i=0;i<tempRates.length;i++)
                                {
                                    rates[i] = 1/(tempRates[i]);
                                }
                                forexWatchChart.initializeForEx(tempDates, rates,fromCur+toCur);
                                $("#reverseForex").attr("checked", false);
                            }catch(e)
                            {
                                alert("Exception is Raised "+e);
                            }
                        }
                    });
     
     
                    $("#AddForexPortfolio").click(function()
                    {
                        if($("#AddForexPortfolio").is(':checked'))
                        {
                            $.get('stockUtilHandler.do',{
                                mode:5,
                                currencyPair:$("#ToCur").val()+$("#FromCur").val()
                            },function(data){
                                try{
                                    alert("result Is "+data);
                                }catch(e)
                                {
                                    alert("Exception is Raised in Forex Database "+e)
                                }
                      
                            });
                        }
                    });
     
     
                    //            function gettingTodayValues(symbol)
                    //            {
                    //                $.get('forexrates.do',{
                    //                    symbol:symbol
                    //                },function(data)
                    //                {
                    //                    alert(data);
                    //                    var res = data.split(",");
                    //                    alert(res[0]);
                    //                    alert(res[1]);
                    //                });
                    //            }
                }catch(e)
                {
                    alert(e);
                }
            });
            
            
            function gettingDataforexWatchList(currencyPair)
            {
                $.ajaxSetup({async:false});
                try{
                    var  toCur = currencyPair.slice(0,3);
                    var  fromCur =   currencyPair.slice(3,6);
                    var tempDates = [];
                    var tempRates = [];
                    var dates = [];
                    var rates = [];
                    var symbol;
                    var mode = true;
                    if(toCur==fromCur)
                    {
                        alert("Both are Same country names! Please chnage any one ");
                        return false;
                    }
                    if(toCur == "USD")
                    {
                        symbol = toCur+fromCur;
                    }
                    if(fromCur == "USD")
                    {
                        symbol = fromCur+toCur;
                        mode = false;
                    }
                    if(toCur != "USD" && fromCur!= "USD")
                    {
                        $.get('stockUtilHandler.do',{
                            mode:4,
                            currencyPair:"USD"+toCur
                        },function(data)
                        {
                            var indirectDates = [];
                            var intermediateRates = [];
                            var indirectRates = [];
                            try
                            {
                                data = eval("("+data+")");
                                for(var i=0;i<data[0].results.length;i++)
                                {
//                                    indirectDates[i] = new Date(data[0].results[i].dates); 
                                    indirectDates[i] = Date.parse(data[0].results[i].dates); 
                                    intermediateRates[i] = 1/(data[0].results[i].rates);
                                }
                                $.get('stockUtilHandler.do',{
                                    mode:4,
                                    currencyPair:"USD"+fromCur
                                },function(data)
                                {
                                    data = eval("("+data+")");
                                    for(var i=0;i<data[0].results.length;i++)
                                    {
                                        indirectRates[i] = (data[0].results[i].rates)*(intermediateRates[i]);
                                    }
                                    tempDates = reverseArray(indirectDates);
                                    tempRates = reverseArray(indirectRates);
                                });
                            }catch(e)
                            {
                                alert("Exception is Raised "+e);
                            }
                        });
                    }
                    else
                    {
                        $.post('stockUtilHandler.do',{
                            mode:4,
                            currencyPair:symbol
                        },function(data)
                        {
                            try
                            {
                                data = eval("("+data+")");
                                for(var i=0;i<data[0].results.length;i++)
                                {
//                                    dates[i] = new Date(data[0].results[i].dates);
                                    dates[i] = Date.parse(data[0].results[i].dates);
                                    if(mode==false)
                                    {
                                        rates[i] = 1/(data[0].results[i].rates); 
                                
                                    }
                                    else
                                    {
                                        rates[i] = data[0].results[i].rates;
                                    }
                                }
                                tempDates = reverseArray(dates);
                                tempRates = reverseArray(rates);
                            }catch(e)
                            {
                                alert("Exception is Raised "+e);
                            }
                        });
                    }
                    forexWatchChart.initializeForEx(tempDates, tempRates,currencyPair);
                }catch(e)
                {
                    alert("Here Main Cause "+e);
                }
            }
            
            
            //               document.forms[0].action="dataFittingAction.do?storecell="+store+"&data="+datalength+"&verify="+verify+"&copyFlag="+copyFlag+"&distributionType="+distributionType+"&notANumber="+notANumber;
            //        document.forms[0].submit();
            
            
        </script>
                <script type="text/javascript">
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-38045252-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
    </head>
    <body>
        <form>
            <table width="100%" align="left">
                <tr>
                    <td>
                        From:
                    </td>
                    <td width="30%">
                        <div class="side-by-side clearfix">
                            <select data-placeholder="Choose a Currency..." id="ToCur" class="fromchoosePublicForex" tabindex="10">
                                <option value=""></option> 
                                <option value="USD">US Dollar</option> 
                                <option value="EUR">Euro</option> 
                                <option value="GBP">British Pound</option> 
                                <option value="INR">Indian Rupee</option> 
                                <option value="AUD">Australian Dollar</option> 
                                <option value="CAD">Canadian Dollar</option> 
                                <option value="AED">Emirati Dirham</option> 
                                <option value="CHF">Swiss Franc</option> 
                                <option value="MYR">Malaysian Ringgit</option> 
                                <option value="CNY">Chinese Yuan Renminbi</option> 
                                <option value="THB">Thai Baht</option> 
                                <option value="NZD">New Zealand Dollar</option> 
                                <option value="JPY">Japanese Yen</option> 
                                <option value="PHP">Philippine Peso</option> 
                                <option value="SGD">Singapore Dollar</option> 
                                <option value="SAR">Saudi Arabian Riyal</option> 
                                <option value="MXN">Mexican Peso</option> 
                                <option value="SEK">Swedish Krona</option> 
                                <option value="ZAR">South African Rand</option> 
                                <option value="HKD">Hong Kong Dollar</option> 
                                <option value="HUF">Hungarian Forint</option> 
                                <option value="TRY">Turkish Lira</option> 
                                <option value="BRL">Brazilian Real</option> 
                                <option value="IDR">Indonesian Rupiah</option> 
                                <option value="NOK">Norwegian Krone</option> 
                                <option value="DKK">Danish Krone</option> 
                                <option value="PKR">Pakistani Rupee</option> 
                                <option value="QAR">Qatari Riyal</option> 
                                <option value="OMR">Omani Riyal</option> 
                                <option value="KWD">Kuwaiti Dinar</option> 
                                <option value="EGP">Egyptian Pound</option> 
                                <option value="COP">Colombian Peso</option> 
                                <option value="KRW">South Korean Won</option> 
                                <option value="ARS">Argentine Peso</option> 
                                <option value="CLP">Chilean Peso</option> 
                                <option value="PLN">Polish Zloty</option> 
                                <option value="RUB">Russian Ruble</option> 
                                <option value="CZK">Czech Koruna</option> 
                                <option value="ILS">Israeli Shekel</option> 
                                <option value="LKR">Sri Lankan Rupee</option> 
                                <option value="MAD">Moroccan Dirham</option> 
                                <option value="TWD">Taiwan New Dollar</option> 
                                <option value="NGN">Nigerian Naira</option> 
                                <option value="BHD">Bahraini Dinar</option> 
                                <option value="VND">Vietnamese Dong</option> 
                                <option value="BDT">Bangladeshi Taka</option> 
                                <option value="KES">Kenyan Shilling</option> 
                                <option value="IQD">Irqi Dinar</option> 
                                <option value="XOF">CFA Franc</option> 
                                <option value="JOD">Jordanian Dinar</option> 
                                <option value="GHS">Ghanaian Cedi</option> 
                                <option value="TND">Tunisian Dinar</option> 
                                <option value="RON">Romanian New Leu</option> 
                                <option value="PEN">Peruvian Nuevo Sol</option> 
                                <option value="BGN">Bulgarian Lev</option> 
                                <option value="XAF">Central Aferican CFA Franc BEAC</option> 
                                <option value="FJD">Fijian Dollar</option> 
                                <option value="HRK">Croatian Kuna</option> 
                                <option value="ISK">Icelandic Krona</option> 
                                <option value="DOP">Dominican Peso</option> 
                                <option value="MUR">Mauritian Rupee</option> 
                                <option value="NPR">Nepalese Rupee</option> 
                                <option value="DZD">Algerian Dinar</option> 
                                <option value="UAH">Ukrainian Hryvna</option> 
                                <option value="XPF">CFP Franc</option> 
                                <option value="CRC">Costa Rican Colon</option> 
                                <option value="JMD">Jamaican Dollar</option> 
                                <option value="AZN">Azerbaijani New Manat</option> 
                                <option value="BAM">Bosnian Convertible Marka</option> 
                                <option value="IRR">Iranian Rail</option> 
                            </select>
                        </div>
                    </td>
                    <td>
                        To:
                    </td>
                    <td width="30%">
                        <div class="side-by-side clearfix">
                            <select data-placeholder="Choose a Currency..." id="FromCur" class="tochoosePublicForex" tabindex="10">
                                <option value=""></option> 
                                <option value="USD">US Dollar</option> 
                                <option value="EUR">Euro</option> 
                                <option value="GBP">British Pound</option> 
                                <option value="INR">Indian Rupee</option> 
                                <option value="AUD">Australian Dollar</option> 
                                <option value="CAD">Canadian Dollar</option> 
                                <option value="AED">Emirati Dirham</option> 
                                <option value="CHF">Swiss Franc</option> 
                                <option value="MYR">Malaysian Ringgit</option> 
                                <option value="CNY">Chinese Yuan Renminbi</option> 
                                <option value="THB">Thai Baht</option> 
                                <option value="NZD">New Zealand Dollar</option> 
                                <option value="JPY">Japanese Yen</option> 
                                <option value="PHP">Philippine Peso</option> 
                                <option value="SGD">Singapore Dollar</option> 
                                <option value="SAR">Saudi Arabian Riyal</option> 
                                <option value="MXN">Mexican Peso</option> 
                                <option value="SEK">Swedish Krona</option> 
                                <option value="ZAR">South African Rand</option> 
                                <option value="HKD">Hong Kong Dollar</option> 
                                <option value="HUF">Hungarian Forint</option> 
                                <option value="TRY">Turkish Lira</option> 
                                <option value="BRL">Brazilian Real</option> 
                                <option value="IDR">Indonesian Rupiah</option> 
                                <option value="NOK">Norwegian Krone</option> 
                                <option value="DKK">Danish Krone</option> 
                                <option value="PKR">Pakistani Rupee</option> 
                                <option value="QAR">Qatari Riyal</option> 
                                <option value="OMR">Omani Riyal</option> 
                                <option value="KWD">Kuwaiti Dinar</option> 
                                <option value="EGP">Egyptian Pound</option> 
                                <option value="COP">Colombian Peso</option> 
                                <option value="KRW">South Korean Won</option> 
                                <option value="ARS">Argentine Peso</option> 
                                <option value="CLP">Chilean Peso</option> 
                                <option value="PLN">Polish Zloty</option> 
                                <option value="RUB">Russian Ruble</option> 
                                <option value="CZK">Czech Koruna</option> 
                                <option value="ILS">Israeli Shekel</option> 
                                <option value="LKR">Sri Lankan Rupee</option> 
                                <option value="MAD">Moroccan Dirham</option> 
                                <option value="TWD">Taiwan New Dollar</option> 
                                <option value="NGN">Nigerian Naira</option> 
                                <option value="BHD">Bahraini Dinar</option> 
                                <option value="VND">Vietnamese Dong</option> 
                                <option value="BDT">Bangladeshi Taka</option> 
                                <option value="KES">Kenyan Shilling</option> 
                                <option value="IQD">Irqi Dinar</option> 
                                <option value="XOF">CFA Franc</option> 
                                <option value="JOD">Jordanian Dinar</option> 
                                <option value="GHS">Ghanaian Cedi</option> 
                                <option value="TND">Tunisian Dinar</option> 
                                <option value="RON">Romanian New Leu</option> 
                                <option value="PEN">Peruvian Nuevo Sol</option> 
                                <option value="BGN">Bulgarian Lev</option> 
                                <option value="XAF">Central Aferican CFA Franc BEAC</option> 
                                <option value="FJD">Fijian Dollar</option> 
                                <option value="HRK">Croatian Kuna</option> 
                                <option value="ISK">Icelandic Krona</option> 
                                <option value="DOP">Dominican Peso</option> 
                                <option value="MUR">Mauritian Rupee</option> 
                                <option value="NPR">Nepalese Rupee</option> 
                                <option value="DZD">Algerian Dinar</option> 
                                <option value="UAH">Ukrainian Hryvna</option> 
                                <option value="XPF">CFP Franc</option> 
                                <option value="CRC">Costa Rican Colon</option> 
                                <option value="JMD">Jamaican Dollar</option> 
                                <option value="AZN">Azerbaijani New Manat</option> 
                                <option value="BAM">Bosnian Convertible Marka</option> 
                                <option value="IRR">Iranian Rail</option> 
                            </select>
                        </div>
                    </td>
                    <td width="10%">
                        <input type="checkbox" id="reverseForex"/>Reverse
                    </td>
                    <td align="center" width="20%">
                        <button type="button" value="Click" id="Click" style="height: 40px;">Forex Conversion</button>
                    </td>
                </tr>
                <tr>
                    <td colspan="6">
                        <div id="currencyCompareDiv" style="background:#e3eff3;padding-left:2px;" class="tickerBlock">
                        </div>
                    </td>
                </tr>
            </table> 
        </form>
        <div id="chartDivCC">
        </div>
        <div id="Action_Data" style="display:none">
            <logic:present name="tickersBean">
                <bean:write name="tickersBean"/>
            </logic:present>
        </div>
    </body>
</html>
