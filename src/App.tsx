import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Code2,
  Copy,
  Fingerprint,
  Globe2,
  Layers,
  LockKeyhole,
  Mail,
  Menu,
  ScanLine,
  Shield,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF';
type IntakeMode = 'account' | 'consultation';
type ApiLanguage = 'typescript' | 'python' | 'curl';

const currencyInfo: Record<Currency, { symbol: string; name: string; locale: string }> = {
  USD: { symbol: '$', name: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', name: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'GBP', locale: 'en-GB' },
  CHF: { symbol: 'Fr. ', name: 'CHF', locale: 'de-CH' },
};

const apiSnippets: Record<ApiLanguage, string> = {
  typescript: `import { Aura } from '@aura/treasury';

const aura = new Aura({
  apiKey: process.env.AURA_API_KEY,
});

const sweep = await aura.treasury.sweep.execute({
  accountId: 'acct_eu_20481',
  amount: 2_500_000,
  currency: 'USD',
  destination: 'tbill_ladder',
  settlement: 'T+0',
});`,
  python: `from aura import Aura
import os

aura = Aura(api_key=os.environ['AURA_API_KEY'])

sweep = aura.treasury.sweep.execute(
    account_id="acct_eu_20481",
    amount=2_500_000,
    currency="USD",
    destination="tbill_ladder",
    settlement="T+0",
)`,
  curl: `curl --request POST \\
  --url https://api.aura.finance/v1/treasury/sweep/execute \\
  --header 'Authorization: Bearer $AURA_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "account_id": "acct_eu_20481",
    "amount": 2500000,
    "currency": "USD",
    "destination": "tbill_ladder",
    "settlement": "T+0"
  }'`,
};

const freeEmailDomains = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com',
  'outlook.com', 'live.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com',
]);

function isInstitutionalEmail(value: string) {
  const domain = value.trim().toLowerCase().split('@')[1];
  return Boolean(domain && domain.includes('.') && !freeEmailDomains.has(domain));
}

function formatCurrency(value: number, currency: Currency, digits = 0) {
  const { symbol, locale } = currencyInfo[currency];
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return `${symbol}${formatted}`;
}

function AuraMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand-mark${inverse ? ' brand-mark--inverse' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 30 30" fill="none">
        <path d="M15 2.6 27.1 9.55v10.9L15 27.4 2.9 20.45V9.55L15 2.6Z" stroke="currentColor" strokeWidth="1.55" />
        <path d="m15 7.35 7.97 4.6v6.1L15 22.65l-7.97-4.6v-6.1L15 7.35Z" stroke="currentColor" strokeWidth="1.15" />
        <path d="M15 7.8v14.4M7.15 11.85l15.7 6.3M22.85 11.85l-15.7 6.3" stroke="currentColor" strokeWidth=".9" opacity=".78" />
      </svg>
    </span>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow${light ? ' eyebrow--light' : ''}`}><span className="eyebrow-rule" />{children}</div>;
}

function App() {
  const [balance, setBalance] = useState(10_000_000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [domicile, setDomicile] = useState('United States (Delaware)');
  const [toast, setToast] = useState('');
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [applicationMode, setApplicationMode] = useState<IntakeMode>('account');
  const [applicationStep, setApplicationStep] = useState(1);
  const [intake, setIntake] = useState({
    entity: '',
    domicile: 'United States (Delaware)',
    volume: '',
    officer: '',
    email: '',
    role: '',
  });
  const [emailError, setEmailError] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalStep, setPortalStep] = useState<'credentials' | 'verification' | 'signed-in'>('credentials');
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiLanguage, setApiLanguage] = useState<ApiLanguage>('typescript');
  const [apiBusy, setApiBusy] = useState(false);
  const [apiResponse, setApiResponse] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKeyDrawerOpen, setApiKeyDrawerOpen] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('Treasury sweep service');
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const annualYield = useMemo(() => balance * 0.0492, [balance]);
  const monthlyYield = useMemo(() => annualYield / 12, [annualYield]);
  const sliderProgress = ((balance - 1_000_000) / (50_000_000 - 1_000_000)) * 100;

  useEffect(() => {
    if (!applicationOpen && !portalOpen && !apiKeyDrawerOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setApplicationOpen(false);
        setPortalOpen(false);
        setApiKeyDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applicationOpen, portalOpen, apiKeyDrawerOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function openApplication(mode: IntakeMode) {
    setApplicationMode(mode);
    setApplicationStep(1);
    setIntake({ entity: '', domicile: 'United States (Delaware)', volume: '', officer: '', email: '', role: '' });
    setEmailError(false);
    setApplicationOpen(true);
    setMobileNavOpen(false);
  }

  function submitEntityDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setApplicationStep(2);
  }

  function submitOfficerDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (!isInstitutionalEmail(intake.email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setApplicationStep(3);
  }

  function updateIntake(field: keyof typeof intake, value: string) {
    setIntake((current) => ({ ...current, [field]: value }));
    if (field === 'email') setEmailError(false);
  }

  function exportAllocationBrief() {
    const date = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'long',
      timeZone: 'Europe/London',
    }).format(new Date());
    const brief = [
      'AURA TREASURY & LIQUIDITY',
      'TREASURY ALLOCATION BRIEF',
      `Prepared ${date}`,
      '',
      `Corporate treasury balance: ${formatCurrency(balance, currency)}`,
      `Domicile jurisdiction: ${domicile}`,
      `Reporting currency: ${currency}`,
      'Net effective overnight APY: 4.92%',
      `Projected annual yield: ${formatCurrency(annualYield, currency, 2)}`,
      `Projected monthly return: ${formatCurrency(monthlyYield, currency, 2)}`,
      'Counterparty risk rating: AAA Institutional Isolation',
      'Settlement profile: T+0 real-time settlement',
      '',
      'AURA Treasury | Institutional Coverage',
    ].join('\n');
    const file = new Blob([brief], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AURA-Treasury-Allocation-${currency}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast('Treasury allocation brief downloaded.');
  }

  function runEndpoint() {
    if (apiBusy) return;
    setApiBusy(true);
    setApiResponse(null);
    window.setTimeout(() => {
      setApiResponse({
        status: 'CONFIRMED',
        transaction_hash: 'tx_0x9b41...e7f2',
        settlement: 'T+0',
        route: 'USD_TBILL_LADDER',
        amount: '2500000.00',
        currency: 'USD',
        executed_at: new Date().toISOString(),
      });
      setApiBusy(false);
    }, 180);
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(apiSnippets[apiLanguage]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function createApiKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    const secret = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
    setGeneratedApiKey(`aura_live_${secret}`);
    setApiKeyCopied(false);
  }

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(generatedApiKey);
      setApiKeyCopied(true);
      window.setTimeout(() => setApiKeyCopied(false), 1800);
    } catch {
      setApiKeyCopied(false);
    }
  }

  function submitPortalCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setPortalStep('verification');
  }

  function submitPortalVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setPortalStep('signed-in');
  }

  const navItems = [
    { label: 'YIELD ENGINE', href: '#yield' },
    { label: 'LIQUIDITY NETWORKS', href: '#networks' },
    { label: 'SECURITY & CUSTODY', href: '#security' },
    { label: 'DEVELOPER API', href: '#api' },
  ];

  return (
    <div className="app-shell">
      <div className="institutional-ribbon" id="status">
        <div className="institutional-ribbon__inner">
          <span className="ribbon-primary"><ShieldCheck size={13} strokeWidth={1.7} /> Regulated by FINMA (Switzerland) &amp; MAS (Singapore) Exemption</span>
          <span className="ribbon-divider" />
          <span className="ribbon-secondary">Real-Time Settlement Network</span>
          <span className="ribbon-meta"><span className="ribbon-meta-dot" /> Global institutional coverage · 24/7</span>
        </div>
      </div>

      <header className="site-header">
        <div className="site-header__inner container">
          <a className="brand-lockup" href="#top" aria-label="AURA Treasury home" onClick={() => setMobileNavOpen(false)}>
            <AuraMark />
            <span className="brand-name">AURA</span>
            <span className="brand-divider" />
            <span className="brand-descriptor">TREASURY</span>
          </a>

          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav className={`primary-nav${mobileNavOpen ? ' primary-nav--open' : ''}`} id="primary-navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)}>{item.label}</a>
            ))}
            <div className="mobile-nav-actions">
              <button className="button button--outline button--small" type="button" onClick={() => { setPortalStep('credentials'); setPortalOpen(true); setMobileNavOpen(false); }}>Client portal</button>
              <button className="button button--primary button--small" type="button" onClick={() => openApplication('account')}>Open treasury account <ArrowUpRight size={14} /></button>
            </div>
          </nav>

          <div className="header-actions">
            <div className="network-status" aria-label="Mainnet v4.2, 99.998 percent uptime">
              <span className="status-pulse"><span /></span>
              <span className="network-status__text"><strong>Mainnet v4.2</strong><span>99.998% uptime</span></span>
            </div>
            <button className="portal-button" type="button" onClick={() => { setPortalOpen(true); setPortalStep('credentials'); }}>
              Client portal <ArrowUpRight size={13} />
            </button>
            <button className="button button--primary button--header" type="button" onClick={() => openApplication('account')}>
              Open treasury account <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="container hero-layout">
            <div className="hero-copy">
              <Eyebrow>Enterprise asset protocol <span className="eyebrow-dot">·</span> $4.8B+ settled</Eyebrow>
              <h1>Programmable liquidity <em>and overnight yield</em> for global balance sheets.</h1>
              <p className="hero-lede">AURA unifies multi-currency cash reserves, automated T-Bill laddering, and sub-second cross-border payments into a single SOC-2 Type II institutional dashboard.</p>
              <div className="hero-actions">
                <a className="button button--primary button--large" href="#yield">Launch simulator <ArrowRight size={16} /></a>
                <button className="button button--text button--large" type="button" onClick={() => openApplication('consultation')}>
                  Schedule partner consultation <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="hero-proofline">
                <div className="hero-proof-avatars" aria-hidden="true">
                  <span className="proof-avatar proof-avatar--one">A</span>
                  <span className="proof-avatar proof-avatar--two">N</span>
                  <span className="proof-avatar proof-avatar--three">+</span>
                </div>
                <p><strong>Built for finance at scale</strong><span>Trusted across 3 global financial centres</span></p>
              </div>
            </div>

            <div className="hero-visual">
              <img src="/assets/images/hero-hq-glass.jpg" alt="Glass-fronted financial headquarters in Zurich at dusk" />
              <div className="hero-image-shade" />
              <div className="hero-image-topline"><span className="hero-image-kicker"><span className="image-status-dot" /> AURA NETWORK / 01</span><span className="hero-image-coordinates">47°22' N&nbsp; 8°32' E</span></div>
              <div className="hero-image-caption">
                <span>Institutional infrastructure</span>
                <strong>Capital in motion.<br />Confidence at rest.</strong>
              </div>
              <div className="hero-floating-card">
                <div className="hero-floating-card__icon"><Activity size={16} /></div>
                <div className="hero-floating-card__copy"><span>Network reserve ratio</span><strong>1.00 <i>verified</i></strong></div>
                <span className="hero-floating-card__sparkline" aria-hidden="true"><svg viewBox="0 0 74 24" fill="none"><path d="M1 17.5 11 14l9 2 9-7.5 9 5 9-8 9 4 8-5 9 1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M1 23h72" stroke="currentColor" strokeWidth=".7" opacity=".3" /></svg></span>
              </div>
              <div className="hero-image-index"><span>01</span><i /> Zurich · Switzerland</div>
            </div>
          </div>
          <div className="hero-stats container">
            <div className="hero-stat hero-stat--apy"><span className="hero-stat__label">Net effective APY <span className="stat-currency">USD overnight</span></span><strong className="mono-value">4.92<span>%</span></strong><span className="hero-stat__foot"><span className="stat-trend">↗</span> Treasury yield, annualized</span></div>
            <div className="hero-stat"><span className="hero-stat__label">Settlement finality</span><strong className="stat-phrase">Instant <span>(T-0)</span></strong><span className="hero-stat__foot">vs. T+2 legacy rails</span></div>
            <div className="hero-stat"><span className="hero-stat__label">Custody protection</span><strong className="stat-phrase">$100M</strong><span className="hero-stat__foot">SIPC &amp; excess Lloyd's coverage</span></div>
            <div className="hero-stat hero-stat--network"><span className="hero-stat__label">Global availability</span><strong className="stat-phrase">24 / 7</strong><span className="hero-stat__foot">One treasury, every time zone</span></div>
          </div>
        </section>

        <section className="calculator-section section-pad" id="yield">
          <div className="container">
            <div className="section-heading calculator-heading">
              <div>
                <Eyebrow>Yield engine <span className="eyebrow-dot">·</span> Live allocation model</Eyebrow>
                <h2>Put idle capital<br /><em>to work overnight.</em></h2>
              </div>
              <p>Model a treasury allocation against AURA’s institutional overnight strategy. Adjust balance, domicile and reporting currency to see your projected return.</p>
            </div>

            <div className="calculator-card">
              <div className="calculator-controls">
                <div className="calculator-card__topline"><span className="calculator-label"><span className="calculator-label-icon"><Layers size={15} /></span>Allocation parameters</span><span className="model-state"><span /> Yield model active</span></div>
                <div className="balance-control">
                  <div className="control-heading"><label htmlFor="balance-slider">Treasury balance</label><span className="control-minmax">$1M <i>—</i> $50M</span></div>
                  <div className="balance-number-row">
                    <output className="balance-output" htmlFor="balance-slider">{formatCurrency(balance, currency)}</output>
                    <span className="balance-output-currency">{currencyInfo[currency].name}</span>
                  </div>
                  <input
                    id="balance-slider"
                    className="balance-slider"
                    type="range"
                    min={1_000_000}
                    max={50_000_000}
                    step={250_000}
                    value={balance}
                    aria-label="Total corporate treasury balance"
                    aria-valuetext={formatCurrency(balance, currency)}
                    style={{ background: `linear-gradient(90deg, #0d766e 0%, #0d766e ${sliderProgress}%, #e2e8f0 ${sliderProgress}%, #e2e8f0 100%)` }}
                    onChange={(event) => setBalance(Number(event.target.value))}
                  />
                  <div className="slider-scale"><span>$1,000,000</span><span>$50,000,000</span></div>
                </div>
                <div className="calculator-fields">
                  <label className="field-group" htmlFor="domicile-select"><span className="field-label">Domicile jurisdiction</span><span className="select-wrap"><select id="domicile-select" value={domicile} onChange={(event) => setDomicile(event.target.value)}><option>United States (Delaware)</option><option>Switzerland (Canton Zurich)</option><option>United Kingdom</option><option>Singapore</option></select><ChevronDown size={15} /></span></label>
                  <fieldset className="currency-group"><legend className="field-label">Reporting currency</legend><div className="currency-toggle" role="group" aria-label="Choose reporting currency">
                    {(['USD', 'EUR', 'GBP', 'CHF'] as Currency[]).map((item) => (
                      <button key={item} type="button" className={currency === item ? 'currency-option is-active' : 'currency-option'} aria-pressed={currency === item} onClick={() => setCurrency(item)}>{item}</button>
                    ))}
                  </div></fieldset>
                </div>
                <div className="calculator-method"><span className="method-icon"><ShieldCheck size={15} /></span><span><strong>AAA Institutional Isolation</strong><small>Counterparty risk rating</small></span><span className="method-verified"><Check size={12} /> Verified</span></div>
              </div>

              <div className="calculator-results">
                <div className="results-topline"><span>Projected return</span><span className="results-live"><span /> Updated in real time</span></div>
                <div className="primary-result"><span className="result-overline">Annual yield <span>·</span> 4.92% APY</span><strong>{formatCurrency(annualYield, currency, 2)}</strong><span className="result-note">Annualized net return, based on the allocation shown</span></div>
                <div className="result-divider" />
                <div className="secondary-results">
                  <div className="secondary-result"><span>Monthly automated return</span><strong>{formatCurrency(monthlyYield, currency, 2)}</strong><small>Distributed monthly</small></div>
                  <div className="secondary-result"><span>Settlement window</span><strong>T+0 <i>instant</i></strong><small>On eligible routes</small></div>
                </div>
                <div className="results-chart" aria-hidden="true">
                  <div className="chart-label"><span>12-month yield projection</span><span>4.92% <i>↗</i></span></div>
                  <div className="chart-bars"><span style={{ height: '33%' }} /><span style={{ height: '44%' }} /><span style={{ height: '40%' }} /><span style={{ height: '58%' }} /><span style={{ height: '52%' }} /><span style={{ height: '65%' }} /><span style={{ height: '62%' }} /><span style={{ height: '76%' }} /><span style={{ height: '69%' }} /><span style={{ height: '85%' }} /><span style={{ height: '80%' }} /><span style={{ height: '100%' }} /></div>
                  <div className="chart-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>DEC</span></div>
                </div>
                <button className="button button--primary export-button" type="button" onClick={exportAllocationBrief}><ArrowDownToLine size={15} /> Export treasury allocation brief <ArrowRight size={14} /></button>
              </div>
            </div>
            <div className="calculator-footnote"><span><LockKeyhole size={12} /> Confidential allocation modelling</span><span>Net effective yield reflects current overnight rates <i>·</i> Updated 09:00 UTC</span></div>
          </div>
        </section>

        <section className="network-section section-pad" id="networks">
          <div className="container">
            <div className="section-heading network-heading">
              <div><Eyebrow>Liquidity networks <span className="eyebrow-dot">·</span> Always in reach</Eyebrow><h2>One treasury layer.<br /><em>Every market connected.</em></h2></div>
              <div className="network-heading-copy"><p>Move cash across borders, counterparties and reserve strategies without waiting for the next business day. AURA’s network aligns institutional control with global liquidity.</p><a className="inline-link" href="#api">Explore the integration layer <ArrowRight size={14} /></a></div>
            </div>
            <div className="network-image-grid">
              <article className="network-photo network-photo--wide">
                <img src="/assets/images/datacenter-core.jpg" alt="Institutional compute racks in a secure data facility" loading="lazy" />
                <div className="photo-overlay" />
                <div className="photo-topline"><span><span className="photo-live-dot" /> PRIVATE CUSTODY FABRIC</span><span>01 / 03</span></div>
                <div className="photo-caption"><span>Zurich · Secure infrastructure</span><strong>Custody designed around<br />institutional control.</strong></div>
                <div className="photo-arrow"><ArrowUpRight size={17} /></div>
              </article>
              <article className="network-photo">
                <img src="/assets/images/trading-floor-blur.jpg" alt="Institutional trading floor at market open in Singapore" loading="lazy" />
                <div className="photo-overlay" />
                <div className="photo-topline"><span><span className="photo-live-dot" /> MULTI-CURRENCY RAILS</span><span>02 / 03</span></div>
                <div className="photo-caption"><span>Singapore · Market open</span><strong>Clear across<br />time zones.</strong></div>
                <div className="photo-arrow"><ArrowUpRight size={17} /></div>
              </article>
              <article className="network-photo network-photo--vault">
                <img src="/assets/images/audit-vault.jpg" alt="Brushed titanium and matte steel institutional vault" loading="lazy" />
                <div className="photo-overlay" />
                <div className="photo-topline"><span><span className="photo-live-dot" /> RESERVE INTEGRITY</span><span>03 / 03</span></div>
                <div className="photo-caption"><span>Independent verification</span><strong>Proof, built<br />into every reserve.</strong></div>
                <div className="photo-arrow"><ArrowUpRight size={17} /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="security-section section-pad" id="security">
          <div className="container">
            <div className="section-heading security-heading">
              <div><Eyebrow>Security &amp; custody <span className="eyebrow-dot">·</span> Control by design</Eyebrow><h2>Resilient by architecture.<br /><em>Transparent by default.</em></h2></div>
              <p>Critical controls are distributed across the protocol—not delegated to a single intermediary or a single point of failure.</p>
            </div>
            <div className="feature-grid">
              <article className="feature-card"><div className="feature-card__top"><span className="feature-icon"><Fingerprint size={19} strokeWidth={1.65} /></span><span className="feature-index">01</span></div><h3>Multi-party computation custody</h3><p>Quorum-threshold signing distributes key control across independent, hardened execution environments.</p><a href="#attestations" className="feature-link" aria-label="Learn about MPC custody"><ArrowUpRight size={15} /></a></article>
              <article className="feature-card"><div className="feature-card__top"><span className="feature-icon"><ArrowLeftRight size={19} strokeWidth={1.65} /></span><span className="feature-index">02</span></div><h3>Smart route rebalancing</h3><p>Automated sweeps route funds between short-term sovereign paper and central bank reserves.</p><a href="#yield" className="feature-link" aria-label="Explore smart routing"><ArrowUpRight size={15} /></a></article>
              <article className="feature-card"><div className="feature-card__top"><span className="feature-icon"><Zap size={19} strokeWidth={1.65} /></span><span className="feature-index">03</span></div><h3>Programmable settlement</h3><p>Native ISO 20022 wire generation with sub-second multi-currency payment rails.</p><a href="#api" className="feature-link" aria-label="Explore programmable settlement"><ArrowUpRight size={15} /></a></article>
              <article className="feature-card"><div className="feature-card__top"><span className="feature-icon"><ScanLine size={19} strokeWidth={1.65} /></span><span className="feature-index">04</span></div><h3>Cryptographic proof of reserves</h3><p>On-chain and ledger attestations are reconciled and independently updated every 15 minutes.</p><a href="#attestations" className="feature-link" aria-label="Review proof of reserves"><ArrowUpRight size={15} /></a></article>
            </div>
            <div className="security-data-line"><span><span className="security-line-dot" /> Controls monitored continuously</span><span>Last reserve attestation <strong>08:45:12 UTC</strong></span><span>Policy framework <strong>ISO 27001 · SOC 2 Type II</strong></span></div>
          </div>
        </section>

        <section className="api-section section-pad" id="api">
          <div className="container api-layout">
            <div className="api-copy">
              <Eyebrow>Developer API <span className="eyebrow-dot">·</span> Programmable treasury</Eyebrow>
              <h2>Build treasury logic<br />into <em>your own stack.</em></h2>
              <p>Orchestrate sweeps, route liquidity and reconcile settlement events with a predictable, typed API designed for institutional systems.</p>
              <div className="api-capability-list">
                <div><span className="api-capability-icon"><Code2 size={15} /></span><span><strong>One REST surface</strong><small>Consistent endpoints across currencies and rails</small></span><Check size={14} /></div>
                <div><span className="api-capability-icon"><Activity size={15} /></span><span><strong>Event-driven settlement</strong><small>Signed webhooks with delivery guarantees</small></span><Check size={14} /></div>
                <div><span className="api-capability-icon"><LockKeyhole size={15} /></span><span><strong>Scoped credentials</strong><small>Granular permissions and key rotation</small></span><Check size={14} /></div>
              </div>
              <div className="api-copy-actions"><a href="#api-console" className="inline-link">Read the API reference <ArrowRight size={14} /></a><button className="inline-link-button" type="button" onClick={() => setApiKeyDrawerOpen(true)}><LockKeyhole size={14} /> Generate API key <ArrowUpRight size={13} /></button></div>
            </div>

            <div className="api-console" id="api-console">
              <div className="api-console__head"><div className="api-console__identity"><span className="api-terminal-icon"><Code2 size={15} /></span><span><strong>API request</strong><small>POST <i>/v1/treasury/sweep/execute</i></small></span></div><span className="api-version">API v1.0</span></div>
              <div className="api-editor">
                <div className="api-editor__toolbar"><div className="code-tabs" role="tablist" aria-label="API example language">
                  {(['typescript', 'python', 'curl'] as ApiLanguage[]).map((language) => <button key={language} type="button" role="tab" aria-selected={apiLanguage === language} className={apiLanguage === language ? 'code-tab is-active' : 'code-tab'} onClick={() => setApiLanguage(language)}>{language === 'typescript' ? 'TypeScript' : language === 'python' ? 'Python' : 'cURL'}</button>)}
                </div><button type="button" className="copy-button" onClick={copySnippet} aria-label="Copy API example">{copied ? <Check size={14} /> : <Copy size={14} />}<span>{copied ? 'Copied' : 'Copy'}</span></button></div>
                <pre className="code-block" role="tabpanel"><code>{apiSnippets[apiLanguage]}</code></pre>
              </div>
              <div className="api-response">
                <div className="api-response__head"><span><span className="response-led" /> RESPONSE</span>{apiResponse && !apiBusy && <span className="response-latency">180 ms <i>·</i> 200 OK</span>}</div>
                {apiBusy ? <div className="response-pending"><span className="response-spinner" /> Processing treasury instruction<span className="pending-latency">180 ms</span></div> : apiResponse ? <pre className="response-json"><code>{JSON.stringify(apiResponse, null, 2)}</code></pre> : <div className="response-empty"><span className="response-empty-icon"><ArrowDownToLine size={15} /></span><span><strong>Endpoint response</strong><small>Execute a sweep to retrieve the settlement response.</small></span></div>}
              </div>
              <div className="api-console__footer"><span><LockKeyhole size={12} /> Signed authorization required</span><button className="endpoint-button" type="button" onClick={runEndpoint} disabled={apiBusy}>{apiBusy ? <><span className="button-spinner" /> Executing</> : <>Test endpoint <ArrowRight size={14} /></>}</button></div>
            </div>
          </div>
        </section>

        <section className="leadership-section section-pad" id="attestations">
          <div className="container">
            <div className="leadership-heading"><div><Eyebrow>Governance <span className="eyebrow-dot">·</span> Independent oversight</Eyebrow><h2>Built by operators.<br /><em>Reviewed by institutions.</em></h2></div><p>A disciplined operating model combines treasury expertise, quantitative risk and third-party attestation.</p></div>
            <div className="leadership-grid">
              <article className="leader-card"><div className="leader-photo leader-photo--mono"><img src="/assets/images/founder-portrait-1.jpg" alt="Portrait of AURA chief investment officer" loading="lazy" /><span className="leader-photo-label">LEADERSHIP / 01</span></div><div className="leader-details"><div><h3>Alexander Mercer</h3><p>Chief Investment Officer</p></div><a href="mailto:institutional@aura.finance" className="leader-contact" aria-label="Contact Alexander Mercer"><ArrowUpRight size={15} /></a></div><div className="leader-focus"><span>01 / TREASURY STRATEGY</span><span>Zurich, Switzerland</span></div></article>
              <article className="leader-card"><div className="leader-photo"><img src="/assets/images/founder-portrait-2.jpg" alt="Portrait of AURA head of quantitative treasury risk" loading="lazy" /><span className="leader-photo-label">LEADERSHIP / 02</span></div><div className="leader-details"><div><h3>Dr. Maya Chen</h3><p>Head of Quantitative Treasury Risk</p></div><a href="mailto:institutional@aura.finance" className="leader-contact" aria-label="Contact Dr. Maya Chen"><ArrowUpRight size={15} /></a></div><div className="leader-focus"><span>02 / RISK &amp; LIQUIDITY</span><span>San Francisco, USA</span></div></article>

              <aside className="attestation-card">
                <div className="attestation-card__head"><div><span className="attestation-eyebrow">Independent assurance</span><h3>Institutional<br />standards, verified.</h3></div><span className="attestation-shield"><ShieldCheck size={21} strokeWidth={1.6} /></span></div>
                <div className="attestation-list">
                  <div><span className="attestation-mark"><BadgeCheck size={15} /></span><span><strong>Deloitte Attested SOC-2 Type II</strong><small>Controls reviewed independently</small></span><ChevronRight size={14} /></div>
                  <div><span className="attestation-mark"><Shield size={15} /></span><span><strong>ISO/IEC 27001 Certified</strong><small>Information security management</small></span><ChevronRight size={14} /></div>
                  <div><span className="attestation-mark"><Globe2 size={15} /></span><span><strong>Bermuda Monetary Authority</strong><small>Sandbox Cohort</small></span><ChevronRight size={14} /></div>
                </div>
                <div className="attestation-foot"><span><CircleCheck size={13} /> Continuous control environment</span><span>View assurance <ArrowUpRight size={13} /></span></div>
              </aside>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="container closing-inner">
            <div className="closing-emblem"><AuraMark inverse /></div>
            <div className="closing-copy"><Eyebrow light>Move with certainty</Eyebrow><h2>Make every reserve<br /><em>work with intent.</em></h2></div>
            <div className="closing-action"><p>Build a more resilient treasury with institutional-grade liquidity and yield.</p><button className="button button--light" type="button" onClick={() => openApplication('account')}>Open a treasury account <ArrowUpRight size={15} /></button><span>Global coverage desk · Response within 2 business hours</span></div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="disclosures">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand-column">
              <a className="brand-lockup brand-lockup--footer" href="#top"><AuraMark inverse /><span className="brand-name">AURA</span><span className="brand-divider" /><span className="brand-descriptor">TREASURY</span></a>
              <p>Modern programmable treasury.<br />Designed for the balance sheets of tomorrow.</p>
              <a className="footer-contact" href="mailto:institutional@aura.finance"><Mail size={14} /> institutional@aura.finance</a>
            </div>
            <div className="footer-column"><span className="footer-heading">Platform</span><a href="#yield">Yield engine</a><a href="#networks">Liquidity networks</a><a href="#security">Security &amp; custody</a><a href="#api">Developer API</a></div>
            <div className="footer-column"><span className="footer-heading">Offices</span><span className="office-item"><strong>Zurich</strong>Bahnhofstrasse 45<br />8001 Zurich, Switzerland</span><span className="office-item"><strong>San Francisco</strong>One Maritime Plaza<br />San Francisco, CA 94111</span></div>
            <div className="footer-column footer-column--last"><span className="footer-heading">Regional coverage</span><span className="office-item"><strong>Singapore</strong>Marina Bay Financial Centre<br />Singapore 018981</span><a className="footer-status" href="#status"><span className="footer-status-dot" /> Network status <ArrowUpRight size={12} /></a></div>
          </div>
          <div className="footer-disclosure"><span>Disclosure &amp; regulatory information</span><p>AURA Treasury services are provided through appropriately authorized entities and institutional counterparties. Yield rates are variable and may change with market conditions. Treasury allocations involve risk, including possible loss of principal. Custody coverage is subject to applicable terms, eligibility and limits. Regulatory status and product availability vary by jurisdiction.</p><a href="mailto:legal@aura.finance">Regulatory enquiries <ArrowUpRight size={11} /></a></div>
          <div className="footer-bottom"><span>© 2026 AURA Treasury Technologies. All rights reserved.</span><div><a href="#disclosures">Privacy</a><a href="#disclosures">Terms</a><a href="#disclosures">Regulatory disclosures</a></div><span className="footer-location"><Globe2 size={12} /> Zurich · San Francisco · Singapore</span></div>
        </div>
      </footer>

      {applicationOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setApplicationOpen(false); }}>
          <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="application-title">
            <div className="application-modal__visual"><img src="/assets/images/hero-hq-glass.jpg" alt="AURA institutional headquarters" /><div className="modal-visual-shade" /><a className="modal-brand" href="#top" onClick={() => setApplicationOpen(false)}><AuraMark inverse /><span>AURA <i>TREASURY</i></span></a><div className="modal-visual-caption"><Eyebrow light>Institutional coverage</Eyebrow><p>Liquidity engineered<br />for your next horizon.</p><span><Globe2 size={13} /> Zurich · San Francisco · Singapore</span></div><div className="modal-visual-footer">PRIVATE CLIENT ONBOARDING <span>01 — 03</span></div></div>
            <div className="application-modal__content">
              <button className="modal-close" type="button" aria-label="Close application" onClick={() => setApplicationOpen(false)}><X size={19} /></button>
              <div className="application-content-top"><span className="modal-overline">{applicationMode === 'account' ? 'New institutional relationship' : 'Partner consultation'}</span><div className="step-progress" aria-label={`Step ${applicationStep} of 3`}>{[1, 2, 3].map((step) => <span key={step} className={applicationStep >= step ? 'step-progress-item is-complete' : 'step-progress-item'} />)}</div></div>
              {applicationStep === 1 && <>
                <div className="modal-heading"><span className="modal-step">01 / ENTITY PROFILE</span><h2 id="application-title">Let’s understand<br />your treasury.</h2><p>Tell us about your organization to connect you with the right institutional coverage team.</p></div>
                <form className="application-form" onSubmit={submitEntityDetails}>
                  <label className="form-field"><span>Legal entity name</span><input required autoFocus value={intake.entity} onChange={(event) => updateIntake('entity', event.target.value)} placeholder="e.g. Meridian Holdings Ltd." /></label>
                  <label className="form-field"><span>Corporate domicile</span><span className="form-select-wrap"><select required value={intake.domicile} onChange={(event) => updateIntake('domicile', event.target.value)}><option>United States (Delaware)</option><option>Switzerland (Canton Zurich)</option><option>United Kingdom</option><option>Singapore</option></select><ChevronDown size={15} /></span></label>
                  <label className="form-field"><span>Estimated monthly treasury volume</span><span className="form-select-wrap"><select required value={intake.volume} onChange={(event) => updateIntake('volume', event.target.value)}><option value="" disabled>Select a monthly range</option><option>$1M – $5M</option><option>$5M – $25M</option><option>$25M – $100M</option><option>$100M+</option></select><ChevronDown size={15} /></span></label>
                  <button className="button button--primary modal-submit" type="submit">Continue to authorized officer <ArrowRight size={15} /></button>
                  <div className="modal-secure-line"><LockKeyhole size={12} /> Information is handled with institutional confidentiality</div>
                </form>
              </>}
              {applicationStep === 2 && <>
                <div className="modal-heading"><span className="modal-step">02 / AUTHORIZED OFFICER</span><h2 id="application-title">Who should we<br />speak with?</h2><p>Provide the primary treasury contact for your institution.</p></div>
                <form className="application-form" onSubmit={submitOfficerDetails}>
                  <label className="form-field"><span>Primary authorized officer</span><input required autoFocus value={intake.officer} onChange={(event) => updateIntake('officer', event.target.value)} placeholder="Full legal name" /></label>
                  <label className="form-field"><span>Work email</span><input required type="email" value={intake.email} onChange={(event) => updateIntake('email', event.target.value)} placeholder="name@company.com" aria-describedby={emailError ? 'email-error' : 'email-help'} />{emailError ? <small className="field-error" id="email-error">Enter a valid corporate work email address.</small> : <small className="field-hint" id="email-help">Use your institutional email address.</small>}</label>
                  <label className="form-field"><span>Role</span><span className="form-select-wrap"><select required value={intake.role} onChange={(event) => updateIntake('role', event.target.value)}><option value="" disabled>Select your role</option><option>CFO</option><option>VP Finance</option><option>Treasury Lead</option><option>Other authorized officer</option></select><ChevronDown size={15} /></span></label>
                  <div className="modal-form-actions"><button className="button button--back" type="button" onClick={() => setApplicationStep(1)}><ChevronRight size={14} /> Back</button><button className="button button--primary modal-submit" type="submit">Submit institutional dossier <ArrowRight size={15} /></button></div>
                  <div className="modal-secure-line"><LockKeyhole size={12} /> Your details are protected by AURA’s access controls</div>
                </form>
              </>}
              {applicationStep === 3 && <div className="application-success"><div className="success-icon"><CircleCheck size={27} strokeWidth={1.5} /></div><span className="modal-step">03 / SUBMISSION RECEIVED</span><h2 id="application-title">Your next move<br />starts here.</h2><p className="success-reference">Institutional Dossier <strong>#AT-9824</strong> received.</p><p className="success-copy">An institutional director from our Zurich desk will contact you within 2 business hours.</p><div className="success-summary"><span><Check size={13} /> Entity profile received</span><span><Check size={13} /> Authorized officer registered</span><span><Check size={13} /> Global Institutional Coverage assigned</span></div><button className="button button--primary modal-submit" type="button" onClick={() => setApplicationOpen(false)}>Return to AURA Treasury <ArrowRight size={15} /></button><div className="success-refline">TRACKING REFERENCE <strong>AT-9824 / CH-ZRH</strong></div></div>}
            </div>
          </section>
        </div>
      )}

      {portalOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPortalOpen(false); }}>
          <aside className="portal-drawer" role="dialog" aria-modal="true" aria-labelledby="portal-title">
            <div className="drawer-topline"><a className="brand-lockup" href="#top" onClick={() => setPortalOpen(false)}><AuraMark /><span className="brand-name">AURA</span><span className="brand-divider" /><span className="brand-descriptor">CLIENT PORTAL</span></a><button className="drawer-close" type="button" aria-label="Close client portal" onClick={() => setPortalOpen(false)}><X size={19} /></button></div>
            <div className="portal-drawer__body">
              <div className="portal-illustration"><div className="portal-illustration-ring portal-illustration-ring--outer" /><div className="portal-illustration-ring portal-illustration-ring--inner" /><div className="portal-lock"><LockKeyhole size={23} strokeWidth={1.45} /></div><span className="portal-illustration-orbit portal-orbit-one" /><span className="portal-illustration-orbit portal-orbit-two" /></div>
              {portalStep === 'credentials' && <>
                <span className="portal-overline">Secure institutional access</span><h2 id="portal-title">Welcome to<br /><em>your treasury.</em></h2><p className="portal-lede">Sign in to manage liquidity, settlement instructions and account controls.</p>
                <form className="portal-form" onSubmit={submitPortalCredentials}>
                  <label className="form-field"><span>Work email</span><span className="input-with-icon"><Mail size={15} /><input type="email" autoFocus required value={portalEmail} onChange={(event) => setPortalEmail(event.target.value)} placeholder="name@company.com" /></span></label>
                  <label className="form-field"><span>Password</span><input type="password" required minLength={8} value={portalPassword} onChange={(event) => setPortalPassword(event.target.value)} placeholder="Enter your password" /></label>
                  <button className="portal-forgot" type="button" onClick={() => setToast('Contact your relationship director to restore secure account access.')}>Forgot password?</button>
                  <button className="button button--primary portal-submit" type="submit">Continue securely <ArrowRight size={15} /></button>
                  <button className="sso-button" type="button" onClick={() => { setPortalEmail(''); setPortalPassword(''); setPortalStep('verification'); }}><Building2 size={15} /> Continue with single sign-on</button>
                </form>
                <div className="portal-drawer__foot"><span><ShieldCheck size={14} /> Protected by institutional-grade encryption</span><a href="mailto:institutional@aura.finance">Request access <ArrowUpRight size={12} /></a></div>
              </>}
              {portalStep === 'verification' && <>
                <span className="portal-overline">Multi-factor verification</span><h2 id="portal-title">One more<br /><em>security check.</em></h2><p className="portal-lede">Enter the six-digit verification code from your institution’s authenticator.</p>
                <form className="portal-form" onSubmit={submitPortalVerification}>
                  <label className="form-field"><span>Verification code</span><input className="verification-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus placeholder="000 000" aria-label="Six-digit verification code" /></label>
                  <button className="button button--primary portal-submit" type="submit">Verify identity <ArrowRight size={15} /></button>
                  <button className="portal-forgot portal-back-link" type="button" onClick={() => setPortalStep('credentials')}>Back to sign in</button>
                </form>
                <div className="portal-drawer__foot"><span><Fingerprint size={14} /> Identity verification required for every session</span><a href="mailto:institutional@aura.finance">Need assistance? <ArrowUpRight size={12} /></a></div>
              </>}
              {portalStep === 'signed-in' && <>
                <span className="portal-overline">Institutional workspace</span><h2 id="portal-title">Good to have<br /><em>you with us.</em></h2><p className="portal-lede">Your secure access has been verified. Treasury operations are ready.</p>
                <div className="portal-session-card"><div><span>AVAILABLE TREASURY</span><strong>$10,482,610.00</strong></div><div className="session-divider" /><div className="session-card-grid"><span><small>USD yield</small><b>4.92% APY</b></span><span><small>Settlement status</small><b><i /> All rails active</b></span></div></div>
                <button className="button button--primary portal-submit" type="button" onClick={() => setPortalOpen(false)}>Open treasury workspace <ArrowUpRight size={15} /></button>
                <div className="portal-drawer__foot"><span><ShieldCheck size={14} /> Active institutional session</span><span className="session-reference">AURA · SECURE ACCESS</span></div>
              </>}
            </div>
          </aside>
        </div>
      )}

      {apiKeyDrawerOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setApiKeyDrawerOpen(false); }}>
          <aside className="api-key-drawer" role="dialog" aria-modal="true" aria-labelledby="api-key-title">
            <div className="drawer-topline"><a className="brand-lockup" href="#api" onClick={() => setApiKeyDrawerOpen(false)}><AuraMark /><span className="brand-name">AURA</span><span className="brand-divider" /><span className="brand-descriptor">DEVELOPER ACCESS</span></a><button className="drawer-close" type="button" aria-label="Close API key panel" onClick={() => setApiKeyDrawerOpen(false)}><X size={19} /></button></div>
            <div className="api-key-drawer__body">
              <div className="api-key-symbol"><LockKeyhole size={22} strokeWidth={1.55} /><span className="key-orbit key-orbit--one" /><span className="key-orbit key-orbit--two" /></div>
              <span className="portal-overline">API credentials / production</span>
              <h2 id="api-key-title">Secure access<br /><em>for your stack.</em></h2>
              <p className="portal-lede">Create a scoped credential for treasury operations. Your secret is displayed after creation.</p>
              <div className="api-key-scope"><div className="scope-heading"><span>PERMISSIONS</span><span className="scope-live"><i /> PRODUCTION</span></div><div><Check size={13} /><span><strong>treasury.sweep.execute</strong><small>Initiate approved treasury sweeps</small></span></div><div><Check size={13} /><span><strong>settlement.read</strong><small>Read settlement and confirmation events</small></span></div></div>
              {!generatedApiKey ? <form className="portal-form api-key-form" onSubmit={createApiKey}>
                <label className="form-field"><span>Credential name</span><input required autoFocus value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} placeholder="e.g. Treasury sweep service" /></label>
                <div className="key-retention-note"><ShieldCheck size={14} /><span><strong>Store your key securely</strong><small>Copy this credential to your institution’s secrets manager before closing the panel.</small></span></div>
                <button className="button button--primary portal-submit" type="submit">Generate production API key <ArrowRight size={15} /></button>
              </form> : <div className="generated-key-panel" role="status"><span className="generated-key-label"><CircleCheck size={14} /> API KEY GENERATED</span><span className="generated-key-name">{apiKeyName}</span><div className="generated-key-input"><input aria-label="Generated API key" readOnly value={generatedApiKey} /><button type="button" aria-label="Copy generated API key" onClick={copyApiKey}>{apiKeyCopied ? <Check size={15} /> : <Copy size={15} />}</button></div><small className="generated-key-copy-state">{apiKeyCopied ? 'Credential copied to clipboard.' : 'Copy the full key now and store it securely.'}</small><div className="generated-key-meta"><span>Environment<strong>Production</strong></span><span>Access<strong>Scoped · 2 permissions</strong></span></div></div>}
              <div className="api-key-drawer__foot"><span><Fingerprint size={14} /> Multi-party protected credential controls</span><a href="mailto:institutional@aura.finance">Developer support <ArrowUpRight size={12} /></a></div>
            </div>
          </aside>
        </div>
      )}

      {toast && <div className="toast-message" role="status"><span className="toast-icon"><Check size={14} /></span>{toast}<button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  );
}

export default App;
