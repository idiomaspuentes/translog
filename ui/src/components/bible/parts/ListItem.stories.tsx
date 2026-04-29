import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListItem } from "./ListItem";

const meta = {
  title: "Componentes/ListItem",
  component: ListItem,
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text", description: "Título principal" },
    meta: { control: "text", description: "Información secundaria al lado del título" },
    description: { control: "text", description: "Descripción debajo del título" },
  },
  args: {
    title: "Ester",
    meta: "10 capítulos",
    description: "Antiguo Testamento · Históricos",
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoloTitulo: Story = {
  args: { meta: undefined, description: undefined },
};

export const SinDescripcion: Story = {
  args: { description: undefined },
};
