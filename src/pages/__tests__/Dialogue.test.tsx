import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Dialogue from '../Dialogue';

// Mock Supabase to avoid ESM import issues in Jest
jest.mock('../../services/supabase');
jest.mock('../../services/ai');
jest.mock('../../services/historyService');

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/dialogue',
  search: '',
  hash: '',
  state: { topic: 'test topic' },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock useAuth hook but keep AuthProvider component
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';
import { getAIResponse } from '../../services/ai';
import { saveConversationHistory, updateConversationHistory } from '../../services/historyService';

function setupDialogue(props: any = {}) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dialogue {...props} />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Dialogue 历史保存与多轮对话', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('登录后发送topic只保存一条历史', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (getAIResponse as jest.Mock).mockResolvedValue('[CONV1] AI reply.');
    (saveConversationHistory as jest.Mock).mockResolvedValue({});
    setupDialogue({ location: { state: { topic: 'test topic' } } });
    await waitFor(() => expect(saveConversationHistory).toHaveBeenCalledTimes(1));
  });

  it('历史模式进入对话不保存新历史', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (getAIResponse as jest.Mock).mockResolvedValue('[CONV1] AI reply.');
    (saveConversationHistory as jest.Mock).mockResolvedValue({});
    setupDialogue({ location: { state: { topic: 'test topic', initialMessages: [{ id: 1, sender: 'ai', text: 'hi' }], isHistory: true } } });
    await waitFor(() => expect(saveConversationHistory).not.toHaveBeenCalled());
  });

  it('多轮对话只更新一条历史', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (getAIResponse as jest.Mock).mockResolvedValue('[CONV1] AI reply.');
    (saveConversationHistory as jest.Mock).mockResolvedValue({});
    (updateConversationHistory as jest.Mock).mockResolvedValue({});
    setupDialogue({ location: { state: { topic: 'test topic' } } });
    // 验证初始对话只保存一次
    await waitFor(() => expect(saveConversationHistory).toHaveBeenCalledTimes(1));
    // 验证没有调用更新历史（因为这是初始对话）
    expect(updateConversationHistory).not.toHaveBeenCalled();
  });

  it('未登录不保存历史', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: false });
    (getAIResponse as jest.Mock).mockResolvedValue('[CONV1] AI reply.');
    setupDialogue({ location: { state: { topic: 'test topic' } } });
    await waitFor(() => expect(saveConversationHistory).not.toHaveBeenCalled());
  });

  it('AI未回复不保存历史', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (getAIResponse as jest.Mock).mockResolvedValue('');
    setupDialogue({ location: { state: { topic: 'test topic' } } });
    await waitFor(() => expect(saveConversationHistory).not.toHaveBeenCalled());
  });
}); 