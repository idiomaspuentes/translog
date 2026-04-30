import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhoneFrame } from "./PhoneFrame";

const meta = {
  title: "Componentes/PhoneFrame",
  component: PhoneFrame,
  parameters: { layout: "centered" },
  argTypes: {
    label: { control: "text", description: "Etiqueta mostrada encima del marco" },
    children: { control: false, description: "Contenido renderizado dentro del marco" },
  },
} satisfies Meta<typeof PhoneFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {
  args: {
    label: "Pantalla vacía",
    children: (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Contenido aquí
      </div>
    ),
  },
};

export const SinLabel: Story = {
  args: {
    children: (
      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm text-primary">
        Sin etiqueta
      </div>
    ),
  },
};

export const ConContenido: Story = {
  args: {
    label: "Demo",
    children: (
      <div className="flex h-full w-full flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold text-foreground">Hola</h2>
        <p className="text-sm text-muted-foreground">
          Este es un ejemplo del marco del teléfono usado para previsualizar pantallas.
        </p>
        <div className="mt-auto rounded-2xl bg-primary p-4 text-center text-sm font-medium text-primary-foreground">
          Botón de ejemplo
        </div>
      </div>
    ),
  },
};
