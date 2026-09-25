// Official OA APIs only. Transport injection is reserved for offline tests.
export class ZaloError extends Error {
  constructor(message, uncertain = false) { super(message); this.uncertain = uncertain; }
}
export function zaloProvider(fetcher = fetch) {
  async function request(url, options) {
    let response;
    try { response = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) }); }
    catch { throw new ZaloError('Không nhận được phản hồi từ Zalo; cần kiểm tra trước khi gửi lại.', true); }
    let data;
    try { data = await response.json(); }
    catch { throw new ZaloError('Zalo trả phản hồi chưa xác định; cần kiểm tra trước khi gửi lại.', true); }
    if (!response.ok || (data.error !== undefined && Number(data.error) !== 0)) {
      const code = Number.isFinite(Number(data.error)) ? Number(data.error) : response.status;
      throw new ZaloError(`Zalo từ chối yêu cầu (mã ${code}). Kiểm tra quyền ứng dụng, hạn mức và điều kiện nhắn tin.`, response.status >= 500);
    }
    return data;
  }
  return {
    async info(token) { return (await request('https://openapi.zalo.me/v2.0/oa/getoa', { headers: { access_token: token } })).data; },
    async refresh(config) {
      const r = await request('https://oauth.zaloapp.com/v4/oa/access_token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', secret_key: config.app_secret }, body: new URLSearchParams({ app_id: config.app_id, refresh_token: config.refresh_token, grant_type: 'refresh_token' }).toString() });
      if (!r.access_token || !r.refresh_token || !Number.isFinite(Number(r.expires_in ?? r.expire_in))) throw new ZaloError('Không nhận đủ mã mới từ Zalo. Cần cấp quyền lại.', true);
      return { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: Date.now() + Number(r.expires_in ?? r.expire_in) * 1000 };
    },
    async send(token, recipient, text) {
      const r = await request('https://openapi.zalo.me/v3.0/oa/message/cs', { method: 'POST', headers: { 'Content-Type': 'application/json', access_token: token }, body: JSON.stringify({ recipient: { user_id: recipient }, message: { text } }) });
      if (!r.data?.message_id) throw new ZaloError('Zalo chưa trả mã tin nhắn; cần đối chiếu trước khi gửi lại.', true);
      return String(r.data.message_id);
    }
  };
}
