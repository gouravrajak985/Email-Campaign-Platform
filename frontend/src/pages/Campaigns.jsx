import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar,CheckCircle, Users, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useCampaignStore from '../store/campaignStore';

function Campaigns() {
  const { campaigns, fetchCampaigns, deleteCampaign, loading } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const result = await deleteCampaign(id);
      if (result.success) {
        toast.success('Campaign deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'sending': return 'text-blue-600';
      case 'scheduled': return 'text-purple-600';
      default: return 'text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
        <Button asChild>
          <Link to="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating a new campaign</p>
            <Button asChild>
              <Link to="/campaigns/new">Create Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.subject}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-0.5 flex items-center rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                       <CheckCircle className="h-4 w-4 mr-1" />
                        {campaign.status}
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{campaign.recipients.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {format(new Date(campaign.createdAt), 'PPp')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(campaign._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Campaigns;