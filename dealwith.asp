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
      
      EventUtil.addHandler(document.getElementById("add_modify"),"click",handlerAddModify);
  </script>

</body>
</html>
