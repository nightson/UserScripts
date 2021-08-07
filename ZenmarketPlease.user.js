// ==UserScript==
// @name        ZenMarket, Please
// @namespace   nightson1988@gmail.com
// @include     https://page.auctions.yahoo.co.jp*auction/*
// @grant       none
// @version     0.1.1
// @author      nightson
// @description Add a link that redirects the current product page to the Zenmarket one.
// @icon        https://zenmarket.jp/favicon.ico?1
// @updateURL   https://github.com/nightson/UserScripts/raw/main/ZenmarketPlease.user.js
// @downloadURL https://github.com/nightson/UserScripts/raw/main/ZenmarketPlease.user.js
// ==/UserScript==
(function (){
  var targetNode = document.querySelector(".Price__buttonArea a");

  var a = document.createElement("a");
      br = document.createElement("br");

  a.text = "Go ZenMarket";
  a.href = "https://zenmarket.jp/auction.aspx?itemCode=" + document.location.href.match(/[\d,\w]{9,11}/g);
  a.setAttribute("class", "Button--buynow");

  targetNode.parentNode.insertBefore(a, targetNode);
  targetNode.parentNode.insertBefore(br, targetNode);
})();
