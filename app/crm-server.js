// Smart Omni CRM — bản chạy thử nội bộ (phạm vi M2 + lõi mốc Q).
// Chạy: node app/server.js   →  http://127.0.0.1:3000
// Node HTTP/SQLite; JSZip và xml-js đọc mẫu DOCX. Không cần build.
// OA thật chỉ hoạt động sau khi admin cấu hình và bật kết nối. Hội thoại mẫu vẫn mô phỏng.

import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extendCRM } from './features.js';
import { installZaloOA } from './zalo-oa.js';
import { installCustomerProgress } from './customer-progress.js';
import { installOrganizations } from './organizations.js';
import { installLifecycle } from './lifecycle.js';
import { installTemplateImports } from './template-imports.js';
import { installChannelConnections } from './channel-connections.js';
import { installCompanyAccess } from './company-access.js';
import { installChannelAssignments } from './channel-assignments.js';
import { installCustomer360 } from './customer-360.js';

const DIR = dirname(fileURLToPath(import.meta.url));
export function createCRM({dbPath:DB_PATH, webhookPort=0, company, platform, bootstrap=null}) {
const sampleData=company.code==='ivitech';

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000');

// ── Lược đồ ────────────────────────────────────────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS teams(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('sales','leader','director','admin')),
  team_id INTEGER REFERENCES teams(id), expertise TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1, salt TEXT NOT NULL, pwd TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS customers(
  id INTEGER PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('org','person')),
  name TEXT NOT NULL, tax_code TEXT, phone TEXT, email TEXT, org_type TEXT,
  interest TEXT DEFAULT '', has_pkg1 INTEGER NOT NULL DEFAULT 0,
  owner_id INTEGER REFERENCES users(id), team_id INTEGER REFERENCES teams(id),
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS opportunities(
  id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id),
  title TEXT NOT NULL, stage TEXT NOT NULL, est_value INTEGER DEFAULT 0,
  owner_id INTEGER REFERENCES users(id), expected_close TEXT,
  final_value INTEGER, closed_at TEXT, lost_reason TEXT,
  contract_signed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS opp_history(
  id INTEGER PRIMARY KEY, opp_id INTEGER NOT NULL REFERENCES opportunities(id),
  from_stage TEXT, to_stage TEXT NOT NULL, reason TEXT, user_id INTEGER, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks(
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, customer_id INTEGER REFERENCES customers(id),
  assignee_id INTEGER REFERENCES users(id), due_at TEXT, status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS conversations(
  id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id),
  channel TEXT NOT NULL, assignee_id INTEGER REFERENCES users(id),
  bot_active INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'OPEN', last_at TEXT);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY, conv_id INTEGER NOT NULL REFERENCES conversations(id),
  sender TEXT NOT NULL, user_id INTEGER, body TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products(
  code TEXT PRIMARY KEY, name TEXT NOT NULL, family TEXT NOT NULL,
  first_year INTEGER, renewal INTEGER, needs_pkg1 INTEGER NOT NULL DEFAULT 0, note TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS quotes(
  id INTEGER PRIMARY KEY, code TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
  parent_id INTEGER REFERENCES quotes(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id), opp_id INTEGER REFERENCES opportunities(id),
  template TEXT NOT NULL, discount_pct REAL NOT NULL DEFAULT 0,
  activation_date TEXT, status TEXT NOT NULL DEFAULT 'DRAFT',
  owner_id INTEGER REFERENCES users(id), approver_id INTEGER REFERENCES users(id),
  approved_at TEXT, reject_note TEXT, sent_at TEXT, send_key TEXT UNIQUE,
  snapshot TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quote_items(
  id INTEGER PRIMARY KEY, quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  code TEXT NOT NULL, name TEXT NOT NULL, qty INTEGER NOT NULL DEFAULT 1,
  first_year INTEGER, renewal INTEGER);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id INTEGER, action TEXT NOT NULL,
  entity TEXT, detail TEXT);
`);

const now = () => new Date().toISOString();
const q = (sql) => db.prepare(sql);
const log = (uid, action, entity, detail) =>
  q('INSERT INTO audit(at,user_id,action,entity,detail) VALUES(?,?,?,?,?)')
    .run(now(), uid ?? null, action, entity ?? null, detail ? JSON.stringify(detail) : null);

// ── Dữ liệu mẫu (D10: chưa nhập khách thật) ────────────────────────────────
function hash(pw, salt) { return scryptSync(pw, salt, 32).toString('hex'); }
function seed() {
  if (q('SELECT count(*) c FROM users').get().c > 0) return;
  q('INSERT INTO teams(id,name) VALUES(1,?)').run('Nhóm Kinh doanh 1');
  const u = q('INSERT INTO users(username,name,role,team_id,expertise,salt,pwd) VALUES(?,?,?,?,?,?,?)');
  const mk = (un, name, role, team, exp) => {
    const s = randomBytes(8).toString('hex');
    u.run(un, name, role, team, exp, s, hash('123456', s));
  };
  mk('lan', 'Trần Thị Lan', 'sales', 1, 'Smart iVier');
  mk('minh', 'Phạm Văn Minh', 'sales', 1, 'Đào tạo AI');
  mk('hoa', 'Nguyễn Thu Hoa', 'leader', 1, 'Smart iVier,Đào tạo AI');
  mk('duc', 'Lê Anh Đức', 'director', 1, '');
  mk('admin', 'Quản trị hệ thống', 'admin', 1, '');

  // Danh mục lấy từ docs/planning/09 (đơn vị VNĐ). Gói 3/4 cần Gói 1 (BG01).
  const p = q('INSERT INTO products(code,name,family,first_year,renewal,needs_pkg1,note) VALUES(?,?,?,?,?,?,?)');
  p.run('G1', 'Gói 1 Nền tảng điều hành số', 'solution', 499e6, 349e6, 0, '10 tài khoản quản trị');
  p.run('G2', 'Gói 2 Mở rộng người dùng nghiệp vụ', 'solution', 379e6, 329e6, 1, 'Thêm 100 người dùng');
  p.run('G3', 'Gói 3 Chatbot AI và tương tác số', 'solution', 499e6, 429e6, 1, '4 kênh');
  p.run('G4', 'Gói 4 Zalo Mini App phản ánh hiện trường', 'solution', 479e6, 229e6, 1, '');
  p.run('GFULL', 'Trọn bộ Gói 1–4', 'solution', 1629e6, 1149e6, 0, 'Giá phương án trọn bộ, không cộng thêm gói thành phần');
  p.run('AI05', 'Đào tạo AI 05', 'training', 90e6, null, 0, '5 tài khoản, 5 chuyên đề, 12 tháng từ ngày kích hoạt');
  p.run('AI10', 'Đào tạo AI 10', 'training', 125e6, null, 0, '10 tài khoản, 5 chuyên đề, 12 tháng từ ngày kích hoạt');
  p.run('AI20', 'Đào tạo AI 20', 'training', 219e6, null, 0, '20 tài khoản, 5 chuyên đề, 12 tháng từ ngày kích hoạt');

  const c = q('INSERT INTO customers(kind,name,tax_code,phone,email,org_type,interest,has_pkg1,owner_id,team_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  c.run('org', 'Công ty Sao Mai (mẫu)', '0312345678', '02838001122', 'lienhe@saomai.example', 'Doanh nghiệp', 'Smart iVier', 1, 1, 1, now());
  c.run('person', 'Nguyễn Văn Bình (mẫu)', null, '0909000111', 'binh@example.com', null, 'Đào tạo AI', 0, 2, 1, now());
  c.run('org', 'Đơn vị Bình Minh (mẫu)', '0399887766', '02839004455', 'vp@binhminh.example', 'Cơ quan hành chính', 'Smart iVier', 0, null, 1, now());

  const o = q('INSERT INTO opportunities(customer_id,title,stage,est_value,owner_id,expected_close,created_at) VALUES(?,?,?,?,?,?,?)');
  o.run(1, 'Smart iVier cho Sao Mai', 'Gửi báo giá', 998e6, 1, '2026-10-30', now());
  o.run(2, 'Đào tạo AI 10 cho anh Bình', 'Tư vấn/Demo', 125e6, 2, '2026-10-15', now());
  q('INSERT INTO opp_history(opp_id,to_stage,user_id,at) VALUES(1,?,1,?),(2,?,2,?)').run('Mới', now(), 'Mới', now());

  q('INSERT INTO tasks(title,customer_id,assignee_id,due_at,created_at) VALUES(?,?,?,?,?)')
    .run('Gọi lại xác nhận nhu cầu Sao Mai', 1, 1, '2026-09-20T09:00:00.000Z', now());

  const cv = q('INSERT INTO conversations(customer_id,channel,assignee_id,bot_active,last_at) VALUES(?,?,?,?,?)');
  cv.run(1, 'Zalo OA (mô phỏng)', 1, 0, now());
  cv.run(3, 'Zalo OA (mô phỏng)', null, 1, now());
  const m = q('INSERT INTO messages(conv_id,sender,user_id,body,at) VALUES(?,?,?,?,?)');
  m.run(1, 'customer', null, 'Bên mình muốn xem lại báo giá Gói 1 và Gói 3.', now());
  m.run(2, 'customer', null, 'Cho hỏi phần mềm điều hành số có hỗ trợ cấp phường không?', now());
  m.run(2, 'bot', null, '[BOT] Dạ có ạ. Anh/chị cho em xin tên đơn vị và số lượng người dùng dự kiến.', now());

  // Ngưỡng duyệt để TRỐNG: công ty tự nhập (D06). Trống ≠ 0.
  q("INSERT INTO settings(key,value) VALUES('threshold_amount',NULL),('threshold_discount',NULL),('work_hours','T2-T6 08:00-17:30')").run();
  log(null, 'seed', 'system', { note: 'dữ liệu mẫu' });
}
if(bootstrap && !q('SELECT 1 FROM users LIMIT 1').get()) {
 q('INSERT INTO teams(id,name) VALUES(1,?)').run('Nhóm Kinh doanh');
 const salt=randomBytes(16).toString('hex');
 q('INSERT INTO users(username,name,role,team_id,salt,pwd) VALUES(?,?,?,1,?,?)').run(bootstrap.username,bootstrap.name,'admin',salt,hash(bootstrap.password,salt));
}
if(sampleData)seed();
if(!q('PRAGMA table_info(users)').all().some(c=>c.name==='admin_level'))db.exec("ALTER TABLE users ADD COLUMN admin_level TEXT NOT NULL DEFAULT 'admin'");

// ── Phiên đăng nhập ────────────────────────────────────────────────────────
const sessions = new Map(); // Only sessions expire/restart; persisted business data is retained.
const loginFailures = new Map();
const getUser = (req) => {
  const sid = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
  const session = sid && sessions.get(sid);
  if (!session) return null;
  const user = q('SELECT * FROM users WHERE id=? AND active=1').get(session.id);
  if (session.expires < Date.now() || !user || user.pwd !== session.pwd) { sessions.delete(sid); return null; }
  return user;
};

// ── Phạm vi xem (D04) — một chỗ duy nhất, mọi truy vấn đi qua đây ──────────
// sales: chỉ khách được giao. leader: cả nhóm + hàng chờ chưa giao. director/admin: không có quyền duyệt danh sách khách.
function scope(user, col = 'owner_id', teamCol = 'team_id') {
  if (user.role === 'sales') return { sql: `${col} = ?`, args: [user.id] };
  if (user.role === 'leader') return { sql: `${teamCol} = ?`, args: [user.team_id] };
  return { sql: '0=1', args: [] };
}
const teamIds = (user) =>
  q('SELECT id FROM users WHERE team_id=? AND active=1').all(user.team_id).map((r) => r.id);

function canSeeCustomer(user, cust) {
  if (!cust) return false;
  if (user.role === 'director' || user.role === 'admin') return false;
  if (user.role === 'leader') return cust.team_id === user.team_id;
  return cust.owner_id === user.id;
}

// ── Tiền và ngưỡng duyệt báo giá (D06) ─────────────────────────────────────
function totals(items) {
  let first = 0, renewal = 0, renewalUnknown = false;
  for (const it of items) {
    first += (it.first_year ?? 0) * it.qty;
    if (it.renewal == null) renewalUnknown = true; else renewal += it.renewal * it.qty;
  }
  return { first, renewal, renewalUnknown }; // giá năm đầu và gia hạn tách riêng (BG: không tự điền)
}
function thresholds() {
  const g = (k) => q('SELECT value FROM settings WHERE key=?').get(k)?.value ?? null;
  const n = (v) => (v === null || v === '' ? null : Number(v));
  return { amount: n(g('threshold_amount')), discount: n(g('threshold_discount')) };
}
// ponytail: cơ sở xét ngưỡng = giá năm đầu sau giảm thêm (đề xuất của docs/planning/06, chưa chốt).
// Đổi công thức ở đúng hàm này khi công ty chốt cơ sở tính.
function approvalRoute(quote, items) {
  const t = thresholds();
  if (t.amount === null && t.discount === null)
    return { blocked: 'Chưa cấu hình ngưỡng duyệt. Vào Cấu hình để công ty nhập mức tiền và mức chiết khấu.' };
  const { first } = totals(items);
  const net = Math.round(first * (1 - quote.discount_pct / 100));
  const overAmount = t.amount !== null && net > t.amount;
  const overDiscount = t.discount !== null && quote.discount_pct > t.discount;
  return { net, level: overAmount || overDiscount ? 'director' : 'leader', overAmount, overDiscount };
}
// BG01: Gói 3/4 (và Gói 2) chỉ bán kèm khi khách đã đăng ký Gói 1 (không suy ra từ bản nháp báo giá).
function checkPkg1(cust, items) {
  const codes = new Set(items.map((i) => i.code));
  if (cust.has_pkg1) return null;
  const need = items.filter((i) => q('SELECT needs_pkg1 n FROM products WHERE code=?').get(i.code)?.n);
  if (!need.length) return null;
  return `${need.map((i) => i.name).join(', ')} chỉ bán kèm khi khách đã đăng ký Gói 1.`;
}

// ── Bộ định tuyến ──────────────────────────────────────────────────────────
class Err extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const bad = (msg) => { throw new Err(400, msg); };
const routes = [];
const on = (method, path, fn, opts = {}) => {
  const route = { method, path, re: new RegExp('^' + path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn, opts };
  const idx = routes.findIndex(r => r.method === method && r.path === path);
  if (idx >= 0) routes[idx] = route; else routes.push(route);
};

on('POST', '/api/login', ({ body, req }) => {
  const key = req.socket.remoteAddress;
  const failures = loginFailures.get(key);
  if (failures && failures.until > Date.now() && failures.count >= 20) throw new Err(429, 'Đăng nhập sai quá nhiều lần. Thử lại sau 10 phút.');
  const u = q('SELECT * FROM users WHERE username=? AND active=1').get(String(body.username || '').trim());
  const given = Buffer.from(hash(String(body.password || ''), u?.salt || 'x'), 'hex');
  const want = Buffer.from(u?.pwd || hash('x', 'x'), 'hex');
  if (!u || given.length !== want.length || !timingSafeEqual(given, want)) {
    loginFailures.set(key, {count: failures && failures.until > Date.now() ? failures.count + 1 : 1, until: failures && failures.until > Date.now() ? failures.until : Date.now() + 600000});
    throw new Err(401, 'Sai tài khoản hoặc mật khẩu.');
  }
  loginFailures.delete(key);
  for (const [key, session] of sessions) if (session.expires < Date.now()) sessions.delete(key);
  const sid = randomBytes(16).toString('hex');
  sessions.set(sid, {id:u.id,pwd:u.pwd,expires:Date.now()+8*60*60*1000});
  log(u.id, 'login', 'user');
  return { user: { id: u.id, name: u.name, role: u.role }, cookie: `sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` };
}, { open: true });

on('POST', '/api/logout', ({ req }) => {
  const sid = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
  sessions.delete(sid);
  return { ok: true, cookie: 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' };
}, { open: true });

on('GET', '/api/me', ({ user }) => ({ id: user.id, name: user.name, role: user.role, team_id: user.team_id }));

on('GET', '/api/home', ({ user }) => {
  const s = scope(user);
  // Công thức theo docs/planning/03 — không làm tròn thành 0% khi chưa có dữ liệu.
  const open = q(`SELECT COALESCE(sum(est_value),0) v FROM opportunities o
    WHERE o.stage NOT IN ('Thắng','Thua') AND ${s.sql.replace('owner_id', 'o.owner_id').replace('team_id', '(SELECT team_id FROM customers WHERE id=o.customer_id)')}`).get(...s.args).v;
  const won = q(`SELECT count(*) c FROM opportunities o WHERE stage='Thắng' AND ${s.sql.replace('owner_id', 'o.owner_id').replace('team_id', '(SELECT team_id FROM customers WHERE id=o.customer_id)')}`).get(...s.args).c;
  const lost = q(`SELECT count(*) c FROM opportunities o WHERE stage='Thua' AND ${s.sql.replace('owner_id', 'o.owner_id').replace('team_id', '(SELECT team_id FROM customers WHERE id=o.customer_id)')}`).get(...s.args).c;
  const overdue = q(`SELECT count(*) c FROM tasks WHERE status='OPEN' AND due_at < ?
    AND assignee_id ${user.role === 'sales' ? '= ?' : 'IN (SELECT id FROM users WHERE team_id = ?)'}`)
    .get(now(), user.role === 'sales' ? user.id : user.team_id).c;
  const unassigned = q('SELECT count(*) c FROM conversations WHERE assignee_id IS NULL AND status=\'OPEN\'').get().c;
  return {
    open_value: open, overdue_tasks: overdue, unassigned_conversations: unassigned,
    win_rate: won + lost === 0 ? null : Math.round((won * 100) / (won + lost)), won, lost,
  };
});

// — Khách hàng —
on('GET', '/api/customers', ({ user, url }) => {
  const s = scope(user);
  const term = `%${url.searchParams.get('q') || ''}%`;
  return q(`SELECT c.*, u.name owner_name FROM customers c LEFT JOIN users u ON u.id=c.owner_id
    WHERE ${s.sql.replace(/\b(owner_id|team_id)\b/g, 'c.$1')} AND (c.name LIKE ? OR COALESCE(c.phone,'') LIKE ?)
    ORDER BY c.id DESC`).all(...s.args, term, term);
});

on('POST', '/api/customers', ({ user, body }) => {
  if (!body.name?.trim()) bad('Thiếu tên khách hàng.');
  if (!['org', 'person'].includes(body.kind)) bad('Chọn loại khách: doanh nghiệp hoặc cá nhân.');
  const dup = q('SELECT id,name FROM customers WHERE phone IS NOT NULL AND replace(replace(phone,\' \',\'\'),\'+84\',\'0\')=?')
    .get(String(body.phone || '').replace(/\s/g, '').replace('+84', '0'));
  const id = q(`INSERT INTO customers(kind,name,tax_code,phone,email,org_type,interest,has_pkg1,owner_id,team_id,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(body.kind, body.name.trim(), body.tax_code || null, body.phone || null,
    body.email || null, body.org_type || null, body.interest || '', body.has_pkg1 ? 1 : 0,
    user.role === 'sales' ? user.id : body.owner_id || null, user.team_id, now()).lastInsertRowid;
  log(user.id, 'create', 'customer', { id });
  return { id, duplicate_warning: dup && dup.id !== id ? `Trùng số điện thoại với: ${dup.name}` : null };
});

on('GET', '/api/customers/:id', ({ user, params }) => {
  const c = q('SELECT c.*, u.name owner_name FROM customers c LEFT JOIN users u ON u.id=c.owner_id WHERE c.id=?').get(params.id);
  if (!canSeeCustomer(user, c)) throw new Err(403, 'Hồ sơ này ngoài phạm vi được xem.');
  return {
    customer: c,
    opportunities: q('SELECT * FROM opportunities WHERE customer_id=? ORDER BY id DESC').all(c.id),
    quotes: q('SELECT id,code,version,status,created_at FROM quotes WHERE customer_id=? ORDER BY id DESC').all(c.id),
    conversations: q('SELECT * FROM conversations WHERE customer_id=? ORDER BY id DESC').all(c.id),
    tasks: q('SELECT * FROM tasks WHERE customer_id=? AND archived_at IS NULL ORDER BY due_at').all(c.id),
  };
});

// — Cơ hội (D05) —
const STAGES = ['Mới', 'Xác định nhu cầu', 'Tư vấn/Demo', 'Gửi báo giá', 'Đàm phán', 'Thắng', 'Thua'];
on('GET', '/api/opportunities', ({ user }) => {
  const s = scope(user);
  return q(`SELECT o.*, c.name customer_name, c.kind, u.name owner_name FROM opportunities o
    JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=o.owner_id
    WHERE ${s.sql.replace(/\b(owner_id|team_id)\b/g, 'c.$1')} ORDER BY o.id DESC`).all(...s.args);
});

on('POST', '/api/opportunities', ({ user, body }) => {
  const c = q('SELECT * FROM customers WHERE id=?').get(body.customer_id);
  if (!canSeeCustomer(user, c)) throw new Err(403, 'Khách hàng ngoài phạm vi.');
  if (!body.title?.trim()) bad('Thiếu tên cơ hội.');
  const id = q('INSERT INTO opportunities(customer_id,title,stage,est_value,owner_id,expected_close,created_at) VALUES(?,?,?,?,?,?,?)')
    .run(c.id, body.title.trim(), 'Mới', Number(body.est_value || 0), c.owner_id || user.id, body.expected_close || null, now()).lastInsertRowid;
  q('INSERT INTO opp_history(opp_id,to_stage,user_id,at) VALUES(?,?,?,?)').run(id, 'Mới', user.id, now());
  return { id };
});

on('GET', '/api/opportunities/:id', ({ user, params }) => {
  const o = q('SELECT * FROM opportunities WHERE id=?').get(params.id);
  if (!o) throw new Err(404, 'Không tìm thấy cơ hội.');
  const c = q('SELECT * FROM customers WHERE id=?').get(o.customer_id);
  if (!canSeeCustomer(user, c)) throw new Err(403, 'Cơ hội này ngoài phạm vi được xem.');
  return { opportunity: o, customer: c, history: q('SELECT h.*,u.name user_name FROM opp_history h LEFT JOIN users u ON u.id=h.user_id WHERE opp_id=? ORDER BY h.id').all(o.id) };
});

on('POST', '/api/opportunities/:id/stage', ({ user, params, body }) => {
  const o = q('SELECT * FROM opportunities WHERE id=?').get(params.id);
  if (!o) throw new Err(404, 'Không tìm thấy cơ hội.');
  const c = q('SELECT * FROM customers WHERE id=?').get(o.customer_id);
  if (!canSeeCustomer(user, c)) throw new Err(403, 'Cơ hội này ngoài phạm vi được xem.');
  const to = body.to;
  if (!q('SELECT id FROM pipeline_stages WHERE name=? AND archived_at IS NULL').get(to)) bad('Bước không hợp lệ hoặc đã ngừng sử dụng.');

  let reason = body.reason || null;
  if (to === 'Thắng') {
    // D05b: chỉ ghi nhận Thắng khi hai bên đã ký hợp đồng.
    if (body.contract_signed !== true) bad('Chỉ ghi nhận Thắng khi hai bên đã ký hợp đồng. Hãy tích xác nhận đã ký.');
    if (!Number.isFinite(Number(body.final_value)) || Number(body.final_value) <= 0 || Number(body.final_value) > 1e12) bad('Thắng cần giá trị chốt dương và hợp lệ.');
    if (!body.closed_at || Number.isNaN(Date.parse(body.closed_at))) bad('Thắng cần ngày chốt hợp lệ.');
  }
  if (to === 'Thua' && !reason?.trim()) bad('Thua cần ghi lý do.');
  if (o.stage === 'Thua' && to !== 'Thua') {
    // D05c: mở lại cơ hội đã thua — bắt buộc lý do, giữ nguyên lịch sử lần thua trước.
    if (!reason?.trim()) bad('Mở lại cơ hội đã thua cần ghi lý do mở lại.');
    if (to === 'Thắng') bad('Mở lại thì quay về một bước đang xử lý, không nhảy thẳng sang Thắng.');
  }
  if (o.stage === 'Thắng') bad('Cơ hội đã Thắng không được đổi bước trong bản này.');

  q(`UPDATE opportunities SET stage=?, lost_reason=?, final_value=?, closed_at=?, contract_signed=? WHERE id=?`)
    .run(to, to === 'Thua' ? reason : o.lost_reason, // giữ lý do thua cũ, không xoá
      to === 'Thắng' ? Number(body.final_value) : o.final_value,
      to === 'Thắng' || to === 'Thua' ? body.closed_at || now() : o.closed_at,
      to === 'Thắng' ? 1 : o.contract_signed, o.id);
  q('INSERT INTO opp_history(opp_id,from_stage,to_stage,reason,user_id,at) VALUES(?,?,?,?,?,?)')
    .run(o.id, o.stage, to, reason, user.id, now());
  log(user.id, 'stage', 'opportunity', { id: o.id, from: o.stage, to });
  return { ok: true };
});

// — Công việc —
on('GET', '/api/tasks', ({ user }) =>
  q(`SELECT t.*, c.name customer_name FROM tasks t LEFT JOIN customers c ON c.id=t.customer_id
     WHERE t.assignee_id ${user.role === 'sales' ? '= ?' : 'IN (SELECT id FROM users WHERE team_id=?)'} ORDER BY t.due_at`)
    .all(user.role === 'sales' ? user.id : user.team_id));

on('POST', '/api/tasks', ({ user, body }) => {
  if (!body.title?.trim()) bad('Thiếu tên công việc.');
  const id = q('INSERT INTO tasks(title,customer_id,assignee_id,due_at,created_at) VALUES(?,?,?,?,?)')
    .run(body.title.trim(), body.customer_id || null, body.assignee_id || user.id, body.due_at || null, now()).lastInsertRowid;
  return { id };
});
on('POST', '/api/tasks/:id/done', ({ user, params }) => {
  q('UPDATE tasks SET status=\'COMPLETED\' WHERE id=?').run(params.id);
  log(user.id, 'complete', 'task', { id: params.id });
  return { ok: true };
});

// — Hộp thư (MÔ PHỎNG, chưa nối Zalo) —
on('GET', '/api/conversations', ({ user }) => {
  const where = user.role === 'sales' ? 'v.assignee_id = ?'
    : user.role === 'leader' ? '(v.assignee_id IN (SELECT id FROM users WHERE team_id=?) OR v.assignee_id IS NULL)' : '1=1';
  const args = user.role === 'sales' ? [user.id] : user.role === 'leader' ? [user.team_id] : [];
  return q(`SELECT v.*, c.name customer_name, u.name assignee_name,
    (SELECT body FROM messages WHERE conv_id=v.id ORDER BY id DESC LIMIT 1) last_body
    FROM conversations v JOIN customers c ON c.id=v.customer_id LEFT JOIN users u ON u.id=v.assignee_id
    WHERE ${where} ORDER BY v.last_at DESC`).all(...args);
});

const convOrDie = (user, id) => {
  const v = q('SELECT * FROM conversations WHERE id=?').get(id);
  if (!v) throw new Err(404, 'Không tìm thấy hội thoại.');
  const mine = v.assignee_id === user.id;
  const team = user.role !== 'sales' && (v.assignee_id === null || user.role !== 'leader'
    || teamIds(user).includes(v.assignee_id));
  if (!mine && !team) throw new Err(403, 'Hội thoại này ngoài phạm vi được xem.');
  return v;
};

on('GET', '/api/conversations/:id', ({ user, params }) => {
  const v = convOrDie(user, params.id);
  return {
    conversation: v, customer: q('SELECT * FROM customers WHERE id=?').get(v.customer_id),
    messages: q('SELECT m.*,u.name user_name FROM messages m LEFT JOIN users u ON u.id=m.user_id WHERE conv_id=? ORDER BY m.id').all(v.id),
  };
});

// D07b: gợi ý sales — ưu tiên am hiểu sản phẩm khách quan tâm, sau đó ít khách cần xử lý hơn.
on('GET', '/api/conversations/:id/suggest', ({ user, params }) => {
  if (!['leader', 'director', 'admin'].includes(user.role)) throw new Err(403, 'Chỉ trưởng nhóm giao khách.');
  const v = convOrDie(user, params.id);
  const cust = q('SELECT * FROM customers WHERE id=?').get(v.customer_id);
  if (cust.owner_id) return { locked_to: q('SELECT id,name FROM users WHERE id=?').get(cust.owner_id), list: [] };
  const list = q(`SELECT u.id,u.name,u.expertise,
      (SELECT count(*) FROM customers WHERE owner_id=u.id) load
    FROM users u WHERE u.team_id=? AND u.role='sales' AND u.active=1`).all(user.team_id)
    .map((u) => ({ ...u, expert: (u.expertise || '').split(',').includes(cust.interest) }))
    .sort((a, b) => (b.expert - a.expert) || (a.load - b.load));
  return { locked_to: null, list, interest: cust.interest };
});

on('POST', '/api/conversations/:id/assign', ({ user, params, body }) => {
  if (!['leader', 'director', 'admin'].includes(user.role)) throw new Err(403, 'Chỉ trưởng nhóm giao khách.');
  const v = convOrDie(user, params.id);
  const target = q('SELECT * FROM users WHERE id=? AND active=1').get(body.user_id);
  if (!target || target.team_id !== user.team_id) bad('Chỉ giao cho người đang hoạt động trong nhóm.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(v.customer_id);
  // D07: khách đã có người phụ trách thì tiếp tục về người đó.
  const owner = cust.owner_id ?? target.id;
  q('UPDATE customers SET owner_id=?, team_id=? WHERE id=?').run(owner, user.team_id, cust.id);
  q('UPDATE conversations SET assignee_id=?, bot_active=0 WHERE id=?').run(owner, v.id);
  q('INSERT INTO messages(conv_id,sender,user_id,body,at) VALUES(?,?,?,?,?)')
    .run(v.id, 'system', user.id, `Đã giao cho ${q('SELECT name FROM users WHERE id=?').get(owner).name}. Bot dừng tự trả lời.`, now());
  log(user.id, 'assign', 'conversation', { id: v.id, to: owner });
  return { ok: true, assigned_to: owner, kept_existing_owner: cust.owner_id !== null };
});

on('POST', '/api/conversations/:id/messages', ({ user, params, body }) => {
  const v = convOrDie(user, params.id);
  if (v.assignee_id !== user.id && user.role === 'sales') throw new Err(403, 'Chỉ người được giao mới trả lời.');
  if (!body.body?.trim()) bad('Nội dung trống.');
  q('INSERT INTO messages(conv_id,sender,user_id,body,at) VALUES(?,?,?,?,?)').run(v.id, 'agent', user.id, body.body.trim(), now());
  q('UPDATE conversations SET last_at=?, bot_active=0 WHERE id=?').run(now(), v.id);
  log(user.id, 'reply', 'conversation', { id: v.id });
  // Chưa nối Zalo: tin chỉ lưu trong CRM, không gửi ra ngoài. Không báo "đã gửi" giả.
  return { ok: true, delivered: false, note: 'MÔ PHỎNG — chưa kết nối Zalo, tin chưa được gửi tới khách.' };
});

// D07d: chỉ thao tác rõ ràng mới bật lại bot.
on('POST', '/api/conversations/:id/bot', ({ user, params, body }) => {
  const v = convOrDie(user, params.id);
  if (v.assignee_id !== user.id && user.role === 'sales') throw new Err(403, 'Ngoài phạm vi xử lý.');
  q('UPDATE conversations SET bot_active=? WHERE id=?').run(body.on ? 1 : 0, v.id);
  q('INSERT INTO messages(conv_id,sender,user_id,body,at) VALUES(?,?,?,?,?)')
    .run(v.id, 'system', user.id, body.on ? 'Đã chuyển lại cho bot.' : 'Nhân viên tiếp nhận, bot dừng trả lời.', now());
  return { ok: true };
});

// — Báo giá (mốc Q) —
on('GET', '/api/products', () => q('SELECT * FROM products').all());

on('GET', '/api/quotes', ({ user }) => {
  const s = scope(user);
  return q(`SELECT qt.*, c.name customer_name FROM quotes qt JOIN customers c ON c.id=qt.customer_id
    WHERE ${s.sql.replace(/\b(owner_id|team_id)\b/g, 'c.$1')} ORDER BY qt.id DESC`).all(...s.args);
});

on('GET', '/api/quotes/pending', ({ user }) => {
  if (!['leader', 'director'].includes(user.role)) return [];
  // Người duyệt thấy báo giá cần duyệt — không mở kèm toàn bộ hồ sơ khách.
  return q(`SELECT qt.id,qt.code,qt.version,qt.discount_pct,c.name customer_name,u.name owner_name
    FROM quotes qt JOIN customers c ON c.id=qt.customer_id LEFT JOIN users u ON u.id=qt.owner_id
    WHERE qt.status='PENDING'`).all()
    .filter((r) => approvalRoute(q('SELECT * FROM quotes WHERE id=?').get(r.id), items(r.id)).level === user.role
      || (user.role === 'director' && approvalRoute(q('SELECT * FROM quotes WHERE id=?').get(r.id), items(r.id)).level === 'leader'
        && q('SELECT role FROM users WHERE id=?').get(q('SELECT owner_id FROM quotes WHERE id=?').get(r.id).owner_id)?.role === 'leader'));
});

const items = (qid) => q('SELECT * FROM quote_items WHERE quote_id=? ORDER BY id').all(qid);

function quoteView(user, id) {
  const quote = q('SELECT * FROM quotes WHERE id=?').get(id);
  if (!quote) throw new Err(404, 'Không tìm thấy báo giá.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);
  const isApprover = quote.status === 'PENDING' && ['leader', 'director'].includes(user.role);
  if (!canSeeCustomer(user, cust) && !isApprover) throw new Err(403, 'Báo giá này ngoài phạm vi được xem.');
  const its = items(id);
  const t = totals(its);
  return {
    quote, customer: cust, items: its, totals: t,
    net_first_year: Math.round(t.first * (1 - quote.discount_pct / 100)),
    route: quote.status === 'DRAFT' || quote.status === 'PENDING' ? approvalRoute(quote, its) : null,
    thresholds: thresholds(),
  };
}

on('POST', '/api/quotes', ({ user, body }) => {
  const c = q('SELECT * FROM customers WHERE id=?').get(body.customer_id);
  if (!canSeeCustomer(user, c)) throw new Err(403, 'Khách hàng ngoài phạm vi.');
  if (!['solution', 'training'].includes(body.template)) bad('Chọn mẫu: giải pháp phần mềm hoặc đào tạo.');
  const n = q('SELECT count(*) c FROM quotes').get().c + 1;
  const id = q(`INSERT INTO quotes(code,customer_id,opp_id,template,owner_id,created_at) VALUES(?,?,?,?,?,?)`)
    .run(`BG-${String(n).padStart(4, '0')}`, c.id, body.opp_id || null, body.template, user.id, now()).lastInsertRowid;
  log(user.id, 'create', 'quote', { id });
  return { id };
});

on('GET', '/api/quotes/:id', ({ user, params }) => quoteView(user, params.id));

on('PUT', '/api/quotes/:id', ({ user, params, body }) => {
  const quote = q('SELECT * FROM quotes WHERE id=?').get(params.id);
  if (!quote) throw new Err(404, 'Không tìm thấy báo giá.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);
  if (!canSeeCustomer(user, cust)) throw new Err(403, 'Ngoài phạm vi.');
  if (quote.status === 'SENT') bad('Báo giá đã gửi không sửa đè. Hãy tạo bản sửa (phiên bản mới).');

  const list = (body.items || []).map((i) => {
    const p = q('SELECT * FROM products WHERE code=?').get(i.code);
    if (!p) bad(`Không có sản phẩm ${i.code}.`);
    return { code: p.code, name: p.name, qty: Math.max(1, Number(i.qty) || 1), first_year: p.first_year, renewal: p.renewal };
  });
  const err = checkPkg1(cust, list);
  if (err) bad(err);
  // Trọn bộ đã gồm Gói 1–4: không cộng thêm gói thành phần.
  if (list.some((i) => i.code === 'GFULL') && list.some((i) => ['G1', 'G2', 'G3', 'G4'].includes(i.code)))
    bad('Đã chọn Trọn bộ Gói 1–4 thì không cộng thêm từng gói thành phần.');

  q('DELETE FROM quote_items WHERE quote_id=?').run(quote.id);
  const ins = q('INSERT INTO quote_items(quote_id,code,name,qty,first_year,renewal) VALUES(?,?,?,?,?,?)');
  for (const i of list) ins.run(quote.id, i.code, i.name, i.qty, i.first_year, i.renewal);
  // Sửa nội dung thương mại sau duyệt ⇒ phải duyệt lại.
  const reset = quote.status === 'APPROVED' || quote.status === 'PENDING';
  q('UPDATE quotes SET discount_pct=?, activation_date=?, status=?, approver_id=NULL, approved_at=NULL, snapshot=NULL WHERE id=?')
    .run(Number(body.discount_pct || 0), body.activation_date || null, reset ? 'DRAFT' : quote.status, quote.id);
  log(user.id, 'edit', 'quote', { id: quote.id, revoked_approval: reset });
  return { ok: true, approval_revoked: reset };
});

on('POST', '/api/quotes/:id/submit', ({ user, params }) => {
  const quote = q('SELECT * FROM quotes WHERE id=?').get(params.id);
  if (!quote) throw new Err(404, 'Không tìm thấy báo giá.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);
  if (!canSeeCustomer(user, cust)) throw new Err(403, 'Ngoài phạm vi.');
  if (quote.status !== 'DRAFT') bad('Chỉ gửi duyệt bản nháp.');
  const its = items(quote.id);
  if (!its.length) bad('Báo giá chưa có hạng mục.');
  const route = approvalRoute(quote, its);
  if (route.blocked) bad(route.blocked);
  q('UPDATE quotes SET status=\'PENDING\' WHERE id=?').run(quote.id);
  log(user.id, 'submit', 'quote', { id: quote.id, level: route.level });
  return { ok: true, level: route.level, reason: route.overAmount ? 'Vượt ngưỡng tiền' : route.overDiscount ? 'Vượt ngưỡng chiết khấu' : 'Trong ngưỡng' };
});

on('POST', '/api/quotes/:id/approve', ({ user, params, body }) => {
  const quote = q('SELECT * FROM quotes WHERE id=?').get(params.id);
  if (!quote) throw new Err(404, 'Không tìm thấy báo giá.');
  if (quote.status !== 'PENDING') bad('Báo giá không ở trạng thái chờ duyệt.');
  if (quote.owner_id === user.id) throw new Err(403, 'Không tự duyệt báo giá của mình.');
  const its = items(quote.id);
  const route = approvalRoute(quote, its);
  const ownerRole = q('SELECT role FROM users WHERE id=?').get(quote.owner_id)?.role;
  const allowed = route.level === 'director' ? ['director']
    : ownerRole === 'leader' ? ['director'] : ['leader'];
  if (!allowed.includes(user.role))
    throw new Err(403, route.level === 'director'
      ? 'Báo giá vượt ngưỡng: chỉ giám đốc được duyệt.'
      : 'Báo giá trong ngưỡng: trưởng nhóm duyệt.');

  if (body.decision === 'reject' || body.decision === 'revise') {
    q('UPDATE quotes SET status=\'DRAFT\', reject_note=? WHERE id=?').run(body.note || null, quote.id);
    log(user.id, body.decision, 'quote', { id: quote.id });
    return { ok: true, status: 'DRAFT' };
  }
  // Chụp lại nội dung/giá/nhận diện tại lần duyệt: đổi danh mục sau không làm đổi bản đã duyệt.
  const t = totals(its);
  const snapshot = JSON.stringify({
    approved_at: now(), approver: user.name, items: its, discount_pct: quote.discount_pct,
    first_year: t.first, net_first_year: Math.round(t.first * (1 - quote.discount_pct / 100)),
    renewal: t.renewal, renewal_unknown: t.renewalUnknown, activation_date: quote.activation_date,
    identity: 'iViTech', tax_note: 'Chưa gồm VAT — thuế suất chưa xác định.',
  });
  q('UPDATE quotes SET status=\'APPROVED\', approver_id=?, approved_at=?, snapshot=? WHERE id=?')
    .run(user.id, now(), snapshot, quote.id);
  log(user.id, 'approve', 'quote', { id: quote.id });
  return { ok: true, status: 'APPROVED' };
});

on('POST', '/api/quotes/:id/send', ({ user, params, body }) => {
  const quote = q('SELECT * FROM quotes WHERE id=?').get(params.id);
  if (!quote) throw new Err(404, 'Không tìm thấy báo giá.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);
  if (!canSeeCustomer(user, cust)) throw new Err(403, 'Ngoài phạm vi.');
  if (quote.status === 'SENT') return { ok: true, already_sent: true, sent_at: quote.sent_at };
  if (quote.status !== 'APPROVED') throw new Err(403, 'Chưa được duyệt thì không gửi được.');
  const key = String(body.send_key || '').trim();
  if (!key) bad('Thiếu mã chống gửi trùng.');
  if (q('SELECT id FROM quotes WHERE send_key=?').get(key)) return { ok: true, already_sent: true };
  q('UPDATE quotes SET status=\'SENT\', sent_at=?, send_key=? WHERE id=?').run(now(), key, quote.id);
  log(user.id, 'send', 'quote', { id: quote.id });
  // Trạng thái duyệt tách khỏi trạng thái giao tin: chưa nối Zalo nên không báo đã giao tới khách.
  return { ok: true, delivered: false, note: 'MÔ PHỎNG — đã ghi nhận gửi trong CRM, chưa gửi thật qua Zalo.' };
});

on('POST', '/api/quotes/:id/revise', ({ user, params }) => {
  const old = q('SELECT * FROM quotes WHERE id=?').get(params.id);
  if (!old) throw new Err(404, 'Không tìm thấy báo giá.');
  const cust = q('SELECT * FROM customers WHERE id=?').get(old.customer_id);
  if (!canSeeCustomer(user, cust)) throw new Err(403, 'Ngoài phạm vi.');
  const id = q(`INSERT INTO quotes(code,version,parent_id,customer_id,opp_id,template,discount_pct,activation_date,owner_id,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`).run(old.code, old.version + 1, old.id, old.customer_id, old.opp_id,
    old.template, old.discount_pct, old.activation_date, user.id, now()).lastInsertRowid;
  const ins = q('INSERT INTO quote_items(quote_id,code,name,qty,first_year,renewal) VALUES(?,?,?,?,?,?)');
  for (const i of items(old.id)) ins.run(id, i.code, i.name, i.qty, i.first_year, i.renewal);
  return { id, version: old.version + 1 };
});

// — Cấu hình (admin) —
on('GET', '/api/settings', () => ({
  ...thresholds(), work_hours: q('SELECT value FROM settings WHERE key=\'work_hours\'').get()?.value || '',
}));
on('PUT', '/api/settings', ({ user, body }) => {
  if (user.role !== 'admin') throw new Err(403, 'Chỉ quản trị hệ thống sửa cấu hình.');
  const set = q('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  // Trống khác 0: để trống nghĩa là chưa cấu hình, không phải ngưỡng bằng 0.
  const blank = (v) => (v === '' || v === null || v === undefined ? null : String(v));
  set.run('threshold_amount', blank(body.amount));
  set.run('threshold_discount', blank(body.discount));
  set.run('work_hours', String(body.work_hours || ''));
  log(user.id, 'settings', 'system', body);
  return { ok: true };
});

on('GET', '/api/users', ({ user }) =>
  q('SELECT id,name,role,expertise FROM users WHERE team_id=? AND active=1').all(user.team_id));

on('GET', '/api/audit', ({ user }) => {
  if (!['admin', 'director'].includes(user.role)) throw new Err(403, 'Ngoài phạm vi.');
  return q('SELECT a.*,u.name user_name FROM audit a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 200').all();
});

// ── HTTP ───────────────────────────────────────────────────────────────────
const crmHelpers=extendCRM({ db, q, on, Err, bad, now, log, scope, canSeeCustomer, totals, thresholds, hash, sampleData, company });
const routeFn=(path)=>routes.find(r=>r.method==='POST'&&r.path===path).fn;
installCustomerProgress({db,q,on,Err,now,log,sampleData,helpers:crmHelpers,scope,legacy:{tasks:routes.find(r=>r.method==='GET'&&r.path==='/api/tasks').fn,timeline:routes.find(r=>r.method==='GET'&&r.path==='/api/customers/:id/timeline').fn,done:routeFn('/api/tasks/:id/done'),reopen:routeFn('/api/tasks/:id/reopen')}});
const originalCapabilities=routes.find(r=>r.method==='GET'&&r.path==='/api/capabilities').fn;
installOrganizations({db,q,on,Err,now,log,helpers:crmHelpers,canSeeCustomer,legacy:{list:routes.find(r=>r.method==='GET'&&r.path==='/api/customers').fn,detail:routes.find(r=>r.method==='GET'&&r.path==='/api/customers/:id').fn,create:routeFn('/api/customers'),timeline:routes.find(r=>r.method==='GET'&&r.path==='/api/customers/:id/timeline').fn}});
const zaloOA=installZaloOA({db,q,on,Err,now,log,helpers:crmHelpers,keyPath:DB_PATH+'.zalo-key',legacy:{messages:routeFn('/api/conversations/:id/messages'),incoming:routeFn('/api/conversations/:id/incoming'),bot:routeFn('/api/conversations/:id/bot'),quoteSend:routeFn('/api/quotes/:id/send')}});
on('GET','/api/capabilities',ctx=>{const result=originalCapabilities(ctx),s=zaloOA.status();result.local.push('Tiến trình khách hàng, công việc con và mẫu công việc');result.external[0].status=s.enabled?'Đã bật kết nối OA thật — xem trạng thái từng tin':s.configured?'Có cấu hình — đang tạm dừng':'Chưa cấu hình OA thật';return result;});
zaloOA.listen(webhookPort);
installLifecycle({db,q,on,routes,Err,now,log,hash,canSeeCustomer,helpers:crmHelpers,revokeSessions:id=>{for(const [sid,session] of sessions)if(session.id===id)sessions.delete(sid);}});
installTemplateImports({db,q,on,routes,Err,now,log});
const channelConnections=installChannelConnections({db,q,on,Err,now,log,keyPath:DB_PATH+'.channels-key'});
const access=installCompanyAccess({db,q,on,routes,Err,now,log,company,platform,sessions,getUser});
installChannelAssignments({db,q,on,routes,Err,now,log,helpers:crmHelpers,oaStatus:zaloOA.status,connectionDefinitions:channelConnections.accessDefinitions});
// Customer plans are a scoped view of the exact same task list used by contact planning.
const contactPlanList=routes.find(r=>r.method==='GET'&&r.path==='/api/tasks').fn;
on('GET','/api/customers/:id/tasks',ctx=>{crmHelpers.cust(ctx.user,ctx.params.id);return contactPlanList(ctx).filter(t=>String(t.customer_id)===String(ctx.params.id));});
installCustomer360({db,q,on,routes,Err,now,helpers:crmHelpers});
const HTML = () => readFileSync(join(DIR, 'app.html'), 'utf8');

const handler = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    const host = req.headers.host || '';
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) throw new Err(403, 'Máy chủ chỉ phục vụ localhost.');
    if (req.headers.origin && req.headers.origin !== `http://${host}`) throw new Err(403, 'Nguồn yêu cầu không hợp lệ.');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
    if (['/customer-360-ui.js','/customer-360.css','/features-ui.js','/workspace-ui.js','/workspace.css','/zalo-ui.js','/progress-ui.js','/progress.css','/organizations-ui.js','/directory-ui.js','/organizations.css','/catalog-ui.js','/catalog.css','/lifecycle-ui.js','/approval-ui.js','/template-import-ui.js','/template-import.css','/channels-ui.js','/company-ui.js','/channel-assignments-ui.js','/filters-ui.js','/filters.css'].includes(url.pathname)) {
      res.writeHead(200, { 'Content-Type': url.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8' });
      return res.end(readFileSync(join(DIR, url.pathname.slice(1)), 'utf8'));
    }
    if (url.pathname === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ok:true,app:'Smart Omni CRM',mode:'local'})); }
    if (!url.pathname.startsWith('/api/')) {
      if (url.pathname !== '/' && url.pathname !== '/index.html') throw new Err(404, 'Không tìm thấy trang.');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(HTML());
    }
    const r = routes.find((r) => r.method === req.method && r.re.test(url.pathname));
    if (!r) throw new Err(404, 'Không có endpoint này.');
    const user = getUser(req);
    if(req.headers['x-crm-company']&&req.headers['x-crm-company']!==company.code)throw new Err(409,'Công ty đăng nhập đã đổi ở cửa sổ khác. Tải lại trang trước khi tiếp tục.');
    if (!r.opts.open && !user) throw new Err(401, 'Chưa đăng nhập.');
    let body = {};
    if (req.method !== 'GET') {
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw new Err(415, 'Cần nội dung JSON.');
      const raw = await new Promise((ok, fail) => { let d = '', size = 0; req.on('data', c => { size += c.length; if(size > (r.opts.bodyLimit||2e6)) fail(new Err(413,'Dữ liệu vượt kích thước cho phép.')); else d += c; }); req.on('end', () => ok(d)); req.on('error', fail); });
      if (raw) { try { body = JSON.parse(raw); } catch { throw new Err(400, 'JSON không hợp lệ.'); } }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Err(400, 'Nội dung phải là một đối tượng JSON.');
    }
    let out;
    const write = req.method !== 'GET' && !r.opts.async;
    try {
      if(write) db.exec('BEGIN IMMEDIATE');
      const context={ req, url, user, body, params: r.re.exec(url.pathname).groups || {} };
      access.guard(context,r);
      out = (r.opts.async ? await r.fn(context) : r.fn(context)) ?? { ok: true };
      if(write) db.exec('COMMIT');
    } catch(e) { if(write && db.isTransaction) db.exec('ROLLBACK'); throw e; }
    const headers = { 'Content-Type': 'application/json; charset=utf-8' };
    if (out.cookie) { headers['Set-Cookie'] = out.cookie; delete out.cookie; }
    res.writeHead(200, headers);
    res.end(JSON.stringify(out));
  } catch (e) {
    const code = e instanceof Err ? e.code : 500;
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: code === 500 ? 'Không xử lý được yêu cầu. Dữ liệu chưa được thay đổi; vui lòng thử lại.' : e.message }));
    if (code === 500) console.error(e);
  }
};
return {handler,getUser,db,sessions,bootstrapUser(req){const u=getUser(req);return access.canBootstrap(u)?u:null;},suspend(value){sessions.clear();zaloOA.suspend(value);},close(){sessions.clear();zaloOA.close();db.close();}};
}
