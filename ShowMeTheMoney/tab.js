var app = angular.module('myApp', []);


// app.controller('Ctrl', ['$scope', function($scope) {
// $scope.date = new Date();
// }])


app.controller('myCtrl', ['$scope','$interval', function($scope,$interval) {
  //This is how you clear the data
  //chrome.storage.sync.clear();

  $scope.AssignedDate = Date; // 'Date' could be assigned too of course:)

  $interval(function(){
    updatePrices();
      // nothing is required here, interval triggers digest automaticaly
  },1000)

  var set = new Set([]);


  $scope.allTickers = [];
  getAllTickers();

  $scope.stocks = Array.from(set);
  $scope.stocksWithPrices = {};
  $scope.addStockShown = false;
  loadData_withprice();

    $scope.count = 0;
    $scope.addStock = function(){
      $scope.addStockShown = !$scope.addStockShown;
    }

    $scope.addStockToList = function() {
      storeData();
      loadData();
      updatePrices();
      $scope.$apply();
      console.log($scope.stocks);
    };

    // $interval(function(){
    //
    // },2000);

    $scope.clearStock = function(){
      chrome.storage.sync.clear();
    }

    $scope.searchTicker = function(){
      console.log("start searching");
      var results = $scope.allTickers.filter(function(a){
         return a.search($scope.single_stock)>0;
      })
      console.log(results);
      alert(results);
      return results;
    }


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




    function getAllTickers(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

           var tickers = JSON.parse(xhttp.responseText);
           tickers.map(function(a){
             $scope.allTickers.push(a["name"]+"("+a['symbol']+")");
           })

           $scope.$apply();
        }
      };
      xhttp.open("GET", "https://api.iextrading.com/1.0/ref-data/symbols", true);
      xhttp.send();
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
             stocksWithPricesPar={};

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
