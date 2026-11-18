const BSC_RPC = 'https://bsc-dataseed.binance.org';
const CONTRACT = '0x0C458D61848Ef7fFD753FbDD1179a7053A60661F';
const REGISTRY = '0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F';

const SEL_NEXT_TOKEN_ID = '0x75794a3c';
const SEL_BALANCE_OF = '0x70a08231';
const SEL_HAS_MINTED = '0x38e21cce';
const SEL_OWNER_OF = '0x6352211e';
const SEL_MINTED_AT = '0xf1b0aa15';

const timers = new WeakMap();
let lastCopyMsg = '';

function legacyCopy(text) {
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

function reportCopy(button, ok) {
  const tip = button.nextElementSibling;
  clearTimeout(timers.get(button));
  button.removeAttribute('data-copied');
  button.removeAttribute('data-failed');
  let msg = ok ? 'Copied' : 'Copy failed';
  if (msg === lastCopyMsg) msg += '\u00A0';
  lastCopyMsg = msg;
  tip.textContent = '';
  void button.offsetWidth;
  button.setAttribute(ok ? 'data-copied' : 'data-failed', '');
  requestAnimationFrame(() => {
    tip.textContent = msg;
  });
  timers.set(button, setTimeout(() => {
    button.removeAttribute('data-copied');
    button.removeAttribute('data-failed');
    tip.textContent = '';
  }, 2000));
}

async function copyTarget(button, target) {
  const text = target.matches('input, textarea') ? target.value : target.innerText.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    reportCopy(button, true);
  } catch {
    reportCopy(button, legacyCopy(text));
  }
}

document.addEventListener('command', (event) => {
  if (event.command && event.command.startsWith('--copy')) {
    copyTarget(event.source, event.target);
  }
}, true);

if (!('CommandEvent' in window)) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[command^="--copy"]');
    if (!button) return;
    const target = document.getElementById(button.getAttribute('commandfor'));
    if (target) copyTarget(button, target);
  });
}

async function rpcCall(method, params) {
  const res = await fetch(BSC_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'RPC error');
  return json.result;
}

const padAddr = (addr) => '000000000000000000000000' + addr.toLowerCase().replace(/^0x/, '');
const padUint = (n) => BigInt(n).toString(16).padStart(64, '0');
const isAddress = (s) => /^0x[0-9a-fA-F]{40}$/.test(s);
const shortAddr = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

async function loadStatsAndHolders() {
  const statEl = document.getElementById('stat-minted');
  const tbody = document.getElementById('holders-tbody');
  try {
    const nextHex = await rpcCall('eth_call', [{ to: CONTRACT, data: SEL_NEXT_TOKEN_ID }, 'latest']);
    const total = Number(BigInt(nextHex));
    statEl.textContent = String(total);

    if (total === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No passports minted yet.</td></tr>';
      return;
    }

    const start = Math.max(0, total - 10);
    const ids = [];
    for (let id = total - 1; id >= start; id--) ids.push(id);

    const rows = await Promise.all(ids.map(async (id) => {
      const [ownerHex, tsHex] = await Promise.all([
        rpcCall('eth_call', [{ to: CONTRACT, data: SEL_OWNER_OF + padUint(id) }, 'latest']),
        rpcCall('eth_call', [{ to: CONTRACT, data: SEL_MINTED_AT + padUint(id) }, 'latest']),
      ]);
      const owner = '0x' + ownerHex.slice(-40);
      const ts = Number(BigInt(tsHex)) * 1000;
      const dateStr = ts ? new Date(ts).toISOString().replace('T', ' ').slice(0, 19) : '-';
      return { id, owner, dateStr };
    }));

    tbody.replaceChildren(...rows.map(({ id, owner, dateStr }) => {
      const tr = document.createElement('tr');
      const tdId = document.createElement('td');
      tdId.textContent = `#${id}`;
      const tdOwner = document.createElement('td');
      const code = document.createElement('code');
      code.textContent = shortAddr(owner);
      tdOwner.append(code);
      const tdDate = document.createElement('td');
      tdDate.textContent = dateStr;
      const tdLink = document.createElement('td');
      const a = document.createElement('a');
      a.href = `https://bscscan.com/token/${CONTRACT}?a=${id}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'View';
      tdLink.append(a);
      tr.append(tdId, tdOwner, tdDate, tdLink);
      return tr;
    }));
  } catch (err) {
    statEl.textContent = 'Unavailable';
    tbody.innerHTML = `<tr><td colspan="4">Failed to load BSC RPC: ${err.message}</td></tr>`;
  }
}

async function checkEligibility(addr) {
  const [agentBalHex, mintedHex] = await Promise.all([
    rpcCall('eth_call', [{ to: REGISTRY, data: SEL_BALANCE_OF + padAddr(addr) }, 'latest']),
    rpcCall('eth_call', [{ to: CONTRACT, data: SEL_HAS_MINTED + padAddr(addr) }, 'latest']),
  ]);
  return {
    hasAgentId: BigInt(agentBalHex) > 0n,
    alreadyMinted: BigInt(mintedHex) > 0n,
  };
}

document.getElementById('refresh-holders-btn').addEventListener('click', loadStatsAndHolders);

document.getElementById('check-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.getElementById('address-input');
  const resultEl = document.getElementById('eligibility-result');
  const addr = input.value.trim();
  if (!isAddress(addr)) {
    resultEl.textContent = 'Please enter a valid 42-character 0x EVM address.';
    input.setAttribute('aria-invalid', 'true');
    return;
  }
  input.removeAttribute('aria-invalid');
  resultEl.textContent = 'Checking BSC Mainnet...';
  try {
    const { hasAgentId, alreadyMinted } = await checkEligibility(addr);
    if (alreadyMinted) {
      resultEl.textContent = `${shortAddr(addr)}: Eligible (.ai Agent ID found) and ALREADY MINTED a Baiwor Passport.`;
    } else if (hasAgentId) {
      resultEl.textContent = `${shortAddr(addr)}: ELIGIBLE — holds a .ai Agent ID and can mint 1 free Baiwor Passport via your AI agent (baw CLI).`;
    } else {
      resultEl.textContent = `${shortAddr(addr)}: Not eligible — no .ai Agent ID detected on BSC registry.`;
    }
  } catch (err) {
    resultEl.textContent = `RPC check failed: ${err.message}`;
  }
});

loadStatsAndHolders();
