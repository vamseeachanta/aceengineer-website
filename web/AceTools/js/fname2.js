/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function change(t1)
{
   if(t1.value=="")
       {
          alert("Water Depth should be non-empty");
          return false;
       }
       if(t1.value<3000)
           {
               alert("Water Depth should be >= 3000");
               return false;
           }
      if(t1.value>10000)
          {
              alert("Water Depth should be <10000");
              return false;
          }
          
}
function show()
{
    alert("Sorry,No Data available for Export");
}





