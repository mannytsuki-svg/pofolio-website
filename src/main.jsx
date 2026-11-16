import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { email, phone, projects, strengths } from './content.js';
import SpecularFrame from './SpecularFrame.jsx';
import ProjectReveal from './ProjectReveal.jsx';
import './styles.css';

const media = (file) => `${import.meta.env.BASE_URL}media/${file}`;

function Arrow({ direction = 'up' }) {
  return <span aria-hidden="true">{direction === 'down' ? '↓' : '↗'}</span>;
}

function Hero() {
  const hero = useRef(null);
  const parallax = useRef(null);
  useEffect(() => {
    const section = hero.current;
    const layer = parallax.current;
    const enabled = window.matchMedia('(min-width: 1024px) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
    const target = { x: 50, y: 50 };
    const spotlight = { ...target };
    const grid = { x: 0, y: 0 };
    let frame = 0;

    function animate() {
      spotlight.x += (target.x - spotlight.x) * 0.1;
      spotlight.y += (target.y - spotlight.y) * 0.1;
      const gridX = (spotlight.x - 50) * 0.32;
      const gridY = (spotlight.y - 50) * 0.32;
      grid.x += (gridX - grid.x) * 0.06;
      grid.y += (gridY - grid.y) * 0.06;
      layer.style.setProperty('--spot-x', `${spotlight.x.toFixed(2)}%`);
      layer.style.setProperty('--spot-y', `${spotlight.y.toFixed(2)}%`);
      layer.style.setProperty('--grid-offset', `${grid.x.toFixed(2)}px ${grid.y.toFixed(2)}px`);

      const remaining = Math.hypot(target.x - spotlight.x, target.y - spotlight.y)
        + Math.hypot(gridX - grid.x, gridY - grid.y);
      frame = remaining > 0.05 ? requestAnimationFrame(animate) : 0;
    }

    function follow(event) {
      if (!enabled.matches || event.pointerType !== 'mouse') return;
      const bounds = section.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width) * 100;
      target.y = ((event.clientY - bounds.top) / bounds.height) * 100;
      layer.dataset.active = 'true';
      if (!frame) frame = requestAnimationFrame(animate);
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      spotlight.x = target.x = 50;
      spotlight.y = target.y = 50;
      grid.x = grid.y = 0;
      delete layer.dataset.active;
      layer.removeAttribute('style');
    }

    section.addEventListener('pointermove', follow);
    section.addEventListener('pointerleave', reset);
    section.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    enabled.addEventListener('change', reset);
    return () => {
      reset();
      section.removeEventListener('pointermove', follow);
      section.removeEventListener('pointerleave', reset);
      section.removeEventListener('pointercancel', reset);
      window.removeEventListener('blur', reset);
      enabled.removeEventListener('change', reset);
    };
  }, []);

  return (
    <section ref={hero} className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-base" style={{ backgroundImage: `url("${media('bg-1.webp')}")` }} aria-hidden="true" />
      <div ref={parallax} className="hero-parallax" aria-hidden="true">
        <div className="hero-reveal" style={{ '--reveal-image': `url("${media('bg-2.webp')}")` }} />
        <div className="hero-grid" />
      </div>
      <div className="hero-shade" />
      <div className="frame hero-layout">
        <header>
          <a className="brand" href="#top"><img className="brand-logo" src={media('personal-logo.svg')} alt="" width="40" height="30" /><span>蒙炜权<small>DESIGNER</small></span></a>
          <a className="hero-nav-button hero-contact-button" href="#contact">联系我</a>
        </header>
        <div className="hero-copy">
          <h1 id="hero-title">多维设计<br /><span>无界还原</span></h1>
          <p className="hero-subtitle" lang="en">Multidimensional design, Flawless execution.</p>
          <nav className="hero-nav" aria-label="主导航">
            <a className="hero-nav-button" href="#about">个人经历</a>
            <a className="hero-nav-button" href="#work">精选项目</a>
            <a className="hero-nav-button" href="#skills">个人优势</a>
          </nav>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ english, children }) {
  return <div className="section-title"><p className="eyebrow"><i /> {english}</p><h2>{children}</h2></div>;
}

function About() {
  return (
    <section className="section frame" id="about">
      <SectionTitle english="ABOUT">个人经历</SectionTitle>
      <div className="about-grid">
        <SpecularFrame>
          <img src={media('profile-portrait.webp')} alt="蒙炜权的侧面人像" loading="lazy" decoding="async" />
        </SpecularFrame>
        <div className="bio">
          <h3>蒙炜权</h3>
          <p className="muted">建筑设计师 · 广州</p>
          <p className="intro">我拥有9年跨尺度空间与场景设计经验，具备从概念深化到项目落地的全链路把控力。项目涵盖教育、办公、商业综合体与酒店等多元业态，擅长处理复杂空间逻辑与设计细节。在跨界设计中，我尤为关注‘人的体验、材质工艺与最终落地效果’的无缝衔接，致力于将抽象的设计概念转化为高完成度的实景空间或产品。</p>
          <div className="employment"><span>2021.05 — 至今</span><strong>广州市设计院集团有限公司</strong></div>
          <dl className="stats">
            <div><dt>9<span> 年</span></dt><dd>建筑设计经验</dd></div>
            <div><dt>5<span> 个</span></dt><dd>主要负责项目</dd></div>
            <div><dt>6<span>+</span></dt><dd>协同专业</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Work() {
  const [loadCovers, setLoadCovers] = useState(false);
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const dialog = useRef(null);
  const rail = useRef(null);
  const position = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadCovers(true);
      observer.disconnect();
    }, { rootMargin: '250px' });
    observer.observe(rail.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = rail.current;
    const cards = Array.from(track.children);
    const actions = cards.map(card => card.querySelector('button'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous;
    let width = track.clientWidth;
    let cardWidth = cards[0].offsetWidth;

    function draw() {
      const axis = width / 2;
      const perspective = Math.max(440, width * .9);
      const travel = Math.max(width * .84, (axis + cardWidth * .85 + 8) / Math.sin(1.4));
      let crossing = false;
      cards.forEach((card, index) => {
        // Draw only the forward arc. Both ends sit beyond the clipped stage.
        const phase = ((index + position.current) % cards.length) / cards.length;
        const angle = (phase - .5) * 2.8;
        const lateral = Math.sin(angle);
        const depth = motion.matches ? 0 : lateral;
        const center = motion.matches ? width * (index + .5) / cards.length : axis + lateral * travel;
        const scale = motion.matches ? .64 : .94 / (1 - depth * .37);
        const yaw = -depth * .52;
        // Invert the card's projected x coordinate at the fixed scanline.
        const projectedX = (axis - center) / scale;
        const localX = projectedX / (Math.cos(yaw) - projectedX * Math.sin(yaw) / perspective);
        const split = motion.matches ? 0 : Math.max(0, Math.min(100, (localX / cardWidth + .5) * 100));
        crossing ||= split > 0 && split < 100;
        card.style.setProperty('--card-x', center + 'px');
        card.style.setProperty('--card-scale', scale);
        card.style.setProperty('--card-perspective', perspective + 'px');
        card.style.setProperty('--card-yaw', yaw + 'rad');
        card.style.opacity = String(.76 + .24 * (depth + 1) / 2);
        card.style.zIndex = String(Math.round((depth + 1) * 50));
        card.style.setProperty('--split', split + '%');
        const halfWidth = cardWidth / 2;
        const projectedEdge = x => scale * x * Math.cos(yaw) / (1 + x * Math.sin(yaw) / perspective);
        const outside = center + projectedEdge(halfWidth) <= 0 || center + projectedEdge(-halfWidth) >= width;
        actions[index].inert = split >= 100 || outside;
      });
      track.parentElement.dataset.crossing = String(crossing && !paused && !selected);
    }

    function tick(now) {
      if (previous !== undefined) {
        position.current = (position.current + Math.min(now - previous, 50) / 4600) % cards.length;
      }
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    }

    function resize() {
      width = track.clientWidth;
      const scanlineHeight = track.parentElement.querySelector('.project-scanline').offsetHeight;
      const displayWidth = scanlineHeight * 5 / 6;
      track.style.setProperty('--project-card-width', motion.matches ? '29%' : `${displayWidth / .94}px`);
      cardWidth = cards[0].offsetWidth;
      if (width && cardWidth) draw();
    }

    const sizing = new ResizeObserver(resize);
    sizing.observe(track);
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      previous = undefined;
      if (entry.isIntersecting && !paused && !selected && !motion.matches) frame = requestAnimationFrame(tick);
    });
    visibility.observe(track);
    const onMotion = () => {
      setPaused(motion.matches);
      resize();
    };
    motion.addEventListener('change', onMotion);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      sizing.disconnect();
      visibility.disconnect();
      motion.removeEventListener('change', onMotion);
    };
  }, [paused, selected]);

  function open(project) {
    setSelected(project);
    dialog.current.showModal();
  }

  return (
    <section className="section frame" id="work">
      <SectionTitle english="SELECTED WORK">精选项目</SectionTitle>
      <div className="project-carousel-controls">
        <button type="button" className="project-autoplay" aria-controls="project-carousel"
          onClick={() => setPaused(value => !value)}>{paused ? '自动播放' : '暂停播放'}</button>
      </div>
      <div className="project-stage">
        <div className="project-carousel" id="project-carousel" ref={rail} role="region" aria-label="精选项目轮播">
          {projects.map(project => {
            const { image, alt } = project.cover ?? project;
            return (
              <article className="project" key={project.name}>
                {loadCovers ? <ProjectReveal src={media(image)} alt={alt} /> : <div className="project-image" />}
                <button className="project-open" type="button" aria-label={'查看项目详情：' + project.name}
                  onClick={() => open(project)} />
              </article>
            );
          })}
        </div>
        <div className="project-scanline" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index} className="project-spark" style={{
              '--spark-y': `${18 + (index * 19) % 65}%`,
              '--spark-x': `${(index % 2 ? 1 : -1) * (14 + (index * 13) % 38)}px`,
              '--spark-rise': `${(index * 7) % 38 - 24}px`,
              '--spark-delay': `${index * -.083}s`,
            }} />
          ))}
        </div>
      </div>
      <dialog ref={dialog} aria-labelledby="project-title" onClose={() => setSelected(null)}>
        {selected && <article>
          <form method="dialog"><button className="dialog-close" aria-label="关闭项目详情">×</button></form>
          <img src={media(selected.image)} alt={selected.alt} />
          <div className="dialog-content"><p className="eyebrow">{selected.category} / {selected.location}</p><h3 id="project-title">{selected.name}</h3>{selected.detail && <p>{selected.detail}</p>}</div>
        </article>}
      </dialog>
    </section>
  );
}

function Skills() {
  return <section className="section frame" id="skills">
    <SectionTitle english="EXPERTISE">个人优势</SectionTitle>
    <div className="skill-grid">{strengths.map(([index, title, detail]) => <SpecularFrame as="article" className="skill" key={title}>
      <span className="skill-index">{index}</span><h3>{title}</h3><p>{detail}</p>
    </SpecularFrame>)}</div>
  </section>;
}

function Contact() {
  return <footer id="contact">
    <div className="frame contact-layout">
      <div className="contact-copy">
        <p className="eyebrow"><i /> CONTACT</p>
        <h2>联系我</h2>
        <div className="contact-links">
          <a className="button button-accent" href={`mailto:${email}`}>发送邮件 <Arrow /></a>
          <a className="button button-accent" href={`tel:+86${phone}`}>拨打电话 <Arrow /></a>
        </div>
        <p className="contact-info">{email} <span> / </span> {phone}</p>
      </div>
      <div className="end"><a href="#top">回到顶部 ↑</a></div>
    </div>
  </footer>;
}

function App() {
  const page = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        target.toggleAttribute('data-grid-visible', isIntersecting);
      });
    });
    page.current.querySelectorAll('.perspective-section').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={page}>
      <main>
        <Hero />
        <div className="perspective-section"><About /></div>
        <div className="perspective-section"><Work /></div>
        <div className="perspective-section"><Skills /></div>
      </main>
      <div className="perspective-section contact"><Contact /></div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

