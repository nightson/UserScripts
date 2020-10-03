// ==UserScript==
// @name        Give me Masadora, Please
// @namespace   nightson1988@gmail.com
// @include     https://www.suruga-ya.jp/product/detail/*
// @grant       none
// @version     0.2
// @author      nightson
// @description Add a link that redirects the current product page to the corresponding Masadora one.
// ==/UserScript==
(function (){
  var targetNode = document.querySelector(".toreka");

  var a = document.createElement("a");

  a.text = "Go Masadora";
  a.href = document.location.href.replace("https", "http").replace("www.suruga-ya.jp", "surugaya.masadora.jp");
  a.style = "background: linear-gradient(#ffa742,#ff711f);display: inline-block;height: 30px;line-height: 30px;font-size: 16px;border: 1px solid #b1b5bd;border-radius: 4px;color: #fff;box-shadow: 0 2px 0 -1px rgba(0,0,0,.1);position: relative;cursor: pointer;width: 138px;text-align: center;font-family: Arial;";

  targetNode.parentNode.insertBefore(a, targetNode);
})();