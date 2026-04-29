import type { Meta, StoryObj } from "@storybook/react-vite";
import { LanguageOption } from "./LanguageOption";

const meta = {
  title: "Componentes/LanguageOption",
  component: LanguageOption,
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    flag: { control: "text", description: "Emoji de la bandera" },
    name: { control: "text", description: "Nombre del idioma en su lengua nativa" },
    native: { control: "text", description: "Nombre en inglés/local" },
    selected: { control: "boolean", description: "Si el idioma está seleccionado" },
  },
  args: {
    flag: "🇪🇸",
    name: "Español",
    native: "Spanish",
    selected: false,
  },
} satisfies Meta<typeof LanguageOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSeleccionado: Story = {
  args: { flag: "🇬🇧", name: "English", native: "English" },
};

export const Seleccionado: Story = {
  args: { selected: true },
};
