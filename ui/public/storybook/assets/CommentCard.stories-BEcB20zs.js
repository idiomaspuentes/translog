import{j as t}from"./jsx-runtime-u17CrQMm.js";import{C as i}from"./CommentCard-CzDQprYV.js";import"./iframe-t-qpv17L.js";import"./preload-helper-PPVm8Dsz.js";import"./play-CShAv8iQ.js";import"./createLucideIcon-C1zKmnw5.js";import"./mic-BGW3FQCy.js";const x={title:"Componentes/CommentCard",component:i,parameters:{layout:"padded"},decorators:[s=>t.jsx("div",{className:"w-[360px] bg-background p-4",children:t.jsx(s,{})})],argTypes:{name:{control:"text",description:"Nombre del autor"},time:{control:"text",description:"Marca de tiempo relativa"},text:{control:"text",description:"Texto del comentario (ignorado si hay audio)"},audio:{control:"object",description:"Datos del audio: { duration, waveform? }"}},args:{name:"María",time:"hace 2 h"}},e={args:{text:"Creo que sería más natural traducir «en aquellos días» como «por aquel entonces»."}},a={args:{name:"Pablo",time:"hace 30 min",text:"De acuerdo, además mantiene el tono narrativo del original hebreo y refuerza la conexión con el versículo anterior, donde se introduce el contexto del banquete del rey."}},o={args:{name:"Lucía",time:"hace 5 min",audio:{duration:"0:24"}}},r={args:{name:"Daniel",time:"hace 1 min",audio:{duration:"0:08",waveform:[25,60,80,45,70,35,90,55,40,75,60,50]}}},n={args:{name:"Andrea",time:"hace 12 min",audio:{duration:"1:42",waveform:[40,70,55,85,30,65,50,80,45,60,35,75,90,50,65,40,70,55,80,45,60,70]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    text: "Creo que sería más natural traducir «en aquellos días» como «por aquel entonces»."
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Pablo",
    time: "hace 30 min",
    text: "De acuerdo, además mantiene el tono narrativo del original hebreo y refuerza la conexión con el versículo anterior, donde se introduce el contexto del banquete del rey."
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Lucía",
    time: "hace 5 min",
    audio: {
      duration: "0:24"
    }
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Daniel",
    time: "hace 1 min",
    audio: {
      duration: "0:08",
      waveform: [25, 60, 80, 45, 70, 35, 90, 55, 40, 75, 60, 50]
    }
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Andrea",
    time: "hace 12 min",
    audio: {
      duration: "1:42",
      waveform: [40, 70, 55, 85, 30, 65, 50, 80, 45, 60, 35, 75, 90, 50, 65, 40, 70, 55, 80, 45, 60, 70]
    }
  }
}`,...n.parameters?.docs?.source}}};const h=["Texto","TextoLargo","Audio","AudioCorto","AudioLargo"];export{o as Audio,r as AudioCorto,n as AudioLargo,e as Texto,a as TextoLargo,h as __namedExportsOrder,x as default};
