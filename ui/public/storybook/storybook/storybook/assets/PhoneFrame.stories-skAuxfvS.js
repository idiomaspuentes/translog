import{j as e}from"./jsx-runtime-u17CrQMm.js";import{P as n}from"./PhoneFrame-DwgRCdPI.js";const s={title:"Componentes/PhoneFrame",component:n,parameters:{layout:"centered"},argTypes:{label:{control:"text",description:"Etiqueta mostrada encima del marco"},children:{control:!1,description:"Contenido renderizado dentro del marco"}}},t={args:{label:"Pantalla vacía",children:e.jsx("div",{className:"flex h-full w-full items-center justify-center text-sm text-muted-foreground",children:"Contenido aquí"})}},a={args:{children:e.jsx("div",{className:"flex h-full w-full items-center justify-center bg-primary/10 text-sm text-primary",children:"Sin etiqueta"})}},r={args:{label:"Demo",children:e.jsxs("div",{className:"flex h-full w-full flex-col gap-3 p-6",children:[e.jsx("h2",{className:"text-lg font-semibold text-foreground",children:"Hola"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Este es un ejemplo del marco del teléfono usado para previsualizar pantallas."}),e.jsx("div",{className:"mt-auto rounded-2xl bg-primary p-4 text-center text-sm font-medium text-primary-foreground",children:"Botón de ejemplo"})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Pantalla vacía",
    children: <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Contenido aquí
      </div>
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm text-primary">
        Sin etiqueta
      </div>
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Demo",
    children: <div className="flex h-full w-full flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold text-foreground">Hola</h2>
        <p className="text-sm text-muted-foreground">
          Este es un ejemplo del marco del teléfono usado para previsualizar pantallas.
        </p>
        <div className="mt-auto rounded-2xl bg-primary p-4 text-center text-sm font-medium text-primary-foreground">
          Botón de ejemplo
        </div>
      </div>
  }
}`,...r.parameters?.docs?.source}}};const m=["Vacio","SinLabel","ConContenido"];export{r as ConContenido,a as SinLabel,t as Vacio,m as __namedExportsOrder,s as default};
