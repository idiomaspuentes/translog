import{j as e}from"./jsx-runtime-u17CrQMm.js";import{C as i}from"./ChapterPickerModal-DvehE4V1.js";import{P as g}from"./PhoneFrame-DwgRCdPI.js";import"./createLucideIcon-B2NwkhIy.js";import"./iframe-CmYeKv5-.js";import"./preload-helper-PPVm8Dsz.js";const{useArgs:_}=__STORYBOOK_MODULE_PREVIEW_API__,{fn:p}=__STORYBOOK_MODULE_TEST__,y={title:"Componentes/ChapterPickerModal",component:i,parameters:{layout:"centered"},decorators:[r=>e.jsx(g,{label:"Modal de capítulos",children:e.jsx("div",{className:"relative h-full w-full bg-background",children:e.jsx(r,{})})})],argTypes:{open:{control:"boolean",description:"Si el modal está abierto"},current:{control:{type:"number",min:1},description:"Capítulo actualmente seleccionado"},total:{control:{type:"number",min:1,max:150},description:"Total de capítulos del libro"},available:{control:"object",description:"Capítulos con contenido disponible (number[])"},onSelect:{action:"onSelect"},onClose:{action:"onClose"}},args:{open:!0,current:3,total:20,available:[1,2,3,4,5,8,12],onSelect:p(),onClose:p()},render:r=>{const[,o]=_(),{open:n,current:l,total:m,available:d,onSelect:u,onClose:b}=r;return e.jsxs(e.Fragment,{children:[e.jsx(i,{open:n,current:l,total:m,available:d,onSelect:c=>{o({current:c}),u?.(c)},onClose:()=>{o({open:!1}),b?.()}}),!n&&e.jsx("div",{className:"absolute inset-0 z-30 grid place-items-center p-6",children:e.jsxs("button",{type:"button",onClick:()=>o({open:!0}),className:"rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90",children:["Abrir modal (capítulo actual: ",l,")"]})})]})}},t={},a={args:{current:1,total:5,available:[1,2,3]}},s={args:{current:7,total:15,available:Array.from({length:15},(r,o)=>o+1)}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    current: 1,
    total: 5,
    available: [1, 2, 3]
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    current: 7,
    total: 15,
    available: Array.from({
      length: 15
    }, (_, i) => i + 1)
  }
}`,...s.parameters?.docs?.source}}};const j=["Default","PocosCapitulos","TodosDisponibles"];export{t as Default,a as PocosCapitulos,s as TodosDisponibles,j as __namedExportsOrder,y as default};
