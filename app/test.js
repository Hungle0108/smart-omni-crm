import {configureApprovalRules} from './test-approval-fixtures.js';
// Kiểm tra các quy tắc nghiệp vụ đã chốt, gọi qua HTTP thật (gồm cả chặn quyền ở server).
// Chạy: node app/test.js
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const DIR = dirname(fileURLToPath(import.meta.url));
const DB = join(DIR, 'test.db');
const PORT = 3999;
rmSync(DB, { force: true });

const child = spawn(process.execPath, [join(DIR, 'server.js')], {
  env: { ...process.env, CRM_DB: DB, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((ok) => child.stdout.on('data', ok));

const jar = {};
async function call(who, method, path, body) {
  const r = await fetch(`http://localhost:${PORT}/api${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(jar[who] ? { Cookie: jar[who] } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = r.headers.get('set-cookie');
  if (set) jar[who] = set.split(';')[0];
  return { status: r.status, body: await r.json() };
}
const login = (who) => call(who, 'POST', '/login', { username: who, password: '123456' });
const fails = async (res, hint) => { assert.ok(res.status >= 400, `Phải bị chặn: ${hint} (nhận ${res.status})`); };
let pass = 0;
const ok = (name) => { pass++; console.log('  ✓', name); };

try {
  for (const u of ['lan', 'minh', 'hoa', 'duc', 'admin']) assert.equal((await login(u)).status, 200);
  ok('đăng nhập 5 vai');

  await fails(await call('lan', 'POST', '/login', { username: 'lan', password: 'sai' }), 'sai mật khẩu');
  ok('sai mật khẩu bị từ chối');

  // D04 — phạm vi xem khách
  const lanList = (await call('lan', 'GET', '/customers')).body;
  assert.deepEqual(lanList.map((c) => c.id), [1], 'sales chỉ thấy khách được giao');
  await fails(await call('lan', 'GET', '/customers/2'), 'lan mở hồ sơ của minh qua URL trực tiếp');
  assert.equal((await call('hoa', 'GET', '/customers')).body.length, 3, 'trưởng nhóm thấy cả nhóm + chưa giao');
  ok('D04 phạm vi xem chặn cả ở URL trực tiếp');

  // D05 — điều kiện Thắng/Thua/mở lại
  await fails(await call('lan', 'POST', '/opportunities/1/stage', { to: 'Thắng', final_value: 1e9, closed_at: '2026-09-21' }), 'Thắng khi chưa ký');
  await fails(await call('lan', 'POST', '/opportunities/1/stage', { to: 'Thua' }), 'Thua không lý do');
  assert.equal((await call('lan', 'POST', '/opportunities/1/stage', { to: 'Thua', reason: 'Khách chọn nhà cung cấp khác' })).status, 200);
  await fails(await call('lan', 'POST', '/opportunities/1/stage', { to: 'Đàm phán' }), 'mở lại không lý do');
  assert.equal((await call('lan', 'POST', '/opportunities/1/stage', { to: 'Đàm phán', reason: 'Khách liên hệ lại' })).status, 200);
  const h = (await call('lan', 'GET', '/opportunities/1')).body;
  assert.ok(h.history.some((x) => x.to_stage === 'Thua'), 'lịch sử lần thua vẫn còn sau khi mở lại');
  assert.equal(h.opportunity.lost_reason, 'Khách chọn nhà cung cấp khác', 'lý do thua cũ không bị xoá');
  ok('D05/D05b/D05c Thắng cần ký, Thua cần lý do, mở lại giữ lịch sử');

  // D06 — chưa cấu hình ngưỡng thì chưa gửi duyệt được
  const qid = (await call('lan', 'POST', '/quotes', { customer_id: 1, template: 'solution' })).body.id;
  await call('lan', 'PUT', `/quotes/${qid}`, { items: [{ code: 'G1' }], discount_pct: 0 });
  await fails(await call('lan', 'POST', `/quotes/${qid}/submit`, {}), 'gửi duyệt khi chưa cấu hình ngưỡng');
  await fails(await call('hoa', 'PUT', '/settings', { amount: 6e8, discount: 10 }), 'trưởng nhóm sửa cấu hình');
  assert.equal((await call('admin', 'PUT', '/settings', { work_hours: 'T2-T6' })).status, 200);await configureApprovalRules(call,6e8,10);
  ok('D06 thiếu ngưỡng chặn trình; trưởng nhóm thiết lập ngưỡng, admin quản lý lịch');

  // BG01 — Gói 3 cần Gói 1
  const q2 = (await call('minh', 'POST', '/quotes', { customer_id: 2, template: 'solution' })).body.id;
  await fails(await call('minh', 'PUT', `/quotes/${q2}`, { items: [{ code: 'G3' }] }), 'Gói 3 khi khách chưa có Gói 1');
  await fails(await call('minh', 'PUT', `/quotes/${q2}`, { items: [{ code: 'G1' }, { code: 'G3' }] }), 'Có Gói 1 trong báo giá chưa phải đã đăng ký');
  await fails(await call('minh', 'PUT', `/quotes/${q2}`, { items: [{ code: 'GFULL' }, { code: 'G1' }] }), 'Trọn bộ cộng thêm gói thành phần');
  ok('BG01 điều kiện Gói 1 và không cộng trùng trọn bộ');

  // Duyệt trong ngưỡng: trưởng nhóm, không tự duyệt
  await fails(await call('lan', 'POST', `/quotes/${qid}/send`, { send_key: 'x' }), 'gửi khi chưa duyệt');
  assert.equal((await call('lan', 'POST', `/quotes/${qid}/submit`, {})).body.level, 'leader');
  await fails(await call('lan', 'POST', `/quotes/${qid}/approve`, { decision: 'approve' }), 'tự duyệt báo giá của mình');
  await fails(await call('duc', 'POST', `/quotes/${qid}/approve`, { decision: 'approve' }), 'giám đốc duyệt bản trong ngưỡng');
  assert.equal((await call('hoa', 'POST', `/quotes/${qid}/approve`, { decision: 'approve' })).status, 200);
  ok('duyệt trong ngưỡng: trưởng nhóm, không tự duyệt');

  // Gửi một lần, bấm lại không nhân đôi
  const s1 = await call('lan', 'POST', `/quotes/${qid}/send`, { send_key: 'k1' });
  assert.equal(s1.body.delivered, false, 'chưa nối Zalo thì không báo đã giao');
  assert.ok((await call('lan', 'POST', `/quotes/${qid}/send`, { send_key: 'k1' })).body.already_sent, 'gửi lại không nhân đôi');
  await fails(await call('lan', 'PUT', `/quotes/${qid}`, { items: [{ code: 'G1' }] }), 'sửa đè báo giá đã gửi');
  ok('gửi đúng một lần, đã gửi không sửa đè');

  // Vượt ngưỡng chiết khấu ⇒ giám đốc
  const q3 = (await call('lan', 'POST', '/quotes', { customer_id: 1, template: 'solution' })).body.id;
  await call('lan', 'PUT', `/quotes/${q3}`, { items: [{ code: 'G1' }], discount_pct: 12 });
  assert.equal((await call('lan', 'POST', `/quotes/${q3}/submit`, {})).body.level, 'director');
  await fails(await call('hoa', 'POST', `/quotes/${q3}/approve`, { decision: 'approve' }), 'trưởng nhóm duyệt bản vượt ngưỡng');
  assert.equal((await call('duc', 'POST', `/quotes/${q3}/approve`, { decision: 'approve' })).status, 200);
  // Sửa nội dung thương mại sau duyệt ⇒ phải duyệt lại
  assert.equal((await call('lan', 'PUT', `/quotes/${q3}`, { items: [{ code: 'G1' }], discount_pct: 3 })).body.approval_revoked, true);
  assert.equal((await call('lan', 'GET', `/quotes/${q3}`)).body.quote.status, 'DRAFT');
  ok('vượt ngưỡng cần giám đốc; sửa sau duyệt phải duyệt lại');

  // D07/D07b — trưởng nhóm giao khách, sales không tự nhận
  await fails(await call('lan', 'POST', '/conversations/2/assign', { user_id: 1 }), 'sales tự nhận khách');
  const sug = (await call('hoa', 'GET', '/conversations/2/suggest')).body;
  assert.equal(sug.list[0].name, 'Trần Thị Lan', 'ưu tiên người am hiểu Smart iVier');
  assert.equal((await call('hoa', 'POST', '/conversations/2/assign', { user_id: sug.list[0].id })).status, 200);
  assert.equal((await call('lan', 'GET', '/conversations')).body.length, 2, 'lan thấy hội thoại vừa được giao');
  ok('D07b gợi ý theo chuyên môn rồi tải việc; chỉ trưởng nhóm giao');

  // Tin nhắn: không báo gửi thật khi chưa nối Zalo
  const msg = await call('lan', 'POST', '/conversations/2/messages', { body: 'Chào anh/chị' });
  assert.equal(msg.body.delivered, false);
  ok('tin nhắn ghi rõ MÔ PHỎNG, không báo gửi thành công giả');

  // Thu hồi phiên
  await call('lan', 'POST', '/logout', {});
  await fails(await call('lan', 'GET', '/customers'), 'gọi API sau khi đăng xuất');
  ok('đăng xuất chặn phiên');

  console.log(`\n${pass} nhóm kiểm tra đạt.`);
} catch (e) {
  console.error('\nKHÔNG ĐẠT:', e.message);
  process.exitCode = 1;
} finally {
  child.kill();
  await new Promise((ok) => child.on('exit', ok)); // Windows giữ khoá tệp đến khi tiến trình thoát hẳn
  rmSync(DB, { force: true });
}
