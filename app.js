document.addEventListener('click',e=>{const b=e.target.closest('[data-notice]');if(b){e.preventDefault();document.querySelector(b.dataset.notice)?.scrollIntoView({behavior:'smooth'});}});
