declare module 'react-plotly.js' {
  import * as React from 'react';
  import * as Plotly from 'plotly.js';

  export interface Figure {
    data: Plotly.Data[];
    layout: Partial<Plotly.Layout>;
    frames?: Partial<Plotly.Frame>[];
  }

  export interface PlotParams {
    data: Plotly.Data[];
    layout: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Partial<Plotly.Frame>[];
    revision?: number;
    onInitialized?: (figure: Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Figure, graphDiv: HTMLElement) => void;
    onError?: (error: Error) => void;
    onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onUnhover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onDeselect?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    debug?: boolean;
    className?: string;
    divId?: string;
  }

  const Plot: React.FC<PlotParams>;

  export default Plot;
}
