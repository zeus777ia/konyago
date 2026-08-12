/* KonyaGo brand logo injector */
(function(){
  var LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQDAwMDAgQDAwMEBAQFBgoGBgUFBgwICQcKFxcZEhMQEyccGh0dHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fH/2wBDAQQEBAYFBgsGBgsYDw0PGBYYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY/wAARCAEAAQADASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAgMBBAUGBwAICf/EAEkQAAIBAwMCBAMFBQUFBgcBAAECAwAEERIhBTFBBhMiUWFxMoEUI0JSkQcVM2KhsRYkcsHwJDTS8BZD4fEWJTM1gqLi/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EAC0RAAICAQMDAwMEAwEAAAAAAAABAhEDEiExBEFRImETcYGRoTKx8PEUwfH/2gAMAwEAAhEDEQA/APooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==";
  function apply(){
    document.querySelectorAll("img.logo-mark, img.hero-eagle").forEach(function(el){
      el.src = LOGO;
      el.alt = el.alt || "KonyaGo";
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
