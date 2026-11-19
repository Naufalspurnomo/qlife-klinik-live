/* Q-Life Klinik — "Napas" breathing WebGL gradient.
   Raw WebGL2, zero dependency. A living fluid field in brand colors
   that slowly breathes (inhale/exhale) and reacts to the pointer.
   Concept: ozone = oxygen = life force. The site breathes. */
(function () {
  "use strict";
  const canvas = document.getElementById('bgfx');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.style.display = 'none'; return; }

  const VERT = `
    attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

  // flowing FBM noise gradient, brand palette, breathing intensity
  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform float u_breath;   // 0..1 slow breathing
    uniform float u_vel;      // scroll velocity (smoothed)
    // hash + value noise
    float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
      vec2 u=f*f*(3.-2.*f);
      return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
    }
    float fbm(vec2 p){
      float v=0., a=.5;
      for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.02; a*=.5; }
      return v;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy/u_res.xy;
      vec2 asp = vec2(u_res.x/u_res.y,1.);
      vec2 p = uv*asp;
      float t = u_time*0.075;
      // breathing warps the domain (inhale expands, exhale contracts)
      float br = 0.5+0.5*u_breath;
      // scroll velocity intensifies + stretches the flow (site reacts to movement)
      float sv = clamp(abs(u_vel), 0.0, 1.0);
      vec2 q = vec2(fbm(p*1.3 + t + sv*0.6), fbm(p*1.3 - t + 4.2 - sv*0.4));
      vec2 r = vec2(fbm(p*1.3 + q*(1.4+0.6*br+sv*0.5) + t*1.2 + 1.7),
                    fbm(p*1.3 + q*(1.4+0.6*br+sv*0.5) - t*0.9 + 8.3));
      float f = fbm(p*1.25 + r*(1.6+0.5*br+sv*0.7));
      // pointer adds a gentle warm swell
      float md = 1.0 - smoothstep(0.0, 0.9, distance(uv*asp, u_mouse*asp));
      f += md*0.14;
      f = clamp(f,0.,1.);
      // brand palette — visibly green from mint through deep botanical teal, gold filaments
      vec3 mint  = vec3(0.722,0.871,0.824);   // #B8DED2
      vec3 sage  = vec3(0.718,0.839,0.808);   // #B7D6CE
      vec3 euca  = vec3(0.420,0.682,0.631);   // #6BAEA1
      vec3 teal  = vec3(0.137,0.435,0.404);   // #236F67
      vec3 deep  = vec3(0.090,0.310,0.290);   // #175048
      vec3 gold  = vec3(0.760,0.580,0.240);
      vec3 col = mix(mint, sage, smoothstep(0.10,0.42,f));
      col = mix(col, euca, smoothstep(0.42,0.66,f));
      col = mix(col, teal, smoothstep(0.66,0.84,f));
      col = mix(col, deep, smoothstep(0.84,1.0,f));
      // pointer warm swell
      col = mix(col, euca, md*0.18);
      // gold filament where r is high (rare, subtle)
      float g = smoothstep(0.74,0.97,r.x*r.y);
      col = mix(col, gold, g*0.16*br);
      // breathing luminance
      col += (u_breath-0.5)*0.035;
      // protect the headline: lift a green-tinted light zone in the vertical-center band
      float band = smoothstep(0.60,0.28,abs(uv.y-0.46));
      col = mix(col, mint, band*0.34);
      // scroll velocity warms + deepens the field (site reacts to movement)
      col = mix(col, teal, sv*0.12);
      // gentle green-tinted vignette for video-strip contrast
      float vig = smoothstep(1.25,0.30,length(uv-vec2(0.5,0.42)));
      col = mix(col, mint, (1.0-vig)*0.20);
      // cap luminance so breathing and layered mixes never wash out toward white
      col = min(col, vec3(0.800,0.900,0.860));
      gl_FragColor = vec4(col,1.0);
    }`;

  function sh(type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(s)); } return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

  const U = {
    res: gl.getUniformLocation(prog,'u_res'),
    time: gl.getUniformLocation(prog,'u_time'),
    mouse: gl.getUniformLocation(prog,'u_mouse'),
    breath: gl.getUniformLocation(prog,'u_breath'),
    vel: gl.getUniformLocation(prog,'u_vel'),
  };

  const hero = canvas.closest('.hero') || document.querySelector('.hero');
  let W=0,H=0;
  const RENDER_SCALE = 0.5;  // render gradient at half res, CSS upscales; soft noise hides it
  function resize(){
    const r = (hero || canvas).getBoundingClientRect();
    const nextW = Math.max(1, (r.width*RENDER_SCALE)|0);
    const nextH = Math.max(1, (r.height*RENDER_SCALE)|0);
    if (nextW === W && nextH === H) return;
    W = nextW; H = nextH;
    canvas.width=W; canvas.height=H; gl.viewport(0,0,W,H);
  }
  addEventListener('resize', resize);
  let heroResizeObserver = null;
  if (hero && 'ResizeObserver' in window) {
    heroResizeObserver = new ResizeObserver(resize);
    heroResizeObserver.observe(hero);
  }
  resize();

  let mx=0.5, my=0.5, tmx=0.5, tmy=0.5;
  addEventListener('mousemove', e=>{ tmx=e.clientX/innerWidth; tmy=1.0-e.clientY/innerHeight; });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observesHero = Boolean(hero && 'IntersectionObserver' in window);
  let pageVisible = !document.hidden;
  let heroVisible = !observesHero;
  let reducedFrameRendered = false;
  let rafId = null;
  let start=performance.now();
  let vel=0;

  function canScheduleFrame(){
    return pageVisible && heroVisible && (!reduced || !reducedFrameRendered);
  }

  function scheduleFrame(){
    if (rafId === null && canScheduleFrame()) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function syncAnimation(){
    if (canScheduleFrame()) {
      scheduleFrame();
    } else if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('visibilitychange', ()=>{
    pageVisible = !document.hidden;
    syncAnimation();
  });

  // Pause when the hero is off-screen without taking ownership of the render loop.
  if (hero && 'IntersectionObserver' in window){
    new IntersectionObserver(es=>{
      es.forEach(en=>{ heroVisible = en.isIntersecting; });
      syncAnimation();
    }, {threshold:0}).observe(hero);
  }

  function loop(now){
    rafId = null;
    if (!pageVisible || !heroVisible) return;
    const t=(now-start)/1000;
    mx+=(tmx-mx)*0.05; my+=(tmy-my)*0.05;
    // pull smoothed scroll velocity exposed by Lenis in main.js
    const targetV = Math.min(Math.abs(window.__qlifeScrollV||0)/40, 1.0);
    vel += (targetV - vel) * 0.08;
    // breathing: ~5.5s cycle (like calm breath)
    const breath = 0.5+0.5*Math.sin(t*(2*Math.PI/5.5));
    gl.uniform2f(U.res, W, H);
    gl.uniform1f(U.time, reduced?12.0:t);
    gl.uniform2f(U.mouse, mx, my);
    gl.uniform1f(U.breath, reduced?0.5:breath);
    gl.uniform1f(U.vel, reduced?0.0:vel);
    gl.drawArrays(gl.TRIANGLES,0,3);
    if (reduced) {
      reducedFrameRendered = true;
    } else {
      scheduleFrame();
    }
  }

  scheduleFrame();
})();
