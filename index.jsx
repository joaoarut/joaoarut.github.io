import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, Shield, Cpu, Terminal, Sparkles, ArrowDown, ExternalLink, Sun, Moon } from "lucide-react";

// ===== Helper: simple typewriter hook (no external deps) =====
function useTypewriter(words, speed = 70, pause = 1000) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
      // flip
      if (!deleting && subIndex === current.length) {
        setDeleting(true);
        return;
      }
      if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, words, speed, pause]);

  useEffect(() => {
    if (subIndex === words[index % words.length].length && !deleting) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
  }, [subIndex, deleting, index, words, pause]);

  const text = words[index % words.length].slice(0, subIndex);
  return text;
}

// ===== Background Particles Canvas =====
function Particles({ density = 80 }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, 700);
    }
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(density, Math.floor((canvas.width * canvas.height) / 18000));
    particlesRef.current = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.6 + 0.25,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }
      // lines
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 120) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" aria-hidden />;
}

// ===== Tag / Chip =====
const Chip = ({ children }) => (
  <span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur text-xs">
    {children}
  </span>
);

// ===== Section Wrapper with reveal =====
const Section = ({ id, title, subtitle, children }) => (
  <section id={id} className="relative py-20 md:py-28">
    <div className="max-w-6xl mx-auto px-6">
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
        >
          {title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-white/70 mt-3 max-w-3xl"
        >
          {subtitle}
        </motion.p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  </section>
);

// ===== Project Card =====
function ProjectCard({ title, description, tags = [], link }) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -6 }}
      className="group block rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6 hover:border-white/20 transition shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Cpu className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <ExternalLink className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100" />
      </div>
      <p className="text-sm text-white/70 mt-3">{description}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((t, i) => (
          <Chip key={i}>{t}</Chip>
        ))}
      </div>
    </motion.a>
  );
}

// ===== Timeline Item =====
function TimelineItem({ when, where, what, details }) {
  return (
    <div className="relative pl-8 pb-10">
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white shadow" />
      <div className="text-sm text-white/60">{when} · {where}</div>
      <div className="font-semibold mt-1">{what}</div>
      <div className="text-white/70 text-sm mt-1">{details}</div>
    </div>
  );
}

// ===== Theme Toggle =====
function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);
  return (
    <button onClick={() => setDark(!dark)} className="p-2 rounded-xl border border-white/10 hover:border-white/30 transition bg-white/5">
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

// ===== Data (from your currículo) =====
const data = {
  name: "João Vitor L. Arut",
  title: "Especialista em Cibersegurança e Engenharia de Hardware",
  summary:
    "Com 10+ anos de experiência, foco em Red Team/Pentest, forense, análise e criação de malwares, web hacking e rootkits. Programação de baixo nível em C/C++/Assembly e engenharia reversa com IDA Pro, OllyDbg e Scylla.",
  tagline:
    "Conecto tecnologia, segurança e inovação para proteger e transformar negócios.",
  companies: [
    {
      name: "BackTrack Security",
      role: "Fundador e Líder · Red Team",
      desc: "Operações ofensivas, simulações de ataque, emulação de adversários e segurança ofensiva ponta a ponta.",
    },
    {
      name: "TDL Software",
      role: "Fundador · Engenharia de Hardware",
      desc: "Placas DMA, FPGA, Hybrid PCIe Trace Tool, desenvolvimento de firmwares (Vivado Design Suite).",
    },
  ],
  education: [
  { school: "ETEC Helcy Moreira Martins Aguiar", course: "Ensino Médio", status: "Concluído" },
  { school: "ETEC Helcy Moreira Martins Aguiar", course: "Desenvolvimento de Sistemas", status: "Concluído" },
  { school: "HackerSec", course: "HCP", status: "Concluído" },
  { school: "HackerSec", course: "Forense Computacional", status: "Concluído" },
  { school: "HackerSec", course: "Análise e Desenvolvimento de Malware", status: "Concluído" },
  { school: "Cisco", course: "Cyber Threat Management", status: "Concluído" },
  { school: "Microsoft Learn", course: "Hyper-V e Virtualização no Windows", status: "Concluído" },
  { school: "Cisco", course: "Junior Cybersecurity Analyst", status: "Concluído" },
  { school: "HackerSec", course: "Segurança Web", status: "Concluído" },
  { school: "FATEC Lins", course: "Análise e Desenvolvimento de Sistemas", status: "Em curso" },
],

  links: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:joao@example.com",
  },
  skills: {
    redteam: ["Pentest", "Red Team", "Cobalt Strike", "Brute Ratel", "Metasploit", "Ettercap", "BeEF"],
    reversing: ["IDA Pro", "OllyDbg", "Scylla", "x64dbg", "WinDbg", "Ghidra"],
    lowlevel: ["C", "C++", "Assembly", "Rootkits", "Malware Dev"],
    hw: ["DMA", "FPGA", "Vivado", "PCIe", "Firmware", "Hardware Hacking"],
    web: ["Web Hacking", "AppSec", "Hardening"],
  },
  projects: [
    {
      title: "Hybrid PCIe Trace Tool",
      description: "Ferramenta de tracing para PCIe com captura, análise e injeção controlada para validação de DMA/FPGA.",
      tags: ["PCIe", "FPGA", "DMA"],
      link: "#",
    },
    {
      title: "Framework de Emulação de Adversários",
      description: "Playbooks táticos e TTPs automatizados para Red Team com integrações C2.",
      tags: ["Red Team", "C2", "Automation"],
      link: "#",
    },
    {
      title: "Rootkit PoC para estudos",
      description: "Pesquisa acadêmica/PoC sobre técnicas de ocultação e persistência (uso ético e controlado).",
      tags: ["Kernel", "EDR Evasion"],
      link: "#",
    },
  ],
};

// ===== Navbar =====
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#sobre", label: "Sobre" },
    { href: "#skills", label: "Skills" },
    { href: "#experiencia", label: "Experiência" },
    { href: "#projetos", label: "Projetos" },
    { href: "#contato", label: "Contato" },
  ];
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 px-4 py-3">
          <a href="#" className="font-semibold tracking-tight">JVLArut</a>
          <div className="ml-auto hidden md:flex items-center gap-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white/10">
                {l.label}
              </a>
            ))}
            <a href="#curriculo" className="px-3 py-1.5 text-sm rounded-lg border border-white/10 hover:border-white/30">Currículo</a>
            <ThemeToggle />
          </div>
          <button className="md:hidden ml-auto px-2 py-1 rounded-lg border border-white/10" onClick={() => setOpen(!open)}>Menu</button>
        </div>
        {open && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-3 md:hidden">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="block px-3 py-2 rounded-lg hover:bg-white/10">{l.label}</a>
            ))}
            <a href="#curriculo" className="block px-3 py-2 rounded-lg border border-white/10 mt-2">Currículo</a>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Hero =====
function Hero() {
  const words = [
    "Red Team & Pentest",
    "Engenharia de Hardware (DMA/FPGA)",
    "Malware & Rootkits (Pesquisa)",
    "Reverse Engineering",
  ];
  const tw = useTypewriter(words, 60, 1300);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 80]);

  return (
    <div className="relative pt-28 pb-24 md:pb-36 overflow-hidden">
      <Particles />
      <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.20),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.12),transparent_60%)]" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 mb-4">
              <Shield className="w-4 h-4" />
              <span className="text-xs">BackTrack Security · TDL Software</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {data.name}
            </h1>
            <p className="mt-3 text-lg md:text-xl text-white/80">{data.title}</p>
            <p className="mt-4 text-white/70 max-w-2xl">{data.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Chip>Pentest</Chip>
              <Chip>Red Team</Chip>
              <Chip>DMA/FPGA</Chip>
              <Chip>Reverse</Chip>
              <Chip>Malware</Chip>
            </div>

            <div className="mt-8 flex gap-3">
              <a href="#projetos" className="px-5 py-3 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 transition">Ver projetos</a>
              <a href="#contato" className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/30">Entrar em contato</a>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <a href={data.links.github} className="opacity-80 hover:opacity-100" aria-label="GitHub"><Github /></a>
              <a href={data.links.linkedin} className="opacity-80 hover:opacity-100" aria-label="LinkedIn"><Linkedin /></a>
              <a href={data.links.email} className="opacity-80 hover:opacity-100" aria-label="E-mail"><Mail /></a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-30 bg-gradient-to-br from-indigo-500 via-cyan-400 to-fuchsia-500" />
            <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8">
              <div className="text-sm text-white/70">Atuação</div>
              <div className="mt-2 text-2xl font-semibold h-16">
                <span className="align-middle">{tw}</span>
                <span className="ml-1 animate-pulse">|</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="font-semibold">Red Team</div>
                  <div className="text-white/70">Cobalt Strike, BR, Metasploit</div>
                </div>
                <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="font-semibold">Reverse</div>
                  <div className="text-white/70">IDA, OllyDbg, Scylla</div>
                </div>
                <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="font-semibold">Hardware</div>
                  <div className="text-white/70">DMA, FPGA, PCIe</div>
                </div>
                <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="font-semibold">Malware</div>
                  <div className="text-white/70">Rootkits, Evasion, PoCs</div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white/70 text-sm">
                <Sparkles className="w-4 h-4" /> Disponível para projetos de alto impacto
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <a href="#sobre" className="group inline-flex items-center gap-2 text-white/70">
            <ArrowDown className="group-hover:translate-y-1 transition" />
            role para ver mais
          </a>
        </div>
      </div>
    </div>
  );
}

// ===== Skills =====
function Skills() {
  const groups = [
    { label: "Red Team", items: data.skills.redteam },
    { label: "Reverse", items: data.skills.reversing },
    { label: "Low-level", items: data.skills.lowlevel },
    { label: "Hardware", items: data.skills.hw },
    { label: "Web/AppSec", items: data.skills.web },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((g) => (
        <motion.div
          key={g.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 p-5 bg-gradient-to-b from-white/5 to-transparent"
        >
          <div className="font-semibold">{g.label}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.items.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ===== Experience =====
function Experience() {
  return (
    <div className="relative">
      <div className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
      <TimelineItem
        when="Presente"
        where="BackTrack Security"
        what="Fundador e Líder · Red Team"
        details="Operações ofensivas, emulação de adversários e segurança ofensiva ponta a ponta."
      />
      <TimelineItem
        when="Presente"
        where="TDL Software"
        what="Fundador · Engenharia de Hardware"
        details="Placas DMA, FPGA, design e firmwares com Xilinx Vivado."
      />
    </div>
  );
}

// ===== Projects =====
function Projects() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.projects.map((p) => (
        <ProjectCard key={p.title} {...p} />
      ))}
    </div>
  );
}

// ===== Contact =====
function Contact() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-b from-white/5 to-transparent">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-lg font-semibold">Vamos conversar</div>
          <p className="text-white/70 mt-2">
            Conecte-se comigo para discutir cibersegurança, hardware ou projetos inovadores!
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href={data.links.github} className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 inline-flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href={data.links.linkedin} className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 inline-flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a href={data.links.email} className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 inline-flex items-center gap-2">
              <Mail className="w-4 h-4" /> E-mail
            </a>
          </div>
        </div>
        <form className="space-y-3" action={data.links.email}>
          <input required placeholder="Seu nome" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
          <input required placeholder="Seu e-mail" type="email" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
          <textarea required placeholder="Mensagem" rows={5} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
          <button className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/30">Enviar</button>
        </form>
      </div>
    </div>
  );
}

// ===== Footer =====
function Footer() {
  return (
    <footer className="py-10 text-center text-white/60">
      © {new Date().getFullYear()} {data.name}. Feito com foco em performance e acessibilidade.
    </footer>
  );
}

// ===== Main Page =====
export default function PortfolioJoaoArut() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white selection:bg-white/20">
      <Navbar />
      <Hero />

      <Section id="sobre" title="Sobre" subtitle={data.tagline}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-white/10 p-6 bg-gradient-to-b from-white/5 to-transparent">
            <p className="text-white/80">
              {data.summary}
            </p>
            <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
              {data.companies.map((c) => (
                <div key={c.name} className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-white/70">{c.role}</div>
                  <div className="text-white/60 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-b from-white/5 to-transparent">
            <div className="font-semibold">Formação</div>
            <ul className="mt-3 space-y-2 text-sm">
              {data.education.map((e) => (
                <li key={e.school} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-white" />
                  <div>
                    <div className="font-medium">{e.school}</div>
                    <div className="text-white/70">{e.course} — {e.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="skills" title="Skills" subtitle="Ferramentas e tecnologias que uso no dia a dia.">
        <Skills />
      </Section>

      <Section id="experiencia" title="Experiência" subtitle="Trajetória profissional e frentes de atuação.">
        <Experience />
      </Section>

      <Section id="projetos" title="Projetos" subtitle="Alguns trabalhos e pesquisas em destaque.">
        <Projects />
      </Section>

      <Section id="contato" title="Contato" subtitle="Fale comigo para construir algo grande.">
        <Contact />
      </Section>

      <Footer />

      {/* Global styles to emulate glass / neon vibe */}
      <style>{`
        html, body, #root { height: 100%; }
        .dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}
