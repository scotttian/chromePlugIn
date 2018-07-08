document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {
    alert("good");
    chrome.storage.sync.get('alphaapikey', function(result) {
        alert(result);
  });
})})
