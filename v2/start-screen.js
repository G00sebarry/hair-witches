const howButton=document.getElementById('howToPlay'),help=document.getElementById('tutorial'),closeHelp=document.getElementById('closeTutorial');
function setHelp(open){help.hidden=!open;document.getElementById('heroCopy').hidden=open;howButton.setAttribute('aria-expanded',String(open));(open?closeHelp:howButton).focus();}
howButton.onclick=()=>setHelp(true);closeHelp.onclick=()=>setHelp(false);
document.getElementById('menu').addEventListener('keydown',e=>{if(!help.hidden&&e.key==='Escape'){e.stopPropagation();setHelp(false);}});
