

var app = angular.module('myApp', []);
app.controller('myCtrl', ['$scope', function($scope) {

  var set = new Set([]);

  $scope.stocks = Array.from(set);
  $scope.stocksWithPrices = {};
  loadData_withprice();

    $scope.count = 0;
    $scope.myFunc = function() {
      storeData();
      loadData();
      updatePrices();
      $scope.$apply();
      console.log($scope.stocks);
    };

    $scope.delete_stocks = function(ticker) {
      loadData();
      set.delete(ticker);
      var tmp = Array.from(set);
      console.log(tmp);
      var arryToString=tmp.toString();
      chrome.storage.sync.set({"list": arryToString}, function() {
        console.log(arryToString);
        loadData_withprice();
      //  $scope.stocksWithPrices={};
        //loadData();
      //  $scope.$apply();
        //loadData();
      });
    };

    function storeData(){
      loadData();
      set.add($scope.single_stock);
      var tmp = Array.from(set);
      console.log(tmp);
      var arryToString=tmp.toString();
      chrome.storage.sync.set({"list": arryToString}, function() {
        loadData_withprice();
      });
    }

    function loadData(){
      chrome.storage.sync.get(['list'], function(result) {
        console.log(result.list.split(","));
        $scope.stocks= result.list.split(",");

        set = new Set($scope.stocks);
        $scope.stocksWithPrices={};
        $scope.$apply();
      });
    }

    function loadData_withprice(){
      chrome.storage.sync.get(['list'], function(result) {
        console.log(result.list.split(","));
        $scope.stocks= result.list.split(",");

        set = new Set($scope.stocks);
        $scope.stocksWithPrices={};
        $scope.$apply();
        updatePrices();
      });
    }

    function updatePrices(){
      for(var i=0; i<$scope.stocks.length;i++){
      //  alert();
        var ticker = $scope.stocks[i];
        getData(ticker);
      }

    }



    function getData(ticker){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          console.log(this)
          if (this.readyState == 4 && this.status == 200) {
             // Typical action to be performed when the document is ready:

             var quotes = JSON.parse(xhttp.responseText);
             console.log(quotes);
             //alert(quotes['quote']['latestPrice']);
             console.log(quotes['quote']['latestPrice']);
             $scope.stocksWithPrices[ticker] = {}
             $scope.stocksWithPrices[ticker]['price'] = quotes['quote']['latestPrice'];
             $scope.stocksWithPrices[ticker]['change'] = quotes['quote']['change'].toFixed(2);
             $scope.stocksWithPrices[ticker]['changePercent'] = (quotes['quote']['changePercent']*100).toFixed(2);
             var changeStr = quotes['quote']['change'].toString();
             if(changeStr.substring(0,1)=="-"){
               $scope.stocksWithPrices[ticker]['upOrDown'] = "down";
             }else{
               $scope.stocksWithPrices[ticker]['upOrDown'] = "up";
             }
             $scope.$apply();
          }
        };
        xhttp.open("GET", "https://api.iextrading.com/1.0/stock/"+ticker+"/batch?types=quote&range=1m&last=1", true);
        xhttp.send();
    }
}]);
