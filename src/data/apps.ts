import { Chrome, Edge, Code, Puzzle, Disc, Bot } from 'lucide-react';
import { FC } from 'react';

export type App = {
  id: string;
  name: string;
  description: string;
  category: 'Browser' | 'Development' | 'Gaming' | 'Communication';
  icon: FC<{ size?: number | string }>;
};

export const managedApps: App[] = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'The most popular web browser in the world.',
    category: 'Browser',
    icon: Chrome,
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    description: 'The default web browser for Windows, based on Chromium.',
    category: 'Browser',
    icon: Edge,
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'A lightweight but powerful source code editor.',
    category: 'Development',
    icon: Code,
  },
  {
    id: 'steam',
    name: 'Steam',
    description: 'The largest digital distribution platform for PC gaming.',
    category: 'Gaming',
    icon: Puzzle,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'A VoIP and instant messaging social platform.',
    category: 'Communication',
    icon: Bot,
  },
  {
    id: 'epic-games',
    name: 'Epic Games Launcher',
    description: 'A digital video game storefront for Microsoft Windows and macOS.',
    category: 'Gaming',
    icon: Disc,
  },
];
