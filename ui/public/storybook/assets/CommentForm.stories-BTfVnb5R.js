import{j as o}from"./jsx-runtime-u17CrQMm.js";import{C as n}from"./CommentForm-CdwdRd0f.js";import"./iframe-CmYeKv5-.js";import"./preload-helper-PPVm8Dsz.js";import"./play-BZIEaT63.js";import"./createLucideIcon-B2NwkhIy.js";import"./mic-CZiJftsj.js";const g={title:"Componentes/CommentForm",component:n,decorators:[s=>o.jsx("div",{className:"w-[340px] bg-background p-4",children:o.jsx(s,{})})],argTypes:{state:{control:"select",options:["idle","submitting","success"],description:"Estado externo (capa de datos). Los estados visuales internos (typing, recording, recorded, playing) se derivan de la interacción del usuario con los controles."},defaultAuthorName:{control:"text",description:"Nombre por defecto (editable en runtime)"},authorInitial:{control:"text",description:"Inicial del avatar"},defaultText:{control:"text",description:"Texto inicial (editable en runtime)"},placeholder:{control:"text"},maxLength:{control:{type:"number",min:50,max:2e3,step:50}},onChange:{action:"onChange"},onSubmit:{action:"onSubmit"}},args:{defaultAuthorName:"María",authorInitial:"M",defaultText:"",placeholder:"Escribe tu observación...",maxLength:500}},e={args:{state:"idle"}},t={args:{state:"idle",defaultText:"Sugiero revisar la traducción del término hebreo para mayor claridad."}},a={args:{state:"submitting",defaultText:"Comentario en envío..."}},r={args:{state:"success",defaultText:"Comentario publicado."}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    state: "idle"
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: "idle",
    defaultText: "Sugiero revisar la traducción del término hebreo para mayor claridad."
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: "submitting",
    defaultText: "Comentario en envío..."
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: "success",
    defaultText: "Comentario publicado."
  }
}`,...r.parameters?.docs?.source}}};const x=["Idle","ConTextoInicial","Enviando","Exito"];export{t as ConTextoInicial,a as Enviando,r as Exito,e as Idle,x as __namedExportsOrder,g as default};
