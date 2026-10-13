(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const selections = new Map();
  const slipBody = $('#slipBody');
  const slipCalc = $('#slipCalc');
  const slipCount = $('#slipCount');
  const stakeInput = $('#stake');
  const potential = $('#potential');
  const toast = $('#toast');
  const modalBackdrop = $('#modalBackdrop');
  let toastTimer;
  let modalMode = 'login';

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  function money(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  function renderSlip() {
    slipCount.textContent = String(selections.size);
    $$('.odd').forEach(button => {
      const key = button.dataset.odd;
      button.classList.toggle('chosen', selections.has(key));
    });
    if (!selections.size) {
      slipBody.className = 'slip-empty';
      slipBody.innerHTML = '<span class="slip-empty-icon">＋</span><b>Seu boletim está vazio</b><p>Selecione uma cotação em um jogo para adicionar sua seleção aqui.</p>';
      slipCalc.hidden = true;
      return;
    }
    slipBody.className = 'slip-selections';
    slipBody.innerHTML = [...selections.entries()].map(([name, item]) =>
      '<div class="slip-selection"><div class="selection-top"><span>' + name + '</span><button type="button" data-remove="' + name.replace(/"/g, '&quot;') + '" aria-label="Remover seleção">×</button></div><div class="selection-match">' + item.match + '</div><div class="selection-odd">Cotação ' + item.value.toFixed(2) + '</div></div>'
    ).join('');
    slipCalc.hidden = false;
    updatePotential();
  }
  function updatePotential() {
    const stake = Math.max(0, Number(stakeInput.value) || 0);
    const multiplier = [...selections.values()].reduce((total, item) => total * item.value, 1);
    potential.textContent = money(stake * multiplier);
  }
  $$('.odd').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.odd;
    const card = button.closest('.match-card');
    const match = card ? $$('.team b', card).map(el => el.textContent).join(' x ') : 'Partida demonstrativa';
    if (selections.has(name)) {
      selections.delete(name);
      showToast('Seleção removida do boletim');
    } else {
      // Keep only one outcome per match, like a standard bet slip.
      if (card) {
        const teams = $$('.team b', card).map(el => el.textContent).join(' x ');
        for (const [oldName, item] of selections.entries()) if (item.match === teams) selections.delete(oldName);
      }
      selections.set(name, { value: Number(button.dataset.value), match });
      showToast('Cotação adicionada ao boletim');
    }
    renderSlip();
  }));
  slipBody.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    selections.delete(button.dataset.remove);
    renderSlip();
  });
  stakeInput.addEventListener('input', updatePotential);
  $$('.star').forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('active');
    button.textContent = button.classList.contains('active') ? '★' : '☆';
    showToast(button.classList.contains('active') ? 'Partida adicionada aos favoritos' : 'Partida removida dos favoritos');
  }));
  $$('.slip-tab').forEach((button, index) => button.addEventListener('click', () => {
    $$('.slip-tab').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    if (index === 1) showToast('Múltipla: selecione duas ou mais partidas para montar sua combinação.');
  }));
  function openModal(mode) {
    modalMode = mode;
    const isRegister = mode === 'register';
    $('#modalTitle').innerHTML = isRegister ? 'Crie sua conta <em>Five.Bet</em>' : 'Bem-vindo à <em>Five.Bet</em>';
    $('#modalDesc').textContent = isRegister ? 'Cadastre-se para acompanhar sua experiência.' : 'Entre na sua conta para continuar.';
    $('#modalSubmit').textContent = isRegister ? 'Criar conta' : 'Entrar';
    $('#switchModal').textContent = isRegister ? 'Já tem conta? Entrar' : 'Ainda não tem conta? Criar conta';
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
  }
  $$('[data-modal]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.modal)));
  $('#modalClose').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', event => { if (event.target === modalBackdrop) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  $('#switchModal').addEventListener('click', () => openModal(modalMode === 'login' ? 'register' : 'login'));
  $('#accountForm').addEventListener('submit', event => {
    event.preventDefault();
    closeModal();
    showToast('Tela demonstrativa: login e cadastro serão conectados depois.');
  });
  $$('[data-scroll]').forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('.side-link').forEach(link => link.addEventListener('click', () => {
    $$('.side-link').forEach(item => item.classList.remove('selected'));
    if (link.tagName === 'A') link.classList.add('selected');
    if (window.matchMedia('(max-width: 800px)').matches) $('#sidebar').classList.remove('open');
  }));
  // The interface intentionally uses local sample data only. No casino/sports API calls are made.
  renderSlip();
})();