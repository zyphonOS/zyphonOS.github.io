(function(){
  var b=document.querySelector('.navtoggle'), n=document.getElementById('nav');
  if(!b||!n) return;
  b.addEventListener('click',function(){
    var open = n.classList.toggle('is-open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.textContent = open ? 'Close' : 'Menu';
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && n.classList.contains('is-open')){
      n.classList.remove('is-open'); b.setAttribute('aria-expanded','false');
      b.textContent='Menu'; b.focus();
    }
  });
})();
