var bibleApp = {
  $searchOption: $("#search"),
  $readOption: $("#reference"),
  $button: $("#btn"),
  $inputBox: $("#searchInput"),
  $info: $("#info"),
  $scroll: $("#container"),
  $searchList: $("#searchListContainer"),

  //function to validate input
  inputIsNotValid: function(input) {
    if(!input.trim()) {
      return true;
    }
    return false;
  },

  setInputFocus: function() {
    (bibleApp.$inputBox).focus();
  },
  //function to check whether to search or open Bible passage
  checkOption: function() {
    option = this.value;
    bibleApp.setInputFocus();
    if(this.value==="search") {
      bibleApp.$button.attr("value", "Search");
      bibleApp.$inputBox.attr("placeholder", "In the beginning...");
      bibleApp.$info.text("Type text to search");
    } 
    else {
      bibleApp.$button.attr("value", "Open");
      bibleApp.$inputBox.attr("placeholder", "Gen 1:1");
      bibleApp.$info.text("Type a passage to open");
    }// end of conditions  
  },

  //method to show progress
  showProgess: function() {
    this.$info.text("Please wait...");
    this.$inputBox.prop("disabled", true);
    this.$button.attr("disabled", true).val(this.$button.val() + "ing...");
  },

  getData: function() {
    var input = this.$inputBox.val();
    if(this.inputIsNotValid(input)) {
      this.$info.text("Please check your input.");
      return;
    }
    this.showProgess();
    if(option === "content") {
      var url = "http://api.biblia.com/v1/bible/content/DARBY.html.json";
      var data = {
        passage: input,
        style: "fullyFormattedWithFootnotes",
        key: "517d06fdbe90e270534625197ed15845"
      };
      var callback = function(verse) {
        var display = '<div id="content">' + verse.text + '</div>';
        bibleApp.$scroll.html(display);
        bibleApp.$inputBox.prop("disabled", false);
        bibleApp.$button.attr("disabled", false).val("Open");
        bibleApp.$info.text("Type a passage to open");
        if(searchOpen) {
          bibleApp.$scroll.width("44%").css("left", "1%");
        }
        else {
          bibleApp.$scroll.width("50%").css("left", "12%");
        }
        scrollOpen = true;
      }; //end of callback
    }//end of if option = content
    else { //option= "search"
      var url = "http://api.biblia.com/v1/bible/search/DARBY.js";
      var data = {
        query: input,
        sort: "passage",
        key: "517d06fdbe90e270534625197ed15845"
      };
      var callback = function(response) {
        var responseHTML = '<p id="searchHeader"><strong>Search Results</strong> (' + response.hitCount + ' hits; ' + response.resultCount + ' verses)</p>';
        responseHTML += '<ul>';
        $.each(response.results, function(index, verse) {
          responseHTML += '<li>' + verse.title + '<p class="preview">' + verse.preview + '</p></li>';
        });
        responseHTML += '</ul>';
        bibleApp.$searchList.html(responseHTML);
        bibleApp.$inputBox.prop("disabled", false);
        bibleApp.$button.attr("disabled", false).val("Search");
        bibleApp.$info.text("Type text to search");
        bibleApp.$searchList.slideDown("slow");
        if(scrollOpen) {
          bibleApp.$scroll.width("44%").css("left", "1%");
        }
        searchOpen = true; 
      };
    }
    $.getJSON(url, data, callback).fail(bibleApp.failEvent);
  },

  //method to handle failure
  failEvent: function(error) {
    var errorMsg
    if(error.status === 0) {
      errorMsg = "Please check your internet connection.";
    }
    else if (error.status === 404) {
      errorMsg = "Passage not found. Please check your input.";
    }
    else if (error.status === 500) {
      errorMsg = "Server error. Please try again later.";
    }
    else {
      errorMsg = "Looks like there's a little hiccup: (" + error.status + ":" + error.statusText + ")";
    }
    bibleApp.$info.text(errorMsg);
    bibleApp.$inputBox.prop("disabled", false);
    bibleApp.$button.attr("disabled", false).val("Retry");
  }
}

$(document).ready(function() {
  option = "search";
  scrollOpen = false;
  searchOpen = false;
  bibleApp.$searchList.hide();
  bibleApp.$info.hover(bibleApp.setInputFocus);
  bibleApp.$searchOption.click(bibleApp.checkOption);
  bibleApp.$readOption.click(bibleApp.checkOption);
  bibleApp.$button.click(bibleApp.getData.bind(bibleApp));
}); //end of document.ready