      const $ = (q) => document.querySelector(q),
        php = (n) => "₱" + Math.round(n).toLocaleString(),
        pad = (n) => String(n).padStart(2, "0"),
        fmt = (d) =>
          d.getFullYear() +
          "-" +
          pad(d.getMonth() + 1) +
          "-" +
          pad(d.getDate()),
        today = () => fmt(new Date()),
        esc = (s) =>
          String(s ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;"),
        key = (a) => a.date + String(a.start).padStart(4, "0");
      const m2t = (m) => {
        const h = Math.floor(m / 60);
        return (h % 12 || 12) + ":" + pad(m % 60) + (h < 12 ? " AM" : " PM");
      };
      const durT = (m) =>
        m >= 60
          ? +(m / 60).toFixed(2) + (m === 60 ? " hr" : " hrs")
          : m + " min";

      const hsl = (h, s, l) => {
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
          const k = (n + h / 30) % 12;
          const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
          return Math.round(255 * c).toString(16).padStart(2, "0");
        };
        return "#" + f(0) + f(8) + f(4);
      };
      const svgArt = (s) => {
        const n = String(s.n || ""), g = String(s.g || "");
        const hue = (n.length * 37 + g.length * 11 + (Number(s.id) || 0) * 17) % 360;
        const colors = [
          hsl(hue, 68, 76), hsl((hue + 35) % 360, 62, 70),
          hsl((hue + 320) % 360, 58, 82), hsl((hue + 70) % 360, 55, 74),
          hsl((hue + 200) % 360, 50, 80)
        ];
        const bg = hsl(hue, 45, 94), skin = "#f2cdb8";
        const isGel = /Gel|BIAB|Soft|Luxury|Glam|Self-Care|Pamper/i.test(n);
        const isExtension = /Extension|BIAB|Luxury/i.test(n);
        const isFoot = /Pedi|Footspa/i.test(n) && !/Mani/i.test(n);
        const isRemoval = g === "Removal" || /Remov/i.test(n);
        const isKids = /Kids/i.test(n);
        const isPackage = g === "Packages" || /\+/.test(n);
        const star = (x, y, r) =>
          `<path d="M${x} ${y-r}L${x+r*.3} ${y-r*.3}L${x+r} ${y}L${x+r*.3} ${y+r*.3}L${x} ${y+r}L${x-r*.3} ${y+r*.3}L${x-r} ${y}L${x-r*.3} ${y-r*.3}Z" fill="#fff" opacity=".9"/>`;
        let art = `<rect width="160" height="120" fill="${bg}"/><circle cx="140" cy="18" r="30" fill="${colors[2]}" opacity=".5"/><circle cx="14" cy="108" r="26" fill="${colors[1]}" opacity=".35"/>`;
        if (isFoot) {
          art += `<ellipse cx="80" cy="88" rx="44" ry="26" fill="${skin}"/>`;
          art += [0,1,2,3,4].map(i => {
            const x = 44 + i * 18, y = 52 + Math.abs(i - 1) * 5 - (i === 0 ? 4 : 0);
            return `<circle cx="${x}" cy="${y}" r="${i===0?10:8}" fill="${skin}"/><circle cx="${x}" cy="${y-3}" r="${i===0?6:4.5}" fill="${colors[i%5]}"/>${isGel?`<circle cx="${x-2}" cy="${y-5}" r="1.6" fill="#fff" opacity=".8"/>`:""}`;
          }).join("");
          if (/Footspa/i.test(n)) art += `<path d="M10 100Q30 90 50 100T90 100T130 100T170 100V120H10Z" fill="#8ec9e6" opacity=".8"/>`;
        } else if (isRemoval) {
          art += `<rect x="64" y="40" width="32" height="64" rx="16" fill="${skin}"/><rect x="68" y="44" width="24" height="26" rx="10" fill="#f6e3d8"/><ellipse cx="108" cy="78" rx="22" ry="14" fill="#fff"/><path d="M40 30Q44 40 40 46Q36 40 40 30Z" fill="#7fc4e8"/>${star(122,38,7)}`;
        } else {
          const heights = [50,66,74,64,46];
          art += heights.map((height, i) => {
            const x = 18 + i * 28, y = 100 - height, nailHeight = (isExtension ? 36 : isKids ? 18 : 24) + (i === 2 ? 4 : 0);
            const color = colors[(i + (isKids ? 1 : 0)) % 5];
            return `<rect x="${x}" y="${y}" width="24" height="${height+24}" rx="12" fill="${skin}"/>${isExtension?`<path d="M${x+3} ${y+nailHeight} Q${x+3} ${y-10} ${x+12} ${y-14} Q${x+21} ${y-10} ${x+21} ${y+nailHeight}Z" fill="${color}"/>`:`<rect x="${x+3}" y="${y+4}" width="18" height="${nailHeight}" rx="8" fill="${color}"/>`}${isGel?`<rect x="${x+6}" y="${y+7}" width="3.5" height="${Math.max(8,nailHeight-8)}" rx="2" fill="#fff" opacity=".65"/>`:""}`;
          }).join("");
          if (isKids) art += star(132,26,9) + star(24,28,6);
        }
        if (isPackage) art += star(138,30,10) + star(22,24,7) + star(128,96,6);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">${art}</svg>`;
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      };
      const svImg = (s) => {
        const candidate = s.image_url || s.imageUrl || s.photo_url || s.img || "";
        return typeof candidate === "string" && /^(https?:\/\/|data:image\/)/i.test(candidate)
          ? candidate
          : svgArt(s);
      };
      function togglePassword(id, button) {
        const input = document.getElementById(id);
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
        if (button) button.textContent = input.type === "password" ? "Show" : "Hide";
      }

      const GR = [
          "Basic Care",
          "Gel Services",
          "Relaxation",
          "Nail Enhancements",
          "Packages",
          "Removal",
          "Nail Art Add-Ons",
          "Per Nail Add-Ons",
        ],
        GN = {
          "Per Nail Add-Ons":
            "Price per nail. Only applies if you prefer not to get a full set of nail art.",
        };
      const SV = [],
        TE0 = [];
      
      // In-memory view of server data (hydrated by boot()). Nothing is persisted in localStorage.
      let DB = {
        SV, TE: TE0, hours: { o: 600, c: 1110, ls: 720, le: 780 }, openDays: [1, 2, 3, 4, 5, 6],
        owner: null, sms: [], off: [], appts: [], q: [], users: [], staff: [], backup: null,
        deposit: 250, test: true,
      };
      const TE = DB.TE;
      const save = () => {};
      
      
      
      function sms(a, type, msg) {
        DB.sms = DB.sms || [];
        DB.sms.push({ t: Date.now(), to: a.phone, code: a.code, type, msg });
        if (DB.sms.length > 200) DB.sms.splice(0, DB.sms.length - 200);
        save();
      }
      const SVA = () => DB.SV.filter((s) => s.on !== false),
        DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const openTxt = () => {
        const d = [...DB.openDays].sort((a, b) => a - b),
          r = [];
        d.forEach((x) => {
          const l = r[r.length - 1];
          if (l && l[1] === x - 1) l[1] = x;
          else r.push([x, x]);
        });
        return (
          r
            .map(([a, b]) =>
              a === b
                ? DN[a]
                : b === a + 1
                  ? DN[a] + " and " + DN[b]
                  : DN[a] + " to " + DN[b],
            )
            .join(", ") || "by appointment"
        );
      };
      
      
      const sess = () => null;

      
      let V = "customer",
        P = "home",
        U = null,
        ST = null,
        B = { step: 0 },
        tab = GR[0],
        MT = "Upcoming",
        F = { q: "", s: "", k: "time", c: "" };
      V = "customer";
      P = "home";
      {
        const SS = sess();
        if (SS && SS.role === "customer")
          U = DB.users.find((x) => x.id === SS.id) || null;
        if (location.hash === "#signup") P = "signup";
      }
      const te = (id) => (TE.find((x) => x.id === id) || { n: "Unassigned" }).n,
        LB = {
          pending: "Awaiting deposit",
          expired: "Expired",
          confirmed: "Confirmed",
          waiting: "Waiting",
          service: "In service",
          completed: "Completed",
          cancelled: "Cancelled",
          noshow: "No-show",
          refunded: "Refunded",
          voided: "Voided",
        };
      const pill = (s) => `<span class="pill ${s}">${LB[s]}</span>`;
      const modal = (h) => {
        document.body.classList.remove("rcp");
        $("#md").innerHTML = h
          ? `<div class="mb" onclick="if(event.target===this)modal()"><div class="mc">${h}</div></div>`
          : "";
      };
      const MF = (c) =>
        `<p class="row" style="justify-content:flex-end;margin-bottom:0">${c}</p>`;
      function go(p) {
        P = p;
        if (p === "book" && B.done) B = { step: 0 };
        render();
        scrollTo(0, 0);
        if (p === "gallery") refreshGallery();
      }
      const prs = (s) =>
          s.px ? php(s.p) + " to " + php(s.px) : s.p ? php(s.p) : "FREE",
        dus = (s) =>
          (s.dx ? durT(s.d) + " to " + durT(s.dx) : durT(s.d)) +
          (s.x ? " · " + s.x : "");
      const fld = (id, l, t = "text", v = "") =>
        `<label>${l}</label><input id="${id}" type="${t}" value="${esc(v)}">`;
      const IMG = {
        florals:
          "img/florals.jpg",
        dark: "img/dark.jpg",
        lace: "img/lace.jpg",
        emerald:
          "img/emerald.jpg",
        blue: "img/blue.jpg",
        fruit:
          "img/fruit.jpg",
        star: "img/star.jpg",
      };
      // Photos come from the owner portal (FN.loadGallery). If that is unavailable, the bundled defaults keep the page working.
      const GAL_DEFAULT = [["florals", "3D florals"], ["dark", "Dark embellished"], ["lace", "Lace & florals"], ["emerald", "Emerald & gold"], ["blue", "Deep blue"], ["fruit", "Fruit salad"], ["star", "Star nails"]]
        .map(([k, title]) => ({ url: IMG[k], title, focus: "center" }));
      let GAL = null;
      // Home-page collage keeps using the bundled photos directly.
      const ph = (k, l, c) =>
        `<div class="ph ${c}"><img src="${IMG[k]}" alt="${l} nail art" loading="lazy"><span>▣ ${l}</span></div>`;
      const TILE = ["a", "b", "a", "b", "c", "c", "c"]; // staggered tile shapes; any photo is cropped to fit its tile
      const galTile = (g, i) =>
        `<div class="ph ${TILE[i % TILE.length]}"><img src="${esc(g.url)}" alt="${esc(g.title)} nail art" loading="lazy" style="object-position:center ${g.focus || "center"}"><span>▣ ${esc(g.title)}</span></div>`;
      const galTiles = () => {
        const list = GAL || GAL_DEFAULT;
        return list.length ? list.map(galTile).join("") : '<p class="mute" style="grid-column:1/-1">New photos are coming soon.</p>';
      };
      async function refreshGallery() { // pick up photo changes made in the owner portal
        try { GAL = await FN.loadGallery(); if (P === "gallery" && !$("#md").innerHTML) render(); } catch (e) { /* keep what we have */ }
      }
      const gallery = () =>
        `<section class="sec" style="padding-bottom:1rem"><div class="wrap" style="text-align:center"><small style="letter-spacing:.14em;border-bottom:1px solid var(--ink)">GALLERY</small><h2 style="margin-top:.6rem">Recent nail art</h2><p class="mute" style="max-width:32rem;margin:0 auto 1.4rem">Cat-eye, chrome, 3D florals, fruit sets and more, all hand-made, one set at a time.</p><div class="gal">${galTiles()}</div><p style="margin-top:1.6rem"><a class="btn o" style="display:inline-block;text-decoration:none" href="https://www.facebook.com/" target="_blank" rel="noopener">See more on Facebook</a></p></div></section>`;
      const home =
        () => `<section class="hero"><div class="wrap two"><div><span class="tag"><span style="color:var(--red)">✦</span> HOME-BASED NAIL STUDIO</span><h1>Nails with a little bit of magic.</h1><p style="max-width:30rem">Gel care, soft-gel extensions and hand-crafted nail art. Choose your services, pick a time, and book your slot online.</p><p><button class="btn" onclick="go('book')">Book Appointment</button> <button class="btn o" onclick="go('services')">See services &amp; prices</button></p></div><div class="hp"><div>${ph("florals", "3D florals", "t1")}${ph("lace", "Lace & florals", "t3")}</div><div>${ph("dark", "Dark embellished", "t3")}${ph("emerald", "Emerald & gold", "t1")}</div></div></div></section>${gallery()}
<section class="sec"><div class="wrap"><small>OUR FAVORITES</small><div class="row"><h2>Pick your little luxury</h2><a class="pr" style="cursor:pointer" onclick="go('services')">View all services →</a></div><div class="cards">${[
          [
            "Basic Care",
            "var(--sage)",
            "❀",
            "Basic Care",
            "The classics, made special",
          ],
          [
            "Gel Services",
            "var(--pink)",
            "♡",
            "Gel Services",
            "Glossy color that lasts",
          ],
          [
            "Nail Art Add-Ons",
            "var(--beige)",
            "✦",
            "Nail Art Add-Ons",
            "Tiny works of art, for you",
          ],
        ]
          .map(
            (c) =>
              `<button class="fav" style="background:${c[1]}" onclick="tab='${c[3]}';go('services')"><span class="ic">${c[2]}</span><span><h3 style="margin:0">${c[3]}</h3><small>${c[4]}</small><br><b class="pr" style="font-size:.8rem">from ${php(
                Math.min(
                  ...SVA()
                    .filter((s) => s.g === c[3] && s.p > 0)
                    .map((s) => s.p),
                ),
              )}</b></span></button>`,
          )
          .join("")}</div></div></section>
<section class="band"><small style="color:#dfe8d4;letter-spacing:.12em">EASY AS 1-2-3-4</small><h2>Your appointment, made simple</h2><div class="wrap steps4">${[
          ["Choose a service", "Browse services and pick what feels right."],
          ["Pick a time", "Find a date and slot that fits your day."],
          [
            "Pay the ₱250 reservation",
            "Pay the deposit online to hold your slot.",
          ],
          ["Get confirmed", "We'll send all the details straight to you."],
        ]
          .map(
            (s, i) =>
              `<div><b>0${i + 1}</b><h3>${s[0]}</h3><p>${s[1]}</p></div>`,
          )
          .join("")}</div></section>`;
      const W = (x, w = 680) =>
        `<section class="sec"><div class="wrap" style="max-width:${w}px">${x}</div></section>`;
      const login = () =>
        W(
          `<div class="card auth"><h2>Welcome back</h2><p class="mute">Log in to manage your appointments and bookings.</p><label for="li_u">Email address</label><input id="li_u" type="email" autocomplete="username" placeholder="you@example.com"><label for="li_p">Password</label><div class="pwrow"><input id="li_p" type="password" autocomplete="current-password" placeholder="Enter your password"><button class="eye" type="button" onclick="togglePassword('li_p',this)">Show</button></div><div id="ae"></div><p><button class="btn" style="width:100%" onclick="doLogin()">Log in</button></p><small>New here? <a class="pr" style="cursor:pointer" onclick="go('signup')">Create an account</a></small></div>`,
          460,
        );
      const gate = () =>
        W(
          `<h2>Log in to continue</h2><p class="mute">Create an account or log in to book and manage appointments.</p><button class="btn" onclick="go('login')">Log in</button> <button class="btn w" onclick="go('signup')">Sign up</button>`,
          420,
        );
      const services = () =>
        W(
          `<h2>Services &amp; Prices</h2><p class="mute">Prices follow the Fairytale price list. Nail art final prices are confirmed after the salon reviews your reference design.</p>${GR.map(
            (g) =>
              `<h3 style="margin-top:1.6rem">${g}</h3>${GN[g] ? `<p class="mute" style="margin:0 0 .5rem">${GN[g]}</p>` : ""}<div class="card" style="padding:0 1rem">${SVA()
                .filter((s) => s.g === g)
                .map(
                  (s) =>
                    `<div class="row" style="padding:.7rem 0;border-bottom:1px solid var(--line)"><span class="svr"><img class="svt" src="${svImg(s)}" alt="Illustration for ${esc(s.n)}" loading="lazy"><span><b>${esc(s.n)}</b><br><small>${dus(s)}</small></span></span><b class="pr">${prs(s)}</b></div>`,
                )
                .join("")}</div>`,
          ).join(
            "",
          )}<p style="margin-top:1.4rem"><button class="btn" onclick="B={step:0};go('book')">Book Appointment</button></p>`,
          800,
        );
      const about = () =>
        W(
          `<h2>About us</h2><div class="card"><p>A cozy salon in Quezon City with 7 stations and 8 technicians.</p><p class="mute">Open ${openTxt()}, ${m2t(DB.hours.o)} to ${m2t(DB.hours.c)}. Lunch break ${m2t(DB.hours.ls)} to ${m2t(DB.hours.le)}. Placeholder contact: @fairytalenails</p></div>`,
        );
      const signup = () =>
        W(
          `<div class="card auth"><h2>Create your account</h2><p class="mute">Create an account to book appointments and manage your visits.</p><label for="su_n">Full name</label><input id="su_n" autocomplete="name" placeholder="Your full name"><label for="su_e">Email address</label><input id="su_e" type="email" autocomplete="email" placeholder="you@example.com"><label for="su_p">Mobile number</label><input id="su_p" type="tel" autocomplete="tel" inputmode="tel" placeholder="Your mobile number"><label for="su_w">Password</label><div class="pwrow"><input id="su_w" type="password" autocomplete="new-password" placeholder="At least 6 characters"><button class="eye" type="button" onclick="togglePassword('su_w',this)">Show</button></div><small class="mute">Use at least 6 characters. You may be asked to confirm your email before logging in.</small><div id="ae"></div><p><button class="btn" style="width:100%" onclick="doSignup()">Create account</button></p><small>Already have an account? <a class="pr" style="cursor:pointer" onclick="go('login')">Log in</a></small></div>`,
          480,
        );
      function cdash() {
        if (!U) return gate();
        const a = DB.appts
          .filter(
            (a) =>
              a.uid === U.id &&
              ["pending", "confirmed", "waiting"].includes(a.status) &&
              a.date >= today(),
          )
          .sort((x, y) => key(x).localeCompare(key(y)))[0];
        return W(
          `<h2>Hello, ${esc(U.name || U.user)}</h2><div class="card"><small>Next appointment</small>${a ? `<h3 style="margin:.3rem 0">${a.svc}</h3><p>${a.date} at ${m2t(a.start)}<br><small>Confirmation ${a.code}</small></p>` : '<p class="mute">You have no upcoming appointments.</p>'}</div><p><button class="btn" onclick="B={step:0};go('book')">Book New Appointment</button></p>`,
          700,
        );
      }
      /* booking */
      const sel = () => DB.SV.filter((s) => (B.sel || []).includes(s.id)),
        sm = (k, k2) =>
          sel().reduce((t, s) => t + (k2 ? s[k2] || s[k] : s[k]), 0);
      const dmax = () => sm("d", "dx"),
        prr = () =>
          sm("p") === sm("p", "px")
            ? php(sm("p"))
            : php(sm("p")) + " to " + php(sm("p", "px")),
        dur = () =>
          sm("d") === dmax()
            ? durT(dmax())
            : durT(sm("d")) + " to " + durT(dmax());
      
      function tg(id) {
        B.sel = B.sel || [];
        B.sel = B.sel.includes(id)
          ? B.sel.filter((x) => x !== id)
          : [...B.sel, id];
        B.slot = null;
        render();
      }
      function cal() {
        const n = new Date(),
          m = new Date(n.getFullYear(), n.getMonth() + (B.mo || 0), 1),
          dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(),
          t0 = new Date(n.getFullYear(), n.getMonth(), n.getDate());
        let c = "<span></span>".repeat(m.getDay());
        for (let d = 1; d <= dim; d++) {
          const dt = new Date(m.getFullYear(), m.getMonth(), d),
            iso = fmt(dt);
          c += `<button ${dt < t0 || !DB.openDays.includes(dt.getDay()) || DB.off.includes(iso) ? "disabled" : ""} class="${B.date === iso ? "on" : ""}" onclick="B.date='${iso}';B.slot=null;render()">${d}</button>`;
        }
        return `<div class="row" style="max-width:360px"><button class="btn sm w" ${B.mo ? "" : "disabled"} onclick="B.mo=0;render()">‹</button><b>${m.toLocaleString("en", { month: "long", year: "numeric" })}</b><button class="btn sm w" onclick="B.mo=1;render()">›</button></div><div class="cal">${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((x) => `<b>${x}</b>`).join("")}${c}</div>`;
      }
      const bfl = (d) =>
          new Date(d + "T00:00").toLocaleDateString("en", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        BLB = {
          svc: "Services",
          method: "Method",
          tech: "Tech",
          time: "Time",
          review: "Review",
          confirm: "Confirm",
        };
      const bord = () =>
          B.method === "time"
            ? ["svc", "method", "time", "tech", "review", "confirm"]
            : ["svc", "method", "tech", "time", "review", "confirm"],
        bidx = (k) => bord().indexOf(k);
      const bsum = () =>
        `<div class="card" style="position:sticky;top:90px"><b>Your booking</b>${
          sel().length
            ? sel()
                .map(
                  (s) =>
                    `<div class="row" style="padding:.35rem 0;border-bottom:1px solid var(--line)"><span>${s.n}<br><small>${dus(s)}</small></span><b class="pr">${prs(s)}</b></div>`,
                )
                .join("")
            : '<p class="mute">No services selected yet.</p>'
        }${B.tech || bidx("tech") < B.step ? `<p style="margin:.7rem 0 0"><small>Technician</small><br><b>${B.tech ? esc(te(B.tech)) : "Any available technician"}</b></p>` : ""}${B.slot != null ? `<p style="margin:.5rem 0 0"><small>Date and time</small><br><b>${bfl(B.date)} at ${m2t(B.slot)}</b></p>` : ""}${sel().length ? `<div class="row" style="margin-top:.8rem"><small>Estimated duration</small><b>${dur()}</b></div><div class="row"><small>Estimated total</small><b class="pr">${prr()}</b></div>` : ""}<small>The salon confirms final nail art prices.</small></div>`;
      const SVGP =
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
        SVGC =
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
      function setM(m) {
        if (B.method !== m) {
          B.tech = 0;
          B.slot = null;
          B.date = null;
        }
        B.method = m;
        B.step = 2;
        render();
      }
      function book() {
        if (!U) return gate();
        if (B.done) {
          const a = B.done;
          return W(
            `<h2>${a.status === "confirmed" ? "Booking confirmed" : "Booking received"}</h2><div class="card"><p>Confirmation number <b>${a.code}</b></p><p>${a.svc}<br>${a.staff ? "with " + esc(te(a.staff)) + " · " : ""}${bfl(a.date)} at ${m2t(a.start)} · ${a.estD}<br>Estimated ${a.estP}</p><p><b>Status: ${a.status === "confirmed" ? "Confirmed" : "Awaiting deposit"}.</b> ${a.status === "confirmed" ? "Your ₱" + DB.deposit + " deposit was recorded and your time slot is reserved." : "Your time slot is held for a few minutes. Open My Appointments to pay the deposit."}</p><small>${DB.test ? "Test mode: no real payment was made." : ""}</small></div><p><button class="btn" onclick="B={step:0};go(U?'dash':'home')">${U ? "Back to dashboard" : "Done"}</button></p>`,
          );
        }
        const o = bord(),
          k = o[B.step],
          tm = B.method === "time",
          tid = tm ? 0 : B.tech || 0,
          rs = tm ? "B.tech=0;" : "";
        const prog = `<div class="stepper" role="list">${o.map((x, i) => `<div class="stp ${i < B.step ? "done" : i === B.step ? "cur" : ""}" role="listitem"><span class="dot">${i < B.step ? "✓" : i + 1}</span><small>${BLB[x]}</small></div>${i < o.length - 1 ? `<i class="ln ${i < B.step ? "done" : ""}"></i>` : ""}`).join("")}</div>`;
        let h = "",
          ok = true,
          cont = true;
        if (k === "svc") {
          ok = !!sel().length;
          const gs = GR.filter((g) => SVA().some((s) => s.g === g)),
            cat = gs.includes(B.cat) ? B.cat : gs[0];
          h = `<h3>Select services</h3><small>You can pick more than one.</small><div class="tabs" style="flex-wrap:wrap">${gs.map((g) => `<button class="${cat === g ? "on" : ""}" onclick="B.cat='${g}';render()">${g}</button>`).join("")}</div>${GN[cat] ? `<small>${GN[cat]}</small>` : ""}<div class="sg" style="margin-top:.6rem">${SVA()
            .filter((s) => s.g === cat)
            .map(
              (s) =>
                `<button class="opt ${(B.sel || []).includes(s.id) ? "on" : ""}" onclick="tg(${s.id})"><span class="svr"><img class="svt" src="${svImg(s)}" alt="" loading="lazy"><span><b>${esc(s.n)}</b><br><small>${dus(s)}</small></span></span><b class="pr">${prs(s)}</b></button>`,
            )
            .join(
              "",
            )}</div>${sel().some((s) => /Add-Ons/.test(s.g)) ? `<div class="msg ok">The final nail art price is confirmed after the salon reviews your reference design.</div><label>Reference photo (optional)</label><input type="file" accept="image/*" onchange="B.refFile=this.files[0]||null;B.ref=this.files[0]?this.files[0].name:'';render()">${B.ref ? `<small>Selected: ${esc(B.ref)}</small>` : ""}` : ""}`;
        }
        if (k === "method") {
          cont = false;
          h = `<p class="mute" style="text-align:center;letter-spacing:.1em;font-weight:600">HOW WOULD YOU LIKE TO BOOK?</p><button class="mth" onclick="setM('tech')"><span class="ic">${SVGP}</span><span style="flex:1"><b style="font-size:1.1rem">Book by Tech</b><br><small>Choose your preferred technician first</small></span><span>›</span></button><button class="mth" onclick="setM('time')"><span class="ic">${SVGC}</span><span style="flex:1"><b style="font-size:1.1rem">Book by Time</b><br><small>Choose an available time slot first</small></span><span>›</span></button>`;
        }
        if (k === "tech") {
          const L = tm
            ? TE.filter((t) => free(B.date, dmax(), 0, t.id).includes(B.slot))
            : TE;
          h = `<h3>${tm ? "Technicians available at " + m2t(B.slot) : "Choose a technician"}</h3><div class="sg"><button class="opt ${!B.tech ? "on" : ""}" onclick="B.tech=0;render()"><span><b>Any available technician</b><br><small>We will assign the best fit</small></span></button>${L.map((t) => `<button class="opt ${B.tech === t.id ? "on" : ""}" onclick="B.tech=${t.id};render()"><span><b>${esc(t.n)}</b><br><small>${esc(t.sp)}${tm ? "" : " · day off " + DN[t.off]}</small></span></button>`).join("")}</div>`;
        }
        if (k === "time") {
          ok = B.slot != null;
          const t0 = new Date();
          t0.setHours(0, 0, 0, 0);
          const days = [...Array(7)].map((_, i) => {
              const d = new Date(t0);
              d.setDate(d.getDate() + (B.ds || 0) * 7 + i);
              return d;
            }),
            f = B.date ? free(B.date, dmax(), 0, tid) : [],
            grp = [
              ["Morning", (x) => x < 720],
              ["Afternoon", (x) => x >= 720 && x < 1020],
              ["Evening", (x) => x >= 1020],
            ];
          h = `<h3>Select date and time</h3><small>Estimated duration: ${dur()}${tid ? " · with " + esc(te(tid)) : ""}</small><div class="row" style="margin-top:.6rem"><button class="btn sm w" ${B.ds ? "" : "disabled"} onclick="B.ds--;render()" aria-label="Previous week">‹</button><b>${bfl(fmt(days[0]))} to ${bfl(fmt(days[6]))}</b><button class="btn sm w" ${(B.ds || 0) >= 7 ? "disabled" : ""} onclick="B.ds=(B.ds||0)+1;render()" aria-label="Next week">›</button></div><div class="dstrip">${days
            .map((d) => {
              const iso = fmt(d);
              return `<button class="chip ${B.date === iso ? "on" : ""}" ${free(iso, dmax(), 0, tid).length ? "" : "disabled"} onclick="${rs}B.date='${iso}';B.slot=null;render()"><small>${DN[d.getDay()]}</small><br><b>${d.getDate()}</b></button>`;
            })
            .join(
              "",
            )}</div>${B.warn ? `<div class="msg">${B.warn}</div>` : ""}${
            B.date
              ? grp
                  .map(([n, fn]) => {
                    const L = f.filter(fn);
                    return L.length
                      ? `<h3 style="font-size:1rem;margin:.8rem 0 .2rem">${n}</h3><div class="chips" style="margin-top:0">${L.map((t) => `<button class="chip ${B.slot === t ? "on" : ""}" onclick="${rs}B.slot=${t};B.warn='';render()">${m2t(t)}</button>`).join("")}</div>`
                      : "";
                  })
                  .join("") ||
                '<div class="msg">No times left that day. Pick another day.</div>'
              : '<p class="mute">Pick a day to see the available times.</p>'
          }`;
        }
        if (k === "review") {
          const okN = (v) => (v || "").trim().length >= 2, okP = (v) => (v || "").replace(/\D/g, "").length >= 7, okE = (v) => /^\S+@\S+\.\S+$/.test(v || ""),
            n = B.name ?? (U ? U.name : ""), p = B.phone ?? (U ? U.phone : ""), e = B.email ?? (U ? U.email : ""),
            ed = B.editC, sN = ed || !okN(n), sP = ed || !okP(p), sE = ed || !okE(e), known = !sN && !sP && !sE;
          h = `<h3>Review and your details</h3><small>Check the summary${known ? "." : ", then fill in the missing details."}</small>${known ? `<div class="card" style="margin:.8rem 0"><div class="row"><span><b>Booking for ${esc(n)}</b><br><small>${esc(p)} · ${esc(e)}</small></span><a class="pr" style="cursor:pointer" onclick="B.editC=1;render()">Change</a></div></div>` : ""}${sN && !ed && !okN(n) ? `<div class="msg ok">We don't have your name on file yet. Enter it once and we will remember it for your next bookings.</div>` : ""}${sN ? fld("b_n", "Name", "text", n) : ""}${sP ? fld("b_p", "Phone", "tel", p) : ""}${sE ? fld("b_e", "Email", "email", e) : ""}${fld("b_t", "Notes", "text", B.notes || "")}${B.err ? `<div class="msg">${B.err}</div>` : ""}`;
        }
        if (k === "confirm")
          h = `<h3>Pay the ₱${DB.deposit} reservation</h3><div class="card"><p>Your slot is reserved for you while you pay the reservation deposit, which is deducted from your final bill.</p>${DB.test ? '<div class="msg ok">Test mode: tapping Confirm records the deposit instantly. No real payment is made.</div>' : '<div class="msg">Online payment is not enabled yet.</div>'}</div>${B.err ? `<div class="msg">${B.err}</div>` : ""}<p class="mute">The deposit may be forfeited if you cancel.</p>`;
        const nav = `<p style="display:flex;gap:.6rem">${B.step ? '<button class="btn w" onclick="B.step--;render()">Back</button>' : ""}${!cont ? "" : k === "review" ? '<button class="btn" onclick="det()">Continue</button>' : k === "confirm" ? `<button class="btn" ${B.busy ? "disabled" : ""} onclick="submitB()">${B.busy ? "Please wait..." : "Confirm booking"}</button>` : `<button class="btn" ${ok ? "" : 'disabled style="opacity:.4"'} onclick="B.step++;render()">Continue</button>`}</p>`;
        return `<section class="sec"><div class="wrap" style="max-width:980px"><h2>Book an appointment</h2>${prog}<div class="bk"><div>${h}${nav}</div>${bsum()}</div></div></section>`;
      }
      function det() {
        const val = (id, cur) => { const el = $("#" + id); return (el ? el.value : cur || "").trim(); };
        B.name = val("b_n", B.name ?? (U ? U.name : ""));
        B.phone = val("b_p", B.phone ?? (U ? U.phone : ""));
        B.email = val("b_e", B.email ?? (U ? U.email : ""));
        B.notes = val("b_t", "");
        if (
          B.name.length < 2 ||
          B.phone.replace(/\D/g, "").length < 7 ||
          !/^\S+@\S+\.\S+$/.test(B.email)
        ) {
          B.err = "Enter your name, a valid phone number and a valid email.";
          return render();
        }
        B.err = "";
        // Older accounts without a saved name/phone: remember it so we never ask again.
        if (U && (!U.name || !U.phone)) {
          const patch = {};
          if (!U.name) patch.full_name = B.name;
          if (!U.phone) patch.phone = B.phone;
          FN.saveProfile(patch).then((r) => Object.assign(U, { name: r.full_name || U.name, phone: r.phone || U.phone })).catch(() => {});
        }
        B.step = bidx("confirm");
        render();
      }
      function mine() {
        if (!U) return gate();
        const L = DB.appts.filter((a) => a.uid === U.id),
          T = {
            Upcoming: L.filter((a) =>
              ["pending", "confirmed", "waiting", "service"].includes(a.status),
            ),
            Completed: L.filter((a) => a.status === "completed"),
            Cancelled: L.filter((a) =>
              ["cancelled", "noshow", "expired", "refunded", "voided"].includes(a.status),
            ),
          };
        return W(
          `<h2>My Appointments</h2><div class="tabs">${Object.keys(T)
            .map(
              (t) =>
                `<button class="${MT === t ? "on" : ""}" onclick="MT='${t}';render()">${t} (${T[t].length})</button>`,
            )
            .join(
              "",
            )}</div>${T[MT].map((a) => `<div class="card" style="margin-bottom:.7rem"><div class="row"><b>${a.svc}</b>${pill(a.status)}</div><small>${a.date} at ${m2t(a.start)} · ${a.estP || php(a.price)} · ${a.code}</small>${MT === "Upcoming" && a.status !== "service" ? `<p style="margin-bottom:0">${a.status === "pending" && DB.test ? `<button class="btn sm" onclick="payHold('${a.id}')">Pay ₱${DB.deposit} deposit</button> ` : ""}<button class="btn sm w" onclick="askCancel('${a.id}')">Cancel</button></p>${a.status === "pending" ? `<small>Your time slot is held for a short time until the deposit is paid.</small>` : ""}` : ""}</div>`).join("") || '<p class="mute">Nothing here yet.</p>'}`,
          700,
        );
      }
      function acct() {
        if (!U) return gate();
        return W(
          `<h2>Account Information</h2><div class="card">${fld("a_n", "Name", "text", U.name)}${fld("a_p", "Phone", "tel", U.phone)}${fld("a_e", "Email", "email", U.email)}${fld("a_a", "Address", "text", U.addr)}<div id="ae"></div><p><button class="btn" onclick="saveA()">Save changes</button></p></div>`,
          520,
        );
      }
      const PG = () => ({
        home,
        services,
        gallery: () => gallery(),
        about,
        login,
        signup,
        dash: cdash,
        book,
        mine,
        acct,
      });
      function render() {
        const logo =
          '<span class="logo" onclick="go(\'home\')"><span class="lg">f</span><span><i>fairytale</i><small>NAILS SALON</small></span></span>';
        const L = [
          ["home", "Home"],
          ["services", "Services & Prices"],
          ["gallery", "Gallery"],
        ].concat(
          U
            ? [
                ["dash", "Dashboard"],
                ["mine", "My Appointments"],
                ["acct", "Account"],
              ]
            : [["about", "About us"]],
        );
        $("#app").innerHTML =
          `<header class="top noprint">${logo}<nav>${L.map(([k, l]) => `<a class="${P === k ? "on" : ""}" onclick="go('${k}')">${l}</a>`).join("")}</nav><button class="btn" onclick="B={step:0};go('book')">Book Appointment</button> ${U ? `<button class="btn w sm" onclick="doLogout()">Log out</button>` : `<button class="btn w sm" onclick="go('login')">Log in</button> <button class="btn sm" onclick="go('signup')">Sign up</button>`}</header>${(PG()[P] || home)()}<footer class="foot noprint">${logo}<span class="mute">Open ${openTxt()}, ${m2t(DB.hours.o)} to ${m2t(DB.hours.c)}<br>Soft care, thoughtful details, and a little magic, every visit.</span><small>© 2026 Fairytale Nails Salon</small></footer>`;
      }

      /* ================= Supabase data layer ================= */
      const SL = {}; // availability cache: "date|duration|tech" -> minutes[]
      function free(date, dur, skip, tid) {
        if (!date || !dur) return [];
        const k = date + "|" + dur + "|" + (tid || 0);
        if (SL[k]) return SL[k].v || [];
        SL[k] = { v: null };
        FN.getSlots(date, dur, tid || null)
          .then((v) => { SL[k].v = v; if (!$("#md").innerHTML) render(); })
          .catch(() => { delete SL[k]; });
        return [];
      }
      const clearSlots = () => Object.keys(SL).forEach((k) => delete SL[k]);
      const manila = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      function mapAppt(r) {
        const p = Object.fromEntries(manila.formatToParts(new Date(r.start_at)).map((x) => [x.type, x.value]));
        const dur = Math.round((new Date(r.end_at) - new Date(r.start_at)) / 6e4),
          it = r.appointment_items || [],
          lo = it.reduce((t, i) => t + +i.unit_price, 0),
          hi = it.reduce((t, i) => t + +(i.price_max || i.unit_price), 0),
          sale = Array.isArray(r.sales) ? r.sales[0] : r.sales;
        return {
          id: r.id, code: r.code, uid: r.customer_id, name: r.customer_name,
          svc: it.map((i) => i.name).join(", "),
          date: `${p.year}-${p.month}-${p.day}`, start: +p.hour * 60 + +p.minute, dur,
          price: lo, estP: sale && sale.status === "paid" ? php(sale.total) : lo === hi ? php(lo) : php(lo) + " to " + php(hi),
          estD: durT(dur), status: r.status === "held" ? "pending" : r.status, staff: r.technician_id || 0, hist: [],
        };
      }
      async function loadAppts(quiet) {
        if (!U) { DB.appts = []; return; }
        DB.appts = (await (quiet ? FN.raw || FN : FN).myAppointments()).map(mapAppt);
      }
      let unwatch = null;
      async function startSession() {
        const ok = await FN.requirePortalRole("customer");
        if (!ok) return false;
        const p = await FN.myProfile();
        U = { id: p.id, name: p.full_name, user: p.username || p.email, phone: p.phone || "", email: p.email || "", addr: p.address || "" };
        await loadAppts();
        if (unwatch) unwatch();
        unwatch = FN.watchMyBookings(U.id, async () => {
          await loadAppts(true); // background refresh: no loading screen
          if (!$("#md").innerHTML && P !== "book" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) render();
        });
        return true;
      }
      async function boot() {
        $("#app").innerHTML = ""; // the loading screen is already covering the page
        try {
          const c = await FN.loadCatalog();
          GAL = await Promise.resolve().then(() => FN.loadGallery()).catch(() => null); // never blocks the site if the gallery isn't set up
          GR.splice(0, GR.length, ...c.GR);
          Object.keys(GN).forEach((k) => delete GN[k]);
          Object.assign(GN, c.GN);
          DB.SV = c.SV; TE.splice(0, TE.length, ...c.TE);
          DB.hours = c.hours; DB.openDays = c.openDays; DB.off = c.off; DB.deposit = c.depositAmount; DB.test = c.testMode;
          tab = GR[0];
          if (await FN.currentUser()) await startSession();
        } catch (e) {
          console.error(e);
          $("#app").innerHTML = '<p style="text-align:center;padding:5rem 1rem">Could not reach the salon system. <a class="pr" style="cursor:pointer" onclick="boot()">Try again</a></p>';
          window.Loader && Loader.endInitial();
          return;
        }
        render();
        window.Loader && Loader.endInitial(); // reveal only after the first screen is fully rendered
      }
      const err = (m) => ($("#ae").innerHTML = `<div class="msg">${esc(m)}</div>`);
      async function doLogin() {
        const u = $("#li_u").value.trim(), w = $("#li_p").value;
        if (!u || !w) return err("Enter your email and password.");
        try {
          await FN.signIn(u, w);
          if (!(await startSession())) return err("That is a staff or owner account. Please use staff.html or owner.html.");
          go("dash");
        } catch (e) { err(e.message); }
      }
      async function doSignup() {
        const g = (i) => $("#" + i).value.trim(), n = g("su_n"), e = g("su_e"), p = g("su_p"), w = $("#su_w").value;
        const bad = n.length < 2 ? "Enter your full name."
          : !/^\S+@\S+\.\S+$/.test(e) ? "Enter a valid email."
          : p.replace(/\D/g, "").length < 7 ? "Enter a valid phone number."
          : w.length < 6 ? "Password needs 6+ characters." : "";
        if (bad) return err(bad);
        try {
          const r = await FN.signUp({ email: e, password: w, phone: p, fullName: n });
          if (!r.session) return ($("#ae").innerHTML = '<div class="msg ok">Account created. Check your email to confirm it, then log in.</div>');
          await startSession();
          go("dash");
        } catch (x) { err(x.message); }
      }
      async function doLogout() {
        if (unwatch) unwatch(); unwatch = null;
        await FN.signOut(); U = null; DB.appts = []; B = { step: 0 }; go("home");
      }
      async function saveA() {
        try {
          const r = await FN.saveProfile({ full_name: $("#a_n").value.trim(), phone: $("#a_p").value.trim(), email: $("#a_e").value.trim(), address: $("#a_a").value.trim() });
          Object.assign(U, { name: r.full_name, phone: r.phone || "", email: r.email || "", addr: r.address || "" });
          $("#ae").innerHTML = '<div class="msg ok">Saved.</div>';
        } catch (e) { err(e.message); }
      }
      async function submitB() {
        if (B.busy) return;
        if (!U) return go("login");
        B.busy = true; B.err = ""; render();
        try {
          const a = await FN.createHold({ serviceIds: [...B.sel], date: B.date, startMin: B.slot, techId: B.tech || 0, method: B.method, name: B.name, phone: B.phone, email: B.email, notes: B.notes });
          if (B.refFile) { try { await FN.uploadReference(B.refFile, a.id); } catch (x) { console.warn("reference upload failed", x); } }
          if (DB.test) await FN.payDepositTest(a.id);
          FN.resetAttempt(); clearSlots();
          await loadAppts();
          B = { step: 0, done: DB.appts.find((x) => x.id === a.id) };
        } catch (e) {
          B.busy = false;
          if (/SLOT_UNAVAILABLE|HOLD_EXPIRED/.test(e.code || e.message)) {
            clearSlots(); FN.resetAttempt(); B.warn = e.message; B.slot = null; B.step = bidx("time");
          } else B.err = e.message || "Something went wrong. Please try again.";
        }
        render();
      }
      async function payHold(id) {
        try { await FN.payDepositTest(id); await loadAppts(); render(); }
        catch (e) { modal(`<h3>Could not pay the deposit</h3><p>${esc(e.message)}</p>${MF('<button class="btn w" onclick="modal()">Close</button>')}`); await loadAppts(); }
      }
      const askCancel = (id) =>
        modal(`<h3>Cancel this appointment?</h3><p>Your ₱${DB.deposit} reservation deposit may be forfeited if you cancel.</p>${MF(`<button class="btn w" onclick="modal()">Keep appointment</button><button class="btn" onclick="cancelBk('${id}')">Yes, cancel</button>`)}`);
      async function cancelBk(id) {
        try { await FN.cancelMyBooking(id); await loadAppts(); modal(); render(); }
        catch (e) { modal(`<h3>Could not cancel</h3><p>${esc(e.message)}</p>${MF('<button class="btn w" onclick="modal()">Close</button>')}`); }
      }
      FNready.then(boot);
    
