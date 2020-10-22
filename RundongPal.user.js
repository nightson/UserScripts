// ==UserScript==
// @name        Rundong Pal
// @namespace   nightson1988@gmail.com
// @match       http://rundongex.com/Forms/Member/WayBill/WayBill_Add.aspx
// @grant       none
// @version     0.1
// @author      nightson
// @description Script that makes Rundong more user-friendly.
// @updateURL   https://raw.githubusercontent.com/nightson/UserScripts/main/RundongPal.user.js
// ==/UserScript==
(function (){
  let nodes = document.querySelectorAll('#collapseContent1 td[id^="td_remark_"] a');

  nodes.forEach(function (node){
    node.innerHTML = node.querySelector('span').getAttribute('title2');
    node.removeAttribute('href');
    node.removeAttribute('one-link-mark');
  });
})();
