import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerseBlock } from "./VerseBlock";

const meta = {
  title: "Componentes/VerseBlock",
  component: VerseBlock,
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text", description: "Título del pasaje" },
    verses: { control: "object", description: "Array de versículos: { n, text }[]" },
  },
} satisfies Meta<typeof VerseBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "El Señor es mi pastor",
    verses: [
      { n: 1, text: "El Señor es mi pastor; nada me falta." },
      { n: 2, text: "En verdes pastos me hace descansar." },
      { n: 3, text: "Junto a tranquilas aguas me conduce." },
    ],
  },
};

export const VersiculoUnico: Story = {
  args: {
    title: "Génesis 1",
    verses: [{ n: 1, text: "En el principio creó Dios los cielos y la tierra." }],
  },
};

export const PasajeLargo: Story = {
  args: {
    title: "Bienaventuranzas",
    verses: [
      { n: 3, text: "Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos." },
      { n: 4, text: "Bienaventurados los que lloran, porque ellos serán consolados." },
      { n: 5, text: "Bienaventurados los mansos, porque ellos heredarán la tierra." },
      { n: 6, text: "Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados." },
      { n: 7, text: "Bienaventurados los misericordiosos, porque ellos alcanzarán misericordia." },
    ],
  },
};
