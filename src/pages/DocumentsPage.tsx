import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2,
  File, 
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

const documentUploadSchema = z.object({
  name: z.string().min(1, 'Le nom du document est requis'),
  description: z.string().optional(),
  type: z.enum(['diploma', 'transcript', 'cv', 'recommendation_letter', 'portfolio', 'certificate', 'other']),
  tags: z.string().optional()
});

type DocumentUploadForm = z.infer<typeof documentUploadSchema>;

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { documents, loading, getDocuments, uploadDocument, deleteDocument } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<DocumentUploadForm>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'other',
      tags: ''
    }
  });

  useEffect(() => {
    if (user) {
      getDocuments();
    }
  }, [user, getDocuments]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne peut pas dépasser 10MB');
        return;
      }
      
      setSelectedFile(file);
      setValue('name', file.name.split('.')[0]);
      setShowUploadForm(true);
    }
  };

  const onSubmitUpload = async (data: DocumentUploadForm) => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setIsUploading(true);
      
      const documentData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };
      
      await uploadDocument(selectedFile, documentData);
      
      reset();
      setSelectedFile(null);
      setShowUploadForm(false);
      
      toast.success('Document uploadé avec succès !');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${documentName}" ?`)) {
      await deleteDocument(documentId);
    }
  };

  const handleDownload = (document: any) => {
    if (document.file_url) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.name;
      link.click();
    }
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'cv': '📄',
      'diploma': '🎓',
      'transcript': '📊',
      'recommendation_letter': '✉️',
      'portfolio': '🎨',
      'certificate': '🏆',
    };
    return icons[type] || '📁';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'uploading': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cv': 'CV / Curriculum Vitae',
      'diploma': 'Diplôme',
      'transcript': 'Relevé de notes',
      'recommendation_letter': 'Lettre de recommandation',
      'portfolio': 'Portfolio',
      'certificate': 'Certificat',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-blue-600" />
                Mes Documents
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos documents académiques et professionnels
              </p>
            </div>
            <div className="flex space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
            </div>
          </div>
        </div>

        {showUploadForm && selectedFile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload de document : {selectedFile.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  reset();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitUpload)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du document *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Nom du document"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="type">Type de document *</Label>
                  <Select onValueChange={(value) => setValue('type', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">CV / Curriculum Vitae</SelectItem>
                      <SelectItem value="diploma">Diplôme</SelectItem>
                      <SelectItem value="transcript">Relevé de notes</SelectItem>
                      <SelectItem value="recommendation_letter">Lettre de recommandation</SelectItem>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="certificate">Certificat</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Description du document..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (optionnel)</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="Tag1, Tag2, Tag3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Séparez les tags par des virgules
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFile(null);
                    reset();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Uploader
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mes documents ({documents.length})
            </h2>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Chargement des documents...</span>
            </div>
          )}
          
          {!loading && documents.length === 0 && (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun document
              </h3>
              <p className="text-gray-500 mb-4">
                Commencez par uploader votre premier document
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
            </div>
          )}
          
          {!loading && documents.length > 0 && (
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
                <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {document.name}
                          </h3>
                          {getStatusIcon(document.status)}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{getDocumentTypeLabel(document.type)}</span>
                          {document.file_size && (
                            <span>{formatFileSize(document.file_size)}</span>
                          )}
                          {document.upload_date && (
                            <span>
                              Uploadé le {new Date(document.upload_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {document.description}
                          </p>
                        )}
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {document.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {document.status === 'ready' && document.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id!, document.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentsPage;