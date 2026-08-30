// Soft access gate for the friends & family beta. This is NOT real security --
// it's a shared passphrase to keep the beta link from being casually stumbled
// on while it's unlisted. Anyone determined to view the source can find the
// passphrase; that's an accepted tradeoff for a static, no-backend site.

const GATE_KEY = "media-minder-gate-v1";
const PASSPHRASE = "showtime";

export function isUnlocked(){
  try{ return localStorage.getItem(GATE_KEY) === "true"; }
  catch{ return false; }
}

export function unlock(){
  try{ localStorage.setItem(GATE_KEY, "true"); }catch{}
}

export function renderGate(onUnlock){
  const app = document.getElementById("app");
  app.innerHTML = `<div class="app-main">
    <section class="card stack" style="max-width:400px;margin:15vh auto 0;text-align:center">
      <img class="tv-icon gate-icon" src="./assets/branding/approved/icon-tv-coral-stripe.svg" alt="" aria-hidden="true">
      <div class="page-kicker">MEDIA MINDER</div>
      <h1 class="page-title" style="font-size:2rem">Private beta</h1>
      <div class="retro-rule" style="max-width:160px;margin:0 auto 1rem"></div>
      <p class="muted">Enter the passphrase you were given to continue.</p>
      <div class="search-box">
        <input id="gate-passphrase" type="password" placeholder="Passphrase" autocomplete="off">
        <button class="btn" id="gate-submit">Enter</button>
      </div>
      <p class="muted" id="gate-error" hidden>That's not quite right. Try again.</p>
    </section>
  </div>`;

  const input = document.getElementById("gate-passphrase");
  const error = document.getElementById("gate-error");
  const submit = document.getElementById("gate-submit");

  function attempt(){
    const value = input.value.trim().toLowerCase();
    if(value === PASSPHRASE.toLowerCase()){
      onUnlock();
    }else{
      error.hidden = false;
      input.value = "";
      input.focus();
    }
  }

  submit.onclick = attempt;
  input.addEventListener("keydown", event => { if(event.key === "Enter") attempt(); });
  input.focus();
}
