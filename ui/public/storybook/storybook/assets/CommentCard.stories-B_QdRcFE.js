import{j as s}from"./jsx-runtime-u17CrQMm.js";import{C as d}from"./CommentCard-BoLMQ-BL.js";import{r as u}from"./iframe-BQB90QRw.js";import"./preload-helper-PPVm8Dsz.js";import"./play-V0-6ZiA7.js";import"./createLucideIcon-jbfA63oh.js";import"./mic-mgqlkY_D.js";const{fn:i}=__STORYBOOK_MODULE_TEST__;function l(e){const[m,c]=u.useState(!!e.playing);return u.useEffect(()=>{c(!!e.playing)},[e.playing]),s.jsx(d,{...e,playing:m,onTogglePlay:o=>{c(o),e.onTogglePlay?.(o)}})}const f={title:"Componentes/CommentCard",component:d,parameters:{layout:"padded"},decorators:[e=>s.jsx("div",{className:"w-[360px] bg-background p-4",children:s.jsx(e,{})})],argTypes:{name:{control:"text",description:"Nombre del autor"},time:{control:"text",description:"Marca de tiempo relativa"},text:{control:"text",description:"Texto del comentario (ignorado si hay audio)"},audio:{control:"object",description:"Datos del audio: { duration, waveform? }"},playing:{control:"boolean",description:"Estado de reproducción (controlado)"},onTogglePlay:{action:"onTogglePlay"},onSeek:{action:"onSeek"},onEnded:{action:"onEnded"}},args:{name:"María",time:"hace 2 h",playing:!1,onTogglePlay:i(),onSeek:i(),onEnded:i()},render:e=>s.jsx(l,{...e})},o={args:{text:"Creo que sería más natural traducir «en aquellos días» como «por aquel entonces»."}},a={args:{name:"Pablo",time:"hace 30 min",text:"De acuerdo, además mantiene el tono narrativo del original hebreo y refuerza la conexión con el versículo anterior, donde se introduce el contexto del banquete del rey."}},r={args:{name:"Lucía",time:"hace 5 min",audio:{duration:"0:24"}}},n={args:{name:"Daniel",time:"hace 1 min",audio:{duration:"0:08",waveform:[25,60,80,45,70,35,90,55,40,75,60,50]}}},t={args:{name:"Andrea",time:"hace 12 min",audio:{duration:"1:42",waveform:[40,70,55,85,30,65,50,80,45,60,35,75,90,50,65,40,70,55,80,45,60,70]}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    text: "Creo que sería más natural traducir «en aquellos días» como «por aquel entonces»."
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Pablo",
    time: "hace 30 min",
    text: "De acuerdo, además mantiene el tono narrativo del original hebreo y refuerza la conexión con el versículo anterior, donde se introduce el contexto del banquete del rey."
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Lucía",
    time: "hace 5 min",
    audio: {
      duration: "0:24"
    }
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Daniel",
    time: "hace 1 min",
    audio: {
      duration: "0:08",
      waveform: [25, 60, 80, 45, 70, 35, 90, 55, 40, 75, 60, 50]
    }
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    name: "Andrea",
    time: "hace 12 min",
    audio: {
      duration: "1:42",
      waveform: [40, 70, 55, 85, 30, 65, 50, 80, 45, 60, 35, 75, 90, 50, 65, 40, 70, 55, 80, 45, 60, 70]
    }
  }
}`,...t.parameters?.docs?.source}}};const C=["Texto","TextoLargo","Audio","AudioCorto","AudioLargo"];export{r as Audio,n as AudioCorto,t as AudioLargo,o as Texto,a as TextoLargo,C as __namedExportsOrder,f as default};
