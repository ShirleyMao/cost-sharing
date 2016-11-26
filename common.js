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
  if(xmlDoc)
  {
      var x=xmldoc.getElementsByTagName("person");
      if(x.length==0)
      {
        noFee = true;
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


  //add new user in one item

 