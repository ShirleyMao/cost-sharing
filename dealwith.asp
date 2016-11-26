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
      response.write(Request.Form&"<br />"&"itme:"&itemName.Text&"<br />") 
      response.write("num:"&num&"<br />")
      response.write(Request.Form("item")&"<br />") 
      response.write(Request.Form("totalPay")&"<br />") 
      response.write(Request.Form("userNum")&"<br />") 

      set totalPay= xmlDoc.createElement("totalPay")
      totalPay.Text=Request.Form("totalPay").item(k)
      itemName.appendChild totalPay
      response.write("k:"&k&"   "&"totalPay:"&totalPay.Text&"<br />")

      set userNum= xmlDoc.createElement("person")
      userNum.Text=Request.Form("userNum").item(k)
      totalPay.appendChild userNum
      response.write("k:"&k&"   "&"userNum:"&userNum.Text&"<br />")

      m=Request.Form("userNum").item(k)
      response.write("m:"&m&"<br />")
      for j=num to m+num-1
      for i=4 to Request.Form.Count    
        Set fieldValue = xmlDoc.createElement(Request.Form.Key(i))
        fieldValue.Text = Request.Form(i).item(j)
        userNum.appendChild fieldValue
                response.write("fieldValue:"&Request.Form.Key(i)&" fieldValue_Text:"&Request.Form(i).item(j)&"<br />")
      next
      next
      num=num+m

    next


    Set p =xmldoc.CreateProcessingInstruction("xml", "version='1.0' encoding='ISO-8859-1' ") 
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
  response.write("Your information has been saved.")
end if

%>


<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"> <!--name space-->

<head>
  <meta http-equiv="Content-Type" content="text/html"; charset="UTF-8" />  <!--tell broweser prepare to rececive a html document -->
</head>

<body>
<div id="output"><div>
<script type="text/javascript">
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

    txt="<table id='result' border='1'><tr><th rowspan='2'>name</th><th rowspan='2'>Tel</th><th rowspan='2'>Email</th>";
    var itms=xmlDoc.getElementsByTagName("item");
    console.log(itms);
    console.log("childs: "+itms.childNodes);
    txt1="<tr>";

    for(var i=0;i<itms.length;i++)
    {
      var temp=itms[i].childNodes[1];
      var temp1=temp.childNodes[0].nodeValue;

      txt=txt+"<th colspan='2'>"+itms[i].childNodes[0].nodeValue+"("+temp1+")"+"</th>";
      txt1=txt1+"<th>RealPay</th><th>NeedPay</th>";
    }
    txt=txt+"<th rowspan='2'>ShareResult</th>"+txt1+"</tr>";

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

    //commpute the final rusult
    var rlt=document.getElementById("result");
    var payers=xmlDoc.getElementsByTagName("Payer");
    var start=parseInt(x[0].childNodes[0].nodeValue)+parseInt(2);// the second item
    for(var i=start;i<(parseInt(payers.length)+parseInt(2));i++)
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




</script>

</body>
</html>