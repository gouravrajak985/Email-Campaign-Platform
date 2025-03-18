import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Search, Upload, Trash2, Mail, Building, Tag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useContactStore from '../store/contactStore';

function Contacts() {
  const { contacts, loading, fetchContacts, deleteContact, importContacts } = useContactStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const result = await deleteContact(id);
      if (result.success) {
        toast.success('Contact deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      return toast.error('Please select a file to import');
    }

    setImporting(true);
    const result = await importContacts(importFile);
    setImporting(false);

    if (result.success) {
      toast.success(`Successfully imported ${result.imported} contacts`);
      if (result.errors?.length > 0) {
        toast.error(`${result.errors.length} errors occurred during import`);
        console.error('Import errors:', result.errors);
      }
      setImportDialogOpen(false);
      setImportFile(null);
    } else {
      toast.error(result.error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.email.toLowerCase().includes(searchLower) ||
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button asChild>
            <Link to="/contacts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">Add your first contact to get started</p>
              <Button asChild>
                <Link to="/contacts/new">Add Contact</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <Link
                  key={contact._id}
                  to={`/contacts/${contact._id}/edit`}
                  className="block py-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        {contact.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {contact.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </span>
                        {contact.company && (
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Added {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={(e) => handleDelete(contact._id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your contacts. The file should include columns for email, firstName, lastName, company, and tags.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0])}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Maximum file size: 5MB
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!importFile || importing}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Contacts;