function ModalDialog(options)
{
    this.content = null;
    this.overlayDiv = document.createElement('div');
    this.modalDiv = document.createElement('div');
    this.contentDiv = document.createElement('div');
    this.controlDiv = document.createElement('div');
    this.submitButton = document.createElement('button');
    this.cancelButton = document.createElement('button');
    this.selectedCell = null;
    this.location = {
        x: 0,
        y: 0,
        width: 200,
        height: 300
    };
    
    // The following Objects for Options
    this.CSS = null;
    
    this.formData = null;
    
    this.init(options);
}

ModalDialog.prototype.init = function(options)
{
    options = !options?{}:options;
    //Loading the User Specified Options
    this.CSS = !options.CSS?null:options.CSS;
    //alert(this.CSS);
    
    var MD = this;
    $(this.overlayDiv).css({
        'position':'fixed',
        'background':'black',
        'left':'0px',
        'top':'0px',
        'width':'100%',
        'height':'100%',
        'opacity':'0.9',
        'filter':'alpha(opacity=90)',
        '-moz-opacity':'0.9',
        'z-index': '1000',
        'display': 'none'
    });
    
    $(document.body).append(this.overlayDiv);
        
    if(this.CSS == null)
    {
        $(this.modalDiv).css({
            position:'absolute',
            background: '#1182be',
            'color': 'white',
            width: '210px',
            padding:'10px',
            'opacity':'1.0',
            '-webkit-border-radius':'10px',
            '-moz-border-radius':'10px',
            'border-radius':'10px',
            '-webkit-box-shadow':'0px 0px 30px #2298d6',
            '-moz-box-shadow':'0px 0px 30px #2298d6',
            'box-shadow':'0px 0px 30px #2298d6',
            'z-index': 1010
        });
    }    
    $(this.modalDiv).addClass(this.CSS);
    
    
    $(this.submitButton).append('Submit').click(function()
    {
        MD.onSubmit();
    });
    
    $(this.cancelButton).append('Cancel').click(function()
    {
        MD.onCancel();
    });
    
    $(this.controlDiv).append(this.submitButton);
    $(this.controlDiv).append(this.cancelButton);    
    
    // adding THe Container at Initial MOde
    $(this.modalDiv).append(this.contentDiv).append(this.controlDiv);
    $(this.overlayDiv).append(this.modalDiv);
}

ModalDialog.prototype.setContent = function(cnt)
{
    this.content = cnt;
    $(this.contentDiv).html(cnt);
}


ModalDialog.prototype.onCancel = function()
{
    //alert("YOu Clicked on Cancel");
    this.hide();
}

ModalDialog.prototype.onSubmit = function()
{
    alert('Submiting Form Data');
}

ModalDialog.prototype.show = function(selCell)
{
    this.selectedCell = selCell;
    var MD = this;
    //alert('Showing The Div');
    // Positiong to Center
    this.location.x = ($(document).width()-this.location.width)/2;
    this.location.y = ($(document).height()-this.location.height)/2;
                    
    //alert('Location : {'+this.location.x+','+this.location.y+','+this.location.width+','+this.location.height+"}");
    //txt = "<div class='modal_overlay' style='position:absolute;left:0px;top:0px;width:100%;height:100%;background:gray;opacity:0.8;filter:alpha(opacity=80);-moz-opacity:0.8;z-index: 1000'>"
        
    $(this.modalDiv).css({
        //'left': ($(window).width()-$(this.modalDiv).outerWidth())/2,
        //'top': ($(window).height()-$(this.modalDiv).outerHeight())/2
        'left':($(window).width()-$(MD.modalDiv).outerWidth())/2,
        'top':'150px'
    });
    //txt = "<div class='modal_window' style=\"position:absolute;margin-left:"+this.location.x+"px;margin-top:"+this.location.y+"px;width:"+this.location.width+"px;height:"+this.location.height+"px;border: 2px solid red;z-index:1002\">"
    //var txt = this.content;
        
    
    //$(document.body).append(this.overlayDiv);
    $(this.overlayDiv).css('display','block');
    $(this.modalDiv).fadeTo(1500, 1.0, null);
    $(':input',this.modalDiv).eq(0).focus();
}

/**
 * This Method Returns the Two Dimensional Array
 * Which Contains the Field Names
 * and Their Corresponding Values
 */
ModalDialog.prototype.getInputs = function()
{
    var names= [];
    var values = [];
    $('.MDInput',this.modalDiv).each(function(){
        names.push($(this).attr('name'));
        values.push($(this).val());
    });
    
    return [names,values];
}

/**
 * This Method is used to set the Default content in the input fields
 * we recommend you to Override this method for your personal Use
 * this method dosen;t have any basic implemantation
 */
ModalDialog.prototype.setDefaultData = function(pData)
{
    var inputs = $(this.contentDiv).find(':input');
    for(var i=0;i<inputs.length;i++)
    {
        //alert(pData[i]);
        $(inputs[i]).val(pData[i]);
    }
}

/**
 * This Method Is used to make a Data Cell
 * in purticular format
 */
ModalDialog.prototype.makeCell = function()
{
    var div = document.createElement('div');
    var vals = this.getInputs()[1];
    $(div).html(vals[0]);
    var hiddenDiv = document.createElement('div');
    $(hiddenDiv).css({
        'display':'none',
        'class':'hiddenDivMD'
    });
    
    $(hiddenDiv).append("<p>"+vals[1]+"<p>"+"<p>"+vals[2]+"</p>");
    $(div).append(hiddenDiv);
    return div;
}

ModalDialog.prototype.hide = function()
{
    var MD = this;
    //var div = $('div.modal_window').get(0);
    $(this.modalDiv).fadeTo(100, 0.0,function(){
        $(MD.overlayDiv).css('display','none');
    //$(MD.overlayDiv).remove();
    });
}

/**
 * This Method Should be Overwrite by The Programmer
 */
ModalDialog.prototype.validate = function()
{
    
    }
