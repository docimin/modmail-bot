import{S as N,i as R,s as j,N as O,l as b,m as g,n as y,h as f,p as _,O as w,b as d,I as S,P as T,Q as C,R as M,f as m,t as p,a2 as P,r as $,u as k,a as D,w as x,L as Q,c as E,x as F,H as h,y as H,B as I,a5 as U,e as L,g as V,d as z,E as q}from"../chunks/index-dd217174.js";import{R as A}from"../chunks/Rolling-44ec13db.js";function G(n){let e;return{c(){e=$("Button")},l(t){e=k(t,"Button")},m(t,s){d(t,e,s)},d(t){t&&f(e)}}}function J(n){let e,t,s,i,u;const o=n[4].default,c=O(o,n,n[3],null),l=c||G();return{c(){e=b("button"),l&&l.c(),this.h()},l(a){e=g(a,"BUTTON",{class:!0,style:!0});var r=y(e);l&&l.l(r),r.forEach(f),this.h()},h(){_(e,"class",t=w(n[1]?"disabled":"not-disabled")+" svelte-tkjn45"),_(e,"style",n[0])},m(a,r){d(a,e,r),l&&l.m(e,null),s=!0,i||(u=S(e,"click",n[5]),i=!0)},p(a,[r]){c&&c.p&&(!s||r&8)&&T(c,o,a,a[3],s?M(o,a[3],r,null):C(a[3]),null),(!s||r&2&&t!==(t=w(a[1]?"disabled":"not-disabled")+" svelte-tkjn45"))&&_(e,"class",t),(!s||r&1)&&_(e,"style",a[0])},i(a){s||(m(l,a),s=!0)},o(a){p(l,a),s=!1},d(a){a&&f(e),l&&l.d(a),i=!1,u()}}}function K(n,e,t){let{$$slots:s={},$$scope:i}=e,{style:u="",disabled:o=!1}=e,c=P();const l=()=>o?null:c("click");return n.$$set=a=>{"style"in a&&t(0,u=a.style),"disabled"in a&&t(1,o=a.disabled),"$$scope"in a&&t(3,i=a.$$scope)},[u,o,c,i,s,l]}class W extends N{constructor(e){super(),R(this,e,K,J,j,{style:0,disabled:1})}}const{document:B}=U;function X(n){let e;return{c(){e=$("Login with Discord")},l(t){e=k(t,"Login with Discord")},m(t,s){d(t,e,s)},i:q,o:q,d(t){t&&f(e)}}}function Y(n){let e,t;return e=new A({props:{style:"transform: scale(.1);"}}),{c(){x(e.$$.fragment)},l(s){F(e.$$.fragment,s)},m(s,i){H(e,s,i),t=!0},i(s){t||(m(e.$$.fragment,s),t=!0)},o(s){p(e.$$.fragment,s),t=!1},d(s){I(e,s)}}}function Z(n){let e,t,s,i;const u=[Y,X],o=[];function c(l,a){return l[0]?0:1}return e=c(n),t=o[e]=u[e](n),{c(){t.c(),s=L()},l(l){t.l(l),s=L()},m(l,a){o[e].m(l,a),d(l,s,a),i=!0},p(l,a){let r=e;e=c(l),e!==r&&(V(),p(o[r],1,1,()=>{o[r]=null}),z(),t=o[e],t||(t=o[e]=u[e](l),t.c()),m(t,1),t.m(s.parentNode,s))},i(l){i||(m(t),i=!0)},o(l){p(t),i=!1},d(l){o[e].d(l),l&&f(s)}}}function ee(n){let e,t,s,i,u,o,c;return o=new W({props:{style:"border-radius: 100px; padding: 0; width: calc(100% - 10px); max-width: 200px; height: 40px",disabled:n[0],$$slots:{default:[Z]},$$scope:{ctx:n}}}),o.$on("click",n[1]),{c(){e=D(),t=b("div"),s=b("h1"),i=$("fyfu modmail"),u=D(),x(o.$$.fragment),this.h()},l(l){Q('[data-svelte="svelte-xauop2"]',B.head).forEach(f),e=E(l),t=g(l,"DIV",{class:!0});var r=y(t);s=g(r,"H1",{class:!0});var v=y(s);i=k(v,"fyfu modmail"),v.forEach(f),u=E(r),F(o.$$.fragment,r),r.forEach(f),this.h()},h(){B.title="FyFu Modmail | Login",_(s,"class","svelte-b5o5q1"),_(t,"class","container svelte-b5o5q1")},m(l,a){d(l,e,a),d(l,t,a),h(t,s),h(s,i),h(t,u),H(o,t,null),c=!0},p(l,[a]){const r={};a&1&&(r.disabled=l[0]),a&5&&(r.$$scope={dirty:a,ctx:l}),o.$set(r)},i(l){c||(m(o.$$.fragment,l),c=!0)},o(l){p(o.$$.fragment,l),c=!1},d(l){l&&f(e),l&&f(t),I(o)}}}async function ae({session:n}){return n!=null&&n.userData?{status:307,redirect:"/"}:{status:200}}function te(n,e,t){let s=!1;return[s,()=>{t(0,s=!0),document.location.href="/api/v1/login"}]}class ne extends N{constructor(e){super(),R(this,e,te,ee,j,{})}}export{ne as default,ae as load};
