import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ─── Assets ──────────────────────────────────────────────── */
const P = '/assets';
const imgLogo = `${P}/ekofiniLogo.png`;
const imgHM   = `${P}/BrekkieCoffee.jpg`;   // hero exterior
const imgAB   = `${P}/BrekkieCoffee.jpg`;   // terrace / about bg
const imgFD   = `${P}/Entrance.jpg`;   // food — coffee & cake
const imgR1   = `${P}/InsideLookingOut.jpg`;   // rotated 1
const imgR2   = `${P}/Food.jpg`;   // rotated 2
const imgG1   = `${P}/InsideCaption.jpg`;   // gallery 1
const imgG2   = `${P}/InsideCaption.jpg`;
const imgG3   = `${P}/insideRestu.jpeg`;
const imgG4   = `${P}/StraberryDaiquiri.jpeg`;
const imgG5   = `${P}/Ribs.jpg`;
const imgG6   = `${P}/Food.jpg`;
const imgG7   = `${P}/InsideMirror.jpg`;
const imgG8   = `${P}/InsideCaption.jpg`;
const imgG9   = `${P}/BrekkieCoffee.jpg`;   // food — coffee & cake


/* ─── 3D gallery image data ───────────────────────────────── */
type GImg = { src:string; x:number; y:number; z:number; w:number; rx:number; ry:number; caption:string };

// Images spread across 4 quadrants. Max |y| kept to 175 px so
// no image top-edge overlaps the 64 px nav on viewports ≥ 768 px.
const GALLERY: GImg[] = [
  // ── far ─ centre anchor
  { src:imgHM, x:   0, y:   0, z:-240, w:148, rx: 1, ry:-2, caption:'Florindale Country Centre' },
  // ── far ─ top-left / top-right
  { src:imgFD, x:-360, y:-130, z:-268, w:134, rx:-2, ry: 4, caption:'The Garden'                },
  { src:imgG2, x: 350, y:-125, z:-254, w:142, rx: 2, ry:-5, caption:'Morning Light'             },
  // ── mid ─ bottom-left / top-right / bottom-centre
  { src:imgAB, x:-300, y: 155, z:-148, w:178, rx:-1, ry: 3, caption:'Garden Terrace'            },
  { src:imgG3, x: 295, y:-135, z:-128, w:168, rx: 3, ry:-2, caption:'Our Kitchen'               },
  { src:imgG4, x: -80, y: 205, z:-102, w:182, rx:-3, ry: 2, caption:'Weekend Brunch'            },
  // ── near ─ bottom-right / top-left / right-centre
  { src:imgFD, x: 275, y: 180, z: -68, w:202, rx: 1, ry: 4, caption:'Coffee & Cake'             },
  { src:imgG8, x:-305, y:-130, z: -28, w:192, rx:-1, ry:-4, caption:'East London Garden'        },
  { src:imgG4, x: 365, y:  90, z:  12, w:188, rx: 2, ry: 3, caption:'Saturday Morning'          },
  // ── close ─ bottom-left / bottom-right / top-left
  { src:imgR2, x:-365, y: 195, z:  54, w:218, rx:-2, ry: 6, caption:'Café Jardin'               },
  { src:imgG5, x: 195, y: 215, z:  80, w:222, rx: 3, ry:-4, caption:'House Made'                },
  { src:imgG9, x:-110, y:-175, z: 106, w:212, rx:-3, ry: 2, caption:'Sunday Slow'               },
];

/* Mobile collage positions (8 images) */
const MOB: { l:string; t:string; w:string; rot:number }[] = [
  { l:'4%',  t:'5%',  w:'50%', rot: 2 },
  { l:'47%', t:'10%', w:'46%', rot:-3 },
  { l:'8%',  t:'30%', w:'48%', rot: 4 },
  { l:'52%', t:'35%', w:'40%', rot:-2 },
  { l:'3%',  t:'55%', w:'52%', rot: 3 },
  { l:'50%', t:'60%', w:'44%', rot:-4 },
  { l:'10%', t:'78%', w:'46%', rot: 1 },
  { l:'54%', t:'80%', w:'42%', rot:-3 },
];

/* ─── Utilities ───────────────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Thin SVG arrow icon — forward */
function Arr({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
      <line x1="0" y1="6" x2="14" y2="6" />
      <polyline points="9 1 14 6 9 11" />
    </svg>
  );
}

/* Thin SVG arrow — back */
function ArrLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
      <line x1="16" y1="6" x2="2" y2="6" />
      <polyline points="7 1 2 6 7 11" />
    </svg>
  );
}

/* ─── Scroll-reveal hook ──────────────────────────────────── */
function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* Line-by-line text reveal: wraps each span in an overflow clip */
function RL({ children, delay = 0, vis }: { children: ReactNode; delay?: number; vis: boolean }) {
  return (
    <span style={{ display: 'block', overflow: 'hidden', lineHeight: 'inherit' }}>
      <span style={{
        display: 'block',
        transform: vis ? 'translateY(0)' : 'translateY(108%)',
        opacity: vis ? 1 : 0,
        transition: `transform 1.1s cubic-bezier(.16,1,.3,1) ${delay}s, opacity 0.7s ease ${delay}s`,
      }}>
        {children}
      </span>
    </span>
  );
}

/* ─── Hash router ─────────────────────────────────────────── */
function useRoute() {
  const get = () => {
    const h = window.location.hash;
    if (h === '#/menu')    return 'menu';
    if (h === '#/reserve') return 'reserve';
    return 'home';
  };
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const fn = () => { setRoute(get()); window.scrollTo(0,0); };
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return route;
}

function navigate(to: string) { window.location.hash = to; }

/* ─── NAV ─────────────────────────────────────────────────── */
function Nav({ showLogo, route }: { showLogo: boolean; route: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const isHome = route === 'home';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn, { passive: true }); fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // close panel on route change
  useEffect(() => setOpen(false), [route]);

  const solidBg = !isHome || scrolled;
  const lnk: React.CSSProperties = {
    color:'rgba(255,255,255,0.68)', fontSize:11, letterSpacing:'0.22em',
    textTransform:'uppercase', textDecoration:'none',
    fontFamily:"'Jost',sans-serif", fontWeight:300, transition:'color 0.35s',
  };

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, height:100, zIndex:50,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 clamp(1.25rem,4vw,3rem)',
        background: solidBg ? 'rgba(20,20,18,0.94)' : 'transparent',
        backdropFilter: solidBg ? 'blur(12px)' : 'none',
        borderBottom: solidBg ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition:'background 0.5s, border-color 0.5s',
      }}>
        {/* Logo */}
        <a href="#" onClick={e=>{ e.preventDefault(); navigate(''); }}
          style={{
            opacity: (isHome ? showLogo : true) ? 1 : 0,
            pointerEvents: (isHome ? showLogo : true) ? 'auto' : 'none',
            transition:'opacity 0.5s cubic-bezier(.16,1,.3,1)',
            display:'block',
          }}>
          <img src={imgLogo} alt="Ekofini&Co." style={{ height:36, display:'block' }}/>
        </a>

        <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          {/* Desktop links */}
          <div className="desktop-only" style={{ display:'flex', gap:'2rem', alignItems:'center' }}>
            {isHome && [['About','#about'],['Gallery','#gallery'],['Visit','#visit']].map(([l,h]) => (
              <a key={l} href={h} className="nl" style={lnk}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
                {l}
              </a>
            ))}
            <a href="#/menu" className="nl" style={lnk}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
              Menu
            </a>
            <a href="#/reserve" className="nl" style={lnk}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
              Reserve
            </a>
          </div>

          {/* Hamburger */}
          <button onClick={()=>setOpen(v=>!v)} aria-label="Toggle menu" style={{
            background:'none', border:'none', cursor:'pointer', padding:'4px 0',
            display:'flex', flexDirection:'column', gap:5,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:'block', height:1, background:'rgba(255,255,255,0.8)',
                width: i===1 ? 14 : 20, transition:'transform 0.35s, opacity 0.35s',
                transform: open ? (i===0 ? 'rotate(45deg) translate(4px,4px)' : i===2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none') : 'none',
                opacity: open && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </div>
      </nav>

      {/* Slide-in panel */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:264, zIndex:49,
        background:'#1e2820', borderLeft:'1px solid rgba(255,255,255,0.07)',
        boxShadow: open ? '-4px 0 28px rgba(0,0,0,0.4)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.5s cubic-bezier(.16,1,.3,1)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'0 2.5rem', gap:'1.75rem',
      }}>
        {isHome && [['About','#about'],['Gallery','#gallery'],['Visit','#visit']].map(([l,h]) => (
          <a key={l} href={h} onClick={()=>setOpen(false)} style={lnk}
            onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
            {l}
          </a>
        ))}
        <a href="#/menu" onClick={()=>setOpen(false)} style={lnk}
          onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
          onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
          Menu
        </a>
        <a href="#/reserve" onClick={()=>setOpen(false)} style={lnk}
          onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
          onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.68)')}>
          Reserve
        </a>
        <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color:'rgba(255,255,255,0.28)', fontSize:11, letterSpacing:'0.14em', fontFamily:"'Jost',sans-serif", fontWeight:300, lineHeight:1.8, margin:0 }}>
            R102 · East London<br/>Mon–Sat 8 AM–4 PM · Sun 8 AM–1 PM
          </p>
        </div>
      </div>

      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, zIndex:48, background:'rgba(0,0,0,0.35)' }}/>}
    </>
  );
}

/* ─── HERO 3D ──────────────────────────────────────────────── */
function Hero3D({ onHeroOut }: { onHeroOut: (gone: boolean) => void }) {
  const sectionRef  = useRef<HTMLElement>(null);
  const worldRef    = useRef<HTMLDivElement>(null);
  const focusedRef  = useRef<number | null>(null);
  const [loaded,  setLoaded]  = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  /* Hero visibility → show/hide nav logo */
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => onHeroOut(!e.isIntersecting), { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, [onHeroOut]);

  /* Fade-in once enough images load */
  useEffect(() => {
    const imgs = sectionRef.current?.querySelectorAll('img');
    if (!imgs?.length) { setLoaded(true); return; }
    let n = 0; const need = Math.min(imgs.length, 5);
    const check = () => { if (++n >= need) setLoaded(true); };
    imgs.forEach(img => img.complete ? check() : img.addEventListener('load', check, { once:true }));
  }, []);

  /* Body overflow reset on unmount */
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  /* RAF-based camera tilt + scroll drift (zero React re-renders) */
  useEffect(() => {
    if (isMobile) return;
    const world = worldRef.current; if (!world) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, scrollZ = 0;
    let raf: number;

    const tick = () => {
      if (focusedRef.current === null) {
        cx = lerp(cx, tx, 0.038);
        cy = lerp(cy, ty, 0.038);
        world.style.transition = 'none';
        world.style.transform  = `rotateX(${cy}deg) rotateY(${cx}deg) translateZ(${scrollZ}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMouse = (e: MouseEvent) => {
      if (focusedRef.current !== null) return;
      const hw = window.innerWidth / 2, hh = window.innerHeight / 2;
      tx = (e.clientX - hw) / hw * 5.5;
      ty = -(e.clientY - hh) / hh * 3.5;
    };

    const onScroll = () => {
      if (focusedRef.current !== null) return;
      scrollZ = -(window.scrollY / Math.max(window.innerHeight, 1)) * 90;
    };

    window.addEventListener('mousemove', onMouse);
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  /* Focus / unfocus an image */
  const handleClick = (idx: number) => {
    const world = worldRef.current; if (!world) return;

    if (focusedRef.current === idx) {
      /* ── unfocus ── */
      focusedRef.current = null;
      setFocused(null);
      setCaption('');
      document.body.style.overflow = '';
      world.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1)';
      world.style.transform  = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
      /* hand back to RAF after transition */
      setTimeout(() => { if (world && focusedRef.current === null) world.style.transition = 'none'; }, 1150);
    } else {
      /* ── focus ── */
      const img = GALLERY[idx];
      focusedRef.current = idx;
      setFocused(idx);
      setCaption(img.caption);
      document.body.style.overflow = 'hidden';
      world.style.transition = 'transform 1.25s cubic-bezier(.16,1,.3,1)';
      world.style.transform  = `translate3d(${-img.x}px, ${-img.y}px, ${-img.z + 115}px)`;
    }
  };

  const blurFor = (z: number) => Math.max(0, (-z - 45) / 88);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        height: '100svh', minHeight: 520,
        overflow: 'hidden',
        background: '#1a1a18',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease',
      }}
    >
      {/* ── DESKTOP: 3D canvas ──────────────────────────── */}
      {!isMobile && (
        <div style={{
          position:'absolute', inset:0,
          perspective:'920px', perspectiveOrigin:'50% 50%',
        }}>
          <div
            ref={worldRef}
            style={{
              position:'absolute', inset:0,
              transformStyle:'preserve-3d',
              willChange:'transform',
            }}
          >
            {GALLERY.map((img, i) => {
              const blur = blurFor(img.z);
              const isFoc = focused === i;
              const otherFoc = focused !== null && !isFoc;
              return (
                <div
                  key={i}
                  onClick={() => handleClick(i)}
                  style={{
                    position:'absolute', top:'50%', left:'50%',
                    width: img.w,
                    transform: `translate(-50%,-50%) translate3d(${img.x}px,${img.y}px,${img.z}px) rotateX(${img.rx}deg) rotateY(${img.ry}deg)`,
                    cursor:'pointer',
                    filter: blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none',
                    opacity: otherFoc ? 0.12 : 1,
                    transition: 'opacity 0.55s ease, filter 0.55s ease',
                  }}
                >
                  <div style={{
                    position:'relative', aspectRatio:'4/5', overflow:'hidden',
                    outline:'1px solid rgba(255,255,255,0.1)',
                    outlineOffset:'-1px',
                  }}>
                    <img
                      src={img.src}
                      alt={img.caption}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                      loading={i < 6 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MOBILE: flat scattered collage ──────────────── */}
      {isMobile && (
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          {GALLERY.slice(0, 8).map((img, i) => {
            const m = MOB[i];
            return (
              <div key={i} style={{
                position:'absolute',
                left: m.l, top: m.t, width: m.w,
                transform: `rotate(${m.rot}deg)`,
                opacity: 0.75,
              }}>
                <div style={{ aspectRatio:'4/5', overflow:'hidden' }}>
                  <img src={img.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </div>
              </div>
            );
          })}
          {/* Solid veil — no gradient */}
          <div style={{ position:'absolute', inset:0, background:'rgba(26,26,24,0.58)' }}/>
        </div>
      )}

      {/* ── Centred brand logotype ───────────────────────── */}
      <div
        className="hero-logo-enter"
        style={{
          position:'absolute', inset:0, zIndex:10,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          pointerEvents:'none',
          opacity: focused !== null ? 0 : 1,
          transition:'opacity 0.5s ease',
        }}
      >
          <img
                      src={imgLogo}
                      alt={imgLogo}
                      style={{ width:'50%', height:'50%', objectFit:'cover', display:'block' }}
                    />
        <h1 className="hero-logo-text" style={{
          color:'#fff',
          fontFamily:"'Stick No Bills:Regular'", fontWeight:200,
          fontSize:'clamp(14px,13vw,18px)', lineHeight:0.85,
          letterSpacing:'0.04em', margin:0,
        }}>
          Great Coffee | Ambience Of Warmth | Breakfast | Brunch | Light Meals All Day.
        </h1>
      </div>

      {/* ── Badge bottom-left ────────────────────────────── */}
      <div style={{
        position:'absolute', bottom:22, left:24, zIndex:11,
        opacity: focused !== null ? 0 : 0.5,
        transition:'opacity 0.4s',
        pointerEvents:'none',
      }}>
        <img src={imgLogo} alt="" style={{ height:28, display:'block' }}/>
      </div>

      {/* ── Badge bottom-right ───────────────────────────── */}
      <div style={{
        position:'absolute', bottom:26, right:26, zIndex:11,
        opacity: focused !== null ? 0 : 0.4,
        transition:'opacity 0.4s',
        pointerEvents:'none',
      }}>
        <p style={{
          color:'#fff', fontSize:9, letterSpacing:'0.22em',
          fontFamily:"'Jost',sans-serif", fontWeight:300,
          textTransform:'uppercase', margin:0,
        }}>
          East London · Est. 2023
        </p>
      </div>

      {/* ── Mobile-only scroll arrow ─────────────────────── */}
      <div className="mobile-only" style={{
        position:'absolute', bottom:22, left:'50%', transform:'translateX(-50%)',
        zIndex:11, flexDirection:'column', alignItems:'center', gap:6,
        opacity: focused !== null ? 0 : 1,
        transition:'opacity 0.4s',
      }}>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0 }}>
          Scroll
        </p>
        <div className="scroll-line"/>
      </div>

      {/* ── Caption + close when focused ─────────────────── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:20,
        padding:'1.5rem clamp(1.25rem,4vw,2.5rem)',
        display:'flex', alignItems:'flex-end', justifyContent:'space-between',
        borderTop:'1px solid rgba(255,255,255,0.1)',
        background:'rgba(26,26,24,0.7)',
        opacity: focused !== null ? 1 : 0,
        transform: focused !== null ? 'translateY(0)' : 'translateY(8px)',
        transition:'opacity 0.5s cubic-bezier(.16,1,.3,1) 0.25s, transform 0.5s cubic-bezier(.16,1,.3,1) 0.25s',
        pointerEvents: focused !== null ? 'auto' : 'none',
      }}>
        <p style={{
          color:'rgba(255,255,255,0.8)', fontSize:11, letterSpacing:'0.22em',
          textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0,
        }}>
          reat Coffee | Ambience Of Warmth | Breakfast | Brunch | Light Meals All Day.
        </p>
        <button
          onClick={() => focused !== null && handleClick(focused)}
          style={{
            background:'none', border:'1px solid rgba(255,255,255,0.3)',
            color:'rgba(255,255,255,0.6)', fontSize:10, letterSpacing:'0.2em',
            textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
            padding:'7px 14px', cursor:'pointer',
            transition:'border-color 0.3s, color 0.3s',
          }}
        >
          Close
        </button>
      </div>
    </section>
  );
}

/* ─── STATEMENT ────────────────────────────────────────────── */
function Statement() {
  const { ref, vis } = useReveal<HTMLDivElement>();
  return (
    <section style={{ background:'#f5f0e8', padding:'clamp(4.5rem,9vh,7rem) clamp(1.25rem,5vw,3rem)' }}>
      <div ref={ref} style={{ maxWidth:580, margin:'0 auto', textAlign:'center' }}>
        <p
          className={`reveal ${vis ? 'in' : ''}`}
          style={{
            color:'#364652', fontSize:'clamp(14px,1.8vw,17px)',
            lineHeight:1.85, letterSpacing:'0.04em',
            fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0,
          }}
        >
          Great Coffee | Ambience Of Warmth | Breakfast | Brunch | Light Meals All Day.
        </p>
      </div>
    </section>
  );
}

/* ─── LETTER ────────────────────────────────────────────────── */
const FULL_LETTER = `Our Story,


Built from a vision. Rooted in Quigney.

Kofini&Co. began in September 2023, when **Lwandiswa “Lwandy” Ngebe** saw potential in a space others had overlooked. Drawing from years of experience in hospitality and lessons learned from her mother’s entrepreneurial journey, she built Kofini from the ground up — not as a franchise, but as a homegrown business with a bigger purpose.

Today, Kofini&Co. is about more than hospitality. It is about **creating opportunities, supporting local entrepreneurs and creatives, creating jobs, and building a space where people can connect and grow.

From Quigney, for the community.

`;

function Letter() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { ref: imgRef, vis: imgVis } = useReveal<HTMLDivElement>(0.1);
  const { ref: txtRef, vis: txtVis } = useReveal<HTMLDivElement>(0.1);

  const lnkStyle: React.CSSProperties = {
    background:'none', border:'none', padding:0, cursor:'pointer',
    color:'rgba(255,255,255,0.55)', fontSize:11, letterSpacing:'0.22em',
    textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
    display:'flex', alignItems:'center', gap:10,
    transition:'color 0.35s',
    textDecoration:'none',
  };

  return (
    <section id="about" style={{ background:'#364652', padding:'clamp(5rem,10vh,8rem) clamp(1.25rem,5vw,3rem)' }}>

      {/* ── Letter drop-down panel ── */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:60,
        background:'#1e2820',
        borderBottom:'1px solid rgba(255,255,255,0.09)',
        boxShadow: panelOpen ? '0 6px 32px rgba(0,0,0,0.4)' : 'none',
        transform: panelOpen ? 'translateY(0)' : 'translateY(-100%)',
        transition:'transform 0.6s cubic-bezier(.16,1,.3,1), box-shadow 0.4s',
        maxHeight:'88vh', overflow:'auto',
      }}>
        <div style={{ maxWidth:520, margin:'0 auto', padding:'5rem clamp(1.25rem,4vw,2.5rem) 4rem' }}>
          <p style={{
            color:'rgba(255,255,255,0.65)', fontSize:14, lineHeight:2.1,
            fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em',
            whiteSpace:'pre-line', margin:0,
          }}>
            {FULL_LETTER}
          </p>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              ...lnkStyle,
              marginTop:'3rem',
              color:'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <ArrLeft /> Close
          </button>
        </div>
      </div>
      {panelOpen && (
        <div onClick={() => setPanelOpen(false)} style={{ position:'fixed', inset:0, zIndex:59, background:'rgba(0,0,0,0.28)' }}/>
      )}

      {/* ── Split layout ── */}
      <div style={{
        maxWidth:1100, margin:'0 auto',
        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))',
        gap:'clamp(2.5rem,5vw,5rem)', alignItems:'center',
      }}>
        {/* Image */}
        <div
          ref={imgRef}
          className={`reveal-left ${imgVis ? 'in' : ''}`}
          style={{ aspectRatio:'4/5', overflow:'hidden' }}
        >
          <img
            src={imgAB}
            alt="Garden Terrace at Café Jardin"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
        </div>

        {/* Text */}
        <div ref={txtRef}>
          <p
            className={`reveal ${txtVis ? 'in' : ''}`}
            style={{
              color:'rgba(255,255,255,0.35)', fontSize:10, letterSpacing:'0.32em',
              textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
              marginBottom:'1.75rem',
            }}
          >
            East London · South Africa
          </p>

          <h2 style={{ margin:'0 0 2rem', lineHeight:1.15 }}>
            {['About Kofini&Co.'].map((line, i) => (
              <RL key={i} delay={i * 0.09} vis={txtVis}>
                <span style={{
                  display:'block',
                  color:'#fff',
                  fontSize:'clamp(26px,3.5vw,40px)',
                  letterSpacing:'0.14em', textTransform:'uppercase',
                  fontFamily:"'Jost',sans-serif", fontWeight:300,
                }}>
                  {line}
                </span>
              </RL>
            ))}
          </h2>

          <p style={{
            color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.95,
            fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em',
            maxWidth:400, marginBottom:'2.5rem',
          }}>
          

          Rooted in Quigney. Inspired by community.

          EKofini&Co. celebrates the people, culture, stories, and coastal spirit that make our community unique. We’re about creating meaningful experiences, celebrating our heritage, and bringing people together.

          Our place. Our people. Our story.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            <button
              onClick={() => setPanelOpen(true)}
              style={lnkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <Arr /> Read our story
            </button>
            <a
              href="#reserve"
              style={lnkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <Arr /> Reserve a table
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── DIVIDER ──────────────────────────────────────────────── */
function Divider() {
  return <div className="divider" />;
}

/* ─── THREE CARDS ──────────────────────────────────────────── */
const CARDS = [
  { src:imgFD, cat:'From the Kitchen', title:'Great Views',   desc:'Located on the beach front Ekofini&Co provides immaculate views of the ocean.' },
  { src:imgG4, cat:'Garden Dining',    title:'Quench your thirst',     desc:'our Menu contains a variety of refreshing drinks and vegan options.'  },
  { src:imgG3, cat:'All-Day Breakfast', title:'Morning Ritual', desc:'Simple, satisfying food from a kitchen that cares about every plate it sends out.'   },
];

function Cards() {
  const { ref: hRef, vis: hVis } = useReveal<HTMLDivElement>();
  const { ref: cRef, vis: cVis } = useReveal<HTMLDivElement>(0.06);

  return (
    <section id="gallery" style={{ background:'#202020', padding:'clamp(5rem,10vh,8rem) clamp(1.25rem,5vw,3rem)' }}>
      {/* Label */}
      <div ref={hRef} style={{ marginBottom:'3rem', textAlign:'center' }}>
        <RL vis={hVis} delay={0}>
          <p style={{
            color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:'0.32em',
            textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0,
          }}>
            What We Offer
          </p>
        </RL>
      </div>

      {/* Cards */}
      <div ref={cRef} className="cards-row" style={{ maxWidth:1060, margin:'0 auto' }}>
        {CARDS.map((card, i) => (
          <div
            key={i}
            style={{
              opacity: cVis ? 1 : 0,
              transform: cVis ? 'translateY(0)' : 'translateY(64px)',
              transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${i * 0.1}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${i * 0.1}s`,
            }}
          >
            <div
              style={{ cursor:'default', transition:'transform 0.55s cubic-bezier(.16,1,.3,1)' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.025)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ aspectRatio:'4/5', overflow:'hidden', marginBottom:'1.25rem' }}>
                <img
                  src={card.src} alt={card.title}
                  style={{
                    width:'100%', height:'100%', objectFit:'cover', display:'block',
                    transition:'transform 0.7s cubic-bezier(.16,1,.3,1)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  loading="lazy"
                />
              </div>
              <p style={{
                color:'rgba(255,255,255,0.28)', fontSize:9, letterSpacing:'0.28em',
                textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
                marginBottom:8, margin:'0 0 8px',
              }}>
                {card.cat}
              </p>
              <h3 style={{
                color:'#fff', fontSize:'clamp(13px,1.5vw,16px)',
                letterSpacing:'0.18em', textTransform:'uppercase',
                fontFamily:"'Jost',sans-serif", fontWeight:300,
                margin:'0 0 10px',
              }}>
                {card.title}
              </h3>
              <p style={{
                color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.75,
                fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.03em',
                margin:0,
              }}>
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PULL QUOTE ───────────────────────────────────────────── */
function PullQuote() {
  const { ref, vis } = useReveal<HTMLDivElement>(0.18);

  return (
    <section style={{ background:'#364652', padding:'clamp(6rem,13vh,11rem) clamp(1.25rem,5vw,3rem)' }}>
      <div ref={ref} style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
        <p style={{
          color:'rgba(255,255,255,0.28)', fontSize:10, letterSpacing:'0.32em',
          textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
          marginBottom:'2.25rem',
        }}>
          Ekofini&Co. 
        </p>
        <blockquote style={{ margin:0 }}>
          {['"A quiet escape', 'with ocean views', 'and sea breeze."'].map((line, i) => (
            <RL key={i} delay={i * 0.13} vis={vis}>
              <span style={{
                display:'block',
                color:'#fff',
                fontSize:'clamp(26px,4.5vw,54px)',
                letterSpacing:'0.1em', lineHeight:1.18,
                fontFamily:"'Jost',sans-serif", fontWeight:300,
              }}>
                {line}
              </span>
            </RL>
          ))}
        </blockquote>
      </div>
    </section>
  );
}

/* ─── INFO + FOOTER ────────────────────────────────────────── */
function Info() {
  const { ref, vis } = useReveal<HTMLDivElement>(0.1);

  const colStyle = (delay: number): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.9s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}s`,
  });

  const lbl: React.CSSProperties = {
    color:'rgba(255,255,255,0.28)', fontSize:10, letterSpacing:'0.3em',
    textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
    marginBottom:'1.25rem',
  };
  const body: React.CSSProperties = {
    color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.85,
    fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em',
  };

  return (
    <>
      <section id="visit" style={{ background:'#1e2820', padding:'clamp(5rem,10vh,8rem) clamp(1.25rem,5vw,3rem)' }}>
        <div
          ref={ref}
          style={{
            maxWidth:960, margin:'0 auto',
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))',
            gap:'4rem',
          }}
        >
          {/* Location */}
          <div style={colStyle(0)}>
            <p style={lbl}>Location</p>
            <p style={body}>12 Esplanade Street, Quigney, East London<br/>South Africa</p>
            <div style={{ marginTop:'2rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {[
      
                ['061 727 6152',         'tel:+27 61 727 6152'],
                ['@Ekofini&Co',           '#'],
              ].map(([label, href]) => (
                <a key={label} href={href} style={{
                  color:'rgba(255,255,255,0.35)', fontSize:12, letterSpacing:'0.08em',
                  fontFamily:"'Jost',sans-serif", fontWeight:300, textDecoration:'none',
                  transition:'color 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div style={colStyle(0.1)}>
            <p style={lbl}>Hours</p>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <tbody>
                {[
                  ['Monday',    '8:00 AM – 4:00 PM'],
                  ['Tuesday',   '8:00 AM – 4:00 PM'],
                  ['Wednesday', '8:00 AM – 4:00 PM'],
                  ['Thursday',  '8:00 AM – 4:00 PM'],
                  ['Friday',    '8:00 AM – 4:00 PM'],
                  ['Saturday',  '8:00 AM – 4:00 PM'],
                  ['Sunday',    '8:00 AM – 1:00 PM'],
                ].map(([day, time]) => (
                  <tr key={day} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding:'0.65rem 0', ...body, fontSize:12 }}>{day}</td>
                    <td style={{ padding:'0.65rem 0', ...body, fontSize:12, textAlign:'right', color:'rgba(255,255,255,0.75)' }}>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reserve */}
          <div id="reserve" style={colStyle(0.2)}>
            <p style={lbl}>Reserve</p>
            <p style={{ ...body, marginBottom:'2rem' }}>
              We welcome walk-ins. For larger gatherings or special occasions, reach out below.
            </p>
            <a
              href="wa.me/0617276152?text=Hi%20Ekofini%26Co.%2C%20I%27d%20like%20to%20make%20an%20enquiry."
              style={{
                color:'rgba(255,255,255,0.45)', fontSize:11, letterSpacing:'0.22em',
                textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
                textDecoration:'none', display:'flex', alignItems:'center', gap:10,
                transition:'color 0.35s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              <Arr /> Make an Enquiry
            </a>
          </div>
        </div>
      </section>

      {/* Footer bar */}
      <footer style={{
        background:'#111110',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        padding:'1.25rem clamp(1.25rem,4vw,3rem)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:'1rem',
      }}>
        <img src={imgLogo} alt="Ekofini&Co." style={{ height:26, opacity:0.35 }}/>
        <p style={{
          color:'rgba(255,255,255,0.22)', fontSize:10, letterSpacing:'0.18em',
          fontFamily:"'Jost',sans-serif", fontWeight:300, textTransform:'uppercase', margin:0,
        }}>
          All rights reserved · Ekofini&Co. · 2026
        </p>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          {['Instagram','Facebook'].map(s => (
            <a key={s} href="#" style={{
              color:'rgba(255,255,255,0.22)', fontSize:10, letterSpacing:'0.15em',
              textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
              textDecoration:'none', transition:'color 0.35s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}>
              {s}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

/* ─── HOME ─────────────────────────────────────────────────── */
function Home() {
  const [heroGone, setHeroGone] = useState(false);
  return (
    <>
      <Hero3D onHeroOut={setHeroGone} />
      <Statement />
      <Letter />
      <Divider />
      <Cards />
      <PullQuote />
      <Info />
      {/* expose heroGone for Nav via context workaround: pass up via setter */}
      <span style={{ display:'none' }} data-hero-gone={String(heroGone)}/>
    </>
  );
}

/* ─── MENU PAGE ────────────────────────────────────────────── */
function MenuPage() {
  const pad = 'clamp(1.25rem,4vw,3rem)';
  const lbl: React.CSSProperties = {
    color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:'0.3em',
    textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
  };
  return (
    <div style={{ minHeight:'100svh', background:'#1a1a18', paddingTop:64, display:'flex', flexDirection:'column' }}>
      {/* Page header */}
      <div style={{
        padding:`clamp(2.5rem,5vh,4rem) ${pad} 1.5rem`,
        display:'flex', alignItems:'flex-end', justifyContent:'space-between',
        flexWrap:'wrap', gap:'1rem',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
      }}>
        <div>
          <p style={{ ...lbl, marginBottom:'0.5rem' }}>Our Menu</p>
          <h1 style={{
            color:'#fff', fontSize:'clamp(24px,3.5vw,38px)',
            letterSpacing:'0.20em', textTransform:'uppercase',
            fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0,
          }}>Ekofini&Co. Menu
          </h1>
        </div>
        <a href="#/reserve" style={{
          color:'rgba(255,255,255,0.45)', fontSize:11, letterSpacing:'0.22em',
          textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
          textDecoration:'none', display:'flex', alignItems:'center', gap:8,
          transition:'color 0.3s',
        }}
        onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
        onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
          <Arr size={13}/> Reserve a table
        </a>
      </div>

      {/* Flipbook embed — fills remaining viewport height */}
      <div style={{ flex:1, minHeight:'calc(100svh - 200px)', padding:`clamp(1.5rem,3vw,2.5rem) ${pad}` }}>
        <iframe
          src="https://flipbook.so/embed/PRTguMho44fFLfnJZE4V"
          width="100%"
          height="100%"
          style={{ border:'none', display:'block', minHeight:'clamp(480px,70vh,860px)', background:'transparent' }}
          allow="fullscreen; web-share; clipboard-write"
          allowFullScreen
          title="Café Jardin Menu"
        />
      </div>

      {/* Footer strip */}
      <div style={{
        borderTop:'1px solid rgba(255,255,255,0.06)',
        padding:`1.25rem ${pad}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'1rem', background:'#111110',
      }}>
        <p style={{ ...lbl, margin:0, letterSpacing:'0.18em' }}>
          Prices include VAT · Menu subject to change
        </p>
        <a href="https://wa.me/+27617276152?text=Hi%20Ekofini%26Co.%2C%20I%27d%20like%20to%20make%20an%20enquiry." style={{
          color:'rgba(255,255,255,0.38)', fontSize:11, letterSpacing:'0.22em',
          textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
          textDecoration:'none', display:'flex', alignItems:'center', gap:8, transition:'color 0.3s',
        }}
        onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
        onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.38)')}>
          <Arr size={13}/> Enquire
        </a>
      </div>
    </div>
  );
}

/* ─── RESERVE PAGE ─────────────────────────────────────────── */
const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 8; h <= 15; h++) {
    const hh = h.toString().padStart(2, '0');
    slots.push(`${hh}:00`);
    if (h < 15) slots.push(`${hh}:30`);
  }
  return slots;
})();

function ReservePage() {
  const [form, setForm] = useState({ name:'', date:'', time:'08:00', guests:'2', notes:'' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg =
      `Hi Ekofini&Co.! I'd like to make a reservation.\n\n` +
      `Name: ${form.name}\n` +
      `Date: ${form.date}\n` +
      `Time: ${form.time}\n` +
      `Guests: ${form.guests}\n` +
      (form.notes ? `Notes: ${form.notes}` : '');
    window.open(`https://wa.me/+27617276152?text=${encodeURIComponent(msg)}`, '_blank');
    setSubmitted(true);
  };

  const pad = 'clamp(1.25rem,4vw,3rem)';
  const lbl: React.CSSProperties = { color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300 };
  const fieldLabel: React.CSSProperties = { color:'rgba(255,255,255,0.38)', fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, display:'block', marginBottom:'0.5rem' };

  return (
    <div style={{ minHeight:'100svh', background:'#1a1a18', paddingTop:64 }}>
      {/* Page header */}
      <div style={{ padding:`clamp(2.5rem,5vh,4rem) ${pad} 0`, borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:'1.5rem' }}>
        <p style={{ ...lbl, marginBottom:'0.5rem' }}>Book a Table</p>
        <h1 style={{
          color:'#fff', fontSize:'clamp(24px,3.5vw,38px)',
          letterSpacing:'0.14em', textTransform:'uppercase',
          fontFamily:"'Jost',sans-serif", fontWeight:300, margin:0,
        }}>
          Reserve
        </h1>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))',
        maxWidth:1100, margin:'0 auto',
        padding:`clamp(3rem,6vh,5rem) ${pad}`,
        gap:'clamp(3rem,6vw,6rem)',
        alignItems:'start',
      }}>

        {/* ── Form ── */}
        <div>
          {submitted ? (
            <div style={{ animation:'spread-enter 0.5s cubic-bezier(.16,1,.3,1) both' }}>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, marginBottom:'1.25rem' }}>
                WhatsApp opened
              </p>
              <h2 style={{ color:'#fff', fontSize:'clamp(20px,2.5vw,28px)', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300, marginBottom:'1rem' }}>
                Your message is ready
              </h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.9, fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em', marginBottom:'2.5rem' }}>
                We'll confirm your reservation as soon as possible. If WhatsApp didn't open, you can also reach us directly below.
              </p>
              <button onClick={()=>setSubmitted(false)} style={{
                background:'none', border:'none', padding:0, cursor:'pointer',
                color:'rgba(255,255,255,0.5)', fontSize:11, letterSpacing:'0.22em',
                textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
                display:'flex', alignItems:'center', gap:8, transition:'color 0.3s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
                <ArrLeft size={13}/> Make another booking
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
              {/* Name */}
              <div>
                <label htmlFor="r-name" style={fieldLabel}>Your name</label>
                <input
                  id="r-name" type="text" required value={form.name}
                  onChange={set('name')} placeholder="Name"
                  className="field"
                />
              </div>

              {/* Date + Time */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <div>
                  <label htmlFor="r-date" style={fieldLabel}>Date</label>
                  <input
                    id="r-date" type="date" required value={form.date}
                    onChange={set('date')}
                    min={new Date().toISOString().split('T')[0]}
                    className="field"
                    style={{ colorScheme:'dark' }}
                  />
                </div>
                <div>
                  <label htmlFor="r-time" style={fieldLabel}>Time</label>
                  <select id="r-time" value={form.time} onChange={set('time')} className="field">
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label htmlFor="r-guests" style={fieldLabel}>Number of guests</label>
                <select id="r-guests" value={form.guests} onChange={set('guests')} className="field">
                  {Array.from({length:20},(_,i)=>i+1).map(n=>(
                    <option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="r-notes" style={fieldLabel}>Special requests <span style={{ opacity:0.5 }}>(optional)</span></label>
                <textarea
                  id="r-notes" value={form.notes} onChange={set('notes')}
                  placeholder="Dietary requirements, celebrations, accessibility needs…"
                  rows={3}
                  className="field"
                  style={{ resize:'none', display:'block' }}
                />
              </div>

              {/* Submit */}
              <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap', marginTop:'0.5rem' }}>
                <button type="submit" style={{
                  background:'none', border:'none', padding:0, cursor:'pointer',
                  color:'#fff', fontSize:12, letterSpacing:'0.24em',
                  textTransform:'uppercase', fontFamily:"'Jost',sans-serif", fontWeight:300,
                  display:'flex', alignItems:'center', gap:10, transition:'gap 0.3s',
                }}
                onMouseEnter={e=>(e.currentTarget.style.gap='16px')}
                onMouseLeave={e=>(e.currentTarget.style.gap='10px')}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" opacity={0.9}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a9.87 9.87 0 01-4.721-1.195l-3.392.887.907-3.302A9.872 9.872 0 012.15 12.03C2.15 6.58 6.58 2.15 12.03 2.15c5.449 0 9.879 4.43 9.879 9.879-.001 5.449-4.431 9.851-9.88 9.851z"/>
                  </svg>
                  Send via WhatsApp
                </button>
                <span style={{ color:'rgba(255,255,255,0.2)', fontSize:11, fontFamily:"'Jost',sans-serif", fontWeight:300 }}>
                  Opens WhatsApp with your details
                </span>
              </div>
            </form>
          )}
        </div>

        {/* ── Info sidebar ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'2rem' }}>
          <div style={{ marginBottom:'2.5rem' }}>
            <p style={{ ...lbl, marginBottom:'1rem' }}>Location</p>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.9, fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em', margin:0 }}>
              R102, East London<br/>South Africa
            </p>
          </div>
          <div style={{ marginBottom:'2.5rem' }}>
            <p style={{ ...lbl, marginBottom:'1rem' }}>Hours</p>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.9, fontFamily:"'Jost',sans-serif", fontWeight:300, letterSpacing:'0.04em', margin:0 }}>
              Monday – Saturday&ensp;8:00 AM – 4:00 PM<br/>
              Sunday&ensp;8:00 AM – 1:00 PM
            </p>
          </div>
          <div>
            <p style={{ ...lbl, marginBottom:'1rem' }}>Contact directly</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {[
                { label:'+27617276152',        href:'https://wa.me/+27617276152' },
              
                
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                  color:'rgba(255,255,255,0.38)', fontSize:12, letterSpacing:'0.08em',
                  fontFamily:"'Jost',sans-serif", fontWeight:300, textDecoration:'none',
                  transition:'color 0.3s',
                }}
                onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,0.8)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.38)')}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Decorative image */}
          <div style={{ marginTop:'2.5rem', aspectRatio:'4/3', overflow:'hidden', opacity:0.6 }}>
            <img src={imgAB} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ──────────────────────────────────────────────────── */
export default function App() {
  const route    = useRoute();
  const [heroGone, setHeroGone] = useState(false);

  // reset heroGone when navigating away from home
  useEffect(() => { if (route !== 'home') setHeroGone(false); }, [route]);

  return (
    <div style={{ fontFamily:"'Jost',sans-serif", fontWeight:300 }}>
      <Nav showLogo={heroGone} route={route} />
      {route === 'menu'    && <MenuPage />}
      {route === 'reserve' && <ReservePage />}
      {route === 'home'    && (
        <>
          <Hero3D onHeroOut={setHeroGone} />
          <Statement />
          <Letter />
          <Divider />
          <Cards />
          <PullQuote />
          <Info />
        </>
      )}
    </div>
  );
}
