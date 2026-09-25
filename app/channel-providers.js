// Official account-read endpoints only. A successful probe never means messaging is enabled.
const field=(key,label,required=false,secret=false,format='text')=>({key,label,required,secret,format});
export const CHANNEL_PROVIDERS=[
 {id:'vnpt_sip',kind:'voice',name:'Thoại — VNPT SIP',endpoint:'',check:false,guide:'https://vnpt.vn/doanh-nghiep/san-pham-dich-vu/giai-phap-sip-trunking-co-dinh/',note:'Đường SIP của VNPT nối vào tổng đài IP PBX. Lưu thông số VNPT/bên lắp đặt cung cấp; chưa đăng ký SIP, gọi điện hoặc lấy lịch sử cuộc gọi. Cần xác định tổng đài đang dùng để tích hợp CRM.',fields:[field('pbx_name','Tên tổng đài / phần mềm đang dùng',true),field('sip_server','Máy chủ SIP / SBC do VNPT cấp',true,false,'host'),field('sip_port','Cổng SIP do VNPT cấp',true,false,'port'),{...field('transport','Giao thức truyền do VNPT cấp',true),choices:[['UDP','UDP'],['TCP','TCP'],['TLS','TLS']]},{...field('auth_mode','Cách xác thực do VNPT cấp',true),choices:[['ip','Theo địa chỉ IP'],['registration','Tài khoản SIP / đăng ký']]},field('allowed_ip','IP tổng đài đã đăng ký với VNPT',false,false,'ip'),field('sip_username','Tên tài khoản SIP (nếu xác thực bằng tài khoản)'),field('sip_password','Mật khẩu SIP (nếu xác thực bằng tài khoản)',false,true),field('caller_id','Đầu số được VNPT cấp',true,false,'sip_phone'),field('pbx_api_url','Địa chỉ API tổng đài (nếu có)',false,false,'url'),field('pbx_api_key','API Key của tổng đài (nếu có)',false,true),field('docs_url','Link tài liệu kết nối tổng đài',false,false,'url')]},
 {id:'meta_messenger',kind:'messenger',name:'Messenger — Meta',endpoint:'https://graph.facebook.com',check:true,guide:'https://developers.facebook.com/docs/messenger-platform/',note:'Dùng Facebook Page và Page Access Token của công ty. Kiểm tra chỉ đọc tên và ID Page.',fields:[field('api_version','Phiên bản Graph API (ví dụ v24.0)',true,false,'version'),field('page_id','Facebook Page ID',true,false,'digits'),field('app_id','Meta App ID',false,false,'digits'),field('access_token','Page Access Token',true,true),field('app_secret','Meta App Secret',false,true),field('verify_token','Mã xác minh webhook',false,true)]},
 {id:'meta_whatsapp',kind:'whatsapp',name:'WhatsApp Business — Meta Cloud API',endpoint:'https://graph.facebook.com',check:true,guide:'https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api',note:'Dùng tài khoản WhatsApp Business (WABA) và Phone Number ID, không dùng mật khẩu WhatsApp cá nhân. Kiểm tra số điện thoại có thuộc WABA đã nhập hay không.',fields:[field('api_version','Phiên bản Graph API (ví dụ v24.0)',true,false,'version'),field('waba_id','WhatsApp Business Account ID (WABA)',true,false,'digits'),field('phone_number_id','Phone Number ID',true,false,'digits'),field('app_id','Meta App ID',false,false,'digits'),field('access_token','WhatsApp Access Token',true,true),field('app_secret','Meta App Secret',false,true),field('verify_token','Mã xác minh webhook',false,true)]},
 {id:'viber_bot',kind:'viber',name:'Viber Bot',endpoint:'https://chatapi.viber.com/pa',check:true,guide:'https://developers.viber.com/docs/api/rest-bot-api/',note:'Dành cho Viber Bot đã được cấp quyền. Kiểm tra chỉ đọc thông tin bot; không tạo bot hay đăng ký dịch vụ có phí.',fields:[field('bot_id','Bot ID (nếu đã biết)'),field('auth_token','Viber Auth Token',true,true)]},
 {id:'twilio_voice',kind:'voice',name:'Thoại — Twilio',endpoint:'https://api.twilio.com',check:true,guide:'https://www.twilio.com/docs/iam/api/account',note:'Kiểm tra tài khoản tổng đài Twilio; không thực hiện cuộc gọi và không kiểm tra quyền sở hữu số gọi ra.',fields:[field('account_sid','Account SID',true,false,'sid'),field('phone_number','Số tổng đài (ví dụ +84...)',false,false,'phone'),field('auth_token','Twilio Auth Token',true,true)]},
 {id:'custom_voice',kind:'voice',name:'Thoại — nhà cung cấp khác',endpoint:'',check:false,guide:'',note:'Lưu thông tin tổng đài hiện có để chuẩn bị tích hợp. Cần tài liệu của nhà cung cấp trước khi viết bộ kết nối; chưa gọi thử API tùy chỉnh.',fields:[field('vendor_name','Tên nhà cung cấp tổng đài',true),field('api_url','Địa chỉ API HTTPS',true,false,'url'),field('account_id','Mã tài khoản / tổng đài'),field('phone_number','Số tổng đài',false,false,'phone'),field('api_key','API Key / Access Token',false,true),field('api_secret','API Secret',false,true),field('docs_url','Link tài liệu API',false,false,'url')]},
 {id:'custom_api',kind:'other',name:'Kênh khác — API tùy chỉnh',endpoint:'',check:false,guide:'',note:'Lưu cấu hình để chuẩn bị tích hợp. Chưa thực thi API tùy chỉnh hoặc nhận/gửi dữ liệu từ kênh này.',fields:[field('vendor_name','Tên nền tảng / nhà cung cấp',true),field('api_url','Địa chỉ API HTTPS',true,false,'url'),field('account_id','Mã tài khoản'),field('api_key','API Key / Access Token',false,true),field('api_secret','API Secret',false,true),field('docs_url','Link tài liệu API',false,false,'url')]}
];
export class ChannelCheckError extends Error {}
export function channelProvider(fetcher=fetch){
 async function request(url,options={}){
  let response;try{response=await fetcher(url,{...options,redirect:'error',signal:AbortSignal.timeout(12000)});}catch{throw new ChannelCheckError('Không liên lạc được API. Kiểm tra mạng và thử lại.');}
  if(!response.ok){await response.body?.cancel();throw new ChannelCheckError(`Nhà cung cấp từ chối kiểm tra (HTTP ${response.status}). Kiểm tra mã truy cập, quyền ứng dụng và trạng thái tài khoản.`);}
  let data;try{const chunks=[];let count=0;for await(const chunk of response.body){count+=chunk.length;if(count>512*1024)throw Error();chunks.push(chunk);}data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ChannelCheckError('API trả nội dung không hợp lệ hoặc quá lớn.');}
  if(data?.error||data?.status!==undefined&&typeof data.status==='number'&&data.status!==0)throw new ChannelCheckError('API chưa chấp nhận mã truy cập hoặc quyền tài khoản.');
  return data;
 }
 const name=value=>String(value||'').slice(0,160);
 return {async check(provider,c){
  if(provider==='meta_messenger'){
   const data=await request(`https://graph.facebook.com/${c.api_version}/me?fields=id,name`,{headers:{Authorization:'Bearer '+c.access_token}});
   if(String(data.id)!==c.page_id)throw new ChannelCheckError('Token không thuộc Facebook Page ID đã nhập.');return {account_id:String(data.id),account_name:name(data.name)};
  }
  if(provider==='meta_whatsapp'){
   let after='';for(let page=0;page<10;page++){
    const url=new URL(`https://graph.facebook.com/${c.api_version}/${c.waba_id}/phone_numbers`);url.searchParams.set('limit','100');if(after)url.searchParams.set('after',after);
    const data=await request(url.href,{headers:{Authorization:'Bearer '+c.access_token}});
    if(!Array.isArray(data.data))throw new ChannelCheckError('API chưa trả danh sách số điện thoại hợp lệ.');
    const phone=data.data.find(p=>String(p.id)===c.phone_number_id);if(phone)return {account_id:String(phone.id),account_name:name(phone.verified_name),phone_number:name(phone.display_phone_number)};
    // Never follow a remote paging URL that could leak the bearer token.
    const next=data.paging?.cursors?.after;if(!data.paging?.next||typeof next!=='string'||next.length>2000||next===after)break;after=next;
   }throw new ChannelCheckError('Không tìm thấy Phone Number ID trong WABA này. Kiểm tra lại các mã và quyền truy cập.');
  }
  if(provider==='viber_bot'){
   const data=await request('https://chatapi.viber.com/pa/get_account_info',{method:'POST',headers:{'X-Viber-Auth-Token':c.auth_token,'Content-Type':'application/json'},body:'{}'});
   if(!data.id||data.status!==0)throw new ChannelCheckError('Không nhận được thông tin Viber Bot hợp lệ.');if(c.bot_id&&String(data.id)!==c.bot_id)throw new ChannelCheckError('Token thuộc Viber Bot khác với Bot ID đã nhập.');return {account_id:String(data.id).slice(0,150),account_name:name(data.name)};
  }
  if(provider==='twilio_voice'){
   const data=await request(`https://api.twilio.com/2010-04-01/Accounts/${c.account_sid}.json`,{headers:{Authorization:'Basic '+Buffer.from(c.account_sid+':'+c.auth_token).toString('base64')}});
   if(data.sid!==c.account_sid||data.status!=='active')throw new ChannelCheckError('Tài khoản Twilio không khớp hoặc chưa hoạt động.');return {account_id:data.sid,account_name:name(data.friendly_name)};
  }
  throw new ChannelCheckError('Kênh này mới hỗ trợ lưu cấu hình; cần bộ kết nối theo tài liệu nhà cung cấp.');
 }};
}
