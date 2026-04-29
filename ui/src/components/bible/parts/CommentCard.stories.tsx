import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";
import { CommentCard } from "./CommentCard";

function StatefulCommentCard(args: React.ComponentProps<typeof CommentCard>) {
  const [playing, setPlaying] = useState(!!args.playing);

  useEffect(() => {
    setPlaying(!!args.playing);
  }, [args.playing]);

  return (
    <CommentCard
      {...args}
      playing={playing}
      onTogglePlay={(next) => {
        setPlaying(next);
        args.onTogglePlay?.(next);
      }}
    />
  );
}

const meta = {
  title: "Componentes/CommentCard",
  component: CommentCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[360px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    name: { control: "text", description: "Nombre del autor" },
    time: { control: "text", description: "Marca de tiempo relativa" },
    text: { control: "text", description: "Texto del comentario (ignorado si hay audio)" },
    audio: { control: "object", description: "Datos del audio: { duration, waveform? }" },
    playing: { control: "boolean", description: "Estado de reproducción (controlado)" },
    onTogglePlay: { action: "onTogglePlay" },
    onSeek: { action: "onSeek" },
    onEnded: { action: "onEnded" },
  },
  args: {
    name: "María",
    time: "hace 2 h",
    playing: false,
    onTogglePlay: fn(),
    onSeek: fn(),
    onEnded: fn(),
  },
  render: (args) => {
    return <StatefulCommentCard {...args} />;
  },
} satisfies Meta<typeof CommentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = {
  args: {
    text: "Creo que sería más natural traducir «en aquellos días» como «por aquel entonces».",
  },
};

export const TextoLargo: Story = {
  args: {
    name: "Pablo",
    time: "hace 30 min",
    text: "De acuerdo, además mantiene el tono narrativo del original hebreo y refuerza la conexión con el versículo anterior, donde se introduce el contexto del banquete del rey.",
  },
};

export const Audio: Story = {
  args: {
    name: "Lucía",
    time: "hace 5 min",
    audio: { duration: "0:24" },
  },
};

export const AudioCorto: Story = {
  args: {
    name: "Daniel",
    time: "hace 1 min",
    audio: {
      duration: "0:08",
      waveform: [25, 60, 80, 45, 70, 35, 90, 55, 40, 75, 60, 50],
    },
  },
};

export const AudioLargo: Story = {
  args: {
    name: "Andrea",
    time: "hace 12 min",
    audio: {
      duration: "1:42",
      waveform: [40, 70, 55, 85, 30, 65, 50, 80, 45, 60, 35, 75, 90, 50, 65, 40, 70, 55, 80, 45, 60, 70],
    },
  },
};
