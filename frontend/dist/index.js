var Re=function(e){let t=[],n=0;for(let r=0;r<e.length;r++){let i=e.charCodeAt(r);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===55296&&r+1<e.length&&(e.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++r)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t},Pt=function(e){let t=[],n=0,r=0;for(;n<e.length;){let i=e[n++];if(i<128)t[r++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[r++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],s=e[n++],a=e[n++],c=((i&7)<<18|(o&63)<<12|(s&63)<<6|a&63)-65536;t[r++]=String.fromCharCode(55296+(c>>10)),t[r++]=String.fromCharCode(56320+(c&1023))}else{let o=e[n++],s=e[n++];t[r++]=String.fromCharCode((i&15)<<12|(o&63)<<6|s&63)}}return t.join("")},Me={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<e.length;i+=3){let o=e[i],s=i+1<e.length,a=s?e[i+1]:0,c=i+2<e.length,u=c?e[i+2]:0,f=o>>2,k=(o&3)<<4|a>>4,L=(a&15)<<2|u>>6,F=u&63;c||(F=64,s||(L=64)),r.push(n[f],n[k],n[L],n[F])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Re(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):Pt(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let n=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<e.length;){let o=n[e.charAt(i++)],a=i<e.length?n[e.charAt(i)]:0;++i;let u=i<e.length?n[e.charAt(i)]:64;++i;let k=i<e.length?n[e.charAt(i)]:64;if(++i,o==null||a==null||u==null||k==null)throw new X;let L=o<<2|a>>4;if(r.push(L),u!==64){let F=a<<4&240|u>>2;if(r.push(F),k!==64){let Bt=u<<6&192|k;r.push(Bt)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}},X=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Lt=function(e){let t=Re(e);return Me.encodeByteArray(t,!0)},Q=function(e){return Lt(e).replace(/\./g,"")},Ft=function(e){try{return Me.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};function jt(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var $t=()=>jt().__FIREBASE_DEFAULTS__,Ht=()=>{if(typeof process>"u"||typeof process.env>"u")return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},Vt=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let t=e&&Ft(e[1]);return t&&JSON.parse(t)},Ut=()=>{try{return $t()||Ht()||Vt()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}};var Z=()=>{var e;return(e=Ut())===null||e===void 0?void 0:e.config};var j=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,r))}}};function $(){try{return typeof indexedDB=="object"}catch{return!1}}function H(){return new Promise((e,t)=>{try{let n=!0,r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var o;t(((o=i.error)===null||o===void 0?void 0:o.message)||"")}}catch(n){t(n)}})}function Be(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}var Wt="FirebaseError",m=class e extends Error{constructor(t,n,r){super(n),this.code=t,this.customData=r,this.name=Wt,Object.setPrototypeOf(this,e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,b.prototype.create)}},b=class{constructor(t,n,r){this.service=t,this.serviceName=n,this.errors=r}create(t,...n){let r=n[0]||{},i=`${this.service}/${t}`,o=this.errors[t],s=o?zt(o,r):"Error",a=`${this.serviceName}: ${s} (${i}).`;return new m(i,a,r)}};function zt(e,t){return e.replace(Kt,(n,r)=>{let i=t[r];return i!=null?String(i):`<${r}?>`})}var Kt=/\{\$([^}]+)}/g;function V(e,t){if(e===t)return!0;let n=Object.keys(e),r=Object.keys(t);for(let i of n){if(!r.includes(i))return!1;let o=e[i],s=t[i];if(xe(o)&&xe(s)){if(!V(o,s))return!1}else if(o!==s)return!1}for(let i of r)if(!n.includes(i))return!1;return!0}function xe(e){return e!==null&&typeof e=="object"}var yi=14400*1e3;function O(e){return e&&e._delegate?e._delegate:e}var h=class{constructor(t,n,r){this.name=t,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}};var E="[DEFAULT]";var ee=class{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){let n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){let r=new j;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){var n;let r=this.normalizeInstanceIdentifier(t?.identifier),i=(n=t?.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(i)return null;throw o}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(Gt(t))try{this.getOrInitializeService({instanceIdentifier:E})}catch{}for(let[n,r]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(n);try{let o=this.getOrInitializeService({instanceIdentifier:i});r.resolve(o)}catch{}}}}clearInstance(t=E){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){let t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=E){return this.instances.has(t)}getOptions(t=E){return this.instancesOptions.get(t)||{}}initialize(t={}){let{options:n={}}=t,r=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(let[o,s]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(o);r===a&&s.resolve(i)}return i}onInit(t,n){var r;let i=this.normalizeInstanceIdentifier(n),o=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;o.add(t),this.onInitCallbacks.set(i,o);let s=this.instances.get(i);return s&&t(s,i),()=>{o.delete(t)}}invokeOnInitCallbacks(t,n){let r=this.onInitCallbacks.get(n);if(r)for(let i of r)try{i(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let r=this.instances.get(t);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:qt(t),options:n}),this.instances.set(t,r),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(r,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,r)}catch{}return r||null}normalizeInstanceIdentifier(t=E){return this.component?this.component.multipleInstances?t:E:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function qt(e){return e===E?void 0:e}function Gt(e){return e.instantiationMode==="EAGER"}var U=class{constructor(t){this.name=t,this.providers=new Map}addComponent(t){let n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);let n=new ee(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}};var Jt=[],d;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(d||(d={}));var Yt={debug:d.DEBUG,verbose:d.VERBOSE,info:d.INFO,warn:d.WARN,error:d.ERROR,silent:d.SILENT},Xt=d.INFO,Qt={[d.DEBUG]:"log",[d.VERBOSE]:"log",[d.INFO]:"info",[d.WARN]:"warn",[d.ERROR]:"error"},Zt=(e,t,...n)=>{if(t<e.logLevel)return;let r=new Date().toISOString(),i=Qt[t];if(i)console[i](`[${r}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)},W=class{constructor(t){this.name=t,this._logLevel=Xt,this._logHandler=Zt,this._userLogHandler=null,Jt.push(this)}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in d))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Yt[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,d.DEBUG,...t),this._logHandler(this,d.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,d.VERBOSE,...t),this._logHandler(this,d.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,d.INFO,...t),this._logHandler(this,d.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,d.WARN,...t),this._logHandler(this,d.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,d.ERROR,...t),this._logHandler(this,d.ERROR,...t)}};var en=(e,t)=>t.some(n=>e instanceof n),Pe,Le;function tn(){return Pe||(Pe=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function nn(){return Le||(Le=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Fe=new WeakMap,ne=new WeakMap,je=new WeakMap,te=new WeakMap,ie=new WeakMap;function rn(e){let t=new Promise((n,r)=>{let i=()=>{e.removeEventListener("success",o),e.removeEventListener("error",s)},o=()=>{n(p(e.result)),i()},s=()=>{r(e.error),i()};e.addEventListener("success",o),e.addEventListener("error",s)});return t.then(n=>{n instanceof IDBCursor&&Fe.set(n,e)}).catch(()=>{}),ie.set(t,e),t}function on(e){if(ne.has(e))return;let t=new Promise((n,r)=>{let i=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",s),e.removeEventListener("abort",s)},o=()=>{n(),i()},s=()=>{r(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",o),e.addEventListener("error",s),e.addEventListener("abort",s)});ne.set(e,t)}var re={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return ne.get(e);if(t==="objectStoreNames")return e.objectStoreNames||je.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return p(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function $e(e){re=e(re)}function sn(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){let r=e.call(z(this),t,...n);return je.set(r,t.sort?t.sort():[t]),p(r)}:nn().includes(e)?function(...t){return e.apply(z(this),t),p(Fe.get(this))}:function(...t){return p(e.apply(z(this),t))}}function an(e){return typeof e=="function"?sn(e):(e instanceof IDBTransaction&&on(e),en(e,tn())?new Proxy(e,re):e)}function p(e){if(e instanceof IDBRequest)return rn(e);if(te.has(e))return te.get(e);let t=an(e);return t!==e&&(te.set(e,t),ie.set(t,e)),t}var z=e=>ie.get(e);function I(e,t,{blocked:n,upgrade:r,blocking:i,terminated:o}={}){let s=indexedDB.open(e,t),a=p(s);return r&&s.addEventListener("upgradeneeded",c=>{r(p(s.result),c.oldVersion,c.newVersion,p(s.transaction),c)}),n&&s.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),i&&c.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}function K(e,{blocked:t}={}){let n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",r=>t(r.oldVersion,r)),p(n).then(()=>{})}var cn=["get","getKey","getAll","getAllKeys","count"],un=["put","add","delete","clear"],oe=new Map;function He(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(oe.get(t))return oe.get(t);let n=t.replace(/FromIndex$/,""),r=t!==n,i=un.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||cn.includes(n)))return;let o=async function(s,...a){let c=this.transaction(s,i?"readwrite":"readonly"),u=c.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[n](...a),i&&c.done]))[0]};return oe.set(t,o),o}$e(e=>({...e,get:(t,n,r)=>He(t,n)||e.get(t,n,r),has:(t,n)=>!!He(t,n)||e.has(t,n)}));var ae=class{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(fn(n)){let r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}};function fn(e){let t=e.getComponent();return t?.type==="VERSION"}var ce="@firebase/app",Ve="0.10.13";var w=new W("@firebase/app"),dn="@firebase/app-compat",ln="@firebase/analytics-compat",hn="@firebase/analytics",pn="@firebase/app-check-compat",gn="@firebase/app-check",mn="@firebase/auth",bn="@firebase/auth-compat",wn="@firebase/database",yn="@firebase/data-connect",vn="@firebase/database-compat",_n="@firebase/functions",En="@firebase/functions-compat",In="@firebase/installations",Sn="@firebase/installations-compat",An="@firebase/messaging",Dn="@firebase/messaging-compat",Tn="@firebase/performance",Cn="@firebase/performance-compat",kn="@firebase/remote-config",On="@firebase/remote-config-compat",Nn="@firebase/storage",xn="@firebase/storage-compat",Rn="@firebase/firestore",Mn="@firebase/vertexai-preview",Bn="@firebase/firestore-compat",Pn="firebase";var ue="[DEFAULT]",Ln={[ce]:"fire-core",[dn]:"fire-core-compat",[hn]:"fire-analytics",[ln]:"fire-analytics-compat",[gn]:"fire-app-check",[pn]:"fire-app-check-compat",[mn]:"fire-auth",[bn]:"fire-auth-compat",[wn]:"fire-rtdb",[yn]:"fire-data-connect",[vn]:"fire-rtdb-compat",[_n]:"fire-fn",[En]:"fire-fn-compat",[In]:"fire-iid",[Sn]:"fire-iid-compat",[An]:"fire-fcm",[Dn]:"fire-fcm-compat",[Tn]:"fire-perf",[Cn]:"fire-perf-compat",[kn]:"fire-rc",[On]:"fire-rc-compat",[Nn]:"fire-gcs",[xn]:"fire-gcs-compat",[Rn]:"fire-fst",[Bn]:"fire-fst-compat",[Mn]:"fire-vertex","fire-js":"fire-js",[Pn]:"fire-js-all"};var N=new Map,Fn=new Map,fe=new Map;function Ue(e,t){try{e.container.addComponent(t)}catch(n){w.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function y(e){let t=e.name;if(fe.has(t))return w.debug(`There were multiple attempts to register component ${t}.`),!1;fe.set(t,e);for(let n of N.values())Ue(n,e);for(let n of Fn.values())Ue(n,e);return!0}function R(e,t){let n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}var jn={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},_=new b("app","Firebase",jn);var de=class{constructor(t,n,r){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new h("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw _.create("app-deleted",{appName:this._name})}};function pe(e,t={}){let n=e;typeof t!="object"&&(t={name:t});let r=Object.assign({name:ue,automaticDataCollectionEnabled:!1},t),i=r.name;if(typeof i!="string"||!i)throw _.create("bad-app-name",{appName:String(i)});if(n||(n=Z()),!n)throw _.create("no-options");let o=N.get(i);if(o){if(V(n,o.options)&&V(r,o.config))return o;throw _.create("duplicate-app",{appName:i})}let s=new U(i);for(let c of fe.values())s.addComponent(c);let a=new de(n,r,s);return N.set(i,a),a}function M(e=ue){let t=N.get(e);if(!t&&e===ue&&Z())return pe();if(!t)throw _.create("no-app",{appName:e});return t}function qe(){return Array.from(N.values())}function g(e,t,n){var r;let i=(r=Ln[e])!==null&&r!==void 0?r:e;n&&(i+=`-${n}`);let o=i.match(/\s|\//),s=t.match(/\s|\//);if(o||s){let a=[`Unable to register library "${i}" with version "${t}":`];o&&a.push(`library name "${i}" contains illegal characters (whitespace or "/")`),o&&s&&a.push("and"),s&&a.push(`version name "${t}" contains illegal characters (whitespace or "/")`),w.warn(a.join(" "));return}y(new h(`${i}-version`,()=>({library:i,version:t}),"VERSION"))}var $n="firebase-heartbeat-database",Hn=1,x="firebase-heartbeat-store",se=null;function Ge(){return se||(se=I($n,Hn,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(x)}catch(n){console.warn(n)}}}}).catch(e=>{throw _.create("idb-open",{originalErrorMessage:e.message})})),se}async function Vn(e){try{let n=(await Ge()).transaction(x),r=await n.objectStore(x).get(Je(e));return await n.done,r}catch(t){if(t instanceof m)w.warn(t.message);else{let n=_.create("idb-get",{originalErrorMessage:t?.message});w.warn(n.message)}}}async function We(e,t){try{let r=(await Ge()).transaction(x,"readwrite");await r.objectStore(x).put(t,Je(e)),await r.done}catch(n){if(n instanceof m)w.warn(n.message);else{let r=_.create("idb-set",{originalErrorMessage:n?.message});w.warn(r.message)}}}function Je(e){return`${e.name}!${e.options.appId}`}var Un=1024,Wn=720*60*60*1e3,le=class{constructor(t){this.container=t,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new he(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var t,n;try{let i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=ze();return((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(s=>s.date===o)?void 0:(this._heartbeatsCache.heartbeats.push({date:o,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(s=>{let a=new Date(s.date).valueOf();return Date.now()-a<=Wn}),this._storage.overwrite(this._heartbeatsCache))}catch(r){w.warn(r)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";let n=ze(),{heartbeatsToSend:r,unsentEntries:i}=zn(this._heartbeatsCache.heartbeats),o=Q(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(n){return w.warn(n),""}}};function ze(){return new Date().toISOString().substring(0,10)}function zn(e,t=Un){let n=[],r=e.slice();for(let i of e){let o=n.find(s=>s.agent===i.agent);if(o){if(o.dates.push(i.date),Ke(n)>t){o.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Ke(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}var he=class{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return $()?H().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await Vn(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var n;if(await this._canUseIndexedDBPromise){let i=await this.read();return We(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var n;if(await this._canUseIndexedDBPromise){let i=await this.read();return We(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...t.heartbeats]})}else return}};function Ke(e){return Q(JSON.stringify({version:2,heartbeats:e})).length}function Kn(e){y(new h("platform-logger",t=>new ae(t),"PRIVATE")),y(new h("heartbeat",t=>new le(t),"PRIVATE")),g(ce,Ve,e),g(ce,Ve,"esm2017"),g("fire-js","")}Kn("");var qn="firebase",Gn="10.14.1";g(qn,Gn,"app");var Qe="@firebase/installations",we="0.6.9";var Ze=1e4,et=`w:${we}`,tt="FIS_v2",Jn="https://firebaseinstallations.googleapis.com/v1",Yn=3600*1e3,Xn="installations",Qn="Installations";var Zn={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},A=new b(Xn,Qn,Zn);function nt(e){return e instanceof m&&e.code.includes("request-failed")}function rt({projectId:e}){return`${Jn}/projects/${e}/installations`}function it(e){return{token:e.token,requestStatus:2,expiresIn:tr(e.expiresIn),creationTime:Date.now()}}async function ot(e,t){let r=(await t.json()).error;return A.create("request-failed",{requestName:e,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function st({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function er(e,{refreshToken:t}){let n=st(e);return n.append("Authorization",nr(t)),n}async function at(e){let t=await e();return t.status>=500&&t.status<600?e():t}function tr(e){return Number(e.replace("s","000"))}function nr(e){return`${tt} ${e}`}async function rr({appConfig:e,heartbeatServiceProvider:t},{fid:n}){let r=rt(e),i=st(e),o=t.getImmediate({optional:!0});if(o){let u=await o.getHeartbeatsHeader();u&&i.append("x-firebase-client",u)}let s={fid:n,authVersion:tt,appId:e.appId,sdkVersion:et},a={method:"POST",headers:i,body:JSON.stringify(s)},c=await at(()=>fetch(r,a));if(c.ok){let u=await c.json();return{fid:u.fid||n,registrationStatus:2,refreshToken:u.refreshToken,authToken:it(u.authToken)}}else throw await ot("Create Installation",c)}function ct(e){return new Promise(t=>{setTimeout(t,e)})}function ir(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}var or=/^[cdef][\w-]{21}$/,be="";function sr(){try{let e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;let n=ar(e);return or.test(n)?n:be}catch{return be}}function ar(e){return ir(e).substr(0,22)}function G(e){return`${e.appName}!${e.appId}`}var ut=new Map;function ft(e,t){let n=G(e);dt(n,t),cr(n,t)}function dt(e,t){let n=ut.get(e);if(n)for(let r of n)r(t)}function cr(e,t){let n=ur();n&&n.postMessage({key:e,fid:t}),fr()}var S=null;function ur(){return!S&&"BroadcastChannel"in self&&(S=new BroadcastChannel("[Firebase] FID Change"),S.onmessage=e=>{dt(e.data.key,e.data.fid)}),S}function fr(){ut.size===0&&S&&(S.close(),S=null)}var dr="firebase-installations-database",lr=1,D="firebase-installations-store",ge=null;function ye(){return ge||(ge=I(dr,lr,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(D)}}})),ge}async function q(e,t){let n=G(e),i=(await ye()).transaction(D,"readwrite"),o=i.objectStore(D),s=await o.get(n);return await o.put(t,n),await i.done,(!s||s.fid!==t.fid)&&ft(e,t.fid),t}async function lt(e){let t=G(e),r=(await ye()).transaction(D,"readwrite");await r.objectStore(D).delete(t),await r.done}async function J(e,t){let n=G(e),i=(await ye()).transaction(D,"readwrite"),o=i.objectStore(D),s=await o.get(n),a=t(s);return a===void 0?await o.delete(n):await o.put(a,n),await i.done,a&&(!s||s.fid!==a.fid)&&ft(e,a.fid),a}async function ve(e){let t,n=await J(e.appConfig,r=>{let i=hr(r),o=pr(e,i);return t=o.registrationPromise,o.installationEntry});return n.fid===be?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function hr(e){let t=e||{fid:sr(),registrationStatus:0};return ht(t)}function pr(e,t){if(t.registrationStatus===0){if(!navigator.onLine){let i=Promise.reject(A.create("app-offline"));return{installationEntry:t,registrationPromise:i}}let n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},r=gr(e,n);return{installationEntry:n,registrationPromise:r}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:mr(e)}:{installationEntry:t}}async function gr(e,t){try{let n=await rr(e,t);return q(e.appConfig,n)}catch(n){throw nt(n)&&n.customData.serverCode===409?await lt(e.appConfig):await q(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function mr(e){let t=await Ye(e.appConfig);for(;t.registrationStatus===1;)await ct(100),t=await Ye(e.appConfig);if(t.registrationStatus===0){let{installationEntry:n,registrationPromise:r}=await ve(e);return r||n}return t}function Ye(e){return J(e,t=>{if(!t)throw A.create("installation-not-found");return ht(t)})}function ht(e){return br(e)?{fid:e.fid,registrationStatus:0}:e}function br(e){return e.registrationStatus===1&&e.registrationTime+Ze<Date.now()}async function wr({appConfig:e,heartbeatServiceProvider:t},n){let r=yr(e,n),i=er(e,n),o=t.getImmediate({optional:!0});if(o){let u=await o.getHeartbeatsHeader();u&&i.append("x-firebase-client",u)}let s={installation:{sdkVersion:et,appId:e.appId}},a={method:"POST",headers:i,body:JSON.stringify(s)},c=await at(()=>fetch(r,a));if(c.ok){let u=await c.json();return it(u)}else throw await ot("Generate Auth Token",c)}function yr(e,{fid:t}){return`${rt(e)}/${t}/authTokens:generate`}async function _e(e,t=!1){let n,r=await J(e.appConfig,o=>{if(!pt(o))throw A.create("not-registered");let s=o.authToken;if(!t&&Er(s))return o;if(s.requestStatus===1)return n=vr(e,t),o;{if(!navigator.onLine)throw A.create("app-offline");let a=Sr(o);return n=_r(e,a),a}});return n?await n:r.authToken}async function vr(e,t){let n=await Xe(e.appConfig);for(;n.authToken.requestStatus===1;)await ct(100),n=await Xe(e.appConfig);let r=n.authToken;return r.requestStatus===0?_e(e,t):r}function Xe(e){return J(e,t=>{if(!pt(t))throw A.create("not-registered");let n=t.authToken;return Ar(n)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function _r(e,t){try{let n=await wr(e,t),r=Object.assign(Object.assign({},t),{authToken:n});return await q(e.appConfig,r),n}catch(n){if(nt(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await lt(e.appConfig);else{let r=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await q(e.appConfig,r)}throw n}}function pt(e){return e!==void 0&&e.registrationStatus===2}function Er(e){return e.requestStatus===2&&!Ir(e)}function Ir(e){let t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+Yn}function Sr(e){let t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}function Ar(e){return e.requestStatus===1&&e.requestTime+Ze<Date.now()}async function Dr(e){let t=e,{installationEntry:n,registrationPromise:r}=await ve(t);return r?r.catch(console.error):_e(t).catch(console.error),n.fid}async function Tr(e,t=!1){let n=e;return await Cr(n),(await _e(n,t)).token}async function Cr(e){let{registrationPromise:t}=await ve(e);t&&await t}function kr(e){if(!e||!e.options)throw me("App Configuration");if(!e.name)throw me("App Name");let t=["projectId","apiKey","appId"];for(let n of t)if(!e.options[n])throw me(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function me(e){return A.create("missing-app-config-values",{valueName:e})}var gt="installations",Or="installations-internal",Nr=e=>{let t=e.getProvider("app").getImmediate(),n=kr(t),r=R(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},xr=e=>{let t=e.getProvider("app").getImmediate(),n=R(t,gt).getImmediate();return{getId:()=>Dr(n),getToken:i=>Tr(n,i)}};function Rr(){y(new h(gt,Nr,"PUBLIC")),y(new h(Or,xr,"PRIVATE"))}Rr();g(Qe,we);g(Qe,we,"esm2017");var Mr="/firebase-messaging-sw.js",Br="/firebase-cloud-messaging-push-scope",Et="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Pr="https://fcmregistrations.googleapis.com/v1",It="google.c.a.c_id",Lr="google.c.a.c_l",Fr="google.c.a.ts",jr="google.c.a.e",mt;(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(mt||(mt={}));var B;(function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked"})(B||(B={}));function v(e){let t=new Uint8Array(e);return btoa(String.fromCharCode(...t)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function $r(e){let t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),i=new Uint8Array(r.length);for(let o=0;o<r.length;++o)i[o]=r.charCodeAt(o);return i}var Ee="fcm_token_details_db",Hr=5,bt="fcm_token_object_Store";async function Vr(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(o=>o.name).includes(Ee))return null;let t=null;return(await I(Ee,Hr,{upgrade:async(r,i,o,s)=>{var a;if(i<2||!r.objectStoreNames.contains(bt))return;let c=s.objectStore(bt),u=await c.index("fcmSenderId").get(e);if(await c.clear(),!!u){if(i===2){let f=u;if(!f.auth||!f.p256dh||!f.endpoint)return;t={token:f.fcmToken,createTime:(a=f.createTime)!==null&&a!==void 0?a:Date.now(),subscriptionOptions:{auth:f.auth,p256dh:f.p256dh,endpoint:f.endpoint,swScope:f.swScope,vapidKey:typeof f.vapidKey=="string"?f.vapidKey:v(f.vapidKey)}}}else if(i===3){let f=u;t={token:f.fcmToken,createTime:f.createTime,subscriptionOptions:{auth:v(f.auth),p256dh:v(f.p256dh),endpoint:f.endpoint,swScope:f.swScope,vapidKey:v(f.vapidKey)}}}else if(i===4){let f=u;t={token:f.fcmToken,createTime:f.createTime,subscriptionOptions:{auth:v(f.auth),p256dh:v(f.p256dh),endpoint:f.endpoint,swScope:f.swScope,vapidKey:v(f.vapidKey)}}}}}})).close(),await K(Ee),await K("fcm_vapid_details_db"),await K("undefined"),Ur(t)?t:null}function Ur(e){if(!e||!e.subscriptionOptions)return!1;let{subscriptionOptions:t}=e;return typeof e.createTime=="number"&&e.createTime>0&&typeof e.token=="string"&&e.token.length>0&&typeof t.auth=="string"&&t.auth.length>0&&typeof t.p256dh=="string"&&t.p256dh.length>0&&typeof t.endpoint=="string"&&t.endpoint.length>0&&typeof t.swScope=="string"&&t.swScope.length>0&&typeof t.vapidKey=="string"&&t.vapidKey.length>0}var Wr="firebase-messaging-database",zr=1,T="firebase-messaging-store",Ie=null;function De(){return Ie||(Ie=I(Wr,zr,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(T)}}})),Ie}async function St(e){let t=Ce(e),r=await(await De()).transaction(T).objectStore(T).get(t);if(r)return r;{let i=await Vr(e.appConfig.senderId);if(i)return await Te(e,i),i}}async function Te(e,t){let n=Ce(e),i=(await De()).transaction(T,"readwrite");return await i.objectStore(T).put(t,n),await i.done,t}async function Kr(e){let t=Ce(e),r=(await De()).transaction(T,"readwrite");await r.objectStore(T).delete(t),await r.done}function Ce({appConfig:e}){return e.appId}var qr={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},l=new b("messaging","Messaging",qr);async function Gr(e,t){let n=await Oe(e),r=Dt(t),i={method:"POST",headers:n,body:JSON.stringify(r)},o;try{o=await(await fetch(ke(e.appConfig),i)).json()}catch(s){throw l.create("token-subscribe-failed",{errorInfo:s?.toString()})}if(o.error){let s=o.error.message;throw l.create("token-subscribe-failed",{errorInfo:s})}if(!o.token)throw l.create("token-subscribe-no-token");return o.token}async function Jr(e,t){let n=await Oe(e),r=Dt(t.subscriptionOptions),i={method:"PATCH",headers:n,body:JSON.stringify(r)},o;try{o=await(await fetch(`${ke(e.appConfig)}/${t.token}`,i)).json()}catch(s){throw l.create("token-update-failed",{errorInfo:s?.toString()})}if(o.error){let s=o.error.message;throw l.create("token-update-failed",{errorInfo:s})}if(!o.token)throw l.create("token-update-no-token");return o.token}async function At(e,t){let r={method:"DELETE",headers:await Oe(e)};try{let o=await(await fetch(`${ke(e.appConfig)}/${t}`,r)).json();if(o.error){let s=o.error.message;throw l.create("token-unsubscribe-failed",{errorInfo:s})}}catch(i){throw l.create("token-unsubscribe-failed",{errorInfo:i?.toString()})}}function ke({projectId:e}){return`${Pr}/projects/${e}/registrations`}async function Oe({appConfig:e,installations:t}){let n=await t.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function Dt({p256dh:e,auth:t,endpoint:n,vapidKey:r}){let i={web:{endpoint:n,auth:t,p256dh:e}};return r!==Et&&(i.web.applicationPubKey=r),i}var Yr=10080*60*1e3;async function Xr(e){let t=await ei(e.swRegistration,e.vapidKey),n={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:t.endpoint,auth:v(t.getKey("auth")),p256dh:v(t.getKey("p256dh"))},r=await St(e.firebaseDependencies);if(r){if(ti(r.subscriptionOptions,n))return Date.now()>=r.createTime+Yr?Zr(e,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await At(e.firebaseDependencies,r.token)}catch(i){console.warn(i)}return wt(e.firebaseDependencies,n)}else return wt(e.firebaseDependencies,n)}async function Qr(e){let t=await St(e.firebaseDependencies);t&&(await At(e.firebaseDependencies,t.token),await Kr(e.firebaseDependencies));let n=await e.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function Zr(e,t){try{let n=await Jr(e.firebaseDependencies,t),r=Object.assign(Object.assign({},t),{token:n,createTime:Date.now()});return await Te(e.firebaseDependencies,r),n}catch(n){throw n}}async function wt(e,t){let r={token:await Gr(e,t),createTime:Date.now(),subscriptionOptions:t};return await Te(e,r),r.token}async function ei(e,t){let n=await e.pushManager.getSubscription();return n||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:$r(t)})}function ti(e,t){let n=t.vapidKey===e.vapidKey,r=t.endpoint===e.endpoint,i=t.auth===e.auth,o=t.p256dh===e.p256dh;return n&&r&&i&&o}function yt(e){let t={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return ni(t,e),ri(t,e),ii(t,e),t}function ni(e,t){if(!t.notification)return;e.notification={};let n=t.notification.title;n&&(e.notification.title=n);let r=t.notification.body;r&&(e.notification.body=r);let i=t.notification.image;i&&(e.notification.image=i);let o=t.notification.icon;o&&(e.notification.icon=o)}function ri(e,t){t.data&&(e.data=t.data)}function ii(e,t){var n,r,i,o,s;if(!t.fcmOptions&&!(!((n=t.notification)===null||n===void 0)&&n.click_action))return;e.fcmOptions={};let a=(i=(r=t.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&i!==void 0?i:(o=t.notification)===null||o===void 0?void 0:o.click_action;a&&(e.fcmOptions.link=a);let c=(s=t.fcmOptions)===null||s===void 0?void 0:s.analytics_label;c&&(e.fcmOptions.analyticsLabel=c)}function oi(e){return typeof e=="object"&&!!e&&It in e}si("AzSCbw63g1R0nCw85jG8","Iaya3yLKwmgvh7cF0q4");function si(e,t){let n=[];for(let r=0;r<e.length;r++)n.push(e.charAt(r)),r<t.length&&n.push(t.charAt(r));return n.join("")}function ai(e){if(!e||!e.options)throw Se("App Configuration Object");if(!e.name)throw Se("App Name");let t=["projectId","apiKey","appId","messagingSenderId"],{options:n}=e;for(let r of t)if(!n[r])throw Se(r);return{appName:e.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function Se(e){return l.create("missing-app-config-values",{valueName:e})}var Ae=class{constructor(t,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;let i=ai(t);this.firebaseDependencies={app:t,appConfig:i,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}};async function Tt(e){try{e.swRegistration=await navigator.serviceWorker.register(Mr,{scope:Br}),e.swRegistration.update().catch(()=>{})}catch(t){throw l.create("failed-service-worker-registration",{browserErrorMessage:t?.message})}}async function ci(e,t){if(!t&&!e.swRegistration&&await Tt(e),!(!t&&e.swRegistration)){if(!(t instanceof ServiceWorkerRegistration))throw l.create("invalid-sw-registration");e.swRegistration=t}}async function ui(e,t){t?e.vapidKey=t:e.vapidKey||(e.vapidKey=Et)}async function Ct(e,t){if(!navigator)throw l.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw l.create("permission-blocked");return await ui(e,t?.vapidKey),await ci(e,t?.serviceWorkerRegistration),Xr(e)}async function fi(e,t,n){let r=di(t);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:n[It],message_name:n[Lr],message_time:n[Fr],message_device_time:Math.floor(Date.now()/1e3)})}function di(e){switch(e){case B.NOTIFICATION_CLICKED:return"notification_open";case B.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}async function li(e,t){let n=t.data;if(!n.isFirebaseMessaging)return;e.onMessageHandler&&n.messageType===B.PUSH_RECEIVED&&(typeof e.onMessageHandler=="function"?e.onMessageHandler(yt(n)):e.onMessageHandler.next(yt(n)));let r=n.data;oi(r)&&r[jr]==="1"&&await fi(e,n.messageType,r)}var vt="@firebase/messaging",_t="0.12.12";var hi=e=>{let t=new Ae(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>li(t,n)),t},pi=e=>{let t=e.getProvider("messaging").getImmediate();return{getToken:r=>Ct(t,r)}};function gi(){y(new h("messaging",hi,"PUBLIC")),y(new h("messaging-internal",pi,"PRIVATE")),g(vt,_t),g(vt,_t,"esm2017")}async function Ne(){try{await H()}catch{return!1}return typeof window<"u"&&$()&&Be()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}async function mi(e){if(!navigator)throw l.create("only-available-in-window");return e.swRegistration||await Tt(e),Qr(e)}function bi(e,t){if(!navigator)throw l.create("only-available-in-window");return e.onMessageHandler=t,()=>{e.onMessageHandler=null}}function kt(e=M()){return Ne().then(t=>{if(!t)throw l.create("unsupported-browser")},t=>{throw l.create("indexed-db-unsupported")}),R(O(e),"messaging").getImmediate()}async function Ot(e,t){return e=O(e),Ct(e,t)}function Nt(e){return e=O(e),mi(e)}function xt(e,t){return e=O(e),bi(e,t)}gi();var P=null,Rt=null,C=null;async function no({firebaseConfig:e,vapidKey:t,serviceWorkerPath:n="/firebase-messaging-sw.js"}){if(!e)throw new Error("[@bhaskardey772/push-notif-frontend] firebaseConfig is required");if(!t)throw new Error("[@bhaskardey772/push-notif-frontend] vapidKey is required");if(!await Ne()){console.warn("[@bhaskardey772/push-notif-frontend] Firebase Messaging is not supported in this browser.");return}let i=qe().length?M():pe(e);if(P=kt(i),Rt=t,!("serviceWorker"in navigator))throw new Error("[@bhaskardey772/push-notif-frontend] Service workers are not supported in this browser.");try{C=await navigator.serviceWorker.register(n);let o=C.installing||C.waiting||C.active;o&&o.state!=="activated"&&await new Promise(a=>{o.addEventListener("statechange",function c(u){u.target.state==="activated"&&(o.removeEventListener("statechange",c),a())})});let s=C.active;s&&s.postMessage({type:"FIREBASE_CONFIG",firebaseConfig:e})}catch(o){throw console.error("[@bhaskardey772/push-notif-frontend] Service worker registration failed:",o),o}}async function ro(){return Y(),await Notification.requestPermission()!=="granted"?(console.warn("[@bhaskardey772/push-notif-frontend] Notification permission denied."),null):Mt()}async function io(){return Y(),Notification.permission!=="granted"?null:Mt()}function oo(){return Notification.permission}function so(e){return Y(),xt(P,t=>e(wi(t)))}async function ao(){return Y(),Nt(P)}function Y(){if(!P)throw new Error("[@bhaskardey772/push-notif-frontend] Call notif.init({ firebaseConfig, vapidKey }) before using other methods.")}async function Mt(){try{return await Ot(P,{vapidKey:Rt,serviceWorkerRegistration:C})||null}catch(e){throw console.error("[@bhaskardey772/push-notif-frontend] Failed to get FCM token:",e),e}}function wi(e){let t=e.notification||{};return{title:t.title||"",body:t.body||"",imageUrl:t.image||"",data:e.data||{},raw:e}}export{ao as deleteToken,io as getDeviceToken,oo as getPermissionState,no as init,so as onForegroundMessage,ro as requestPermission};
/*! Bundled license information:

@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/logger/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
@firebase/component/dist/esm/index.esm2017.js:
@firebase/app/dist/esm/index.esm2017.js:
@firebase/app/dist/esm/index.esm2017.js:
@firebase/app/dist/esm/index.esm2017.js:
@firebase/installations/dist/esm/index.esm2017.js:
@firebase/installations/dist/esm/index.esm2017.js:
@firebase/installations/dist/esm/index.esm2017.js:
@firebase/installations/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
firebase/app/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/installations/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/messaging/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
   * in compliance with the License. You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software distributed under the License
   * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
   * or implied. See the License for the specific language governing permissions and limitations under
   * the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
