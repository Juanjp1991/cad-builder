import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from '@/components/Chat';
import { sendMessage, pollTask, TaskState, type Task } from '@/lib/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API
vi.mock('@/lib/api', () => ({
    sendMessage: vi.fn(),
    pollTask: vi.fn(),
    getFileUrl: vi.fn((path) => path ? `http://localhost:8001${path}` : undefined),
    TaskState: {
        COMPLETED: 'TASK_STATE_COMPLETED',
        FAILED: 'TASK_STATE_FAILED',
    }
}));

// Mock ModelViewer since it uses Canvas/WebGL which might be tricky in jsdom
vi.mock('@/components/ModelViewer', () => ({
    default: ({ stlUrl }: { stlUrl: string | null }) => (
        <div data-testid="model-viewer">
            ModelViewer Mock: {stlUrl || 'No URL'}
        </div>
    ),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chat Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders greeting initially', () => {
        render(<Chat />);
        expect(screen.getByText(/Hello, this is the Forma AI agent!/i)).toBeInTheDocument();
    });

    it('updates input value', () => {
        render(<Chat />);
        const input = screen.getByPlaceholderText('Ask Forma AI');
        fireEvent.change(input, { target: { value: 'A red chair' } });
        expect(input).toHaveValue('A red chair');
    });

    it('submits form and displays user message', async () => {
        vi.mocked(sendMessage).mockResolvedValueOnce({ id: 'task-123' } as Partial<Task> as Task);
        vi.mocked(pollTask).mockResolvedValueOnce({
            id: 'task-123',
            status: { state: TaskState.COMPLETED },
            history: [{
                role: 'ROLE_AGENT',
                parts: [{ text: 'Success' }]
            }]
        } as Partial<Task> as Task);

        render(<Chat />);
        const input = screen.getByPlaceholderText('Ask Forma AI');

        // Type first to make button appear
        fireEvent.change(input, { target: { value: 'A red chair' } });

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('A red chair')).toBeInTheDocument();

        // Should show loading state
        expect(screen.getByText('Thinking...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
        });
    });

    it('displays assistant response and model viewer on success', async () => {
        vi.mocked(sendMessage).mockResolvedValueOnce({ id: 'task-123' } as Partial<Task> as Task);
        vi.mocked(pollTask).mockResolvedValueOnce({
            id: 'task-123',
            status: { state: TaskState.COMPLETED },
            history: [{
                role: 'ROLE_AGENT',
                parts: [
                    { text: 'Success' },
                    {
                        file: {
                            fileWithUri: '/download/model.stl',
                            mediaType: 'model/stl'
                        }
                    },
                    {
                        file: {
                            fileWithUri: '/download/model.step',
                            mediaType: 'model/step'
                        }
                    }
                ]
            }]
        } as Partial<Task> as Task);

        render(<Chat />);
        const input = screen.getByPlaceholderText('Ask Forma AI');
        fireEvent.change(input, { target: { value: 'test' } });

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Success/i)).toBeInTheDocument();
        });

        expect(screen.getByTestId('model-viewer')).toHaveTextContent('ModelViewer Mock: http://localhost:8001/download/model.stl');
        expect(screen.getByText('STEP').closest('a')).toHaveAttribute('href', 'http://localhost:8001/download/model.step');
        expect(screen.getByText('STL').closest('a')).toHaveAttribute('href', 'http://localhost:8001/download/model.stl');
    });

    it('displays error message on API failure', async () => {
        vi.mocked(sendMessage).mockRejectedValueOnce(new Error('API Error'));

        render(<Chat />);
        const input = screen.getByPlaceholderText('Ask Forma AI');
        fireEvent.change(input, { target: { value: 'test' } });

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Error: API Error')).toBeInTheDocument();
        });
    });
});
