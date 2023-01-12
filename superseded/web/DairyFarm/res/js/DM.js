/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function JQGrid(divId,pagerId,colModel,caption)
{
    var ME = this;
    this.divId = divId
    this.pagerId = pagerId;
    this.colModel = colModel;
    //alert(this.div);
    this.grid = null;
    this.lastSel = -1;
    //alert("Pager Object "+this.pagerDiv);

    this.baseOptions = {
        datatype: 'local',
        colModel: ME.colModel,
        
        //pager: null,
        sortable:true,
        //rownumbers: true,
        rowList: [5,10, 20,50,100,500,1000],
        viewrecords: true,
        //autowidth: true,
        shrinkToFit:true,
        //multiselect:false,
        height:'100%',
        caption:caption,
        //sortorder: 'desc',
        editurl: 'clientArray',
        onSelectRow: function(id) {
            if (id && id !== ME.lastSel) {
                ME.grid.jqGrid('restoreRow',ME.lastSel);
                ME.lastSel = id;
            }
        },
        //        ondblClickRow: function(id, ri, ci) {
        //            ME.grid.jqGrid('editGridRow',id,{
        //                });
        //        },
        afterInsertRow: function(rowid,rowdata,rowele){
        //alert(rowid);
        }
    }
    this.baseOptions.pager = '#'+this.pagerId;
    this.init();
}

JQGrid.prototype.init = function(){
    var ME = this;
    this.grid = $('#'+this.divId).jqGrid(this.baseOptions);
    this.grid.jqGrid('navGrid','#'+this.pagerId,{
        edit:false,
        add:false,
        del:false,
        search:true
    });
    return this.grid;
}
