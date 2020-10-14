///* 
// * To change this template, choose Tools | Templates
// * and open the template in the editor.
// */
//
//
//function DynamicTable(node) {
//    this.table = node; 
//    this.dgColumns;
//    this.dgData; 
//}
//DynamicTable.prototype.loadData = function(colNames, dgValues) {
//    this.dgColumns = colNames;
//    this.dgData = dgValues;
//    this.eventHandlers();
//    this.showGrid(this); 
//    
//}
//
//DynamicTable.prototype.getData =  function(reverse){
//    reverse = !reverse?false:reverse;    
//    if(reverse)
//        return this.dgData.reverse();
//    return this.dgData;
//}
//
//
//
//DynamicTable.prototype.showGrid = function(self) {
//    
//    self.sortOnColumn(columnName);
//    var grid = new Grid(self);
//    var rows = grid.createRows(); 
//    var tbody = self.table.getElementsByTagName("tbody")[0]; 
//    var parentTbodyNode = tbody.parentNode;
//    var newTbody = document.createElement("tbody"); 
//    parentTbodyNode.removeChild(tbody);
//    parentTbodyNode.appendChild(newTbody); 
//    while(rows.length > 0) {
//        newTbody.appendChild(rows[0]); 
//    } 
//} 
//function Handler() {
//    this.columnName;
//    this.self; 
//} 
//Handler.prototype.set = function(columnName, self) {
//    this.columnName = columnName;
//    this.self = self; 
//} 
//Handler.prototype.doSort = function() {
//    this.self.sortOnColumn(this.columnName); 
//} 
//function handlerSort(columnName,self) {
//    return function () 
//    { 
//        self.sortOnColumn(columnName);
//        var grid = new Grid(self); 
//        var rows = grid.createRows();
//        var tbody = self.table.getElementsByTagName("tbody")[0]; 
//        var parentTbodyNode = tbody.parentNode; 
//        var newTbody = document.createElement("tbody"); 
//        parentTbodyNode.removeChild(tbody);
//        parentTbodyNode.appendChild(newTbody); 
//        while(rows.length > 0) {
//            newTbody.appendChild(rows[0]); 
//        } 
//    }; 
//} 
//DynamicTable.prototype.eventHandlers = function() {
//    var elements = this.table.getElementsByTagName("th"); 
//    for (var x = 0; x < elements.length; x++) {
//        var columnName = elements[x].getAttribute("name");
//        addListener(elements[x], "click", handlerSort(columnName, this), false); 
//    }	 
//} 
//DynamicTable.prototype.sortOnColumn = function(columnName) {
//    switch( columnName ) {
//        case "numberColumn":
//            this.dgData = this.dgData.reverse(sortNumbers);
//            break;
//        //        case "booleanColumn":
//        //            this.dgData = this.dgData.sort(sortBoolean);
//        //            break;
//        //        case "dateColumn":
//        //            this.dgData = this.dgData.sort(sortDates);
//        //            break;
//        //        case "stringColumn":
//        //            this.dgData = this.dgData.sort(sortStrings);
//        //            break;
//        default:
//            alert("noSortAvailable" + "--" + columnName);
//            break; 
//    } 
//} 
//function addListener(element, type, expression, bubbling) {
//    bubbling = bubbling || false;
//    if(window.addEventListener) { 
//        element.addEventListener(type, expression, bubbling);
//        return true; 
//    } else if(window.attachEvent) {
//        element.attachEvent('on' + type, expression);
//        return true; 
//    } else return false; 
//} 
//function sortDates(sortItemA, sortItemB) {
//    var itemA = sortItemA[0];
//    var itemB = sortItemB[0]; 
//    if (itemA < itemB) {
//        return -1; 
//    } else if (itemA > itemB) {
//        return 1; 
//    } else if (itemA == itemB) {
//        return 0; 
//    } 
//} 
//function sortBoolean(sortItemA, sortItemB) {
//    var itemA = sortItemA[3];
//    var itemB = sortItemB[3]; 
//    if (itemA < itemB) { 
//        return -1; 
//    } else if (itemA > itemB) {
//        return 1; 
//    } else if (itemA == itemB) {
//        return 0; 
//    }
//} 
//function sortNumbers(sortItemA, sortItemB) {
//    var itemA = sortItemA[1];
//    var itemB = sortItemB[1];
//    alert("Item A [1] : "+itemA);
//    alert("Item B [1] : "+itemB);
//    if (itemA < itemB) {
//        return -1; 
//    } else if (itemA > itemB) {
//        return 1; 
//    } else if (itemA == itemB) { 
//        return 0; 
//    } 
//}
//function sortStrings(sortItemA, sortItemB) {
//    var itemA = sortItemA[2];
//    var itemB = sortItemB[2]; 
//    if (itemA < itemB) {
//        return -1;
//    } else if (itemA > itemB) {
//        return 1;
//    } else if (itemA == itemB) {
//        return 0;
//    } 
//} 
//function sortNone(sortItemA, sortItemB) {
//    return 0;
//}
//function Grid(self) {
//    this.self = self;
//    this.columnsToPopulate;
//    this.columnToFillOrder();
//} 
//Grid.prototype.columnToFillOrder = function() {
//    this.columnsToPopulate = new Array();
//    var elements = this.self.table.getElementsByTagName("th"); 
//    for (var x = 0; x < elements.length; x++) {
//        this.columnsToPopulate[x] = elements[x].getAttribute("name"); 
//    }
//} 
//Grid.prototype.createRows = function() {
//    var parentNode = document.createElement("div");
//    for (var dataRowNum = 0; dataRowNum < this.self.dgData.length; dataRowNum++) { 
//        var rowNode = document.createElement("tr");
//        for (var dataColumnNum = 0; dataColumnNum < this.columnsToPopulate.length; dataColumnNum++) {
//            var node = document.createElement("td");
//            var text;
//            //alert(this.columnsToPopulate);
//            //alert(this.self.dgColumns);
//            //switch( this.columnsToPopulate[dataColumnNum] ) {
//            //  case this.self.dgColumns[dataColumnNum]:
//            text = document.createTextNode(this.self.dgData[dataRowNum][dataColumnNum]);
//            //    break;
//            //                case this.self.dgColumns[1]:
//            //                    text = document.createTextNode(this.self.dgData[dataRowNum][1]);
//            //                    break;
//            //                case this.self.dgColumns[2]:
//            //                    text = document.createTextNode(this.self.dgData[dataRowNum][2]);
//            //                    break;
//            //                case this.self.dgColumns[3]:
//            //                    text = document.createTextNode(this.self.dgData[dataRowNum][3]);
//            //                    break;
//            //                case this.self.dgColumns[4]:
//            //                    text = document.createTextNode(this.self.dgData[dataRowNum][4]);
//            //                    break;
//            // default:
//            //    break;
//            //}
//            node.appendChild(text);
//            rowNode.appendChild(node);
//        }
//        parentNode.appendChild(rowNode);
//    }
//    var rows = parentNode.getElementsByTagName("tr");
//    //alert(rows);
//    return rows; 
//}
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function DynamicTable(node) {
    this.table = node; 
    this.dgColumns;
    this.dgData; 
}
DynamicTable.prototype.loadData = function(colNames, dgValues) {
    this.dgColumns = colNames;
    this.dgData = dgValues;
    this.eventHandlers();
    this.showGrid(this); 
}

DynamicTable.prototype.getData =  function(reverse){
    reverse = !reverse?false:reverse;    
    if(reverse)
        return this.dgData.reverse();
    return this.dgData;
}



DynamicTable.prototype.showGrid = function(self) {
    //self.sortOnColumn(columnName);
    var grid = new Grid(self);
    var rows = grid.createRows(); 
    var tbody = self.table.getElementsByTagName("tbody")[0]; 
    var parentTbodyNode = tbody.parentNode;
    var newTbody = document.createElement("tbody"); 
    parentTbodyNode.removeChild(tbody);
    parentTbodyNode.appendChild(newTbody); 
    while(rows.length > 0) {
        newTbody.appendChild(rows[0]); 
    } 
} 
function Handler() {
    this.columnName;
    this.self; 
} 
Handler.prototype.set = function(columnName, self) {
    this.columnName = columnName;
    this.self = self; 
} 
Handler.prototype.doSort = function() {
    this.self.sortOnColumn(this.columnName); 
} 
function handlerSort(columnName,self) {
    
    return function () 
    { 
        
        self.sortOnColumn(columnName);
        var grid = new Grid(self); 
        var rows = grid.createRows();
        var tbody = self.table.getElementsByTagName("tbody")[0]; 
        var parentTbodyNode = tbody.parentNode; 
        var newTbody = document.createElement("tbody"); 
        parentTbodyNode.removeChild(tbody);
        parentTbodyNode.appendChild(newTbody); 
        while(rows.length > 0) {
            newTbody.appendChild(rows[0]); 
        } 
    }; 
} 
DynamicTable.prototype.eventHandlers = function() {
    var elements = this.table.getElementsByTagName("th");
    //alert("Elements Length: "+elements.length);
    for (var x = 0; x < elements.length; x++) {
        //alert("Ele: "+x);
        var columnName = elements[x].getAttribute("name");
        addListener(elements[x], "click", handlerSort(columnName, this), false); 
    }	 
} 
DynamicTable.prototype.sortOnColumn = function(columnName) {
    //alert("Arun Testing Reverse: "+columnName.length);
    switch( columnName ) {
        case columnName:
            this.dgData = this.dgData.reverse(sortNumbers);// The code has been changed to reverse instead of sort numbers
            break;
        //        case "booleanColumn":
        //            this.dgData = this.dgData.sort(sortBoolean);
        //            break;
        //        case "dateColumn":
        //            this.dgData = this.dgData.sort(sortDates);
        //            break;
        //        case "stringColumn":
        //            this.dgData = this.dgData.sort(sortStrings);
        //            break;
        default:
            alert("noSortAvailable" + "--" + columnName);
            break; 
    } 
} 
function addListener(element, type, expression, bubbling) {
    bubbling = bubbling || false;
    if(window.addEventListener) { 
        element.addEventListener(type, expression, bubbling);
        return true; 
    } else if(window.attachEvent) {
        element.attachEvent('on' + type, expression);
        return true; 
    } else return false; 
} 
function sortDates(sortItemA, sortItemB) {
    var itemA = sortItemA[0];
    var itemB = sortItemB[0]; 
    if (itemA < itemB) {
        return -1; 
    } else if (itemA > itemB) {
        return 1; 
    } else if (itemA == itemB) {
        return 0; 
    } 
} 
function sortBoolean(sortItemA, sortItemB) {
    var itemA = sortItemA[3];
    var itemB = sortItemB[3]; 
    if (itemA < itemB) { 
        return -1; 
    } else if (itemA > itemB) {
        return 1; 
    } else if (itemA == itemB) {
        return 0; 
    }
} 
function sortNumbers(sortItemA, sortItemB) {
    var itemA = sortItemA[1];
    var itemB = sortItemB[1];
    if (itemA < itemB) {
        return -1; 
    } else if (itemA > itemB) {
        return 1; 
    } else if (itemA == itemB) { 
        return 0; 
    } 
}
function sortStrings(sortItemA, sortItemB) {
    var itemA = sortItemA[2];
    var itemB = sortItemB[2]; 
    if (itemA < itemB) {
        return -1;
    } else if (itemA > itemB) {
        return 1;
    } else if (itemA == itemB) {
        return 0;
    } 
} 
function sortNone(sortItemA, sortItemB) {
    return 0;
}
function Grid(self) {
    this.self = self;
    this.columnsToPopulate;
    this.columnToFillOrder();
} 
Grid.prototype.columnToFillOrder = function() {
    this.columnsToPopulate = new Array();
    var elements = this.self.table.getElementsByTagName("th"); 
    for (var x = 0; x < elements.length; x++) {
        this.columnsToPopulate[x] = elements[x].getAttribute("name"); 
    }
} 
Grid.prototype.createRows = function() {
    var parentNode = document.createElement("div");
    for (var dataRowNum = 0; dataRowNum < this.self.dgData.length; dataRowNum++) { 
        var rowNode = document.createElement("tr");
        for (var dataColumnNum = 0; dataColumnNum < this.columnsToPopulate.length; dataColumnNum++) {
            var node = document.createElement("td");
            var text;
            text = document.createTextNode(this.self.dgData[dataRowNum][dataColumnNum]);
            //    break;
            //                case this.self.dgColumns[1]:
            //                    text = document.createTextNode(this.self.dgData[dataRowNum][1]);
            //                    break;
            //                case this.self.dgColumns[2]:
            //                    text = document.createTextNode(this.self.dgData[dataRowNum][2]);
            //                    break;
            //                case this.self.dgColumns[3]:
            //                    text = document.createTextNode(this.self.dgData[dataRowNum][3]);
            //                    break;
            //                case this.self.dgColumns[4]:
            //                    text = document.createTextNode(this.self.dgData[dataRowNum][4]);
            //                    break;
            // default:
            //    break;
            //}
            node.appendChild(text);
            rowNode.appendChild(node);
        }
        parentNode.appendChild(rowNode);
    }
    var rows = parentNode.getElementsByTagName("tr");
    return rows; 
}