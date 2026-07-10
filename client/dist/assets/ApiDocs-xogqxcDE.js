import{_ as P,u as D,j as x,c as l,f as g,a as t,h as s,t as a,k as _,y as f,F as j,l as T,d as p,i as K,r as b,p as C,q as h,o as n,n as w}from"./index-CqkTeY3W.js";import{N as U}from"./Navbar-BqvmLfp6.js";import"./image-DM1O7qIR.js";const S={class:"api-docs-page"},F={class:"container"},B={class:"docs-sections"},L={class:"section ghibli-card"},N={key:0,class:"api-key-box"},R={class:"api-key-value"},V={key:1,class:"api-key-box"},X={class:"section ghibli-card"},H={class:"endpoint"},$={class:"endpoint-url"},E={class:"code-block"},O={class:"tips-block"},z={class:"section ghibli-card"},G={class:"endpoint"},M={class:"endpoint-url"},J={class:"code-block"},Q={class:"section ghibli-card"},W={class:"tabs"},Y=["onClick"],Z={key:0,class:"code-block"},ee={key:1,class:"code-block"},te={key:2,class:"code-block"},ae={key:3,class:"code-block"},de={__name:"ApiDocs",setup(oe){const q=D(),r=b(""),v=b(!1),c=b("curl"),k=[{id:"curl",label:"cURL"},{id:"python",label:"Python"},{id:"javascript",label:"JavaScript"},{id:"nodejs",label:"Node.js"}],d=h(()=>window.location.origin),i=h(()=>r.value||"your-api-key");async function I(){try{const o=await K.get("/api/config/api-key",{headers:{Authorization:`Bearer ${q.token}`}});r.value=o.data.apiKey||""}catch(o){console.error("Failed to load API key:",o)}}function A(){const o=r.value;navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(o).then(()=>{alert("已复制到剪贴板")}).catch(()=>{m(o)}):m(o)}function m(o){const e=document.createElement("textarea");e.value=o,e.style.position="fixed",e.style.left="-999999px",e.style.top="-999999px",document.body.appendChild(e),e.focus(),e.select();try{document.execCommand("copy"),alert("已复制到剪贴板")}catch{alert("复制失败，请手动复制")}document.body.removeChild(e)}return x(()=>{I()}),(o,e)=>{const y=C("router-link");return n(),l("div",S,[g(U),t("div",F,[e[24]||(e[24]=t("h1",null,"API 使用文档",-1)),t("div",B,[t("div",L,[e[5]||(e[5]=t("h2",null,"概述",-1)),e[6]||(e[6]=t("p",{class:"intro-text"},[s(" ImgBed 提供了一套简单的 API 接口，允许你通过 HTTP 请求上传文件。 所有 API 请求需要提供 "),t("code",{class:"inline-code"},"X-API-Key"),s(" 请求头进行身份验证。 ")],-1)),r.value?(n(),l("div",N,[e[1]||(e[1]=t("span",{class:"label"},"当前 API Key：",-1)),t("code",R,a(v.value?r.value:"••••••••••••••••"),1),t("button",{onClick:e[0]||(e[0]=u=>v.value=!v.value),class:"ghibli-button ghibli-button-secondary small-button"},a(v.value?"隐藏":"显示"),1),t("button",{onClick:A,class:"ghibli-button ghibli-button-secondary small-button"},"复制")])):(n(),l("div",V,[e[3]||(e[3]=t("span",{class:"label"},"当前未设置 API Key，请前往",-1)),g(y,{to:"/settings",class:"settings-link"},{default:_(()=>[...e[2]||(e[2]=[s("设置页面",-1)])]),_:1}),e[4]||(e[4]=t("span",{class:"label"},"配置。",-1))]))]),t("div",X,[e[14]||(e[14]=t("h2",null,"上传文件",-1)),t("div",H,[e[7]||(e[7]=t("span",{class:"method method-post"},"POST",-1)),t("code",$,a(d.value)+"/api/files/api-upload",1)]),e[15]||(e[15]=t("h3",null,"请求头",-1)),t("div",E,[t("pre",null,"X-API-Key: "+a(i.value)+`
Content-Type: multipart/form-data`,1)]),e[16]||(e[16]=f(`<h3 data-v-e13ec068>请求参数</h3><table class="param-table" data-v-e13ec068><thead data-v-e13ec068><tr data-v-e13ec068><th data-v-e13ec068>参数名</th><th data-v-e13ec068>类型</th><th data-v-e13ec068>必填</th><th data-v-e13ec068>说明</th></tr></thead><tbody data-v-e13ec068><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>file</code></td><td data-v-e13ec068>binary</td><td data-v-e13ec068>是</td><td data-v-e13ec068>文件二进制数据，最大 100MB</td></tr><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>platform</code></td><td data-v-e13ec068>string</td><td data-v-e13ec068>是</td><td data-v-e13ec068>目标平台，可选值：<code data-v-e13ec068>discord</code>、<code data-v-e13ec068>huggingface</code>、<code data-v-e13ec068>telegram</code>、<code data-v-e13ec068>localdrive</code></td></tr><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>X-API-Key</code></td><td data-v-e13ec068>header</td><td data-v-e13ec068>是</td><td data-v-e13ec068>API 密钥（注意使用小写 <code data-v-e13ec068>x-api-key</code>）</td></tr></tbody></table><h3 data-v-e13ec068>成功响应 (200)</h3><div class="code-block" data-v-e13ec068><pre data-v-e13ec068>{
  &quot;success&quot;: true,
  &quot;fileId&quot;: &quot;1770138855551_test.jpg&quot;,
  &quot;platform&quot;: &quot;discord&quot;,
  &quot;fileName&quot;: &quot;test.jpg&quot;,
  &quot;fileSize&quot;: 12345,
  &quot;contentType&quot;: &quot;image/jpeg&quot;,
  &quot;accessUrl&quot;: &quot;/file/1770138855551_test.jpg&quot;
}</pre></div>`,4)),t("div",O,[e[13]||(e[13]=t("p",null,[t("strong",null,"注意：")],-1)),t("ul",null,[e[9]||(e[9]=t("li",null,[s("API 上传返回"),t("strong",null,"相对路径"),s("（不包含域名）")],-1)),e[10]||(e[10]=t("li",null,[t("code",null,"accessUrl"),s(" 格式："),t("code",null,"/file/{fileId}")],-1)),e[11]||(e[11]=t("li",null,"需要调用方根据部署域名拼接完整 URL",-1)),t("li",null,[e[8]||(e[8]=s("拼接示例：",-1)),t("code",null,a(d.value)+"/file/1770138855551_test.jpg",1)]),e[12]||(e[12]=t("li",null,[t("strong",null,[s("Local Drive 通道额外返回 "),t("code",null,"directDownloadUrl"),s(" 字段")]),s("，即拼接好的原通道直接下载地址，可直接使用")],-1))])]),e[17]||(e[17]=f('<h3 data-v-e13ec068>错误响应</h3><table class="param-table" data-v-e13ec068><thead data-v-e13ec068><tr data-v-e13ec068><th data-v-e13ec068>状态码</th><th data-v-e13ec068>说明</th><th data-v-e13ec068>响应示例</th></tr></thead><tbody data-v-e13ec068><tr data-v-e13ec068><td data-v-e13ec068>401</td><td data-v-e13ec068>未提供 API Key</td><td data-v-e13ec068><code data-v-e13ec068>{ &quot;error&quot;: &quot;API key required&quot; }</code></td></tr><tr data-v-e13ec068><td data-v-e13ec068>403</td><td data-v-e13ec068>API Key 无效</td><td data-v-e13ec068><code data-v-e13ec068>{ &quot;error&quot;: &quot;Invalid API key&quot; }</code></td></tr><tr data-v-e13ec068><td data-v-e13ec068>400</td><td data-v-e13ec068>参数错误</td><td data-v-e13ec068><code data-v-e13ec068>{ &quot;error&quot;: &quot;Platform is required&quot; }</code></td></tr><tr data-v-e13ec068><td data-v-e13ec068>500</td><td data-v-e13ec068>服务器错误</td><td data-v-e13ec068><code data-v-e13ec068>{ &quot;error&quot;: &quot;Upload failed&quot; }</code></td></tr></tbody></table>',2))]),t("div",z,[e[19]||(e[19]=t("h2",null,"访问文件",-1)),t("div",G,[e[18]||(e[18]=t("span",{class:"method method-get"},"GET",-1)),t("code",M,a(d.value)+"/file/{fileId}",1)]),e[20]||(e[20]=t("p",null,"上传成功后，拼接完整 URL 即可直接访问文件：",-1)),t("div",J,[t("pre",null,"GET "+a(d.value)+"/file/1770138855551_test.jpg",1)]),e[21]||(e[21]=t("div",{class:"tips-block"},[t("p",null,[t("strong",null,"注意：")]),t("ul",null,[t("li",null,"文件 ID 需要进行 URL 编码，特别是中文文件名"),t("li",null,"文件直接从第三方平台（Discord/HuggingFace/Telegram/Local Drive）获取"),t("li",null,"无需 API Key 即可访问文件")])],-1))]),t("div",Q,[e[22]||(e[22]=t("h2",null,"代码示例",-1)),t("div",W,[(n(),l(j,null,T(k,u=>t("button",{key:u.id,onClick:se=>c.value=u.id,class:w(["tab-button",{active:c.value===u.id}])},a(u.label),11,Y)),64))]),c.value==="curl"?(n(),l("div",Z,[t("pre",null,'curl -X POST "'+a(d.value)+`/api/files/api-upload" \\
  -H "x-api-key: `+a(i.value)+`" \\
  -F "file=@/path/to/image.jpg" \\
  -F "platform=discord"`,1)])):p("",!0),c.value==="python"?(n(),l("div",ee,[t("pre",null,`import requests

# 上传文件
with open('/path/to/image.jpg', 'rb') as f:
    response = requests.post(
        '`+a(d.value)+`/api/files/api-upload',
        headers={'X-API-Key': '`+a(i.value)+`'},
        files={'file': f},
        data={'platform': 'discord'}
    )

result = response.json()
if result.get('success'):
    access_url = '`+a(d.value)+`' + result['accessUrl']
    print(f'上传成功: {access_url}')
else:
    print(f'上传失败: {result.get("error")}')`,1)])):p("",!0),c.value==="javascript"?(n(),l("div",te,[t("pre",null,`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('platform', 'discord');

const response = await fetch('`+a(d.value)+`/api/files/api-upload', {
    method: 'POST',
    headers: {
        'X-API-Key': '`+a(i.value)+`'
    },
    body: formData
});

const result = await response.json();
if (result.success) {
    const accessUrl = '`+a(d.value)+`' + result.accessUrl;
    console.log('上传成功:', accessUrl);
} else {
    console.error('上传失败:', result.error);
}`,1)])):p("",!0),c.value==="nodejs"?(n(),l("div",ae,[t("pre",null,`const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/image.jpg'));
formData.append('platform', 'discord');

const response = await fetch('`+a(d.value)+`/api/files/api-upload', {
    method: 'POST',
    headers: {
        'x-api-key': '`+a(i.value)+`',
        ...formData.getHeaders()
    },
    body: formData
});

const result = await response.json();
console.log(result.success ? \`上传成功: `+a(d.value)+"${result.accessUrl}` : `失败: ${result.error}`);",1)])):p("",!0)]),e[23]||(e[23]=f('<div class="section ghibli-card" data-v-e13ec068><h2 data-v-e13ec068>平台说明</h2><table class="param-table" data-v-e13ec068><thead data-v-e13ec068><tr data-v-e13ec068><th data-v-e13ec068>平台</th><th data-v-e13ec068>配置要求</th><th data-v-e13ec068>说明</th></tr></thead><tbody data-v-e13ec068><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>discord</code></td><td data-v-e13ec068>Bot Token + Channel ID</td><td data-v-e13ec068>文件存储在 Discord 频道消息附件中</td></tr><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>huggingface</code></td><td data-v-e13ec068>Token + Repository</td><td data-v-e13ec068>文件通过 LFS 协议上传到 HuggingFace 数据集仓库</td></tr><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>telegram</code></td><td data-v-e13ec068>Bot Token + Chat ID</td><td data-v-e13ec068>文件通过 Bot 发送到指定聊天</td></tr><tr data-v-e13ec068><td data-v-e13ec068><code data-v-e13ec068>localdrive</code></td><td data-v-e13ec068>服务器地址 + 认证令牌</td><td data-v-e13ec068>文件上传到 Local Drive 服务器，额外返回直接下载地址</td></tr></tbody></table><div class="tips-block" data-v-e13ec068><p data-v-e13ec068>使用 API 上传前，请确保已在<a href="/settings" class="settings-link" data-v-e13ec068>设置页面</a>配置对应平台的参数。</p></div></div>',1))])])])}}},re=P(de,[["__scopeId","data-v-e13ec068"]]);export{re as default};
