function Calendar(field,sYear,eYear,options)
{
    var txtFields = field;
    var currTxtField;
    var dateFormat = "yyyy-MM-dd";

    var calTable;
    var calDiv;
    var monthNames = ["January","Febraury","March","April","May","June","July","August","September","October","November","December"];
    var shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var noOfDays = [31,28,31,30,31,30,31,31,30,31,30,31];
    var selDay,selMonth,selYear;

    var startYear = new Date().getFullYear()-500;
    var endYear = new Date().getFullYear()+500;
                
    var effect = "swing";
    var timeIn = 400;
    var timeOut = 200;
    var defaultText = 'Choose Date....';
    var fadeColor = "gray";
    var activeColor = "white";
    
    var navigControls = null;
    
    var shouldHide = false;


    // Constructor Block
    d = new Date();
    selDay = d.getDate();                
    selMonth = d.getMonth();
    selYear = d.getFullYear();
    //alert(selDay+"/"+selMonth+"/"+selYear);
    
    options = !options?{}:options;

    loadOptions();
    loadObjects();
    loadFields();
    loadCalendar(selDay, selMonth, selYear);    
    
    function loadOptions(){
        dateFormat = !options.dateFormat?dateFormat:options.dateFormat;
    }

    /**
     * This MEthod Performs The Initilizations
     */
    function loadObjects()
    {
        selDay = 1;
        calDiv = makeCalendarDiv();
        //$('body').append(calDiv);
        navigControls = $(calDiv).find('#calNavigControls .control');
        
        $(navigControls).each(function(ind){
            $(this).click(function()
            {
                var selInd = monthCombo.selectedIndex;
                var yearChng = 0;
                switch(ind){
                    case 0:
                        if(--selInd<0)
                        {
                            selInd = 11;
                            yearChng = -1;
                        }                        
                        break;
                    case 1:
                        if(++selInd>11)
                        {
                            selInd = 0;
                            yearChng = 1;
                        }
                        
                        break;
                }
                if(yearChng != 0)
                {
                    yearCombo.selectedIndex += yearChng;
                    $(yearCombo).trigger('change',null);
                }
                
                monthCombo.selectedIndex = selInd;
                $(monthCombo).trigger('change', null);
            });
        });
        
        calTable = $(calDiv).find("table")[0];

        $(calDiv).attr('opacity', 0.6);        
                    
        //alert(txtFields.length);
        for(var i=0;i<txtFields.length;i++)
        {
            //alert(txtFields[i]);
            //$(txtFields[i]).attr('value', 'Choose Date...');
                        
            $(txtFields[i]).click(function()
            {
                currTxtField = this;
                showCalendar(this);
            //alert(this);
            });

            $(txtFields[i]).keypress(function(evt)
            {
                evt.preventDefault();
                evt.stopPropagation();
                $(this).attr('value','');
                currTxtField = this;
                showCalendar(this);
            });
        }
        
        btn = $(calDiv).find('#closeBtn')[0];
        $(btn).click(function(){
            $(calDiv).hide(timeOut);
        });
    }

    /**
     * This Method used To Dynamically add a New TextField to This
     * Even Handler
     */
    function registerNewField(field)
    {                    
    }

    function showCalendar(field)
    {
        var pos = $(field).offset();        
        $(calDiv).css({
            'left':pos.left,
            'top':pos.top+$(field).outerHeight()
        });
        
        $('body').append(calDiv);
        $(calDiv).show(timeIn,effect,null);
    }


    /**
     * This Method Used to load the Required Objects That
     * Required for the Calendar Object
     */
    function loadFields()
    {
        tBody = $(calTable).children('tbody')[0];
        monthCombo = $('#calMonth',calDiv)[0];
        yearCombo = $('#calYear',calDiv)[0];

        $(monthCombo).html("");
        $(yearCombo).html("");

        for(var i=startYear;i<=endYear;i++)
        {
            $(yearCombo).append("<option>"+i+"</option>");
        }
                
        for(i=0;i<monthNames.length;i++)
        {
            $(monthCombo).append("<option>"+monthNames[i]+"</option>");
        }

        //Changing The Selections to Curretn Date
        //$(yearCombo).attr('value', selYear);
        $(yearCombo).val(selYear);
        $(monthCombo).val(monthNames[selMonth]);

        yearCombo.onchange = function()
        {
            //alert($(this).val());
            selYear = $(this).val();
            loadCalendar(selDay, selMonth, selYear);
        };

        //This Method Handles the Month Combo box Change Handler
        monthCombo.onchange = function()
        {
            selMonth = this.selectedIndex;
            loadCalendar(selDay, selMonth, selYear);
        };
    }


    /**
     * This Method Performs the Loadiong of the Calendar for The Purticular Month and year
     * specified by the User
     */
    function loadCalendar(day,month,year)
    {
                    
        year = parseInt(year);
        month = parseInt(month);
                
        //month += 1;
        //alert(month);

        //alert("Day : "+day+" Month : "+month+" Year : "+year);
        tbody = $(calTable).children('tbody')[0];


        //date = new Date(month+"/"+"1/"+year);
        date = new Date();
        date.setMonth(month, 1);
        date.setYear(year);
                    

        startDay = date.getDay();

        days = noOfDays[month];
        //alert(date);

        // if the Month is February Then Chek it for Leap year
        if(month == 1)
        {
            days = days +( year%400==0?1:( year%400!=0 && year%4 == 0)?1:0 );
        }
        //alert('No of Days : '+days);
                    

                    

        cnt = 1;
        //alert("Starting Day : "+startDay);

        $(tbody).html("");
        for(var i=0;i<6;i++)
        {
            row = document.createElement('tr');
            for(var j=0;j<7;j++)
            {
                cell = document.createElement('td');
                if(cnt > startDay)
                {
                    day = cnt - startDay;
                    cell.innerHTML = day<10?""+day:day;
                }
                else
                {
                    //day = 6 * i + j;
                    cell.innerHTML = ' ';
                }
                $(row).append(cell);
                        
                cnt++;
                        
                if(day+1 > days)
                {
                    i = 8;
                    break;
                }
            }
            addCellListeners(row);
            $(tBody).append(row);
        }
                    
    }

    /**
     * This Method adds the cell Listeners to the Given Row
     */
    function addCellListeners(row)
    {
        cells = $(row).children('*');
        for(var i=0;i<cells.length;i++)
        {
            addCellListener(cells[i]);
        }
    }

    /**
     * This Method adds The Listeners to The specified Cell
     */
    function addCellListener(cell)
    {
        $(cell).hover(function()
        {
            //alert("Row Index : "+this.parentNode.rowIndex+": Col : "+this.cellIndex);
            this.style.border = "1px solid black";
        }, function(){
            this.style.border = "1px solid white";
        });

        $(cell).click(function()
        {
            //alert('Clicked');
            // if the User Selects A Non empty Day
            // Then do Nothing
            text = $(this).html();                        
            //alert('Hi'+text+'Naga');
            if(text != " ")
            {
                dateVal = text+"-"+shortMonthNames[selMonth]+"-"+selYear;
                //dateVal = dateFormat(dateVal,dateFormat);
                dateVal = Date.parse(dateVal);
                $(currTxtField).attr('value', dateVal.toString(dateFormat));
                // Rising The Change Event on this Text Field
                $(currTxtField).trigger('change');
                $(calDiv).hide(timeOut,effect, null);
            }
        });
    }
    
    /**
     * This Method is Used to Make The Calendar Div
     */
    function makeCalendarDiv()
    {
        var div = document.createElement('div');
        $(div).addClass('calendar');
        
        var cnt = '<p style="text-align: right;padding:0px;margin:0px;position:relative">'
        +'<select id="calMonth"></select>'
        +'<select id="calYear"></select>'
        +'<img src="res/images/closeButton.png" id="closeBtn" width="16" height="16" alt="X" style="vertical-align: middle" />'
        +'</p>'
        +'<table>'
        +'<thead>'
        +'<tr>'
        +'<th>Sun</th><th>Mon</th><th>Tue</th><th>Web</th><th>Thu</th><th>Fri</th><th>Sat</th>'
        +'</tr>'
        +'</thead>'
        +'<tbody>'
        +'</tbody>'

        +'<tfoot id="calNavigControls">'
        +'<tr>'
        +'<td colspan="3" class="control"><<</td>'
        +'<td></td>'
        +'<td colspan="3" class="control">>></td>'
        +'</tr>'
        +'</tfoot>'
        +'</table>';
    
        $(div).html(cnt);
        return div;
    }
}