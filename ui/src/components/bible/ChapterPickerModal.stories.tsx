import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChapterPickerModal } from "./ChapterPickerModal";
import { PhoneFrame } from "./PhoneFrame";

const meta = {
  title: "Componentes/ChapterPickerModal",
  component: ChapterPickerModal,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <PhoneFrame label="Modal de capítulos">
        <div className="relative h-full w-full bg-background">
          <Story />
        </div>
      </PhoneFrame>
    ),
  ],
  argTypes: {
    open: { control: "boolean", description: "Si el modal está abierto" },
    current: { control: { type: "number", min: 1 }, description: "Capítulo actualmente seleccionado" },
    total: { control: { type: "number", min: 1, max: 150 }, description: "Total de capítulos del libro" },
    available: { control: "object", description: "Capítulos con contenido disponible (number[])" },
    onSelect: { action: "onSelect" },
    onClose: { action: "onClose" },
  },
  args: {
    open: true,
    current: 3,
    total: 20,
    available: [1, 2, 3, 4, 5, 8, 12],
    onSelect: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof ChapterPickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PocosCapitulos: Story = {
  args: { current: 1, total: 5, available: [1, 2, 3] },
};

export const TodosDisponibles: Story = {
  args: {
    current: 7,
    total: 15,
    available: Array.from({ length: 15 }, (_, i) => i + 1),
  },
};
