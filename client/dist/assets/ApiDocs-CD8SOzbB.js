import{_ as P,u as D,m as x,c as l,f as g,a as d,p as s,t as a,g as _,z as b,F as j,l as T,d as f,k as K,r as p,s as C,j as h,o as n,n as w}from"./index-CJ9VHaVH.js";import{N as U}from"./Navbar-CmoUpEmb.js";import"./image-DM1O7qIR.js";const S={class:"api-docs-page"},F={class:"container"},B={class:"docs-sections"},L={class:"section ghibli-card"},N={key:0,class:"api-key-box"},R={class:"api-key-value"},V={key:1,class:"api-key-box"},X={class:"section ghibli-card"},H={class:"endpoint"},$={class:"endpoint-url"},z={class:"code-block"},E={class:"tips-block"},O={class:"section ghibli-card"},G={class:"endpoint"},M={class:"endpoint-url"},J={class:"code-block"},Q={class:"section ghibli-card"},W={class:"tabs"},Y=["onClick"],Z={key:0,class:"code-block"},tt={key:1,class:"code-block"},dt={key:2,class:"code-block"},at={key:3,class:"code-block"},et={__name:"ApiDocs",setup(ot){const q=D(),r=p(""),v=p(!1),c=p("curl"),k=[{id:"curl",label:"cURL"},{id:"python",label:"Python"},{id:"javascript",label:"JavaScript"},{id:"nodejs",label:"Node.js"}],e=h(()=>window.location.origin),i=h(()=>r.value||"your-api-key");async function I(){try{const o=await K.get("/api/config/api-key",{headers:{Authorization:`Bearer ${q.token}`}});r.value=o.data.apiKey||""}catch(o){console.error("Failed to load API key:",o)}}function A(){const o=r.value;navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(o).then(()=>{alert("已复制到剪贴板")}).catch(()=>{m(o)}):m(o)}function m(o){const t=document.createElement("textarea");t.value=o,t.style.position="fixed",t.style.left="-999999px",t.style.top="-999999px",document.body.appendChild(t),t.focus(),t.select();try{document.execCommand("copy"),alert("已复制到剪贴板")}catch{alert("复制失败，请手动复制")}document.body.removeChild(t)}return x(()=>{I()}),(o,t)=>{const y=C("router-link");return n(),l("div",S,[g(U),d("div",F,[t[24]||(t[24]=d("h1",null,"API 使用文档",-1)),d("div",B,[d("div",L,[t[5]||(t[5]=d("h2",null,"概述",-1)),t[6]||(t[6]=d("p",{class:"intro-text"},[s(" ImgBed 提供了一套简单的 API 接口，允许你通过 HTTP 请求上传文件。 所有 API 请求需要提供 "),d("code",{class:"inline-code"},"X-API-Key"),s(" 请求头进行身份验证。 ")],-1)),r.value?(n(),l("div",N,[t[1]||(t[1]=d("span",{class:"label"},"当前 API Key：",-1)),d("code",R,a(v.value?r.value:"••••••••••••••••"),1),d("button",{onClick:t[0]||(t[0]=u=>v.value=!v.value),class:"ghibli-button ghibli-button-secondary small-button"},a(v.value?"隐藏":"显示"),1),d("button",{onClick:A,class:"ghibli-button ghibli-button-secondary small-button"},"复制")])):(n(),l("div",V,[t[3]||(t[3]=d("span",{class:"label"},"当前未设置 API Key，请前往",-1)),g(y,{to:"/settings",class:"settings-link"},{default:_(()=>[...t[2]||(t[2]=[s("设置页面",-1)])]),_:1}),t[4]||(t[4]=d("span",{class:"label"},"配置。",-1))]))]),d("div",X,[t[14]||(t[14]=d("h2",null,"上传文件",-1)),d("div",H,[t[7]||(t[7]=d("span",{class:"method method-post"},"POST",-1)),d("code",$,a(e.value)+"/api/files/api-upload",1)]),t[15]||(t[15]=d("h3",null,"请求头",-1)),d("div",z,[d("pre",null,"X-API-Key: "+a(i.value)+`
Content-Type: multipart/form-data`,1)]),t[16]||(t[16]=b(`<h3 data-v-b7113fdc>请求参数</h3><table class="param-table" data-v-b7113fdc><thead data-v-b7113fdc><tr data-v-b7113fdc><th data-v-b7113fdc>参数名</th><th data-v-b7113fdc>类型</th><th data-v-b7113fdc>必填</th><th data-v-b7113fdc>说明</th></tr></thead><tbody data-v-b7113fdc><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>file</code></td><td data-v-b7113fdc>binary</td><td data-v-b7113fdc>是</td><td data-v-b7113fdc>文件二进制数据，最大 100MB</td></tr><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>platform</code></td><td data-v-b7113fdc>string</td><td data-v-b7113fdc>是</td><td data-v-b7113fdc>目标平台，可选值：<code data-v-b7113fdc>discord</code>、<code data-v-b7113fdc>huggingface</code>、<code data-v-b7113fdc>telegram</code>、<code data-v-b7113fdc>localdrive</code></td></tr><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>X-API-Key</code></td><td data-v-b7113fdc>header</td><td data-v-b7113fdc>是</td><td data-v-b7113fdc>API 密钥（注意使用小写 <code data-v-b7113fdc>x-api-key</code>）</td></tr></tbody></table><h3 data-v-b7113fdc>成功响应 (200)</h3><div class="code-block" data-v-b7113fdc><pre data-v-b7113fdc>{
  &quot;success&quot;: true,
  &quot;fileId&quot;: &quot;1700000000000_test.jpg&quot;,
  &quot;platform&quot;: &quot;discord&quot;,
  &quot;fileName&quot;: &quot;test.jpg&quot;,
  &quot;fileSize&quot;: 12345,
  &quot;contentType&quot;: &quot;image/jpeg&quot;,
  &quot;accessUrl&quot;: &quot;/file/1700000000000_test.jpg&quot;
}</pre></div>`,4)),d("div",E,[t[13]||(t[13]=d("p",null,[d("strong",null,"注意：")],-1)),d("ul",null,[t[9]||(t[9]=d("li",null,[s("API 上传返回"),d("strong",null,"相对路径"),s("（不包含域名）")],-1)),t[10]||(t[10]=d("li",null,[d("code",null,"accessUrl"),s(" 格式："),d("code",null,"/file/{fileId}")],-1)),t[11]||(t[11]=d("li",null,"需要调用方根据部署域名拼接完整 URL",-1)),d("li",null,[t[8]||(t[8]=s("拼接示例：",-1)),d("code",null,a(e.value)+"/file/1700000000000_test.jpg",1)]),t[12]||(t[12]=d("li",null,[d("strong",null,[s("Local Drive 通道额外返回 "),d("code",null,"directDownloadUrl"),s(" 字段")]),s("，即拼接好的原通道直接下载地址，可直接使用")],-1))])]),t[17]||(t[17]=b('<h3 data-v-b7113fdc>错误响应</h3><table class="param-table" data-v-b7113fdc><thead data-v-b7113fdc><tr data-v-b7113fdc><th data-v-b7113fdc>状态码</th><th data-v-b7113fdc>说明</th><th data-v-b7113fdc>响应示例</th></tr></thead><tbody data-v-b7113fdc><tr data-v-b7113fdc><td data-v-b7113fdc>401</td><td data-v-b7113fdc>未提供 API Key</td><td data-v-b7113fdc><code data-v-b7113fdc>{ &quot;error&quot;: &quot;API key required&quot; }</code></td></tr><tr data-v-b7113fdc><td data-v-b7113fdc>403</td><td data-v-b7113fdc>API Key 无效</td><td data-v-b7113fdc><code data-v-b7113fdc>{ &quot;error&quot;: &quot;Invalid API key&quot; }</code></td></tr><tr data-v-b7113fdc><td data-v-b7113fdc>400</td><td data-v-b7113fdc>参数错误</td><td data-v-b7113fdc><code data-v-b7113fdc>{ &quot;error&quot;: &quot;Platform is required&quot; }</code></td></tr><tr data-v-b7113fdc><td data-v-b7113fdc>500</td><td data-v-b7113fdc>服务器错误</td><td data-v-b7113fdc><code data-v-b7113fdc>{ &quot;error&quot;: &quot;Upload failed&quot; }</code></td></tr></tbody></table>',2))]),d("div",O,[t[19]||(t[19]=d("h2",null,"访问文件",-1)),d("div",G,[t[18]||(t[18]=d("span",{class:"method method-get"},"GET",-1)),d("code",M,a(e.value)+"/file/{fileId}",1)]),t[20]||(t[20]=d("p",null,"上传成功后，拼接完整 URL 即可直接访问文件：",-1)),d("div",J,[d("pre",null,"GET "+a(e.value)+"/file/1700000000000_test.jpg",1)]),t[21]||(t[21]=d("div",{class:"tips-block"},[d("p",null,[d("strong",null,"注意：")]),d("ul",null,[d("li",null,"文件 ID 需要进行 URL 编码，特别是中文文件名"),d("li",null,"文件直接从第三方平台（Discord/HuggingFace/Telegram/Local Drive）获取"),d("li",null,"无需 API Key 即可访问文件")])],-1))]),d("div",Q,[t[22]||(t[22]=d("h2",null,"代码示例",-1)),d("div",W,[(n(),l(j,null,T(k,u=>d("button",{key:u.id,onClick:st=>c.value=u.id,class:w(["tab-button",{active:c.value===u.id}])},a(u.label),11,Y)),64))]),c.value==="curl"?(n(),l("div",Z,[d("pre",null,'curl -X POST "'+a(e.value)+`/api/files/api-upload" \\
  -H "x-api-key: `+a(i.value)+`" \\
  -F "file=@/path/to/image.jpg" \\
  -F "platform=discord"`,1)])):f("",!0),c.value==="python"?(n(),l("div",tt,[d("pre",null,`import requests

# 上传文件
with open('/path/to/image.jpg', 'rb') as f:
    response = requests.post(
        '`+a(e.value)+`/api/files/api-upload',
        headers={'X-API-Key': '`+a(i.value)+`'},
        files={'file': f},
        data={'platform': 'discord'}
    )

result = response.json()
if result.get('success'):
    access_url = '`+a(e.value)+`' + result['accessUrl']
    print(f'上传成功: {access_url}')
else:
    print(f'上传失败: {result.get("error")}')`,1)])):f("",!0),c.value==="javascript"?(n(),l("div",dt,[d("pre",null,`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('platform', 'discord');

const response = await fetch('`+a(e.value)+`/api/files/api-upload', {
    method: 'POST',
    headers: {
        'X-API-Key': '`+a(i.value)+`'
    },
    body: formData
});

const result = await response.json();
if (result.success) {
    const accessUrl = '`+a(e.value)+`' + result.accessUrl;
    console.log('上传成功:', accessUrl);
} else {
    console.error('上传失败:', result.error);
}`,1)])):f("",!0),c.value==="nodejs"?(n(),l("div",at,[d("pre",null,`const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/image.jpg'));
formData.append('platform', 'discord');

const response = await fetch('`+a(e.value)+`/api/files/api-upload', {
    method: 'POST',
    headers: {
        'x-api-key': '`+a(i.value)+`',
        ...formData.getHeaders()
    },
    body: formData
});

const result = await response.json();
console.log(result.success ? \`上传成功: `+a(e.value)+"${result.accessUrl}` : `失败: ${result.error}`);",1)])):f("",!0)]),t[23]||(t[23]=b('<div class="section ghibli-card" data-v-b7113fdc><h2 data-v-b7113fdc>平台说明</h2><table class="param-table" data-v-b7113fdc><thead data-v-b7113fdc><tr data-v-b7113fdc><th data-v-b7113fdc>平台</th><th data-v-b7113fdc>配置要求</th><th data-v-b7113fdc>说明</th></tr></thead><tbody data-v-b7113fdc><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>discord</code></td><td data-v-b7113fdc>Bot Token + Channel ID</td><td data-v-b7113fdc>文件存储在 Discord 频道消息附件中</td></tr><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>huggingface</code></td><td data-v-b7113fdc>Token + Repository</td><td data-v-b7113fdc>文件通过 LFS 协议上传到 HuggingFace 数据集仓库</td></tr><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>telegram</code></td><td data-v-b7113fdc>Bot Token + Chat ID</td><td data-v-b7113fdc>文件通过 Bot 发送到指定聊天</td></tr><tr data-v-b7113fdc><td data-v-b7113fdc><code data-v-b7113fdc>localdrive</code></td><td data-v-b7113fdc>服务器地址 + 认证令牌</td><td data-v-b7113fdc>文件上传到 Local Drive 服务器，额外返回直接下载地址</td></tr></tbody></table><div class="tips-block" data-v-b7113fdc><p data-v-b7113fdc>使用 API 上传前，请确保已在<a href="/settings" class="settings-link" data-v-b7113fdc>设置页面</a>配置对应平台的参数。</p></div></div>',1))])])])}}},rt=P(et,[["__scopeId","data-v-b7113fdc"]]);export{rt as default};
