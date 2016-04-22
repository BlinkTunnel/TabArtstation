/**
 * Created by winkidney on 2016/4/29.
 */
jQuery.browser = {};
(function () {

    jQuery.browser.msie = false;
    jQuery.browser.version = 0;

    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();

(function(){
    var rssURL = "https://www.artstation.com/artwork.rss";
    var feedGlobal;
    var currentBg;

    function setBg(imgURL){
      var ele = jQuery("#wallpaper").eq(0);
      ele.attr("src", "");
      ele.attr("src", imgURL);
    }

    function setLink(postLink){
      var ele = jQuery(".link").eq(0);
      ele.attr("href", postLink);
      jQuery(".link-desc").eq(0).text(postLink);
    }

    function setTitle(title){
      jQuery(".title").eq(0).text(title);
    }

    function setDescription(description){
      jQuery(".description").eq(0).text(description);
    }

    function randomIntFromZero(max){
      return Math.floor((Math.random() * max));
    }

    function randomBg(items){
      var itemIndex = randomIntFromZero(items.length);
      var item = items[itemIndex];
      var images = item.images;
      return {
        item: item,
        image:images[randomIntFromZero(images.length)]
        }
    }

    function parseImageUrl(item) {
      var content = jQuery(item._element).find("encoded").eq(0);
      var html = jQuery.parseHTML(content.text());
      var images = $(html).find("img").not(".emoji");
      item.images = [];
      for (var i = 0;i < images.length; i++){
        item.images.push(images[i].src);
      }
    }

    var Store = {
      save: function(feed){
        var serializedFeed = JSON.stringify(feed);
        localStorage.setItem("feed", serializedFeed);
        localStorage.setItem("saveDate", new Date().toDateString())
      },
      load: function(){
        var serializedFeed = localStorage.getItem("feed");
        return JSON.parse(serializedFeed);
      },
      isNotExpired: function(){
        return localStorage.getItem("saveDate") === new Date().toDateString();
      }
    };

    function handleFeeds(feed){
      var bgObject = randomBg(feed.items);
      var item = bgObject.item;
      setBg(bgObject.image);
      setLink(item.link);
      setTitle(item.title);
      setDescription(item.description);
      currentBg = bgObject;
    }

    function onSuccess(feed) {
      for (var i=0; i < feed.items.length; i++){
        parseImageUrl(feed.items[i]);
      }
      handleFeeds(feed);
      Store.save(feed);
      feedGlobal = feed;
    }

    function refresh(){
        handleFeeds(feedGlobal);
        var ele = jQuery("#random").eq(0);
        if (ele.hasClass("active")){
          ele.removeClass("active");
        }else{
          ele.addClass("active");
        }
    }

    function download() {
      window.open(currentBg.image);
    }

    function bindRefreshEvent(){
      jQuery("#random").bind(
        "click",
        refresh
      )
    }

    function bindDownloadEvent(){
      jQuery(".save-wrapper").bind(
        "click",
        download
      )
    }

    function init(){
      if (!Store.isNotExpired()){
        jQuery.getFeed({
            url: rssURL,
            success: onSuccess
        });
      }else{
        feedGlobal = Store.load();
        handleFeeds(feedGlobal);
      }
      bindRefreshEvent();
      bindDownloadEvent();
    }

    init();
  }
)();

