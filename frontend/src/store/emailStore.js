import { create } from 'zustand';
import axios from '../lib/axios';

const useEmailStore = create((set) => ({
  singleEmails: [],
  loading: false,
  error: null,

  sendSingleEmail: async (formData) => {
    set({ loading: true });
    try {
      const emailData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        subject: formData.get('subject'),
        body: formData.get('body')
      };

      const response = await axios.post('/campaigns/send-single', emailData);
      
      // Add the new email to the list
      const newEmail = response.data.data.email;
      set(state => ({
        singleEmails: [newEmail, ...state.singleEmails],
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send email',
        loading: false 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email' 
      };
    }
  },

  deleteSingleEmail: async (id) => {
    try {
      await axios.delete(`/campaigns/single-emails/${id}`);
      set(state => ({
        singleEmails: state.singleEmails.filter(email => email._id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete email' 
      };
    }
  },

  fetchSingleEmails: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/campaigns/single-emails');
      set({ 
        singleEmails: response.data.data.emails || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching single emails:', error);
      if (error.response?.status === 401) {
        set({ 
          error: 'Please log in to view your emails',
          loading: false,
          singleEmails: []
        });
        window.location.href = '/login';
        return;
      }
      set({ 
        error: error.response?.data?.message || 'Failed to fetch emails',
        loading: false,
        singleEmails: []
      });
    }
  }
}));

export default useEmailStore;