import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelViewer from '@/components/ModelViewer';
import { vi, describe, it, expect } from 'vitest';

// Mock @react-three/fiber and @react-three/drei
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
    useLoader: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
    OrbitControls: () => <div data-testid="orbit-controls" />,
    Stage: ({ children }: { children: React.ReactNode }) => <div data-testid="stage">{children}</div>,
    Center: ({ children }: { children: React.ReactNode }) => <div data-testid="center">{children}</div>,
    Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
}));

vi.mock('three-stdlib', () => ({
    STLLoader: class { },
}));

describe('ModelViewer Component', () => {
    it('renders "No model generated yet" when stlUrl is null', () => {
        render(<ModelViewer stlUrl={null} />);
        expect(screen.getByText('No model generated yet.')).toBeInTheDocument();
    });

    it('renders Canvas wrapper when stlUrl is provided', () => {
        render(<ModelViewer stlUrl="http://example.com/model.stl" />);
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
        expect(screen.getByText('Interactive 3D View')).toBeInTheDocument();
    });
});
