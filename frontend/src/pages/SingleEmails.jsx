import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Clock, CheckCircle, XCircle, Plus, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useEmailStore from '../store/emailStore';
import useAuthStore from '../store/authStore';

function SingleEmails() {
  const { fetchSingleEmails, singleEmails, loading, error, deleteSingleEmail } = useEmailStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadEmails = async () => {
      await fetchSingleEmails();
    };
    loadEmails();
  }, [isAuthenticated, navigate]);

  const handleDelete = async (id, e) => {
    e.preventDefault(); // Prevent navigation to email details
    if (window.confirm('Are you sure you want to delete this email?')) {
      const result = await deleteSingleEmail(id);
      if (result.success) {
        toast.success('Email deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Single Emails</h1>
          <Button asChild>
            <Link to="/emails/compose">
              <Plus className="mr-2 h-4 w-4" />
              Compose Email
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Emails</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchSingleEmails}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Single Emails</h1>
        <Button asChild>
          <Link to="/emails/compose">
            <Plus className="mr-2 h-4 w-4" />
            Compose Email
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Emails</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : singleEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No emails sent yet</h3>
              <p className="text-muted-foreground mb-4">Start by composing your first email</p>
              <Button asChild>
                <Link to="/emails/compose">Compose Email</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {singleEmails.map((email) => (
                <Link
                  key={email._id}
                  to={`/emails/${email._id}`}
                  className="block py-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {email.recipient.email}
                        {email.recipient.firstName && ` (${email.recipient.firstName} ${email.recipient.lastName})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {email.status === 'sent' ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Failed
                        </span>
                      )}
                      <span className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(email.sentAt), 'PPp')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={(e) => handleDelete(email._id, e)}
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
    </div>
  );
}

export default SingleEmails;