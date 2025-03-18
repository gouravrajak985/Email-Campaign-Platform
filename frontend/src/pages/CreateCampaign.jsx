import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, Mail, User, ArrowLeft, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useCampaignStore from '../store/campaignStore';
import useContactStore from '../store/contactStore';

const schema = yup.object().shape({
  name: yup.string().required('Campaign name is required'),
  subject: yup.string().required('Email subject is required'),
});

function CreateCampaign() {
  const navigate = useNavigate();
  const { createCampaign } = useCampaignStore();
  const { contacts, fetchContacts } = useContactStore();
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter(contact => {
    const search = searchTerm.toLowerCase();
    return (
      contact.email.toLowerCase().includes(search) ||
      contact.firstName.toLowerCase().includes(search) ||
      contact.lastName.toLowerCase().includes(search) ||
      contact.company?.toLowerCase().includes(search)
    );
  });

  const toggleContact = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c._id === contact._id);
      if (isSelected) {
        return prev.filter(c => c._id !== contact._id);
      }
      return [...prev, contact];
    });
  };

  const removeContact = (contactId) => {
    setSelectedContacts(prev => prev.filter(c => c._id !== contactId));
  };

  const onSubmit = async (data) => {
    try {
      if (!emailBody.trim()) {
        toast.error('Email body is required');
        return;
      }

      if (selectedContacts.length === 0) {
        toast.error('At least one recipient is required');
        return;
      }

      setLoading(true);

      const recipients = selectedContacts.map(contact => ({
        email: contact.email,
        firstName: contact.firstName || '',
        lastName: contact.lastName || ''
      }));

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subject', data.subject);
      formData.append('body', emailBody);
      formData.append('recipients', JSON.stringify(recipients));

      const result = await createCampaign(formData);
      
      if (result.success) {
        toast.success('Campaign created successfully');
        navigate('/campaigns');
      } else {
        toast.error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error('Failed to create campaign');
      console.error('Campaign creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/campaigns')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <ReactQuill
                value={emailBody}
                onChange={setEmailBody}
                className="h-64"
              />
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Search contacts...
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search contacts..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {filteredContacts.map((contact) => (
                          <CommandItem
                            key={contact._id}
                            onSelect={() => {
                              toggleContact(contact);
                              setSearchTerm('');
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.email}
                                </p>
                              </div>
                              {selectedContacts.find(c => c._id === contact._id) ? (
                                <Check className="h-4 w-4" />
                              ) : null}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>

              <div className="mt-2">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between p-2 rounded-md bg-secondary mt-2"
                  >
                    <div>
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contact.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContact(contact._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-6 bg-muted/50 cursor-not-allowed">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Attachment feature coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/campaigns')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCampaign;