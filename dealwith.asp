<%@Language="vbscript" Codepage="65001"%>
<%
dim xmlDoc
dim rootEl,fieldName,fieldValue
dim p,i,j,k,m,num

'如果有错误发生，不允许程序终止
On Error Resume Next

Set xmlDoc = server.CreateObject("Microsoft.XMLDOM")
'xmlDoc.load("fee.xml")
num=1
'if not xmlDoc then 
    xmlDoc.preserveWhiteSpace=true

    '创建并向文档添加根元素
    Set rootEl = xmlDoc.createElement("costShare")
    xmlDoc.appendChild rootEl
    for k=1 to Request.Form("item").Count

      set itemName = xmlDoc.createElement("item")
      itemName.Text=Request.Form("item").item(k)
      rootEl.appendChild itemName  

      set totalPay= xmlDoc.createElement("totalPay")
      totalPay.Text=Request.Form("totalPay").item(k)
      itemName.appendChild totalPay

      set userNum= xmlDoc.createElement("person")
      userNum.Text=Request.Form("userNum").item(k)
      totalPay.appendChild userNum

      m=Request.Form("userNum").item(k)
      for j=num to m+num-1
      for i=4 to Request.Form.Count    
        Set fieldValue = xmlDoc.createElement(Request.Form.Key(i))
        fieldValue.Text = Request.Form(i).item(j)
        userNum.appendChild fieldValue
      next
      next
      num=num+m

    next


    Set p =xmldoc.CreateProcessingInstruction("xml", "version='1.0' encoding='UTF-8' ") 
    'xmlDoc.createProcessingInstruction("xml","version='1.0' encoding='gb2312'")
   
    xmlDoc.insertBefore p,xmlDoc.childNodes(0)



'保存 XML 文件
xmlDoc.save "G:\study\house\fee.xml"

'释放所有的对象引用
set xmlDoc=nothing
set rootEl=nothing
set totalPay=nothing
set fieldValue=nothing
set p=nothing
'end if

'测试是否有错误发生
if err.number<>0 then
  response.write("Error: No information saved.")
else
end if

%>


<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"> <!--name space-->

<head>
  <meta http-equiv="Content-Type" content="text/html"; charset="UTF-8" />  <!--tell broweser prepare to rececive a html document -->
  <link rel="stylesheet" type="text/css" href="c1.css" />
  <script type="text/javascript" src="common.js"></script>
  <title>Cost-Sharing</title>
</head>

<body id="show">

  <div id="header">
      <h1> 费用分摊</h1>
  </div>

  <div id="modify">
      <input id="add_modify" class="button" type="button" value="新增/修改"/>
      <p>注释：下表最后一列为最后的结算结果。负数：表示还需缴纳的欠款，正数：表示会被退换的金额</p>
  </div>

  <div id="output"><div>

  <script type="text/javascript">

      //var firstload=document.getElementById("btnClick_add");
      EventUtil.addHandler(window,"load",handlerOnLoad);
      
      var addModify=document.getElementById("add_modify");
      EventUtil.addHandler(addModify,"click",handlerAddModify);


      if (window.XMLHttpRequest)
      {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
      }
      else
      {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }

      xmlhttp.open("GET","fee.xml",false);
      xmlhttp.send();
      xmlDoc=xmlhttp.responseXML;
      if(xmlDoc)
      {
        txt="<table id='result' border='1'><tr><th rowspan='2'>姓名</th><th rowspan='2'>电话</th><th rowspan='2'>邮箱</th>";
        //add table head of item
        var itms=xmlDoc.getElementsByTagName("item");
        var txt1="<tr>";
        for(var i=0;i<itms.length;i++)
        {
          var temp=itms[i].childNodes[1];
          var temp1=temp.childNodes[0].nodeValue;

          txt=txt+"<th colspan='2'>"+itms[i].childNodes[0].nodeValue+"("+temp1+")"+"</th>";
          txt1=txt1+"<th>实际支付</th><th>需支付</th>";
        }
        txt=txt+"<th rowspan='2'>分摊结果</th>"+txt1+"</tr>";

        //add information
        var x=xmlDoc.getElementsByTagName("person");
        var txt2="";
        for (var i=0;i<x.length;i++)
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
                //txt=txt+"<tr>";
                for(j=1;j<x[i].childNodes.length;j++)
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
                          txt=txt+txt2;
                        }
                        txt=txt+"<td>"+xx.childNodes[0].nodeValue+"</td>";
                    }
                    catch(err)
                    {
                      txt=txt+"</td></td>";
                    }

                    if(j%5==0)
                    {

                      txt=txt + txt3+"<td>0</td></tr>";
                    }                           

                  }     
             
        }
        txt=txt + "</table>";
        document.getElementById('output').innerHTML=txt;

        //combine the same person's item and commpute the final rusult
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

      

  </script>

</body>
</html>
