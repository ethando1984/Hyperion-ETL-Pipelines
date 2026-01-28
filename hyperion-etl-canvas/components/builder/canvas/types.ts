
import React from 'react';
import { NodeType } from '../../../pages/Builder';

export interface NodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  status?: 'ok' | 'error' | 'warning';
  config?: React.ReactNode;
  isAiGenerated?: boolean;
  aiLabel?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
}

export interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: NodeType;
  reason: string;
  nodeData: NodeData;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'warning';
  message: string;
  actionLabel: string;
  onAction: () => void;
}
