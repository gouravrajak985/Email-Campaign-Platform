import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Mail, User, Upload, ArrowLeft, Search, Building } from 'lucide-react';
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
import useEmailStore from '../store/emailStore';
import useContactStore from '../store/contactStore';

const schema = yup.object().shape({
  subject: yup.string().required('Subject is required'),
});

function ComposeEmail() {
  const navigate = useNavigate();
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const { sendSingleEmail } = useEmailStore();
  const { contacts, fetchContacts } = useContactStore();
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
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

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setOpen(false);
  };

  const onSubmit = async (data) => {
    if (!selectedContact) {
      return toast.error('Please select a recipient');
    }

    if (!emailBody.trim()) {
      return toast.error('Email body is required');
    }

    setSending(true);
    const formData = new FormData();
    formData.append('email', selectedContact.email);
    formData.append('firstName', selectedContact.firstName || '');
    formData.append('lastName', selectedContact.lastName || '');
    formData.append('subject', data.subject);
    formData.append('body', emailBody);

    const result = await sendSingleEmail(formData);
    setSending(false);

    if (result.success) {
      toast.success('Email sent successfully');
      navigate('/emails');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/emails')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Emails
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Compose Email</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>New Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  {selectedContact ? (
                    <Button variant="outline" className="w-full justify-start">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {selectedContact.firstName} {selectedContact.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {selectedContact.email}
                        </span>
                      </div>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="mr-2 h-4 w-4" />
                      Search contacts...
                    </Button>
                  )}
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
                            onSelect={() => handleSelectContact(contact)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {contact.email}
                              </span>
                              {contact.company && (
                                <span className="text-sm text-muted-foreground flex items-center mt-1">
                                  <Building className="h-3 w-3 mr-1" />
                                  {contact.company}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <ReactQuill
                value={emailBody}
                onChange={setEmailBody}
                className="h-64"
              />
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/emails')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default ComposeEmail;