import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenHeader } from "./ScreenHeader";

const meta = {
  title: "Componentes/ScreenHeader",
  component: ScreenHeader,
  decorators: [
    (Story) => (
      <div className="w-[360px] bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text", description: "Título principal de la pantalla" },
    subtitle: { control: "text", description: "Subtítulo opcional" },
    showBack: { control: "boolean", description: "Mostrar botón de volver" },
    right: { control: false, description: "Contenido opcional a la derecha (ReactNode)" },
  },
  args: {
    title: "Libros",
    subtitle: "Revisión comunitaria",
    showBack: false,
  },
} satisfies Meta<typeof ScreenHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConVolver: Story = {
  args: { title: "Configuración", subtitle: "Preferencias", showBack: true },
};

export const SoloTitulo: Story = {
  args: { title: "Lectura", subtitle: undefined },
};
