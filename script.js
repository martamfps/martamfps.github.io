// Theme
(function() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);
})();

function updateThemeIcons(theme) {
  const moon = document.getElementById('icon-moon');
  const sun = document.getElementById('icon-sun');
  if (!moon || !sun) return;
  if (theme === 'dark') { moon.style.display = 'block'; sun.style.display = 'none'; }
  else { moon.style.display = 'none'; sun.style.display = 'block'; }
}

document.getElementById('theme-toggle').addEventListener('click', function() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcons(next);
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', function() {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Active nav
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));

// Project filter
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const searchInput = document.getElementById('search-projects');

function filterProjects() {
  const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const query = searchInput.value.toLowerCase().trim();
  projectCards.forEach(card => {
    const tags = card.dataset.tags || '';
    const text = card.textContent.toLowerCase();
    const matchFilter = active === 'all' || tags.includes(active);
    const matchSearch = !query || text.includes(query);
    card.hidden = !(matchFilter && matchSearch);
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterProjects();
  });
});

searchInput.addEventListener('input', filterProjects);

// Form — Formspree integration
function handleForm(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('message').value.trim();
  const button = e.target.querySelector('button[type="submit"]');
  
  // Validação básica
  if (!name || !email || !msg) {
    alert('Por favor, preencha todos os campos');
    return;
  }
  
  // Desabilita botão durante envio
  button.disabled = true;
  const originalText = button.innerHTML;
  button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline; animation:spin 1s linear infinite; margin-right:8px;"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>Enviando...';
  
  // Envia via Formspree
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('message', msg);
  
  const formspreeId = 'meepqebd';
  
  fetch(`https://formspree.io/f/${formspreeId}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Mensagem enviada com sucesso! 🎉\n\nResponderemos em breve.');
      e.target.reset();
      button.disabled = false;
      button.innerHTML = originalText;
    } else {
      throw new Error('Erro ao enviar');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao enviar mensagem. Tente novamente.');
    button.disabled = false;
    button.innerHTML = originalText;
  });
}

// Generate Curriculum PDF
function generateCurriculumPDF(e) {
  e.preventDefault();
  
  const curriculumHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; font-size: 12px; }
        .container { width: 100%; max-width: 190mm; }
        .header { border-bottom: 2px solid #4ECDC4; padding-bottom: 10px; margin-bottom: 10px; }
        .name { font-size: 26px; font-weight: bold; color: #0A0E1A; margin: 0; letter-spacing: -0.3px; }
        .subtitle { font-size: 12px; color: #8B9ABF; margin: 3px 0 0 0; }
        .contact-row { font-size: 10px; color: #666; margin-top: 5px; }
        .section-title { font-size: 11px; font-weight: bold; color: #4ECDC4; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; margin-bottom: 6px; border-bottom: 1px solid #4ECDC4; padding-bottom: 3px; }
        .profile-text { font-size: 10px; line-height: 1.6; margin-bottom: 8px; }
        .job-item { margin-bottom: 10px; }
        .job-title { font-weight: bold; font-size: 11px; color: #0A0E1A; margin: 0; }
        .job-company { font-size: 10px; color: #666; margin: 0; }
        .job-period { font-size: 9.5px; color: #8B9ABF; margin: 0 0 3px 0; }
        ul { list-style: none; padding-left: 12px; font-size: 10px; margin: 3px 0; }
        li { margin-bottom: 3px; line-height: 1.6; position: relative; padding-left: 10px; }
        li:before { content: "•"; color: #4ECDC4; position: absolute; left: 0; }
        .skill-group { margin-bottom: 6px; }
        .skill-label { font-weight: bold; font-size: 10px; margin-bottom: 2px; }
        .skill-text { font-size: 10px; color: #444; line-height: 1.6; }
        .edu-item { margin-bottom: 6px; }
        .edu-title { font-weight: bold; font-size: 10px; color: #0A0E1A; margin: 0; }
        .edu-school { font-size: 9.5px; color: #666; margin: 0; }
        .edu-period { font-size: 9.5px; color: #666; margin: 0; }
        .cert-text { font-size: 10px; margin: 4px 0; color: #444; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="name">Marta Francisca Pego dos Santos</h1>
          <p class="subtitle">Analista de Dados | SQL | Python | Power BI</p>
          <div class="contact-row">
            marta.mfps@gmail.com &nbsp;|&nbsp; (47) 93383-1127 &nbsp;|&nbsp; Blumenau, SC &nbsp;|&nbsp; linkedin.com/in/marta-francisca-pego-dos-santos
          </div>
        </div>

        <div class="section-title">Perfil Profissional</div>
        <p class="profile-text">Profissional em transição para tecnologia e dados com 10+ anos em ambientes que exigem precisão, organização e comunicação entre áreas. <brFormação técnica em andamento em SQL, Python, Power BI e análise de dados. Experiência prática em extração, análise e apresentação de dados.</p>

        <div class="section-title">Experiência Profissional</div>

        <div class="job-item">
          <div class="job-title">Técnica de Audiovisual</div>
          <div class="job-company">FURB – Universidade de Blumenau</div>
          <div class="job-period">Nov 2025 – Mar 2026 · Blumenau, SC</div>
          <ul>
            <li>Edição de conteúdo jornalístico e acadêmico com prazos definidos e padrão de qualidade</li>
            <li>Organização e controle de entregas para canais digitais institucionais</li>
          </ul>
        </div>

        <div class="job-item">
          <div class="job-title">Editora de Vídeo</div>
          <div class="job-company">Grupo ND (NDTV)</div>
          <div class="job-period">Abr 2024 – Set 2024 · Blumenau, SC</div>
          <ul>
            <li>Edição de reportagens factuais com alta demanda e senso de urgência</li>
            <li>Gestão de múltiplas entregas simultâneas sob pressão de prazo</li>
          </ul>
        </div>

        <div class="job-item">
          <div class="job-title">Técnica de Audiovisual</div>
          <div class="job-company">FURB – Universidade de Blumenau</div>
          <div class="job-period">Nov 2019 – Abr 2024 · Blumenau, SC</div>
          <ul>
            <li>Suporte técnico a professores e alunos durante aulas práticas</li>
            <li>Controle de empréstimo e manutenção de equipamentos</li>
            <li>Atendimento de demandas variadas com organização e foco em resolução</li>
          </ul>
        </div>

        <div class="job-item">
          <div class="job-title">Assistente de Licitação</div>
          <div class="job-company">Grupo Livrarias Curitiba</div>
          <div class="job-period">Fev 2014 – Nov 2019 · Curitiba, PR</div>
          <ul>
            <li>Extração e consulta de dados no Sapiens ERP para elaboração de orçamentos</li>
            <li>Controle de pregões em Excel: prazos, exigências e inconsistências</li>
            <li>Gestão de contratos com suporte à tomada de decisão</li>
            <li>Comunicação com órgãos públicos e alinhamento entre áreas internas</li>
          </ul>
        </div>

        <div class="job-item">
          <div class="job-title">Auxiliar de RH – Recrutamento e Seleção</div>
          <div class="job-company">Grupo SIP – Gestão de Pessoas</div>
          <div class="job-period">Abr 2013 – Fev 2014 · Curitiba, PR</div>
          <ul>
            <li>Triagem de currículos e controle das etapas do processo seletivo</li>
            <li>Agendamento de entrevistas com controle de prazos e retornos</li>
          </ul>
        </div>

        <div class="section-title">Habilidades Técnicas</div>

        <div class="skill-group">
          <div class="skill-label">Linguagens & Dados</div>
          <div class="skill-text">SQL (consultas, JOINs, agregações, CTEs), Python (Pandas, NumPy, análise exploratória)</div>
        </div>

        <div class="skill-group">
          <div class="skill-label">BI & Visualização</div>
          <div class="skill-text">Power BI, dashboards gerenciais, storytelling com dados, KPIs e métricas</div>
        </div>

        <div class="skill-group">
          <div class="skill-label">Ferramentas</div>
          <div class="skill-text">Excel avançado, Google Sheets, Git e GitHub, Jupyter Notebook, VS Code, ERP Sapiens</div>
        </div>

        <div class="section-title">Formação Acadêmica</div>

        <div class="edu-item">
          <div class="edu-title">Bootcamp Elas+ Tech – Análise de Dados</div>
          <div class="edu-school">Ada Tech</div>
          <div class="edu-period">Em andamento · Previsão: Abril/2026</div>
        </div>

        <div class="edu-item">
          <div class="edu-title">Análise e Desenvolvimento de Sistemas</div>
          <div class="edu-school">Senac EAD</div>
          <div class="edu-period">2024 – 2027 · Em andamento</div>
        </div>

        <div class="edu-item">
          <div class="edu-title">Técnica em Produção de Áudio e Vídeo</div>
          <div class="edu-school">IFPR</div>
          <div class="edu-period">2015 – 2017</div>
        </div>

        <div class="section-title">Certificações</div>
        <div class="cert-text">Trilha Digital Coders 24 – Engenharia de Dados · Ada Tech (2024)</div>
        <div class="cert-text">Introduction to Data Science · Cisco (2025)</div>
        <div class="cert-text">Python Essentials 1 · Cisco (2024)</div>
        <div class="cert-text">Introduction to Cybersecurity · Cisco</div>

      </div>
    </body>
    </html>
  `;

  const opt = {
    margin: [10, 14, 10, 14],
    filename: 'Curriculo_Marta_Pego.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 5, useCORS: true, allowTaint: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: false }
  };

  html2pdf().set(opt).from(curriculumHTML).save();
}
