import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThreadHeader } from "./ThreadHeader";

const meta = {
  title: "Componentes/ThreadHeader",
  component: ThreadHeader,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[360px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    quote: { control: "text", description: "Cita bíblica mostrada (se trunca si es larga)" },
    reference: { control: "text", description: "Referencia bíblica (libro capítulo:versículo)" },
  },
  args: {
    reference: "Ester 1:2",
  },
} satisfies Meta<typeof ThreadHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Corto: Story = {
  args: { quote: "que en aquellos días" },
};

export const Largo: Story = {
  args: {
    quote:
      "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días",
  },
};

export const MuyLargo: Story = {
  args: {
    quote:
      "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días\nque en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos.",
  },
};
