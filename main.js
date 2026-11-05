// El Pinito: la vitrina de sabores, el pote que se arma, el ticket y el pedido por WhatsApp.
const P = window.PINITO;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const peso = (n) => `$ ${n.toLocaleString('es-AR')}`;
const FIELDS = ['var(--f-frut)', 'var(--f-pist)', 'var(--f-ddl)', 'var(--f-cielo)'];
const CREDITOS = ['“Gelato artigianale italiano, Bertinelli” de Basilicofresco (CC BY-SA 4.0)', '“Gelato ice cream” de rawpixel (CC0)', '“Delicious Gelato on display” de EquipmentAndConcepts (CC BY-SA 4.0)', '“Gelato in Italy” de Maksym Kozlenko (CC BY-SA 4.0)', '“Mango gelato” de Ruth Hartnup (CC BY 2.0)', '“Fruit sorbetto at Gelato Naia” de Ragesoss (CC BY-SA 3.0)', '“Ice cream in cones” de AlphaLemur (CC BY-SA 4.0)', '“2 ice cream cones” de Andy Li (CC0)', '“Cherry ice cream cone” de Jessica Rossi (CC BY-SA 2.0)', '“Cream caramel ice cream scooped up with a teaspoon” de W.carter (CC BY 4.0)', '“Helado” de Juanedc (CC BY 2.0)'];
const SABORES = P.familias.flatMap((f) => f.sabores.map((s) => ({ ...s, fam: f.id, famN: f.nombre })));
const GRANDES = ['Chocolate Pinito', 'Frutilla al agua', 'Dulce de leche granizado', 'Menta granizada', 'Sambayón', 'Frutos del bosque', 'Limón', 'Chocolate Dubái', 'Crema del cielo', 'Oreo'];

// Una bocha dibujada: la cúpula del color del sabor, un brillo y, si tiene, los trocitos
const CHECK = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const PLUS = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const DOME = 'M8 64 C6 30 32 6 60 6 C88 6 114 30 112 64 C106 70 99 62 92 69 C85 76 78 66 70 72 C62 78 56 67 48 72 C40 77 33 66 26 71 C18 75 12 68 8 64 Z';
function bocha(s, seed = 1) {
  let r = seed * 9301 + 49297;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  let chips = '';
  if (s.k) for (let i = 0; i < 11; i++) {
    const x = 22 + rnd() * 76, y = 18 + rnd() * 42, a = rnd() * 180;
    chips += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="6" height="3.4" rx="1.4" fill="${s.k}" transform="rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return `<path d="${DOME}" fill="${s.c}" stroke="rgba(0,0,0,.14)" stroke-width="1.5"/>${chips}<ellipse cx="40" cy="26" rx="15" ry="7" transform="rotate(-24 40 26)" fill="#fff" opacity=".38"/>`;
}

// Abierto ahora: según el horario de pedidos de su tienda online, en hora de Mendoza
function abierto() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Mendoza', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const min = Number(get('hour')) * 60 + Number(get('minute'));
  const ayer = (dia + 6) % 7;
  const cierraHoy = P.horario.cierra[dia] === 60 ? '01:00' : '00:15';
  const cierraAyer = P.horario.cierra[ayer] === 60 ? '01:00' : '00:15';
  if (min >= P.horario.abre) return { on: true, txt: `Pedidos abiertos · hasta las ${cierraHoy}` };
  if (min < P.horario.cierra[ayer]) return { on: true, txt: `Pedidos abiertos · hasta las ${cierraAyer}` };
  return { on: false, txt: 'Pedidos cerrados · desde las 12:00' };
}
function pintarAbierto() {
  const a = abierto();
  $$('[data-open]').forEach((el) => { el.classList.toggle('is-open', a.on); $('[data-open-txt]', el).textContent = a.txt; });
}
pintarAbierto();
setInterval(pintarAbierto, 60000);

// Hero: cada paleta cambia el color de todo el fondo
(() => {
  const hero = $('.hero');
  const slides = $$('.slide', hero);
  let i = 0, t = 0;
  const ir = (k) => {
    slides[i].classList.remove('on');
    i = k % slides.length;
    slides[i].classList.add('on');
    hero.style.setProperty('--hero', slides[i].dataset.bg);
  };
  let quieto = false;
  const loop = () => { clearInterval(t); if (!document.hidden && !quieto && !reduce) t = setInterval(() => ir(i + 1), 5200); };
  const pausa = (v) => () => { quieto = v; loop(); };
  hero.addEventListener('pointerenter', pausa(true)); hero.addEventListener('pointerleave', pausa(false));
  hero.addEventListener('focusin', pausa(true)); hero.addEventListener('focusout', pausa(false));
  document.addEventListener('visibilitychange', loop);
  loop();
})();

// La cinta de sabores (dos vueltas iguales para que el bucle no se note)
(() => {
  const elegidos = ['Chocolate Pinito', 'Sambayón', 'Frutilla al agua', 'Dulce de leche granizado', 'Menta granizada', 'Chocolate Dubái', 'Limón', 'Tiramisú', 'Crema del cielo', 'Maracuyá', 'Pistacho', 'Frutos del bosque'];
  const html = elegidos.map((n) => `<span>${n}<i style="--c:${SABORES.find((s) => s.n === n).c}"></i></span>`).join('');
  $('[data-cinta]').innerHTML = html + html;
})();

// Bochas flotando alrededor del pedestal; siguen un poco al mouse
(() => {
  const box = $('[data-floats]');
  const sueltas = [
    ['Frutilla al agua', '7%', '58%', '120px', 7], ['Menta granizada', '80%', '30%', '150px', 6],
    ['Chocolate Pinito', '84%', '74%', '110px', 8], ['Sambayón', '12%', '84%', '96px', 5.5], ['Crema del cielo', '27%', '40%', '74px', 6.5],
  ];
  box.innerHTML = sueltas.map(([n, x, y, s, t], i) => {
    const sab = SABORES.find((v) => v.n === n);
    return `<svg viewBox="0 0 120 80" style="left:${x};top:${y};--s:${s};--t:${t}s" data-depth="${(i % 3) + 1}"><g>${bocha(sab, i + 11)}</g></svg>`;
  }).join('');
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
    $$('svg', box).forEach((s) => { const d = Number(s.dataset.depth) * 14; s.style.setProperty('--mx', `${(-dx * d).toFixed(1)}px`); s.style.setProperty('--my', `${(-dy * d).toFixed(1)}px`); });
  });
})();

// La foto de la vitrina se acerca despacio mientras pasa
(() => {
  const img = $('[data-zoom]');
  if (reduce) return;
  let pend = false;
  const mover = () => {
    pend = false;
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    img.style.transform = `scale(${(1.16 - p * 0.14).toFixed(3)})`;
  };
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(mover); } }, { passive: true });
  mover();
})();

// Galería: se arrastra con el mouse (en el celular, con el dedo, de forma nativa)
(() => {
  const strip = $('[data-strip]');
  let x0 = 0, s0 = 0, on = false;
  strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; on = true; x0 = e.clientX; s0 = strip.scrollLeft; strip.classList.add('drag'); strip.setPointerCapture(e.pointerId); });
  strip.addEventListener('pointermove', (e) => { if (on) strip.scrollLeft = s0 - (e.clientX - x0); });
  const fin = () => { on = false; strip.classList.remove('drag'); };
  strip.addEventListener('pointerup', fin); strip.addEventListener('pointercancel', fin);
})();

// Créditos de las fotos de terceros, en el pie
$('[data-credits]').textContent = CREDITOS.join(' · ');

// Estado del pedido
const estado = {
  tam: P.potes[3],
  sabores: [],
  barq: 0,
  potes: [],
  items: new Map(),
};
const maxSab = () => estado.tam.sabores;

// La vitrina
// El campo rota, pero salta al siguiente si el color del sabor se parece demasiado
const FIELD_HEX = ['#FFC2CC', '#CFE3A8', '#F3D3A1', '#BFE3F5'];
const dist = (a, b) => { const h = (x, k) => parseInt(x.slice(k, k + 2), 16); return Math.hypot(h(a, 1) - h(b, 1), h(a, 3) - h(b, 3), h(a, 5) - h(b, 5)); };
function campo(c, i) {
  for (let k = 0; k < 4; k++) { const f = (i + k) % 4; if (dist(c, FIELD_HEX[f]) > 70) return FIELDS[f]; }
  return FIELDS[i % 4];
}
const tiles = $('[data-tiles]');
const filtros = $('.filters');
P.familias.forEach((f) => {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.fam = f.id; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = `${f.nombre}<small>${f.sabores.length}</small>`;
  filtros.append(b);
});
// Una batea de acero con el helado peinado en ondas, sus trocitos y la espátula (que entra al pasar o al elegir)
function tono(hex, k) {
  const n = (i) => parseInt(hex.slice(i, i + 2), 16);
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k).toString(16).padStart(2, '0');
  return `#${f(n(1))}${f(n(3))}${f(n(5))}`;
}
function batea(s, seed) {
  let r = seed * 7919 + 104729;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  let chips = '';
  if (s.k) for (let i = 0; i < 12; i++) {
    const x = 20 + rnd() * 80, y = 30 + rnd() * 28, g = rnd() * 180;
    chips += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="6" height="3.4" rx="1.4" fill="${s.k}" transform="rotate(${g.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const osc = tono(s.c, -0.24), cla = tono(s.c, 0.5);
  return `<path d="M10 64 C8 42 22 28 38 32 C46 18 68 12 80 26 C94 20 112 34 110 64 Z" fill="${s.c}"/>
    <path d="M16 58 C28 46 44 50 56 38 M44 62 C58 50 76 54 92 40 M12 64 C40 56 72 62 108 54" fill="none" stroke="${osc}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M22 50 C32 42 42 44 52 34 M54 54 C64 46 76 46 86 36" fill="none" stroke="${cla}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    ${chips}
    <rect x="4" y="60" width="112" height="9" rx="2.5" fill="#D9DEE1"/>
    <path d="M7 69 H113 L105 97 H15 Z" fill="#AEB6BB"/><path d="M12 72 H108" stroke="#C9CFD3" stroke-width="2"/>
    <g class="spat"><rect x="76" y="-18" width="7" height="44" rx="3" fill="#1E1E1E"/><path d="M71 24 H88 L86 50 H73 Z" fill="#E4E8EA" stroke="#9AA3A8" stroke-width="1.5"/></g>`;
}
P.familias.forEach((f, fi) => {
  const sec = document.createElement('section');
  sec.className = 'shelf'; sec.dataset.fam = f.id; sec.dataset.in = '';
  sec.innerHTML = `<h3 class="shelf-h">${f.nombre} <span>${f.sabores.length}</span></h3><ul class="row"></ul>`;
  const ul = $('.row', sec);
  f.sabores.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'cubeta';
    li.innerHTML = `<button type="button" aria-pressed="false" data-sabor="${s.n}" aria-label="${s.n}: sumar a tu pote">${s.casa ? '<span class="casa">El de la casa</span>' : ''}<svg viewBox="0 0 120 100" aria-hidden="true">${batea(s, fi * 40 + i + 3)}</svg><span class="chk" aria-hidden="true">${CHECK}</span></button><span class="nm">${s.n}</span>`;
    ul.append(li);
  });
  tiles.append(sec);
});
filtros.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  $$('button', filtros).forEach((x) => x.setAttribute('aria-pressed', x === b));
  const fam = b.dataset.fam;
  let n = 0;
  $$('.shelf', tiles).forEach((t) => { const ver = fam === 'todos' || t.dataset.fam === fam; t.hidden = !ver; if (ver) n += $$('.cubeta', t).length; });
  $('[data-count]').textContent = n;
});
tiles.addEventListener('click', (e) => {
  const b = e.target.closest('[data-sabor]');
  if (b) elegirSabor(b.dataset.sabor, b);
});

// Armá tu pote
const sizes = $('[data-sizes]');
P.potes.forEach((t) => {
  sizes.insertAdjacentHTML('beforeend', `<label><input type="radio" name="tam" value="${t.id}" ${t === estado.tam ? 'checked' : ''}><b>${t.n.replace('Pote de ', '')}</b><span>${peso(t.p)} · ${t.sabores} sabores</span></label>`);
});
sizes.addEventListener('change', (e) => {
  estado.tam = P.potes.find((t) => t.id === e.target.value);
  if (estado.sabores.length > maxSab()) estado.sabores.length = maxSab();
  todo();
});

function elegirSabor(n, desde) {
  const i = estado.sabores.indexOf(n);
  if (i >= 0) estado.sabores.splice(i, 1);
  else if (estado.sabores.length < maxSab()) estado.sabores.push(n);
  else { aviso(`Ya elegiste ${maxSab()} sabores. Sacá uno o elegí un pote más grande.`); return; }
  todo(i < 0 ? n : null);
  if (desde && i < 0) bump();
  if (i < 0 && estado.sabores.length === maxSab()) confites();
}
const left = $('[data-left]');
let avisoT = 0;
const toast = $('[data-toast]');
let toastT = 0;
function aviso(txt) {
  left.textContent = txt;
  toast.textContent = txt; toast.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 2800);
  clearTimeout(avisoT);
  avisoT = setTimeout(() => pintarLeft(), 2600);
}
function pintarLeft() {
  const f = maxSab() - estado.sabores.length;
  left.textContent = f ? `te ${f === 1 ? 'queda' : 'quedan'} ${f}` : 'pote completo';
}

const picked = $('[data-picked]');
function pintarElegidos() {
  picked.replaceChildren();
  if (!estado.sabores.length) { picked.innerHTML = '<li class="none">Tocá un sabor en la vitrina o buscalo acá abajo.</li>'; return; }
  estado.sabores.forEach((n) => {
    const s = SABORES.find((x) => x.n === n);
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-label="Sacar ${n}"><i style="--c:${s.c}"></i>${n}<span class="x" aria-hidden="true">×</span></button>`;
    li.firstChild.addEventListener('click', () => elegirSabor(n));
    picked.append(li);
  });
}

const search = $('[data-search]');
const finder = $('[data-finder]');
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function pintarFinder() {
  const q = norm(search.value.trim());
  finder.replaceChildren();
  SABORES.filter((s) => !q || norm(s.n).includes(q)).forEach((s) => {
    const on = estado.sabores.includes(s.n);
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-pressed="${on}" ${!on && estado.sabores.length >= maxSab() ? 'disabled' : ''}><i style="--c:${s.c}"></i>${s.n}</button>`;
    li.firstChild.addEventListener('click', () => elegirSabor(s.n));
    finder.append(li);
  });
}
search.addEventListener('input', pintarFinder);

function confites() {
  if (reduce) return;
  const viz = $('.pote-viz');
  const cols = ['#C81B41', '#F6D55C', '#3D8BFF', '#7FC97F', '#F79B3A', '#9A6BFF', '#FFC2CC'];
  for (let k = 0; k < 28; k++) {
    const c = document.createElement('i');
    c.className = 'confite';
    c.style.background = cols[k % cols.length];
    viz.append(c);
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 160;
    c.animate([
      { transform: 'translate(-50%, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), ${Math.sin(a) * d * 0.6 - 60}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.1}px), ${Math.sin(a) * d * 0.6 + 220}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
    ], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => c.remove();
  }
}

// El pote: las bochas caen una por una; el tamaño cambia la escala
const scoopsG = $('[data-scoops]');
const POS = {
  1: [[70, 66]],
  2: [[22, 72], [118, 72]],
  3: [[20, 74], [120, 74], [70, 34]],
  4: [[20, 74], [120, 74], [70, 34], [70, -6]],
};
function pintarPote(nueva) {
  const n = estado.sabores.length;
  scoopsG.replaceChildren();
  if (!n) POS[maxSab()].forEach(([x, y]) => { scoopsG.insertAdjacentHTML('beforeend', `<g transform="translate(${x} ${y})"><path class="ghost" d="${DOME}"/></g>`); });
  estado.sabores.forEach((name, i) => {
    const s = SABORES.find((x) => x.n === name);
    const [x, y] = POS[n][i];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="scoop${name === nueva ? ' drop' : ''}">${bocha(s, i + 7)}</g>`;
    scoopsG.append(g);
  });
  $('[data-pote-scale]').style.transform = `scale(${0.72 + estado.tam.alto * 0.28})`;
}

$('[data-barq-n]').value = 0;
$$('[data-barq]').forEach((b) => b.addEventListener('click', () => {
  estado.barq = Math.max(0, Math.min(40, estado.barq + Number(b.dataset.barq)));
  $('[data-barq-n]').value = estado.barq;
  todo();
}));
$('[data-add-pote]').addEventListener('click', () => {
  if (!estado.sabores.length) { aviso('Elegí al menos un sabor.'); return; }
  estado.potes.push({ tam: estado.tam, sabores: [...estado.sabores] });
  estado.sabores = [];
  todo();
  bump();
});

// La carta
// Para lo que no tiene foto: una bocha del color del producto, o una botella para las bebidas
const CARTA_F = ['var(--f-frut)', 'var(--f-pist)', 'var(--f-cielo)', 'var(--f-limon)'];
const COLOR = { Pikachu: '#F6D55C', Chanchito: '#F4A3B4', 'Pepa Pig': '#F7C6DD', Casata: '#E9B8C6', Almendrado: '#EBD9B4', 'Capuchino negro': '#4A2618', 'Capuchino de pistacho': '#B5C98A', Agua: '#BFE3F5', 'Coca-Cola': '#E0284F', Fanta: '#F79B3A', Sprite: '#7FC97F', 'Cerveza Corona': '#F2C230' };
function dibujo(it, grupo) {
  const c = COLOR[it.n] || '#F3D3A1';
  return `<b>${it.n[0]}</b>`;
  if (grupo === 'bebidas') return `<svg viewBox="0 0 40 60"><path d="M15 4h10v8c5 3 7 7 7 12v30a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V24c0-5 2-9 7-12z" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/><rect x="8" y="30" width="24" height="12" fill="#fff" opacity=".55"/></svg>`;
  return `<svg viewBox="0 0 120 80">${bocha({ c }, it.n.length)}</svg>`;
}
const carta = $('[data-carta]');
const nav = $('[data-carta-nav]');
const grupos = [
  { id: 'potes', nombre: 'Potes', items: [...P.potes.map((t) => ({ n: t.n, d: `${t.sabores} sabores a elección.`, p: t.p, pote: t.id, img: { p300: 'pote-300-gramos', p500: 'pote-12-kg', p750: 'pote-de-34-kg', p1000: 'pote-1-kg' }[t.id] })), { n: 'Barquillo', d: 'Cono de helado clásico. Ligero y crujiente.', p: P.barquillo, img: 'barquillo', barq: true }] },
  ...P.carta,
];
grupos.forEach((g, gi) => {
  nav.insertAdjacentHTML('beforeend', `<a href="#c-${g.id}">${g.nombre}</a>`);
  const sec = document.createElement('div');
  sec.className = 'cgroup'; sec.id = `c-${g.id}`;
  sec.innerHTML = `<div class="cgroup-h"><h3>${g.nombre}</h3><span>${g.items.length}</span></div><ul class="items"></ul>`;
  const ul = $('.items', sec);
  g.items.forEach((it, i) => {
    const li = document.createElement('li');
    li.className = 'item'; li.dataset.in = ''; li.style.setProperty('--d', i % 6);
    const ph = it.img
      ? `<span class="ph" style="--f:${CARTA_F[(i + gi) % 4]}"><img src="assets/productos/${it.img}.jpg" width="800" height="800" alt="" loading="lazy"></span>`
      : `<span class="ph drawn" style="--f:${CARTA_F[(i + gi) % 4]}" aria-hidden="true">${dibujo(it, g.id)}</span>`;
    const label = it.pote ? `Armar ${it.n}` : `Sumar ${it.n} al pedido`;
    li.innerHTML = `${ph}<div class="top"><b>${it.n}</b><span>${peso(it.p)}</span></div>${it.d ? `<p>${it.d}</p>` : ''}<button type="button" class="add" aria-label="${label}">${PLUS}</button>`;
    $('.add', li).addEventListener('click', (e) => {
      if (it.pote) {
        estado.tam = P.potes.find((t) => t.id === it.pote);
        $(`input[value="${it.pote}"]`).checked = true;
        if (estado.sabores.length > maxSab()) estado.sabores.length = maxSab();
        todo();
        $('#pote').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      if (it.barq) { estado.barq++; $('[data-barq-n]').value = estado.barq; }
      else sumarItem(g.id === 'paletas' ? `Paleta ${it.n}` : it.n, it.p);
      todo();
      bump();
      const b = e.currentTarget; b.classList.add('ok'); b.innerHTML = CHECK;
      setTimeout(() => { b.classList.remove('ok'); b.innerHTML = PLUS; }, 900);
    });
    ul.append(li);
  });
  carta.append(sec);
});
function sumarItem(n, p) {
  const it = estado.items.get(n) || { n, p, q: 0 };
  it.q++;
  estado.items.set(n, it);
}

// Las paletas: lista de nombres, disco de color y la foto
(() => {
  const conFoto = P.carta[0].items.filter((x) => x.img);
  const colores = ['#FFC2CC', '#F3D3A1', '#CFE3A8', '#BFE3F5', '#F6EE9A', '#FFC2CC', '#8EBAA0', '#F3D3A1', '#BFE3F5', '#CFE3A8', '#F6EE9A'];
  const ul = $('[data-names]');
  const img = $('[data-disc-img]');
  let actual = conFoto[0];
  conFoto.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-pressed="${i === 0}">${p.n}</button>`;
    li.firstChild.addEventListener('click', (e) => {
      $$('button', ul).forEach((x) => x.setAttribute('aria-pressed', x === e.currentTarget));
      actual = p;
      $('[data-disc]').style.setProperty('--disc', colores[i]);
      $('[data-disc-price]').textContent = peso(p.p);
      $('[data-disc-desc]').textContent = p.d || ' ';
      img.classList.add('out');
      setTimeout(() => { img.src = `assets/productos/${p.img}.jpg`; img.alt = `Paleta ${p.n}`; img.classList.remove('out'); }, reduce ? 0 : 280);
    });
    ul.append(li);
  });
  $('[data-disc-add]').addEventListener('click', () => { sumarItem(`Paleta ${actual.n}`, actual.p); todo(); bump(); });
})();

$('[data-promo]').addEventListener('click', () => {
  estado.tam = P.potes.find((t) => t.promo);
  $('input[value="promo"]').checked = true;
  todo();
  $('#pote').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
});

// El ticket y el mensaje de WhatsApp
const rows = $('[data-rows]');
let antes = new Set();
function lineas() {
  const L = [];
  estado.potes.forEach((p, i) => L.push({ id: `pote${i}`, t: p.tam.n, p: p.tam.p, sub: p.sabores.join(', '), del: () => estado.potes.splice(i, 1) }));
  if (estado.sabores.length) L.push({ id: 'draft', t: estado.tam.n, p: estado.tam.p, sub: estado.sabores.join(', '), draft: true, del: () => { estado.sabores = []; } });
  estado.items.forEach((it) => L.push({ id: it.n, t: `${it.q > 1 ? `${it.q} × ` : ''}${it.n}`, p: it.p * it.q, del: () => estado.items.delete(it.n) }));
  if (estado.barq) L.push({ id: 'barq', t: `${estado.barq} barquillo${estado.barq > 1 ? 's' : ''}`, p: estado.barq * P.barquillo, del: () => { estado.barq = 0; $('[data-barq-n]').value = 0; } });
  return L;
}
function pintarTicket() {
  const L = lineas();
  const total = L.reduce((s, l) => s + l.p, 0);
  rows.replaceChildren();
  if (!L.length) rows.innerHTML = '<li class="empty">Elegí un tamaño y tus sabores.</li>';
  const ahora = new Set();
  L.forEach((l) => {
    ahora.add(l.id);
    const li = document.createElement('li');
    if (l.draft) li.className = 'draft';
    if (!antes.has(l.id)) li.classList.add('new');
    li.innerHTML = `<b></b><span>${peso(l.p)}</span>${l.sub ? '<small></small>' : ''}<button type="button" class="rm">quitar</button>`;
    $('.rm', li).setAttribute('aria-label', `Quitar ${l.t}`);
    $('.rm', li).addEventListener('click', () => { l.del(); todo(); });
    $('b', li).textContent = l.t;
    if (l.sub) $('small', li).textContent = l.sub;
    rows.append(li);
  });
  antes = ahora;
  $('[data-total]').textContent = peso(total);
  const wa = $('[data-wa]');
  if (!L.length) { wa.setAttribute('aria-disabled', 'true'); wa.removeAttribute('href'); }
  else {
    wa.removeAttribute('aria-disabled');
    const txt = ['¡Hola El Pinito! Quiero hacer este pedido:', ...L.map((l) => `• ${l.t}${l.sub ? `: ${l.sub}` : ''} (${peso(l.p)})`), `Total: ${peso(total)}`].join('\n');
    wa.href = `https://wa.me/${P.whatsapp}?text=${encodeURIComponent(txt)}`;
  }
  const bag = $('[data-bag]');
  const cant = estado.potes.length + (estado.sabores.length ? 1 : 0) + [...estado.items.values()].reduce((s, i) => s + i.q, 0) + (estado.barq ? 1 : 0);
  bag.hidden = !cant;
  $('[data-bag-n]').textContent = cant;
  $('[data-bag-t]').textContent = peso(total);
}
function bump() {
  const b = $('[data-bag]');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}

// Todo junto: cada cambio repinta vitrina, pote, buscador y ticket
function todo(nueva = null) {
  $$('[data-sabor]').forEach((b) => b.setAttribute('aria-pressed', estado.sabores.includes(b.dataset.sabor)));
  pintarLeft();
  pintarElegidos();
  pintarFinder();
  pintarPote(nueva);
  pintarTicket();
}
todo();

// El pedido flotante se corre mientras el ticket está a la vista
new IntersectionObserver(([e]) => $('[data-bag]').classList.toggle('away', e.isIntersecting), { threshold: 0.15 }).observe($('#pote'));

// Entradas: los bloques aparecen una vez al llegar
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
$$('[data-in]').forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', i % 6); io.observe(el); });
