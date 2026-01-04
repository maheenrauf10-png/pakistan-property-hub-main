import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Eye, Building2, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user's properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch received inquiries
  const { data: receivedInquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['received-inquiries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, properties(title)')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch sent inquiries
  const { data: sentInquiries } = useQuery({
    queryKey: ['sent-inquiries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, properties(title)')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Delete property mutation
  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Property deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete property');
    },
  });

  // Update inquiry status
  const updateInquiryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-inquiries'] });
      toast.success('Inquiry status updated');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary text-secondary-foreground">Active</Badge>;
      case 'sold':
        return <Badge className="bg-primary text-primary-foreground">Sold</Badge>;
      case 'rented':
        return <Badge className="bg-property-rent text-primary-foreground">Rented</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'contacted':
        return <Badge className="bg-secondary text-secondary-foreground gap-1"><CheckCircle className="h-3 w-3" />Contacted</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted py-8">
        <div className="container">
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your properties and inquiries</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties?.length || 0}</p>
                <p className="text-sm text-muted-foreground">My Properties</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{receivedInquiries?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Inquiries Received</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Send className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sentInquiries?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Inquiries Sent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="properties">
          <TabsList className="mb-6">
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="received">Inquiries Received</TabsTrigger>
            <TabsTrigger value="sent">Inquiries Sent</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Properties</CardTitle>
                <Button asChild>
                  <Link to="/properties/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : properties && properties.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{property.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {property.area}, {property.city}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>PKR {formatPrice(property.price)}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{property.views || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button asChild size="icon" variant="ghost">
                                <Link to={`/properties/${property.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button asChild size="icon" variant="ghost">
                                <Link to={`/properties/${property.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this property? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteProperty.mutate(property.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
                    <Button asChild>
                      <Link to="/properties/new">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        List Your First Property
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Received Inquiries Tab */}
          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Inquiries Received</CardTitle>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : receivedInquiries && receivedInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {receivedInquiries.map((inquiry) => (
                      <Card key={inquiry.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-semibold">{inquiry.sender_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Inquiry for: {inquiry.properties?.title}
                              </p>
                              <p className="text-sm">{inquiry.message}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{inquiry.sender_email}</span>
                                {inquiry.sender_phone && <span>{inquiry.sender_phone}</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(inquiry.created_at), 'PPp')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getInquiryStatusBadge(inquiry.status)}
                              {inquiry.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateInquiryStatus.mutate({ id: inquiry.id, status: 'contacted' })}
                                >
                                  Mark Contacted
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No inquiries received yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Inquiries Tab */}
          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Inquiries Sent</CardTitle>
              </CardHeader>
              <CardContent>
                {sentInquiries && sentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {sentInquiries.map((inquiry) => (
                      <Card key={inquiry.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-semibold">
                                <Link to={`/properties/${inquiry.property_id}`} className="hover:underline">
                                  {inquiry.properties?.title}
                                </Link>
                              </p>
                              <p className="text-sm">{inquiry.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(inquiry.created_at), 'PPp')}
                              </p>
                            </div>
                            {getInquiryStatusBadge(inquiry.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You haven't sent any inquiries yet.</p>
                    <Button asChild className="mt-4">
                      <Link to="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
