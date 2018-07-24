var app = angular.module('myApp', []);



app.controller('myCtrl', ['$scope','$interval', function($scope,$interval) {

    $scope.index = 0;


    $scope.AssignedDate = Date;
    $scope.stocksWithOrder = {};
    $scope.stocksWithPrices = [];
    $scope.marketOverView ={};

    $scope.allTickers = [];

    $scope.searchResults =[];
    getAllTickers();

    loadData();

    $interval(function(){
      updatePrices();
      updateIndex();
      updateIndex();
    },1000)

    $scope.market_index ={};
    updateIndex();

    getOverview();

    $scope.addStock = function(){
      $scope.addStockShown = !$scope.addStockShown;
    }

    $scope.addStockToList = function() {
      storeData();
    };

    $scope.searchTicker = function(){
    //  alert($scope.single_stock);
    //console.log($scope.allTickers);
      var results = $scope.allTickers.filter(function(a){
        return a.toLowerCase().search($scope.single_stock.toLowerCase())>=0;
      })
    //  console.log(results);
      $scope.searchResults=results;
      //$scope.$apply();
    }

    $scope.selectSearch = function(name){
      var regExp = /\(([^)]+)\)/;
      var matches = regExp.exec(name);

      $scope.single_stock=matches[1];
    }

    $scope.delete_stocks = function(ticker) {
      var index = $scope.stocksWithOrder[ticker];
      chrome.storage.sync.remove(ticker, function() {
        Object.keys($scope.stocksWithOrder).forEach(function(key) {
          if($scope.stocksWithOrder[key]>index){
            var key_value_pair = {};
            key_value_pair[key]=$scope.stocksWithOrder[key]-1;
            chrome.storage.sync.set(key_value_pair, function() {
            });
          }
        })
        loadData();
      });
    };

    $scope.clearStock = function(){
      chrome.storage.sync.clear();
    }

    function updatePrices(){
      for(var i=0; i<$scope.stocksWithPrices.length;i++){
        var ticker = $scope.stocksWithPrices[i]['ticker'];
        getData(ticker);
      }
    }

    function storeData(){
      var ticker = $scope.single_stock;
      var index = $scope.index;
      var key_value_pair = {};
      key_value_pair[ticker]=index;
      chrome.storage.sync.set(key_value_pair, function() {
        loadData();
      });
    }



    function loadData(){
      chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      $scope.index = allKeys.length;
      $scope.stocksWithOrder = items;
      var tmp = [];
      Object.keys(items).forEach(function(key) {
        console.log(key, items[key]);
        var stock ={};
        stock['ticker'] = key;
        stock['order']= items[key];
        stock['price'] = "-";
        stock['change']= "-";
        stock['changePercent'] = "-";
        stock['upOrDown']= "up";
        tmp.push(stock);
      });
      tmp.sort(function(a, b){return a['order']-b['order']});
      $scope.stocksWithPrices=tmp;
      updatePrices();
      $scope.$apply();
      });
    }

    function updateIndex(){
      getIndexStocks("DIA");
      getIndexStocks("SPY");
      getIndexStocks("IWM");
    }

    function getIndexStocks(index){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        console.log(this)
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:

           var quotes = JSON.parse(xhttp.responseText);
           $scope.market_index[index]={};
           if(index=="DIA"){
            $scope.market_index[index]['ticker']="Dow Jones\n(DIA)";
           }
           if(index=="SPY"){
            $scope.market_index[index]['ticker']="S&P 500\n(SPY)";
           }
           if(index=="IWM"){
            $scope.market_index[index]['ticker']="Russell 2000\n(IWM)";
           }
           $scope.market_index[index]['price'] = quotes['quote']['latestPrice'];
           $scope.market_index[index]['change'] = quotes['quote']['change'].toFixed(2);
           $scope.market_index[index]['changePercent'] = (quotes['quote']['changePercent']*100).toFixed(2);
           var changeStr = quotes['quote']['change'].toString();
           if(changeStr.substring(0,1)=="-"){
             $scope.market_index[index]['upOrDown'] = "down";
           }else{
             $scope.market_index[index]['upOrDown'] = "up";
           }

           console.log("index is ");
           console.log($scope.market_index);
           $scope.$apply();
        }
      };
      xhttp.open("GET", "https://api.iextrading.com/1.0/stock/"+index+"/batch?types=quote&range=1m&last=1", true);
      xhttp.send();
    }

    function getData(ticker){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           var index = $scope.stocksWithOrder[ticker];
           var quotes = JSON.parse(xhttp.responseText);
           var stockWithPricesPar={};
           stockWithPricesPar['ticker']=ticker;
           stockWithPricesPar['price'] = quotes['quote']['latestPrice'];
           stockWithPricesPar['change'] = quotes['quote']['change'].toFixed(2);
           stockWithPricesPar['changePercent'] = (quotes['quote']['changePercent']*100).toFixed(2);

           var changeStr = quotes['quote']['change'].toString();
           if(changeStr.substring(0,1)=="-"){
             stockWithPricesPar['upOrDown'] = "down";
           }else{
             stockWithPricesPar['upOrDown'] = "up";
           }
           $scope.stocksWithPrices[index]=stockWithPricesPar;

           $scope.$apply();
        }
      };
      xhttp.open("GET", "https://api.iextrading.com/1.0/stock/"+ticker+"/batch?types=quote&range=1m&last=1", true);
      xhttp.send();
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

    function getOverview(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           var overviewData = JSON.parse(xhttp.responseText);
            $scope.marketOverView = overviewData;

           $scope.$apply();
        }
      };
      xhttp.open("GET", "https://api.iextrading.com/1.0/stock/market/overview", true);
      xhttp.send();
    }


}])
