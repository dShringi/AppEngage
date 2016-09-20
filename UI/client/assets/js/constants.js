var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var color = d3.scale.ordinal().range(["#f47321", "#76bce6", "#75d3c5", "#379154", "#39B4BF", "#FFE666", "#E54E67", "#F75B49"]);
var todayObj = new Date(), appKey = '4170b44d6459bba992acaa857ac5b25d7fac6cc1';

var APIBaseURL = "http://52.206.121.100/appengage/";