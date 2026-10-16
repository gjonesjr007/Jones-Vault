/* JONES VAULT v11: invitation-only Supabase Auth. No service-role key. */
(() => {
  'use strict';
  const cfg = window.JONES_AUTH || {};
  const base = (cfg.supabaseUrl || '').replace(/\/$/, '');
  const key = cfg.publishableKey || '';
  const ready = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) && key && !key.startsWith('YOUR_');
  const $ = id => document.getElementById(id);
  const message = (text, error=false) => { $('auth-message').textContent=text; $('auth-message').className='auth-message '+(error?'error':'success'); };
  const storeKey = 'jones-vault-auth-session';
  let session = null, mode='login';
  function save(s) { session=s; if(s) sessionStorage.setItem(storeKey, JSON.stringify(s)); else sessionStorage.removeItem(storeKey); }
  async function request(path, method='GET', body, accessToken) {
    const res=await fetch(base+'/auth/v1/'+path,{method,headers:{'apikey':key,'Content-Type':'application/json',...(accessToken?{'Authorization':'Bearer '+accessToken}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.msg || data.error_description || data.message || data.error || ('Authentication error '+res.status));
    return data;
  }
  function show() { document.documentElement.classList.add('jv-authenticated'); }
  function hide() { document.documentElement.classList.remove('jv-authenticated'); }
  function setMode(next) {
    mode=next;
    $('auth-email').parentElement.style.display=next==='set-password'?'none':'';
    $('auth-email').required=next!=='set-password';
    $('auth-password-wrap').style.display=next==='reset'?'none':'';
    $('auth-password').required=next!=='reset';
    $('auth-password').autocomplete=next==='set-password'?'new-password':'current-password';
    $('auth-submit').textContent=next==='set-password'?'SET PASSWORD & ENTER':next==='reset'?'SEND RECOVERY EMAIL':'ENTER THE VAULT';
    $('auth-reset').textContent=next==='login'?'Forgot password?':'Back to sign in';
    $('auth-intro').textContent=next==='set-password'?'Choose a new password to activate your invitation.':next==='reset'?'Request a password recovery email.':'Sign in to access the family blueprint.';
  }
  async function refresh() {
    if(!session?.refresh_token) return false;
    try {const s=await request('token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}); save(s); return !!s.access_token;} catch {save(null); return false;}
  }
  async function checkSession() {
    if(!session?.access_token) return false;
    try {await request('user','GET',null,session.access_token);return true;} catch {return await refresh();}
  }
  async function init() {
    if(!ready){message('Setup required: edit auth-config.js with your Supabase Project URL and publishable/anon key. Never use a service-role key.',true);$('auth-submit').disabled=true;return;}
    const hash=new URLSearchParams(location.hash.slice(1));
    const token=hash.get('access_token'), refreshToken=hash.get('refresh_token'), kind=hash.get('type');
    if(token || refreshToken) {
      history.replaceState(null,'',location.pathname+location.search);
      if(token && refreshToken) {save({access_token:token,refresh_token:refreshToken}); if(kind==='invite'||kind==='recovery'){setMode('set-password');message('Your link was received. Choose a new password.');return;}}
      else {message('Incomplete authentication link. Request a fresh invitation.',true);return;}
    }
    try {session=JSON.parse(sessionStorage.getItem(storeKey)||'null');} catch {save(null);}
    if(await checkSession()) show(); else {hide();setMode('login');}
  }
  $('auth-form').addEventListener('submit',async e=>{
    e.preventDefault(); if(!ready)return;
    const btn=$('auth-submit');btn.disabled=true;message('Working…');
    try {
      if(mode==='reset') {
        await request('recover','POST',{email:$('auth-email').value});
        message('If the account exists, a recovery email will arrive.');
      } else if(mode==='set-password') {
        if(!session?.access_token) throw new Error('Invitation expired. Request a new link.');
        const password=$('auth-password').value;
        if(password.length<12)throw new Error('Use a password of at least 12 characters.');
        await request('user','PUT',{password},session.access_token);
        if(!await checkSession())throw new Error('Password updated, but the session expired. Sign in again.');
        show();message('Password updated.');
      } else {
        const s=await request('token?grant_type=password','POST',{email:$('auth-email').value,password:$('auth-password').value});
        save(s);show();message('Signed in.');
      }
      $('auth-password').value='';
    } catch(err) {message(err.message || 'Unable to sign in.',true);} finally {btn.disabled=false;}
  });
  $('auth-reset').addEventListener('click',()=>{setMode(mode==='login'?'reset':'login');message('');});
  $('vault-logout').addEventListener('click',async()=>{
    const token=session?.access_token;
    try {if(token) await request('logout?scope=global','POST',{},token);} catch {}
    save(null);hide();setMode('login');message('Signed out.');
  });
  init().catch(err=>message(err.message,true));
})();
