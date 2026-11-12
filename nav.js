(function(){
  var b=document.querySelector('.navtoggle'),n=document.getElementById('nav');
  if(!b||!n)return;
  function set(open){n.setAttribute('data-open',open?'true':'false');b.setAttribute('aria-expanded',open?'true':'false');}
  set(false);
  b.addEventListener('click',function(){set(n.getAttribute('data-open')!=='true');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.getAttribute('data-open')==='true'){set(false);b.focus();}});
  n.addEventListener('click',function(e){if(e.target.tagName==='A'&&window.innerWidth<820)set(false);});
})();
