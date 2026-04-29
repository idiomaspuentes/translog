import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Mic, Pencil, ArrowUp } from "lucide-react";
import { FloatingButton } from "./FloatingButton";

const meta = {
  title: "Componentes/FloatingButton",
  component: FloatingButton,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="relative h-[300px] w-[320px] overflow-hidden rounded-2xl border border-border bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Estilo visual del botón",
    },
    position: {
      control: "radio",
      options: ["right", "left"],
      description: "Posición horizontal dentro del contenedor",
    },
    offset: {
      control: "radio",
      options: ["default", "bottom"],
      description: "Distancia desde el borde inferior",
    },
    label: { control: "text", description: "Texto opcional al lado del icono" },
    children: { control: false, description: "Icono (ReactNode)" },
  },
  args: {
    variant: "primary",
    position: "right",
    offset: "default",
  },
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconoSolo: Story = {
  args: { children: <Plus className="h-5 w-5" /> },
};

export const ConEtiqueta: Story = {
  args: { label: "Nuevo", children: <Plus className="h-4 w-4" /> },
};

export const Secundario: Story = {
  args: { variant: "secondary", label: "Editar", children: <Pencil className="h-4 w-4" /> },
};

export const Izquierda: Story = {
  args: { position: "left", children: <Mic className="h-5 w-5" /> },
};

export const OffsetBottom: Story = {
  args: { offset: "bottom", label: "Enviar", children: <ArrowUp className="h-4 w-4" /> },
};
