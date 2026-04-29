import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentForm } from "./CommentForm";

const meta = {
  title: "Componentes/CommentForm",
  component: CommentForm,
  decorators: [
    (Story) => (
      <div className="w-[340px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    state: {
      control: "select",
      options: ["idle", "submitting", "success"],
      description:
        "Estado externo (capa de datos). Los estados visuales internos (typing, recording, recorded, playing) se derivan de la interacción del usuario con los controles.",
    },
    defaultAuthorName: { control: "text", description: "Nombre por defecto (editable en runtime)" },
    authorInitial: { control: "text", description: "Inicial del avatar" },
    defaultText: { control: "text", description: "Texto inicial (editable en runtime)" },
    placeholder: { control: "text" },
    maxLength: { control: { type: "number", min: 50, max: 2000, step: 50 } },
    onChange: { action: "onChange" },
    onSubmit: { action: "onSubmit" },
  },
  args: {
    defaultAuthorName: "María",
    authorInitial: "M",
    defaultText: "",
    placeholder: "Escribe tu observación...",
    maxLength: 500,
  },
} satisfies Meta<typeof CommentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { state: "idle" } };
export const ConTextoInicial: Story = {
  args: {
    state: "idle",
    defaultText: "Sugiero revisar la traducción del término hebreo para mayor claridad.",
  },
};
export const Enviando: Story = {
  args: { state: "submitting", defaultText: "Comentario en envío..." },
};
export const Exito: Story = {
  args: { state: "success", defaultText: "Comentario publicado." },
};
