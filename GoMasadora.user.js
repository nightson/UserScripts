// ==UserScript==
// @name        Give me Masadora, Please
// @namespace   nightson1988@gmail.com
// @include     https://www.suruga-ya.jp/product/detail/*
// @grant       none
// @version     0.1
// @author      nightson
// @description Add a link that redirects the current product page to the corresponding Masadora one.
// ==/UserScript==
(function (){
	var targetNode = document.querySelector(".mgnB10");

	var a = document.createElement("a");

	a.text = "移步至Masadora";
	a.href = document.location.href.replace("https", "http").replace("www.suruga-ya.jp", "surugaya.masadora.jp");

	targetNode.parentNode.insertBefore(a, targetNode);
})();