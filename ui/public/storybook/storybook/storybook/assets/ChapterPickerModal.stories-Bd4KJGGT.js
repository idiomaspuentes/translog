import{j as a}from"./jsx-runtime-u17CrQMm.js";import{C as n}from"./ChapterPickerModal-BEKIdqxI.js";import{P as l}from"./PhoneFrame-DwgRCdPI.js";import"./createLucideIcon-C1zKmnw5.js";import"./iframe-t-qpv17L.js";import"./preload-helper-PPVm8Dsz.js";const b={title:"Componentes/ChapterPickerModal",component:n,parameters:{layout:"centered"},decorators:[t=>a.jsx(l,{label:"Modal de capítulos",children:a.jsx("div",{className:"relative h-full w-full bg-background",children:a.jsx(t,{})})})],argTypes:{open:{control:"boolean",description:"Si el modal está abierto"},current:{control:{type:"number",min:1},description:"Capítulo actualmente seleccionado"},total:{control:{type:"number",min:1,max:150},description:"Total de capítulos del libro"},available:{control:"object",description:"Capítulos con contenido disponible (number[])"},onSelect:{action:"onSelect"},onClose:{action:"onClose"}},args:{open:!0,current:3,total:20,available:[1,2,3,4,5,8,12],onSelect:()=>{},onClose:()=>{}}},e={},o={args:{current:1,total:5,available:[1,2,3]}},r={args:{current:7,total:15,available:Array.from({length:15},(t,s)=>s+1)}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    current: 1,
    total: 5,
    available: [1, 2, 3]
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    current: 7,
    total: 15,
    available: Array.from({
      length: 15
    }, (_, i) => i + 1)
  }
}`,...r.parameters?.docs?.source}}};const g=["Default","PocosCapitulos","TodosDisponibles"];export{e as Default,o as PocosCapitulos,r as TodosDisponibles,g as __namedExportsOrder,b as default};
