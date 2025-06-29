export const supabase = {
  from: () => ({
    insert: jest.fn(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn(),
  }),
  auth: {
    onAuthStateChange: jest.fn(() => ({ 
      data: { 
        subscription: { 
          unsubscribe: jest.fn() 
        } 
      } 
    })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithOAuth: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  },
}; 