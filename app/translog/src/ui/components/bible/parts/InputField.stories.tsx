import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputField } from "./InputField";

const meta = {
  title: "Componentes/InputField",
  component: InputField,
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text", description: "Etiqueta mostrada encima del campo" },
    placeholder: { control: "text", description: "Texto guía cuando está vacío" },
    defaultValue: { control: "text", description: "Valor inicial (editable en runtime)" },
    multiline: { control: "boolean", description: "Si es un textarea en lugar de input" },
    disabled: { control: "boolean", description: "Estado externo: deshabilitado" },
    variant: {
      control: "radio",
      options: ["default", "comment-card"],
      description: "Estilo del campo",
    },
    defaultAuthorName: { control: "text", description: "Solo `comment-card`: nombre por defecto del autor (editable)" },
    authorInitial: { control: "text", description: "Solo `comment-card`: inicial del avatar" },
    maxLength: { control: { type: "number", min: 50, max: 2000, step: 50 } },
    onChange: { action: "onChange" },
    onRecord: { action: "onRecord" },
  },
  args: {
    variant: "default",
    multiline: false,
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {
  args: { label: "Nombre", placeholder: "Escribe tu nombre" },
};

export const ConValor: Story = {
  args: { label: "Correo", defaultValue: "ejemplo@correo.com" },
};

export const Multilinea: Story = {
  args: { label: "Comentario", multiline: true, placeholder: "Escribe tu comentario..." },
};

export const MultilineaConTexto: Story = {
  args: {
    label: "Comentario",
    multiline: true,
    defaultValue: "Este pasaje me recordó la importancia de la fe en momentos difíciles.",
  },
};

export const SinLabel: Story = {
  args: { placeholder: "Buscar..." },
};

/**
 * Para la tarjeta de comentario completa con todos sus estados,
 * ver la historia `Componentes/CommentForm`.
 */
