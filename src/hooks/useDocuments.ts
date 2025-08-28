import { useState, useCallback } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface DocumentData {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  type: 'diploma' | 'transcript' | 'cv' | 'recommendation_letter' | 'portfolio' | 'certificate' | 'other';
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  tags?: string[];
  upload_date?: string;
  created_at?: string;
  updated_at?: string;
}

type DocumentUploadData = {
  name?: string;
  description?: string;
  type?: 'diploma' | 'transcript' | 'cv' | 'recommendation_letter' | 'portfolio' | 'certificate' | 'other';
  tags: string[];
};

export function useDocuments() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const getDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data || []);
      return data;
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || 'Erreur lors de la récupération des documents');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, documentData: DocumentUploadData) => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const { data, error } = await supabase.functions.invoke('document-upload-handler', {
        body: {
          fileData: base64Data,
          fileName: `${Date.now()}-${file.name}`,
          documentInfo: {
            ...documentData,
            file_size: file.size,
            mime_type: file.type
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Document uploadé avec succès !');
      
      await getDocuments();
      
      return data;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Erreur lors de l\'upload du document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getDocuments]);

  const updateDocument = useCallback(async (documentId: string, updates: Partial<DocumentData>) => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const { data, error } = await supabase
        .from('user_documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
        
      if (error) throw error;
      
      setDocuments(prev => prev.map(doc => doc.id === documentId ? { ...doc, ...updates } : doc));
      
      toast.success('Document mis à jour avec succès !');
      return data;
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast.success('Document supprimé avec succès !');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Erreur lors de la suppression du document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documents,
    loading,
    getDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument
  };
}