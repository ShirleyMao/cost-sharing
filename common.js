//load xml
function loadXMLDoc(dname) 
{
    try //Internet Explorer
    {
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async=false;
        xmlDoc.load(dname);
    }
    catch(e)
    {
        try //Firefox, Mozilla, Opera, etc.
        {
          xmlDoc=document.implementation.createDocument("","",null);
          xmlDoc.async=false;
          xmlDoc.load(dname);
        }
        catch(e) 
        {
          try //Google Chrome
          {
            var xmlhttp=new XMLHttpRequest();
            xmlhttp.open("Get",dname,false);
            xmlhttp.send(null);
            xmlDoc=xmlhttp.responseXML;
          }
          catch(e)
          {
            error=e.message;
          }
        }
     }
    try 
    {
        return(xmlDoc);
    }
    catch(e) 
    {
      alert(e.message);
      return(null);
    }
}

//eventUtil
var EventUtil=
{
      addHandler:function(element,type,handler)
      {
        if(element.addEventListener)
        {
          element.addEventListener(type,handler,false); // fase: 在冒泡阶段捕获
        }
        else if(element.attachEvent)
        {
          element.attachEvent("on"+type,handler);
        }
        else
        {
          element["on"+type]=handler;
        }
      },

      removeHandler:function(element,type,handler)
      {
        if(element.removeEventListener)
        {
          element.removeEventListener(type,handler,false); // fase: 在冒泡阶段捕获
        }
        else if(element.detachEvent)
        {
          element.detachEvent("on"+type,handler);
        }
        else
        {
          element["on"+type]=null;
        }
      },

      getEvent:function(event)
      {
        return event || window.event;
      },

      getTarget:function(event)
      {
        return event.target || event.srcElement;
      },

      preventDefault:function(event)
      {
        if(event.preventDefault)
        {
          event.preventDefault();
        }
        else
        {
          event.returnValue = false;
        }
      },

      stopProgration:function(event)
      {
          if(event.stopProgration)
          {
            event.stopProgration();
          }
          else
          {
            event.cancelBubble = true;
          }
      },

};  

//index.html add and modify
var handlerAddModify=function()
{
  window.open('cost-sharing.html');
  window.history.back(-1);
} 

//index.html onload to deal with first usage
var handlerOnLoad=function()
{
  var xmldoc=loadXMLDoc('fee.xml');
  var noFee=null;
  if(xmldoc)
  {
      var x=xmldoc.getElementsByTagName("person");
      if(x.length==0)
      {
        noFee = true;
      }
      else
      {
        var itms=xmlDoc.getElementsByTagName("item");
        var txt1="<tr>";
        //add table head of item
        txt="<table id='result' border='1'><tr><th rowspan='2'>姓名</th><th rowspan='2'>电话</th><th rowspan='2'>邮箱</th>";

        for(var i=0;i<itms.length;i++)
        {
          var temp=itms[i].childNodes[1];//item->totalPay
          var temp1=temp.childNodes[0].nodeValue;//totalPay.value

          txt=txt+"<th colspan='2'>"+itms[i].childNodes[0].nodeValue+"("+temp1+")"+"</th>";
          txt1=txt1+"<th>实际支付</th><th>需支付</th>";
        }
        txt=txt+"<th rowspan='2'>分摊结果</th>"+txt1+"</tr>";

        //add information
        var x=xmlDoc.getElementsByTagName("person");
        var txt2="";
        for (var i=0;i<x.length;i++) //total person num in fee.xml
        {
            if(i!=0)
            {
                txt2=txt2+"<td>0</td><td>0</td>";
            }

            var txt3="";
            for(var r=0;r<x.length-i-1;r++)
            {
                txt3=txt3+"<td>0</td><td>0</td>";
            }
            
            for(j=1;j<x[i].childNodes.length;j++) //name tel email realPay and needPay of one person
            {
                xx=x[i].childNodes[j];

                if((j-1)%5==0)
                {
                  txt=txt+"<tr>";
                }
                
                try
                {
                    if(j%5==4)
                    {
                        txt=txt+txt2; // 0 before real value
                    }
                    txt=txt+"<td>"+xx.childNodes[0].nodeValue+"</td>";
                }
                catch(err)
                {
                  txt=txt+"</td></td>";
                }

                if(j%5==0)
                {

                  txt=txt + txt3+"<td>0</td></tr>"; //0 afeter real value and reserve a position for the finnal result
                }                           

            }           
        }

        txt=txt + "</table>";
        document.getElementById('output').innerHTML=txt;

        //combine the same person's item 
        var rlt=document.getElementById("result");
        var payers=xmlDoc.getElementsByTagName("Payer");
        var start=parseInt(x[0].childNodes[0].nodeValue)+parseInt(2);// the second item
        var max=parseInt(payers.length)+parseInt(2);
        for(var i=start;i<max;i++)
        {
          for(var j=2;j<i;j++)
          {
            var temp1=rlt.rows[i].cells[0];
            var temp2=rlt.rows[j].cells[0];
            if(temp1.childNodes[0].nodeValue==temp2.childNodes[0].nodeValue)
            {
              for(k=0;k<itms.length;k++)
              {
                var temp3=rlt.rows[j].cells[3+2*k];
                var temp4=rlt.rows[j].cells[3+2*k+1];
                var temp5=rlt.rows[i].cells[3+2*k];
                var temp6=rlt.rows[i].cells[3+2*k+1];
                temp3.childNodes[0].nodeValue=parseInt(temp3.childNodes[0].nodeValue)+parseInt(temp5.childNodes[0].nodeValue);
                temp4.childNodes[0].nodeValue=parseInt(temp4.childNodes[0].nodeValue)+parseInt(temp6.childNodes[0].nodeValue);
              }
              rlt.deleteRow(i);
              i--;
              max--;
              break;
            }
          }
        }

        //commpute the final rusult
        for(var i=2;i<rlt.rows.length;i++)
        {
           var realpay=0,needpay=0;
           for(var k=0;k<itms.length;k++)
          {
             var tempReal=rlt.rows[i].cells[3+2*k];
             var tempNeed=rlt.rows[i].cells[3+2*k+1];
              realpay=parseInt(realpay)+parseInt(tempReal.childNodes[0].nodeValue);
              needpay=parseInt(needpay)+parseInt(tempNeed.childNodes[0].nodeValue);
          }
          var shareResult=rlt.rows[i].cells[3+2*itms.length];
          shareResult.childNodes[0].nodeValue=parseInt(realpay)-parseInt(needpay);
        }
      }
  }
  else
  {
    noFee = true;
  }

  if(noFee)
  {
    alert('目前还没有分摊账单数据，请先建立新账单');
    window.open('cost-sharing.html');
    window.history.back(-1);
  }
}

//cost-sharing.html will use 

  //covert node to Array
function convertToElementArray(nodes)
 {
    var array=null;
    array=new Array();
    for(var i=0;i < nodes.length; i++)
    {
      if(nodes[i].nodeType==1)  //element
      {
        array.push(nodes[i]);
      }
            
    }
    return array;
  }

function clickRightMenu(Id,MenuId)
{
      var elem=document.getElementById("item"+Id);
    

        EventUtil.addHandler(elem,"contextmenu",function(event){
        console.log(this);
        event=EventUtil.getEvent(event);
        EventUtil.preventDefault(event);

        if(Id!=0)
        {
          var menu=document.getElementById(MenuId);
          menu.style.left=event.clientX+"px";
          menu.style.top=event.clientY+"px";
          menu.style.visibility="visible";

          console.log("src :"+event.srcElement);
          //console.log("target:"+tar);
          console.log("menu:"+menu);

          //EventUtil.addHandler(menu,"click",function(event) b??????????为啥不行
          //var menu=document.getElementById(MenuId);
          menu.onclick=function(event)
          {
            var con=confirm("确认删除整个支出项目"+Id+"的数据？");
            if(con)
            {
              //delete item
              var anch=document.getElementById("anchclList"+Id);
              console.log("num:"+Id);
              console.log("anch: "+anch);
              anch.parentNode.removeChild(anch);

              //delete nav
              var navDelete=document.getElementById("item"+Id);
              console.log("nav: "+navDelete);
              navDelete.parentNode.removeChild(navDelete);
            } 
          };
        }
        
      });

    EventUtil.addHandler(document,"click",function(event)
    {
      document.getElementById(MenuId).style.visibility="hidden";
    });

  }

  //add new user in one item
    function deleteUser()
    {
        
      var con=confirm("确认删除整行的数据？");
      if(con)
      {
         var tr=this.parentNode.parentNode;
        tr.parentNode.removeChild(tr);
      } 
    }

  //if name has already exist, auto show Tel and Email when name changed
  function telEmailAutoShow(){
    var database=loadXMLDoc("fee.xml");
    if(xmldoc!=null)
      {
        var userInxml=xmldoc.getElementsByTagName("Payer");
        for(var i=0;i<userInxml.length;i++)
        {
          var userX=userInxml[i];
          if(this.value==userX.childNodes[0].nodeValue)  //this: input Payer
          {
            this.parentNode.nextSibling.firstChild.value=userX.nextElementSibling.childNodes[0].nodeValue;  //td->td->input Tel
            this.parentNode.nextSibling.nextSibling.firstChild.value=userX.nextElementSibling.nextElementSibling.childNodes[0].nodeValue;//td->td->input Email
            break;
          }
        }
        
      }

  }

  //var TableAdd= function(itemNum)
  function TableAdd()
  {
    var parent=this.parentNode;
    var childs=parent.childNodes;
    var childsArray=convertToElementArray(childs);
    var oritable=childsArray[0];

    var row=oritable.insertRow(oritable.rows.length);

    var cell0=row.insertCell(0);
    cell0.innerHTML="<input class='inputdata' type='text' name='Payer' form='info1'/>";

    var cell1=row.insertCell(1);
    cell1.innerHTML="<input class='inputdata' required type='number' name='Tel' form='info1'/>";

    var cell2=row.insertCell(2);
    cell2.innerHTML="<input class='inputdata' required type='email' name='Email' form='info1'/>";

    var cell3=row.insertCell(3);
    cell3.innerHTML="<input class='inputdata' required type='text' name='RealPay' form='info1'/>";

    var cell4=row.insertCell(4);
    cell4.innerHTML="<input class='inputdata' required type='text' name='NeedPay' form='info1'/>";
    
    var cell5=row.insertCell(5);
    cell5.innerHTML="<button type='button' name='del' >删除</button>";

    /***************add click function to delete button*******/
    var deleterow=row.lastChild.firstChild;
    EventUtil.addHandler(deleterow,"click",deleteUser);
    EventUtil.addHandler(cell0.firstChild,"change",telEmailAutoShow);

  }

  function addBtnAddCss (ElmentId)
  {
    var  btnAddCss=document.getElementById(ElmentId);
    btnAddCss.style.marginBottom="20px";
  }


  function handlerPrevent()
  {
    event= this.event || window.event;
    EventUtil.preventDefault(event);
  }
    /*****onclick submit compute total user number*******/
  function validCheck()
  {

    var parent = document.getElementById("infoBody");
    var childs=parent.childNodes;
    var childsArray=convertToElementArray(childs);
    var length=childsArray.length;
    EventUtil.removeHandler(document.getElementById("info1"),"submit",handlerPrevent);
    for (var i=0; i<length;i++)
    {
      var table=document.getElementById("tableInfo"+i);
      var user=document.getElementById("shareNum"+i);
      var totalFee=document.getElementById("pay"+i);
      if(user.value)
      {
        if(user.value!=table.rows.length-1)
        {
          var userNumByTableRows=table.rows.length-1
          if(confirm(document.getElementById("itemName"+i).value+"人数不匹配，请确认是否为 "+userNumByTableRows+" 人？"))
          {
            user.value=table.rows.length-1;
          }
          else
          {
            EventUtil.addHandler(document.getElementById("info1"),"submit",handlerPrevent);
          }
        }

      }
      else
      {
        user.value=table.rows.length-1;
      }

      //check totalPay in each items are the sum of each person
      var sumFee=0;
      for(var j=0;j<user.value;j++)
      {
        sumFee=parseInt(sumFee)+parseInt(document.getElementById("tableInfo"+i).rows[1+j].cells[4].firstChild.value);
      }
      if(sumFee!=totalFee.value)
      {
        alert(document.getElementById("itemName"+i).value+"费用总和不是 "+totalFee.value);
        EventUtil.addHandler(document.getElementById("info1"),"submit",handlerPrevent);
      }
      
    }


  }


function map()
{
  //nav map to related item
    var str=this.id;
    document.getElementById("infoBody").scrollTop=document.getElementById("anchclList"+str.substring(4,str.length)).offsetTop;
}

/*********add Content1 CSS**********/
function addContent1Css (ElmentId)
{
    var  content1AddCss=document.getElementById(ElmentId);
    content1AddCss.style.background="#F0F0F0";
    content1AddCss.style.borderBottom="1px,solid,#E0E0E0";
    content1AddCss.style.padding="2px";
    content1AddCss.style.height="26px";
}

function newItemPattern(cnt,itemName)
{
    var txt="<div id=anchclList"+cnt+">"
            +"<a name=item"+cnt+"></a>"
            +"<div class=mainbody id=content1_"+cnt+">"
                    +"支出"+cnt+": ";
    if(itemName!=null)
    {
      txt=txt+"<input id=itemName"+cnt+" class=inputdata type=text name=item value="+itemName+" form=info1>"+"  ";
    }
    else
    {
      txt=txt+"<input id=itemName"+cnt+" class=inputdata type=text name=item form=info1>"+"  ";
    }
    txt=txt+"总金额："
             +"<input id=pay"+cnt+" class=inputdata type=text name=totalPay form=info1>"+"  总人数:"
              +"<input id=shareNum"+cnt+" class=inputdata type=text name=userNum form=info1>"+"  "
             +"</div>"
                  +"<div class=mainbody id=content2_"+cnt+">"
                    +"<table id=tableInfo"+cnt+">"
                      +"<tr>"
                          +"<td>交款人</td>"
                          +"<td>电话</td>"
                          +"<td>邮箱</td>"
                          +"<td>实交款</td>"
                          +"<td>需交款</td>"
                        +"</tr>"
                      +"<tr>"
                        +"<td><input class=inputdata type=text name=Payer form=info1></td>"
                        +"<td><input class=inputdata required type=number name=Tel form=info1></td>"
                        +"<td><input class=inputdata required type=email name=Email form=info1></td>"
                        +"<td><input class=inputdata required type=text name=RealPay form=info1></td>"
                        +"<td><input class=inputdata required type=text name=NeedPay form=info1></td>"
                        +"<td><button type=button name=del >删除</button></td>"
                      +"</tr>"
                    +"</table>"
                    +"<input id=btnAdd"+cnt+" class=btnAdd type=button value=新增 form=info1>"
                  +"</div>"
                +"</div>";
    return txt;

}

/**********add New item****/
function addNewItem()
{    
  var itemname=prompt("请输入支出项目名称","");
  if (itemname!=null && itemname!="")
  {
    var elm=document.getElementById("infoBody");
    var nodeArray =convertToElementArray(elm.childNodes);
    var count=nodeArray.length;

    //append behind infoBody
    elm.insertAdjacentHTML("beforeEnd", newItemPattern(count,itemname)); 

    //add item in Navigator
    var nav=document.getElementById("menu");
    var menuConvert=convertToElementArray(nav.childNodes);
    var menuLen=menuConvert.length;

    var newNav="<li id=item"+menuLen+"><a href=#item"+menuLen+">"+itemname+"</a></li>";
    nav.insertAdjacentHTML("beforeEnd",newNav);

    if(count>1)
    {
        var cnt=count-1;
        addBtnAddCss("btnAdd"+cnt);
    }

    //when add a item, this item can be showed on the top of anchclList
    document.getElementById("btnAdd"+count).style.marginBottom="500px";
    document.getElementById("infoBody").scrollTop=document.getElementById("anchclList"+count).offsetTop;

    EventUtil.addHandler(document.getElementById("item"+menuLen),"click",map);

    if(count>6)
    {
      //when more than 6 item. should scroll to show nav.so fix width first
      document.getElementById("menu").style.width=parseInt(Math.ceil(count/6))*28+"em";
    }

    /*right click to delete new item************/ 
    clickRightMenu(menuLen,"delItem");        

    //bound with event
    var firstUser=document.getElementById("tableInfo"+count).rows[1].cells[0];
    EventUtil.addHandler(firstUser.firstChild,"change",telEmailAutoShow);
    var btnAddClic=document.getElementById("btnAdd"+count);
    EventUtil.addHandler(btnAddClic,"click",TableAdd);


    /***************delete new user for the first user of the new added item**/
    var table=document.getElementById("tableInfo"+count);
    var childs=convertToElementArray(table.childNodes);

    var deleterow=childs[0].lastChild.lastChild;
    EventUtil.addHandler(deleterow,"click",deleteUser); 

    //add CSS 
    addContent1Css("content1_"+count);
  
  }
  else
  {
      alert("取消新增支出项目");
  }
      
}


function displayExistedItem()
{
    var xmldoc=loadXMLDoc("fee.xml");

    /****add new user for item0 whether xml exist or not****/
    var btnClick=document.getElementById("btnAdd0");
    EventUtil.addHandler(btnClick,"click",TableAdd);
    addBtnAddCss("btnAdd0");

    clickRightMenu(0,"delItem");
    EventUtil.addHandler(document.getElementById("item0"),"click",map);
    /******************************************************/

    if(xmldoc!=null)
    {
      var x=xmldoc.getElementsByTagName("item");
      if(x.length>0)  // for in item
      {
          
        var m,n,xmlTable,k,name;
        for(var i=0; i<x.length;i++)
        {
          if(i!=0)
          {
            var elm=document.getElementById("infoBody");
            var nodeArray =convertToElementArray(elm.childNodes);
            var count=nodeArray.length;

            //append behind infoBody
            elm.insertAdjacentHTML("beforeEnd", newItemPattern(count,null)); 

            //add item in Navigator
            var nav=document.getElementById("menu");
            var menuConvert=convertToElementArray(nav.childNodes);
            var menuLen=menuConvert.length;
            var newNav="<li id=item"+menuLen+"><a href=#item"+menuLen+">"+x[i].childNodes[0].nodeValue+"</a></li>";
            nav.insertAdjacentHTML("beforeEnd",newNav);
            //window.location.href="#item"+count;          

            //when click nav, related item can be showed on the top of anchclList
            if(menuLen==(x.length-1))
            {
              document.getElementById("btnAdd"+count).style.marginBottom="500px";
              
            }
            else
            {
              addBtnAddCss("btnAdd"+count);
            }
               
            //add content1 CSS 
            addContent1Css("content1_"+count);
            

            clickRightMenu(menuLen,"delItem");

            //bound with event
            var btnAddClic=document.getElementById("btnAdd"+count);
            EventUtil.addHandler(btnAddClic,"click",TableAdd);

          }

          EventUtil.addHandler(document.getElementById("item"+i),"click",map);

          m=document.getElementById("itemName"+i);
          m.value=x[i].childNodes[0].nodeValue;

          n=document.getElementById("pay"+i);
          n.value=x[i].childNodes[1].firstChild.nodeValue;

          xmlTable=xmldoc.getElementsByTagName("person");
          userN=document.getElementById("shareNum"+i);
          userN.value=xmlTable[i].childNodes[0].nodeValue;
            
          k=xmlTable[i].childNodes[0].nodeValue-1;

          //add users
          while(k--)
          {
            var oritable=document.getElementById("tableInfo"+i);

            var row=oritable.insertRow(oritable.rows.length);

            var cell0=row.insertCell(0);
            cell0.innerHTML="<input class='inputdata' type='text' name='Payer' form='info1'/>";

            var cell1=row.insertCell(1);
            cell1.innerHTML="<input class='inputdata' required type='number' name='Tel' form='info1'/>";

            var cell2=row.insertCell(2);
            cell2.innerHTML="<input class='inputdata' required type='email' name='Email' form='info1'/>";

            var cell3=row.insertCell(3);
            cell3.innerHTML="<input class='inputdata' type='text' name='RealPay' form='info1'/>";

            var cell4=row.insertCell(4);
            cell4.innerHTML="<input class='inputdata' type='text' name='NeedPay' form='info1'/>";

            var cell5=row.insertCell(5);
            cell5.innerHTML="<button type='button' name='del'>删除</button>";
                
          }

          var htmlTable=document.getElementById("tableInfo"+i);
          var htmlUser=document.getElementsByName("Payer");
          var i1=0,j1=0;
          for (i1=0;i1<userN.value;i1++)  // usesrs
          {
            for(j1=0;j1<5;j1++)  //five cells every user
            {
                var xx=xmlTable[i].childNodes[j1+1+5*i1];
                htmlTable.rows[i1+1].cells[j1].firstChild.value=xx.childNodes[0].nodeValue;
            }

            EventUtil.addHandler(htmlUser[i1],"change",telEmailAutoShow);
          }             
        }
      }

      if(x.length>7)
      {
        document.getElementById("menu").style.width=parseInt(Math.ceil(x.length/6))*28+"em";
      }
        
      /***************delete new user************/
      var dele=document.getElementsByName("del");
      for(var i2=0;i2<dele.length;i2++)
      {
        EventUtil.addHandler(dele[i2],"click",deleteUser);
      }
    }
}
