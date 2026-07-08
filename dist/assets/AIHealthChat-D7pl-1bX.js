import{a as H,j as a,m as c}from"./index-DZNCDH2R.js";import{a as o,an as T,e as u,k as R,$ as P,a0 as D,n as V,f as p,T as L,a3 as x,P as _,A as U,V as q}from"./ui-DMUGwGVX.js";import{A as z}from"./index-lIV6ftWj.js";import"./charts-Csea7QPn.js";import"./motion-Ww-7FtLM.js";const O={sw:["Nina homa na maumivu ya kichwa","Nataka kupanga miadi","Ninahitaji dawa zangu","Ninaposikia maumivu ya kifua","Msaada wa mama mjamzito"],en:["I have fever and headache","I want to book an appointment","I need a prescription refill","I have chest pain","Maternal health support"]},F={fever:{text:{sw:`Naelewa. Homa na maumivu ya kichwa yanaweza kuwa dalili za malaria, URTI, au hali nyingine. Hebu niulize maswali machache:

• Je, homa ilikuwa ngapi? (joto la kawaida, wastani, au kali?)
• Je, una kikohozi au maumivu ya koo?
• Je, umetumia dawa yoyote leo?

Kwa sasa, pumzika na kunywa maji mengi. Naweza kukusaidia kupanga miadi au kuunganisha na daktari sasa hivi.`,en:`I understand. Fever and headache can be signs of malaria, URTI, or other conditions. Let me ask a few questions:

• How high is the fever? (mild, moderate, or severe?)
• Do you have cough or sore throat?
• Have you taken any medication today?

For now, rest and drink plenty of fluids. I can help you book an appointment or connect with a doctor right now.`},actions:[{label:"Check Symptoms",route:"symptom-checker",icon:U},{label:"Book Appointment",route:"appointments",icon:p},{label:"Talk to Doctor",route:"telemedicine",icon:q}]},appointment:{text:{sw:`Sawa! Nitakusaidia kupanga miadi. Una uchaguzi huu:

🏥 **Muhimbili National Hospital** — leo saa 4 asubuhi
🏥 **Amana District Hospital** — kesho saa 8 asubuhi
🏥 **Mwananyamala Hospital** — kesho saa 10 asubuhi

Unataka niongeze miadi? Au ungependa kuona kliniki karibu nawe?`,en:`Sure! I'll help you book an appointment. Here are your options:

🏥 **Muhimbili National Hospital** — today at 10:00 AM
🏥 **Amana District Hospital** — tomorrow at 8:00 AM
🏥 **Mwananyamala Hospital** — tomorrow at 10:00 AM

Shall I book one? Or would you like to see clinics near you?`},actions:[{label:"Book Now",route:"appointments",icon:p},{label:"Find Clinics",route:"clinic-finder",icon:x}]},prescription:{text:{sw:`Sawa. Niangalie rekodi zako... 📋

Dawa zako za sasa:
• **Metformin 500mg** — mara 2 kwa siku
• **Lisinopril 10mg** — mara 1 kwa siku

Dawa zako zinahitaji kujazwa upya tarehe 2026-05-15. Unaweza kwenda duka lolote la dawa linalounda uhusiano na CREOVA, au nitatoa agizo la dawa ya kidijitali.`,en:`Let me check your records... 📋

Your current medications:
• **Metformin 500mg** — twice daily
• **Lisinopril 10mg** — once daily

Your refill is due 2026-05-15. You can visit any partnered pharmacy, or I can generate a digital prescription.`},actions:[{label:"View Medications",route:"medications",icon:_},{label:"Find Pharmacy",route:"clinic-finder",icon:x}]},chest:{text:{sw:`⚠️ **Tahadhari ya Dharura**

Maumivu ya kifua yanaweza kuwa ya moyo au mapafu na yanahitaji tathmini ya haraka.

Piga simu ya dharura sasa hivi au nenda hospitali ya karibu nawe.`,en:`⚠️ **Emergency Warning**

Chest pain can indicate a cardiac or pulmonary emergency and requires immediate evaluation.

Call emergency services now or go to the nearest hospital.`},actions:[{label:"EMERGENCY",route:"emergency",icon:L},{label:"Find Hospital",route:"clinic-finder",icon:x}]},maternal:{text:{sw:`Karibu! Ninatumai mama na mtoto wako mko salama 💚

Ninaweza kukusaidia na:
• Ratiba ya ziara za kabla ya kuzaa (ANC)
• Kufuatilia uzito na afya ya mtoto
• Maswali kuhusu lishe wakati wa ujauzito
• Dawa za vitamini (chuma, asidi ya folic)

Unataka kuanza na nini?`,en:`Welcome! I hope you and your baby are doing well 💚

I can help you with:
• Antenatal care (ANC) appointment schedule
• Tracking baby weight and health milestones
• Nutrition questions during pregnancy
• Vitamin supplements (iron, folic acid)

What would you like to start with?`},actions:[{label:"Maternal Care",route:"maternal",icon:V},{label:"Book ANC Visit",route:"appointments",icon:p}]}},G={sw:"Habari! Mimi ni msaidizi wako wa AI wa afya. Ninaweza kukusaidia na dalili, miadi, dawa, na zaidi. Je, ninaweza kukusaidiaje leo?",en:"Hello! I'm your AI health copilot. I can help you with symptoms, appointments, medications, and more. How can I help you today?"};function J(d){const i=d.toLowerCase();return i.includes("homa")||i.includes("fever")||i.includes("kichwa")||i.includes("headache")?"fever":i.includes("miadi")||i.includes("appointment")||i.includes("book")?"appointment":i.includes("dawa")||i.includes("medication")||i.includes("prescription")||i.includes("refill")?"prescription":i.includes("kifua")||i.includes("chest")?"chest":i.includes("mama")||i.includes("maternal")||i.includes("mjamzito")||i.includes("pregnant")?"maternal":null}function f(){return new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function w(){return Math.random().toString(36).slice(2,9)}function Q({onBack:d,onNavigate:i}){const{language:I}=H(),n=I??"sw",A=O[n],[y,b]=o.useState([{id:w(),role:"ai",text:G[n],time:f()}]),[r,k]=o.useState(""),[m,g]=o.useState(!1),[j,v]=o.useState(!0),N=o.useRef(null),M=o.useRef(null);o.useEffect(()=>{var e;(e=N.current)==null||e.scrollIntoView({behavior:"smooth"})},[y,m]);function h(e){if(!e.trim())return;v(!1);const t={id:w(),role:"user",text:e.trim(),time:f()};b(l=>[...l,t]),k(""),g(!0),setTimeout(()=>{g(!1);const l=J(e),s=l?F[l]:null,S=s?s.text[n]:n==="sw"?"Naelewa. Swali lako ni muhimu. Ninaomba msamaha, lakini sijui jibu sahihi kwa hilo. Jaribu kuwasiliana na daktari au piga simu ya dharura ikiwa ni hali mbaya.":"I understand. Your question is important. I don't have a confident answer for that right now. Please consult a doctor or call emergency if it's urgent.",C={id:w(),role:"ai",text:S,time:f(),actions:s==null?void 0:s.actions};b(E=>[...E,C])},1400+Math.random()*600)}return a.jsxs("div",{className:"flex flex-col h-screen bg-[#f8fafc]",children:[a.jsxs("div",{className:"flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0",style:{background:"linear-gradient(160deg, #0f172a 0%, #134e4a 100%)"},children:[a.jsx("button",{type:"button","aria-label":n==="sw"?"Rudi":"Back",onClick:d,className:"w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",children:a.jsx(T,{size:18})}),a.jsx("div",{className:"flex-1",children:a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("div",{className:"w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0",children:a.jsx(u,{size:14,className:"text-white"})}),a.jsxs("div",{children:[a.jsx("p",{className:"text-white font-bold text-sm leading-none",children:"CREOVA AI Copilot"}),a.jsx("p",{className:"text-white/50 text-[10px] mt-0.5",children:n==="sw"?"Msaidizi wa Afya · Mtandaoni":"Health Assistant · Online"})]})]})}),a.jsx("button",{type:"button","aria-label":n==="sw"?"Piga simu ya dharura":"Emergency call",onClick:()=>i==null?void 0:i("emergency"),className:"w-9 h-9 rounded-xl bg-[#dc2626]/20 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]",children:a.jsx(R,{size:16,className:"text-[#dc2626]"})})]}),a.jsx(z,{children:j&&a.jsx(c.div,{initial:{height:"auto",opacity:1},exit:{height:0,opacity:0},transition:{duration:.25},className:"overflow-hidden flex-shrink-0",children:a.jsxs("div",{className:"px-4 py-3 bg-white border-b border-slate-100",children:[a.jsx("p",{className:"text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide",children:n==="sw"?"Maswali ya Kawaida":"Common questions"}),a.jsx("div",{className:"flex gap-2 overflow-x-auto pb-1 no-scrollbar",children:A.map(e=>a.jsx("button",{type:"button",onClick:()=>h(e),className:"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#0d9488] text-[#0d9488] bg-[#f0fdfa] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]",children:e},e))})]})})}),a.jsxs("div",{className:"flex-1 overflow-y-auto px-4 py-4 space-y-4",children:[y.map(e=>a.jsxs(c.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{duration:.22},className:`flex gap-2.5 ${e.role==="user"?"flex-row-reverse":"flex-row"}`,children:[e.role==="ai"&&a.jsx("div",{className:"w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0 self-end mb-0.5",children:a.jsx(u,{size:12,className:"text-white"})}),a.jsxs("div",{className:`max-w-[82%] ${e.role==="user"?"items-end":"items-start"} flex flex-col gap-1.5`,children:[a.jsx("div",{className:`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${e.role==="user"?"rounded-tr-sm text-white":"rounded-tl-sm text-[#0f172a] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"}`,style:e.role==="user"?{background:"linear-gradient(135deg, #0d9488, #0f766e)"}:void 0,children:e.text}),a.jsx("p",{className:"text-[10px] text-gray-400 px-1",children:e.time}),e.actions&&e.actions.length>0&&a.jsx("div",{className:"flex flex-wrap gap-2 mt-1",children:e.actions.map(t=>{const l=t.icon,s=t.route==="emergency";return a.jsxs("button",{type:"button",onClick:()=>i==null?void 0:i(t.route),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] ${s?"bg-[#dc2626] text-white":"bg-[#0d9488] text-white"}`,children:[a.jsx(l,{size:12}),t.label]},t.route)})})]})]},e.id)),a.jsx(z,{children:m&&a.jsxs(c.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,y:8},transition:{duration:.2},className:"flex gap-2.5 items-end",children:[a.jsx("div",{className:"w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0",children:a.jsx(u,{size:12,className:"text-white"})}),a.jsx("div",{className:"bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]",children:a.jsx("div",{className:"flex gap-1.5 items-center h-4",children:[0,1,2].map(e=>a.jsx(c.div,{className:"w-2 h-2 rounded-full bg-[#0d9488]",animate:{y:[0,-5,0]},transition:{duration:.6,repeat:1/0,delay:e*.15}},e))})})]})}),a.jsx("div",{ref:N})]}),a.jsxs("div",{className:"flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",children:[!j&&a.jsxs("button",{type:"button",onClick:()=>v(!0),className:"text-xs text-[#0d9488] font-semibold mb-2 flex items-center gap-1",children:[a.jsx(u,{size:11}),n==="sw"?"Maswali ya kawaida":"Suggested prompts"]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsxs("div",{className:"flex-1 flex items-center gap-2 bg-[#f8fafc] rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/20 transition-all",children:[a.jsx("input",{ref:M,type:"text",placeholder:n==="sw"?"Andika swali la afya...":"Type your health question...",value:r,onChange:e=>k(e.target.value),onKeyDown:e=>e.key==="Enter"&&h(r),className:"flex-1 bg-transparent text-sm text-[#0f172a] placeholder-gray-400 focus:outline-none min-h-[24px]"}),a.jsx("button",{type:"button","aria-label":n==="sw"?"Sauti":"Voice input",className:"w-7 h-7 rounded-full bg-[#ccfbf1] flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]",children:a.jsx(P,{size:14,className:"text-[#0d9488]"})})]}),a.jsx("button",{type:"button","aria-label":n==="sw"?"Tuma":"Send",onClick:()=>h(r),disabled:!r.trim()||m,className:"w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] transition-opacity",style:{background:"linear-gradient(135deg, #0d9488, #0f766e)"},children:a.jsx(D,{size:16,className:"text-white"})})]}),a.jsx("p",{className:"text-center text-[10px] text-gray-300 mt-2",children:n==="sw"?"AI inaweza kukosea — wasiliana na daktari kwa hali mbaya":"AI can make mistakes — consult a doctor for serious conditions"})]})]})}export{Q as AIHealthChat};
