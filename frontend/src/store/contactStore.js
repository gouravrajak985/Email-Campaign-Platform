import { create } from 'zustand';
import axios from '../lib/axios';

const useContactStore = create((set) => ({
  contacts: [],
  currentContact: null,
  loading: false,
  error: null,

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/contacts');
      set({ 
        contacts: response.data.data.contacts,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch contacts',
        loading: false 
      });
    }
  },

  createContact: async (contactData) => {
    try {
      const response = await axios.post('/contacts', contactData);
      set(state => ({
        contacts: [...state.contacts, response.data.data.contact]
      }));
      return { success: true, contact: response.data.data.contact };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create contact'
      };
    }
  },

  updateContact: async (id, updates) => {
    try {
      const response = await axios.patch(`/contacts/${id}`, updates);
      set(state => ({
        contacts: state.contacts.map(c => 
          c._id === id ? response.data.data.contact : c
        ),
        currentContact: response.data.data.contact
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update contact'
      };
    }
  },

  deleteContact: async (id) => {
    try {
      await axios.delete(`/contacts/${id}`);
      set(state => ({
        contacts: state.contacts.filter(c => c._id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete contact'
      };
    }
  },

  importContacts: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh contacts list after import
      const contactsResponse = await axios.get('/contacts');
      set({ contacts: contactsResponse.data.data.contacts });

      return { 
        success: true,
        imported: response.data.data.imported,
        errors: response.data.data.errors
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to import contacts'
      };
    }
  }
}));

export default useContactStore;